' Runs ONE fma-narrative-agent pass, hidden (no console window), appending all
' output to logs\fma-narrative-agent-task.log. The
' "TrajectoryFmaNarrativeAgent" Windows Scheduled Task fires this every ~20
' minutes (register it with scripts\setup-fma-narrative-task.ps1).
'
' Same fresh-process-per-tick rationale as scripts\run-grade-submission-agent.vbs:
' a crash or hang in one pass can never stop the next.
'
' The repo path is built from %USERPROFILE% rather than hardcoded, because the
' Windows username differs between Mark's two laptops.
'
' The 3rd Run() argument is True so this script WAITS for the pass to finish,
' so the Scheduled Task's "do not start a new instance" policy actually
' prevents overlapping passes.
Set WshShell = CreateObject("WScript.Shell")
repo = WshShell.ExpandEnvironmentStrings("%USERPROFILE%") & "\github\trajectory"
WshShell.Run "cmd /c cd /d """ & repo & """ && node scripts\fma-narrative-agent.mjs >> logs\fma-narrative-agent-task.log 2>&1", 0, True
Set WshShell = Nothing
