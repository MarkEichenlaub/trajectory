// Loads worked solutions into fma_questions.solution, which the review page
// shows behind a "Show Solution" toggle once an attempt is graded.
//
// Two sources:
//   fma_solutions_extracted.mjs -- transcribed from the published solution PDFs
//                                  (AAPT for 2024/2025/2026, AoPS for practice)
//   fma_solutions_written.mjs   -- written for 2008/2009, where AAPT only ever
//                                  released an answer key
//
// Run AFTER supabase/migrations/20260821120000_fma_solutions.sql.
// Usage: node scripts/seed_fma_solutions.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { solutions2024, solutions2025, solutions2026, solutionsPractice } from './fma_solutions_extracted.mjs'
import { solutions2008, solutions2009 } from './fma_solutions_written.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(__dirname, '../.env'), 'utf8')
    .split('\n')
    .find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
    ?.split('=').slice(1).join('=').trim()

if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const BY_EXAM = {
  'fma-2008': solutions2008,
  'fma-2009': solutions2009,
  'fma-2024': solutions2024,
  'fma-2025': solutions2025,
  'fma-2026': solutions2026,
  'fma-practice-aops': solutionsPractice,
}

async function run() {
  let total = 0
  for (const [examId, solutions] of Object.entries(BY_EXAM)) {
    const entries = Object.entries(solutions)
    for (const [n, solution] of entries) {
      const id = `${examId}-q${String(n).padStart(2, '0')}`
      const { error } = await supabase.from('fma_questions').update({ solution }).eq('id', id)
      if (error) { console.error(`FAILED ${id}:`, error.message); process.exit(1) }
    }
    console.log(`✓ ${examId}: ${entries.length} solutions`)
    total += entries.length
  }
  console.log(`✓ ${total} solutions seeded`)
}

run()
