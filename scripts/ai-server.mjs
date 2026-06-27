/**
 * Local AI server — generates session summaries using the claude CLI.
 * Uses Mark's Claude subscription (not API credits).
 *
 * Two ways to run it:
 *   - `node scripts/ai-server.mjs --once`  → run ONE summarization pass, then exit.
 *     This is how it runs in production: a Windows Scheduled Task fires it every
 *     15 minutes. Each pass is a fresh, independent process, so a crash, hang, or
 *     claude-CLI timeout in one pass can NEVER stop future passes — the next tick
 *     just starts clean. (The old always-on daemon had no supervisor: when it died
 *     once, summarization silently stopped for days. This is the robust replacement.)
 *   - `npm run ai-server`  (no flag) → long-running daemon: a health endpoint plus
 *     the same auto loop on a 15-min timer. Kept for manual/interactive use.
 *
 * Either way the loop finds sessions that ended without a summary and auto-saves
 * AI-generated { summary, tags } (using Mark's Claude subscription via the claude
 * CLI — no API cost). Mark can edit afterwards in the admin UI.
 */
import http from 'http'
import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile, writeFile, unlink } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'

const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const MIRO_AUTH_STATE = resolve(ROOT, '.miro-auth.json')

// Load .env
const envText = await readFile(resolve(ROOT, '.env'), 'utf8')
const env = Object.fromEntries(
  envText.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const SERVICE_KEY = env.VITE_SUPABASE_SERVICE_KEY
const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`
const REST_URL = `${SUPABASE_URL}/rest/v1`
const PORT = 3747
const AUTO_INTERVAL_MS = 15 * 60 * 1000 // re-check for new finished sessions every 15 min
const RUN_ONCE = process.argv.includes('--once') // one pass then exit (Scheduled Task mode)
// Wait this long after a session's end_time before summarizing (lets the panel's
// final auto-snapshot finish uploading).
const SESSION_SETTLE_MINUTES = 10

if (!SERVICE_KEY) {
  console.error('ERROR: VITE_SUPABASE_SERVICE_KEY not found in .env')
  process.exit(1)
}

// This is a long-running background server with nothing to restart it if it
// dies, so a transient blip (a brief DNS/network failure, an offline moment)
// must NEVER take it down. Previously an unprotected fetch in the auto-loop
// rejected during one such blip, became an unhandled rejection, and crashed the
// whole process — silently stopping all summarization for days. Log and survive.
process.on('unhandledRejection', (reason) => {
  console.error(`[guard] unhandled rejection (kept alive): ${reason?.stack || reason}`)
})
process.on('uncaughtException', (err) => {
  console.error(`[guard] uncaught exception (kept alive): ${err?.stack || err}`)
})

const SUMMARY_SCHEMA = JSON.stringify({
  type: 'object',
  properties: {
    summary: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'tags'],
})

const DB_HEADERS = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
}

// ── Core analysis pipeline ────────────────────────────────────────────────────

// Takes a screenshot of a Miro board using Playwright with saved auth state.
// Returns a Buffer (JPEG), or null if auth state is missing or Playwright fails.
// One-time setup: run  node scripts/miro-auth-setup.mjs
async function screenshotMiroBoard(boardId) {
  try {
    await readFile(MIRO_AUTH_STATE)
  } catch {
    console.log('[snapshot] No Miro auth state — run: node scripts/miro-auth-setup.mjs')
    return null
  }

  let chromium
  try {
    ;({ chromium } = await import('playwright'))
  } catch {
    console.log('[snapshot] playwright not found — run: npm install playwright')
    return null
  }

  const boardUrl = `https://miro.com/app/board/${boardId}/`
  console.log(`[snapshot] Opening Miro board via Playwright: ${boardUrl}`)
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader'], // software GL so Canvas works in headless mode
  })
  const context = await browser.newContext({ storageState: MIRO_AUTH_STATE })
  const page = await context.newPage()
  try {
    await page.goto(boardUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    // The board's strokes/diagrams load asynchronously after the page shell. A
    // fixed 12s wait used to fire too early on slower loads, capturing a near-blank
    // canvas — which then got (wrongly) summarized as "blank" and skipped. Wait for
    // the network to settle first (best-effort; a Miro SPA polls forever, so cap
    // it), then add a paint buffer so the handwriting is actually rendered.
    await page.waitForLoadState('networkidle', { timeout: 45_000 }).catch(() => {})
    await page.waitForTimeout(12_000)
    // Fit the whole board into view so off-screen content isn't cut off. The
    // shortcut is dropped unless the canvas has focus, so click it first (a single
    // select-tool click never edits the board; Escape clears any incidental
    // selection before the shot).
    await page.mouse.click(960, 640)
    await page.keyboard.press('Escape')
    await page.keyboard.press('Control+Shift+H') // Miro "fit board to screen"
    await page.waitForTimeout(3_000)
    const buf = await page.screenshot({ type: 'jpeg', quality: 80 })
    console.log(`[snapshot] Captured ${buf.length} bytes`)
    return buf
  } catch (e) {
    console.error(`[snapshot] Playwright screenshot failed: ${e.message}`)
    return null
  } finally {
    await browser.close()
  }
}

