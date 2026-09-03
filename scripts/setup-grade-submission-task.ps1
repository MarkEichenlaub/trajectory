# Registers (or re-registers) the "TrajectoryGradeSubmissionAgent" Windows
# Scheduled Task.
#
# The task runs ONE pass (scripts\run-grade-submission-agent.vbs -> node
# scripts\grade-submission-agent.mjs --once) every 20 minutes while Mark is
# logged in. Each pass is a fresh process, so a crash/hang/timeout in one
# pass can never stop the next — same self-healing pattern as
# scripts\setup-hw-email-task.ps1 / scripts\setup-ai-task.ps1.
# Kept as its own task (not folded into the other two) so a problem in one
# automation can never block the others.
#
# Run this once (per machine) to set it up:
#   pwsh -ExecutionPolicy Bypass -File scripts\setup-grade-submission-task.ps1
# It is idempotent — safe to re-run; it removes any prior copy first.

$ErrorActionPreference = 'Stop'

$repo     = 'C:\Users\Mark Eichenlaub\github\trajectory'
$vbs      = Join-Path $repo 'scripts\run-grade-submission-agent.vbs'
$taskName = 'TrajectoryGradeSubmissionAgent'

if (-not (Test-Path $vbs)) { throw "Launcher not found: $vbs" }

$action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument "`"$vbs`""

$triggerEvery = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(1)) `
    -RepetitionInterval (New-TimeSpan -Minutes 20)
$triggerLogon = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"

# ExecutionTimeLimit is generous: a pass can grade several submissions, each
# a claude -p call over multiple images/a PDF, which is slower than a single
# narrow schema call.
$settings = New-ScheduledTaskSettingsSet `
    -MultipleInstances IgnoreNew `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 45)

Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# No explicit -Principal: defaults to the registering (current) user, running
# only when logged on, non-elevated — so the claude CLI uses Mark's logged-in
# subscription, same as the other two tasks.
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $triggerEvery,$triggerLogon `
    -Settings $settings `
    -Description 'AI first-pass review of submitted (non-F=ma) homework, every 20 min.' | Out-Null

Write-Output "Registered scheduled task '$taskName' (every 20 min, at logon)."
