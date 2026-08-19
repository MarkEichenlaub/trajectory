// Loads the digitized 2024 + 2025 F=ma questions (scripts/fma_questions_data.mjs)
// into the fma_questions table. Run AFTER applying
// supabase/migrations/20260819120000_fma_practice_tests.sql.
// Usage: node scripts/seed_fma_questions.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { questions2024, questions2025 } from './fma_questions_data.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(__dirname, '../.env'), 'utf8')
    .split('\n')
    .find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
    ?.split('=').slice(1).join('=').trim()

if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

function toRows(examId, questions) {
  return questions.map(q => ({
    id: `${examId}-q${String(q.n).padStart(2, '0')}`,
    exam_id: examId,
    question_num: q.n,
    statement: q.statement,
    figure_urls: q.figures,
    choices: q.choices,
    correct_choice: q.correct,
    topics: q.topics,
    tags: q.tags,
  }))
}

async function run() {
  const rows = [...toRows('fma-2024', questions2024), ...toRows('fma-2025', questions2025)]
  console.log(`Seeding ${rows.length} questions...`)
  const { error } = await supabase.from('fma_questions').upsert(rows, { onConflict: 'id' })
  if (error) { console.error('FAILED:', error.message); process.exit(1) }
  console.log(`✓ ${rows.length} questions seeded`)
}

run()
