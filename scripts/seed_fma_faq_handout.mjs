// Seed the "F = ma Exam FAQ" handout (EichenlaubPhysics) -- a logistics reference
// for students thinking about sitting the exam: proctoring, registration, fees,
// calculator rules, the timeline, and the historical qualifying cutoffs.
//
// Unlike the problem handouts this one has no solutions, so only pdf_url is set
// and solution_url stays null.
//
// Usage: node scripts/seed_fma_faq_handout.mjs
//   (reads VITE_SUPABASE_SERVICE_KEY from .env, or pass the key as argv[2])

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = dirname(__dirname)

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'

function keyFromEnvFile() {
  try {
    const txt = readFileSync(join(ROOT, '.env'), 'utf8')
    const m = txt.match(/^VITE_SUPABASE_SERVICE_KEY=(.+)$/m)
    return m ? m[1].trim() : null
  } catch {
    return null
  }
}

const SERVICE_KEY = process.argv[2] || process.env.SUPABASE_SERVICE_KEY || keyFromEnvFile()
if (!SERVICE_KEY) {
  console.error('No service key found (.env VITE_SUPABASE_SERVICE_KEY, env var, or argv[2]).')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const HANDOUT = {
  id: 'handout-fma-exam-faq',
  name: 'F = ma Exam FAQ',
  source: 'EichenlaubPhysics',
  resource_type: 'handout',
  description: "Everything about taking the F = ma exam that is not physics: how it is administered (online via Educational Vistas, in person, live-proctored), the calculator and scratch-paper rules, who is allowed to proctor and why it cannot be a parent, how school registration and the per-school and per-student fees work, what to do if your school will not host it, and eligibility. Includes a month-by-month timeline of when to ask a teacher and when the deadlines fall, and a table of the official USAPhO qualifying cutoffs, medians and participation for 2021-2026. Every fact checked against aapt.org, which the handout states is the final authority.",
  topics: ['Mechanics'],
  tags: [
    'fma', 'exam logistics', 'registration', 'proctoring', 'usapho',
    'olympiad', 'qualifying scores', 'reference', 'faq',
  ],
}

const DIR = join(ROOT, 'handouts-latex', 'fma-exam-faq')
const PDF = join(DIR, 'fma-exam-faq.pdf')

async function upload(localPath, storageKey) {
  const bytes = readFileSync(localPath)
  const { error } = await supabase.storage
    .from('handout-pdfs')
    .upload(storageKey, bytes, { contentType: 'application/pdf', upsert: true })
  if (error) throw new Error(`Upload failed for ${storageKey}: ${error.message}`)
  const { data } = supabase.storage.from('handout-pdfs').getPublicUrl(storageKey)
  return data.publicUrl
}

async function run() {
  console.log('Uploading PDF …')
  const pdfUrl = await upload(PDF, `${HANDOUT.id}.pdf`)
  console.log(`  pdf_url: ${pdfUrl}`)

  const row = {
    id: HANDOUT.id,
    name: HANDOUT.name,
    source: HANDOUT.source,
    resource_type: HANDOUT.resource_type,
    description: HANDOUT.description,
    topics: HANDOUT.topics,
    tags: HANDOUT.tags,
    pdf_url: pdfUrl,
    solution_url: null,
    status: 'active',
  }
  const { error } = await supabase.from('handouts').upsert(row, { onConflict: 'id' })
  if (error) throw new Error(`Handout upsert failed: ${error.message}`)
  console.log(`\nDone. Handout "${HANDOUT.name}" saved as ${HANDOUT.id}.`)
}

run().catch(e => { console.error(e.message); process.exit(1) })
