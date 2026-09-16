' Runs ONE fma-work-splitter pass, hidden (no console window), appending all
' output to logs\fma-work-splitter-task.log. The
' "TrajectoryFmaWorkSplitter" Windows Scheduled Task fires this every ~10
' minutes (register it with scripts\setup-fma-work-splitter-task.ps1).
'
' Same fresh-process-per-tick rationale as scripts\run-fma-narrative-agent.vbs:
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
WshShell.Run "cmd /c cd /d """ & repo & """ && node scripts\fma-work-splitter.mjs >> logs\fma-work-splitter-task.log 2>&1", 0, True
Set WshShell = Nothing
