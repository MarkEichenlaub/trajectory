// One-off: uploads rendered F=ma exam page images (2024 + 2025 pilot) to the
// existing handout-pdfs bucket, under fma-figures/<exam_id>/pN.png.
// Usage: node scripts/upload_fma_figures.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(__dirname, '../.env'), 'utf8')
    .split('\n')
    .find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
    ?.split('=').slice(1).join('=').trim()

if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const PAGES_DIR = 'C:\\Users\\markd\\AppData\\Local\\Temp\\fma\\pages'
const urlMap = {}

async function run() {
  const files = readdirSync(PAGES_DIR).filter(f => f.endsWith('.png'))
  for (const file of files) {
    // fma-2024-p3.png -> examId 'fma-2024', storage path 'fma-figures/fma-2024/p3.png'
    const m = file.match(/^(fma-\d{4})-p(\d+)\.png$/)
    if (!m) continue
    const [, examId, pageNum] = m
    const storagePath = `fma-figures/${examId}/p${pageNum}.png`
    const buf = readFileSync(join(PAGES_DIR, file))
    const { error } = await supabase.storage.from('handout-pdfs').upload(storagePath, buf, {
      upsert: true, contentType: 'image/png',
    })
    if (error) { console.error(`FAILED ${file}: ${error.message}`); continue }
    const { data } = supabase.storage.from('handout-pdfs').getPublicUrl(storagePath)
    urlMap[`${examId}-p${pageNum}`] = data.publicUrl
    console.log(`✓ ${storagePath}`)
  }
  console.log('\n=== URL map (for seed_fma_questions.mjs) ===')
  console.log(JSON.stringify(urlMap, null, 2))
}

run()
