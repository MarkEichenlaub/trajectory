// Round-3 fixes, per Mark's review:
//  1. 190-10427 q20 (disk with hole): the general formula 2r^3 g/(R^4 - 3r^4)
//     is correct, but its numeric evaluation printed 2/67. Re-derivation:
//     k = |m| g r = M g r^3/R^2, I = (M/2R^2)(R^4 - 3r^4); with r = R/4 the
//     coefficient is 8/253, so omega = 0.178 sqrt(g/R) -- still closest to
//     choice (d) 0.17. Also brace the sloppy \dfrac{r}{R}^2.
//  2. 175-9207 q10: solution says "For the wheel, I = 1/2 m r^2" where it
//     means the solid disk, and "For the hub" where it means the wheel.
//  3. 191-11254 q23: v_l -> v_\ell (subscript ell), incl. asy labels, per
//     Mark's decision that subscript l's become \ell too.
//
// Usage: node scripts/apply_round3_fixes.mjs

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const FIXES = {
  '190-10427': [
    ['$m = -M \\dfrac{r}{R}^2.$', '$m = -M \\left(\\dfrac{r}{R}\\right)^2.$'],
    ['\\[\\omega = \\sqrt{\\dfrac{2}{67} \\dfrac{g}{R}},\\]\nor\n\\[\\omega = 0.17 \\sqrt{\\dfrac{g}{R}}.\\]',
     '\\[\\omega = \\sqrt{\\dfrac{8}{253} \\dfrac{g}{R}},\\]\nor\n\\[\\omega \\approx 0.18 \\sqrt{\\dfrac{g}{R}},\\]\nwhich is closest to choice (d).'],
  ],
  '175-9207': [
    ['For the wheel, $I = \\dfrac12 mr^2.$ For the hub, the central mass doesn\'t contribute to the moment of inertia, while the moment of inertia of a hoop is $mr^2$. The hub and rim must have equal mass so the moment of inertia is $\\dfrac12 mr^2$ over all.',
     'For the solid disk, $I = \\dfrac12 mr^2.$ For the wheel, the central hub doesn\'t contribute to the moment of inertia because its radius is negligible, while the rim is a hoop with moment of inertia $m_r r^2$. The hub and rim must have equal mass so the moment of inertia is $\\dfrac12 mr^2$ overall.'],
  ],
}

for (const [doc, pairs] of Object.entries(FIXES)) {
  let text = readFileSync(join(ROOT, 'work/crypt/fixed', doc + '.tex'), 'utf8')
  for (const [oldS, newS] of pairs) {
    const n = text.split(oldS).length - 1
    if (n !== 1) throw new Error(`${doc}: expected 1x ${JSON.stringify(oldS.slice(0, 60))}, found ${n}`)
    text = text.replace(oldS, () => newS)
  }
  writeFileSync(join(ROOT, 'work/crypt/fixed', doc + '.tex'), text)
  console.log(doc, pairs.length, 'fixes')
}

// v_l -> v_\ell everywhere in 11254 (only q23 has them; text + asy labels)
{
  let text = readFileSync(join(ROOT, 'work/crypt/fixed/191-11254.tex'), 'utf8')
  const before = (text.match(/v_\{?l\}?/g) || []).length
  text = text.replace(/v_\{l\}/g, 'v_{\\ell}').replace(/v_l\b/g, 'v_\\ell')
  const after = (text.match(/v_\{?l\}?(?![a-zA-Z])/g) || []).length
  writeFileSync(join(ROOT, 'work/crypt/fixed/191-11254.tex'), text)
  console.log('191-11254: v_l converted:', before, '->', after, 'remaining')
}
