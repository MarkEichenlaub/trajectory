import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { markExpectedCancellation } from '../_shared/expected-cancellations.ts'

const CRON_SECRET = Deno.env.get('CRON_SECRET')!
const SB_SECRET_KEY = Deno.env.get('SB_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const supabase = createClient(SUPABASE_URL, SB_SECRET_KEY)
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') || ''
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') || ''
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN') || ''

async function getGoogleAccessToken(): Promise<string | null> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) return null
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
  if (!res.ok) {
    console.error('Google token refresh failed:', res.status, await res.text())
    return null
  }
  const data = await res.json() as { access_token?: string }
  return data.access_token ?? null
}

Deno.serve(async (req) => {
  // Accept either cron secret (X-Cron-Secret header) or service key (Authorization header)
  const cronHeader = req.headers.get('X-Cron-Secret')
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (cronHeader !== CRON_SECRET && authHeader !== SB_SECRET_KEY) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  const accessToken = await getGoogleAccessToken()
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'failed to get Google token' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Delete any existing "Leo / Mark Physics" recurring events first
  const searchParams = new URLSearchParams({
    q: 'Leo / Mark Physics',
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
      if ((ev.summary ?? '').toLowerCase().includes('leo / mark physics')) {
        // Rebuilding Leo's series deletes the old events on purpose; mark them so
        // gcal-webhook doesn't alert on each one.
        await markExpectedCancellation(supabase, ev.id, 'setup-leo-calendar (rebuilding the series)')
        await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${ev.id}?sendUpdates=all`,
          { method: 'DELETE', headers: { 'Authorization': `Bearer ${accessToken}` } },
        )
        console.log('Deleted old event:', ev.id)
      }
    }
  }

  // Create weekly recurring "Leo / Mark Physics" event, Tuesdays and Thursdays,
  // starting Tue Aug 25 2026, 8:30–9:30 PM Eastern (EDT = UTC-4), no end date
  const event = {
    summary: 'Leo / Mark Physics',
    start: {
      dateTime: '2026-08-25T20:30:00-04:00',
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: '2026-08-25T21:30:00-04:00',
      timeZone: 'America/New_York',
    },
    recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=TU,TH'],
    attendees: [{ email: 'leo.lisavarese1@gmail.com' }],
  }

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    },
  )

  if (!res.ok) {
    const text = await res.text()
    console.error('Calendar create failed:', res.status, text)
    return new Response(JSON.stringify({ error: 'calendar create failed', detail: text }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  const data = await res.json() as { id: string; htmlLink: string }
  console.log('Created recurring Leo/Mark Physics event:', data.id)
  return new Response(JSON.stringify({ ok: true, eventId: data.id, htmlLink: data.htmlLink }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
})
