// Import the 24 AoPS "Physics 1: Mechanics" lesson handouts into the portal.
//
// Pulls each handout PDF from the AoPS CDN (the hashed collection URL is a public
// capability link — no login needed once you have it), uploads it to the
// `handout-pdfs` storage bucket, and upserts a `handouts` row. Each row is tagged
// with its lesson code (MCH01..MCH24) so build_homework_set.py can pull the
// matching handout as context for the AI summary page.
//
// Usage: node scripts/seed_mechanics_handouts.mjs
//   (reads VITE_SUPABASE_SERVICE_KEY from trajectory/.env)

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'

function readServiceKey() {
  if (process.env.SUPABASE_SERVICE_KEY) return process.env.SUPABASE_SERVICE_KEY
  const env = readFileSync(join(__dirname, '..', '.env'), 'utf8')
  const m = env.match(/VITE_SUPABASE_SERVICE_KEY\s*=\s*(.+)/)
  if (!m) throw new Error('VITE_SUPABASE_SERVICE_KEY not found in .env')
  return m[1].trim().replace(/^['"]|['"]$/g, '')
}

const supabase = createClient(SUPABASE_URL, readServiceKey(), { auth: { persistSession: false } })

const CDN_BASE =
  'https://cdn.artofproblemsolving.com/school/crypt/00405-36293f6558d60af76e24b26cd4d75d9753687fc0/handouts/'

const SOURCE = 'AoPS Physics 1: Mechanics'

// lesson number (1..24) -> { title, file }. Lesson N maps to code MCH<NN>.
const HANDOUTS = [
  { n: 1, title: 'Velocity', file: 'Handout_Velocity.pdf' },
  { n: 2, title: 'Acceleration', file: 'Handout_Acceleration.pdf' },
  { n: 3, title: 'Projectile Motion', file: 'Projectile_Motion_Handout.pdf' },
  { n: 4, title: 'Energy Conservation', file: 'Handout_Energy_Conservation.pdf' },
  { n: 5, title: 'Forms of Energy', file: 'Handout_Forms_of_Energy.pdf' },
  { n: 6, title: 'Simple Machines', file: 'Handout_Simple_Machines.pdf' },
  { n: 7, title: 'Circular Motion', file: 'Handout_Circular_Motion.pdf' },
  { n: 8, title: 'Simple Harmonic Motion', file: 'Handout_SHM.pdf' },
  { n: 9, title: 'Rotational Kinematics', file: 'Handout_Rot_Kin.pdf' },
  { n: 10, title: 'Rotational Dynamics', file: 'Handout_Rot_Dyn.pdf' },
  { n: 11, title: 'Vectors', file: 'Handout_Vectors.pdf' },
  { n: 12, title: '2D and 3D Kinematics', file: 'Handout_Kinematics.pdf' },
  { n: 13, title: 'Momentum', file: 'Handout_Momentum.pdf' },
  { n: 14, title: 'Collisions', file: 'Handout_Collisions.pdf' },
  { n: 15, title: 'Forces via Momentum', file: 'Handout_Force_Momentum.pdf' },
  { n: 16, title: 'Forces via Energy', file: 'Handout_Force_Energy.pdf' },
  { n: 17, title: 'Statics', file: 'Handout_Statics.pdf' },
  { n: 18, title: "Newton's Laws of Motion", file: 'Handout_Newtons_Laws.pdf' },
  { n: 19, title: 'Problem Solving with Forces', file: 'Handout_Force2.pdf' },
  { n: 20, title: "Newton's Gravitational Law", file: 'Handout_Newton_Gravity.pdf' },
  { n: 21, title: 'Torque and Angular Momentum', file: 'Handout_Torque.pdf' },
  { n: 22, title: 'Torque and Angular Momentum (II)', file: 'Handout_Torque_2.pdf' },
  { n: 23, title: 'Fluid Statics', file: 'Handout_Fluid_Statics.pdf' },
  { n: 24, title: 'Fluid Dynamics', file: 'Handout_Fluid_Dynamics.pdf' },
]

const code = n => 'MCH' + String(n).padStart(2, '0')

async function fetchPdf(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`)
  const buf = Buffer.from(await r.arrayBuffer())
  if (buf.slice(0, 4).toString('latin1') !== '%PDF') {
    throw new Error(`Not a PDF (got ${buf.slice(0, 16).toString('latin1')}) for ${url}`)
  }
  return buf
}

async function run() {
  for (const h of HANDOUTS) {
    const c = code(h.n)
    const id = `handout-${c.toLowerCase()}`
    process.stdout.write(`${c} ${h.title} … `)

    const bytes = await fetchPdf(CDN_BASE + h.file)
    const storageKey = `${id}.pdf`
    const up = await supabase.storage
      .from('handout-pdfs')
      .upload(storageKey, bytes, { contentType: 'application/pdf', upsert: true })
    if (up.error) throw new Error(`upload ${storageKey}: ${up.error.message}`)
    const { data } = supabase.storage.from('handout-pdfs').getPublicUrl(storageKey)

    const row = {
      id,
      name: h.title,
      source: SOURCE,
      resource_type: 'handout',
      description:
        `${SOURCE} handout for Lesson ${h.n} (${c}): ${h.title}. ` +
        `Intellectual property of Art of Problem Solving, stored here for personal study.`,
      topics: ['Mechanics'],
      tags: [c, 'mechanics', ...h.title.toLowerCase().split(/\s+/)],
      pdf_url: data.publicUrl,
    }
    const ins = await supabase.from('handouts').upsert(row, { onConflict: 'id' })
    if (ins.error) throw new Error(`upsert ${id}: ${ins.error.message}`)
    console.log(`ok (${(bytes.length / 1024).toFixed(0)} KB)`)
  }
  console.log(`\nDone — ${HANDOUTS.length} handouts imported.`)
}

run().catch(e => { console.error('\nFAILED:', e.message); process.exit(1) })
