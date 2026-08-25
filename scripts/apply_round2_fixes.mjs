// Round-2 corrections: substantive slips the style agents flagged but (per
// their no-physics-changes rule) left alone, now verified by hand, plus one
// wording bug of our own from the q1 units rewrite. Each `old` is asserted to
// occur exactly once. Applied to work/crypt/fixed/*, which then re-ports to the
// portal and re-writes to the crypt.
//
// Usage: node scripts/apply_round2_fixes.mjs

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const FIXES = {
  '175-9207': [
    // Our own q1 rewrite called the below-axis triangle "the same size" as the
    // 1x1 one; its legs are 1 s and 2 m/s^2 (that is exactly why it contributes -1).
    ['a right triangle of the same size underneath the $t$-axis',
     'a right triangle with legs $1 \\;\\mathrm{s}$ and $2 \\;\\mathrm{m/s^2}$ underneath the $t$-axis'],
  ],
  '175-9208': [
    // q6: RHS dropped the factor of R
    ['$R \\cos(45^\\circ) = \\dfrac{\\sqrt{2}}{2},$', '$R \\cos(45^\\circ) = \\dfrac{\\sqrt{2}}{2}R,$'],
  ],
  '190-10427': [
    // q7: mass of a sphere of density rho
    ['the mass is $M = \\dfrac43 \\pi r^3,$', 'the mass is $M = \\dfrac43 \\pi \\rho r^3,$'],
    // q10: lambda m' = m, so the final inequality's RHS is lambda x_2 + m
    ["\\[\\lambda x_1 < \\lambda x_2 + m'.\\]", '\\[\\lambda x_1 < \\lambda x_2 + m.\\]'],
    // q16: volume of a cube
    ['we use $V = s^2,$', 'we use $V = s^3,$'],
    // q19: the 0.1 must be squared along with its unit
    ['\\sqrt{0.1 \\;\\mathrm{cm}^2 + 0.1 \\;\\mathrm{cm}^2}',
     '\\sqrt{(0.1 \\;\\mathrm{cm})^2 + (0.1 \\;\\mathrm{cm})^2}'],
  ],
  '191-11108': [
    // q20: the formula uses M; m is defined two sentences later as M/2
    ['where $m$ is the mass of the disk. The moment of the semi-circular disk',
     'where $M$ is the mass of the disk. The moment of the semi-circular disk'],
    // q24: the depth between the disks is the string length ell (h is undefined)
    ['$$P_2 = P_1 + \\rho g h.$$', '$$P_2 = P_1 + \\rho g \\ell.$$'],
  ],
  '191-11254': [
    // q1 choice (e): "the" for "then"
    ['to infinity, the decreases asymptotically', 'to infinity, then decreases asymptotically'],
    // q21: "if" for "in"
    ['mass units if $\\mu,$', 'mass units in $\\mu,$'],
    // q17: house spacing before units
    ['$250 \\mathrm{kg}.$', '$250 \\;\\mathrm{kg}.$'],
    ['$1250 \\mathrm{kg}$', '$1250 \\;\\mathrm{kg}$'],
  ],
}

for (const [doc, pairs] of Object.entries(FIXES)) {
  let text = readFileSync(join(ROOT, 'work/crypt/fixed', doc + '.tex'), 'utf8')
  for (const [oldS, newS] of pairs) {
    const n = text.split(oldS).length - 1
    if (n !== 1) throw new Error(`${doc}: expected 1x ${JSON.stringify(oldS.slice(0, 50))}, found ${n}`)
    text = text.replace(oldS, () => newS)
  }
  writeFileSync(join(ROOT, 'work/crypt/fixed', doc + '.tex'), text)
  console.log(doc, pairs.length + ' fixes applied')
}
