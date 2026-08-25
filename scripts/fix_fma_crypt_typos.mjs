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

  for (const f of ex.fixes) {
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
  const changed = [...new Set(ex.fixes.map(f => f.q))].sort((a, b) => a - b)
  const chunks = [
    `% ${ex.title}`,
    `% ${ex.url}`,
    `% Corrected problems only -- paste each block over the matching \\FMAproblem in the crypt.`,
    `% Problems changed: ${changed.join(', ')}`,
    '',
  ]
  for (const n of changed) {
    const why = ex.fixes.filter(f => f.q === n).map(f => `%   - ${f.why}`).join('\n')
    chunks.push(`%%%%%%%%%% Problem ${n} %%%%%%%%%%`, why, '', text.slice(after[n - 1].macroStart, after[n - 1].end), '')
    if (before[n - 1].end - before[n - 1].macroStart === after[n - 1].end - after[n - 1].macroStart &&
        original.slice(before[n - 1].macroStart, before[n - 1].end) === text.slice(after[n - 1].macroStart, after[n - 1].end)) {
      throw new Error(`${ex.doc} problem ${n}: patch identical to original`)
    }
  }
  writeFileSync(join(OUT, `${ex.doc}-PATCHES.tex`), chunks.join('\n'), 'utf8')

  report.push({ exam: ex.doc, fixes: ex.fixes.length, problems: changed.length, bytes: text.length })
}

console.table(report)
console.log(`written to ${OUT}`)
