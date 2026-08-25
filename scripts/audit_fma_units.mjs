// Audit the crypt exam solutions for the quality problem in 175-9207 Q3:
// arithmetic carried out on naked numbers, with units appearing only (if at all)
// at the very end.
//
// Three separate defects are detected, since a solution can have any of them:
//
//   BARE   a physical quantity is assigned or substituted as a number with no
//          unit -- "$v_f = 83.3$", "$$6938.89 = 2730a$$"
//   CHAIN  an equality chain that is dimensionally false because the unit is
//          attached only at the end -- "199920 = 199.9 \; \mathrm{kN}"
//   TEXT   units set as prose or with an ad-hoc exponent instead of \mathrm --
//          "2.856 m/s$^2$"
//
// Symbolic solutions (most of these exams) have no numeric substitution at all
// and are correctly reported clean. Dimensionless numbers are excluded: small
// integer coefficients, fractions, exponents, powers of ten, percentages,
// angles in degrees, and anything already carrying a unit macro.
//
// Usage: node scripts/audit_fma_units.mjs [--detail <file> <n>]

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { locate } from './show_fma_problem.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const FILES = [
  ['raw-175-9207.tex', 'PW1 Exam 1'],
  ['raw-175-9208.tex', 'PW1 Exam 2'],
  ['raw-191-11108.tex', 'PW2 Exam 1'],
  ['raw-191-11254.tex', 'PW2 Exam 2'],
]

// Anything that marks a number as carrying a unit.
const UNIT_NEAR = /\\(mathrm|text|;|,|mathit)\s*\{?\s*(kg|m|s|N|J|W|C|K|A|V|T|Pa|Hz|km|cm|mm|nmi|kt|kN|MN|mN|g\b|rad|deg)/i
const UNIT_WORD = /\b(kg|m\/s|km|cm|mm|meters?|metres?|seconds?|kilograms?|newtons?|joules?|watts?|nautical|knots?|degrees?)\b/i

function stripAsy(s) { return s.replace(/\[asy\][\s\S]*?\[\/asy\]/g, ' ') }

// Pull the math spans out of a solution; only there does substitution happen.
function mathSpans(s) {
  const out = []
  for (const m of s.matchAll(/\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^$]+\$/g)) out.push(m[0])
  for (const m of s.matchAll(/\\begin\{align\*?\}[\s\S]*?\\end\{align\*?\}/g)) out.push(m[0])
  return out
}

// A number that plausibly denotes a physical magnitude: has a decimal point, or
// is >=3 digits, or uses a thousands comma. Bare small integers are almost
// always coefficients, so they are not evidence of the defect.
// --min <n> lowers the plain-integer digit threshold. Default 3; pass 2 to also
// consider two-digit values, which catches "$v = 50$" at the cost of a lot of
// coefficient noise.
const MIN_DIGITS = (() => {
  const i = process.argv.indexOf('--min')
  return i >= 0 ? Number(process.argv[i + 1]) : 3
})()
const MAGNITUDE = new RegExp(
  String.raw`(?<![\d.])(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+|\d{${MIN_DIGITS},})(?![\d.])`, 'g')

function analyseSpan(span) {
  const findings = []
  // Remove constructs whose numbers are inherently dimensionless.
  const cleaned = span
    .replace(/\\d?frac\s*\{[^{}]*\}\s*\{[^{}]*\}/g, ' ')   // \frac{..}{..}
    .replace(/\\d?frac\s*\d\s*\d/g, ' ')                    // \dfrac12
    .replace(/10\^\s*\{?-?\d+\}?/g, ' ')                    // powers of ten
    .replace(/\^\s*\{?-?[\d.]+\}?/g, ' ')                   // exponents
    .replace(/\d+\s*\\%/g, ' ')                             // percentages
    .replace(/\d+\s*\^?\\circ/g, ' ')                       // angles
    .replace(/\\times/g, ' ')

  for (const m of cleaned.matchAll(MAGNITUDE)) {
    const after = cleaned.slice(m.index + m[0].length, m.index + m[0].length + 34)
    if (UNIT_NEAR.test(after) || UNIT_WORD.test(after)) continue
    findings.push(m[1])
  }
  return findings
}

// "A = B \; \mathrm{unit}" where A and B are both plain numbers of different
// magnitude: the unit is doing work it cannot do, so the chain is false.
function chainDefect(span) {
  // matchAll only -- calling exec() first on a /g regex advances lastIndex and
  // makes the subsequent iteration skip the first match.
  const re = /(\d[\d,\.]*)\s*=\s*(\d[\d,\.]*)\s*\\[;,]?\s*\\mathrm\{/g
  const out = []
  for (const m of span.matchAll(re)) {
    const a = Number(m[1].replace(/,/g, '')), b = Number(m[2].replace(/,/g, ''))
    if (Number.isFinite(a) && Number.isFinite(b) && a !== b) out.push(`${m[1]} = ${m[2]} <unit>`)
  }
  return out
}

// Units written as prose next to a number, or with the "$^2$" exponent hack.
function textUnitDefect(sol) {
  const out = []
  const prose = sol.replace(/\$\$[\s\S]*?\$\$/g, ' ').replace(/\\\[[\s\S]*?\\\]/g, ' ')
  for (const m of prose.matchAll(/(\d+\.?\d*)\s*(m\/s|m|kg|N|J|s)\s*\$\^\s*\{?\d\}?\s*\$/g)) out.push(m[0].trim())
  for (const m of prose.matchAll(/(?<![\\{])\b(\d+\.\d+)\s+(m\/s|kg|N|J|W|km|cm)\b/g)) out.push(m[0].trim())
  return out
}

const rows = []
const detail = {}

for (const [file, label] of FILES) {
  const text = readFileSync(join(ROOT, 'work/crypt', file), 'utf8')
  const probs = locate(text)
  probs.forEach((p, i) => {
    const sol = stripAsy(p.s.body)
    const bare = []
    for (const span of mathSpans(sol)) {
      const f = analyseSpan(span)
      if (f.length) bare.push({ span: span.replace(/\s+/g, ' ').slice(0, 90), nums: f })
    }
    const chain = chainDefect(sol)
    const textUnits = textUnitDefect(sol)
    const score = bare.reduce((a, b) => a + b.nums.length, 0) + chain.length * 3 + textUnits.length
    if (score > 0) {
      rows.push({
        exam: label, q: i + 1,
        bareNums: bare.reduce((a, b) => a + b.nums.length, 0),
        falseChain: chain.length,
        textUnits: textUnits.length,
        score,
      })
      detail[`${label} q${i + 1}`] = { bare, chain, textUnits }
    }
  })
}

rows.sort((a, b) => b.score - a.score)
console.table(rows)
console.log(`solutions with at least one finding: ${rows.length} of 100`)

if (process.argv.includes('--detail')) {
  for (const [k, v] of Object.entries(detail)) {
    console.log(`\n### ${k}`)
    for (const b of v.bare) console.log(`  BARE ${JSON.stringify(b.nums)}  in  ${b.span}`)
    for (const c of v.chain) console.log(`  CHAIN ${c}`)
    for (const t of v.textUnits) console.log(`  TEXT  ${t}`)
  }
}
