// Round-4 deterministic text edits (Mark's review of the USAPhO round):
//   9209 A1: driven-wheel caveat in the problem statement.
//   11215 A5c: "considerably-higher" -> "considerably higher" (the hyphenated
//     adverb Mark flagged); A5b: gamma 349.0 -> 342.0 so n comes out 1.53,
//     aligning (b) with (a)'s 1.51 +/- 0.03 and (c/d)'s 1.51. (Solution
//     numerics are recomputed by the exam agent; verified downstream.)
//   11215 A2d: clarifying line about the ax's center of mass.
//   11108 q11 (F=ma PW2E1): specific angular momentum renamed \ell -> h to
//     end the collision with \ell-as-length in q21/q22/q24/q25. h is the
//     standard symbol for specific angular momentum and q11 has no height.
//
// Usage: node scripts/apply_round4_text.mjs

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function patch(file, pairs) {
  const p = join(ROOT, file)
  let t = readFileSync(p, 'utf8')
  for (const [oldS, newS] of pairs) {
    const n = t.split(oldS).length - 1
    if (n !== 1) throw new Error(`${file}: expected 1x ${JSON.stringify(oldS.slice(0, 60))}, found ${n}`)
    t = t.replace(oldS, () => newS)
  }
  writeFileSync(p, t)
  console.log(file, pairs.length, 'edits')
}

patch('work/crypt/usapho-fixed/175-9209.tex', [
  ['Throughout this problem, air resistance and rolling resistance can be neglected.',
   'Throughout this problem, air resistance and rolling resistance can be neglected. For part (a), assume the bicycle is rear-wheel drive and that the full weight of the bicycle and rider is supported by the rear wheel.'],
])

patch('work/crypt/usapho-fixed/191-11215.tex', [
  ['considerably-higher accuracy', 'considerably higher accuracy'],
  ['\\gamma & = 349.0^\\circ', '\\gamma & = 342.0^\\circ'],
  ['Assume that the highest-acceptable grip is half way up the length of the ax. Find the minimum length',
   'Assume that the highest-acceptable grip is half way up the length of the ax, and assume the center of mass of the ax is at the head, i.e. at the far end of the handle from the bottom of the grip. Find the minimum length'],
])

// 11108 q11: \ell -> h inside that problem only. The problem spans from its
// \FMAproblem to the next one; do a bounded replacement.
{
  const p = join(ROOT, 'work/crypt/fixed/191-11108.tex')
  let t = readFileSync(p, 'utf8')
  const start = t.indexOf('angular momentum per unit mass')
  const probStart = t.lastIndexOf('\\FMAproblem', start)
  const probEnd = t.indexOf('\\FMAproblem', start)
  if (probStart < 0 || probEnd < 0) throw new Error('q11 bounds not found')
  const before = t.slice(0, probStart)
  let q11 = t.slice(probStart, probEnd)
  const nEll = (q11.match(/\\ell\b/g) || []).length
  q11 = q11.replace(/\\ell\b/g, 'h')
  t = before + q11 + t.slice(probEnd)
  writeFileSync(p, t)
  console.log('191-11108 q11: replaced', nEll, '\\ell with h')
}
