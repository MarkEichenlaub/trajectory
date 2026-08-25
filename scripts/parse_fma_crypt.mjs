// Parse the AoPS crypt PhysicsWOOT practice-exam sources in work/crypt/*.tex into
// structured JSON: one record per question with statement, choices, solution, the
// [asy] figure sources, and any \includegraphics references.
//
// Source format is \FMAproblem{QUESTION}{CHOICES}{SOLUTION}, where CHOICES is
// normally an enumerate list of five \item entries. A few problems carry their
// choices as an image instead, in which case CHOICES is empty or is a bare
// \includegraphics -- those are flagged rather than guessed at.
//
// Usage: node scripts/parse_fma_crypt.mjs [--dump <examKey>]

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

export const EXAMS = [
  { key: 'fma-pwoot1-p1', file: 'raw-175-9207.tex', name: 'PhysicsWOOT 1 Practice F=ma Exam 1', collection: 175, doc: 9207 },
  { key: 'fma-pwoot1-p2', file: 'raw-175-9208.tex', name: 'PhysicsWOOT 1 Practice F=ma Exam 2', collection: 175, doc: 9208 },
  { key: 'fma-pwoot2-p1', file: 'raw-191-11108.tex', name: 'PhysicsWOOT 2 Practice F=ma Exam 1', collection: 191, doc: 11108 },
  { key: 'fma-pwoot2-p2', file: 'raw-191-11254.tex', name: 'PhysicsWOOT 2 Practice F=ma Exam 2', collection: 191, doc: 11254 },
]

// Read one {...} group starting at `open` (which must index a '{'). Returns the
// inner text and the index just past the closing brace. Honours \{ and \} escapes.
function readGroup(s, open) {
  if (s[open] !== '{') throw new Error(`expected { at ${open}, got ${JSON.stringify(s.slice(open, open + 20))}`)
  let depth = 0
  for (let i = open; i < s.length; i++) {
    const c = s[i]
    if (c === '\\') { i++; continue }        // skip escaped char
    if (c === '{') depth++
    else if (c === '}') { depth--; if (depth === 0) return { body: s.slice(open + 1, i), end: i + 1 } }
  }
  throw new Error(`unbalanced group from ${open}`)
}

function skipWs(s, i) { while (i < s.length && /\s/.test(s[i])) i++; return i }

export function parseExam(text) {
  const out = []
  const RE = /\\FMAproblem\s*\{/g
  let m
  while ((m = RE.exec(text)) !== null) {
    const openQ = m.index + m[0].length - 1
    // The template comment mentions \FMAproblem{QUESTION TEXT}{...} -- skip it.
    const peek = text.slice(openQ + 1, openQ + 14)
    if (peek.startsWith('QUESTION TEXT')) continue

    let g1, g2, g3
    try {
      g1 = readGroup(text, openQ)
      const i2 = skipWs(text, g1.end)
      g2 = readGroup(text, i2)
      const i3 = skipWs(text, g2.end)
      g3 = readGroup(text, i3)
    } catch (e) {
      out.push({ error: e.message, at: m.index })
      continue
    }
    RE.lastIndex = g3.end
    out.push(buildRecord(g1.body, g2.body, g3.body))
  }
  return out
}

// Pull [asy]...[/asy] blocks out of a chunk, returning the stripped text + sources.
function extractAsy(s) {
  const figures = []
  const stripped = s.replace(/\[asy\]([\s\S]*?)\[\/asy\]/g, (_, code) => {
    figures.push(code.trim())
    return '\n{{FIGURE}}\n'
  })
  return { text: stripped, figures }
}

function extractImages(s) {
  const images = []
  const stripped = s.replace(/\\includegraphics(?:\[[^\]]*\])?\{([^}]*)\}/g, (_, path) => {
    images.push(path.trim())
    return '\n{{IMAGE}}\n'
  })
  return { text: stripped, images }
}

function splitChoices(raw) {
  // Strip the enumerate/itemize wrapper, then split on top-level \item.
  const inner = raw
    .replace(/\\begin\{(enumerate|itemize)\}/, '')
    .replace(/\\end\{(enumerate|itemize)\}\s*$/, '')
  if (!/\\item/.test(inner)) return null
  const parts = []
  const RE = /\\item\b/g
  const idx = []
  let m
  while ((m = RE.exec(inner)) !== null) idx.push(m.index + m[0].length)
  for (let i = 0; i < idx.length; i++) {
    const end = i + 1 < idx.length ? inner.lastIndexOf('\\item', idx[i + 1]) : inner.length
    parts.push(inner.slice(idx[i], end).trim())
  }
  return parts
}

function buildRecord(qRaw, cRaw, sRaw) {
  const q = extractImages(extractAsy(qRaw).text)
  const qAsy = extractAsy(qRaw).figures
  const s = extractImages(extractAsy(sRaw).text)
  const sAsy = extractAsy(sRaw).figures

  const cAsy = extractAsy(cRaw).figures
  const cImg = extractImages(cRaw).images
  const choices = splitChoices(cRaw)

  // The answer is normally the last \boxed{...} in the solution.
  const boxes = [...sRaw.matchAll(/\\boxed\s*\{/g)].map(mm => {
    try { return readGroup(sRaw, mm.index + mm[0].length - 1).body.trim() } catch { return null }
  }).filter(Boolean)

  return {
    statement: q.text.trim(),
    statement_figures: qAsy,
    statement_images: q.images,
    choices,
    choices_raw: cRaw.trim(),
    choice_figures: cAsy,
    choice_images: cImg,
    solution: s.text.trim(),
    solution_figures: sAsy,
    solution_images: s.images,
    boxed: boxes,
  }
}

function main() {
  mkdirSync(join(ROOT, 'work/crypt/parsed'), { recursive: true })
  const summary = []
  for (const ex of EXAMS) {
    const text = readFileSync(join(ROOT, 'work/crypt', ex.file), 'utf8')
    const qs = parseExam(text)
    const errs = qs.filter(q => q.error)
    writeFileSync(join(ROOT, 'work/crypt/parsed', `${ex.key}.json`), JSON.stringify({ ...ex, questions: qs }, null, 1))
    summary.push({
      key: ex.key,
      n: qs.length,
      errors: errs.length,
      noChoices: qs.filter(q => !q.choices).length,
      badChoiceCount: qs.filter(q => q.choices && q.choices.length !== 5).length,
      noBoxed: qs.filter(q => !q.error && q.boxed.length === 0).length,
      stmtFigs: qs.reduce((a, q) => a + (q.statement_figures?.length || 0), 0),
      solFigs: qs.reduce((a, q) => a + (q.solution_figures?.length || 0), 0),
      choiceFigs: qs.reduce((a, q) => a + (q.choice_figures?.length || 0), 0),
      images: qs.reduce((a, q) => a + (q.statement_images?.length || 0) + (q.choice_images?.length || 0), 0),
    })
  }
  console.table(summary)
}

if (process.argv[1] && process.argv[1].endsWith('parse_fma_crypt.mjs')) main()
