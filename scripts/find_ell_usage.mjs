// Find every use of `l` as a math variable across the four crypt exams, so it
// can be converted to \ell.
//
// A naive search for "l" is useless: the letter hides inside \left, \right,
// \label, \ell, inside \text{...} prose, inside unit macros, and all over the
// [asy] code. This strips all of those first, then reports only bare `l`
// tokens in math mode, classified by how they are used:
//
//   VAR     a standalone variable -- "$l$", "\dfrac{l}{2}", "ml^2"
//   SUB     used as a subscript label -- "v_l", "\delta_l" (may be an
//           abbreviation like "l for liner" rather than a length; needs a look)
//   PRIMED  l' or l_1 style derived names
//
// Also reports existing \ell usage, which is a collision risk: 191-11108 uses
// \ell for angular momentum per unit mass, so converting l -> \ell there would
// make two different quantities share a symbol.
//
// Usage: node scripts/find_ell_usage.mjs [--detail]

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { locate } from './show_fma_problem.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const FILES = [
  ['raw-175-9207.tex', 'PW1 Exam 1', '175/9207'],
  ['raw-175-9208.tex', 'PW1 Exam 2', '175/9208'],
  ['raw-191-11108.tex', 'PW2 Exam 1', '191/11108'],
  ['raw-191-11254.tex', 'PW2 Exam 2', '191/11254'],
]

const stripAsy = s => s.replace(/\[asy\][\s\S]*?\[\/asy\]/g, ' ')

// Math spans only -- `l` in prose is just the letter l.
function mathSpans(s) {
  const spans = []
  for (const m of s.matchAll(/\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^$]+\$/g)) spans.push(m[0])
  for (const m of s.matchAll(/\\begin\{align\*?\}[\s\S]*?\\end\{align\*?\}/g)) spans.push(m[0])
  return spans
}

// Blank out anything where an `l` is not a variable, preserving offsets so the
// surrounding context can still be quoted accurately.
function maskNonVariable(span) {
  let t = span
  const blank = m => ' '.repeat(m.length)
  // Contents of text-ish macros (prose, units, operator names).
  t = t.replace(/\\(text|mathrm|textbf|mathbf|mathit|operatorname|textrm|mbox)\s*\{[^{}]*\}/g, blank)
  // All control sequences, including \ell, \left, \right, \label...
  t = t.replace(/\\[a-zA-Z]+/g, blank)
  return t
}

const rows = []
const detail = {}
let ellExisting = []

for (const [file, label, docPath] of FILES) {
  const text = readFileSync(join(ROOT, 'work/crypt', file), 'utf8')
  const probs = locate(text)

  probs.forEach((p, i) => {
    const parts = [['statement', p.q.body], ['choices', p.c.body], ['solution', p.s.body]]
    const hits = { VAR: 0, SUB: 0, PRIMED: 0 }
    const samples = []
    let usesEll = false

    for (const [partName, body] of parts) {
      const clean = stripAsy(body)
      if (/\\ell\b/.test(clean)) usesEll = true

      for (const span of mathSpans(clean)) {
        const masked = maskNonVariable(span)
        for (const m of masked.matchAll(/(?<![A-Za-z])l(?![A-Za-z])/g)) {
          const idx = m.index
          const before = span.slice(Math.max(0, idx - 12), idx)
          const after = span.slice(idx + 1, idx + 12)
          let kind = 'VAR'
          if (/_\s*\{?\s*$/.test(before)) kind = 'SUB'
          else if (/^['_]/.test(after)) kind = 'PRIMED'
          hits[kind]++
          if (samples.length < 4) {
            samples.push(`${partName}: ...${(before + '[l]' + after).replace(/\s+/g, ' ')}...`)
          }
        }
      }
    }

    const total = hits.VAR + hits.SUB + hits.PRIMED
    if (usesEll) ellExisting.push(`${label} q${i + 1}`)
    if (total > 0) {
      rows.push({ exam: label, q: i + 1, VAR: hits.VAR, SUB: hits.SUB, PRIMED: hits.PRIMED, total, usesEll: usesEll ? 'YES' : '' })
      detail[`${label} q${i + 1}`] = samples
    }
  })
}

rows.sort((a, b) => (a.exam === b.exam ? a.q - b.q : a.exam.localeCompare(b.exam)))
console.table(rows)

const byExam = {}
for (const r of rows) byExam[r.exam] = (byExam[r.exam] || 0) + 1
console.log('\nproblems containing `l` as a math variable:')
for (const [k, v] of Object.entries(byExam)) console.log(`  ${k}: ${v}`)
console.log(`  TOTAL: ${rows.length} of 100`)
console.log(`  total occurrences: ${rows.reduce((a, r) => a + r.total, 0)}`)
console.log(`\nproblems already using \\ell (collision risk): ${ellExisting.length ? ellExisting.join(', ') : 'none'}`)

if (process.argv.includes('--detail')) {
  for (const [k, v] of Object.entries(detail)) {
    console.log(`\n### ${k}`)
    for (const s of v) console.log('  ' + s)
  }
}
