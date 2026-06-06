// 30-minute trial-session availability. Publicly callable (no auth required).
// Same working-hours window as the regular scheduler; slots are 30 min.

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN')!

const MARK_GMAIL = 'mark.d.eichenlaub@gmail.com'
const MARK_AOPS = 'eichenlaub@artofproblemsolving.com'
const TIMEZONE = 'America/Los_Angeles'
const TRIAL_DURATION_MIN = 30
const SLOT_INCREMENT_MIN = 30
const MIN_NOTICE_HOURS = 24

const WORKING_HOURS: Record<number, { start: string; end: string }[]> = {
  0: [{ start: '20:30', end: '21:30' }],
  1: [{ start: '09:00', end: '16:30' }, { start: '20:30', end: '21:30' }],
  2: [{ start: '09:00', end: '16:30' }, { start: '20:30', end: '21:30' }],
  3: [{ start: '09:00', end: '16:30' }, { start: '20:30', end: '21:30' }],
  4: [{ start: '09:00', end: '16:30' }, { start: '20:30', end: '21:30' }],
  5: [{ start: '09:00', end: '16:30' }, { start: '20:30', end: '21:30' }],
  6: [{ start: '20:30', end: '21:30' }],
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

function pacificToUtc(dateStr: string, hhmm: string): Date {
  for (const offset of ['-07:00', '-08:00']) {
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
  return new Date(`${dateStr}T${hhmm}:00-07:00`)
}

function pacificDow(dateStr: string): number {
  const d = new Date(`${dateStr}T12:00:00Z`)
  const dow = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, weekday: 'short' }).format(d)
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(dow)
}

function generateSlots(dateStr: string): Date[] {
  const dow = pacificDow(dateStr)
  const windows = WORKING_HOURS[dow] ?? []
  const slots: Date[] = []
  for (const w of windows) {
    let [h, m] = w.start.split(':').map(Number)
    const [eh, em] = w.end.split(':').map(Number)
    const endMin = eh * 60 + em
    while (h * 60 + m + TRIAL_DURATION_MIN <= endMin) {
      slots.push(pacificToUtc(dateStr, `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`))
      m += SLOT_INCREMENT_MIN
      h += Math.floor(m / 60)
      m %= 60
    }
  }
  return slots
}

function overlapsAny(slotStart: Date, busy: { start: string; end: string }[]): boolean {
  const s = slotStart.getTime()
  const e = s + TRIAL_DURATION_MIN * 60_000
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

  const { from, to } = await req.json() as { from: string; to: string }
  if (!from || !to) return json({ error: 'from and to are required' }, 400)

  let accessToken: string
  try {
    accessToken = await getGoogleAccessToken()
  } catch (e) {
    return json({ error: 'Google auth failed', detail: String(e) }, 500)
  }

  const timeMin = pacificToUtc(from, '00:00').toISOString()
  const afterTo = new Date(`${to}T12:00:00Z`)
  afterTo.setUTCDate(afterTo.getUTCDate() + 1)
  const toPlusOne = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(afterTo)
  const timeMax = pacificToUtc(toPlusOne, '00:00').toISOString()

  let busy: { start: string; end: string }[]
  try {
    busy = await fetchBusy(accessToken, timeMin, timeMax)
  } catch (e) {
    return json({ error: 'FreeBusy query failed', detail: String(e) }, 500)
  }

  const now = Date.now()
  const minNoticeMs = MIN_NOTICE_HOURS * 3_600_000
  const slots: string[] = []

  const cur = new Date(`${from}T12:00:00Z`)
  const end = new Date(`${to}T12:00:00Z`)
  while (cur <= end) {
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(cur)
    for (const slot of generateSlots(dateStr)) {
      if (slot.getTime() - now < minNoticeMs) continue
      if (!overlapsAny(slot, busy)) slots.push(slot.toISOString())
    }
    cur.setUTCDate(cur.getUTCDate() + 1)
  }

  return json({ slots })
})
