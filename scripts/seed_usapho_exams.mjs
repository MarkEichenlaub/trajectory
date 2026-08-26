// Seed the eight Practice USAPhO exams into the portal as handout rows.
//
// These are free-response olympiad exams, so unlike the F=ma set there are no
// fma_questions rows -- the deliverable per exam is the compiled exam PDF
// (POLevel All) and the solutions PDF, stored permanently and linked from a
// handouts row. Rubrics stay internal to the crypt.
//
// Expects the 16 compiled PDFs in work/crypt/usapho-pdfs/<key>-{All,Solutions}.pdf.
// Idempotent: storage upserts, handout upsert on id.
//
// Usage: node scripts/seed_usapho_exams.mjs [--dry-run]

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PDFDIR = join(ROOT, 'work/crypt/usapho-pdfs')
const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const DRY = process.argv.includes('--dry-run')

const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(ROOT, '.env'), 'utf8')
    .split('\n').find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))?.split('=').slice(1).join('=').trim()
if (!SERVICE_KEY) { console.error('no service key'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const EXAMS = []
for (const [y, label, year] of [['pw1', 'PhysicsWOOT 1', 2019], ['pw2', 'PhysicsWOOT 2', 2021]]) {
  for (let n = 1; n <= 4; n++) {
    EXAMS.push({
      key: `${y}-usapho${n}`,
      id: `usapho-${y === 'pw1' ? 'pwoot1' : 'pwoot2'}-p${n}`,
      name: `${label} Practice USAPhO ${n}`,
      year,
    })
  }
}

async function run() {
  for (const ex of EXAMS) {
    const allPdf = join(PDFDIR, `${ex.key}-All.pdf`)
    const solPdf = join(PDFDIR, `${ex.key}-Solutions.pdf`)
    if (!existsSync(allPdf) || !existsSync(solPdf)) throw new Error(`missing PDFs for ${ex.key}`)
    if (DRY) { console.log('would seed', ex.id, ex.name); continue }

    const up = async (path, file) => {
      const { error } = await supabase.storage.from('handout-pdfs')
        .upload(path, readFileSync(file), { upsert: true, contentType: 'application/pdf' })
      if (error) throw new Error(`${path}: ${error.message}`)
      return supabase.storage.from('handout-pdfs').getPublicUrl(path).data.publicUrl
    }
    const pdfUrl = await up(`usapho/${ex.id}.pdf`, allPdf)
    const solUrl = await up(`usapho/${ex.id}-sol.pdf`, solPdf)

    const { error } = await supabase.from('handouts').upsert({
      id: ex.id,
      resource_type: 'exam',
      source: 'USAPhO',
      name: ex.name,
      description: `AoPS-authored practice USAPhO (free response, parts A and B) from the ${ex.name.replace(/ Practice.*/, '')} course. Solutions PDF includes full worked solutions.`,
      topics: ['Mechanics'],
      tags: ['practice', 'physicswoot', 'usapho'],
      year: ex.year,
      status: 'active',
      pdf_url: pdfUrl,
      solution_url: solUrl,
    }, { onConflict: 'id' })
    if (error) throw new Error(`${ex.id}: ${error.message}`)
    console.log('seeded', ex.id)
  }
  console.log(DRY ? 'dry run complete' : 'all 8 seeded')
}
run().catch(e => { console.error('FAILED:', e.message); process.exit(1) })
