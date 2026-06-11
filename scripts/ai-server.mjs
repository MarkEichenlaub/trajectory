/**
 * Local AI server — analyzes Miro session whiteboards using the claude CLI.
 * Uses Mark's Claude subscription (not API credits).
 *
 * Start with:  npm run ai-server
 * Then click the ✨ AI button in the admin UI to generate session summaries.
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
const PORT = 3747

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

function psEsc(s) {
  // Escape single quotes for PowerShell single-quoted strings
  return s.replace(/'/g, "''")
}

async function runClaude(tmpFile) {
  const prompt = [
    `Read the tutoring session whiteboard PDF at ${tmpFile}.`,
    'It is from a one-on-one physics and math tutoring session.',
    'Summarize what was covered in 2-5 sentences: past tense, specific topics and key ideas discussed.',
    'List 3-8 concise topic tags (for example: "Taylor series", "small-angle approximation", "energy conservation").',
  ].join(' ')

  const isWin = process.platform === 'win32'
  let stdout

  if (isWin) {
    // PowerShell: single-quoted strings are fully literal (no variable expansion)
    const cmd = `claude -p --allowedTools Read -y --json-schema '${psEsc(SUMMARY_SCHEMA)}' '${psEsc(prompt)}'`
    ;({ stdout } = await execAsync(cmd, {
      shell: 'pwsh.exe',
      timeout: 120000,
      cwd: ROOT,
    }))
  } else {
    const cmd = `claude -p --allowedTools Read -y --json-schema '${psEsc(SUMMARY_SCHEMA)}' '${psEsc(prompt)}'`
    ;({ stdout } = await execAsync(cmd, {
      timeout: 120000,
      cwd: ROOT,
    }))
  }

  // --json-schema ensures the output is valid JSON; trim in case of trailing newline
  const raw = stdout.trim()
  try {
    return JSON.parse(raw)
  } catch {
    // Strip markdown fences if claude wrapped the output
    const m = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
    if (m) return JSON.parse(m[1].trim())
    throw new Error(`Unexpected AI output: ${raw.slice(0, 200)}`)
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'content-type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method !== 'POST' || req.url !== '/analyze') {
    res.writeHead(404)
    res.end(JSON.stringify({ error: 'not found' }))
    return
  }

  let body = ''
  for await (const chunk of req) body += chunk

  let sessionId
  try { sessionId = JSON.parse(body).sessionId } catch { /* handled below */ }

  if (!sessionId) {
    res.writeHead(400)
    res.end(JSON.stringify({ error: 'sessionId required' }))
    return
  }

  // Step 1: Call the summarize-session edge function with service key auth.
  // It exports the Miro board to PDF (if not already done) and returns the URL.
  let pdfUrl
  try {
    const edgeRes = await fetch(`${FUNCTIONS_URL}/summarize-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    })
    const edgeData = await edgeRes.json()
    if (!edgeRes.ok) throw new Error(edgeData.error || `Edge function error ${edgeRes.status}`)
    pdfUrl = edgeData.pdfUrl
    if (!pdfUrl) throw new Error('No PDF URL returned')
  } catch (e) {
    console.error('PDF export failed:', e.message)
    res.writeHead(502)
    res.end(JSON.stringify({ error: `PDF export failed: ${e.message}` }))
    return
  }

  // Step 2: Download the PDF to a local temp file.
  const tmpFile = resolve(tmpdir(), `trajectory-session-${randomUUID()}.pdf`)
  try {
    const pdfRes = await fetch(pdfUrl)
    if (!pdfRes.ok) throw new Error(`HTTP ${pdfRes.status}`)
    const bytes = await pdfRes.arrayBuffer()
    await writeFile(tmpFile, Buffer.from(bytes))
  } catch (e) {
    console.error('PDF download failed:', e.message)
    res.writeHead(502)
    res.end(JSON.stringify({ error: `Could not download PDF: ${e.message}` }))
    return
  }

  // Step 3: Analyze with claude CLI (uses Claude subscription, not API credits).
  try {
    console.log(`Analyzing session ${sessionId} with claude CLI...`)
    const result = await runClaude(tmpFile)
    console.log(`Done. Tags: ${result.tags?.join(', ')}`)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(result))
  } catch (e) {
    console.error('claude analysis failed:', e.message)
    res.writeHead(500)
    res.end(JSON.stringify({ error: `AI analysis failed: ${e.message}` }))
  } finally {
    await unlink(tmpFile).catch(() => {})
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n✨ AI server running at http://localhost:${PORT}`)
  console.log('   Click the ✨ AI button in the admin portal to generate session summaries.\n')
})
