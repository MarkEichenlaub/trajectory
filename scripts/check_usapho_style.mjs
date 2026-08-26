// Style checker for the Practice USAPhO problems documents.
//
// Same rules as check_exam_style minus the multiple-choice-specific ones:
// these are free-response, so \boxed marks FINAL ANSWERS (kept, one or more
// per multi-part problem) rather than a choice-letter opener.
//
//   ELL     l as a math variable (should be \ell), incl. asy labels
//   CHAIN   equation with 2+ top-level = (use aligned)
//   PUNCT   display equation not ending in . or ,
//   UNITS   numeric substitution without units
//   TYPO    doubled words / known misspellings
//   HEAD    part headings mixing \subsection* and \subsubsection* in one doc
//
// Usage: node scripts/check_usapho_style.mjs <dir> [--only 175-9209] [--detail]

import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const dir = process.argv[2] || 'work/crypt/usapho'
const only = (() => { const i = process.argv.indexOf('--only'); return i >= 0 ? process.argv[i + 1] : null })()
const DETAIL = process.argv.includes('--detail')

// ---------- USAPhO problem/solution parser ----------
function readGroup(s, open) {
  let depth = 0
  for (let i = open; i < s.length; i++) {
    const c = s[i]
    if (c === '\\') { i++; continue }
    if (c === '{') depth++
    else if (c === '}') { depth--; if (depth === 0) return { body: s.slice(open + 1, i), end: i + 1 } }
  }
  throw new Error('unbalanced group at ' + open)
}
const skipWs = (s, i) => { while (i < s.length && /\s/.test(s[i])) i++; return i }

