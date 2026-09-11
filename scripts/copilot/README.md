# Session copilot

A private side panel that follows a live tutoring session and keeps a worked
solution to whatever is on the Miro board already sitting there, so a stall
costs a glance instead of a detour into another AI window.

Start it with `CapsLock+M`, or `npm run copilot` and open
<http://localhost:3748>. `CapsLock+Q` re-solves whatever is on screen right now.

Only Mark sees it. It is a local window on his screen, it never writes to the
board, and the student's Miro view is untouched.

## What it watches

**The board.** `capture-worker.ps1` grabs the browser window whose title matches
`*Miro*` every five seconds — the window, not the whole screen, so the copilot's
own panel is never in the picture it reads. If no such window exists it falls
back to the primary screen and says so in the status bar. Each frame carries a
256-bit average hash; an unchanged board never reaches a model.

**The room.** Wispr Flow appends to
`%APPDATA%\Wispr Flow\meetings\<id>\live.ndjson` while the call is running, one
JSON line per utterance, tagged `mic` (Mark) or `system` (the student). The
copilot tails that file, so it knows what was just said, not only what was
written.

## What it spends

Everything runs through the `claude` CLI on Mark's subscription. `ANTHROPIC_API_KEY`
and `CLAUDECODE` are stripped from the child environment, so a copilot started
from inside a Claude Code session still bills the subscription rather than API
credits.

Three kinds of call, deliberately unequal:

| Call | Model | When |
|---|---|---|
| spot | haiku | a changed frame, at most every 20 s — only asks "is there a new problem here?" |
| solve | opus | a new problem appears, or `CapsLock+Q` |
| watch | sonnet | only while the error-watcher is on, at most every 45 s |

The error-watcher is **off** by default and toggles from the panel. It is the
expensive half and the half that can cry wolf, so it is opt-in per session.
A solve costs one call per problem — a handful over an hour.

`Where's the error?` and `Next step only` resume the solve's own Claude session
by id, so they are fast and cheap: the full solution is already in that context
and no second image is sent.

## Tuning

Every constant is an environment variable. The ones that matter:

- `COPILOT_TITLE_MATCH` (`Miro`) — which window to watch.
- `COPILOT_CHANGE_BITS` (`4`) — how much the board must change to count. Raise it
  if an idle board keeps waking the spot check; lower it if small written steps
  go unnoticed.
- `COPILOT_SPOT_MIN_MS` (`20000`), `COPILOT_WATCH_MIN_MS` (`45000`) — the floors
  between paid calls.
- `COPILOT_MODEL_SOLVE` (`opus`), `COPILOT_MODEL_WATCH` (`sonnet`),
  `COPILOT_MODEL_SPOT` (`haiku`).

## Known limits

- The capture is what is visually on screen. If the panel overlaps the Miro
  window, the panel ends up in the frame — keep it beside the board or on a
  second monitor.
- The window has to be titled `*Miro*` and be the active tab of its window,
  since Windows reports only the foreground tab's title.
- A solve on a dense board takes 30 to 60 seconds. That is why it starts when
  the problem lands rather than when the session stalls.
