// Deterministic prepass over the refreshed exam sources, before the editorial
// (judgment) pass:
//
//   1. l -> \ell wherever `l` is a math variable, including [asy] label
//      strings. Masked replacement: contents of \text-ish macros, all control
//      sequences (\ell, \left, \label...), and asy code identifiers are
//      untouched. Exception: v_l in 191-11254 q23 abbreviates "liner", not a
//      length, and stays.
//   2. \setlength{\itemsep}{4pt} after \begin{enumerate} in every CHOICES
//      argument, so tall fractions in adjacent options don't collide.
//   3. Leftover typos found in the refreshed text: "consequence of inverse
//      square law" (missing "the", 175-9207), "of the way the from the tip"
//      (stray "the", 191-11108).
//   4. 191-11108 q25: restore the dropped length in the boxed roots
//      (0.0670 -> 0.0670\,\ell etc.), which Mark's manual pass missed.
//
// Writes work/crypt/fixed/<doc>.tex. Editorial agents then work on those.
//
// Usage: node scripts/apply_mechanical_fixes.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { locate } from './show_fma_problem.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC = join(ROOT, 'work/crypt/refreshed')
const OUT = join(ROOT, 'work/crypt/fixed')

const DOCS = ['175-9207', '175-9208', '190-10427', '191-11108', '191-11254']

// ---- l -> \ell ------------------------------------------------------------
function maskNonVariable(span) {
  const blank = m => ' '.repeat(m.length)
  let t = span
  t = t.replace(/\\(text|mathrm|textbf|mathbf|mathit|operatorname|textrm|mbox)\s*\{[^{}]*\}/g, blank)
  t = t.replace(/\\[a-zA-Z]+/g, blank)
  return t
}

// Replace bare-l tokens inside one math span, honouring the doc-specific skip.
function ellInSpan(span, skipRe) {
  const masked = maskNonVariable(span)
  let out = ''
  let last = 0
  for (const m of masked.matchAll(/(?<![A-Za-z])l(?![A-Za-z])/g)) {
    if (skipRe) {
      const before = span.slice(Math.max(0, m.index - 3), m.index + 1)
      if (skipRe.test(before)) continue
    }
    out += span.slice(last, m.index) + '\\ell'
    last = m.index + 1
  }
  return out + span.slice(last)
}

// Apply ell conversion across a whole document: math spans in prose, and $..$
// fragments inside asy label("...") strings.
function convertEll(text, skipRe) {
  // Protect asy blocks first; handle their label strings separately.
  const asyBlocks = []
  let t = text.replace(/\[asy\][\s\S]*?\[\/asy\]/g, m => {
    const fixed = m.replace(/label\s*\(\s*((?:rotate\([^)]*\)\s*\*\s*)?(?:scale\([^)]*\)\s*\*\s*)?)"([^"]*)"/g,
      (whole, prefix, str) => {
        const s = str.replace(/\$([^$]*)\$/g, (mm, inner) => '$' + ellInSpan(inner, skipRe) + '$')
        return whole.slice(0, whole.length - str.length - 1) + s + '"'
      })
    asyBlocks.push(fixed)
    return `${asyBlocks.length - 1}`
  })
  // Math spans in the remaining prose.
  t = t.replace(/\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^$]+\$/g, span => ellInSpan(span, skipRe))
  t = t.replace(/\\begin\{align\*?\}[\s\S]*?\\end\{align\*?\}/g, span => ellInSpan(span, skipRe))
  // Restore asy blocks.
  t = t.replace(/(\d+)/g, (_, i) => asyBlocks[Number(i)])
  return t
}

// ---- itemsep in choices ---------------------------------------------------
function addItemsep(text) {
  const probs = locate(text)
  // Work back-to-front so offsets stay valid.
  let out = text
  for (let i = probs.length - 1; i >= 0; i--) {
    const c = probs[i].c
    const rel = out.slice(c.start + 1, c.end - 1)
    if (/\\begin\{enumerate\}/.test(rel) && !/\\itemsep/.test(rel)) {
      const fixed = rel.replace(/\\begin\{enumerate\}/, '\\begin{enumerate}\\setlength{\\itemsep}{4pt}')
      out = out.slice(0, c.start + 1) + fixed + out.slice(c.end - 1)
    }
  }
  return out
}

// ---- targeted fixes -------------------------------------------------------
const TARGETED = {
  '175-9207': [
    ['A consequence of inverse square law in', 'A consequence of the inverse square law in'],
  ],
  '191-11108': [
    ['$\\dfrac23$ of the way the from the tip', '$\\dfrac23$ of the way from the tip'],
    // q25: restore the dropped length; the ell pass has already converted
    // l -> \ell inside these spans by the time we run (targeted fixes go last).
    ['\\approx 0.0670}.$$', '\\approx 0.0670\\,\\ell}.$$'],
    ['$$x_1 \\approx 0.9330$$', '$$x_1 = \\ell \\left(\\dfrac12 + \\dfrac{\\sqrt{3}}{4}\\right) \\approx 0.9330\\,\\ell$$'],
  ],
}

mkdirSync(OUT, { recursive: true })
const report = []
for (const doc of DOCS) {
  const original = readFileSync(join(SRC, doc + '.tex'), 'utf8')
  const skipRe = doc === '191-11254' ? /v_\{?l$/ : null
  let text = convertEll(original, skipRe)
  text = addItemsep(text)
  for (const [oldS, newS] of TARGETED[doc] || []) {
    const n = text.split(oldS).length - 1
    if (n !== 1) throw new Error(`${doc}: expected 1x ${JSON.stringify(oldS.slice(0, 50))}, found ${n}`)
    text = text.replace(oldS, () => newS)
  }
  writeFileSync(join(OUT, doc + '.tex'), text)
  const nEll = (text.match(/\\ell\b/g) || []).length - (original.match(/\\ell\b/g) || []).length
  report.push({ doc, newEll: nEll, itemseps: (text.match(/\\itemsep/g) || []).length, bytes: text.length })
}
console.table(report)
