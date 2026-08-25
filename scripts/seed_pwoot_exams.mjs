// Seed the four PhysicsWOOT practice F=ma exams into the portal.
//
// Uploads the rendered figures to storage, creates one `handouts` row per exam,
// and inserts the 100 `fma_questions` rows from scripts/fma_exams/fma-pwoot*.mjs.
//
// Unlike the AAPT exams these have no source PDF -- they were authored directly
// in the AoPS crypt -- so pdf_url/solution_url stay null and the questions are
// the only representation. That is fine: the test runner reads fma_questions,
// and the handout list falls back to the name when there is no PDF to link.
//
// Idempotent: storage uploads use upsert, and both tables are upserted on id.
//
// Usage:
//   node scripts/seed_pwoot_exams.mjs --dry-run
//   node scripts/seed_pwoot_exams.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const FIGDIR = join(ROOT, 'work/crypt/figures')
const BUCKET = 'handout-pdfs'
const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'

const DRY = process.argv.includes('--dry-run')

const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(ROOT, '.env'), 'utf8')
    .split('\n').find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))?.split('=').slice(1).join('=').trim()
if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const EXAMS = [
  { key: 'fma-pwoot1-p1', name: 'PhysicsWOOT 1 Practice F=ma Exam 1', collection: 175, doc: 9207, year: 2019 },
  { key: 'fma-pwoot1-p2', name: 'PhysicsWOOT 1 Practice F=ma Exam 2', collection: 175, doc: 9208, year: 2019 },
  { key: 'fma-pwoot2-p1', name: 'PhysicsWOOT 2 Practice F=ma Exam 1', collection: 191, doc: 11108, year: 2021 },
  { key: 'fma-pwoot2-p2', name: 'PhysicsWOOT 2 Practice F=ma Exam 2', collection: 191, doc: 11254, year: 2021 },
]

const CONTENT_TYPE = f => (f.endsWith('.jpg') ? 'image/jpeg' : 'image/png')

// Every figure a question references, derived from the authored URLs so the
// upload set and the stored URLs cannot drift apart.
function figureFilesFor(questions) {
  const files = new Set()
  for (const q of questions) {
    for (const u of [...(q.figures || []), ...(q.solutionFigures || []), ...Object.values(q.choiceFigures || {})]) {
      files.add(u.split('/').pop())
    }
  }
  return [...files]
}

async function run() {
  let uploaded = 0, skipped = 0
  const summary = []

  for (const ex of EXAMS) {
    const mod = await import(`file://${join(ROOT, 'scripts/fma_exams', ex.key + '.mjs').replace(/\\/g, '/')}`)
    const questions = mod.questions
    if (questions.length !== 25) throw new Error(`${ex.key}: expected 25 questions, got ${questions.length}`)

    // ---- figures -------------------------------------------------------
    const files = figureFilesFor(questions)
    for (const f of files) {
      const local = join(FIGDIR, f)
      if (!existsSync(local)) throw new Error(`${ex.key}: missing figure ${f}`)
      if (DRY) { skipped++; continue }
      const { error } = await supabase.storage.from(BUCKET)
        .upload(`fma-figures/${ex.key}/${f}`, readFileSync(local), { upsert: true, contentType: CONTENT_TYPE(f) })
      if (error) throw new Error(`upload ${f}: ${error.message}`)
      uploaded++
    }

    // ---- handout row ---------------------------------------------------
    const handout = {
      id: ex.key,
      resource_type: 'exam',
      source: 'F=ma',
      name: ex.name,
      description: `AoPS-authored practice exam from the ${ex.name.startsWith('PhysicsWOOT 1') ? 'PhysicsWOOT 1' : 'PhysicsWOOT 2'} course, not an official AAPT exam.`,
      topics: ['Mechanics'],
      tags: ['practice', 'physicswoot'],
      year: ex.year,
      status: 'active',
    }
    if (!DRY) {
      const { error } = await supabase.from('handouts').upsert(handout, { onConflict: 'id' })
      if (error) throw new Error(`handout ${ex.key}: ${error.message}`)
    }

    // ---- questions -----------------------------------------------------
    const rows = questions.map(q => ({
      id: `${ex.key}-q${String(q.n).padStart(2, '0')}`,
      exam_id: ex.key,
      question_num: q.n,
      statement: q.statement,
      figure_urls: q.figures || [],
      choice_figure_urls: q.choiceFigures || {},
      choices: q.choices,
      correct_choice: q.correct,
      solution: q.solution,
      solution_figure_urls: q.solutionFigures || [],
      topics: q.topics || ['Mechanics'],
      tags: q.tags || [],
    }))
    if (!DRY) {
      const { error } = await supabase.from('fma_questions').upsert(rows, { onConflict: 'id' })
      if (error) throw new Error(`questions ${ex.key}: ${error.message}`)
    }

    summary.push({ exam: ex.key, questions: rows.length, figures: files.length })
  }

  console.table(summary)
  console.log(DRY ? `DRY RUN -- would upload ${skipped} figures, 4 handouts, 100 questions`
                  : `uploaded ${uploaded} figures; seeded 4 handouts and 100 questions`)
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1) })
