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
//   node scripts/setup_test_student.mjs --demo    # backfill a full fake history (sessions,
//                                                  # assignments, invoices, real Miro boards,
//                                                  # an AI-drafted progress report) so the
//                                                  # account looks like a real, established
//                                                  # student for demoing the portal

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { randomUUID } from 'crypto'
import { spawnSync } from 'child_process'
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
    // A logged-in student's tab is the FIRST path segment (StudentView reads
    // pathSegs[0]); the /:slug/:tab form is admin-preview only. This used to
    // send `/test-student/fma-progress`, where 'test-student' isn't a valid tab
    // name, so the link silently landed on Assigned instead of the F=ma tab it
    // advertises.
    options: { redirectTo: `${PORTAL}/fma-progress` },
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

// ── Demo history ─────────────────────────────────────────────────────────
// Backfills a full fake student history for demoing the portal: real
// tutoring-style sessions (with real Miro boards), a mix of active/completed
// assignments on real contest problems, invoices, and an AI-drafted progress
// report. All demo rows are keyed with a `demo-` prefix (or scoped to
// STUDENT_ID for tables with no natural key), so re-running --demo wipes and
// recreates them cleanly.

const PROBLEMS = JSON.parse(readFileSync(join(ROOT, 'data', 'problems.json'), 'utf8'))
function problemLabel(id) {
  const p = PROBLEMS.find(x => x.id === id)
  return p ? `${p.contest} ${p.year} ${p.label} — ${p.name}` : id
}
function boardDateLabel(dateStr) {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

const PAST_SESSIONS = [
  {
    date: '2026-07-16',
    summary: 'Kinematics warm-up — built out position, velocity, and acceleration graphs for 1D motion and practiced translating between them. Test Student picked up the slope/area relationships quickly and worked through a two-stage acceleration problem without much help.',
    tags: ['kinematics', 'graphs', '1d motion'],
    problems: ['usapho-2025-A1', 'ipho-1967-T1'],
    notes: ['x = x0 + v0·t + ½at²', 'v = v0 + at', 'slope of x-t graph = v', 'area under v-t graph = Δx'],
  },
  {
    date: '2026-07-23',
    summary: "Energy methods — introduced the work-energy theorem and worked several conservation-of-energy problems on inclined planes and springs. Spent extra time on why normal force does no work, which was the sticking point from last week's kinematics-only approach.",
    tags: ['energy', 'work-energy theorem', 'springs'],
    problems: ['ipho-1986-T3', 'usapho-2025-B1'],
    notes: ['W = F·d·cosθ', 'KE = ½mv²', 'E_i = E_f (conservation)', 'spring PE = ½kx²'],
  },
  {
    date: '2026-07-30',
    summary: "Momentum and collisions — derived conservation of momentum from Newton's third law and worked through elastic vs. inelastic collision problems, including a center-of-mass frame trick that made the algebra much cleaner.",
    tags: ['momentum', 'collisions', 'center of mass'],
    problems: ['ipho-1969-T1', 'ipho-1994-T3'],
    notes: ['p = mv', 'Σp_before = Σp_after', 'elastic: KE conserved too', 'CM frame simplifies algebra'],
  },
  {
    date: '2026-08-06',
    summary: 'Circular motion — centripetal acceleration, banked curves, and vertical circles. Worked the classic loop-the-loop minimum-speed problem and connected it back to the energy methods from two weeks ago.',
    tags: ['circular motion', 'centripetal force', 'loop-the-loop'],
    problems: ['usapho-2023-A2', 'usapho-2016-B1'],
    notes: ['a_c = v²/r', 'banked curve: tanθ = v²/(rg)', 'loop: mg = mv²/r at top', 'v_min = √(gr)'],
  },
  {
    date: '2026-08-13',
    summary: 'Forces and friction — systems of blocks on inclines with friction, free body diagrams for each block, and second law applied component-wise. Test Student is getting fast at picking the right coordinate axes to simplify the algebra.',
    tags: ['forces', 'friction', 'free body diagrams'],
    problems: ['ipho-1968-T1', 'ipho-1991-T1'],
    notes: ['ΣF = ma', 'f_s ≤ μ_s·N', 'f_k = μ_k·N', 'choose axes along/perp. to incline'],
  },
]

const UPCOMING_SESSIONS = [
  { date: '2026-08-27', notes: ['Agenda: Torque', 'definitions + breaking forces into components'] },
  { date: '2026-09-03', notes: ['Agenda: Statics', 'equilibrium + torque balance'] },
]

const ACTIVE_ASSIGNMENTS = [
  { problem_id: 'usapho-2022-A1', assigned_date: '2026-08-13' },
  { problem_id: 'usapho-2022-A2', assigned_date: '2026-08-13' },
  { problem_id: 'usapho-2025-A2', assigned_date: '2026-08-13' },
]

const COMPLETED_ASSIGNMENTS = [
  { problem_id: 'usapho-2023-A1', assigned_date: '2026-07-16', completed_date: '2026-07-20' },
  { problem_id: 'usapho-2023-B2', assigned_date: '2026-07-23', completed_date: '2026-07-27' },
  { problem_id: 'ipho-1970-T1', assigned_date: '2026-07-30', completed_date: '2026-08-03' },
  { problem_id: 'ipho-1975-T1', assigned_date: '2026-08-06', completed_date: '2026-08-10' },
]

// $300/session, matching Leo's real invoiced rate.
const INVOICES = [
  { amount_cents: 150000, sessions_count: 5, status: 'paid', created_at: '2026-06-15T15:00:00Z', due_date: '2026-06-15T15:00:00Z' },
  { amount_cents: 150000, sessions_count: 5, status: 'paid', created_at: '2026-07-20T15:00:00Z', due_date: '2026-07-20T15:00:00Z' },
  { amount_cents: 90000, sessions_count: 3, status: 'sent', created_at: '2026-08-14T15:00:00Z', due_date: '2026-08-28T15:00:00Z' },
]

const REPORT_CYCLE = 'Cycle 1 · Summer 2026'

// A couple of self-reported past practice tests (real digitized exams, so
// they show up with real names and clickable question detail), so the F=ma
// Progress chart has more than a single point. Left alone: any pre-existing
// 'live'/'paper_first' attempt on the account (e.g. from QA'ing the test
// runner itself) — this only wipes/reseeds its own 'score_only' rows.
const FMA_ATTEMPTS = [
  { exam_id: 'fma-2024', score: 12, at: '2026-07-10T19:00:00Z' },
  { exam_id: 'fma-2025', score: 16, at: '2026-08-05T19:00:00Z' },
]

async function createBoards(specs) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-demo-boards`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    // cleanupPrefix sweeps up any orphan boards left by a previous partial/failed
    // --demo run, so reruns don't pile up duplicate Miro boards.
    body: JSON.stringify({ boards: specs, cleanupPrefix: 'Test Student –' }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`create-demo-boards: ${res.status} ${JSON.stringify(body)}`)
  if (body.cleaned) console.log(`  cleaned up ${body.cleaned} orphaned board(s) from a previous run.`)
  const byKey = {}
  for (const r of body.results || []) {
    if (r.error) console.warn(`  board ${r.key} failed: ${r.error} (continuing without it)`)
    byKey[r.key] = r
  }
  return byKey
}

async function draftAndUploadReport() {
  console.log(`\nDrafting progress report via reports/draft.mjs (uses the local claude CLI)...`)
  const res = spawnSync('node', ['reports/draft.mjs', STUDENT_ID, '--cycle', REPORT_CYCLE], {
    cwd: ROOT, encoding: 'utf8', stdio: 'inherit',
  })
  if (res.status !== 0) throw new Error('reports/draft.mjs failed — see output above')

  const slug = REPORT_CYCLE.toLowerCase().replace(/[·.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const pdfPath = join(ROOT, 'reports', STUDENT_ID, `${slug}.pdf`)
  if (!existsSync(pdfPath)) {
    throw new Error(`Expected a compiled PDF at ${pdfPath} but it's missing (typst compile likely failed above).`)
  }

  const bytes = readFileSync(pdfPath)
  const storagePath = `${STUDENT_ID}/${randomUUID()}.pdf`
  const { error: upErr } = await sb.storage.from('progress-reports')
    .upload(storagePath, bytes, { upsert: true, contentType: 'application/pdf' })
  if (upErr) throw new Error(`progress report upload: ${upErr.message}`)
  const { data: pub } = sb.storage.from('progress-reports').getPublicUrl(storagePath)

  const { error: prErr } = await sb.from('progress_reports').insert({
    student_id: STUDENT_ID,
    title: 'Progress Report — Summer 2026',
    pdf_url: pub.publicUrl,
    sessions_covered: PAST_SESSIONS.length,
  })
  if (prErr) throw new Error(`progress_reports insert: ${prErr.message}`)
  console.log(`Progress report uploaded: ${pub.publicUrl}`)
}

