// Loads the 12 weeks of F=ma Problem Series homework
// (scripts/fma_homework_export.json, produced by EigenNode's
// scripts/export_fma_homework.py) into `handouts` (resource_type='homework')
// + `fma_homework_questions`. Run AFTER applying
// supabase/migrations/20260903070000_fma_homework_sets.sql.
// Usage: node scripts/seed_fma_homework.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(__dirname, '../.env'), 'utf8')
    .split('\n')
    .find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
    ?.split('=').slice(1).join('=').trim()

if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const weeks = JSON.parse(readFileSync(join(__dirname, 'fma_homework_export.json'), 'utf8'))

function setId(week) {
  return `fma-hw-week-${String(week).padStart(2, '0')}`
}

function handoutRow(week, title) {
  const id = setId(week)
  return {
    id,
    resource_type: 'homework',
    source: 'F=ma',
    name: `F=ma Homework — Week ${week}: ${title}`,
    description: `Weekly homework set for AoPS's F=ma Problem Series, week ${week} (${title}). Not counted toward F=ma practice-exam stats.`,
    topics: ['Mechanics'],
    tags: ['F=ma', 'homework'],
    year: 0,
  }
}

function questionRows(week, problems) {
  const sid = setId(week)
  return problems.map(p => ({
    id: `${sid}-q${String(p.question_num).padStart(2, '0')}`,
    set_id: sid,
    question_num: p.question_num,
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
  }))
}

async function run() {
  const handoutRows = weeks.map(w => handoutRow(w.week, w.week_title))
  console.log(`Seeding ${handoutRows.length} homework-set handouts...`)
  const { error: hErr } = await supabase.from('handouts').upsert(handoutRows, { onConflict: 'id' })
  if (hErr) { console.error('FAILED (handouts):', hErr.message); process.exit(1) }
  console.log(`✓ ${handoutRows.length} handouts seeded`)

  const rows = weeks.flatMap(w => questionRows(w.week, w.problems))
  console.log(`Seeding ${rows.length} homework questions...`)
  const { error: qErr } = await supabase.from('fma_homework_questions').upsert(rows, { onConflict: 'id' })
  if (qErr) { console.error('FAILED (fma_homework_questions):', qErr.message); process.exit(1) }
  console.log(`✓ ${rows.length} questions seeded`)
}

run()
