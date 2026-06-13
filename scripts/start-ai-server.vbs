' Auto-starts the Trajectory AI session summarizer at Windows login, hidden (no
' console window). It runs scripts/ai-server.mjs, which every 15 minutes finds
' finished sessions that still need a summary and fills in the summary + tags
' using Mark's Claude subscription (the claude CLI) — no clicking, no API cost.
'
' SETUP (already done on Mark's machine): place a copy of this file in the
' Startup folder so Windows runs it at login. Open that folder with:
'   Win+R  →  shell:startup
' Output is appended to logs\ai-server.log so it can be inspected later.
' Health check while it's running:  http://localhost:3747
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd /d ""C:\Users\Mark Eichenlaub\github\trajectory"" && npm run ai-server >> logs\ai-server.log 2>&1", 0, False
Set WshShell = Nothing