async function getSessionContent(sessionId, boardId) {
  // Ask the edge function what cloud content exists for this board. Crucially, a
  // non-OK response (e.g. its 502 "no readable content" when a board has no
  // uploaded snapshot and no typed text) is NOT fatal — the live Playwright
  // screenshot below is our most reliable source for handwritten physics boards,
  // so we must still fall through to it. (Previously any non-OK status threw here,
  // so boards with no cloud picture/text were skipped forever even though a
  // perfectly good screenshot was available.)
  let data = {}
  try {
    const res = await fetch(`${FUNCTIONS_URL}/summarize-session`, {
      method: 'POST',
      headers: { ...DB_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
    data = await res.json().catch(() => ({}))
    if (!res.ok && res.status !== 502) {
      // 401/403/404/400 are real misconfigurations worth flagging in the log,
      // but we still try the screenshot fallback rather than giving up.
      console.error(`[content] summarize-session HTTP ${res.status}: ${data.error || ''}`)
    }
  } catch (e) {
    console.error(`[content] summarize-session unreachable (will still try screenshot): ${e.message}`)
  }

  // Prefer an already-uploaded visual capture (a panel snapshot, or the rare board
  // PDF) — it shows the handwriting/diagrams at the moment it was captured.
  if (data.pictureUrl) {
    const isPdf = /\.pdf(\?|$)/i.test(data.pictureUrl)
    return { type: isPdf ? 'pdf' : 'image', content: data.pictureUrl }
  }
  // No uploaded snapshot — take a live screenshot via Playwright. This is the path
  // that actually works for most handwritten boards.
  if (boardId) {
    const screenshot = await screenshotMiroBoard(boardId)
    if (screenshot) return { type: 'screenshot', content: screenshot }
  }
  // Last resort: typed text (usually sparse on handwritten boards).
  if (data.boardText) return { type: 'text', content: data.boardText }
  throw new Error('No board content available (no snapshot, screenshot, or text)')
}

// Runs the claude CLI (Mark's subscription) to turn board content into a
// { summary, tags } object. Reads the file with the Read tool and returns the
// schema-validated structured output.
async function analyzeContent({ type, content }) {
  const effectiveType = type === 'screenshot' ? 'image' : type
  const ext = effectiveType === 'image' ? '.jpg' : effectiveType === 'pdf' ? '.pdf' : '.txt'
  const tmpFile = resolve(tmpdir(), `trajectory-session-${randomUUID()}${ext}`)

  if (type === 'text') {
    await writeFile(tmpFile, content)
  } else if (type === 'screenshot') {
    await writeFile(tmpFile, content) // content is a Buffer from Playwright
  } else {
    const dl = await fetch(content)
    if (!dl.ok) throw new Error(`Could not download board ${type}: HTTP ${dl.status}`)
    await writeFile(tmpFile, Buffer.from(await dl.arrayBuffer()))
  }

  try {
    const subject = effectiveType === 'text'
      ? `Read the tutoring session whiteboard notes at ${tmpFile}.`
      : effectiveType === 'pdf'
        ? `Read the tutoring session whiteboard PDF at ${tmpFile}.`
        : `Look at the tutoring session whiteboard image at ${tmpFile}.`
    const prompt = [
      subject,
      'It is from a one-on-one physics and math tutoring session.',
      'Summarize what was covered in 2-5 sentences: past tense, specific topics and key ideas discussed.',
      'List 3-8 concise topic tags (for example: "Taylor series", "small-angle approximation", "energy conservation").',
      'If the board is essentially blank or unreadable, set summary to an empty string and tags to an empty array.',
    ].join(' ')

    const schema = SUMMARY_SCHEMA.replace(/'/g, "''")
    const p = prompt.replace(/'/g, "''")
    const isWin = process.platform === 'win32'
    // --output-format json wraps the run in an envelope whose `structured_output`
    // field holds the schema-validated result. Empty stdin ('' | …) stops the CLI
    // from waiting ~3s for piped input. (-y is NOT a valid flag — it errors out.)
    const base = `claude -p --allowedTools Read --output-format json --json-schema '${schema}' '${p}'`
    const cmd = isWin ? `'' | ${base}` : `${base} < /dev/null`

    const { stdout } = await execAsync(cmd, {
      // 5 min: reading a dense handwritten board with Opus + structured output can
      // be slow under load. The old 3-min cap was hit on 2026-06-20 (a transient
      // timeout), which — combined with the daemon having no supervisor — is what
      // silently stopped summarization. The Scheduled Task retries either way now.
      shell: isWin ? 'pwsh.exe' : undefined,
      timeout: 300000,
      cwd: ROOT,
      maxBuffer: 10 * 1024 * 1024,
    })

    let envelope
    try {
      envelope = JSON.parse(stdout.trim())
    } catch {
      throw new Error(`Could not parse claude output: ${stdout.slice(0, 200)}`)
    }
    const result = envelope.structured_output || envelope
    if (typeof result.summary !== 'string' || !Array.isArray(result.tags)) {
      throw new Error(`No structured output from claude (is_error=${envelope.is_error}): ${stdout.slice(0, 200)}`)
    }
    return result
  } finally {
    await unlink(tmpFile).catch(() => {})
  }
}

async function saveSessionSummary(sessionId, summary, tags) {
  const res = await fetch(
    `${REST_URL}/sessions?id=eq.${encodeURIComponent(sessionId)}`,
    {
      method: 'PATCH',
      headers: { ...DB_HEADERS, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ summary, tags }),
    }
  )
  if (!res.ok) throw new Error(`DB update failed: ${res.status}`)
}

// ── Auto-summarization loop ───────────────────────────────────────────────────

let autoRunning = false
let lastRun = null

async function runAutoSummarize() {
  if (autoRunning) return
  autoRunning = true
  lastRun = new Date().toISOString()
  try {
    // Find sessions that ended ≥ settle-time ago, have a Miro board, but no
    // summary yet — limit to the last 45 days. Treating an empty-string summary
    // as "needs one" lets Mark regenerate by clearing the field in the portal.
    const before = new Date(Date.now() - SESSION_SETTLE_MINUTES * 60 * 1000).toISOString()
    const since = new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString()

    const qs = new URLSearchParams({
      select: 'id,miro_board_id,miro_pdf_url',
      miro_board_id: 'not.is.null',
      order: 'end_time.desc',
      limit: '10',
    })
    const url = `${REST_URL}/sessions?${qs}`
      + `&or=(summary.is.null,summary.eq.)`
      + `&end_time=lt.${encodeURIComponent(before)}`
      + `&end_time=gt.${encodeURIComponent(since)}`

    let listRes
    try {
      listRes = await fetch(url, { headers: DB_HEADERS })
    } catch (e) {
      // Network/DNS hiccup — just skip this cycle and retry on the next one.
      console.error(`[auto] Could not reach Supabase (will retry next cycle): ${e.message}`)
      return
    }
    if (!listRes.ok) {
      console.error(`[auto] Failed to list sessions: ${listRes.status}`)
      return
    }
    const sessions = await listRes.json()
    if (!sessions.length) {
      console.log('[auto] No sessions need summarizing.')
      return
    }

    console.log(`[auto] Found ${sessions.length} session(s) to summarize.`)
    for (const session of sessions) {
      try {
        console.log(`[auto] Processing ${session.id}...`)
        const sessionContent = await getSessionContent(session.id, session.miro_board_id)
        const { summary, tags } = await analyzeContent(sessionContent)
        // Blank board → leave the summary null so the next run retries once a
        // panel snapshot has been captured (rather than locking in an empty one).
        if (!summary.trim()) {
          console.log(`[auto] – ${session.id}: board looks blank, will retry later`)
          continue
        }
        await saveSessionSummary(session.id, summary, tags)
        console.log(`[auto] ✓ ${session.id} — tags: ${tags.join(', ')}`)
      } catch (e) {
        console.error(`[auto] ✗ ${session.id}: ${e.message}`)
      }
    }
  } finally {
    autoRunning = false
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────

// Wrap so a rejection from the loop can never escape as an unhandled rejection
// (the original crash path).
const safeRun = () => runAutoSummarize().catch((e) => console.error(`[auto] run failed: ${e.message}`))

if (RUN_ONCE) {
  // Scheduled-Task mode: do exactly one pass, then exit so the task completes.
  // The next tick (15 min later) is a brand-new process — no supervisor needed.
  console.log(`\n[once] ${new Date().toISOString()} — single summarization pass`)
  await safeRun()
  console.log(`[once] ${new Date().toISOString()} — done\n`)
  process.exit(0)
} else {
  // Daemon mode (`npm run ai-server`). Board snapshots are uploaded by the Miro
  // panel straight to the cloud (the save-board-snapshot edge function), so this
  // process needs no inbound API — the endpoint just lets Mark confirm it's alive
  // (open http://localhost:3747 or curl it).
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, service: 'trajectory-ai-summarizer', lastRun }))
  })
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`\n✨ AI summarizer running (health check: http://localhost:${PORT})`)
    console.log(`   Auto-summarizing finished sessions every ${AUTO_INTERVAL_MS / 60000} minutes.\n`)
  })
  // Run shortly after startup, then on the interval.
  setTimeout(safeRun, 20 * 1000)
  setInterval(safeRun, AUTO_INTERVAL_MS)
}
