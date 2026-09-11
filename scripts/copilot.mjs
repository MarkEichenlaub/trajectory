#!/usr/bin/env node
// ============================================================================
// copilot.mjs — the live session copilot.
//
// Runs on Mark's laptop during a tutoring session and keeps a worked solution
// to whatever is on the Miro board sitting in a side window, so that when the
// session stalls the answer is already there instead of 60 seconds away.
//
// It watches two things, both already on this machine:
//
//   1. The Miro browser window, grabbed every few seconds by capture-worker.ps1.
//      That worker targets the browser window by title, so the copilot's own
//      window is never in the picture it reads. Frames carry an average hash,
//      so an unchanged board costs nothing.
//
//   2. Wispr Flow's live transcript, %APPDATA%\Wispr Flow\meetings\<id>\live.ndjson,
//      which Wispr appends to *while the call is running* — one JSON line per
//      utterance, tagged "mic" (Mark) or "system" (the student).
//
// Everything goes through the claude CLI on Mark's subscription. No API credits.
//
//   npm run copilot                  # start it, then open http://localhost:3748
//   node scripts/copilot.mjs --watch # start with the error-watcher already on
//
// Students never see any of this: it is a local window on Mark's screen, and it
// never writes to the board.
// ============================================================================

import http from 'http'
import { spawn, exec } from 'child_process'
import { promisify } from 'util'
import { readFile, writeFile, mkdir, open, stat, readdir } from 'fs/promises'
import { createReadStream, existsSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const TMP = resolve(ROOT, '.copilot-tmp')
const UI_FILE = resolve(__dirname, 'copilot', 'ui.html')
const CAPTURE_WORKER = resolve(__dirname, 'copilot', 'capture-worker.ps1')
const KATEX_DIST = resolve(ROOT, 'node_modules', 'katex', 'dist')
const WISPR_MEETINGS = join(process.env.APPDATA || '', 'Wispr Flow', 'meetings')

const num = (name, dflt) => Number(process.env[name] ?? dflt)

const PORT = num('COPILOT_PORT', 3748)
// How often to grab a frame. Cheap: capture plus hash is ~150 ms locally and
// never touches the network.
const SCAN_MS = num('COPILOT_SCAN_MS', 5000)
// Hamming distance (out of 256 bits) that counts as "the board changed". Writing
// a line moves roughly 4-20 bits; a blinking cursor moves 0-2.
const CHANGE_BITS = num('COPILOT_CHANGE_BITS', 4)
// Floors between model calls. The scan loop is free; these are not, and burning
// a weekly subscription limit mid-session would be worse than useless.
const SPOT_MIN_MS = num('COPILOT_SPOT_MIN_MS', 20000)   // "is this a new problem?"
const WATCH_MIN_MS = num('COPILOT_WATCH_MIN_MS', 45000) // "is a step wrong?"
// A frame has to settle first: firing mid-paste gets half a problem.
const SETTLE_MS = num('COPILOT_SETTLE_MS', 4000)
const TRANSCRIPT_WINDOW_MS = num('COPILOT_TRANSCRIPT_WINDOW_MS', 4 * 60 * 1000)

const MODEL_SPOT = process.env.COPILOT_MODEL_SPOT || 'haiku'
const MODEL_WATCH = process.env.COPILOT_MODEL_WATCH || 'sonnet'
const MODEL_SOLVE = process.env.COPILOT_MODEL_SOLVE || 'opus'

const TITLE_MATCH = process.env.COPILOT_TITLE_MATCH || 'Miro'

// ── state ────────────────────────────────────────────────────────────────────

const state = {
  status: 'starting',
  paused: false,
  watching: process.argv.includes('--watch'),
  current: null,        // the problem being solved now
  history: [],          // earlier problems this session, newest first
  alert: null,          // { kind, text, where, at }
  meeting: null,        // { id, file, offset, seen, utterances, live }
  frame: null,          // { at, title, windowFound, changedAt, distance }
  log: [],
  counts: { spot: 0, watch: 0, solve: 0, hint: 0 },
}

const clients = new Set()

function log(msg) {
  const line = `${new Date().toLocaleTimeString('en-GB', { hour12: false })}  ${msg}`
  console.log(line)
  state.log.unshift(line)
  if (state.log.length > 40) state.log.length = 40
}

function publicState() {
  return {
    status: state.status,
    paused: state.paused,
    watching: state.watching,
    current: state.current,
    history: state.history.map(p => ({ id: p.id, title: p.title, at: p.at })),
    alert: state.alert,
    transcript: recentUtterances(90 * 1000).slice(-14),
    meeting: state.meeting && {
      id: state.meeting.id,
      live: state.meeting.live,
      utteranceCount: state.meeting.utterances.length,
    },
    frame: state.frame,
    counts: state.counts,
    log: state.log.slice(0, 12),
  }
}

function broadcast() {
  const payload = JSON.stringify(publicState())
  for (const res of clients) res.write(`data: ${payload}\n\n`)
}

// ── the claude CLI (Mark's subscription, never the API) ──────────────────────

function claudeEnv() {
  const env = { ...process.env }
  // A parent Claude Code session injects these; the child would then bill API
  // credits and fail on a zero balance. Strip them so it uses the subscription.
  delete env.ANTHROPIC_API_KEY
  delete env.CLAUDECODE
  return env
}

// Single-quoted pwsh strings only need doubled quotes, but the whole prompt has
// to stay on one command line — a newline in a model-supplied problem title
// would otherwise split the command in half.
const psQuote = s => String(s).replace(/\s*[\r\n]+\s*/g, ' ').replace(/'/g, "''")

async function runClaude({ prompt, model, schema, resume, timeout = 180000 }) {
  const isWin = process.platform === 'win32'
  const flags = [
    '-p',
    `--model ${model}`,
    '--allowedTools Read',
    '--output-format json',
    schema ? `--json-schema '${psQuote(JSON.stringify(schema))}'` : '',
    resume ? `--resume ${resume}` : '',
    `'${psQuote(prompt)}'`,
  ].filter(Boolean).join(' ')

  // Empty stdin stops the CLI waiting ~3 s for piped input it will never get.
  // Pinning UTF-8 is belt-and-braces: this machine's console codepage already
  // round-trips an em dash correctly, but the codepage is a per-machine setting
  // and a walkthrough is full of non-ASCII math.
  const cmd = isWin
    ? `[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new(); '' | claude ${flags}`
    : `claude ${flags} < /dev/null`

  const { stdout } = await execAsync(cmd, {
    shell: isWin ? 'pwsh.exe' : undefined,
    cwd: ROOT,
    env: claudeEnv(),
    timeout,
    maxBuffer: 10 * 1024 * 1024,
  })

  let envelope
  try {
    envelope = JSON.parse(stdout.trim())
  } catch {
    throw new Error(`unparseable claude output: ${stdout.slice(0, 200)}`)
  }
  const result = envelope.structured_output ?? envelope
  return { result, sessionId: envelope.session_id || null, isError: !!envelope.is_error }
}

// ── Wispr live transcript ────────────────────────────────────────────────────

// A recording counts as the session in progress if Wispr touched it this recently.
const LIVE_WINDOW_MS = 4 * 60 * 1000

async function newestMeeting() {
  if (!existsSync(WISPR_MEETINGS)) return null
  const dirs = await readdir(WISPR_MEETINGS).catch(() => [])
  let best = null
  for (const id of dirs) {
    const file = join(WISPR_MEETINGS, id, 'live.ndjson')
    if (!existsSync(file)) continue
    const st = await stat(file).catch(() => null)
    if (!st) continue
    if (!best || st.mtimeMs > best.mtimeMs) best = { id, file, mtimeMs: st.mtimeMs, size: st.size }
  }
  return best
}

async function pollTranscript() {
  const found = await newestMeeting()
  if (!found) return

  if (!state.meeting || state.meeting.id !== found.id) {
    // Only switch to a different recording if it is actually live, or the copilot
    // would latch onto yesterday's file and replay it as "now".
    const isLive = Date.now() - found.mtimeMs < LIVE_WINDOW_MS
    if (state.meeting && !isLive) return
    state.meeting = {
      id: found.id, file: found.file,
      // Start at the end of a recording that is not live: replaying yesterday's
      // hour costs memory and buys nothing, since it all falls outside the
      // recency window anyway. A live one is read from wherever it already is.
      offset: isLive ? 0 : found.size,
      seen: new Set(), utterances: [], live: isLive,
    }
    log(`transcript: following ${found.id.slice(0, 8)} (${isLive ? 'live' : 'not live yet'})`)
  }

  const m = state.meeting
  m.live = Date.now() - found.mtimeMs < LIVE_WINDOW_MS
  if (found.size <= m.offset) return

  const fh = await open(m.file, 'r').catch(() => null)
  if (!fh) return
  try {
    const len = found.size - m.offset
    const buf = Buffer.alloc(len)
    await fh.read(buf, 0, len, m.offset)
    const text = buf.toString('utf8')
    // A partial trailing line is normal: Wispr is mid-write. Leave the offset
    // short of it so the rest arrives next tick.
    const lastNl = text.lastIndexOf('\n')
    if (lastNl < 0) return
    m.offset += Buffer.byteLength(text.slice(0, lastNl + 1), 'utf8')

    for (const line of text.slice(0, lastNl).split('\n')) {
      const trimmed = line.trim()
      if (!trimmed) continue
      let row
      try { row = JSON.parse(trimmed) } catch { continue }
      if (!row.id || !row.text) continue
      if (m.seen.has(row.id)) continue
      m.seen.add(row.id)
      m.utterances.push({
        t: row.startEpochMs || Date.now(),
        who: row.speaker?.source === 'mic' ? 'Mark' : 'Student',
        text: String(row.text).trim(),
      })
    }
  } finally {
    await fh.close()
  }
}

function recentUtterances(windowMs = TRANSCRIPT_WINDOW_MS) {
  if (!state.meeting) return []
  const cutoff = Date.now() - windowMs
  return state.meeting.utterances.filter(u => u.t >= cutoff)
}

async function writeTranscriptFile(windowMs = TRANSCRIPT_WINDOW_MS) {
  const rows = recentUtterances(windowMs)
  if (!rows.length) return null
  const path = resolve(TMP, 'transcript.txt')
  await writeFile(path, rows.map(u => `${u.who}: ${u.text}`).join('\n'), 'utf8')
  return path
}

// ── screen capture ───────────────────────────────────────────────────────────

let worker = null
let workerReady = null
let pendingCapture = null

function startWorker() {
  worker = spawn('pwsh.exe', [
    '-NoProfile', '-ExecutionPolicy', 'Bypass',
    '-File', CAPTURE_WORKER,
    '-TitleMatch', TITLE_MATCH,
  ], { cwd: ROOT })

  workerReady = new Promise(res => { worker.once('__ready', res) })

  let buf = ''
  worker.stdout.on('data', chunk => {
    buf += chunk.toString()
    let nl
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim()
      buf = buf.slice(nl + 1)
      if (!line) continue
      let row
      try { row = JSON.parse(line) } catch { continue }
      if (row.ready) { worker.emit('__ready'); continue }
      const p = pendingCapture
      pendingCapture = null
      if (p) p.resolve(row)
    }
  })
  worker.stderr.on('data', d => log(`capture stderr: ${d.toString().trim().slice(0, 200)}`))
  worker.on('exit', code => {
    log(`capture worker exited (${code}); restarting in 3 s`)
    const p = pendingCapture
    pendingCapture = null
    if (p) p.reject(new Error('worker exited'))
    setTimeout(startWorker, 3000)
  })
}

function capture(outPath) {
  if (!worker || worker.exitCode !== null) return Promise.reject(new Error('no capture worker'))
  if (pendingCapture) return Promise.reject(new Error('capture already in flight'))
  return new Promise((ok, fail) => {
    const timer = setTimeout(() => {
      if (pendingCapture) { pendingCapture = null; fail(new Error('capture timed out')) }
    }, 20000)
    pendingCapture = {
      resolve: v => { clearTimeout(timer); ok(v) },
      reject: e => { clearTimeout(timer); fail(e) },
    }
    worker.stdin.write(outPath + '\n')
  })
}

function hamming(a, b) {
  if (!a || !b || a.length !== b.length) return 999
  let d = 0
  for (let i = 0; i < a.length; i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16)
    while (x) { d += x & 1; x >>= 1 }
  }
  return d
}

