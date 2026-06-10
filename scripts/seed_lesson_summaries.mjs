// Publish per-lesson one-page summaries to the portal.
//
// Reads EigenNode/scripts/output/summary_pdfs/index.json (written by
// EigenNode's build_summary_pdfs.py), uploads each PDF to the `handout-pdfs`
// storage bucket, and upserts a `handouts` row per lesson tagged "summary" so
// the portal's Source filter can find it. The handout `source` is the exact
// AoPS course name so summaries group with that course's problems.
//
// Usage: node scripts/seed_lesson_summaries.mjs
//   (reads VITE_SUPABASE_SERVICE_KEY from trajectory/.env)

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'

function readServiceKey() {
  if (process.env.SUPABASE_SERVICE_KEY) return process.env.SUPABASE_SERVICE_KEY
  const env = readFileSync(join(__dirname, '..', '.env'), 'utf8')
  const m = env.match(/VITE_SUPABASE_SERVICE_KEY\s*=\s*(.+)/)
  if (!m) throw new Error('VITE_SUPABASE_SERVICE_KEY not found in .env')
  return m[1].trim().replace(/^['"]|['"]$/g, '')
}

const supabase = createClient(SUPABASE_URL, readServiceKey(), { auth: { persistSession: false } })

const PDF_DIR = join(__dirname, '..', '..', 'EigenNode', 'scripts', 'output', 'summary_pdfs')

async function run() {
  const index = JSON.parse(readFileSync(join(PDF_DIR, 'index.json'), 'utf8'))
  let ok = 0
  for (const s of index) {
    const code = s.code.toUpperCase()
    const id = `summary-${code.toLowerCase()}`
    process.stdout.write(`${code} … `)

    const bytes = readFileSync(join(PDF_DIR, s.pdf))
    if (bytes.slice(0, 4).toString('latin1') !== '%PDF') throw new Error(`${s.pdf} is not a PDF`)
    const storageKey = `${id}.pdf`
    const up = await supabase.storage
      .from('handout-pdfs')
      .upload(storageKey, bytes, { contentType: 'application/pdf', upsert: true })
    if (up.error) throw new Error(`upload ${storageKey}: ${up.error.message}`)
    const { data } = supabase.storage.from('handout-pdfs').getPublicUrl(storageKey)

    const titlePart = s.lesson_title.includes(':')
      ? s.lesson_title.split(':').slice(1).join(':').trim()
      : s.lesson_title
    const row = {
      id,
      name: `${code} Summary — ${titlePart}`,
      source: s.course,
      resource_type: 'summary',
      description:
        `One-page summary of the facts, definitions, and formulas introduced in ` +
        `${s.lesson_title} (${s.course}) that the week's homework relies on.`,
      topics: s.topics,
      tags: [code, 'summary', ...s.keyword.split(/\s+/).filter(w => w.length > 2)],
      pdf_url: data.publicUrl,
    }
    let ins = await supabase.from('handouts').upsert(row, { onConflict: 'id' })
    if (ins.error && /resource_type/.test(ins.error.message)) {
      // handouts.resource_type may carry a CHECK constraint that predates
      // "summary"; fall back to 'handout' — the portal also recognizes the
      // "summary" tag.
      ins = await supabase.from('handouts').upsert(
        { ...row, resource_type: 'handout' }, { onConflict: 'id' })
    }
    if (ins.error) throw new Error(`upsert ${id}: ${ins.error.message}`)
    ok++
    console.log(`ok (${(bytes.length / 1024).toFixed(0)} KB)`)
  }
  console.log(`\nDone — ${ok}/${index.length} lesson summaries published.`)
}

run().catch(e => { console.error('\nFAILED:', e.message); process.exit(1) })
