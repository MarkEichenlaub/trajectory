# Miro Physics Calculator

A shared scientific calculator for tutoring on Miro that works for **any
student for whom Miro works** — including students behind school content
filters that block Desmos/Embedly/Supabase iframes.

## How it stays filter-proof

The student never loads an iframe. The calculator they see is built entirely
from **native Miro board items** (a frame with text boxes). They type an
expression into the yellow input box (ending with `=`), and the answer
appears. Their browser only ever talks to miro.com.

The evaluation happens in **Mark's browser**: a Miro Web SDK app whose
headless iframe (`/miro-calc/index.html`) runs whenever Mark has the board
open. It polls the input boxes (~750 ms), evaluates with a mathjs-based
engine, and writes results back to the board. Only Mark's network needs to
reach `portal.eichenlaubphysics.com`.

## One-time setup (Mark)

1. Go to https://miro.com/app/settings/user-profile/apps → **Create new app**
   (in your developer team). Name it "Physics Calculator".
2. In the app's manifest editor paste the contents of
   `miro-calc/manifest.yaml` (sets `sdkUri` to
   `https://portal.eichenlaubphysics.com/miro-calc/index.html` and the
   `boards:read`/`boards:write` scopes).
3. Click **Install app and get OAuth token** and pick your working team.
4. Open any board → the app icon appears in the left toolbar → click it to
   open the panel.

For local development, create a second app ("Physics Calculator DEV") with
`sdkUri: http://localhost:5173/miro-calc/index.html` and run `npm run dev`.

## Using it in a session

- Panel → **+ Insert calculator on board** drops the widget where you're looking.
- Students (even visitors with no Miro account) type into the yellow box and
  end with `=`. Multi-line input is fine — the last line is evaluated.
- `EST ON/OFF` per calculator toggles **Estimate mode** (QAMA-style): the
  student must first type an estimate into the estimate box; the required
  accuracy adapts to the difficulty of the calculation (times tables must be
  exact; `23*47` allows ~±10%; `13!` only needs the order of magnitude).
  After 5 misses the answer is revealed (rounded). "skip" reveals immediately.
- The green/gray dot on the widget shows whether the engine (your board tab)
  is online.

## Expression language

- Units everywhere: `60 mph in m/s`, `5 N * 3 m` → `15 J`,
  `0.5 * 70 kg * (3 m/s)^2 in J` → `315 J`, `2 in in cm` → `5.08 cm`.
- Constants: `c`, `G`, `g0` (9.8), `h_` (Planck; `h` is the hour), `hbar`,
  `kB`, `NA`, `R`, `qe` (elementary charge; `e` is Euler), `eps0`, `mu0`,
  `k_e` (Coulomb), `sigma`, `me`/`mp`/`mn`, `Ry`, `Patm`, `vsound`…
- Data: `earth.mass`, `earth.radius`, `jupiter.a`, `moon.T`, `water.c`,
  `water.Lv`, `copper.resistivity`, `glass.n`, `Hg.rho` (liquid mercury;
  `mercury` is the planet), aliases like `m_earth`, `r_earth`.
  Search the catalog in the panel.
- Trig in **degrees** by default (`sin(30)` = 0.5); use explicit radians via
  `sin(1.2 rad)`. Inverse trig answers in degrees.
- `ans` is the previous answer; variables work: `v = 3 m/s`, then
  `0.5 * 2 kg * v^2`.

## Architecture map

- `src/miro-calc/engine/` — pure-JS calculation engine (mathjs): parsing,
  units, constants, data catalog, formatting, QAMA tolerance (`qama.js`,
  patent US 6820800B2 rules, tunable via `QAMA_PARAMS`), estimate sessions.
  Tested: `npx vitest run`.
- `src/miro-calc/board/` — Miro side: `widget.js` (board widget
  create/find/repair; no SDK item-locking exists so a repair tick snaps
  dragged pieces back), `host.js` (poll loop + estimate state machine),
  `lease.js` (one-evaluator election across Mark's tabs + BroadcastChannel
  bus), `normalize.js` (HTML ↔ text).
- `src/miro-calc/headless.js` + `miro-calc/index.html` — app entry (engine host).
- `src/miro-calc/panel/` + `miro-calc/panel.html` — Mark's panel UI (React).
- Shared state: the board items themselves + `miro.board.storage` collection
  `miro-calc` (widget registry, per-calculator history, engine lease).
  No Supabase, no Desmos, no external embeds.

## Known limits

- Answers appear only while Mark has the board open (fine for live
  tutoring; the status dot exposes it). The old Desmos pages
  (`/shared-calc.html`, `/shared-sci-calc.html`) remain for async use.
- Students get no clickable buttons (Miro shapes can't take clicks) — text
  input only, which matches the wolfram-alpha style anyway.
- If a student deletes widget pieces, the registry prunes/repairs what it
  can; worst case re-insert from the panel.
