/**
 * Local AI server — generates session summaries using the claude CLI.
 * Uses Mark's Claude subscription (not API credits).
 *
 * Start with:  npm run ai-server
 *
 * Two modes:
 *   - HTTP button: POST /analyze {sessionId} → returns {summary, tags} (admin reviews before saving)
 *   - Auto loop: every 30 min, finds sessions that ended without a summary and
 *     auto-saves AI-generated content. Mark can edit afterwards in the admin UI.
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
const AUTO_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes
// Wait this long after session end_time before auto-processing (gives Miro time to sync)
const SESSION_SETTLE_MINUTES = 20

if (!SERVICE_KEY) {
  console.error('ERROR: VITE_SUPABASE_SERVICE_KEY not found in .env')
  process.exit(1)
}

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

async function getPdfUrl(sessionId) {
  const res = await fetch(`${FUNCTIONS_URL}/summarize-session`, {
    method: 'POST',
    headers: { ...DB_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Edge function error ${res.status}`)
  if (!data.pdfUrl) throw new Error('No PDF available for this session')
  return data.pdfUrl
}

async function analyzePdf(pdfUrl) {
  const pdfRes = await fetch(pdfUrl)
  if (!pdfRes.ok) throw new Error(`Could not download PDF: HTTP ${pdfRes.status}`)
  const bytes = await pdfRes.arrayBuffer()

  const tmpFile = resolve(tmpdir(), `trajectory-session-${randomUUID()}.pdf`)
  await writeFile(tmpFile, Buffer.from(bytes))

  try {
    const prompt = [
      `Read the tutoring session whiteboard PDF at ${tmpFile}.`,
      'It is from a one-on-one physics and math tutoring session.',
      'Summarize what was covered in 2-5 sentences: past tense, specific topics and key ideas discussed.',
      'List 3-8 concise topic tags (for example: "Taylor series", "small-angle approximation", "energy conservation").',
    ].join(' ')

    const schema = SUMMARY_SCHEMA.replace(/'/g, "''")
    const p = prompt.replace(/'/g, "''")
    const isWin = process.platform === 'win32'
    const cmd = `claude -p --allowedTools Read -y --json-schema '${schema}' '${p}'`

    const { stdout } = await execAsync(cmd, {
      shell: isWin ? 'pwsh.exe' : undefined,
      timeout: 120000,
      cwd: ROOT,
    })

    const raw = stdout.trim()
    try {
      return JSON.parse(raw)
    } catch {
      const m = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
      if (m) return JSON.parse(m[1].trim())
      throw new Error(`Unexpected AI output: ${raw.slice(0, 200)}`)
    }
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

async function runAutoSummarize() {
  if (autoRunning) return
  autoRunning = true
  try {
    // Find sessions that ended ≥20 min ago (settle time), have a Miro board,
    // but no summary yet — limit to the last 45 days.
    const before = new Date(Date.now() - SESSION_SETTLE_MINUTES * 60 * 1000).toISOString()
    const since = new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString()

    const qs = new URLSearchParams({
      select: 'id,miro_board_id',
      summary: 'is.null',
      miro_board_id: 'not.is.null',
      order: 'end_time.desc',
      limit: '10',
    })
    const url = `${REST_URL}/sessions?${qs}&end_time=lt.${encodeURIComponent(before)}&end_time=gt.${encodeURIComponent(since)}`

    const listRes = await fetch(url, { headers: DB_HEADERS })
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
        const pdfUrl = await getPdfUrl(session.id)
        const { summary, tags } = await analyzePdf(pdfUrl)
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

// ── HTTP handler (✨ AI button: returns result without saving) ─────────────────

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'content-type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  if (req.method !== 'POST' || req.url !== '/analyze') {
    res.writeHead(404); res.end(JSON.stringify({ error: 'not found' })); return
  }

  let body = ''
  for await (const chunk of req) body += chunk

  let sessionId
  try { sessionId = JSON.parse(body).sessionId } catch { /* handled below */ }

  if (!sessionId) {
    res.writeHead(400); res.end(JSON.stringify({ error: 'sessionId required' })); return
  }

  try {
    console.log(`[btn] Analyzing ${sessionId}...`)
    const pdfUrl = await getPdfUrl(sessionId)
    const result = await analyzePdf(pdfUrl)
    console.log(`[btn] Done. Tags: ${result.tags?.join(', ')}`)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(result))
  } catch (e) {
    console.error(`[btn] Error for ${sessionId}: ${e.message}`)
    res.writeHead(e.message.includes('not reachable') ? 503 : 500)
    res.end(JSON.stringify({ error: e.message }))
  }
})

// ── Start ─────────────────────────────────────────────────────────────────────

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n✨ AI server running at http://localhost:${PORT}`)
  console.log(`   Auto-summarizing sessions every ${AUTO_INTERVAL_MS / 60000} minutes.\n`)
})

// Run immediately on startup (after a short delay), then every 30 min.
setTimeout(runAutoSummarize, 60 * 1000)
setInterval(runAutoSummarize, AUTO_INTERVAL_MS)
