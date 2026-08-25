// Master style checker for the practice-exam problem documents.
//
// Runs every rule Mark specified against a directory of <coll>-<doc>.tex files
// and reports violations per problem. The same battery gates the fixed output
// before write-back, so "fixed" means "this reports zero".
//
// Rules:
//   ELL      `l` used as a math variable (should be \ell), incl. asy label strings
//   CHAIN    a display/inline equation with 2+ `=` at top level (use aligned)
//   PUNCT    display equation whose last content char is not . or , (and next
//            prose line does not continue the sentence in a way that forbids it)
//   BOX1st   solution does not BEGIN with \boxed{...} answer-choice statement
//   BOXLATE  \boxed appearing after the first line of the solution
//   UNITS    numeric substitution without units (from audit_fma_units logic, lite)
//   TYPO     doubled words / known misspellings in prose
//
// Usage: node scripts/check_exam_style.mjs <dir> [--only 175-9207] [--detail]

import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { locate } from './show_fma_problem.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const dir = process.argv[2] || 'work/crypt/refreshed'
const only = (() => { const i = process.argv.indexOf('--only'); return i >= 0 ? process.argv[i + 1] : null })()
const DETAIL = process.argv.includes('--detail')

const stripAsyBlocks = s => s.replace(/\[asy\][\s\S]*?\[\/asy\]/g, ' ')

// ---------- ELL ----------
function maskNonVariable(span) {
  const blank = m => ' '.repeat(m.length)
  let t = span
  t = t.replace(/\\(text|mathrm|textbf|mathbf|mathit|operatorname|textrm|mbox)\s*\{[^{}]*\}/g, blank)
  t = t.replace(/\\[a-zA-Z]+/g, blank)
  return t
}
function mathSpans(s) {
  const spans = []
  for (const m of s.matchAll(/\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^$]+\$/g)) spans.push(m[0])
  for (const m of s.matchAll(/\\begin\{align\*?\}[\s\S]*?\\end\{align\*?\}/g)) spans.push(m[0])
  return spans
}
function ellViolations(body) {
  const out = []
  for (const span of mathSpans(stripAsyBlocks(body))) {
    const masked = maskNonVariable(span)
    for (const m of masked.matchAll(/(?<![A-Za-z])l(?![A-Za-z])/g)) {
      out.push(span.slice(Math.max(0, m.index - 15), m.index + 15).replace(/\s+/g, ' '))
    }
  }
  // asy label strings: label("...$...l...$...")
  for (const asy of body.matchAll(/\[asy\]([\s\S]*?)\[\/asy\]/g)) {
    for (const lab of asy[1].matchAll(/label\s*\(\s*(?:rotate\([^)]*\)\s*\*\s*)?(?:scale\([^)]*\)\s*\*\s*)?"([^"]*)"/g)) {
      const s = lab[1]
      for (const mm of s.matchAll(/\$([^$]*)\$/g)) {
        const masked = maskNonVariable(mm[1])
        if (/(?<![A-Za-z])l(?![A-Za-z])/.test(masked)) out.push('asy: ' + s)
      }
    }
  }
  return out
}

// ---------- CHAIN ----------
// Count top-level `=` in a math span (depth 0 w.r.t. braces), ignoring aligned
// environments (their rows are fine) and \neq/\leq/\geq etc.
function chainViolations(body) {
  const out = []
  for (const span of mathSpans(stripAsyBlocks(body))) {
    if (/\\begin\{aligned\}/.test(span)) continue
    const inner = span.replace(/^\$\$|\$\$$|^\\\[|\\\]$|^\$|\$$/g, '')
    let depth = 0, eq = 0
    for (let i = 0; i < inner.length; i++) {
      const c = inner[i]
      if (c === '\\') { i++; continue }
      if (c === '{') depth++
      else if (c === '}') depth--
      else if (c === '=' && depth === 0) {
        // skip &=, <=-ish combos already excluded by \\ skip above
        eq++
      }
    }
    if (eq >= 2) out.push(span.replace(/\s+/g, ' ').slice(0, 90))
  }
  return out
}

