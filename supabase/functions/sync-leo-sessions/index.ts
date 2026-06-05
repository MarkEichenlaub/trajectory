import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const MIRO_ACCESS_TOKEN = Deno.env.get('MIRO_ACCESS_TOKEN')!
const MIRO_TEAM_ID = Deno.env.get('MIRO_TEAM_ID')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')!
const SB_SECRET_KEY = Deno.env.get('SB_SECRET_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') || ''
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') || ''
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN') || ''

const STUDENT_ID = 'leo'
const STUDENT_NAME = 'Leo Lisavarese'

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

function toCompactUTC(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, '')
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

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const accessToken = await getGoogleAccessToken()
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'failed to get Google token' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  // List upcoming Leo / Mark Physics events in a 90-day rolling window.
  const now = new Date()
  const maxDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  const params = new URLSearchParams({
    q: 'Leo / Mark Physics',
    timeMin: now.toISOString(),
    timeMax: maxDate.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  })

  const calRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } },
  )
  if (!calRes.ok) {
    const text = await calRes.text()
    console.error('Calendar list failed:', calRes.status, text)
    return new Response(JSON.stringify({ error: 'calendar list failed', detail: text }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  type CalEvent = {
    id: string
    summary?: string
    description?: string
    start: { dateTime?: string; date?: string }
    end: { dateTime?: string; date?: string }
  }

  const calData = await calRes.json() as { items?: CalEvent[] }
  // Filter specifically for "Leo / Mark Physics" to avoid false matches on "leo"
  const events = (calData.items ?? []).filter(e =>
    (e.summary ?? '').toLowerCase().includes('leo / mark physics')
  )

  const results: Array<{ eventId: string; date: string; status: string; error?: string }> = []

  for (const event of events) {
    const eventId = event.id
    const startRaw = event.start.dateTime
    const endRaw = event.end.dateTime
    if (!startRaw) continue

    const startDate = new Date(startRaw)
    const endDate = endRaw ? new Date(endRaw) : null
    const sessionId = `gcal-leo-${toCompactUTC(startRaw)}`
    const dateStr = startDate.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })

    const { data: existing } = await supabase
      .from('sessions')
      .select('id, miro_board_id, miro_board_url')
      .eq('id', sessionId)
      .maybeSingle()

    if (existing?.miro_board_id) {
      results.push({ eventId, date: dateStr, status: 'already_done' })
      continue
    }

    // Create Miro board
    let miroBoardUrl = ''
    let miroBoardId = ''
    try {
      const miroRes = await fetch('https://api.miro.com/v2/boards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MIRO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: `${STUDENT_NAME} – ${dateStr}`,
          teamId: MIRO_TEAM_ID,
        }),
      })
      if (miroRes.ok) {
        const miroData = await miroRes.json() as Record<string, unknown>
        miroBoardId = miroData.id as string
        miroBoardUrl = (miroData.viewLink as string) ?? `https://miro.com/app/board/${miroBoardId}/`
      } else {
        const errText = await miroRes.text()
        console.error('Miro API error:', miroRes.status, errText)
        results.push({ eventId, date: dateStr, status: 'miro_failed', error: errText })
        continue
      }
    } catch (e) {
      console.error('Miro fetch error:', e)
      results.push({ eventId, date: dateStr, status: 'miro_error', error: String(e) })
      continue
    }

    if (existing) {
      const { error } = await supabase
        .from('sessions')
        .update({ miro_board_id: miroBoardId, miro_board_url: miroBoardUrl })
        .eq('id', existing.id)
      if (error) console.error('Session update error:', error)
    } else {
      const { error } = await supabase.from('sessions').upsert({
        id: sessionId,
        student_id: STUDENT_ID,
        scheduled_at: startDate.toISOString(),
        end_time: endDate ? endDate.toISOString() : null,
        notes: '',
        miro_board_id: miroBoardId,
        miro_board_url: miroBoardUrl,
        balance_decremented: true,
      }, { onConflict: 'id' })
      if (error) {
        console.error('Session insert error:', error)
        results.push({ eventId, date: dateStr, status: 'db_error', error: error.message })
        continue
      }
    }

    // Patch the calendar event with the Miro link
    try {
      const existingDesc = event.description ?? ''
      if (!existingDesc.includes('Miro whiteboard:')) {
        const base = existingDesc ? existingDesc.trimEnd() + '\n\n' : ''
        await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
          {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: `${base}Miro whiteboard: ${miroBoardUrl}` }),
          },
        )
      }
    } catch (e) {
      console.error('Calendar patch error:', e)
    }

    results.push({ eventId, date: dateStr, status: existing ? 'miro_added' : 'created' })
  }

  const summary = {
    ok: true,
    total: events.length,
    created: results.filter(r => r.status === 'created').length,
    miro_added: results.filter(r => r.status === 'miro_added').length,
    already_done: results.filter(r => r.status === 'already_done').length,
    errors: results.filter(r => r.status.includes('error') || r.status.includes('failed')).length,
    results,
  }
  console.log('sync-leo-sessions complete:', JSON.stringify(summary))
  return new Response(JSON.stringify(summary), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
})
