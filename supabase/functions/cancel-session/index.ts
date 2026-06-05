import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SB_PUBLISHABLE_KEY')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

const MARK_EMAIL = 'mark.d.eichenlaub@gmail.com'
const PORTAL_URL = 'https://portal.eichenlaubphysics.com/'
const TIMEZONE = 'America/Los_Angeles'
const SESSION_DURATION_MIN = 60

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

async function getGoogleAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: GOOGLE_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }).toString(),
    })
    if (!res.ok) return null
    const data = await res.json() as { access_token?: string }
    return data.access_token ?? null
  } catch {
    return null
  }
}

function fmtWhen(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    timeZone: TIMEZONE,
  })
}

function toIcsDate(iso: string): string {
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  bytes.forEach(b => { binary += String.fromCharCode(b) })
  return btoa(binary)
}

function buildCancelIcs(params: {
  uid: string; summary: string; start: string; end: string; attendeeEmails: string[]
}): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Eichenlaub Physics//Portal//EN',
    'METHOD:CANCEL',
    'BEGIN:VEVENT',
    `UID:${params.uid}`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(params.start)}`,
    `DTEND:${toIcsDate(params.end)}`,
    'SEQUENCE:2',
    `SUMMARY:${params.summary}`,
    'STATUS:CANCELLED',
    'ORGANIZER:mailto:mark@eichenlaubphysics.com',
    ...params.attendeeEmails.map(e => `ATTENDEE;RSVP=TRUE:mailto:${e}`),
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

async function sendIcsEmail(params: {
  to: string[]; subject: string; text: string; icsContent: string
}): Promise<void> {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
      to: params.to,
      subject: params.subject,
      text: params.text,
      attachments: [{ filename: 'session.ics', content: toBase64(params.icsContent) }],
    }),
  }).catch(e => console.error('Email send failed:', e))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const authHeader = req.headers.get('Authorization') || ''
  if (!authHeader) return json({ error: 'unauthorized' }, 401)
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return json({ error: 'unauthorized' }, 401)

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const { data: student } = await admin
    .from('students').select('id, name, email').eq('user_id', user.id).maybeSingle()
  if (!student) return json({ error: 'no student record' }, 403)

  const { session_id, message } = await req.json() as { session_id: string; message?: string }
  if (!session_id) return json({ error: 'session_id required' }, 400)

  // Fetch session and verify ownership
  const { data: session } = await admin
    .from('sessions')
    .select('id, student_id, scheduled_at, end_time, gcal_event_id, balance_decremented')
    .eq('id', session_id).eq('student_id', student.id).maybeSingle()
  if (!session) return json({ error: 'session not found' }, 404)
  if (session.balance_decremented) return json({ error: 'session already completed, cannot cancel' }, 400)
  if (session.end_time && new Date(session.end_time as string).getTime() < Date.now()) {
    return json({ error: 'session has already ended' }, 400)
  }

  // Delete Google Calendar event if we have the event ID (best-effort)
  if (session.gcal_event_id) {
    const accessToken = await getGoogleAccessToken()
    if (accessToken) {
      const delRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${session.gcal_event_id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } },
      )
      if (!delRes.ok && delRes.status !== 404 && delRes.status !== 410) {
        console.error('Google Calendar DELETE failed:', delRes.status, await delRes.text())
      }
    }
  }

  // Delete DB session row — trigger clears non-overridden assignment due dates automatically
  const { error: dbErr } = await admin.from('sessions').delete()
    .eq('id', session_id).eq('balance_decremented', false)
  if (dbErr) return json({ error: 'DB delete failed', detail: dbErr.message }, 500)

  // Warn Mark if any assignments have manually-overridden due dates (trigger won't touch those)
  const { data: overridden } = await admin
    .from('assignments')
    .select('problem_id, due_date')
    .eq('student_id', student.id)
    .eq('requires_submission', true)
    .eq('due_date_overridden', true)
    .in('status', ['assigned', 'submitted'])
  if (overridden?.length) {
    const cancelledWhen = fmtWhen(session.scheduled_at as string)
    const lines = overridden.map(a => `  - ${a.problem_id}: due ${a.due_date}`)
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
        to: [MARK_EMAIL],
        subject: `Heads up: ${student.name}'s session cancelled — check assignment due dates`,
        text: [
          `${student.name}'s session for ${cancelledWhen} was cancelled.`,
          '',
          'These assignments have manually-set due dates that were NOT auto-updated:',
          ...lines,
          '',
          `Review them at: ${PORTAL_URL}`,
        ].join('\n'),
      }),
    }).catch(e => console.error('Warning email failed:', e))
  }

  // Get contact emails
  const { data: contacts } = await admin
    .from('student_contacts').select('email')
    .eq('student_id', student.id)
    .eq('receives_schedule_changes', true)
    .eq('verified', true).eq('bounced', false)
  const studentEmails = (contacts ?? []).map(c => c.email as string).filter(Boolean)
  if (!studentEmails.length && student.email) studentEmails.push(student.email as string)

  const when = fmtWhen(session.scheduled_at as string)
  const sessionEnd = session.end_time
    ? (session.end_time as string)
    : new Date(new Date(session.scheduled_at as string).getTime() + SESSION_DURATION_MIN * 60_000).toISOString()

  const icsContent = buildCancelIcs({
    uid: session_id,
    summary: `${student.name}/Mark Physics`,
    start: session.scheduled_at as string,
    end: sessionEnd,
    attendeeEmails: [...studentEmails, MARK_EMAIL],
  })

  const cancelBody = [
    `Your physics session for ${when} has been cancelled.`,
    ...(message ? ['', `Message: ${message}`] : []),
    '',
    `To book a new time, visit: ${PORTAL_URL}`,
  ].join('\n')

  if (studentEmails.length) {
    await sendIcsEmail({
      to: studentEmails,
      subject: `Session cancelled: ${when}`,
      text: cancelBody,
      icsContent,
    })
  }
  await sendIcsEmail({
    to: [MARK_EMAIL],
    subject: `Session cancelled: ${student.name} – ${when}`,
    text: `${student.name} cancelled their session for ${when}.${message ? '\n\nMessage: ' + message : ''}`,
    icsContent,
  })

  return json({ ok: true })
})
