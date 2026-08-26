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
const TIMEZONE = 'America/New_York'
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

function fmtWhen(iso: string, tz: string = TIMEZONE): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    timeZone: tz,
  })
}

// deno-lint-ignore no-explicit-any
async function resolveSelfStudent(admin: any, userId: string) {
  const { data: links } = await admin
    .from('student_links').select('student_id, relationship').eq('account_id', userId)
  const link = (links || []).find((l: { relationship: string }) => l.relationship === 'self') || (links || [])[0]
  if (!link) return null
  const { data: student } = await admin
    .from('students').select('id, name, first_name, email, timezone').eq('id', link.student_id).maybeSingle()
  return student
}

// Calendar entries are delivered as real Google Calendar invitations (see the
// attendee PATCH below), so this is a plain notification email with no .ics.
async function sendPlainEmail(params: {
  to: string[]; subject: string; text: string
}): Promise<void> {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
      bcc: 'mark.d.eichenlaub@gmail.com',
      to: params.to,
      subject: params.subject,
      text: params.text,
    }),
  }).catch(e => console.error('Email send failed:', e))
}

// Google's conferenceData.createRequest is async and occasionally comes back
// empty on the initial create (status stays "pending"). Retry once via PATCH.
async function ensureMeet(accessToken: string, eventId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?conferenceDataVersion=1`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conferenceData: {
            createRequest: {
              requestId: `meet-${eventId}-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        }),
      },
    )
    if (res.ok) {
      const data = await res.json() as {
        hangoutLink?: string
        conferenceData?: { entryPoints?: { entryPointType?: string; uri?: string }[] }
      }
      return data.hangoutLink
        || data.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri
        || ''
    }
    console.error('Meet retry failed:', res.status, await res.text())
  } catch (e) {
    console.error('Meet retry error:', e)
  }
  return ''
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

  const { slot, student_id: bookForId } = await req.json() as { slot: string; student_id?: string }
  if (!slot) return json({ error: 'slot required' }, 400)

  // A caller normally books for their own linked student. An admin may pass a
  // student_id to book on that student's behalf (e.g. a parent emailed a time).
  let isAdminCaller = false
  let student
  if (bookForId) {
    const { data: prof } = await admin
      .from('profiles').select('account_type').eq('id', user.id).maybeSingle()
    isAdminCaller = prof?.account_type === 'admin'
    if (!isAdminCaller) return json({ error: 'forbidden: admin only' }, 403)
    const { data: s } = await admin
      .from('students').select('id, name, first_name, email, timezone').eq('id', bookForId).maybeSingle()
    student = s
  } else {
    student = await resolveSelfStudent(admin, user.id)
  }
  if (!student) return json({ error: 'no student record' }, 403)
  const tz = (student.timezone as string) || TIMEZONE

  const slotDate = new Date(slot)
  if (isNaN(slotDate.getTime())) return json({ error: 'invalid slot' }, 400)
  // No minimum-notice rule: last-minute booking is allowed on purpose. The only
  // floor is that the slot hasn't already started.
  if (slotDate.getTime() < Date.now()) {
    return json({ error: 'slot is in the past' }, 400)
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

  // Contacts opted into meeting invites become real Google Calendar guests, so
  // Google keeps their copy in sync whenever the event is moved or cancelled —
  // including when Mark drags it in his own calendar. Fetched before the event is
  // created so they can be attached in the same pass. (receives_meets = the
  // "Meet invites" checkbox; the recurring-schedule functions use the same flag.)
  const { data: contacts } = await admin
    .from('student_contacts').select('email')
    .eq('student_id', student.id)
    .eq('receives_meets', true)
    .eq('verified', true).eq('bounced', false)
  const studentEmails = (contacts ?? []).map(c => c.email as string).filter(Boolean)
  if (!studentEmails.length && student.email) studentEmails.push(student.email as string)

  // Create Google Calendar event (with a Google Meet conference)
  const dateStr = slotDate.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: tz,
  })
  const calRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: `${student.name}/Mark Physics`,
      description: `Physics tutoring session\n\nPortal: ${PORTAL_URL}`,
      start: { dateTime: slotDate.toISOString(), timeZone: tz },
      end: { dateTime: endDate.toISOString(), timeZone: tz },
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    }),
  })
  if (!calRes.ok) {
    const text = await calRes.text()
    console.error('Google Calendar create failed:', calRes.status, text)
    return json({ error: 'Failed to create calendar event', detail: text }, 500)
  }
  const calEvent = await calRes.json() as {
    id: string; hangoutLink?: string
    conferenceData?: { entryPoints?: { entryPointType?: string; uri?: string }[] }
  }
  const gcalEventId = calEvent.id
  let meetUrl = calEvent.hangoutLink
    || calEvent.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri
    || ''
  if (!meetUrl) meetUrl = await ensureMeet(accessToken, gcalEventId)

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
      // Belt-and-suspenders: explicitly set "Anyone with the link can edit"
      await fetch(`https://api.miro.com/v2/boards/${miroBoardId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${MIRO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ sharingPolicy: { access: 'edit' } }),
      }).catch(e => console.error('Miro PATCH sharing error:', e))
    } else {
      console.error('Miro API error:', miroRes.status, await miroRes.text())
    }
  } catch (e) {
    console.error('Miro fetch error:', e)
  }

  // Attach the guests and the final description in one PATCH, with sendUpdates=all
  // so the single Google invitation that goes out already carries the Miro/Meet
  // links. The event is created guest-free above precisely so this is the only
  // notification the family receives.
  const descLines = [
    'Physics tutoring session',
    '',
    ...(miroBoardUrl ? [`Miro whiteboard: ${miroBoardUrl}`] : []),
    ...(meetUrl ? [`Google Meet: ${meetUrl}`] : []),
    `Portal: ${PORTAL_URL}`,
  ]
  const attendeePatch = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${gcalEventId}?sendUpdates=all`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: descLines.join('\n'),
        attendees: studentEmails.map(email => ({ email })),
      }),
    },
  ).catch(e => { console.error('Calendar PATCH error:', e); return null })
  if (attendeePatch && !attendeePatch.ok) {
    console.error('Calendar guest PATCH failed:', attendeePatch.status, await attendeePatch.text())
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
    meet_url: meetUrl,
    gcal_event_id: gcalEventId,
    balance_decremented: false,
  })
  if (dbErr) {
    console.error('Session insert error:', dbErr)
    return json({ error: 'DB insert failed', detail: dbErr.message }, 500)
  }

  // Friendly confirmation email (formatted in the student's own timezone). No .ics
  // attachment: the calendar entry comes from the Google invitation sent above, and
  // a second attached copy would land as a duplicate event.
  const when = fmtWhen(slotDate.toISOString(), tz)

  const confirmText = [
    `Hi ${(student.first_name as string | undefined) || (student.name as string).split(' ')[0]},`,
    '',
    `Your physics session is confirmed for:`,
    `  ${when}`,
    '',
    ...(meetUrl ? [`Join by video (Google Meet): ${meetUrl}`, ''] : []),
    ...(miroBoardUrl ? [`Miro whiteboard: ${miroBoardUrl}`, ''] : []),
    `Schedule sessions, view assignments, and check session summaries anytime at: ${PORTAL_URL}`,
    '',
    'See you then!',
    'Mark',
  ].join('\n')

  if (studentEmails.length) {
    await sendPlainEmail({
      to: studentEmails,
      subject: `Session confirmed: ${when}`,
      text: confirmText,
    })
  }
  await sendPlainEmail({
    to: [MARK_EMAIL],
    subject: `New session booked: ${student.name} – ${when}`,
    text: `${student.name} booked a session for ${when}.\n\nMiro: ${miroBoardUrl || '(pending)'}`,
  })

  return json({
    ok: true,
    session_id: sessionId,
    scheduled_at: slotDate.toISOString(),
    end_time: endDate.toISOString(),
    miro_board_url: miroBoardUrl,
    miro_board_id: miroBoardId,
    meet_url: meetUrl,
    gcal_event_id: gcalEventId,
  })
})
