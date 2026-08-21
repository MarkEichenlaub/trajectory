// Seed the 2026 F=ma exam into the portal.
// Uploads the exam and solution PDFs to Supabase storage, upserts the handout
// row, and upserts all 25 digitized questions.
//
// Pre-requisites:
//   - work/fma/2026_FMA_exam.pdf and 2026_FMA_solutions_v2.pdf must exist
//   - Figure crops must already be uploaded (run crop_fma_figures.py then
//     upload_fma_figures.mjs first)
//
// Usage: node scripts/seed_fma_2026.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { questions2026 } from './fma_2026_data.mjs'

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

const EXAM_ID = 'fma-2026'
const EXAM_PDF_LOCAL = join(ROOT, 'work/fma/2026_FMA_exam.pdf')
const SOL_PDF_LOCAL  = join(ROOT, 'work/fma/2026_FMA_solutions_v2.pdf')

async function uploadPdf(localPath, storagePath) {
  const buf = readFileSync(localPath)
  const { error } = await supabase.storage
    .from('handout-pdfs')
    .upload(storagePath, buf, { upsert: true, contentType: 'application/pdf' })
  if (error) throw new Error(`Storage upload failed for ${storagePath}: ${error.message}`)
  return supabase.storage.from('handout-pdfs').getPublicUrl(storagePath).data.publicUrl
}

async function seedHandout(examUrl, solUrl) {
  const { error } = await supabase.from('handouts').upsert({
    id:            EXAM_ID,
    resource_type: 'exam',
    source:        'F=ma',
    name:          '2026 F=ma',
    description:   '',
    topics:        ['Mechanics'],
    tags:          [],
    year:          2026,
    pdf_url:       examUrl,
    solution_url:  solUrl,
  }, { onConflict: 'id' })
  if (error) throw new Error(`Handout upsert failed: ${error.message}`)
}

function toRows(questions) {
  return questions.map(q => ({
    id:                 `${EXAM_ID}-q${String(q.n).padStart(2, '0')}`,
    exam_id:            EXAM_ID,
    question_num:       q.n,
    statement:          q.statement,
    figure_urls:        q.figures,
    choices:            q.choices,
    // Questions whose options are diagrams (Q3) carry a panel per choice; the
    // rest get an empty object, matching the column default.
    choice_figure_urls: q.choiceFigures || {},
    correct_choice:     q.correct,
    // Extra letters AAPT also gave credit for (Q17 is dual-credit).
    also_accepted:      q.alsoAccepted || [],
    topics:             q.topics,
    tags:               q.tags,
  }))
}

async function run() {
  console.log('=== Seeding fma-2026 ===')

  // 1. Upload PDFs
  console.log('\nUploading exam PDF...')
  const examUrl = await uploadPdf(EXAM_PDF_LOCAL, `${EXAM_ID}.pdf`)
  console.log(`  ✓ ${examUrl}`)

  console.log('Uploading solution PDF...')
  const solUrl = await uploadPdf(SOL_PDF_LOCAL, `${EXAM_ID}-sol.pdf`)
  console.log(`  ✓ ${solUrl}`)

  // 2. Upsert handout row
  console.log('\nUpserting handout row...')
  await seedHandout(examUrl, solUrl)
  console.log('  ✓ handouts row upserted')

  // 3. Upsert questions
  console.log('\nUpserting 25 questions...')
  const rows = toRows(questions2026)
  const { error } = await supabase.from('fma_questions').upsert(rows, { onConflict: 'id' })
  if (error) throw new Error(`Questions upsert failed: ${error.message}`)
  console.log(`  ✓ ${rows.length} questions upserted`)

  console.log('\n=== Done ===')
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1) })
