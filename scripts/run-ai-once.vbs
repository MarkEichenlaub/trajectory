' Runs ONE Trajectory AI session-summarization pass, hidden (no console window),
' appending all output to logs\ai-server.log. The "TrajectoryAISummarizer" Windows
' Scheduled Task fires this every 15 minutes (register it with
' scripts\setup-ai-task.ps1).
'
' Why a per-pass task instead of a long-running daemon: the old daemon was started
' once at login and had no supervisor. When it died (a transient claude-CLI timeout
' on 2026-06-20), summarization silently stopped for days. Here every pass is a
' fresh, independent process, so a crash/hang/timeout in one pass can never stop
' the next — Task Scheduler just starts a clean one on the next tick.
'
' The 3rd Run() argument is True so this script WAITS for the pass to finish. That
' keeps the Scheduled Task marked "running" for the whole pass, so its
' "do not start a new instance" policy actually prevents overlapping passes.
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd /d ""C:\Users\Mark Eichenlaub\github\trajectory"" && node scripts\ai-server.mjs --once >> logs\ai-server.log 2>&1", 0, True
Set WshShell = Nothing
