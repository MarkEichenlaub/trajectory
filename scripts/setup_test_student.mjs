// Creates (or refreshes) a persistent test student for QA'ing the portal exactly
// as a real student sees it -- no admin preview, no isPreview flag, so the F=ma
// runner and every other student-only affordance is fully live.
//
// The login address is a plus-alias on Mark's own Gmail, so the portal's normal
// "Send login link" flow delivers straight to his inbox and can be repeated
// whenever the session lapses. This script also prints a ready-to-use magic link
// so there's no waiting on email the first time.
//
// Usage:
//   node scripts/setup_test_student.mjs           # create/refresh + print a login link
//   node scripts/setup_test_student.mjs --link    # just print a fresh login link
//   node scripts/setup_test_student.mjs --reset   # wipe the test student's F=ma attempts

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(ROOT, '.env'), 'utf8')
    .split('\n').find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
    ?.split('=').slice(1).join('=').trim()

if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }
const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const STUDENT_ID = 'test-student'
const EMAIL = 'mark.d.eichenlaub+fmatest@gmail.com'
const PORTAL = 'https://portal.eichenlaubphysics.com'
// Mirrors what Leo is assigned, so the test account sees the same exam.
const EXAM_ID = 'fma-practice-aops'

async function findUser() {
  const { data } = await sb.auth.admin.listUsers({ perPage: 1000 })
  return data.users.find(u => u.email === EMAIL) || null
}

async function magicLink() {
  const { data, error } = await sb.auth.admin.generateLink({
    type: 'magiclink',
    email: EMAIL,
    options: { redirectTo: `${PORTAL}/${STUDENT_ID}/fma-progress` },
  })
  if (error) throw new Error(error.message)
  return data.properties.action_link
}

async function ensure() {
  let user = await findUser()
  if (!user) {
    const { data, error } = await sb.auth.admin.createUser({ email: EMAIL, email_confirm: true })
    if (error) throw new Error(error.message)
    user = data.user
    console.log(`created auth user ${EMAIL}`)
  } else {
    console.log(`reusing auth user ${EMAIL}`)
  }

  await sb.from('profiles').upsert({ id: user.id, email: EMAIL, account_type: 'student' })

  // Matches Leo's shape: active, no invoicing, Eastern time.
  await sb.from('students').upsert({
    id: STUDENT_ID,
    first_name: 'Test',
    last_name: 'Student',
    email: EMAIL,
    timezone: 'America/New_York',
    status: 'active',
    invoicing_enabled: false,
  })

  await sb.from('student_links').upsert(
    { account_id: user.id, student_id: STUDENT_ID, relationship: 'self' },
    { onConflict: 'account_id,student_id' },
  )

  const { data: existing } = await sb.from('assignments')
    .select('id').eq('student_id', STUDENT_ID).eq('problem_id', EXAM_ID)
  if (!existing?.length) {
    await sb.from('assignments').insert({
      id: `${Date.now()}-testfma-${EXAM_ID.slice(-8)}`,
      student_id: STUDENT_ID,
      problem_id: EXAM_ID,
      status: 'assigned',
      assigned_date: new Date().toISOString().slice(0, 10),
    })
    console.log(`assigned ${EXAM_ID}`)
  } else {
    console.log(`already assigned ${EXAM_ID}`)
  }
  return user
}

async function reset() {
  const { data } = await sb.from('fma_attempts').delete().eq('student_id', STUDENT_ID).select('id')
  console.log(`deleted ${data?.length ?? 0} F=ma attempt(s) for ${STUDENT_ID}`)
}

const arg = process.argv[2]
if (arg === '--reset') {
  await reset()
} else if (arg === '--link') {
  console.log(await magicLink())
} else {
  await ensure()
  console.log(`\nLogin as this student (opens the F=ma tab, single use, expires in ~1h):\n`)
  console.log(await magicLink())
  console.log(`\nOr from ${PORTAL} choose "Send login link" and enter:\n  ${EMAIL}`)
}
