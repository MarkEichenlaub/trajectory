# Registers (or re-registers) the "TrajectoryFmaWorkSplitter" Windows
# Scheduled Task.
#
# The task runs ONE pass (scripts\run-fma-work-splitter.vbs -> node
# scripts\fma-work-splitter.mjs) every 10 minutes while Mark is logged in. It
# reads each page of a finished exam's uploaded scratch work through `claude -p`
# and records which part of which page holds which question's work.
#
# Ten minutes rather than the narrative agent's twenty: this is what makes the
# results page useful, so a student who uploads and then looks should find their
# work already sorted.
#
# Run this once per machine to set it up:
#   pwsh -ExecutionPolicy Bypass -File scripts\setup-fma-work-splitter-task.ps1
# It is idempotent -- safe to re-run; it removes any prior copy first.

$ErrorActionPreference = 'Stop'

# Built from the profile path, not hardcoded: the Windows username differs
# between Mark's two laptops.
$repo     = Join-Path $env:USERPROFILE 'github\trajectory'
$vbs      = Join-Path $repo 'scripts\run-fma-work-splitter.vbs'
$taskName = 'TrajectoryFmaWorkSplitter'

if (-not (Test-Path $vbs)) { throw "Launcher not found: $vbs" }

$action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument "`"$vbs`""

$triggerEvery = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(1)) `
    -RepetitionInterval (New-TimeSpan -Minutes 10)
$triggerLogon = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"

# One claude -p call per page of paper, so a four-page scan is a few minutes.
$settings = New-ScheduledTaskSettingsSet `
    -MultipleInstances IgnoreNew `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 45)

Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# No explicit -Principal: defaults to the registering (current) user, running
# only when logged on, non-elevated -- so the claude CLI uses Mark's logged-in
# subscription rather than API credits.
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $triggerEvery,$triggerLogon `
    -Settings $settings `
    -Description 'Splits an uploaded F=ma scratch-work scan up by question, every 10 min.' | Out-Null

Write-Host "Registered scheduled task '$taskName' (every 10 minutes, and at logon)."
