import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SB_PUBLISHABLE_KEY')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

const MARK_EMAIL = 'mark.d.eichenlaub@gmail.com'
const MARK_AOPS = 'eichenlaub@artofproblemsolving.com'
const PORTAL_URL = 'https://portal.eichenlaubphysics.com/'
const TIMEZONE = 'America/Los_Angeles'
const SESSION_DURATION_MIN = 60
const MIN_NOTICE_HOURS = 24

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

async function getGoogleAccessToken(): Promise<string> {
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
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`)
  const data = await res.json() as { access_token?: string }
  if (!data.access_token) throw new Error('No access_token')
  return data.access_token
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

function buildIcs(params: {
  uid: string; summary: string; description: string
  start: string; end: string; attendeeEmails: string[]; sequence?: number
}): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Eichenlaub Physics//Portal//EN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${params.uid}`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(params.start)}`,
    `DTEND:${toIcsDate(params.end)}`,
    `SEQUENCE:${params.sequence ?? 1}`,
    `SUMMARY:${params.summary}`,
    `DESCRIPTION:${params.description.replace(/\n/g, '\\n')}`,
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

function overlapsAny(slotStart: Date, busy: { start: string; end: string }[]): boolean {
  const s = slotStart.getTime()
  const e = s + SESSION_DURATION_MIN * 60_000
  return busy.some(b => s < new Date(b.end).getTime() && e > new Date(b.start).getTime())
}

async function fetchBusy(
  accessToken: string, timeMin: string, timeMax: string,
): Promise<{ start: string; end: string }[]> {
  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeMin, timeMax,
      items: [{ id: MARK_EMAIL }, { id: MARK_AOPS }],
    }),
  })
  const data = await res.json() as {
    calendars?: Record<string, { busy?: { start: string; end: string }[] }>
  }
  const busy: { start: string; end: string }[] = []
  for (const cal of Object.values(data.calendars ?? {})) busy.push(...(cal.busy ?? []))
  return busy
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

  const { session_id, new_slot } = await req.json() as { session_id: string; new_slot: string }
  if (!session_id || !new_slot) return json({ error: 'session_id and new_slot required' }, 400)

  // Fetch session and verify ownership
  const { data: session } = await admin
    .from('sessions')
    .select('id, student_id, scheduled_at, end_time, gcal_event_id, balance_decremented, miro_board_url')
    .eq('id', session_id).eq('student_id', student.id).maybeSingle()
  if (!session) return json({ error: 'session not found' }, 404)
  if (session.balance_decremented) return json({ error: 'session already completed' }, 400)
  if (session.end_time && new Date(session.end_time as string).getTime() < Date.now()) {
    return json({ error: 'session has already ended' }, 400)
  }

  const newSlotDate = new Date(new_slot)
  if (isNaN(newSlotDate.getTime())) return json({ error: 'invalid new_slot' }, 400)
  if (newSlotDate.getTime() - Date.now() < MIN_NOTICE_HOURS * 3_600_000) {
    return json({ error: 'new slot is too soon (24h minimum notice required)' }, 400)
  }
  const newEndDate = new Date(newSlotDate.getTime() + SESSION_DURATION_MIN * 60_000)

  let accessToken: string
  try {
    accessToken = await getGoogleAccessToken()
  } catch (e) {
    return json({ error: 'Google auth failed' }, 500)
  }

  // Verify new slot is available, excluding the current session's time window
  const busy = await fetchBusy(accessToken, new_slot, newEndDate.toISOString())
  const oldStart = new Date(session.scheduled_at as string).getTime()
  const oldEnd = session.end_time ? new Date(session.end_time as string).getTime() : oldStart + SESSION_DURATION_MIN * 60_000
  const filteredBusy = busy.filter(b => {
    const bStart = new Date(b.start).getTime()
    const bEnd = new Date(b.end).getTime()
    return !(bStart >= oldStart && bEnd <= oldEnd)
  })
  if (overlapsAny(newSlotDate, filteredBusy)) return json({ error: 'new slot is not available' }, 409)

  // Patch Google Calendar event if this session has a gcal_event_id
  if (session.gcal_event_id) {
    const patchRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${session.gcal_event_id}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: { dateTime: newSlotDate.toISOString(), timeZone: TIMEZONE },
          end: { dateTime: newEndDate.toISOString(), timeZone: TIMEZONE },
        }),
      },
    )
    if (!patchRes.ok) {
      console.error('Google Calendar PATCH failed:', patchRes.status, await patchRes.text())
    }
  }

  // Update DB
  const { error: dbErr } = await admin.from('sessions').update({
    scheduled_at: newSlotDate.toISOString(),
    end_time: newEndDate.toISOString(),
  }).eq('id', session_id)
  if (dbErr) return json({ error: 'DB update failed', detail: dbErr.message }, 500)

  // Get contact emails
  const { data: contacts } = await admin
    .from('student_contacts').select('email')
    .eq('student_id', student.id)
    .eq('receives_schedule_changes', true)
    .eq('verified', true).eq('bounced', false)
  const studentEmails = (contacts ?? []).map(c => c.email as string).filter(Boolean)
  if (!studentEmails.length && student.email) studentEmails.push(student.email as string)

  const oldWhen = fmtWhen(session.scheduled_at as string)
  const newWhen = fmtWhen(newSlotDate.toISOString())
  const miroUrl = session.miro_board_url as string | undefined
  const icsContent = buildIcs({
    uid: session_id,
    summary: `${student.name}/Mark Physics`,
    description: `Rescheduled session.${miroUrl ? `\n\nMiro whiteboard: ${miroUrl}` : ''}\nPortal: ${PORTAL_URL}`,
    start: newSlotDate.toISOString(),
    end: newEndDate.toISOString(),
    attendeeEmails: [...studentEmails, MARK_EMAIL],
    sequence: 1,
  })

  const rescheduleText = [
    `Hi ${(student.name as string).split(' ')[0]},`,
    '',
    `Your physics session has been rescheduled.`,
    '',
    `Previously: ${oldWhen}`,
    `Now: ${newWhen}`,
    '',
    `See all your sessions at: ${PORTAL_URL}`,
  ].join('\n')

  if (studentEmails.length) {
    await sendIcsEmail({
      to: studentEmails,
      subject: `Session rescheduled: ${newWhen}`,
      text: rescheduleText,
      icsContent,
    })
  }
  await sendIcsEmail({
    to: [MARK_EMAIL],
    subject: `Session rescheduled: ${student.name} – ${newWhen}`,
    text: `${student.name} rescheduled.\n\nPreviously: ${oldWhen}\nNow: ${newWhen}`,
    icsContent,
  })

  return json({ ok: true, scheduled_at: newSlotDate.toISOString(), end_time: newEndDate.toISOString() })
})
