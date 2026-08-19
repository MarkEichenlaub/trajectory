// One-off: applies supabase/migrations/20260819120000_fma_practice_tests.sql via the
// Supabase Management API (same approach as seed_fma_exams.mjs's applyMigration()).
// Usage: node scripts/apply_fma_migration.mjs

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(__dirname, '../.env'), 'utf8')
    .split('\n')
    .find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
    ?.split('=').slice(1).join('=').trim()

if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }

const PROJECT_REF = 'nxvtaxbntqhcfqtazbnt'
const sql = readFileSync(join(__dirname, '../supabase/migrations/20260819120000_fma_practice_tests.sql'), 'utf8')

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_KEY}` },
  body: JSON.stringify({ query: sql }),
})

if (res.ok) {
  console.log('✓ Migration applied')
} else {
  console.error('Migration failed:', await res.text())
  process.exit(1)
}
