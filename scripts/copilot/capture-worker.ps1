# ============================================================================
# capture-worker.ps1 — persistent screen-grab worker for the session copilot.
#
# Started once by copilot.mjs and kept alive: spawning a fresh pwsh per frame
# costs ~2 s (startup + Add-Type compile), which is most of a core when you
# capture every few seconds. As a worker it costs ~150 ms per frame.
#
# Protocol: read one line from stdin = the .png path to write. Write one line
# of JSON to stdout describing the frame. Repeat until stdin closes.
#
# The frame is the window whose title matches -TitleMatch (the Miro board, by
# default), NOT the whole screen — so the copilot's own window never ends up
# in the picture it is reading. Falls back to the primary screen if no such
# window exists.
#
# Each frame also carries a 256-bit average hash. copilot.mjs compares hashes
# to decide whether anything actually changed, so an idle board costs nothing.
# ============================================================================
param(
  [string]$TitleMatch = 'Miro',
  # Only ever grab a browser window. Without this, any window with "Miro" in its
  # title wins -- including a terminal that happens to be running this project.
  [string]$ProcessMatch = 'brave,chrome,msedge,firefox',
  [int]$MaxWidth = 1600
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

Add-Type @"
using System;
using System.Runtime.InteropServices;
public class CopilotCap {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
}
"@

# Without this the window rect comes back in logical pixels while CopyFromScreen
# works in physical ones, so a scaled display captures the wrong region.
[void][CopilotCap]::SetProcessDPIAware()

$ProcNames = @($ProcessMatch -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ })

function Get-TargetBounds {
  param([string]$Match)
  if ($Match) {
    $p = Get-Process |
      Where-Object {
        $_.MainWindowHandle -ne 0 -and
        $_.MainWindowTitle -like "*$Match*" -and
        ($ProcNames.Count -eq 0 -or $ProcNames -contains $_.ProcessName)
      } |
      Select-Object -First 1
    if ($p -and -not [CopilotCap]::IsIconic($p.MainWindowHandle)) {
      $r = New-Object CopilotCap+RECT
      if ([CopilotCap]::GetWindowRect($p.MainWindowHandle, [ref]$r)) {
        $w = $r.Right - $r.Left
        $h = $r.Bottom - $r.Top
        if ($w -gt 300 -and $h -gt 300) {
          return @{
            rect  = (New-Object System.Drawing.Rectangle $r.Left, $r.Top, $w, $h)
            title = $p.MainWindowTitle
            found = $true
          }
        }
      }
    }
  }
  return @{
    rect  = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
    title = '(primary screen)'
    found = $false
  }
}

function Get-AverageHash {
  param([System.Drawing.Bitmap]$Source)
  $hb = New-Object System.Drawing.Bitmap 16, 16
  $g = [System.Drawing.Graphics]::FromImage($hb)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($Source, 0, 0, 16, 16)
  $g.Dispose()

  $vals = New-Object 'double[]' 256
  for ($y = 0; $y -lt 16; $y++) {
    for ($x = 0; $x -lt 16; $x++) {
      $c = $hb.GetPixel($x, $y)
      $vals[$y * 16 + $x] = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
    }
  }
  $hb.Dispose()

  $mean = ($vals | Measure-Object -Average).Average
  $sb = New-Object System.Text.StringBuilder
  for ($i = 0; $i -lt 256; $i += 4) {
    $n = 0
    for ($j = 0; $j -lt 4; $j++) {
      if ($vals[$i + $j] -gt $mean) { $n = $n -bor (1 -shl (3 - $j)) }
    }
    [void]$sb.Append($n.ToString('x'))
  }
  return $sb.ToString()
}

# Ready signal, so the parent knows Add-Type finished compiling.
[Console]::Out.WriteLine('{"ready":true}')
[Console]::Out.Flush()

while ($true) {
  $outPath = [Console]::In.ReadLine()
  if ($null -eq $outPath) { break }
  $outPath = $outPath.Trim()
  if (-not $outPath) { continue }

  try {
    $target = Get-TargetBounds -Match $TitleMatch
    $b = $target.rect

    $full = New-Object System.Drawing.Bitmap $b.Width, $b.Height
    $g = [System.Drawing.Graphics]::FromImage($full)
    $g.CopyFromScreen($b.X, $b.Y, 0, 0, $full.Size)
    $g.Dispose()

    $hash = Get-AverageHash -Source $full

    $scale = 1.0
    if ($full.Width -gt $MaxWidth) { $scale = $MaxWidth / $full.Width }
    $tw = [int]($full.Width * $scale)
    $th = [int]($full.Height * $scale)

    $small = New-Object System.Drawing.Bitmap $tw, $th
    $g2 = [System.Drawing.Graphics]::FromImage($small)
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g2.DrawImage($full, 0, 0, $tw, $th)
    $g2.Dispose()
    $small.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $bytes = (Get-Item $outPath).Length
    $small.Dispose()
    $full.Dispose()

    $res = @{
      ok            = $true
      hash          = $hash
      width         = $tw
      height        = $th
      title         = $target.title
      windowFound   = $target.found
      bytes         = $bytes
    }
    [Console]::Out.WriteLine(($res | ConvertTo-Json -Compress))
  } catch {
    $res = @{ ok = $false; error = $_.Exception.Message }
    [Console]::Out.WriteLine(($res | ConvertTo-Json -Compress))
  }
  [Console]::Out.Flush()
}
