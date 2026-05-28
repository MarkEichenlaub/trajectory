// Migrate existing students + assignments from GitHub JSON to Supabase.
// Usage: node scripts/migrate.js <service_role_key>
//
// Run once after applying supabase/schema.sql

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = process.argv[2]

if (!SERVICE_KEY) {
  console.error('Usage: node scripts/migrate.js <service_role_key>')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
})

const students = JSON.parse(readFileSync(join(__dirname, '../data/students.json'), 'utf8'))
const rawAssignments = JSON.parse(readFileSync(join(__dirname, '../data/assignments.json'), 'utf8'))

// Normalize camelCase JSON fields to snake_case for Supabase
const assignments = rawAssignments.map(a => ({
  id: a.id,
  student_id: a.studentId,
  problem_id: a.problemId,
  status: a.status,
  assigned_date: a.assignedDate || null,
  completed_date: a.completedDate || null,
}))

async function run() {
  console.log(`Migrating ${students.length} students and ${assignments.length} assignments...`)

  const { error: sErr } = await supabase.from('students').upsert(students, { onConflict: 'id' })
  if (sErr) { console.error('Students error:', sErr.message); process.exit(1) }
  console.log(`✓ ${students.length} students inserted`)

  const { error: aErr } = await supabase.from('assignments').upsert(assignments, { onConflict: 'id' })
  if (aErr) { console.error('Assignments error:', aErr.message); process.exit(1) }
  console.log(`✓ ${assignments.length} assignments inserted`)

  console.log('Migration complete.')
}

run()
