// Builds Akshatha's online homework set on fluids, drawn from the whole F=ma
// Problem Series rather than one week. Same shape as fma-hw-akshatha-gravity:
// a handouts row (resource_type='homework') plus fma_homework_questions rows,
// taken online in the portal.
//
// Two sources, interleaved in teaching order rather than either source's own:
//   S<n>     scripts/fma10_script_problems.json  (FMA10 script problems,
//            written by Mark, free response, graded by hand)
//   W<wk>.<n> scripts/fma_homework_export.json   (AoPS homework, auto-graded
//            multiple choice, plus two USAPhO-style discussion problems)
//
// Fluids only: FMA10's last two script problems and homework 9 and 10 are
// Young's modulus and are left out, and the fluid problems scattered through
// weeks 3, 11 and 12 are pulled in.
//
// Usage:
//   node scripts/seed_akshatha_fluids_set.mjs [--assign]
// --assign also creates the portal assignment for Akshatha.

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SET_ID = 'fma-hw-akshatha-fluids'
const STUDENT_ID = 'akshatha'

const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(__dirname, '../.env'), 'utf8')
    .split('\n').find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
    ?.split('=').slice(1).join('=').trim()
if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

// Teaching order: pressure in a static fluid, then buoyancy, then the
// atmosphere, then fluid oscillations and waves, then viscosity and surface
// tension by dimensional analysis.
const ORDER = [
  'S1',      // The Hydraulic Press
  'S3',      // Pressure beneath the Surface of a Fluid
  'S2',      // The Hemispheres of Magdeburg
  'S5',      // Gauge Pressure in a Plugged Milk Jug
  'S4',      // Ranking the Forces on Three Flask Bottoms
  'S6',      // The Bell That Lifts Itself
  'W10.5',   // net pressure force on a curved wall
  'W10.6',   // pressure in a spinning tube of water
  'S7',      // Deriving the Buoyant Force
  'W10.1',   // what fraction of the wood block shows above water
  'W3.1',    // ballast for a hot air balloon
  'W10.3',   // three ice cubes melting
  'W10.2',   // a cylinder floating in oil over water
  'W10.4',   // steel in mercury, with water poured on top
  'S8',      // The Pivoted Floating Rod
  'W10.8',   // the plank propped on a stone
  'W10.7',   // the boat drifting along a trough on a table edge
  'W10.11',  // USAPhO-style: the air in a tall room
  'W11.6',   // oscillation of water in a U-tube manometer
  'W12.9',   // a deep-water wave on the moon
  'W12.5',   // viscous drag on a slow sphere
  'W12.6',   // the oscillation frequency of a water droplet
  'W12.7',   // droplet size and surface tension
  'W12.11',  // USAPhO-style: surface tension
]

const script = JSON.parse(readFileSync(join(__dirname, 'fma10_script_problems.json'), 'utf8'))
const weeks = JSON.parse(readFileSync(join(__dirname, 'fma_homework_export.json'), 'utf8'))

const qid = n => `${SET_ID}-q${String(n).padStart(2, '0')}`

function row(key, num) {
  if (key[0] === 'S') {
    const p = script.find(x => x.num === Number(key.slice(1)))
    if (!p) throw new Error(`no script problem ${key}`)
    return {
      id: qid(num), set_id: SET_ID, question_num: num,
      question_type: 'free_response',
      statement: p.statement,
      figure_urls: p.figure_urls,
      choices: null, choice_figure_urls: {}, correct_choice: null,
      solution: p.solution,
      solution_figure_urls: p.solution_figure_urls,
      topics: ['Mechanics'],
      tags: p.tags,
    }
  }
  const [wk, n] = key.slice(1).split('.').map(Number)
  const week = weeks.find(w => w.week === wk)
  if (!week) throw new Error(`no week ${wk} in fma_homework_export.json`)
  const p = week.problems.find(x => Number(x.question_num) === n)
  if (!p) throw new Error(`no homework problem ${key}`)
  return {
    id: qid(num), set_id: SET_ID, question_num: num,
    question_type: p.type === 'free_response' ? 'free_response' : 'mc',
    statement: p.statement,
    figure_urls: p.figure_urls,
    choices: p.choices,
    choice_figure_urls: p.choice_figure_urls || {},
    correct_choice: p.correct_choice,
    solution: p.solution || null,
    solution_figure_urls: p.solution_figure_urls,
    topics: p.topics && p.topics.length ? p.topics : ['Mechanics'],
    tags: p.tags || [],
  }
}

const rows = ORDER.map((key, i) => row(key, i + 1))
const mc = rows.filter(r => r.question_type === 'mc').length
const fr = rows.length - mc

const handout = {
  id: SET_ID,
  resource_type: 'homework',
  source: 'Eichenlaub Physics',
  name: 'F=ma Fluids (online quiz) — Akshatha Arunkumar',
  description:
    'Every fluids problem in the F=ma Problem Series, taken online. ' +
    `${mc} auto-graded multiple-choice questions plus ${fr} written problems Mark reviews ` +
    'directly, in teaching order: pressure in a static fluid, buoyancy and floating, the ' +
    'atmosphere, oscillations and waves in a fluid, and viscosity and surface tension by ' +
    'dimensional analysis. Most of it is week 10, and the rest comes from weeks 3, 11 and ' +
    '12, so those weekly sets overlap this one. Untimed, and not counted toward F=ma ' +
    'practice-exam stats.',
  topics: ['Mechanics'],
  tags: ['F=ma', 'homework'],
  year: 0,
  status: 'active',
}

async function run() {
  for (const r of rows) {
    if (!r.statement) throw new Error(`${r.id} has no statement`)
    if (r.question_type === 'mc' && (!r.choices || !r.correct_choice)) {
      throw new Error(`${r.id} is multiple choice with no choices/answer`)
    }
    if (r.question_type === 'mc' && !r.solution) throw new Error(`${r.id} has no solution`)
    // AoPS never wrote solutions for a few of the weekly discussion problems;
    // the runner just shows no solution block for those.
    if (!r.solution) console.log(`  note: ${r.id} (written) has no solution on file`)
  }
  console.log(`${rows.length} questions: ${mc} multiple choice, ${fr} written`)

  const { error: hErr } = await supabase.from('handouts').upsert([handout], { onConflict: 'id' })
  if (hErr) { console.error('FAILED (handouts):', hErr.message); process.exit(1) }
  console.log('handout row ok')

  const { error: qErr } = await supabase.from('fma_homework_questions')
    .upsert(rows, { onConflict: 'id' })
  if (qErr) { console.error('FAILED (questions):', qErr.message); process.exit(1) }
  console.log(`${rows.length} question rows ok`)

  if (process.argv.includes('--assign')) {
    // Local date, not UTC -- after 8pm Eastern toISOString() already says tomorrow.
    const now = new Date()
    const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
      .map((v, i) => (i ? String(v).padStart(2, '0') : v)).join('-')
    const { data: existing } = await supabase.from('assignments')
      .select('id').eq('student_id', STUDENT_ID).eq('problem_id', SET_ID).limit(1)
    if (existing?.length) {
      console.log('assignment already exists, left alone')
    } else {
      const { error: aErr } = await supabase.from('assignments').insert([{
        id: `assign-${Date.now()}`,
        student_id: STUDENT_ID,
        problem_id: SET_ID,
        status: 'assigned',
        assigned_date: today,
        requires_submission: false,
        notes: '',
      }])
      if (aErr) { console.error('FAILED (assignment):', aErr.message); process.exit(1) }
      console.log('assigned to Akshatha')
    }
  }
}

run()
