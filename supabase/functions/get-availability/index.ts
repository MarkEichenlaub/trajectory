import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SB_PUBLISHABLE_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN')!

const MARK_GMAIL = 'mark.d.eichenlaub@gmail.com'
const MARK_AOPS = 'eichenlaub@artofproblemsolving.com'
const TIMEZONE = 'America/New_York'
const SESSION_DURATION_MIN = 60
const CHECKIN_DURATION_MIN = 15
const SLOT_INCREMENT_MIN = 30

// Working hours in Eastern time. Day 0 = Sunday, 6 = Saturday.
// `end` is when a booking must FINISH, not the last start time — the evening
// window running to 24:00 means an hour-long session can start as late as 23:00.
const WORKING_HOURS: Record<number, { start: string; end: string }[]> = {
  0: [{ start: '20:30', end: '24:00' }],
  1: [{ start: '09:00', end: '16:30' }, { start: '20:30', end: '24:00' }],
  2: [{ start: '09:00', end: '16:30' }, { start: '20:30', end: '24:00' }],
  3: [{ start: '09:00', end: '16:30' }, { start: '20:30', end: '24:00' }],
  4: [{ start: '09:00', end: '16:30' }, { start: '20:30', end: '24:00' }],
  5: [{ start: '09:00', end: '16:30' }, { start: '20:30', end: '24:00' }],
  6: [{ start: '20:30', end: '24:00' }],
}

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
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`)
  const data = await res.json() as { access_token?: string }
  if (!data.access_token) throw new Error('No access_token in Google response')
  return data.access_token
}

// Convert an Eastern-date string (YYYY-MM-DD) + HH:MM to UTC Date, DST-safe.
function easternToUtc(dateStr: string, hhmm: string): Date {
  for (const offset of ['-04:00', '-05:00']) {
    const candidate = new Date(`${dateStr}T${hhmm}:00${offset}`)
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(candidate)
    const d: Record<string, string> = {}
    parts.forEach(p => { d[p.type] = p.value })
    const pacDate = `${d.year}-${d.month}-${d.day}`
    const pacHour = d.hour === '24' ? '00' : d.hour
    if (pacDate === dateStr && `${pacHour}:${d.minute}` === hhmm) return candidate
  }
  return new Date(`${dateStr}T${hhmm}:00-04:00`)
}

// Get Eastern day of week (0=Sun) for an Eastern calendar date string.
function easternDow(dateStr: string): number {
  const d = new Date(`${dateStr}T12:00:00Z`)
  const dow = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, weekday: 'short' }).format(d)
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(dow)
}

// Generate slot UTC start times for an Eastern calendar date. Starts stay on the
// same half-hour grid whatever the duration, so a 15-minute check-in slots into
// the gaps between hour-long sessions without fragmenting the day.
function generateSlots(dateStr: string, durationMin: number): Date[] {
  const dow = easternDow(dateStr)
  const windows = WORKING_HOURS[dow] ?? []
  const slots: Date[] = []
  for (const w of windows) {
    let [h, m] = w.start.split(':').map(Number)
    const [eh, em] = w.end.split(':').map(Number)
    const endMin = eh * 60 + em
    while (h * 60 + m + durationMin <= endMin) {
      slots.push(easternToUtc(dateStr, `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`))
      m += SLOT_INCREMENT_MIN
      h += Math.floor(m / 60)
      m %= 60
    }
  }
  return slots
}

function overlapsAny(
  slotStart: Date, busy: { start: string; end: string }[], durationMin: number,
): boolean {
  const s = slotStart.getTime()
  const e = s + durationMin * 60_000
  return busy.some(b => s < new Date(b.end).getTime() && e > new Date(b.start).getTime())
}

export async function fetchBusy(
  accessToken: string, timeMin: string, timeMax: string,
): Promise<{ start: string; end: string }[]> {
  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeMin, timeMax,
      items: [{ id: MARK_GMAIL }, { id: MARK_AOPS }],
    }),
  })
  const data = await res.json() as {
    calendars?: Record<string, { busy?: { start: string; end: string }[]; errors?: unknown[] }>
  }
  const busy: { start: string; end: string }[] = []
  for (const [calId, cal] of Object.entries(data.calendars ?? {})) {
    if (cal.errors?.length) console.warn(`FreeBusy errors for ${calId}:`, JSON.stringify(cal.errors))
    busy.push(...(cal.busy ?? []))
  }
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

  const { from, to, session_type } = await req.json() as {
    from: string; to: string; session_type?: string
  }
  if (!from || !to) return json({ error: 'from and to are required' }, 400)

  // Only the two known kinds set a duration — an arbitrary caller-supplied
  // number would let anyone probe the calendar at any granularity.
  const durationMin = session_type === 'checkin' ? CHECKIN_DURATION_MIN : SESSION_DURATION_MIN

  let accessToken: string
  try {
    accessToken = await getGoogleAccessToken()
  } catch (e) {
    return json({ error: 'Google auth failed', detail: String(e) }, 500)
  }

  // UTC bounds covering all working hours within the Eastern date range
  const timeMin = easternToUtc(from, '00:00').toISOString()
  const afterTo = new Date(`${to}T12:00:00Z`)
  afterTo.setUTCDate(afterTo.getUTCDate() + 1)
  const toPlusOne = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(afterTo)
  const timeMax = easternToUtc(toPlusOne, '00:00').toISOString()

  let busy: { start: string; end: string }[]
  try {
    busy = await fetchBusy(accessToken, timeMin, timeMax)
  } catch (e) {
    return json({ error: 'FreeBusy query failed', detail: String(e) }, 500)
  }

  // Any free slot that hasn't started yet is offered — there is no minimum-notice
  // rule, so same-day and next-hour slots show up like any other.
  const now = Date.now()
  const slots: string[] = []

  // Iterate Eastern calendar dates from `from` to `to` inclusive
  const cur = new Date(`${from}T12:00:00Z`)
  const end = new Date(`${to}T12:00:00Z`)
  while (cur <= end) {
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(cur)
    for (const slot of generateSlots(dateStr, durationMin)) {
      if (slot.getTime() <= now) continue
      if (!overlapsAny(slot, busy, durationMin)) slots.push(slot.toISOString())
    }
    cur.setUTCDate(cur.getUTCDate() + 1)
  }

  return json({ slots })
})
