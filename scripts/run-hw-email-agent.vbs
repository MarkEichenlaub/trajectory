' Runs ONE homework-email-agent pass, hidden (no console window), appending all
' output to logs\hw-email-agent-task.log. The "TrajectoryHWEmailAgent" Windows
' Scheduled Task fires this every ~20 minutes (register it with
' scripts\setup-hw-email-task.ps1).
'
' Same fresh-process-per-tick rationale as scripts\run-ai-once.vbs: a crash or
' hang in one pass can never stop the next.
'
' The 3rd Run() argument is True so this script WAITS for the pass to finish,
' so the Scheduled Task's "do not start a new instance" policy actually
' prevents overlapping passes.
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd /d ""C:\Users\Mark Eichenlaub\github\trajectory"" && node scripts\hw-email-agent.mjs --once >> logs\hw-email-agent-task.log 2>&1", 0, True
Set WshShell = Nothing
