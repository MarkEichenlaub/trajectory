# Registers (or re-registers) the "TrajectoryAISummarizer" Windows Scheduled Task.
#
# The task runs ONE summarization pass (scripts\run-ai-once.vbs -> node
# scripts\ai-server.mjs --once) every 15 minutes while Mark is logged in. Each pass
# is a fresh process, so a crash/hang/timeout in one pass can never stop the next —
# this is the self-healing replacement for the old always-on daemon that, when it
# died once, silently stopped summarizing for days.
#
# Run this once (per machine) to set it up:
#   pwsh -ExecutionPolicy Bypass -File scripts\setup-ai-task.ps1
# It is idempotent — safe to re-run; it removes any prior copy first.

$ErrorActionPreference = 'Stop'

$repo     = 'C:\Users\Mark Eichenlaub\github\trajectory'
$vbs      = Join-Path $repo 'scripts\run-ai-once.vbs'
$taskName = 'TrajectoryAISummarizer'

if (-not (Test-Path $vbs)) { throw "Launcher not found: $vbs" }

# Action: run the hidden VBS launcher (which runs the --once pass and waits for it).
$action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument "`"$vbs`""

# Trigger: at THIS user's logon, then repeat every 15 minutes for as long as Mark
# is logged in. The trigger must name the user (-User) — a bare -AtLogOn means "any
# user" and would require admin to register. Repetition is attached by borrowing
# the spec from a one-off trigger (the documented way to get an indefinite repeat).
$trigger = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
$trigger.Repetition = (New-ScheduledTaskTrigger -Once -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Minutes 15)).Repetition

# Settings: never run two passes at once; catch up if a tick was missed; run on
# battery; and hard-stop a pass that hangs past an hour so it can't block the next.
$settings = New-ScheduledTaskSettingsSet `
    -MultipleInstances IgnoreNew `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1)

Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# No explicit -Principal: it defaults to the registering (current) user, running
# only when logged on, non-elevated — exactly what we want, and registerable
# without admin rights. The claude CLI then uses Mark's logged-in subscription.
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger `
    -Settings $settings `
    -Description 'Runs one Trajectory session-summary pass every 15 min (self-healing replacement for the old ai-server daemon).' | Out-Null

Write-Output "Registered scheduled task '$taskName' (every 15 min, at logon)."

# Retire the old Startup-folder daemon launcher so the two mechanisms don't both
# run and double-process. (The repo copy scripts\start-ai-server.vbs is left alone.)
$startupVbs = Join-Path ([Environment]::GetFolderPath('Startup')) 'trajectory-ai-server.vbs'
if (Test-Path $startupVbs) {
    Remove-Item $startupVbs -Force
    Write-Output "Removed old Startup daemon launcher: $startupVbs"
}
