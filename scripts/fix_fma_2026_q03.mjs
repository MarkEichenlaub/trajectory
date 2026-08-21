// One-off: 2026 F=ma question 3's answer options are diagrams (five vx/vy graph
// pairs), but the bulk figure crop lumped the whole question into a single tall
// image -- clipped on the right and bottom, with the source's own "(A)"-"(E)"
// labels baked in -- leaving all five portal choices reading "(see figure)".
//
// This repoints the stem at the trajectory alone and gives each choice its own
// panel via choice_figure_urls, which is what 20260819180000 added the column
// for. Crops come from work/crop_q3.py.
//
// Usage: node scripts/fix_fma_2026_q03.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CROPS = join(ROOT, 'work')

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(ROOT, '.env'), 'utf8')
    .split('\n')
    .find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
    ?.split('=').slice(1).join('=').trim()

if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const STATEMENT = `A point moves in the $$xy$$ plane, and its trajectory is shown in the figure below.

One of the following pairs of graphs shows the time dependence of $$v_x$$ and $$v_y$$ for this motion. Select the correct pair.`

async function upload(localName, storageName) {
  const path = `fma-figures/fma-2026/${storageName}`
  const { error } = await supabase.storage.from('handout-pdfs')
    .upload(path, readFileSync(join(CROPS, localName)), { upsert: true, contentType: 'image/png' })
  if (error) throw new Error(`${storageName}: ${error.message}`)
  return supabase.storage.from('handout-pdfs').getPublicUrl(path).data.publicUrl
}

async function run() {
  const stemUrl = await upload('q3-stem.png', 'fma-2026-q03.png')
  const choiceUrls = {}
  for (const letter of ['A', 'B', 'C', 'D', 'E']) {
    choiceUrls[letter] = await upload(`q3-${letter}.png`, `fma-2026-q03-${letter.toLowerCase()}.png`)
  }

  // The choice text is dead once a panel exists -- both the runner and the
  // review page prefer choice_figure_urls -- but blank it so nothing stale is
  // left behind if a panel ever fails to load.
  const { error } = await supabase.from('fma_questions').update({
    statement: STATEMENT,
    figure_urls: [stemUrl],
    choice_figure_urls: choiceUrls,
    choices: { A: '', B: '', C: '', D: '', E: '' },
  }).eq('id', 'fma-2026-q03')
  if (error) { console.error('FAILED:', error.message); process.exit(1) }

  console.log('✓ fma-2026-q03: stem figure + 5 choice panels')
}

run()
