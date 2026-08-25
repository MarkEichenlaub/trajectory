// Apply the verified typo/error corrections to the crypt exam sources.
//
// Every correction below was checked against the source by hand (not taken from
// a summary): the arithmetic ones were re-derived, and each `old` string is
// asserted to occur EXACTLY ONCE so a fix can neither silently miss nor apply
// twice.
//
// Writes two things per exam into work/crypt/corrected/:
//   <doc>-FULL.tex      the whole corrected document
//   <doc>-PATCHES.tex   only the \FMAproblem blocks that changed, for pasting
//                       one problem at a time
//
// Usage: node scripts/fix_fma_crypt_typos.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { locate } from './show_fma_problem.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'work/crypt/corrected')

const EXAMS = [
  {
    file: 'raw-175-9207.tex', doc: '175-9207',
    title: 'PhysicsWOOT 1 -- Practice F=ma Exam 1',
    url: 'https://artofproblemsolving.com/crypt/document/175/9207',
    fixes: [
      { q: 3, why: 'v_f must be 88.3 (the statement value); 83.3^2 = 6938.89 is consistent with the typo, but a = 2.856 only follows from 88.3^2 = 7796.89',
        old: '$v_f = 83.3$', new: '$v_f = 88.3$' },
      { q: 3, why: 'same error, second number: 88.3^2 = 7796.89',
        old: '$$6938.89 = 2730a$$', new: '$$7796.89 = 2730a$$' },
      { q: 12, why: 'malformed fraction: renders as (2/mv)*l instead of 2mv/l',
        old: '\\item $\\dfrac 2{mv}{l} $', new: '\\item $\\dfrac{2mv}{l} $' },
      { q: 13, why: '"so" for "no"',
        old: 'there are so forces', new: 'there are no forces' },
      { q: 19, why: '"the above facts" refers to nothing in this problem; the facts meant are the ones the next sentence varies',
        old: 'You may know that as a consequence of the above facts the shell exerts',
        new: 'You may know that as a consequence of the inverse square law and the law of superposition, the shell exerts' },
      { q: 21, why: 'doubled "and"',
        old: 'slow down and and come to rest', new: 'slow down and come to rest' },
    ],
    // Editorial rewrites, not typo fixes: solutions that do arithmetic on naked
    // numbers. Modelled on this exam's Q5, which carries units through every
    // substitution. Applied AFTER the fixes above, so `old` matches fixed text.
    rewrites: [
      { q: 3, why: 'arithmetic on unit-less numbers; "199920 = 199.9 kN" is a false equality; units set as text "m/s$^2$"',
        old: `We have $v_f = 88.3$, and $\\Delta x = 1365$, which gives us
$$7796.89 = 2730a$$
Solving for $a$, we find that the acceleration that the plane undergoes while taking off is 2.856 m/s$^2$.
Finally, we multiply by the mass of the plane to get the force exerted by its engines. We have $\\boxed{F = ma = 70,000 \\cdot 2.856 = 199920 = 199.9 \\; \\mathrm{kN}}$.`,
        new: `We have $v_f = 88.3 \\;\\mathrm{m/s}$ and $\\Delta x = 1365 \\;\\mathrm{m}$, which gives us
$$\\left(88.3 \\;\\mathrm{m/s}\\right)^2 = 2a \\left(1365 \\;\\mathrm{m}\\right).$$
Solving for $a$, the acceleration the plane undergoes while taking off is
$$a = \\dfrac{7796.89 \\;\\mathrm{m^2/s^2}}{2730 \\;\\mathrm{m}} = 2.856 \\;\\mathrm{m/s^2}.$$
Finally, we multiply by the mass of the plane to get the force exerted by its engines.
$$F = ma = 70\\,000 \\;\\mathrm{kg} \\cdot 2.856 \\;\\mathrm{m/s^2} = 199\\,920 \\;\\mathrm{N} = \\boxed{199.9 \\;\\mathrm{kN}}.$$` },
      { q: 1, why: 'graph areas computed as pure numbers; each area is an acceleration times a time and so carries units of velocity',
        old: `The first part of the integral is a 1$\\times$1 square, so it has an area of 1. The next part is a right triangle with both legs equal to 1, so its area is $\\frac 12$. The next part is a right triangle underneath the $t$-axis, so it contributes $-1$ to the total. Finally, the last area is a semicircle with radius 1, contributing $\\frac{\\pi}{2}$ to the area. In total, we have $\\frac {1+\\pi}{2} = 2.07$, so the final speed of the object is $\\boxed{2.07\\; \\mathrm{m/s}}$.`,
        new: `Each area on this graph is an acceleration multiplied by a time, so each contributes a velocity.

The first part of the integral is a rectangle of width $1 \\;\\mathrm{s}$ and height $1 \\;\\mathrm{m/s^2}$, so it contributes $1 \\;\\mathrm{m/s}$. The next part is a right triangle with legs $1 \\;\\mathrm{s}$ and $1 \\;\\mathrm{m/s^2}$, so it contributes $\\dfrac12 \\;\\mathrm{m/s}$. The next part is a right triangle of the same size underneath the $t$-axis, so it contributes $-1 \\;\\mathrm{m/s}$. Finally, the last area is a semicircle spanning $1 \\;\\mathrm{s}$ in the $t$ direction and reaching $1 \\;\\mathrm{m/s^2}$ in the $a$ direction, so it contributes $\\dfrac{\\pi}{2} \\;\\mathrm{m/s}$.

In total, the final speed of the object is
$$v = \\left(1 + \\dfrac12 - 1 + \\dfrac{\\pi}{2}\\right) \\;\\mathrm{m/s} = \\dfrac{1+\\pi}{2} \\;\\mathrm{m/s} = \\boxed{2.07\\; \\mathrm{m/s}}.$$` },
    ],
  },
  {
    file: 'raw-175-9208.tex', doc: '175-9208',
    title: 'PhysicsWOOT 1 -- Practice F=ma Exam 2',
    url: 'https://artofproblemsolving.com/crypt/document/175/9208',
    fixes: [
      { q: 18, why: 'missing "If" makes it a run-on; the next sentence has the parallel "If ..." form',
        old: "The spring is all the way stretched at the moment the spring constant changes, the spring's potential energy changes.",
        new: "If the spring is all the way stretched at the moment the spring constant changes, the spring's potential energy changes." },
      { q: 20, why: 'm/I scales as L^-2, so doubling the size DIVIDES it by 4; multiplied by l -> 2 gives the (correct) boxed 1/2',
        old: 'We multiply $\\dfrac{m}{I}$ by 4 because its dimensions are $L^2,$',
        new: 'We divide $\\dfrac{m}{I}$ by 4 because its dimensions are $L^{-2},$' },
      { q: 21, why: '"There" for "The"',
        old: 'There power is positive', new: 'The power is positive' },
      { q: 23, why: 'doubled "then"',
        old: 'Then then for satellites', new: 'Then for satellites' },
    ],
  },
  {
    file: 'raw-191-11108.tex', doc: '191-11108',
    title: 'PhysicsWOOT 2 -- Practice F=ma Exam 1',
    url: 'https://artofproblemsolving.com/crypt/document/191/11108',
    fixes: [
      { q: 2, why: '"at" for "that"',
        old: 'this is the only possible motion at conserves linear momentum.',
        new: 'this is the only possible motion that conserves linear momentum.' },
      { q: 9, why: 'both sides of the approx are identical; the small-angle form is the point',
        old: '\\[\\tau = -Mga\\sin\\theta \\approx -Mga\\sin\\theta.\\]',
        new: '\\[\\tau = -Mga\\sin\\theta \\approx -Mga\\theta.\\]' },
      { q: 16, why: 'doubled "the"',
        old: 'The the cable striking the floor', new: 'The cable striking the floor' },
      { q: 17, why: '"that that" for "that the"',
        old: 'the consideration that that slow plane begins',
        new: 'the consideration that the slow plane begins' },
      { q: 19, why: '"heater" for "heated"',
        old: 'regardless of which beaker is heater,', new: 'regardless of which beaker is heated,' },
      { q: 20, why: 'missing "of the way"',
        old: 'The center of mass of a triangle is $\\dfrac23$ the from the tip to the base',
        new: 'The center of mass of a triangle is $\\dfrac23$ of the way from the tip to the base' },
      { q: 24, why: '"principal" for "principle"',
        old: 'the principal of virtual work', new: 'the principle of virtual work' },
      { q: 24, why: 'run-together "doesno"',
        old: 'atmospheric pressure doesno work', new: 'atmospheric pressure does no work' },
      { q: 24, why: 'missing inverse: solving rho*g*l + T/S1 - T/S2 = 0 gives T = (1/S2 - 1/S1)^-1 rho g l, which equals the boxed S1 S2/(S1-S2) rho g l',
        old: '\\[T = \\left(\\frac{1}{S_2} - \\frac{1}{S_1}\\right) \\rho g l\\]',
        new: '\\[T = \\left(\\frac{1}{S_2} - \\frac{1}{S_1}\\right)^{-1} \\rho g l\\]' },
    ],
    rewrites: [
      { q: 25, why: 'the length $l$ is dropped in the numeric step, so the boxed answer reads as a bare number; the choices are all multiples of $l$. Second root also given only numerically',
        old: `$$\\boxed{x_1 = l \\left(\\dfrac12 - \\dfrac{\\sqrt{3}}{4}\\right) \\approx 0.0670}.$$
$$x_1 \\approx 0.9330$$`,
        new: `$$\\boxed{x_1 = l \\left(\\dfrac12 - \\dfrac{\\sqrt{3}}{4}\\right) \\approx 0.0670\\,l}.$$
$$x_1 = l \\left(\\dfrac12 + \\dfrac{\\sqrt{3}}{4}\\right) \\approx 0.9330\\,l$$` },
    ],
  },
  {
    file: 'raw-191-11254.tex', doc: '191-11254',
    title: 'PhysicsWOOT 2 -- Practice F=ma Exam 2',
    url: 'https://artofproblemsolving.com/crypt/document/191/11254',
    fixes: [
      { q: 11, why: 'malformed fraction: renders as sqrt(3)*2M. Intent inferred as (sqrt3/2)M from the sibling choices -- CONFIRM',
        old: '\\item $\\sqrt{3}{2}M$', new: '\\item $\\dfrac{\\sqrt{3}}{2}M$' },
      { q: 22, why: '"in" for "is"',
        old: 'when floating in water in not vertical', new: 'when floating in water is not vertical' },
      { q: 23, why: 'doubled "in"',
        old: 'filled in in red below', new: 'filled in red below' },
      { q: 25, why: 'missing "be"',
        old: 'the angle of deflection of the spring will small in method (2)',
        new: 'the angle of deflection of the spring will be small in method (2)' },
      { q: 25, why: 'inverted: each half of the stretched spring is the hypotenuse, so cos(theta) = L/(L+dL)',
        old: '\\[\\cos\\theta = \\dfrac{L+\\Delta L}{L}.\\]',
        new: '\\[\\cos\\theta = \\dfrac{L}{L+\\Delta L}.\\]' },
      { q: 25, why: 'theta = F/(2T\'), so dL/L = theta^2/2 = F^2/(8T\'^2); the printed form drops a factor of 2',
        old: "\\[\\dfrac{\\Delta L}{L} \\approx \\dfrac{F^2}{4T'^2}.\\]",
        new: "\\[\\dfrac{\\Delta L}{L} \\approx \\dfrac{F^2}{8T'^2}.\\]" },
      { q: 25, why: 'right side must keep the F/2 from the stated inequality; with the corrected dL/L this yields the (correct) boxed N > 4T/F',
        old: "\\[\\dfrac{NTF^2}{4T'^2} > F .\\]",
        new: "\\[\\dfrac{NTF^2}{8T'^2} > \\dfrac{F}{2} .\\]" },
    ],
  },
]

