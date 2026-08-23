// Turns a public.recurring_schedules row into a Google Calendar RRULE series —
// the generalized, admin-UI-driven version of setup-leo-calendar (which
// hand-codes one student's Tue/Thu event). Invoked from the admin Schedule
// tab after saving a recurring_schedules row.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getGoogleAccessToken } from '../_shared/google-auth.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const SUPABASE_ANON_KEY = Deno.env.get('SB_PUBLISHABLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function isAdmin(req: Request): Promise<boolean> {
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return false
  if (token === SERVICE_KEY) return true
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase
    .from('profiles').select('account_type').eq('id', user.id).single()
  return profile?.account_type === 'admin'
}

// Combine a DATE and a wall-clock TIME (both naive, no offset) and add minutes,
// rolling over to the next day if needed. Returns "YYYY-MM-DDTHH:MM:SS" with no
// timezone suffix — paired with a separate `timeZone` field, Google Calendar
// interprets it in that zone, so no manual DST/offset math is needed here.
function addMinutesToLocal(dateStr: string, timeStr: string, addMinutes: number) {
  const [h, m, s] = timeStr.split(':').map(Number)
  const base = new Date(`${dateStr}T00:00:00Z`)
  const totalMinutes = h * 60 + m + addMinutes
  const dayOffset = Math.floor(totalMinutes / 1440)
  const mins = ((totalMinutes % 1440) + 1440) % 1440
  const outDate = new Date(base.getTime() + dayOffset * 86400000)
  const yyyy = outDate.getUTCFullYear()
  const mm = String(outDate.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(outDate.getUTCDate()).padStart(2, '0')
  const hh = String(Math.floor(mins / 60)).padStart(2, '0')
  const mi = String(mins % 60).padStart(2, '0')
  const ss = String(s ?? 0).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  if (!(await isAdmin(req))) return json({ error: 'forbidden' }, 403)

  try {
    const { student_id } = await req.json()
    if (!student_id) return json({ error: 'student_id required' }, 400)

    const { data: schedule } = await supabase
      .from('recurring_schedules').select('*').eq('student_id', student_id).single()
    if (!schedule) return json({ error: 'no recurring_schedules row for this student' }, 404)

    const accessToken = await getGoogleAccessToken()
    if (!accessToken) return json({ error: 'failed to get Google token' }, 500)

    // Delete any prior series under this exact title before (re)creating —
    // same search-then-delete pattern as setup-leo-calendar, generalized to
    // whatever calendar_summary this row uses.
    const searchParams = new URLSearchParams({
      q: schedule.calendar_summary,
      timeMin: new Date(0).toISOString(),
      singleEvents: 'false',
      maxResults: '10',
    })
    const searchRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${searchParams}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } },
    )
    if (searchRes.ok) {
      const searchData = await searchRes.json() as { items?: { id: string; summary?: string }[] }
      for (const ev of (searchData.items ?? [])) {
        if ((ev.summary ?? '').toLowerCase() === schedule.calendar_summary.toLowerCase()) {
          await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${ev.id}?sendUpdates=all`,
            { method: 'DELETE', headers: { 'Authorization': `Bearer ${accessToken}` } },
          )
          console.log('Deleted old recurring event:', ev.id)
        }
      }
    }

    if (!schedule.active) {
      await supabase.from('recurring_schedules')
        .update({ gcal_event_id: null, updated_at: new Date().toISOString() })
        .eq('student_id', student_id)
      return json({ ok: true, removed: true })
    }

    // Attendees = contacts currently opted into meeting invites for this student.
    const { data: contacts } = await supabase
      .from('student_contacts').select('email')
      .eq('student_id', student_id).eq('receives_meets', true)
    const attendees = (contacts ?? []).map(c => ({ email: c.email }))

    const startLocal = `${schedule.start_date}T${schedule.start_time}`
    const endLocal = addMinutesToLocal(schedule.start_date, schedule.start_time, schedule.duration_minutes)
    let rrule = `RRULE:FREQ=WEEKLY;BYDAY=${schedule.days_of_week.join(',')}`
    if (schedule.end_date) {
      const until = schedule.end_date.replace(/-/g, '') + 'T235959Z'
      rrule += `;UNTIL=${until}`
    }

    const event = {
      summary: schedule.calendar_summary,
      start: { dateTime: startLocal, timeZone: schedule.timezone },
      end: { dateTime: endLocal, timeZone: schedule.timezone },
      recurrence: [rrule],
      attendees,
    }

    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all',
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      },
    )
    if (!res.ok) {
      const text = await res.text()
      console.error('Calendar create failed:', res.status, text)
      return json({ error: 'calendar create failed', detail: text }, 500)
    }
    const data = await res.json() as { id: string; htmlLink: string }

    await supabase.from('recurring_schedules')
      .update({ gcal_event_id: data.id, updated_at: new Date().toISOString() })
      .eq('student_id', student_id)

    return json({ ok: true, eventId: data.id, htmlLink: data.htmlLink })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})
