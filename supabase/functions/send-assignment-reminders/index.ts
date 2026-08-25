import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')!

const PORTAL_URL = 'https://portal.eichenlaubphysics.com/'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok')

  const cronSecret = req.headers.get('X-Cron-Secret')
  if (cronSecret !== CRON_SECRET) return new Response('unauthorized', { status: 401 })

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Today's date in Pacific time as a YYYY-MM-DD string.
  // The DB stores due_date as a date (no timezone), so we compare as-is.
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })

  // Find all assigned+unsubmitted assignments due today that require submission
  const { data: assignments, error: aErr } = await admin
    .from('assignments')
    .select(`
      id,
      student_id,
      problem_id,
      students!inner(id, first_name, name)
    `)
    .eq('due_date', today)
    .eq('status', 'assigned')
    .eq('requires_submission', true)

  if (aErr) {
    console.error('Error fetching assignments:', aErr.message)
    return new Response('DB error', { status: 500 })
  }

  if (!assignments?.length) {
    return new Response(JSON.stringify({ ok: true, sent: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Collect unique problem IDs for a single batch lookup
  const problemIds = [...new Set(assignments.map(a => a.problem_id))]
  const { data: problems } = await admin
    .from('problems')
    .select('id, name, contest, year, label')
    .in('id', problemIds)
  const problemMap = new Map((problems ?? []).map(p => [p.id, p]))

  let sent = 0

  for (const assignment of assignments) {
    const student = assignment.students as { id: string; first_name: string; name: string }
    const problem = problemMap.get(assignment.problem_id)
    const problemLabel = problem
      ? `${problem.contest} ${problem.year} ${problem.label} — ${problem.name}`
      : assignment.problem_id
    const firstName = student.first_name || student.name.split(' ')[0]

    // Find all contacts for this student who have reminders enabled
    const { data: contacts } = await admin
      .from('student_contacts')
      .select('email')
      .eq('student_id', student.id)
      .eq('receives_assignment_reminders', true)
      .eq('verified', true)
      .eq('bounced', false)

    if (!contacts?.length) continue

    const recipients = contacts.map(c => c.email as string).filter(Boolean)
    if (!recipients.length) continue

    const emailBody = [
      `Hi ${firstName},`,
      '',
      'Quick reminder — you have a physics assignment due today:',
      '',
      problemLabel,
      '',
      'To submit, log in to the portal and click Submit next to the assignment:',
      PORTAL_URL,
      '',
      "If you've already submitted, ignore this!",
      '',
      'Scheduling, assignments, and session summaries are always available in the portal.',
      '',
      '— Mark',
    ].join('\n')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
        bcc: 'mark.d.eichenlaub@gmail.com',
        to: recipients,
        subject: `Reminder: ${problem?.name ?? assignment.problem_id} is due today`,
        text: emailBody,
      }),
    })

    if (!res.ok) {
      console.error(`Failed to send reminder for assignment ${assignment.id}:`, res.status, await res.text())
    } else {
      sent++
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
