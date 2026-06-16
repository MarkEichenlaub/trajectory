/**
 * One-time fix: set "Anyone with the link can edit" on all Miro boards
 * attached to future sessions that were created before sharingPolicy was
 * added to the book-session / cal-webhook functions.
 *
 * Run:
 *   MIRO_ACCESS_TOKEN=<token> node scripts/fix-miro-access.mjs
 *
 * Get MIRO_ACCESS_TOKEN from Supabase dashboard → Edge Functions → Secrets.
 * The Supabase service key is read automatically from .env.
 */

import { readFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// Load .env for Supabase service key
const envText = await readFile(resolve(ROOT, '.env'), 'utf8')
const env = Object.fromEntries(
  envText.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const SUPABASE_SERVICE_KEY = env.VITE_SUPABASE_SERVICE_KEY
const MIRO_TOKEN = process.env.MIRO_ACCESS_TOKEN

if (!SUPABASE_SERVICE_KEY) {
  console.error('VITE_SUPABASE_SERVICE_KEY not found in .env')
  process.exit(1)
}
if (!MIRO_TOKEN) {
  console.error('Set MIRO_ACCESS_TOKEN env var before running this script.')
  console.error('Get it from: Supabase dashboard → Edge Functions → Secrets')
  process.exit(1)
}

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const now = new Date().toISOString()

// Fetch all future sessions that have a Miro board
const sessionsRes = await fetch(
  `${SUPABASE_URL}/rest/v1/sessions?scheduled_at=gte.${encodeURIComponent(now)}&miro_board_id=neq.&select=id,student_id,scheduled_at,miro_board_id,miro_board_url`,
  {
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
      'Accept': 'application/json',
    },
  }
)

if (!sessionsRes.ok) {
  console.error('Failed to fetch sessions:', sessionsRes.status, await sessionsRes.text())
  process.exit(1)
}

const sessions = await sessionsRes.json()
console.log(`Found ${sessions.length} future sessions with Miro boards.\n`)

if (sessions.length === 0) {
  console.log('Nothing to fix.')
  process.exit(0)
}

let fixed = 0
let alreadyOk = 0
let failed = 0

for (const session of sessions) {
  const boardId = session.miro_board_id
  const date = new Date(session.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  // PATCH the board — idempotent, safe to apply even if already correct
  const patchRes = await fetch(
    `https://api.miro.com/v2/boards/${encodeURIComponent(boardId)}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${MIRO_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ sharingPolicy: { access: 'edit' } }),
    }
  )

  if (patchRes.ok) {
    const data = await patchRes.json()
    const access = data.sharingPolicy?.access
    console.log(`✓  ${date} (${session.id}) → access: ${access}`)
    fixed++
  } else {
    const err = await patchRes.text()
    console.error(`✗  ${date} (${session.id}) board ${boardId}: ${patchRes.status} ${err}`)
    failed++
  }
}

console.log(`\nDone. Fixed: ${fixed}  Failed: ${failed}`)