// ── schemas ──────────────────────────────────────────────────────────────────

const SPOT_SCHEMA = {
  type: 'object',
  properties: {
    hasProblem: { type: 'boolean' },
    isNewProblem: { type: 'boolean' },
    problemHint: { type: 'string' },
  },
  required: ['hasProblem', 'isNewProblem', 'problemHint'],
}

const WATCH_SCHEMA = {
  type: 'object',
  properties: {
    hasProblem: { type: 'boolean' },
    isNewProblem: { type: 'boolean' },
    problemHint: { type: 'string' },
    mistake: { type: 'string' },
    stuck: { type: 'string' },
  },
  required: ['hasProblem', 'isNewProblem', 'problemHint', 'mistake', 'stuck'],
}

const SOLVE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    statement: { type: 'string' },
    answer: { type: 'string' },
    walkthrough: { type: 'string' },
    pitfalls: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
  },
  required: ['title', 'statement', 'answer', 'walkthrough', 'pitfalls', 'confidence'],
}

const HINT_SCHEMA = {
  type: 'object',
  properties: { where: { type: 'string' }, hint: { type: 'string' } },
  required: ['where', 'hint'],
}

function sourceLines(framePath, transcriptPath) {
  const parts = [`Look at the screenshot of the shared whiteboard at ${framePath}.`]
  if (transcriptPath) {
    parts.push(`Read the last few minutes of what was said out loud at ${transcriptPath}`
      + ' ("Mark" is the tutor, "Student" is the student).')
  }
  return parts
}

