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

type CalEvent = {
  id: string
  summary?: string
  description?: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  hangoutLink?: string
  conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> }
}

// Return the event's existing Google Meet link, or create one and return it.
async function ensureMeet(accessToken: string, event: CalEvent): Promise<string> {
  const existing = event.hangoutLink ||
    event.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri || ''
  if (existing) return existing
  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.id}?conferenceDataVersion=1`,
      {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conferenceData: {
            createRequest: {
              requestId: `meet-${event.id}-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        }),
      },
    )
    if (res.ok) {
      const data = await res.json() as CalEvent
      return data.hangoutLink ||
        data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri || ''
    }
    console.error('Meet create failed:', res.status, await res.text())
  } catch (e) {
    console.error('Meet create error:', e)
  }
  return ''
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

  const calData = await calRes.json() as { items?: CalEvent[] }
  // Match "Leo / Mark Physics" or "Leo Li-Savarese/Mark Physics" (different naming conventions)
  const events = (calData.items ?? []).filter(e => {
    const s = (e.summary ?? '').toLowerCase()
    return (s.includes('leo') && s.includes('mark physics'))
  })

  const results: Array<{ eventId: string; date: string; status: string; error?: string }> = []
  // IDs of sessions whose scheduled_at was updated in place (event moved to a new time).
  // These retain their old time-based IDs, so we must protect them from reconciliation deletion.
  const movedSessionIds = new Set<string>()

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

    // Look up existing session by this canonical ID first; fall back to gcal_event_id
    // so that a moved event updates the existing row instead of creating a duplicate.
    let { data: existing } = await supabase
      .from('sessions')
      .select('id, miro_board_id, miro_board_url, meet_url, gcal_event_id, scheduled_at')
      .eq('id', sessionId)
      .maybeSingle()

    if (!existing) {
      const { data: byEventId } = await supabase
        .from('sessions')
        .select('id, miro_board_id, miro_board_url, meet_url, gcal_event_id, scheduled_at')
        .eq('gcal_event_id', eventId)
        .maybeSingle()
      if (byEventId) {
        // Event moved — update scheduled_at in place and clear the reminder flag.
        const meetUrl = await ensureMeet(accessToken, event)
        const movedPatch: Record<string, unknown> = {
          scheduled_at: startDate.toISOString(),
          end_time: endDate ? endDate.toISOString() : null,
          session_reminder_sent_at: null,
        }
        if (meetUrl && byEventId.meet_url !== meetUrl) movedPatch.meet_url = meetUrl
        const { error: moveErr } = await supabase
          .from('sessions').update(movedPatch).eq('id', byEventId.id)
        if (moveErr) console.error('Session move update error:', moveErr)
        else console.log(`Session ${byEventId.id}: moved ${byEventId.scheduled_at} → ${startDate.toISOString()}`)
        // Protect old ID from reconciliation — it still belongs to this event
        movedSessionIds.add(byEventId.id)
        results.push({ eventId, date: dateStr, status: 'moved' })
        continue
      }
    }

    // Ensure a Google Meet link on every matched event (backfills existing + new).
    const meetUrl = await ensureMeet(accessToken, event)

    if (existing?.miro_board_id) {
      // Board already created on a prior run; backfill meet_url + gcal_event_id if missing.
      const patch: Record<string, unknown> = {}
      if (meetUrl && existing.meet_url !== meetUrl) patch.meet_url = meetUrl
      if (existing.gcal_event_id !== eventId) patch.gcal_event_id = eventId
      if (Object.keys(patch).length > 0) {
        const { error } = await supabase.from('sessions').update(patch).eq('id', existing.id)
        if (error) console.error('Session backfill error:', error)
      }
      results.push({ eventId, date: dateStr, status: patch.meet_url ? 'meet_backfilled' : 'already_done' })
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
        .update({ miro_board_id: miroBoardId, miro_board_url: miroBoardUrl, meet_url: meetUrl, gcal_event_id: eventId })
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
        meet_url: meetUrl,
        gcal_event_id: eventId,
        balance_decremented: false,
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

  // Reconcile moved/deleted events. Sessions are keyed by start time (gcal-leo-<UTC>),
  // so moving an event makes the cron create a fresh session at the new time while the
  // old row lingers — the student sees a duplicate. Delete any future gcal-leo-* session
  // that no longer matches a current calendar event. (The due-date trigger then recomputes
  // off the surviving session at the new time.)
  const validIds = new Set(
    events
      .filter(e => e.start.dateTime)
      .map(e => `gcal-leo-${toCompactUTC(e.start.dateTime!)}`),
  )
  const { data: futureSessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('student_id', STUDENT_ID)
    .like('id', 'gcal-leo-%')
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', maxDate.toISOString())
  for (const s of futureSessions ?? []) {
    if (validIds.has(s.id) || movedSessionIds.has(s.id)) continue
    const { error } = await supabase.from('sessions').delete().eq('id', s.id)
    if (error) console.error('Orphan session delete error:', error)
    else results.push({ eventId: '', date: s.id, status: 'orphan_deleted' })
  }

  const summary = {
    ok: true,
    total: events.length,
    created: results.filter(r => r.status === 'created').length,
    miro_added: results.filter(r => r.status === 'miro_added').length,
    meet_backfilled: results.filter(r => r.status === 'meet_backfilled').length,
    already_done: results.filter(r => r.status === 'already_done').length,
    orphans_deleted: results.filter(r => r.status === 'orphan_deleted').length,
    errors: results.filter(r => r.status.includes('error') || r.status.includes('failed')).length,
    results,
  }
  console.log('sync-leo-sessions complete:', JSON.stringify(summary))
  return new Response(JSON.stringify(summary), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
})
