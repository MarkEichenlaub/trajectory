// Print the EXACT source text of a given problem from a crypt exam .tex, with
// byte offsets, so reported typos can be checked against the real source rather
// than against a paraphrase of it.
//
// Usage:
//   node scripts/show_fma_problem.mjs <docFile> <n> [--part q|c|s|all]
//   node scripts/show_fma_problem.mjs raw-175-9207.tex 3
//   node scripts/show_fma_problem.mjs raw-175-9207.tex 3 --part s

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function readGroup(s, open) {
  let depth = 0
  for (let i = open; i < s.length; i++) {
    const c = s[i]
    if (c === '\\') { i++; continue }
    if (c === '{') depth++
    else if (c === '}') { depth--; if (depth === 0) return { body: s.slice(open + 1, i), start: open, end: i + 1 } }
  }
  throw new Error('unbalanced')
}
const skipWs = (s, i) => { while (i < s.length && /\s/.test(s[i])) i++; return i }

export function locate(text) {
  const out = []
  const RE = /\\FMAproblem\s*\{/g
  let m
  while ((m = RE.exec(text)) !== null) {
    const openQ = m.index + m[0].length - 1
    if (text.slice(openQ + 1, openQ + 14).startsWith('QUESTION TEXT')) continue
    const g1 = readGroup(text, openQ)
    const g2 = readGroup(text, skipWs(text, g1.end))
    const g3 = readGroup(text, skipWs(text, g2.end))
    out.push({ macroStart: m.index, q: g1, c: g2, s: g3, end: g3.end })
    RE.lastIndex = g3.end
  }
  return out
}

if (process.argv[1] && process.argv[1].endsWith('show_fma_problem.mjs')) {
  const [file, nRaw] = process.argv.slice(2)
  const partIdx = process.argv.indexOf('--part')
  const part = partIdx >= 0 ? process.argv[partIdx + 1] : 'all'
  const text = readFileSync(join(ROOT, 'work/crypt', file), 'utf8')
  const probs = locate(text)
  const n = Number(nRaw)
  const p = probs[n - 1]
  if (!p) { console.error(`no problem ${n} (found ${probs.length})`); process.exit(1) }
  console.log(`=== ${file} problem ${n}  [macro at byte ${p.macroStart}, ends ${p.end}] ===`)
  if (part === 'all' || part === 'q') console.log('\n--- QUESTION ---\n' + p.q.body)
  if (part === 'all' || part === 'c') console.log('\n--- CHOICES ---\n' + p.c.body)
  if (part === 'all' || part === 's') console.log('\n--- SOLUTION ---\n' + p.s.body)
}
