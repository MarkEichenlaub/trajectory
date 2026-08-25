// Independent cross-check of the PhysicsWOOT exam answer keys.
//
// Where the crypt solution boxes a bare CHOICE LETTER, the correct answer is not
// a judgement call -- it is stated outright. This re-derives those directly from
// work/crypt/parsed/*.json and compares against what the authored .mjs files
// claim, so a transcription slip in the key cannot pass silently.
//
// Usage: node scripts/check_fma_keys.mjs

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const KEYS = ['fma-pwoot1-p1', 'fma-pwoot1-p2', 'fma-pwoot2-p1', 'fma-pwoot2-p2']

const UP = { a: 'A', b: 'B', c: 'C', d: 'D', e: 'E', A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' }

// A boxed bare letter, allowing \text{}/\mathrm{} wrappers and (x) parens.
const WRAPPED = /^\\(?:text|mathrm|textbf|mathbf)\{\s*\(?\s*([a-eA-E])\s*\)?\s*\}\s*\.?$/
const BARE = /^\(?\s*([a-eA-E])\s*\)?\s*\.?$/

function bareLetter(boxed) {
  const s = boxed.trim().replace(/\$+$/, '').trim()
  const m = s.match(WRAPPED) || s.match(BARE)
  return m ? UP[m[1]] : null
}

const rows = []
let checked = 0
const mismatches = []

for (const key of KEYS) {
  const mod = await import(`file://${join(ROOT, 'scripts/fma_exams', key + '.mjs').replace(/\\/g, '/')}`)
  const src = JSON.parse(readFileSync(join(ROOT, 'work/crypt/parsed', key + '.json'), 'utf8')).questions

  let n = 0
  src.forEach((q, i) => {
    const letters = (q.boxed || []).map(bareLetter).filter(Boolean)
    if (!letters.length) return
    // If a solution boxes several letters, the answer is the last one stated.
    const want = letters[letters.length - 1]
    const got = mod.questions[i].correct
    checked++; n++
    if (got !== want) {
      mismatches.push(`${key} q${i + 1}: source boxes ${want}, file says ${got}  (boxed=${JSON.stringify(q.boxed)})`)
    }
  })
  rows.push({ exam: key, bareLetterQs: n, total: src.length })
}

console.table(rows)
console.log(`bare-letter answers cross-checked: ${checked}`)
console.log(`mismatches: ${mismatches.length}`)
for (const m of mismatches) console.log('  ' + m)
process.exit(mismatches.length ? 1 : 0)
