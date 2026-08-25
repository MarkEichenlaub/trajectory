// Update the fma-practice-aops rows in fma_questions from the style-fixed
// crypt source (work/crypt/fixed/190-10427.tex), per PORTAL_PORT_SPEC.md.
//
// The crypt is the source of truth for SOLUTIONS and the ANSWER KEY. Portal
// statements/choices were digitized from the compiled PDF and stay as they
// are, except for the l -> \ell pass. Updates ONLY: solution, correct_choice,
// statement, choices. solution_figure_urls is left alone -- q14/q22 figures
// are rendered and attached separately (see work/crypt/practice_solfigs/).
//
// Usage:
//   node scripts/port_practice_solutions.mjs --dry-run   # print what would change
//   node scripts/port_practice_solutions.mjs             # apply to the DB

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { convertExam, ellPass, KEYS, leftoverCheck, katexCheck } from './port_crypt_solutions.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const EXAM_ID = 'fma-practice-aops'

const DRY = process.argv.includes('--dry-run')

// Glued-letter cases the masked-token ell rule cannot see (l between other
// letters). Verified against the crypt source: q3 choice C is mg\ell^2\cos\theta.
const HAND_FIXES = [
  { q: 3, field: 'choices', key: 'C', from: 'mgl^2', to: 'mg\\ell^2' },
]

const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(ROOT, '.env'), 'utf8')
    .split('\n').find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))?.split('=').slice(1).join('=').trim()
if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

async function run() {
  // converted crypt solutions, already letter-verified against the key
  const solutions = convertExam(EXAM_ID)
  const key = KEYS[EXAM_ID]

  const { data: rows, error } = await supabase.from('fma_questions')
    .select('id, question_num, statement, choices, correct_choice, solution')
    .eq('exam_id', EXAM_ID).order('question_num')
  if (error) throw new Error(error.message)
  if (rows.length !== 25) throw new Error(`expected 25 rows, got ${rows.length}`)

  const errors = []
  const updates = []
  let changedFields = 0

  for (const row of rows) {
    const n = row.question_num
    const conv = solutions[n - 1]
    const next = {
      solution: conv.text,
      correct_choice: key[n - 1],
      statement: ellPass(row.statement),
      choices: Object.fromEntries(Object.entries(row.choices || {}).map(([k, v]) => [k, ellPass(v)])),
    }
    // Idempotent: a hand-fix already present in the DB (from a prior run) is
    // fine; only fail if NEITHER the old nor the fixed text is there.
    for (const fix of HAND_FIXES.filter(f => f.q === n)) {
      const get = () => fix.field === 'choices' ? next.choices[fix.key] : next[fix.field]
      const set = v => { if (fix.field === 'choices') next.choices[fix.key] = v; else next[fix.field] = v }
      const cur = get()
      if (cur?.includes(fix.to)) continue
      if (!cur?.includes(fix.from)) throw new Error(`hand-fix q${n}: neither '${fix.from}' nor '${fix.to}' present`)
      set(cur.replace(fix.from, fix.to))
    }

    // verify everything we are about to write
    const where = `${EXAM_ID} q${n}`
    for (const [part, txt] of [['solution', next.solution], ['statement', next.statement],
      ...Object.entries(next.choices).map(([k, v]) => [`choice ${k}`, v])]) {
      leftoverCheck(txt, `${where} ${part}`, errors)
      katexCheck(txt, `${where} ${part}`, errors)
    }
    if ((next.solution.match(/\\boxed/g) || []).length !== 1) errors.push(`${where}: \\boxed count != 1`)

    const diffs = []
    if (next.solution !== row.solution) diffs.push(`solution (${(row.solution || '').length} -> ${next.solution.length} chars)`)
    if (next.correct_choice !== row.correct_choice) diffs.push(`correct_choice ${row.correct_choice} -> ${next.correct_choice}`)
    if (next.statement !== row.statement) diffs.push('statement (ell pass)')
    const chChanged = Object.keys(next.choices).filter(k => next.choices[k] !== (row.choices || {})[k])
    if (chChanged.length) diffs.push(`choices ${chChanged.join(',')} (ell pass)`)

    if (diffs.length) {
      updates.push({ id: row.id, next })
      changedFields += diffs.length
      console.log(`${row.id}: ${diffs.join('; ')}`)
      if (DRY && next.statement !== row.statement) {
        for (const [i, span] of [...row.statement.matchAll(/\$\$[\s\S]*?\$\$/g)].entries()) {
          const after = [...next.statement.matchAll(/\$\$[\s\S]*?\$\$/g)][i][0]
          if (after !== span[0]) console.log(`    ${span[0].replace(/\s+/g, ' ')}  ->  ${after.replace(/\s+/g, ' ')}`)
        }
      }
    } else {
      console.log(`${row.id}: unchanged`)
    }
  }

  if (errors.length) {
    console.error(`\nFAILED ${errors.length} checks -- nothing written:`)
    for (const e of errors) console.error('  - ' + e)
    process.exit(1)
  }

  if (DRY) {
    console.log(`\nDRY RUN -- would update ${updates.length} of 25 rows (${changedFields} field changes)`)
    return
  }

  for (const u of updates) {
    const { error } = await supabase.from('fma_questions').update(u.next).eq('id', u.id)
    if (error) throw new Error(`${u.id}: ${error.message}`)
  }
  console.log(`\nupdated ${updates.length} of 25 rows`)
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1) })