// ── jobs ─────────────────────────────────────────────────────────────────────

let solveInFlight = false
let spotInFlight = false
let lastSpotAt = 0
let lastWatchAt = 0

async function runSpot(framePath, { full }) {
  const transcriptPath = full ? await writeTranscriptFile() : null
  const currentTitle = state.current?.title || 'none yet'

  const prompt = [
    'You are silently watching a live one-on-one physics and math tutoring session over a shared whiteboard.',
    ...sourceLines(framePath, transcriptPath),
    `The problem currently being worked on is: "${currentTitle}".`,
    'Answer as JSON.',
    'hasProblem: is there a physics or math problem visible on screen that is worth solving?',
    'isNewProblem: is the problem on screen a different problem from the one named above?'
      + ' True if there is no current problem.',
    'problemHint: one short line naming the problem on screen, or an empty string.',
    full ? 'mistake: if a specific written step on the board is mathematically or physically wrong,'
      + ' say which step and why in one sentence. Otherwise return an empty string. Be strict:'
      + ' report a step only if you are confident it is wrong. Work in progress, a step you cannot'
      + ' fully read, and an unfinished derivation are NOT mistakes.' : '',
    full ? 'stuck: if the transcript shows they are stuck, confused, or going in circles, say in one'
      + ' sentence what on. Otherwise return an empty string.' : '',
  ].filter(Boolean).join(' ')

  const { result } = await runClaude({
    prompt,
    model: full ? MODEL_WATCH : MODEL_SPOT,
    schema: full ? WATCH_SCHEMA : SPOT_SCHEMA,
    timeout: 120000,
  })
  state.counts[full ? 'watch' : 'spot']++
  return result
}

