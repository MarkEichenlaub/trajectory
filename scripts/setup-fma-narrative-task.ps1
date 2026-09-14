# Registers (or re-registers) the "TrajectoryFmaNarrativeAgent" Windows
# Scheduled Task.
#
# The task runs ONE pass (scripts\run-fma-narrative-agent.vbs -> node
# scripts\fma-narrative-agent.mjs) every 20 minutes while Mark is logged in.
# Each pass is a fresh process, so a crash/hang/timeout in one pass can never
# stop the next -- same self-healing pattern as
# scripts\setup-grade-submission-task.ps1.
#
# Kept as its own task (not folded into the grading agent) so a problem in one
# automation can never block the other.
#
# Run this once per machine to set it up:
#   pwsh -ExecutionPolicy Bypass -File scripts\setup-fma-narrative-task.ps1
# It is idempotent -- safe to re-run; it removes any prior copy first.

$ErrorActionPreference = 'Stop'

# Built from the profile path, not hardcoded: the Windows username differs
# between Mark's two laptops.
$repo     = Join-Path $env:USERPROFILE 'github\trajectory'
$vbs      = Join-Path $repo 'scripts\run-fma-narrative-agent.vbs'
$taskName = 'TrajectoryFmaNarrativeAgent'

if (-not (Test-Path $vbs)) { throw "Launcher not found: $vbs" }

$action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument "`"$vbs`""

$triggerEvery = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(1)) `
    -RepetitionInterval (New-TimeSpan -Minutes 20)
$triggerLogon = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"

# One narrative is a single claude -p call that reads a whole exam plus the
# student's history and transcripts, so it runs several minutes; a pass can
# cover up to five attempts.
$settings = New-ScheduledTaskSettingsSet `
    -MultipleInstances IgnoreNew `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 60)

Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# No explicit -Principal: defaults to the registering (current) user, running
# only when logged on, non-elevated -- so the claude CLI uses Mark's logged-in
# subscription rather than API credits.
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $triggerEvery,$triggerLogon `
    -Settings $settings `
    -Description 'Narrative read on each finished F=ma practice exam, every 20 min.' | Out-Null

Write-Output "Registered scheduled task '$taskName' (every 20 min, at logon)."
