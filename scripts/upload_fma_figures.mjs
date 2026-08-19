// Uploads the cropped per-question F=ma figures and repoints fma_questions at
// them. Run scripts/crop_fma_figures.py first to produce work/fma/crops/.
//
// This replaces the original page-image approach, where every question on a
// page got a full 1275x1650 render of that page: the statement and choices
// appeared twice, each question was about three screens tall, and a page shared
// by two or three questions let the student read ahead.
//
// Questions genuinely sharing one figure (a "The following information applies
// to problems 21 and 22" preamble) still point at the same image -- that is in
// the exam itself, not an artifact.
//
// Usage: node scripts/upload_fma_figures.mjs [--dry-run]

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CROPS = join(ROOT, 'work/fma/crops')
const DRY = process.argv.includes('--dry-run')

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(ROOT, '.env'), 'utf8')
    .split('\n')
    .find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
    ?.split('=').slice(1).join('=').trim()

if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

async function run() {
  const mapPath = join(CROPS, 'figure_map.json')
  if (!existsSync(mapPath)) {
    console.error(`No ${mapPath} — run: python scripts/crop_fma_figures.py`)
    process.exit(1)
  }
  const figureMap = JSON.parse(readFileSync(mapPath, 'utf8'))

  for (const [examId, entry] of Object.entries(figureMap)) {
    const questions = entry.figures || {}
    const choiceFigures = entry.choiceFigures || {}
    // Upload each distinct crop once, even when two questions share it.
    const files = new Set([
      ...Object.values(questions),
      ...Object.values(choiceFigures).flatMap(m => Object.values(m)),
    ])
    const uploaded = new Map()
    for (const file of files) {
      const storagePath = `fma-figures/${examId}/${file}`
      if (!DRY) {
        const { error } = await supabase.storage.from('handout-pdfs')
          .upload(storagePath, readFileSync(join(CROPS, file)), { upsert: true, contentType: 'image/png' })
        if (error) { console.error(`  FAILED ${file}: ${error.message}`); continue }
      }
      uploaded.set(file, supabase.storage.from('handout-pdfs').getPublicUrl(storagePath).data.publicUrl)
    }

    const { data: rows, error: qErr } = await supabase
      .from('fma_questions').select('id, question_num, figure_urls, choice_figure_urls').eq('exam_id', examId).order('question_num')
    if (qErr) { console.error(`  ${examId}: ${qErr.message}`); continue }

    let set = 0, cleared = 0, perChoice = 0
    for (const row of rows) {
      const file = questions[String(row.question_num)]
      const urls = file && uploaded.has(file) ? [uploaded.get(file)] : []
      const panels = choiceFigures[String(row.question_num)] || {}
      const choiceUrls = {}
      for (const [letter, f] of Object.entries(panels)) {
        if (uploaded.has(f)) choiceUrls[letter] = uploaded.get(f)
      }
      const same = JSON.stringify(urls) === JSON.stringify(row.figure_urls || []) &&
                   JSON.stringify(choiceUrls) === JSON.stringify(row.choice_figure_urls || {})
      if (same) continue
      if (!DRY) {
        const { error } = await supabase.from('fma_questions')
          .update({ figure_urls: urls, choice_figure_urls: choiceUrls }).eq('id', row.id)
        if (error) { console.error(`  ${row.id}: ${error.message}`); continue }
      }
      if (Object.keys(choiceUrls).length) perChoice++
      else if (urls.length) set++
      else cleared++
    }
    console.log(`${examId}: ${uploaded.size} images, ${set} figures, ${perChoice} per-choice sets, ${cleared} cleared`)
  }
  if (DRY) console.log('\n(dry run — nothing written)')
}

run()
