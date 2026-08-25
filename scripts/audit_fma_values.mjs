// Audit the value-matched PhysicsWOOT answer keys.
//
// Most crypt solutions box the answer VALUE rather than a choice letter, so the
// key had to be derived by matching that value against the five options. This
// re-does the match mechanically on normalised LaTeX and flags every question
// where the chosen option is NOT the closest textual match -- those are where a
// mis-keyed answer would hide.
//
// A flag is not proof of an error: equivalent forms are written differently
// (\sqrt{2} vs 2^{1/2}), and "None of the above" answers never match by string.
// It is a review queue, not a verdict.
//
// Usage: node scripts/audit_fma_values.mjs

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const KEYS = ['fma-pwoot1-p1', 'fma-pwoot1-p2', 'fma-pwoot2-p1', 'fma-pwoot2-p2']
const LETTERS = ['A', 'B', 'C', 'D', 'E']

// Collapse cosmetic LaTeX differences so two spellings of the same value compare equal.
function norm(s) {
  return String(s || '')
    .replace(/\\d?frac/g, 'frac')
    .replace(/\\(left|right|;|,|!|quad|qquad|displaystyle|text|mathrm|textbf|mathbf|emph)\b/g, '')
    .replace(/[{}$\\\s().,]/g, '')
    .toLowerCase()
}

// Longest-common-subsequence ratio: tolerant of small edits, unlike equality.
function sim(a, b) {
  if (!a || !b) return 0
  if (a === b) return 1
  const m = a.length, n = b.length
  let prev = new Array(n + 1).fill(0)
  for (let i = 1; i <= m; i++) {
    const cur = new Array(n + 1).fill(0)
    for (let j = 1; j <= n; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1])
    }
    prev = cur
  }
  return (2 * prev[n]) / (m + n)
}

const flagged = []
let audited = 0

for (const key of KEYS) {
  const mod = await import(`file://${join(ROOT, 'scripts/fma_exams', key + '.mjs').replace(/\\/g, '/')}`)
  const src = JSON.parse(readFileSync(join(ROOT, 'work/crypt/parsed', key + '.json'), 'utf8')).questions

  src.forEach((q, i) => {
    const boxed = (q.boxed || [])
    if (!boxed.length) return
    const target = norm(boxed[boxed.length - 1])
    if (!target || target.length < 2) return

    const chosen = mod.questions[i].correct
    const scores = LETTERS.map(L => ({ L, s: sim(target, norm(mod.questions[i].choices[L])) }))
    scores.sort((a, b) => b.s - a.s)
    audited++

    const best = scores[0]
    if (best.L !== chosen) {
      const chosenScore = scores.find(x => x.L === chosen).s
      flagged.push({
        q: `${key} q${i + 1}`,
        keyed: chosen,
        keyedScore: chosenScore.toFixed(2),
        bestMatch: best.L,
        bestScore: best.s.toFixed(2),
        boxed: boxed[boxed.length - 1].slice(0, 60),
      })
    }
  })
}

console.log(`value-boxed answers audited: ${audited}`)
console.log(`chosen option was not the closest string match in ${flagged.length} case(s):\n`)
console.table(flagged)
