import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SB_PUBLISHABLE_KEY')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN')!
const MIRO_ACCESS_TOKEN = Deno.env.get('MIRO_ACCESS_TOKEN')!
const MIRO_TEAM_ID = Deno.env.get('MIRO_TEAM_ID')!
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
  start: string; end: string; method: 'REQUEST' | 'CANCEL'
  attendeeEmails: string[]; sequence?: number
}): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Eichenlaub Physics//Portal//EN',
    `METHOD:${params.method}`,
    'BEGIN:VEVENT',
    `UID:${params.uid}`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(params.start)}`,
    `DTEND:${toIcsDate(params.end)}`,
    `SEQUENCE:${params.sequence ?? 0}`,
    `SUMMARY:${params.summary}`,
    `DESCRIPTION:${params.description.replace(/\n/g, '\\n')}`,
    'ORGANIZER:mailto:mark@eichenlaubphysics.com',
    ...params.attendeeEmails.map(e => `ATTENDEE;RSVP=TRUE:mailto:${e}`),
    ...(params.method === 'CANCEL' ? ['STATUS:CANCELLED'] : []),
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
    .from('students').select('id, name, first_name, email').eq('user_id', user.id).maybeSingle()
  if (!student) return json({ error: 'no student record' }, 403)

  const { slot } = await req.json() as { slot: string }
  if (!slot) return json({ error: 'slot required' }, 400)

  const slotDate = new Date(slot)
  if (isNaN(slotDate.getTime())) return json({ error: 'invalid slot' }, 400)
  if (slotDate.getTime() - Date.now() < MIN_NOTICE_HOURS * 3_600_000) {
    return json({ error: 'slot is too soon (24h minimum notice required)' }, 400)
  }

  const endDate = new Date(slotDate.getTime() + SESSION_DURATION_MIN * 60_000)

  let accessToken: string
  try {
    accessToken = await getGoogleAccessToken()
  } catch (e) {
    return json({ error: 'Google auth failed', detail: String(e) }, 500)
  }

  // Re-verify the slot is still available (prevents race conditions)
  const busy = await fetchBusy(accessToken, slot, endDate.toISOString())
  if (overlapsAny(slotDate, busy)) return json({ error: 'slot is no longer available' }, 409)

  // Create Google Calendar event
  const dateStr = slotDate.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: TIMEZONE,
  })
  const calRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: `${student.name}/Mark Physics`,
      description: `Physics tutoring session\n\nPortal: ${PORTAL_URL}`,
      start: { dateTime: slotDate.toISOString(), timeZone: TIMEZONE },
      end: { dateTime: endDate.toISOString(), timeZone: TIMEZONE },
    }),
  })
  if (!calRes.ok) {
    const text = await calRes.text()
    console.error('Google Calendar create failed:', calRes.status, text)
    return json({ error: 'Failed to create calendar event', detail: text }, 500)
  }
  const calEvent = await calRes.json() as { id: string }
  const gcalEventId = calEvent.id

  // Create Miro board
  let miroBoardUrl = ''
  let miroBoardId = ''
  try {
    const miroRes = await fetch('https://api.miro.com/v2/boards', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MIRO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ name: `${student.name} – ${dateStr}`, teamId: MIRO_TEAM_ID, sharingPolicy: { access: 'edit' } }),
    })
    if (miroRes.ok) {
      const d = await miroRes.json() as Record<string, unknown>
      miroBoardId = d.id as string
      miroBoardUrl = (d.viewLink as string) ?? `https://miro.com/app/board/${miroBoardId}/`
    } else {
      console.error('Miro API error:', miroRes.status, await miroRes.text())
    }
  } catch (e) {
    console.error('Miro fetch error:', e)
  }

  // Patch Google Calendar event description with Miro URL
  if (miroBoardUrl) {
    await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${gcalEventId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: `Physics tutoring session\n\nMiro whiteboard: ${miroBoardUrl}\nPortal: ${PORTAL_URL}`,
      }),
    }).catch(e => console.error('Calendar PATCH error:', e))
  }

  // Insert session row
  const sessionId = `gcal-${student.id}-${gcalEventId}`
  const { error: dbErr } = await admin.from('sessions').insert({
    id: sessionId,
    student_id: student.id,
    scheduled_at: slotDate.toISOString(),
    end_time: endDate.toISOString(),
    notes: '',
    miro_board_id: miroBoardId,
    miro_board_url: miroBoardUrl,
    gcal_event_id: gcalEventId,
    balance_decremented: false,
  })
  if (dbErr) {
    console.error('Session insert error:', dbErr)
    return json({ error: 'DB insert failed', detail: dbErr.message }, 500)
  }

  // Get student contact emails for schedule notifications
  const { data: contacts } = await admin
    .from('student_contacts').select('email')
    .eq('student_id', student.id)
    .eq('receives_schedule_changes', true)
    .eq('verified', true).eq('bounced', false)
  const studentEmails = (contacts ?? []).map(c => c.email as string).filter(Boolean)
  if (!studentEmails.length && student.email) studentEmails.push(student.email as string)

  // Send ICS confirmation email
  const when = fmtWhen(slotDate.toISOString())
  const icsUid = sessionId
  const icsDescription = miroBoardUrl
    ? `Miro whiteboard: ${miroBoardUrl}\nPortal: ${PORTAL_URL}`
    : `Portal: ${PORTAL_URL}`

  const icsContent = buildIcs({
    uid: icsUid,
    summary: `${student.name}/Mark Physics`,
    description: icsDescription,
    start: slotDate.toISOString(),
    end: endDate.toISOString(),
    method: 'REQUEST',
    attendeeEmails: [...studentEmails, MARK_EMAIL],
  })

  const confirmText = [
    `Hi ${(student.first_name as string | undefined) || (student.name as string).split(' ')[0]},`,
    '',
    `Your physics session is confirmed for:`,
    `  ${when}`,
    '',
    ...(miroBoardUrl ? [`Miro whiteboard: ${miroBoardUrl}`, ''] : []),
    `See all your sessions at: ${PORTAL_URL}`,
    '',
    'See you then!',
    'Mark',
  ].join('\n')

  if (studentEmails.length) {
    await sendIcsEmail({
      to: studentEmails,
      subject: `Session confirmed: ${when}`,
      text: confirmText,
      icsContent,
    })
  }
  await sendIcsEmail({
    to: [MARK_EMAIL],
    subject: `New session booked: ${student.name} – ${when}`,
    text: `${student.name} booked a session for ${when}.\n\nMiro: ${miroBoardUrl || '(pending)'}`,
    icsContent,
  })

  return json({
    ok: true,
    session_id: sessionId,
    scheduled_at: slotDate.toISOString(),
    end_time: endDate.toISOString(),
    miro_board_url: miroBoardUrl,
    miro_board_id: miroBoardId,
    gcal_event_id: gcalEventId,
  })
})