// ---------- PUNCT ----------
// Display equations should end in . or , (closing punctuation inside the math,
// possibly inside \boxed{...}). Report those that end bare.
function punctViolations(body) {
  const out = []
  const clean = stripAsyBlocks(body)
  for (const m of clean.matchAll(/\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g)) {
    let inner = (m[1] ?? m[2] ?? '').trim()
    if (!inner) continue
    // Rule-A opener boxes take no punctuation by design.
    if (/^\\boxed\s*\{\s*\\mathrm\{\(/.test(inner)) continue
    // aligned blocks carry their punctuation on the last row, before \end.
    if (/\\end\{aligned\}\s*$/.test(inner)) {
      const rows = inner.replace(/\\end\{aligned\}\s*$/, '')
      if (/[.,;][\s}\\]*$/.test(rows.trimEnd())) continue
      out.push('aligned...' + rows.replace(/\s+/g, ' ').slice(-30))
      continue
    }
    // allow trailing } of \boxed{...} after the punctuation: "….}" or "…}."
    const tail = inner.replace(/\s+/g, ' ').slice(-25)
    const endsPunct = /[.,;][\s}]*$/.test(inner)
    if (!endsPunct) out.push('...' + tail)
  }
  return out
}

// ---------- BOX1st / BOXLATE ----------
function boxViolations(sol) {
  const out = { first: null, late: [] }
  const clean = stripAsyBlocks(sol).trim()
  // "begins with a boxed answer" = first non-space content is a math span whose
  // content starts with \boxed{\mathrm{(x)}
  const m = clean.match(/^(?:\$\$?|\\\[)\s*\\boxed\s*\{\s*\\mathrm\{\(([a-e])\)\}/)
  if (!m) out.first = clean.replace(/\s+/g, ' ').slice(0, 60)
  // any \boxed beyond the opening line
  const rest = m ? clean.slice(clean.indexOf(m[0]) + m[0].length) : clean
  for (const b of rest.matchAll(/\\boxed\b/g)) out.late.push(b.index)
  return out
}

// ---------- UNITS (lite) ----------
const UNIT_NEAR = /\\(mathrm|text|;|,)\s*\{?\s*(kg|m|s|N|J|W|C|K|A|V|T|Pa|Hz|km|cm|mm|nmi|kt|kN)/i
function unitViolations(sol) {
  const out = []
  for (const span of mathSpans(stripAsyBlocks(sol))) {
    const cleaned = span
      .replace(/\\d?frac\s*\{[^{}]*\}\s*\{[^{}]*\}/g, ' ')
      .replace(/\\d?frac\s*\d\s*\d/g, ' ')
      .replace(/10\^\s*\{?-?\d+\}?/g, ' ')
      .replace(/\^\s*\{?-?[\d.]+\}?/g, ' ')
      .replace(/\d+\s*\\%/g, ' ')
      .replace(/\d+\s*\^?\\circ/g, ' ')
    for (const m of cleaned.matchAll(/(?<![\d.])(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+|\d{3,})(?![\d.])/g)) {
      const after = cleaned.slice(m.index + m[0].length, m.index + m[0].length + 30)
      if (!UNIT_NEAR.test(after)) out.push(m[1] + ' in ' + span.replace(/\s+/g, ' ').slice(0, 60))
    }
  }
  return out
}

// ---------- TYPO ----------
const MISSPELL = ['doesno', 'principal of virtual', 'is heater', ' at conserves', 'there are so ',
  'Then then', 'There power', 'in not vertical', 'will small', 'the from the', 'Smarch']
function typoViolations(body) {
  const out = []
  const prose = stripAsyBlocks(body)
    .replace(/\$\$[\s\S]*?\$\$/g, ' ').replace(/\\\[[\s\S]*?\\\]/g, ' ').replace(/\$[^$]*\$/g, ' ')
  for (const m of prose.matchAll(/\b([A-Za-z]{2,})[ \t]+\1\b/g)) {
    if (/^(second|that)$/i.test(m[1]) && /second/.test(m[1])) continue // "second second" is legit
    out.push('doubled "' + m[0] + '"')
  }
  for (const p of MISSPELL) if (body.includes(p)) out.push(JSON.stringify(p))
  return out
}

// ---------- main ----------
const files = readdirSync(join(ROOT, dir)).filter(f => /^\d+-\d+\.tex$/.test(f))
  .filter(f => { const t = readFileSync(join(ROOT, dir, f), 'utf8'); return /\\FMAproblem\{[^Q]/.test(t) })

const summary = []
for (const f of files) {
  const key = f.replace('.tex', '')
  if (only && key !== only) continue
  const text = readFileSync(join(ROOT, dir, f), 'utf8')
  const probs = locate(text)
  const rows = []
  probs.forEach((p, i) => {
    const whole = p.q.body + '\n' + p.c.body + '\n' + p.s.body
    const ell = ellViolations(whole)
    const chain = chainViolations(whole)
    const punct = punctViolations(whole)
    const box = boxViolations(p.s.body)
    const units = unitViolations(p.s.body)
    const typo = typoViolations(whole)
    const n = { q: i + 1, ell: ell.length, chain: chain.length, punct: punct.length,
      box1st: box.first ? 1 : 0, boxlate: box.late.length, units: units.length, typo: typo.length }
    if (Object.entries(n).some(([k, v]) => k !== 'q' && v > 0)) {
      rows.push(n)
      if (DETAIL) {
        console.log(`\n### ${key} q${i + 1}`)
        for (const x of ell) console.log('  ELL    ' + x)
        for (const x of chain) console.log('  CHAIN  ' + x)
        for (const x of punct) console.log('  PUNCT  ' + x)
        if (box.first !== null) console.log('  BOX1st opens with: ' + box.first)
        for (const x of box.late) console.log('  BOXLATE at ' + x)
        for (const x of units) console.log('  UNITS  ' + x)
        for (const x of typo) console.log('  TYPO   ' + x)
      }
    }
  })
  const tot = k => rows.reduce((a, r) => a + r[k], 0)
  summary.push({ doc: key, nProbs: probs.length, flaggedQs: rows.length,
    ell: tot('ell'), chain: tot('chain'), punct: tot('punct'),
    box1st: tot('box1st'), boxlate: tot('boxlate'), units: tot('units'), typo: tot('typo') })
}
console.table(summary)