async function runSolve(framePath, { reason }) {
  solveInFlight = true
  state.status = 'solving'
  broadcast()
  const started = Date.now()
  log(`solving (${reason})...`)

  try {
    const transcriptPath = await writeTranscriptFile()
    const prompt = [
      'You are the private assistant to Mark, a physics tutor, during a live one-on-one session.',
      'Only Mark sees your output; the student never does.',
      ...sourceLines(framePath, transcriptPath),
      'Find the physics or math problem on the whiteboard and solve it completely.',
      'Answer as JSON.',
      'title: a short name for the problem, at most 8 words.',
      'statement: the problem as posed, restated in one or two sentences.',
      'answer: the final result, as a formula and, where numbers are given, a number with units.'
        + ' One or two lines.',
      'walkthrough: the full solution in markdown, written so Mark can scan it mid-conversation.'
        + ' Number the steps. Put algebra in LaTeX between $ and $, or $$ and $$ for a display line.'
        + ' Keep each step to one or two sentences. Say explicitly where an expression factors,'
        + ' simplifies, or is a perfect square, since that is exactly the kind of thing that stalls'
        + ' a session.',
      'pitfalls: 2 to 5 short lines naming the specific places a student goes wrong on THIS problem'
        + ' (a sign, a limit of integration, a factor of 2, an algebraic form that is easy to miss).',
      'confidence: high, medium, or low, reflecting how sure you are that you read the board correctly.',
      'If the board is too unclear to read a problem from, set title to an empty string.',
    ].join(' ')

    const { result, sessionId } = await runClaude({
      prompt, model: MODEL_SOLVE, schema: SOLVE_SCHEMA, timeout: 300000,
    })
    state.counts.solve++

    if (!result.title) {
      log('solve: nothing readable on the board')
      return null
    }

    const problem = {
      id: `p${Date.now()}`,
      at: Date.now(),
      seconds: Math.round((Date.now() - started) / 1000),
      sessionId,
      ...result,
    }
    if (state.current) state.history.unshift(state.current)
    if (state.history.length > 12) state.history.length = 12
    state.current = problem
    state.alert = null
    log(`solved "${problem.title}" in ${problem.seconds}s (${problem.confidence} confidence)`)
    return problem
  } finally {
    solveInFlight = false
    state.status = state.current ? 'ready' : 'idle'
    broadcast()
  }
}

