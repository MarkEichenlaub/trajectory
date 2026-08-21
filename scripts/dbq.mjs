// Ad-hoc query helper: runs SQL against the linked Supabase project via the
// Management API (the repo's migration history is out of sync, so `db push` is
// unsafe -- see the project notes). Usage:
//   node scripts/dbq.mjs "select count(*) from fma_questions"
//   node scripts/dbq.mjs --file path/to.sql

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const env = readFileSync(join(__dirname, '../.env'), 'utf8')
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN ||
  env.split('\n').find(l => l.startsWith('SUPABASE_ACCESS_TOKEN='))
    ?.split('=').slice(1).join('=').trim()

if (!TOKEN) { console.error('No SUPABASE_ACCESS_TOKEN in .env'); process.exit(1) }

const PROJECT_REF = 'nxvtaxbntqhcfqtazbnt'

const args = process.argv.slice(2)
const sql = args[0] === '--file' ? readFileSync(args[1], 'utf8') : args[0]
if (!sql) { console.error('Usage: node scripts/dbq.mjs "<sql>" | --file <path>'); process.exit(1) }

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
  body: JSON.stringify({ query: sql }),
})

const text = await res.text()
if (!res.ok) { console.error(`HTTP ${res.status}:`, text); process.exit(1) }
try { console.log(JSON.stringify(JSON.parse(text), null, 2)) } catch { console.log(text) }
