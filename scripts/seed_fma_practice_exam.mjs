// One-off: uploads the AoPS-authored Practice Exam 1 (F=ma Problem Series) as a
// new handouts row + its rendered page-figure images.
// Usage: node scripts/seed_fma_practice_exam.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(__dirname, '../.env'), 'utf8')
    .split('\n').find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))?.split('=').slice(1).join('=').trim()

if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const TMP = 'C:\\Users\\markd\\AppData\\Local\\Temp\\fma'

async function run() {
  const examBuf = readFileSync(join(TMP, 'fma-practice.pdf'))
  const solBuf = readFileSync(join(TMP, 'fma-practice-sol.pdf'))
  await supabase.storage.from('handout-pdfs').upload('fma-practice-aops.pdf', examBuf, { upsert: true, contentType: 'application/pdf' })
  await supabase.storage.from('handout-pdfs').upload('fma-practice-aops-sol.pdf', solBuf, { upsert: true, contentType: 'application/pdf' })
  const examUrl = supabase.storage.from('handout-pdfs').getPublicUrl('fma-practice-aops.pdf').data.publicUrl
  const solUrl = supabase.storage.from('handout-pdfs').getPublicUrl('fma-practice-aops-sol.pdf').data.publicUrl

  const { error } = await supabase.from('handouts').upsert({
    id: 'fma-practice-aops',
    resource_type: 'exam',
    source: 'F=ma',
    name: 'AoPS Practice Exam 1 (F=ma Problem Series)',
    description: 'AoPS-authored practice exam for the F=ma Problem Series course, not an official AAPT exam.',
    topics: ['Mechanics'],
    tags: ['practice'],
    year: 2019,
    pdf_url: examUrl,
    solution_url: solUrl,
  }, { onConflict: 'id' })
  if (error) throw error
  console.log('handout row created:', examUrl)

  const dir = join(TMP, 'practice_pages')
  const files = readdirSync(dir).filter(f => f.endsWith('.png'))
  for (const f of files) {
    const buf = readFileSync(join(dir, f))
    const path = `fma-figures/fma-practice-aops/${f.replace('fma-practice-aops-', '')}`
    const { error } = await supabase.storage.from('handout-pdfs').upload(path, buf, { upsert: true, contentType: 'image/png' })
    if (error) console.error('FAIL', f, error.message)
  }
  console.log('uploaded', files.length, 'figure pages')
}

run()
