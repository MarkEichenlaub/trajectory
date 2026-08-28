// Generalized version of sync-leo-sessions / sync-borna-sessions: instead of
// one hardcoded student per function, this loops every active row in
// public.recurring_schedules and expands its Google Calendar series into
// `sessions` rows + Miro boards, the same way the per-student versions do.
// Leo and Borna keep running on their own dedicated functions/crons — this
// only covers students set up through the new admin Schedule-tab feature.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  getGoogleAccessToken, toCompactUTC, ensureMeet, listCalendarEvents, type CalEvent,
} from '../_shared/google-auth.ts'
import { createSessionBoard, ensureBoardSharing, ensureMiroInDescription } from '../_shared/miro.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const MIRO_ACCESS_TOKEN = Deno.env.get('MIRO_ACCESS_TOKEN')!
const MIRO_TEAM_ID = Deno.env.get('MIRO_TEAM_ID')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')!

type Schedule = {
  student_id: string
  calendar_summary: string
}

type Result = {
  eventId: string
  date: string
  status: string
  error?: string
  /** Miro sharing level after the self-heal pass; '' if the PATCH failed. */
  access?: string
  /** True if this pass added the board link to the calendar invite. */
  descriptionPatched?: boolean
}

async function syncOneSchedule(
  supabase: ReturnType<typeof createClient>,
  accessToken: string,
  schedule: Schedule,
): Promise<Result[]> {
  const STUDENT_ID = schedule.student_id
  const QUERY = schedule.calendar_summary
  const idPrefix = `gcal-${STUDENT_ID}-`
  const results: Result[] = []
  const movedSessionIds = new Set<string>()

  const now = new Date()
  const maxDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  async function listEvents(
    timeMin: string, timeMax: string,
  ): Promise<{ ok: boolean; events: CalEvent[] }> {
    const { ok, events } = await listCalendarEvents(accessToken, QUERY, timeMin, timeMax)
    return {
      ok,
      events: events.filter(e => (e.summary ?? '').toLowerCase() === QUERY.toLowerCase()),
    }
  }

  const listing = await listEvents(now.toISOString(), maxDate.toISOString())
  if (!listing.ok) {
    // Bail out without reconciling; the next run retries.
    return [{ eventId: '', date: '', status: 'calendar_list_failed', error: STUDENT_ID }]
  }
  const events = listing.events

  for (const event of events) {
    const eventId = event.id
    const startRaw = event.start.dateTime
    const endRaw = event.end.dateTime
    if (!startRaw) continue

    const startDate = new Date(startRaw)
    const endDate = endRaw ? new Date(endRaw) : null
    const sessionId = `${idPrefix}${toCompactUTC(startRaw)}`
    const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    let moved = false
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
        const { error: moveErr } = await supabase.from('sessions').update({
          scheduled_at: startDate.toISOString(),
          end_time: endDate ? endDate.toISOString() : null,
          session_reminder_sent_at: null,
        }).eq('id', byEventId.id)
        if (moveErr) console.error('Session move update error:', moveErr)
        movedSessionIds.add(byEventId.id)
        moved = true
        // Fall through: a moved session still needs its Meet link refreshed, and
        // needs a board (plus sharing + calendar link) if it never got one.
        existing = byEventId
      }
    }

    const meetUrl = await ensureMeet(accessToken, event)

    if (existing?.miro_board_id) {
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
      const access = await ensureBoardSharing(MIRO_ACCESS_TOKEN, existing.miro_board_id as string)
      const boardUrl = (existing.miro_board_url as string) ||
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

    // Shared helper sets link-can-edit so the student can open the board
    let miroBoardUrl = ''
    let miroBoardId = ''
    try {
      const board = await createSessionBoard(MIRO_ACCESS_TOKEN, MIRO_TEAM_ID, `${QUERY} – ${dateStr}`)
      miroBoardId = board.id
      miroBoardUrl = board.url
    } catch (e) {
      console.error('Miro create error:', e)
      results.push({ eventId, date: dateStr, status: 'miro_failed', error: String(e) })
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

    // Put the board link in the invite so the student gets it with the event
    await ensureMiroInDescription(accessToken, eventId, event.description ?? '', miroBoardUrl)

    results.push({ eventId, date: dateStr, status: existing ? 'miro_added' : 'created' })
  }

  // Forward-looking orphan cleanup.
  const validIds = new Set(
    events.filter(e => e.start.dateTime).map(e => `${idPrefix}${toCompactUTC(e.start.dateTime!)}`),
  )
  const { data: futureSessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('student_id', STUDENT_ID)
    .eq('session_type', 'session')
    .like('id', `${idPrefix}%`)
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', maxDate.toISOString())

  // A calendar that lists zero events while the student still has a schedule of
  // future sessions is far more likely to be a bad `q` match or a partial API
  // response than a genuinely cleared calendar. Refuse to mass-delete on it.
  if (events.length === 0 && (futureSessions?.length ?? 0) > 0) {
    console.error(
      `Refusing orphan cleanup for ${STUDENT_ID}: calendar returned 0 events but ` +
      `${futureSessions!.length} future sessions exist.`,
    )
    results.push({
      eventId: '', date: '', status: 'orphan_cleanup_skipped',
      error: `0 events vs ${futureSessions!.length} sessions`,
    })
    return results
  }

  for (const s of futureSessions ?? []) {
    if (validIds.has(s.id) || movedSessionIds.has(s.id)) continue
    const { error } = await supabase.from('sessions').delete().eq('id', s.id)
    if (error) console.error('Orphan session delete error:', error)
    else results.push({ eventId: '', date: s.id, status: 'orphan_deleted' })
  }

  // 14-day lookback cleanup, so an event moved off a recent past date doesn't
  // leave a stale row behind (Borna's sync function established this fix).
  const lookbackDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const pastListing = await listEvents(lookbackDate.toISOString(), now.toISOString())
  // Same rule as above: a failed listing is not an empty calendar.
  if (!pastListing.ok) return results
  for (const e of pastListing.events) {
    if (e.start.dateTime) validIds.add(`${idPrefix}${toCompactUTC(e.start.dateTime)}`)
  }
  const { data: pastSessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('student_id', STUDENT_ID)
    .eq('session_type', 'session')
    .like('id', `${idPrefix}%`)
    .gte('scheduled_at', lookbackDate.toISOString())
    .lt('scheduled_at', now.toISOString())
  for (const s of pastSessions ?? []) {
    if (validIds.has(s.id) || movedSessionIds.has(s.id)) continue
    const { error } = await supabase.from('sessions').delete().eq('id', s.id)
    if (error) console.error('Past orphan session delete error:', error)
    else results.push({ eventId: '', date: s.id, status: 'past_orphan_deleted' })
  }

  return results
}

Deno.serve(async (req) => {
  const cronHeader = req.headers.get('X-Cron-Secret')
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (cronHeader !== CRON_SECRET && authHeader !== SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  // x-app-source names this function in public.session_deletions when the orphan
  // cleanup below removes a row (see 20260828010000_session_deletion_log.sql).
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    global: { headers: { 'x-app-source': 'sync-recurring-sessions' } },
  })

  const accessToken = await getGoogleAccessToken()
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'failed to get Google token' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data: schedules, error: schedErr } = await supabase
    .from('recurring_schedules').select('student_id, calendar_summary').eq('active', true)
  if (schedErr) {
    return new Response(JSON.stringify({ error: schedErr.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  const perStudent: Record<string, Result[]> = {}
  for (const schedule of schedules ?? []) {
    perStudent[schedule.student_id] = await syncOneSchedule(supabase, accessToken, schedule as Schedule)
  }

  const summary = {
    ok: true,
    students: Object.keys(perStudent).length,
    perStudent: Object.fromEntries(
      Object.entries(perStudent).map(([id, results]) => [id, {
        total: results.length,
        created: results.filter(r => r.status === 'created').length,
        errors: results.filter(r => r.status.includes('error') || r.status.includes('failed')).length,
        results,
      }]),
    ),
  }
  console.log('sync-recurring-sessions complete:', JSON.stringify(summary))
  return new Response(JSON.stringify(summary), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
})