async function seedDemoHistory() {
  const user = await findUser()
  if (!user) throw new Error('No auth user found for the test student yet — run the script with no flag first.')

  console.log('Wiping any previous demo rows...')
  await sb.from('session_problems').delete().like('session_id', 'demo-session-%')
  await sb.from('assignments').delete().like('id', 'demo-assign-%')
  await sb.from('sessions').delete().like('id', 'demo-session-%')
  await sb.from('invoices').delete().eq('student_id', STUDENT_ID)
  await sb.from('progress_reports').delete().eq('student_id', STUDENT_ID)
  await sb.from('fma_attempts').delete().eq('student_id', STUDENT_ID).eq('mode', 'score_only')

  console.log('Switching the test account to an adult (self-pay) role so Billing/Invoices show...')
  await sb.from('profiles').update({ account_type: 'adult' }).eq('id', user.id)

  const boardSpecs = [...PAST_SESSIONS, ...UPCOMING_SESSIONS].map(s => ({
    key: `demo-session-${s.date}`,
    name: `Test Student – ${boardDateLabel(s.date)}`,
    notes: s.notes,
  }))
  console.log(`Creating ${boardSpecs.length} real Miro boards...`)
  const boards = await createBoards(boardSpecs)

  const sessionRows = [
    ...PAST_SESSIONS.map(s => ({
      id: `demo-session-${s.date}`,
      student_id: STUDENT_ID,
      scheduled_at: `${s.date}T20:00:00Z`,
      end_time: `${s.date}T21:00:00Z`,
      summary: s.summary,
      tags: s.tags,
      miro_board_id: boards[`demo-session-${s.date}`]?.id || null,
      miro_board_url: boards[`demo-session-${s.date}`]?.url || null,
      balance_decremented: true,
    })),
    ...UPCOMING_SESSIONS.map(s => ({
      id: `demo-session-${s.date}`,
      student_id: STUDENT_ID,
      scheduled_at: `${s.date}T20:00:00Z`,
      end_time: `${s.date}T21:00:00Z`,
      tags: [],
      miro_board_id: boards[`demo-session-${s.date}`]?.id || null,
      miro_board_url: boards[`demo-session-${s.date}`]?.url || null,
      balance_decremented: false,
    })),
  ]
  const { error: sessErr } = await sb.from('sessions').insert(sessionRows)
  if (sessErr) throw new Error(`sessions insert: ${sessErr.message}`)
  console.log(`Inserted ${sessionRows.length} sessions (${PAST_SESSIONS.length} past, ${UPCOMING_SESSIONS.length} upcoming).`)

  const spRows = PAST_SESSIONS.flatMap(s => s.problems.map(pid => ({
    session_id: `demo-session-${s.date}`,
    student_id: STUDENT_ID,
    problem_id: pid,
    problem_name: problemLabel(pid),
  })))
  const { error: spErr } = await sb.from('session_problems').insert(spRows)
  if (spErr) throw new Error(`session_problems insert: ${spErr.message}`)
  console.log(`Inserted ${spRows.length} session_problems.`)

  // Assignments go in AFTER sessions so the due-date trigger picks up the
  // next upcoming session automatically (day before it, for active ones).
  const assignRows = [
    ...ACTIVE_ASSIGNMENTS.map(a => ({
      id: `demo-assign-${a.problem_id}`,
      student_id: STUDENT_ID,
      problem_id: a.problem_id,
      status: 'assigned',
      assigned_date: a.assigned_date,
      requires_submission: true,
    })),
    ...COMPLETED_ASSIGNMENTS.map(a => ({
      id: `demo-assign-${a.problem_id}`,
      student_id: STUDENT_ID,
      problem_id: a.problem_id,
      status: 'completed',
      assigned_date: a.assigned_date,
      completed_date: a.completed_date,
      requires_submission: false,
    })),
  ]
  const { error: aErr } = await sb.from('assignments').insert(assignRows)
  if (aErr) throw new Error(`assignments insert: ${aErr.message}`)
  console.log(`Inserted ${assignRows.length} assignments (${ACTIVE_ASSIGNMENTS.length} active, ${COMPLETED_ASSIGNMENTS.length} completed).`)

  const { error: iErr } = await sb.from('invoices').insert(INVOICES.map(i => ({ student_id: STUDENT_ID, ...i })))
  if (iErr) throw new Error(`invoices insert: ${iErr.message}`)
  await sb.from('students').update({ session_balance: 3, hourly_rate: 300, billing_name: 'Test Student' }).eq('id', STUDENT_ID)
  console.log(`Inserted ${INVOICES.length} invoices, set session balance/rate.`)

  const { error: fmaErr } = await sb.from('fma_attempts').insert(FMA_ATTEMPTS.map(f => ({
    student_id: STUDENT_ID,
    exam_id: f.exam_id,
    mode: 'score_only',
    status: 'graded',
    started_at: f.at,
    submitted_at: f.at,
    score: f.score,
  })))
  if (fmaErr) throw new Error(`fma_attempts insert: ${fmaErr.message}`)
  console.log(`Inserted ${FMA_ATTEMPTS.length} F=ma practice attempts.`)

  await draftAndUploadReport()

  console.log(`\nDemo history seeded for ${STUDENT_ID}.`)
}

const arg = process.argv[2]
if (arg === '--reset') {
  await reset()
} else if (arg === '--link') {
  console.log(await magicLink())
} else if (arg === '--demo') {
  await ensure()
  await seedDemoHistory()
  console.log(`\nLogin as this student (single use, expires in ~1h):\n`)
  console.log(await magicLink())
  console.log(`\nOr from ${PORTAL} choose "Send login link" and enter:\n  ${EMAIL}`)
} else {
  await ensure()
  console.log(`\nLogin as this student (opens the F=ma tab, single use, expires in ~1h):\n`)
  console.log(await magicLink())
  console.log(`\nOr from ${PORTAL} choose "Send login link" and enter:\n  ${EMAIL}`)
}
