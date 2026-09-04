import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')!

const PORTAL_URL = 'https://portal.eichenlaubphysics.com/'
const MARK_EMAIL = 'mark.d.eichenlaub@gmail.com'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok')

  const cronSecret = req.headers.get('X-Cron-Secret')
  if (cronSecret !== CRON_SECRET) return new Response('unauthorized', { status: 401 })

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const now = new Date().toISOString()

  // Students with a real tutoring session still on the books — not flagged.
  const { data: futureSessions, error: futureErr } = await admin
    .from('sessions')
    .select('student_id')
    .eq('session_type', 'session')
    .gt('scheduled_at', now)

  if (futureErr) {
    console.error('Error fetching future sessions:', futureErr.message)
    return new Response('DB error', { status: 500 })
  }

  // Students who've had at least one real past session — proves they're an
  // active student and not just mid-onboarding with nothing scheduled yet.
  const { data: pastSessions, error: pastErr } = await admin
    .from('sessions')
    .select('student_id, scheduled_at')
    .eq('session_type', 'session')
    .lt('scheduled_at', now)
    .order('scheduled_at', { ascending: false })

  if (pastErr) {
    console.error('Error fetching past sessions:', pastErr.message)
    return new Response('DB error', { status: 500 })
  }

  const scheduledIds = new Set((futureSessions ?? []).map(s => s.student_id))

  // First row per student wins since pastSessions is ordered most-recent-first.
  const lastSessionByStudent = new Map<string, string>()
  for (const s of pastSessions ?? []) {
    if (!lastSessionByStudent.has(s.student_id)) {
      lastSessionByStudent.set(s.student_id, s.scheduled_at)
    }
  }

  const flaggedIds = [...lastSessionByStudent.keys()].filter(
    id => !scheduledIds.has(id) && id !== 'test-student',
  )

  if (!flaggedIds.length) {
    return new Response(JSON.stringify({ ok: true, flagged: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data: students, error: sErr } = await admin
    .from('students')
    .select('id, name')
    .in('id', flaggedIds)

  if (sErr) {
    console.error('Error fetching students:', sErr.message)
    return new Response('DB error', { status: 500 })
  }

  const studentMap = new Map((students ?? []).map(s => [s.id, s.name as string]))

  const lines = flaggedIds
    .map(id => {
      const name = studentMap.get(id) ?? id
      const lastDate = new Date(lastSessionByStudent.get(id)!).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'America/Los_Angeles',
      })
      return { name, line: `- ${name} — last session ${lastDate}` }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(x => x.line)

  const emailBody = [
    'The following students have no future session on the calendar:',
    '',
    ...lines,
    '',
    `Portal: ${PORTAL_URL}`,
  ].join('\n')

  const count = flaggedIds.length
  const subject = `${count} student${count === 1 ? '' : 's'} ${count === 1 ? 'has' : 'have'} no upcoming session scheduled`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
      to: MARK_EMAIL,
      subject,
      text: emailBody,
    }),
  })

  if (!res.ok) {
    console.error('Failed to send flagged-students email:', res.status, await res.text())
    return new Response('Email error', { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true, flagged: count }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
