// Seeds every digitized exam under scripts/fma_exams/ into fma_questions.
//
// Each file there exports `examId` and a `questions` array carrying the
// statement, choices, answer key, topics, tags and worked solution. The exam's
// row in `handouts` already exists for all of these years.
//
// Figure columns are written here from each file's own `figures`/`choiceFigures`,
// but scripts/upload_fma_figures.mjs is the real authority on them -- run it
// afterwards to reconcile every exam against the crop map.
//
// Usage: node scripts/seed_fma_exam_files.mjs [examId ...]

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(ROOT, '.env'), 'utf8')
    .split('\n')
    .find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
    ?.split('=').slice(1).join('=').trim()

if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const only = process.argv.slice(2)
const files = readdirSync(join(__dirname, 'fma_exams'))
  .filter(f => f.endsWith('.mjs'))
  .filter(f => !only.length || only.includes(f.replace('.mjs', '')))

let total = 0
for (const file of files) {
  const { examId, questions } = await import(`./fma_exams/${file}`)
  const rows = questions.map(q => ({
    id: `${examId}-q${String(q.n).padStart(2, '0')}`,
    exam_id: examId,
    question_num: q.n,
    statement: q.statement,
    figure_urls: q.figures || [],
    choice_figure_urls: q.choiceFigures || {},
    choices: q.choices,
    correct_choice: q.correct,
    topics: q.topics,
    tags: q.tags,
    solution: q.solution,
  }))
  const { error } = await supabase.from('fma_questions').upsert(rows, { onConflict: 'id' })
  if (error) { console.error(`FAILED ${examId}: ${error.message}`); process.exit(1) }
  console.log(`✓ ${examId}: ${rows.length} questions`)
  total += rows.length
}
console.log(`\n✓ ${total} questions seeded across ${files.length} exams`)
