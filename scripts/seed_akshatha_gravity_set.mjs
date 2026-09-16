// Builds Akshatha's online homework set for F=ma Problem Series week 8
// (Orbital Mechanics): gravity and Kepler's laws. Same shape as
// fma-hw-akshatha-rotation -- a handouts row (resource_type='homework') plus
// fma_homework_questions rows, taken online in the portal.
//
// The set interleaves two sources, in teaching order rather than either
// source's own order:
//   S<n>  scripts/fma08_script_problems.json  (EigenNode script problems,
//         written by Mark, free response, graded by hand)
//   H<n>  scripts/fma_homework_export.json week 8 (AoPS homework, auto-graded
//         multiple choice, plus the week's USAPhO-style discussion problem)
//
// Usage:
//   node scripts/seed_akshatha_gravity_set.mjs [--assign]
// --assign also creates the portal assignment for Akshatha.

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SET_ID = 'fma-hw-akshatha-gravity'
const STUDENT_ID = 'akshatha'

const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(__dirname, '../.env'), 'utf8')
    .split('\n').find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
    ?.split('=').slice(1).join('=').trim()
if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

// Teaching order: circular motion, then the gravitational field, then orbits
// and Kepler's laws, then orbital energy, then the leftovers and the
// USAPhO-style problem last.
const ORDER = [
  'S1',   // Velocity and Acceleration in Uniform Circular Motion
  'S2',   // Where Gravity Cancels Between the Earth and the Moon
  'S3',   // Gravity at a Small Height Above the Earth
  'S9',   // Gravity Inside and Outside a Uniform Planet
  'H4',   // a spherical cavity dug out of a planet
  'H5',   // force and potential energy at the surface, same density
  'S7',   // Gravitational Potential Energy and a Two-Particle Escape
  'S4',   // Spy Satellites in Geosynchronous Orbit
  'H8',   // a satellite skimming a planet of density rho
  'H1',   // the period of a binary star
  'S6',   // Kepler's Laws with Inverse-Cube Gravity
  'H2',   // an ellipse with closest and farthest distances r1 and r2
  'H3',   // a planet stops dead and falls into the sun
  'S5',   // Timing a Hohmann Transfer
  'S8',   // The Energy of an Orbit, and Comparing Orbits
  'H6',   // a satellite launched at an angle: closest approach
  'H7',   // a rock orbiting with the same angular velocity as the planet
  'H10',  // a particle circling inside a paraboloid bowl
  'H9',   // a ball rolling off a fixed sphere
  'H11',  // USAPhO-style: the rings of Saturn
]

const script = JSON.parse(readFileSync(join(__dirname, 'fma08_script_problems.json'), 'utf8'))
const week8 = JSON.parse(readFileSync(join(__dirname, 'fma_homework_export.json'), 'utf8'))
  .find(w => w.week === 8)
if (!week8) { console.error('week 8 not found in fma_homework_export.json'); process.exit(1) }

const qid = n => `${SET_ID}-q${String(n).padStart(2, '0')}`

function row(key, num) {
  const n = Number(key.slice(1))
  if (key[0] === 'S') {
    const p = script.find(x => x.num === n)
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
  const p = week8.problems.find(x => Number(x.question_num) === n)
  if (!p) throw new Error(`no week-8 homework problem ${key}`)
  return {
    id: qid(num), set_id: SET_ID, question_num: num,
    question_type: p.type === 'free_response' ? 'free_response' : 'mc',
    statement: p.statement,
    figure_urls: p.figure_urls,
    choices: p.choices,
    choice_figure_urls: p.choice_figure_urls || {},
    correct_choice: p.correct_choice,
    solution: p.solution,
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
  name: "F=ma Gravity & Kepler's Laws (online quiz) — Akshatha Arunkumar",
  description:
    'F=ma Problem Series, gravity and orbital mechanics, taken online. ' +
    `${mc} auto-graded multiple-choice questions plus ${fr} written problems Mark reviews ` +
    'directly, in teaching order: circular motion, the gravitational field and the shell ' +
    "theorem, Kepler's laws and orbits, orbital energy, and a USAPhO-style problem on the " +
    "rings of Saturn. One problem (Kepler's laws under inverse-cube gravity) is built on " +
    '2016 F=ma #8, so that exam is no longer clean as a practice test. Untimed, and not ' +
    'counted toward F=ma practice-exam stats.',
  topics: ['Mechanics'],
  tags: ['F=ma', 'homework'],
  year: 0,
  status: 'active',
}

async function run() {
  for (const r of rows) {
    if (!r.statement) throw new Error(`${r.id} has no statement`)
    if (!r.solution) throw new Error(`${r.id} has no solution`)
    if (r.question_type === 'mc' && (!r.choices || !r.correct_choice)) {
      throw new Error(`${r.id} is multiple choice with no choices/answer`)
    }
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
