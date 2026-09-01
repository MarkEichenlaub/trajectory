# Registers (or re-registers) the "TrajectoryHWEmailAgent" Windows Scheduled Task.
#
# The task runs ONE pass (scripts\run-hw-email-agent.vbs -> node
# scripts\hw-email-agent.mjs --once) every 20 minutes while Mark is logged in.
# Each pass is a fresh process, so a crash/hang/timeout in one pass can never
# stop the next — same self-healing pattern as scripts\setup-ai-task.ps1.
# Kept as its own task (not folded into TrajectoryAISummarizer) so a problem
# in one automation can never block the other.
#
# Run this once (per machine) to set it up:
#   pwsh -ExecutionPolicy Bypass -File scripts\setup-hw-email-task.ps1
# It is idempotent — safe to re-run; it removes any prior copy first.
#
# Prerequisite: .env must already have GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
# and GMAIL_REFRESH_TOKEN set (see scripts\get-gmail-refresh-token.mjs).

$ErrorActionPreference = 'Stop'

$repo     = 'C:\Users\Mark Eichenlaub\github\trajectory'
$vbs      = Join-Path $repo 'scripts\run-hw-email-agent.vbs'
$taskName = 'TrajectoryHWEmailAgent'

if (-not (Test-Path $vbs)) { throw "Launcher not found: $vbs" }

$action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument "`"$vbs`""

$triggerEvery = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(1)) `
    -RepetitionInterval (New-TimeSpan -Minutes 20)
$triggerLogon = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"

# ExecutionTimeLimit is longer than the AI summarizer's: a pass here can touch
# several candidate emails (Gmail + Supabase + one claude -p call each), not
# one narrow schema call.
$settings = New-ScheduledTaskSettingsSet `
    -MultipleInstances IgnoreNew `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# No explicit -Principal: defaults to the registering (current) user, running
# only when logged on, non-elevated — so the claude CLI uses Mark's logged-in
# subscription, same as the AI summarizer task.
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $triggerEvery,$triggerLogon `
    -Settings $settings `
    -Description 'Files homework emailed to Mark into the portal, every 20 min.' | Out-Null

Write-Output "Registered scheduled task '$taskName' (every 20 min, at logon)."
