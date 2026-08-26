// Mechanical prepass for the Practice USAPhO problems docs:
//   1. l -> \ell as a math variable (same masked-token rule as the F=ma pass,
//      incl. [asy] label strings; no exceptions here — Mark ruled subscript
//      l's become \ell too).
//   2. Part headings: single-letter parts appear as a mix of \subsection* and
//      \subsubsection* within the same document (PDF renders them at different
//      sizes). Normalize any \subsubsection*{<1-2 chars>} to \subsection*.
//
// Writes work/crypt/usapho-fixed/<doc>.tex for the editorial agents.
//
// Usage: node scripts/apply_usapho_mechanical.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC = join(ROOT, 'work/crypt/usapho')
const OUT = join(ROOT, 'work/crypt/usapho-fixed')

function maskNonVariable(span) {
  const blank = m => ' '.repeat(m.length)
  return span
    .replace(/\\(text|mathrm|textbf|mathbf|mathit|operatorname|textrm|mbox)\s*\{[^{}]*\}/g, blank)
    .replace(/\\[a-zA-Z]+/g, blank)
}
function ellInSpan(span) {
  const masked = maskNonVariable(span)
  let out = '', last = 0
  for (const m of masked.matchAll(/(?<![A-Za-z])l(?![A-Za-z])/g)) {
    out += span.slice(last, m.index) + '\\ell'
    last = m.index + 1
  }
  return out + span.slice(last)
}
function convertEll(text) {
  const asyBlocks = []
  let t = text.replace(/\[asy\][\s\S]*?\[\/asy\]/g, m => {
    const fixed = m.replace(/label\s*\(\s*((?:rotate\([^)]*\)\s*\*\s*)?(?:scale\([^)]*\)\s*\*\s*)?)"([^"]*)"/g,
      (whole, prefix, str) => {
        const s = str.replace(/\$([^$]*)\$/g, (mm, inner) => '$' + ellInSpan(inner) + '$')
        return whole.slice(0, whole.length - str.length - 1) + s + '"'
      })
    asyBlocks.push(fixed)
    // Explicit sentinel: a bare number here would make the restore step
    // replace every numeric literal in the document.
    return `@@ASYBLOCK${asyBlocks.length - 1}@@`
  })
  t = t.replace(/\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^$]+\$/g, span => ellInSpan(span))
  t = t.replace(/\\begin\{align\*?\}[\s\S]*?\\end\{align\*?\}/g, span => ellInSpan(span))
  return t.replace(/@@ASYBLOCK(\d+)@@/g, (_, i) => asyBlocks[Number(i)])
}

mkdirSync(OUT, { recursive: true })
const DOCS = readdirSync(SRC).filter(f => /^\d+-\d+\.tex$/.test(f))
for (const f of DOCS) {
  const original = readFileSync(join(SRC, f), 'utf8')
  const isProblems = /\\USAPhOproblem\{/.test(original)
  let text = original
  if (isProblems || /rubric/i.test(f)) text = convertEll(text)
  const heads = (text.match(/\\subsubsection\*\{[^{}]{1,2}\}/g) || []).length
  text = text.replace(/\\subsubsection\*(\{[^{}]{1,2}\})/g, '\\subsection*$1')
  writeFileSync(join(OUT, f), text)
  const nEll = (text.match(/\\ell\b/g) || []).length - (original.match(/\\ell\b/g) || []).length
  console.log(f.padEnd(15), isProblems ? 'problems' : 'other   ', 'newEll=' + nEll, 'headsFixed=' + heads)
}
