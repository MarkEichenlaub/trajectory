import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createSessionBoard, ensureBoardSharing, ensureMiroInDescription } from '../_shared/miro.ts'
import { listCalendarEvents } from '../_shared/google-auth.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const MIRO_ACCESS_TOKEN = Deno.env.get('MIRO_ACCESS_TOKEN')!
const MIRO_TEAM_ID = Deno.env.get('MIRO_TEAM_ID')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') || ''
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') || ''
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN') || ''

const STUDENT_ID = 'borna'
const STUDENT_NAME = 'Borna Curic'

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

// "2026-06-16T10:00:00-04:00" → "20260616T140000" (UTC compact, matches existing gcal-borna-* IDs)
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
  // Accept either the cron secret (X-Cron-Secret) or the service key (Authorization),
  // so the daily cron and the real-time gcal-webhook can both trigger a sync.
  const cronHeader = req.headers.get('X-Cron-Secret')
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (cronHeader !== CRON_SECRET && authHeader !== SUPABASE_SERVICE_KEY) {
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

  // List upcoming Borna events within a 90-day window. The daily cron keeps
  // this rolling — events further out are picked up as they enter range.
  const now = new Date()
  const maxDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  const listing = await listCalendarEvents(
    accessToken, 'Borna', now.toISOString(), maxDate.toISOString(),
  )
  if (!listing.ok) {
    return new Response(JSON.stringify({ error: 'calendar list failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  const events = listing.events.filter(e =>
    (e.summary ?? '').toLowerCase().includes('borna')
  )

  const results: Array<{
    eventId: string
    date: string
    status: string
    error?: string
    /** Miro sharing level after the self-heal pass; '' if the PATCH failed. */
    access?: string
    /** True if this pass added the board link to the calendar invite. */
    descriptionPatched?: boolean
  }> = []
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
    const sessionId = `gcal-borna-${toCompactUTC(startRaw)}`
    const dateStr = startDate.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })

    // Look up existing session by this canonical ID first; fall back to gcal_event_id;
    // fall back again to the old time-based ID embedded in the event ID for recurring
    // occurrences (e.g. "base_20260618T140000Z" → "gcal-borna-20260618T140000").
    // This third path catches sessions created before gcal_event_id was being persisted.
    let moved = false
    let { data: existing } = await supabase
      .from('sessions')
      .select('id, miro_board_id, miro_board_url, meet_url, gcal_event_id, scheduled_at')
      .eq('id', sessionId)
      .maybeSingle()
    if (!existing) {
      let movedSession: typeof existing = null

      const { data: byEventId } = await supabase
        .from('sessions')
        .select('id, miro_board_id, miro_board_url, meet_url, gcal_event_id, scheduled_at')
        .eq('gcal_event_id', eventId)
        .maybeSingle()
      movedSession = byEventId

      // Third fallback: recurring-event occurrences encode the original datetime in
      // the event ID ("…_20260618T140000Z"). Derive the old time-based session ID and
      // look it up — handles sessions that predate gcal_event_id being persisted.
      if (!movedSession) {
        const m = eventId.match(/_(\d{8}T\d{6})Z?$/)
        if (m) {
          const oldSessionId = `gcal-borna-${m[1]}`
          if (oldSessionId !== sessionId) {
            const { data: byOldId } = await supabase
              .from('sessions')
              .select('id, miro_board_id, miro_board_url, meet_url, gcal_event_id, scheduled_at')
              .eq('id', oldSessionId)
              .maybeSingle()
            movedSession = byOldId
          }
        }
      }

      if (movedSession) {
        // Event moved — update scheduled_at in place and clear the reminder flag.
        const { error: moveErr } = await supabase
          .from('sessions').update({
            scheduled_at: startDate.toISOString(),
            end_time: endDate ? endDate.toISOString() : null,
            session_reminder_sent_at: null,
            gcal_event_id: eventId,
          }).eq('id', movedSession.id)
        if (moveErr) console.error('Session move update error:', moveErr)
        else console.log(`Session ${movedSession.id}: moved ${movedSession.scheduled_at} → ${startDate.toISOString()}`)
        // Protect old ID from reconciliation — it still belongs to this event
        movedSessionIds.add(movedSession.id)
        moved = true
        // Fall through: a moved session still needs its Meet link refreshed, and
        // needs a board (plus sharing + calendar link) if it never got one.
        existing = movedSession
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
      // Self-heal what used to happen only on the board-creating pass: the board
      // was left `private` (student locked out) and the invite never got the
      // link. Both are idempotent.
      const access = await ensureBoardSharing(MIRO_ACCESS_TOKEN, existing.miro_board_id)
      const boardUrl = existing.miro_board_url ||
        `https://miro.com/app/board/${existing.miro_board_id}/`
      const linked = await ensureMiroInDescription(
        accessToken, eventId, event.description ?? '', boardUrl,
      )
      results.push({
        eventId,
        date: dateStr,
        status: moved ? 'moved' : patch.meet_url ? 'meet_backfilled' : 'already_done',
        access,
        descriptionPatched: linked,
      })
      continue
    }

    // Create Miro board (shared helper sets link-can-edit so Borna can open it)
    let miroBoardUrl = ''
    let miroBoardId = ''
    try {
      const board = await createSessionBoard(
        MIRO_ACCESS_TOKEN, MIRO_TEAM_ID, `${STUDENT_NAME} – ${dateStr}`,
      )
      miroBoardId = board.id
      miroBoardUrl = board.url
    } catch (e) {
      console.error('Miro create error:', e)
      results.push({ eventId, date: dateStr, status: 'miro_failed', error: String(e) })
      continue
    }

    if (existing) {
      // Session exists but was missing a Miro board — fill it in
      const { error } = await supabase
        .from('sessions')
        .update({ miro_board_id: miroBoardId, miro_board_url: miroBoardUrl, meet_url: meetUrl, gcal_event_id: eventId })
        .eq('id', existing.id)
      if (error) console.error('Session update error:', error)
    } else {
      // Create new session. balance_decremented=true so the billing cron ignores it;
      // Borna's sessions are tracked separately from the automated balance system.
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
        balance_decremented: true,
      }, { onConflict: 'id' })
      if (error) {
        console.error('Session insert error:', error)
        results.push({ eventId, date: dateStr, status: 'db_error', error: error.message })
        continue
      }
    }

    // Put the board link in the invite so Borna gets it with the event
    await ensureMiroInDescription(accessToken, eventId, event.description ?? '', miroBoardUrl)

    results.push({ eventId, date: dateStr, status: existing ? 'miro_added' : 'created' })
  }

  // Reconcile moved/deleted events. Sessions are keyed by start time (gcal-borna-<UTC>),
  // so moving an event makes the cron create a fresh session at the new time while the
  // old row lingers — the student sees a duplicate. Delete any future gcal-borna-* session
  // that no longer matches a current calendar event. (The due-date trigger then recomputes
  // off the surviving session at the new time.)
  const validIds = new Set(
    events
      .filter(e => e.start.dateTime)
      .map(e => `gcal-borna-${toCompactUTC(e.start.dateTime!)}`),
  )
  const { data: futureSessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('student_id', STUDENT_ID)
    .eq('session_type', 'session')
    .like('id', 'gcal-borna-%')
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', maxDate.toISOString())

  // A calendar that lists zero events while the student still has future
  // sessions is far more likely to be a bad match or a partial API response
  // than a genuinely cleared calendar. Refuse to mass-delete on it.
  if (events.length === 0 && (futureSessions?.length ?? 0) > 0) {
    console.error(
      `Refusing orphan cleanup for ${STUDENT_ID}: calendar returned 0 events but ` +
      `${futureSessions!.length} future sessions exist.`,
    )
    return new Response(JSON.stringify({
      ok: false, error: 'orphan cleanup skipped', events: 0, sessions: futureSessions!.length, results,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  for (const s of futureSessions ?? []) {
    if (validIds.has(s.id) || movedSessionIds.has(s.id)) continue
    const { error } = await supabase.from('sessions').delete().eq('id', s.id)
    if (error) console.error('Orphan session delete error:', error)
    else results.push({ eventId: '', date: s.id, status: 'orphan_deleted' })
  }

  // If an event was moved from a date in the recent past, the stale session row
  // is never in futureSessions (scheduled_at < now) and never gets cleaned up.
  // Query the last 14 days of calendar events to extend validIds, then prune
  // any gcal-borna-* session in that window with no matching calendar event.
  const lookbackDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const pastParams = new URLSearchParams({
    q: 'Borna',
    timeMin: lookbackDate.toISOString(),
    timeMax: now.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  })
  const pastCalRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${pastParams}`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } },
  )
  if (pastCalRes.ok) {
    const pastCalData = await pastCalRes.json() as { items?: CalEvent[] }
    const pastEvents = (pastCalData.items ?? []).filter(e =>
      (e.summary ?? '').toLowerCase().includes('borna')
    )
    for (const e of pastEvents) {
      if (e.start.dateTime) validIds.add(`gcal-borna-${toCompactUTC(e.start.dateTime)}`)
    }
  } else {
    console.error('Past calendar query failed:', pastCalRes.status)
  }
  const { data: pastSessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('student_id', STUDENT_ID)
    .eq('session_type', 'session')
    .like('id', 'gcal-borna-%')
    .gte('scheduled_at', lookbackDate.toISOString())
    .lt('scheduled_at', now.toISOString())
  for (const s of pastSessions ?? []) {
    if (validIds.has(s.id) || movedSessionIds.has(s.id)) continue
    const { error } = await supabase.from('sessions').delete().eq('id', s.id)
    if (error) console.error('Past orphan session delete error:', error)
    else results.push({ eventId: '', date: s.id, status: 'past_orphan_deleted' })
  }

  const summary = {
    ok: true,
    total: events.length,
    created: results.filter(r => r.status === 'created').length,
    miro_added: results.filter(r => r.status === 'miro_added').length,
    meet_backfilled: results.filter(r => r.status === 'meet_backfilled').length,
    already_done: results.filter(r => r.status === 'already_done').length,
    orphans_deleted: results.filter(r => r.status === 'orphan_deleted').length,
    past_orphans_deleted: results.filter(r => r.status === 'past_orphan_deleted').length,
    errors: results.filter(r => r.status.includes('error') || r.status.includes('failed')).length,
    results,
  }
  console.log('sync-borna-sessions complete:', JSON.stringify(summary))
  return new Response(JSON.stringify(summary), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
})