// Cheap, because the solve session already holds the full solution: this resumes
// it with text only, no second image.
async function runHint(kind) {
  if (!state.current?.sessionId) {
    log('hint: no solved problem to ask about yet')
    broadcast()
    return
  }
  state.status = 'thinking'
  broadcast()
  try {
    const rows = recentUtterances(3 * 60 * 1000)
    const said = rows.length
      ? rows.slice(-25).map(u => `${u.who}: ${u.text}`).join(' | ')
      : '(nothing recorded)'
    const ask = kind === 'error'
      ? 'Mark thinks a step in the work so far is wrong. Based on your solution and on what has been'
        + ' said, name the single most likely step to be wrong and what it should be instead.'
      : 'Mark and the student are stuck and he wants the smallest possible nudge. Give the next single'
        + ' step only, without revealing the rest of the solution.'

    const prompt = [
      'Continuing the same tutoring session, on the same problem you just solved.',
      `Here is roughly what has been said since: ${said.replace(/[\r\n]+/g, ' ').slice(0, 4000)}`,
      ask,
      'Answer as JSON. where: which step or expression, in a few words. hint: one or two sentences, no more.',
    ].join(' ')

    const { result } = await runClaude({
      prompt, model: MODEL_SOLVE, schema: HINT_SCHEMA,
      resume: state.current.sessionId, timeout: 150000,
    })
    state.counts.hint++
    state.alert = {
      kind: kind === 'error' ? 'mistake' : 'hint',
      where: result.where, text: result.hint, at: Date.now(),
    }
    log(`hint (${kind}): ${result.where}`)
  } catch (err) {
    log(`hint failed: ${err.message.slice(0, 150)}`)
  } finally {
    state.status = state.current ? 'ready' : 'idle'
    broadcast()
  }
}

// ── the scan loop ────────────────────────────────────────────────────────────

let lastHash = null
let lastChangeAt = 0
let dirtySinceLook = false
let forceSolve = false

