// Seed two Physics 1: Mechanics handouts for India.
// Uploads local PDFs to Supabase storage, inserts handout rows, assigns to India.
//
// Usage: node scripts/seed_india_handouts.mjs <service_role_key>
//    or: SUPABASE_SERVICE_KEY=<key> node scripts/seed_india_handouts.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = process.argv[2] || process.env.SUPABASE_SERVICE_KEY

if (!SERVICE_KEY) {
  console.error('Usage: node scripts/seed_india_handouts.mjs <service_role_key>')
  console.error('   or: SUPABASE_SERVICE_KEY=<key> node scripts/seed_india_handouts.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const DESKTOP = join(dirname(__dirname), '../../Desktop')

const HANDOUTS = [
  {
    id: 'handout-velocity-p1m',
    name: 'Velocity and Kinematics',
    source: 'Physics 1: Mechanics',
    resource_type: 'handout',
    description: 'Introduction to velocity, speed, displacement, and the kinematic quantities that describe one-dimensional motion. Covers average vs. instantaneous velocity and graphical interpretation.',
    topics: ['Mechanics'],
    tags: ['velocity', 'kinematics', 'displacement', 'speed', 'average velocity', 'instantaneous velocity'],
    localFile: join(DESKTOP, 'Handout_Velocity.pdf'),
  },
  {
    id: 'handout-p1m-pretest',
    name: 'Physics 1: Mechanics Pre-Test',
    source: 'Physics 1: Mechanics',
    resource_type: 'handout',
    description: 'Diagnostic pre-assessment covering foundational mechanics concepts including kinematics, forces, and energy. Used to gauge prior knowledge before beginning the course.',
    topics: ['Mechanics'],
    tags: ['pretest', 'assessment', 'kinematics', 'forces', 'mechanics', 'diagnostic'],
    localFile: join(DESKTOP, 'physics1-pretest.pdf'),
  },
]

async function uploadPDF(localPath, handoutId) {
  const bytes = readFileSync(localPath)
  const storageKey = `${handoutId}.pdf`
  const { error } = await supabase.storage
    .from('handout-pdfs')
    .upload(storageKey, bytes, { contentType: 'application/pdf', upsert: true })
  if (error) throw new Error(`Storage upload failed for ${storageKey}: ${error.message}`)
  const { data } = supabase.storage.from('handout-pdfs').getPublicUrl(storageKey)
  return data.publicUrl
}

async function run() {
  const assignedDate = new Date().toISOString().slice(0, 10)
  const handoutIds = []

  for (const h of HANDOUTS) {
    console.log(`\nProcessing: ${h.name}`)

    // 1. Upload PDF
    console.log(`  Uploading ${h.localFile} …`)
    const pdfUrl = await uploadPDF(h.localFile, h.id)
    console.log(`  PDF URL: ${pdfUrl}`)

    // 2. Insert handout record
    const row = {
      id: h.id,
      name: h.name,
      source: h.source,
      resource_type: h.resource_type,
      description: h.description,
      topics: h.topics,
      tags: h.tags,
      pdf_url: pdfUrl,
    }
    const { error: upsertErr } = await supabase.from('handouts').upsert(row, { onConflict: 'id' })
    if (upsertErr) throw new Error(`Handout upsert failed: ${upsertErr.message}`)
    console.log(`  Handout record saved.`)

    handoutIds.push(h.id)
  }

  // 3. Assign both handouts to India
  console.log(`\nAssigning handouts to India …`)
  const assignments = handoutIds.map(problemId => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${problemId.slice(-8)}`,
    student_id: 'india',
    problem_id: problemId,
    status: 'assigned',
    assigned_date: assignedDate,
  }))

  const { error: assignErr } = await supabase.from('assignments').upsert(assignments, { onConflict: 'id' })
  if (assignErr) throw new Error(`Assignment insert failed: ${assignErr.message}`)
  console.log(`  Assigned ${assignments.length} handout(s) to India.`)

  console.log('\nDone.')
}

run().catch(e => { console.error(e.message); process.exit(1) })
