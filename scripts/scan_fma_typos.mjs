// Scan the crypt exam sources for likely prose typos the per-exam reviews may
// have missed: doubled words, run-together words, and a few known misspellings.
// Prose only -- math is stripped first, since "$t t$" and the like are fine.
//
// Usage: node scripts/scan_fma_typos.mjs

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const FILES = ['raw-175-9207.tex', 'raw-175-9208.tex', 'raw-191-11108.tex', 'raw-191-11254.tex']

// Remove math and asy so we only look at English.
function prose(s) {
  return s
    .replace(/\[asy\][\s\S]*?\[\/asy\]/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\\\[[\s\S]*?\\\]/g, ' ')
    .replace(/\$[^$]*\$/g, ' ')
    .replace(/\\begin\{align\*?\}[\s\S]*?\\end\{align\*?\}/g, ' ')
}

const MISSPELLINGS = [
  'doesno', 'principal of virtual', 'is heater', 'motion at conserves',
  'there are so ', 'Then then', 'There power', 'in not vertical',
  'will small', 'the from the', 'teh ', 'adn ', 'recieve', 'seperate',
  'occured', 'neccessary', 'consistant', 'independant', 'it is is',
]

for (const f of FILES) {
  const raw = readFileSync(join(ROOT, 'work/crypt', f), 'utf8')
  const text = prose(raw)
  const found = []

  // Report doubled words against the RAW text so the line number and surrounding
  // context are usable; matching on stripped prose alone loses both.
  for (const m of raw.matchAll(/\b([A-Za-z]{2,})\s+\1\b/gi)) {
    const before = raw.slice(Math.max(0, m.index - 70), m.index)
    const after = raw.slice(m.index, m.index + 90)
    const line = raw.slice(0, m.index).split('\n').length
    found.push(`doubled "${m[0].replace(/\s+/g, ' ')}" line ${line}: ...${(before + after).replace(/\s+/g, ' ')}...`)
  }
  for (const pat of MISSPELLINGS) {
    let i = raw.indexOf(pat)
    while (i !== -1) {
      found.push(`"${pat.trim()}" at line ${raw.slice(0, i).split('\n').length}`)
      i = raw.indexOf(pat, i + 1)
    }
  }
  for (const m of raw.matchAll(/([^\\[\]=]{4,40})\\approx\s*([^\\[\]]{4,40})/g)) {
    if (m[1].trim() === m[2].trim().replace(/\.$/, '')) {
      found.push(`degenerate approx: "${m[0].trim().slice(0, 70)}"`)
    }
  }

  console.log(`\n=== ${f} ===`)
  if (!found.length) console.log('  (nothing flagged)')
  for (const x of [...new Set(found)]) console.log('  ' + x)
}
