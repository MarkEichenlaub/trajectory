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

  // Find sessions starting in 8–13 minutes that haven't had a reminder sent yet.
  // The 5-minute window ensures we catch sessions even if the cron fires slightly late.
  // Parent check-ins are excluded: the reminder is addressed to the student and
  // points at their whiteboard, neither of which applies to a check-in. Google
  // Calendar's own notification already covers those guests.
  const { data: sessions, error: sErr } = await admin
    .from('sessions')
    .select(`
      id,
      student_id,
      scheduled_at,
      meet_url,
      miro_board_url,
      students!inner(id, first_name, name, timezone)
    `)
    .eq('session_type', 'session')
    .gte('scheduled_at', new Date(Date.now() + 8 * 60 * 1000).toISOString())
    .lt('scheduled_at', new Date(Date.now() + 13 * 60 * 1000).toISOString())
    .is('session_reminder_sent_at', null)

  if (sErr) {
    console.error('Error fetching sessions:', sErr.message)
    return new Response('DB error', { status: 500 })
  }

  if (!sessions?.length) {
    return new Response(JSON.stringify({ ok: true, sent: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let sent = 0

  for (const session of sessions) {
    const student = session.students as { id: string; first_name: string; name: string; timezone: string | null }
    const firstName = student.first_name || student.name.split(' ')[0]
    const tz = student.timezone || 'America/New_York'

    // Find contacts opted in to session reminders
    const { data: contacts } = await admin
      .from('student_contacts')
      .select('email')
      .eq('student_id', student.id)
      .eq('receives_session_reminders', true)
      .eq('verified', true)
      .eq('bounced', false)

    if (!contacts?.length) {
      // Mark as sent anyway so we don't keep re-querying on every cron tick
      await admin
        .from('sessions')
        .update({ session_reminder_sent_at: new Date().toISOString() })
        .eq('id', session.id)
      continue
    }

    // Find the student's current open assignment (most recently assigned)
    const { data: openAssignments } = await admin
      .from('assignments')
      .select(`
        id,
        problem_id,
        problems!inner(name, contest, year, label)
      `)
      .eq('student_id', student.id)
      .eq('status', 'assigned')
      .order('assigned_date', { ascending: false })
      .limit(1)

    const openAssignment = openAssignments?.[0]
    const problem = openAssignment?.problems as { name: string; contest: string; year: number; label: string } | null
    const problemLabel = problem
      ? `${problem.contest} ${problem.year} ${problem.label} — ${problem.name}`
      : null

    // Format session time in student's timezone
    const sessionTime = new Date(session.scheduled_at).toLocaleString('en-US', {
      timeZone: tz,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    })

    const lines = [
      `Hi ${firstName},`,
      '',
      `Just a reminder — your physics session with Mark starts in about 10 minutes (${sessionTime}).`,
      '',
    ]

    if (session.meet_url) {
      lines.push(`Join the video call: ${session.meet_url}`)
    }
    if (session.miro_board_url) {
      lines.push(`Whiteboard: ${session.miro_board_url}`)
    }
    if (problemLabel) {
      lines.push('')
      lines.push(`Your current assignment: ${problemLabel}`)
    }

    lines.push('')
    lines.push(`Schedule sessions, view assignments, and check session summaries anytime at: ${PORTAL_URL}`)
    lines.push('')
    lines.push('— Mark')

    const emailBody = lines.join('\n')

    const recipients = contacts.map(c => c.email as string).filter(Boolean)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
        bcc: 'mark.d.eichenlaub@gmail.com',
        to: recipients,
        subject: `Physics session with Mark in ~10 minutes`,
        text: emailBody,
      }),
    })

    if (!res.ok) {
      console.error(`Failed to send reminder for session ${session.id}:`, res.status, await res.text())
    } else {
      sent++
    }

    // Always mark the session so we don't attempt again on the next cron tick
    await admin
      .from('sessions')
      .update({ session_reminder_sent_at: new Date().toISOString() })
      .eq('id', session.id)
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
