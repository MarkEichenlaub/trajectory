// Post-seed sanity check on the PhysicsWOOT questions actually stored in the DB.
//
// The conversion from crypt LaTeX to the portal's markup is lossy by design
// (it drops \item, \boxed, figure markers and so on), so this reads the rows
// back and fails loudly on any residue that would reach a student as literal
// text, plus unbalanced $$ that would swallow a paragraph into a math span.
//
// Usage: node scripts/check_pwoot_seeded.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(ROOT, '.env'), 'utf8')
    .split('\n').find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))?.split('=').slice(1).join('=').trim()

const supabase = createClient('https://nxvtaxbntqhcfqtazbnt.supabase.co', SERVICE_KEY, { auth: { persistSession: false } })

const RESIDUE = [
  ['figure marker', /\{\{FIGURE\}\}/],
  ['image marker', /\{\{IMAGE\}\}/],
  ['\\item', /\\item\b/],
  ['enumerate/itemize', /\\(begin|end)\{(enumerate|itemize)\}/],
  ['\\textbf', /\\textbf\b/],
  ['\\emph or \\textit', /\\(emph|textit)\b/],
  ['align*', /\\begin\{align\*\}/],
  ['\\includegraphics', /\\includegraphics/],
  // bare \[ is display math the renderer can't parse; \\[8pt] row breaks are fine
  ['\\[ display math', /(?<!\\)\\\[/],
  ['LaTeX comment', /(^|\n)\s*%/],
  ['backtick quotes', /``/],
]

// House style (2026-08): every solution begins with a boxed answer-choice
// opener and contains no other \boxed.
function boxedStyleViolation(solution) {
  if (!solution) return 'no solution'
  const boxes = (solution.match(/\\boxed/g) || []).length
  const opens = /^\s*\$\$\\boxed\{\\mathrm\{\(/.test(solution)
  if (!opens) return 'does not open with boxed answer'
  if (boxes !== 1) return `${boxes} \\boxed occurrences (expect 1)`
  return null
}

const { data, error } = await supabase
  .from('fma_questions')
  .select('id,statement,choices,solution')
  .or('exam_id.like.fma-pwoot%,exam_id.eq.fma-practice-aops')
if (error) { console.error(error.message); process.exit(1) }

const hits = {}
for (const row of data) {
  const blob = [row.statement, row.solution, ...Object.values(row.choices || {})].join('\n')
  for (const [label, re] of RESIDUE) {
    if (re.test(blob)) (hits[label] ||= []).push(row.id)
  }
  const bv = boxedStyleViolation(row.solution)
  if (bv) (hits['boxed opener'] ||= []).push(row.id + ': ' + bv)
  // $$ is the inline-math delimiter; an odd count means one span never closes.
  if ((blob.match(/\$\$/g) || []).length % 2) (hits['unbalanced $$'] ||= []).push(row.id)
  // A lone $ is a LaTeX delimiter that survived conversion.
  if (/(^|[^$])\$(?!\$)/.test(blob.replace(/\$\$/g, ''))) (hits['stray single $'] ||= []).push(row.id)
}

console.log(`checked ${data.length} seeded questions`)
if (!Object.keys(hits).length) {
  console.log('clean: no LaTeX residue, all $$ balanced')
} else {
  for (const [label, ids] of Object.entries(hits)) {
    console.log(`  ${label}: ${ids.length}  e.g. ${ids.slice(0, 5).join(', ')}`)
  }
  process.exit(1)
}
