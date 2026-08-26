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
const TIMEZONE = 'America/New_York'
const SESSION_DURATION_MIN = 60
const CHECKIN_DURATION_MIN = 15

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

// The calendar entry is moved by the Google invitation update (sendUpdates=all on
// the event PATCH), so this is a plain heads-up email with no .ics attachment.
// An attached copy would be a second, competing event in the family's calendar.
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

function overlapsAny(
  slotStart: Date, busy: { start: string; end: string }[], durationMin: number,
): boolean {
  const s = slotStart.getTime()
  const e = s + durationMin * 60_000
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
  const student = await resolveSelfStudent(admin, user.id)
  if (!student) return json({ error: 'no student record' }, 403)
  const tz = (student.timezone as string) || TIMEZONE

  const { session_id, new_slot } = await req.json() as { session_id: string; new_slot: string }
  if (!session_id || !new_slot) return json({ error: 'session_id and new_slot required' }, 400)

  // Fetch session and verify ownership
  const { data: session } = await admin
    .from('sessions')
    .select('id, student_id, session_type, scheduled_at, end_time, gcal_event_id, balance_decremented, miro_board_url')
    .eq('id', session_id).eq('student_id', student.id).maybeSingle()
  if (!session) return json({ error: 'session not found' }, 404)
  // A moved check-in keeps its own 15-minute length; reusing the hour-long
  // constant would silently grow it into a full session slot.
  const isCheckin = session.session_type === 'checkin'
  const durationMin = isCheckin ? CHECKIN_DURATION_MIN : SESSION_DURATION_MIN
  const noun = isCheckin ? 'check-in' : 'session'
  if (session.balance_decremented) return json({ error: 'session already completed' }, 400)
  if (session.end_time && new Date(session.end_time as string).getTime() < Date.now()) {
    return json({ error: `${noun} has already ended`, }, 400)
  }

  const newSlotDate = new Date(new_slot)
  if (isNaN(newSlotDate.getTime())) return json({ error: 'invalid new_slot' }, 400)
  // No minimum-notice rule: moving a session at short notice is allowed on purpose.
  if (newSlotDate.getTime() < Date.now()) {
    return json({ error: 'new slot is in the past' }, 400)
  }
  const newEndDate = new Date(newSlotDate.getTime() + durationMin * 60_000)

  let accessToken: string
  try {
    accessToken = await getGoogleAccessToken()
  } catch (e) {
    return json({ error: 'Google auth failed' }, 500)
  }

  // Verify new slot is available, excluding the current session's time window
  const busy = await fetchBusy(accessToken, new_slot, newEndDate.toISOString())
  const oldStart = new Date(session.scheduled_at as string).getTime()
  const oldEnd = session.end_time ? new Date(session.end_time as string).getTime() : oldStart + durationMin * 60_000
  const filteredBusy = busy.filter(b => {
    const bStart = new Date(b.start).getTime()
    const bEnd = new Date(b.end).getTime()
    return !(bStart >= oldStart && bEnd <= oldEnd)
  })
  if (overlapsAny(newSlotDate, filteredBusy, durationMin)) {
    return json({ error: 'new slot is not available' }, 409)
  }

  // Contacts opted into meeting invites. This is the same flag book-session and the
  // recurring-schedule functions use — the set of people who receive updates must be
  // the set who were invited, or someone is left holding a stale calendar entry.
  // Check-ins were invited off receives_checkins, so they must be moved off it too.
  const { data: contacts } = await admin
    .from('student_contacts').select('email')
    .eq('student_id', student.id)
    .eq(isCheckin ? 'receives_checkins' : 'receives_meets', true)
    .eq('verified', true).eq('bounced', false)
  const studentEmails = (contacts ?? []).map(c => c.email as string).filter(Boolean)
  if (!isCheckin && !studentEmails.length && student.email) {
    studentEmails.push(student.email as string)
  }

  // Patch Google Calendar event if this session has a gcal_event_id. sendUpdates=all
  // makes Google move every guest's copy and notify them. The guest list is restated
  // so a session booked before guests were used still picks them up here.
  if (session.gcal_event_id) {
    const patchRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${session.gcal_event_id}?sendUpdates=all`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: { dateTime: newSlotDate.toISOString(), timeZone: tz },
          end: { dateTime: newEndDate.toISOString(), timeZone: tz },
          attendees: studentEmails.map(email => ({ email })),
        }),
      },
    )
    if (!patchRes.ok) {
      console.error('Google Calendar PATCH failed:', patchRes.status, await patchRes.text())
    }
  }

  // Update DB (trigger recalcs non-overridden assignment due dates automatically)
  const { error: dbErr } = await admin.from('sessions').update({
    scheduled_at: newSlotDate.toISOString(),
    end_time: newEndDate.toISOString(),
  }).eq('id', session_id)
  if (dbErr) return json({ error: 'DB update failed', detail: dbErr.message }, 500)

  const oldWhen = fmtWhen(session.scheduled_at as string, tz)
  const newWhen = fmtWhen(newSlotDate.toISOString(), tz)

  // Warn Mark if any assignments have manually-overridden due dates (trigger won't touch those).
  // Check-ins are exempt from the due-date trigger entirely, so moving one changes
  // no due dates and there is nothing to warn about.
  const { data: overridden } = isCheckin ? { data: null } : await admin
    .from('assignments')
    .select('problem_id, due_date')
    .eq('student_id', student.id)
    .eq('requires_submission', true)
    .eq('due_date_overridden', true)
    .in('status', ['assigned', 'submitted'])
  if (overridden?.length) {
    const lines = overridden.map(a => `  - ${a.problem_id}: due ${a.due_date}`)
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
        to: [MARK_EMAIL],
        subject: `Heads up: ${student.name}'s session moved — check assignment due dates`,
        text: [
          `${student.name}'s session was rescheduled from ${oldWhen} to ${newWhen}.`,
          '',
          'These assignments have manually-set due dates that were NOT auto-updated:',
          ...lines,
          '',
          `Review them at: ${PORTAL_URL}`,
        ].join('\n'),
      }),
    }).catch(e => console.error('Warning email failed:', e))
  }

  const firstName = (student.first_name as string | undefined)
    || (student.name as string).split(' ')[0]

  const rescheduleText = isCheckin
    ? [
      'Hello,',
      '',
      `Our check-in about ${firstName} has been rescheduled.`,
      '',
      `Previously: ${oldWhen}`,
      `Now: ${newWhen}`,
      '',
      `You can reschedule or cancel it anytime at: ${PORTAL_URL}`,
    ].join('\n')
    : [
      `Hi ${firstName},`,
      '',
      `Your physics session has been rescheduled.`,
      '',
      `Previously: ${oldWhen}`,
      `Now: ${newWhen}`,
      '',
      `Schedule sessions, view assignments, and check session summaries anytime at: ${PORTAL_URL}`,
    ].join('\n')

  const subjectNoun = isCheckin ? 'Check-in' : 'Session'
  if (studentEmails.length) {
    await sendPlainEmail({
      to: studentEmails,
      subject: `${subjectNoun} rescheduled: ${newWhen}`,
      text: rescheduleText,
    })
  }
  await sendPlainEmail({
    to: [MARK_EMAIL],
    subject: `${subjectNoun} rescheduled: ${student.name} – ${newWhen}`,
    text: `${student.name}'s ${noun} was rescheduled.\n\nPreviously: ${oldWhen}\nNow: ${newWhen}`,
  })

  return json({ ok: true, scheduled_at: newSlotDate.toISOString(), end_time: newEndDate.toISOString() })
})