mkdirSync(OUT, { recursive: true })
const report = []

for (const ex of EXAMS) {
  const original = readFileSync(join(ROOT, 'work/crypt', ex.file), 'utf8')
  let text = original

  // Typo fixes first, then editorial rewrites -- a rewrite's `old` is written
  // against already-fixed text.
  const rewrites = ex.rewrites || []
  for (const f of [...ex.fixes, ...rewrites]) {
    const count = text.split(f.old).length - 1
    if (count !== 1) {
      throw new Error(`${ex.doc} q${f.q}: expected exactly 1 occurrence of ${JSON.stringify(f.old.slice(0, 60))}, found ${count}`)
    }
    // Function replacer, NOT a string: in a string replacement "$$" means a
    // literal "$" and "$&"/"$`" splice in match context, which silently mangles
    // LaTeX display math like $$...$$.
    text = text.replace(f.old, () => f.new)
  }

  writeFileSync(join(OUT, `${ex.doc}-FULL.tex`), text, 'utf8')

  // Patch file: just the problems that changed, in order, each with its number.
  const before = locate(original)
  const after = locate(text)

  // Two patch files: mechanical typo fixes and editorial solution rewrites are
  // different kinds of edit, and may well be reviewed and pasted separately.
  function emit(name, items, header) {
    if (!items.length) return
    const changed = [...new Set(items.map(f => f.q))].sort((a, b) => a - b)
    const chunks = [`% ${ex.title}`, `% ${ex.url}`, `% ${header}`, `% Problems changed: ${changed.join(', ')}`, '']
    for (const n of changed) {
      const why = items.filter(f => f.q === n).map(f => `%   - ${f.why}`).join('\n')
      const patched = text.slice(after[n - 1].macroStart, after[n - 1].end)
      if (patched === original.slice(before[n - 1].macroStart, before[n - 1].end)) {
        throw new Error(`${ex.doc} problem ${n}: patch identical to original`)
      }
      chunks.push(`%%%%%%%%%% Problem ${n} %%%%%%%%%%`, why, '', patched, '')
    }
    writeFileSync(join(OUT, name), chunks.join('\n'), 'utf8')
  }

  emit(`${ex.doc}-PATCHES.tex`, ex.fixes,
    'Typo/error corrections. Paste each block over the matching \\FMAproblem in the crypt.')
  emit(`${ex.doc}-SOLUTION-REWRITES.tex`, rewrites,
    'Solution rewrites for units in calculations. These blocks ALSO include the typo fixes.')

  report.push({
    exam: ex.doc, typoFixes: ex.fixes.length, rewrites: rewrites.length,
    problems: new Set([...ex.fixes, ...rewrites].map(f => f.q)).size, bytes: text.length,
  })
}

console.table(report)
console.log(`written to ${OUT}`)