async function tick() {
  await pollTranscript().catch(err => log(`transcript poll: ${err.message.slice(0, 120)}`))

  if (state.paused) { broadcast(); return }

  const framePath = resolve(TMP, 'frame.png')
  let shot
  try {
    shot = await capture(framePath)
  } catch (err) {
    log(`capture: ${err.message.slice(0, 120)}`)
    broadcast()
    return
  }
  if (!shot.ok) { log(`capture failed: ${shot.error}`); broadcast(); return }

  const dist = hamming(lastHash, shot.hash)
  const changed = lastHash === null || dist >= CHANGE_BITS
  if (changed) { lastChangeAt = Date.now(); dirtySinceLook = true }
  lastHash = shot.hash
  state.frame = {
    at: Date.now(), title: shot.title, windowFound: shot.windowFound,
    changedAt: lastChangeAt, distance: dist === 999 ? null : dist,
  }

  const now = Date.now()
  const settled = now - lastChangeAt >= SETTLE_MS

  if (forceSolve && !solveInFlight) {
    forceSolve = false
    dirtySinceLook = false
    await runSolve(framePath, { reason: 'you asked' })
    return
  }

  // Nothing new, or still mid-stroke: don't spend a model call.
  if (!dirtySinceLook || !settled || solveInFlight || spotInFlight) { broadcast(); return }

  const wantWatch = state.watching && state.current && now - lastWatchAt >= WATCH_MIN_MS
  const wantSpot = now - lastSpotAt >= SPOT_MIN_MS
  if (!wantWatch && !wantSpot) { broadcast(); return }

  spotInFlight = true
  state.status = 'looking'
  broadcast()
  try {
    const full = wantWatch
    if (full) lastWatchAt = now
    lastSpotAt = now
    const spot = await runSpot(framePath, { full })
    dirtySinceLook = false

    if (spot.hasProblem && (spot.isNewProblem || !state.current)) {
      spotInFlight = false
      await runSolve(framePath, { reason: spot.problemHint || 'new problem on the board' })
      return
    }
    if (full && (spot.mistake || spot.stuck)) {
      state.alert = {
        kind: spot.mistake ? 'mistake' : 'stuck',
        where: '', text: spot.mistake || spot.stuck, at: Date.now(),
      }
      log(`watch: ${spot.mistake ? 'mistake' : 'stuck'} — ${(spot.mistake || spot.stuck).slice(0, 120)}`)
    }
  } catch (err) {
    log(`look failed: ${err.message.slice(0, 150)}`)
  } finally {
    spotInFlight = false
    state.status = state.current ? 'ready' : 'idle'
    broadcast()
  }
}

// ── http ─────────────────────────────────────────────────────────────────────

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ttf': 'font/ttf', '.png': 'image/png',
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const path = url.pathname

  if (path === '/' || path === '/index.html') {
    const html = await readFile(UI_FILE, 'utf8')
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
    return res.end(html)
  }

  if (path === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    res.write(`data: ${JSON.stringify(publicState())}\n\n`)
    clients.add(res)
    req.on('close', () => clients.delete(res))
    return
  }

  if (path === '/frame.png') {
    const f = resolve(TMP, 'frame.png')
    if (!existsSync(f)) { res.writeHead(404); return res.end() }
    res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' })
    return createReadStream(f).pipe(res)
  }

  if (path.startsWith('/katex/')) {
    const rel = path.slice('/katex/'.length).replace(/\.\./g, '')
    const f = resolve(KATEX_DIST, rel)
    if (!f.startsWith(KATEX_DIST) || !existsSync(f)) { res.writeHead(404); return res.end() }
    const ext = rel.slice(rel.lastIndexOf('.'))
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'max-age=86400',
    })
    return createReadStream(f).pipe(res)
  }

  if (path.startsWith('/trigger/')) {
    const what = path.slice('/trigger/'.length)
    if (what === 'solve') { forceSolve = true; log('solve requested') }
    else if (what === 'error') { runHint('error') }
    else if (what === 'hint') { runHint('nudge') }
    else if (what === 'watch') { state.watching = !state.watching; log(`error-watcher ${state.watching ? 'on' : 'off'}`) }
    else if (what === 'pause') { state.paused = !state.paused; log(state.paused ? 'paused' : 'resumed') }
    else if (what === 'clear') { state.alert = null }
    else { res.writeHead(404); return res.end() }
    broadcast()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ ok: true }))
  }

  res.writeHead(404)
  res.end()
})

// ── go ───────────────────────────────────────────────────────────────────────

await mkdir(TMP, { recursive: true })
startWorker()
await Promise.race([workerReady, new Promise(r => setTimeout(r, 30000))])
state.status = 'idle'

server.listen(PORT, '127.0.0.1', () => {
  log(`copilot on http://localhost:${PORT}`)
  log(`watching browser windows titled "*${TITLE_MATCH}*"; error-watcher ${state.watching ? 'ON' : 'off'}`)
})

setInterval(() => { tick().catch(err => log(`tick: ${err.message.slice(0, 150)}`)) }, SCAN_MS)
