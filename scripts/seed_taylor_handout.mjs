// Seed the "Taylor Series for the F = ma Exam" handout (EichenlaubPhysics).
// Uploads the student PDF (pdf_url) and the solutions PDF (solution_url) to the
// handout-pdfs bucket, then upserts a single handout row. The student portal only
// reveals the solution link once the student's assignment is marked completed.
//
// Usage: node scripts/seed_taylor_handout.mjs
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
  id: 'handout-taylor-series-fma',
  name: 'Taylor Series for the F = ma Exam',
  source: 'EichenlaubPhysics',
  resource_type: 'handout',
  description: 'A fluency-first guide to the handful of Taylor approximations that show up everywhere on the F = ma exam: (1+x)^n, e^x, ln(1+x), sin x, and cos x. Covers estimating roots like sqrt(65) by hand, even/odd functions, and physics applications (small-angle pendulum, "every potential is a spring near its minimum," Lennard-Jones, gravity vs. height, radioactive decay) and error propagation. No calculus assumed; lots of short exercises.',
  topics: ['Mechanics'],
  tags: ['taylor series', 'approximation', 'small angle', 'binomial approximation', 'fma', 'series expansion', 'error propagation', 'math methods'],
}

const DIR = join(ROOT, 'handouts-latex', 'taylor-series-fma')
const STUDENT_PDF = join(DIR, 'taylor-series-fma-student.pdf')   // -> pdf_url (no solutions)
const SOLUTION_PDF = join(DIR, 'taylor-series-fma-solutions.pdf') // -> solution_url (revealed on completion)

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
  console.log(`Uploading student PDF …`)
  const pdfUrl = await upload(STUDENT_PDF, `${HANDOUT.id}.pdf`)
  console.log(`  pdf_url: ${pdfUrl}`)

  console.log(`Uploading solutions PDF …`)
  const solutionUrl = await upload(SOLUTION_PDF, `${HANDOUT.id}-sol.pdf`)
  console.log(`  solution_url: ${solutionUrl}`)

  const row = {
    id: HANDOUT.id,
    name: HANDOUT.name,
    source: HANDOUT.source,
    resource_type: HANDOUT.resource_type,
    description: HANDOUT.description,
    topics: HANDOUT.topics,
    tags: HANDOUT.tags,
    pdf_url: pdfUrl,
    solution_url: solutionUrl,
  }
  const { error } = await supabase.from('handouts').upsert(row, { onConflict: 'id' })
  if (error) throw new Error(`Handout upsert failed: ${error.message}`)
  console.log(`\nDone. Handout "${HANDOUT.name}" saved as ${HANDOUT.id}.`)
}

run().catch(e => { console.error(e.message); process.exit(1) })
