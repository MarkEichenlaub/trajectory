// Did Mark's manual application of the PATCHES/SOLUTION-REWRITES land?
// For each fix from the earlier round: OLD text still present -> not applied;
// NEW text present -> applied; neither -> he worded it differently (eyeball it).
//
// Usage: node scripts/check_patches_landed.mjs

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const FIXES = {
  '175-9207': [
    ['v_f = 83.3', 'v_f = 88.3'],
    ['6938.89 = 2730a', '7796.89 = 2730a'],
    ['\\dfrac 2{mv}{l}', '\\dfrac{2mv}{l}'],
    ['there are so forces', 'there are no forces'],
    ['consequence of the above facts', 'consequence of the inverse square law'],
    ['and and come to rest', 'and come to rest'],
    // solution rewrites
    ['1$\\times$1 square', 'rectangle of width'],
    ['2.856 m/s$^2$', '2.856 \\;\\mathrm{m/s^2}'],
  ],
  '175-9208': [
    ['The spring is all the way stretched at the moment', 'If the spring is all the way stretched'],
    ['We multiply $\\dfrac{m}{I}$ by 4', 'We divide $\\dfrac{m}{I}$ by 4'],
    ['There power is positive', 'The power is positive'],
    ['Then then for satellites', 'Then for satellites'],
  ],
  '191-11108': [
    ['motion at conserves', 'motion that conserves'],
    ['\\approx -Mga\\sin\\theta.', '\\approx -Mga\\theta.'],
    ['The the cable', 'The cable striking'],
    ['that that slow plane', 'that the slow plane'],
    ['beaker is heater', 'beaker is heated'],
    ['the from the tip', 'of the way from the tip'],
    ['principal of virtual', 'principle of virtual'],
    ['doesno work', 'does no work'],
    ['\\frac{1}{S_1}\\right) \\rho g l', '\\frac{1}{S_1}\\right)^{-1} \\rho g l'],
    // solution rewrite (q25 ell answer)
    ['\\approx 0.0670}', '\\approx 0.0670\\,l}'],
  ],
  '191-11254': [
    ['\\sqrt{3}{2}M', '\\dfrac{\\sqrt{3}}{2}M'],
    ['in water in not vertical', 'in water is not vertical'],
    ['filled in in red', 'filled in red'],
    ['spring will small', 'spring will be small'],
    ['\\dfrac{L+\\Delta L}{L}', '\\dfrac{L}{L+\\Delta L}'],
    ["\\dfrac{F^2}{4T'^2}", "\\dfrac{F^2}{8T'^2}"],
    ["{4T'^2} > F .", "{8T'^2} > \\dfrac{F}{2}"],
  ],
}

for (const [doc, pairs] of Object.entries(FIXES)) {
  const t = readFileSync(join(ROOT, 'work/crypt/refreshed', doc + '.tex'), 'utf8')
  const issues = []
  for (const [oldS, newS] of pairs) {
    const o = t.includes(oldS)
    const n = t.includes(newS)
    if (o) issues.push('NOT APPLIED (old text remains): ' + oldS.slice(0, 55))
    else if (!n) issues.push('WORDED DIFFERENTLY?: expected ' + newS.slice(0, 55))
  }
  console.log(`== ${doc}: ${pairs.length - issues.length}/${pairs.length} confirmed`)
  for (const i of issues) console.log('   ' + i)
}
