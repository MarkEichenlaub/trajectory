// Seed the "Gravity from a Spherical Shell" handout (EichenlaubPhysics) and
// assign it to Akshatha. Written after the 2026-09-10 session, where we set up
// Morin 11.1 (the shell theorem by integrating the potential over rings) and the
// algebra came out a factor of -4 off. The handout works the integral through,
// does the inside case as well, and points at the two lines where ours went off.
//
// Exposition only, no problems, so there's no solutions PDF: pdf_url only.
//
// Usage: node scripts/seed_shell_gravity_handout.mjs
//   (reads VITE_SUPABASE_SERVICE_KEY from .env, or pass the key as argv[2])

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = dirname(__dirname)
const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'

function keyFromEnvFile() {
  try {
    const m = readFileSync(join(ROOT, '.env'), 'utf8').match(/^VITE_SUPABASE_SERVICE_KEY=(.+)$/m)
    return m ? m[1].trim() : null
  } catch {
    return null
  }
}

const SERVICE_KEY = process.argv[2] || process.env.SUPABASE_SERVICE_KEY || keyFromEnvFile()
if (!SERVICE_KEY) {
  console.error('No service key found (.env VITE_SUPABASE_SERVICE_KEY, env var, or argv[2]).')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const HANDOUT_ID = 'handout-spherical-shell-gravity'
const STUDENT_ID = 'akshatha'
const ASSIGNED_DATE = '2026-09-10'

const HANDOUT = {
  id: HANDOUT_ID,
  name: 'Gravity from a Spherical Shell',
  source: 'EichenlaubPhysics',
  resource_type: 'handout',
  description:
    'The shell theorem worked all the way through, by integrating the gravitational '
    + 'potential energy over rings and then differentiating to get the force (Morin 11.1). '
    + 'Covers slicing the shell into rings, the law of cosines for the ring-to-mass '
    + 'distance, the substitution w = cos(theta), and the antiderivative of 1/sqrt(A - Bw), '
    + 'which is where a chain-rule factor is easy to lose. Both cases come out of the same '
    + 'expression through the absolute value |R - r|: outside the shell U = -GMm/r, so the '
    + 'shell pulls like a point mass at the center, and inside it U = -GMm/R is constant, '
    + 'so the force is exactly zero. Includes the follow-up on the factor of -4 in our '
    + 'session calculation, two checks that catch it (the sign, and shrinking the shell to '
    + 'a point), and why only the enclosed mass matters inside a planet. Exposition only, '
    + 'no problems.',
  topics: ['Mechanics'],
  tags: [
    'gravitation', 'shell theorem', 'gravitational potential energy', 'setting up integrals',
    'substitution', 'chain rule', 'limiting cases', 'sanity checks', 'usapho',
  ],
}

const DIR = join(ROOT, 'handouts-latex', 'spherical-shell-gravity')
const PDF = join(DIR, 'spherical-shell-gravity.pdf')

async function upload(localPath, storageKey) {
  const { error } = await supabase.storage
    .from('handout-pdfs')
    .upload(storageKey, readFileSync(localPath), { contentType: 'application/pdf', upsert: true })
  if (error) throw new Error(`Upload failed for ${storageKey}: ${error.message}`)
  return supabase.storage.from('handout-pdfs').getPublicUrl(storageKey).data.publicUrl
}

async function run() {
  console.log('Uploading PDF …')
  const pdfUrl = await upload(PDF, `${HANDOUT_ID}.pdf`)
  console.log(`  pdf_url: ${pdfUrl}`)

  const { error: hErr } = await supabase
    .from('handouts')
    .upsert({ ...HANDOUT, pdf_url: pdfUrl, status: 'active' }, { onConflict: 'id' })
  if (hErr) throw new Error(`Handout upsert failed: ${hErr.message}`)
  console.log(`Handout saved as ${HANDOUT_ID}.`)

  const { data: existing } = await supabase
    .from('assignments').select('id')
    .eq('student_id', STUDENT_ID).eq('problem_id', HANDOUT_ID).maybeSingle()
  if (existing) {
    console.log(`Already assigned to ${STUDENT_ID} (${existing.id}).`)
    return
  }

  const { error: aErr } = await supabase.from('assignments').insert({
    id: `${Date.now()}-${STUDENT_ID}-${HANDOUT_ID}`,
    student_id: STUDENT_ID,
    problem_id: HANDOUT_ID,
    status: 'assigned',
    assigned_date: ASSIGNED_DATE,
    notes: 'Follow-up from our session: the shell-theorem integral done all the way '
      + 'through, plus the two lines where our algebra went off. Reading only.',
    requires_submission: false,
  })
  if (aErr) throw new Error(`Assignment insert failed: ${aErr.message}`)
  console.log(`Assigned to ${STUDENT_ID} on ${ASSIGNED_DATE}.`)
}

run().catch(e => { console.error(e.message); process.exit(1) })