export function locateUsapho(text) {
  const out = []
  const RE = /\\USAPhO(problem|solution)\s*\{/g
  let m
  while ((m = RE.exec(text)) !== null) {
    const kind = m[1]
    const g1 = readGroup(text, m.index + m[0].length - 1)     // part letter
    const g2 = readGroup(text, skipWs(text, g1.end))          // number
    const g3 = readGroup(text, skipWs(text, g2.end))          // body
    out.push({ kind, part: g1.body, num: g2.body, body: g3.body, start: m.index, end: g3.end })
    RE.lastIndex = g3.end
  }
  return out
}

// ---------- rule helpers (shared logic with check_exam_style) ----------
const stripAsy = s => s.replace(/\[asy\][\s\S]*?\[\/asy\]/g, ' ')
function maskNonVariable(span) {
  const blank = m => ' '.repeat(m.length)
  return span
    .replace(/\\(text|mathrm|textbf|mathbf|mathit|operatorname|textrm|mbox)\s*\{[^{}]*\}/g, blank)
    .replace(/\\[a-zA-Z]+/g, blank)
}
function mathSpans(s) {
  const spans = []
  for (const m of s.matchAll(/\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^$]+\$/g)) spans.push(m[0])
  for (const m of s.matchAll(/\\begin\{align\*?\}[\s\S]*?\\end\{align\*?\}/g)) spans.push(m[0])
  return spans
}
function ellViolations(body) {
  const out = []
  for (const span of mathSpans(stripAsy(body))) {
    const masked = maskNonVariable(span)
    for (const m of masked.matchAll(/(?<![A-Za-z])l(?![A-Za-z])/g)) {
      out.push(span.slice(Math.max(0, m.index - 15), m.index + 15).replace(/\s+/g, ' '))
    }
  }
  for (const asy of body.matchAll(/\[asy\]([\s\S]*?)\[\/asy\]/g)) {
    for (const lab of asy[1].matchAll(/label\s*\(\s*(?:rotate\([^)]*\)\s*\*\s*)?(?:scale\([^)]*\)\s*\*\s*)?"([^"]*)"/g)) {
      for (const mm of lab[1].matchAll(/\$([^$]*)\$/g)) {
        if (/(?<![A-Za-z])l(?![A-Za-z])/.test(maskNonVariable(mm[1]))) out.push('asy: ' + lab[1])
      }
    }
  }
  return out
}
function chainViolations(body) {
  const out = []
  for (const span of mathSpans(stripAsy(body))) {
    if (/\\begin\{aligned\}/.test(span)) continue
    const inner = span.replace(/^\$\$|\$\$$|^\\\[|\\\]$|^\$|\$$/g, '')
    let depth = 0, eq = 0
    for (let i = 0; i < inner.length; i++) {
      const c = inner[i]
      if (c === '\\') { i++; continue }
      if (c === '{') depth++
      else if (c === '}') depth--
      else if (c === '=' && depth === 0) eq++
    }
    if (eq >= 2) out.push(span.replace(/\s+/g, ' ').slice(0, 90))
  }
  return out
}
function punctViolations(body) {
  const out = []
  const clean = stripAsy(body)
  for (const m of clean.matchAll(/\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g)) {
    let inner = (m[1] ?? m[2] ?? '').trim()
    if (!inner) continue
    if (/\\end\{aligned\}\s*$/.test(inner)) {
      const rows = inner.replace(/\\end\{aligned\}\s*$/, '')
      if (/[.,;][\s}\\]*$/.test(rows.trimEnd())) continue
      out.push('aligned...' + rows.replace(/\s+/g, ' ').slice(-30))
      continue
    }
    if (!/[.,;][\s}]*$/.test(inner)) out.push('...' + inner.replace(/\s+/g, ' ').slice(-30))
  }
  return out
}
const UNIT_NEAR = /\\(mathrm|text|;|,)\s*\{?\s*(kg|m|s|N|J|W|C|K|A|V|T|Pa|Hz|km|cm|mm|kN|deg|rad|eV|mol|g\b)/i
function unitViolations(sol) {
  const out = []
  for (const span of mathSpans(stripAsy(sol))) {
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
const MISSPELL = ['doesno', 'principal of', ' at conserves', 'there are so ', 'Then then', 'There power', 'will small', 'the from the', 'recieve', 'seperate', 'occured']
function typoViolations(body) {
  const out = []
  const prose = stripAsy(body).replace(/\$\$[\s\S]*?\$\$/g, ' ').replace(/\\\[[\s\S]*?\\\]/g, ' ').replace(/\$[^$]*\$/g, ' ')
  for (const m of prose.matchAll(/\b([A-Za-z]{2,})[ \t]+\1\b/g)) {
    if (/^(second)$/i.test(m[1])) continue
    out.push('doubled "' + m[0] + '"')
  }
  for (const p of MISSPELL) if (body.includes(p)) out.push(JSON.stringify(p))
  return out
}

// ---------- main ----------
if (!process.argv[1] || !process.argv[1].endsWith('check_usapho_style.mjs')) {
  // imported for locateUsapho only
} else {
runMain()
}
function runMain() {
const files = readdirSync(join(ROOT, dir)).filter(f => /^\d+-\d+\.tex$/.test(f))
  .filter(f => /\\USAPhOproblem\{/.test(readFileSync(join(ROOT, dir, f), 'utf8')))

const summary = []
for (const f of files) {
  const key = f.replace('.tex', '')
  if (only && key !== only) continue
  const text = readFileSync(join(ROOT, dir, f), 'utf8')
  const items = locateUsapho(text)
  const rows = []
  // heading-level consistency across the whole doc
  const subs = (text.match(/\\subsection\*/g) || []).length
  const subsubs = (text.match(/\\subsubsection\*/g) || []).length
  for (const it of items) {
    const id = `${it.kind[0].toUpperCase()}${it.part}${it.num}`
    const ell = ellViolations(it.body)
    const chain = chainViolations(it.body)
    const punct = punctViolations(it.body)
    const units = it.kind === 'solution' ? unitViolations(it.body) : []
    const typo = typoViolations(it.body)
    if (ell.length + chain.length + punct.length + units.length + typo.length) {
      rows.push({ id, ell: ell.length, chain: chain.length, punct: punct.length, units: units.length, typo: typo.length })
      if (DETAIL) {
        console.log(`\n### ${key} ${it.part}${it.num} (${it.kind})`)
        for (const x of ell) console.log('  ELL    ' + x)
        for (const x of chain) console.log('  CHAIN  ' + x)
        for (const x of punct) console.log('  PUNCT  ' + x)
        for (const x of units) console.log('  UNITS  ' + x)
        for (const x of typo) console.log('  TYPO   ' + x)
      }
    }
  }
  const tot = k => rows.reduce((a, r) => a + r[k], 0)
  summary.push({ doc: key, probs: items.filter(i => i.kind === 'problem').length,
    sols: items.filter(i => i.kind === 'solution').length,
    ell: tot('ell'), chain: tot('chain'), punct: tot('punct'), units: tot('units'), typo: tot('typo'),
    headMix: (subs && subsubs) ? `${subs}/${subsubs}` : '' })
}
console.table(summary)
}
