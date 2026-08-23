// Generalized version of sync-leo-sessions / sync-borna-sessions: instead of
// one hardcoded student per function, this loops every active row in
// public.recurring_schedules and expands its Google Calendar series into
// `sessions` rows + Miro boards, the same way the per-student versions do.
// Leo and Borna keep running on their own dedicated functions/crons — this
// only covers students set up through the new admin Schedule-tab feature.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getGoogleAccessToken, toCompactUTC, ensureMeet, type CalEvent } from '../_shared/google-auth.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const MIRO_ACCESS_TOKEN = Deno.env.get('MIRO_ACCESS_TOKEN')!
const MIRO_TEAM_ID = Deno.env.get('MIRO_TEAM_ID')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')!

type Schedule = {
  student_id: string
  calendar_summary: string
}

type Result = { eventId: string; date: string; status: string; error?: string }

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

  async function listEvents(timeMin: string, timeMax: string): Promise<CalEvent[]> {
    const params = new URLSearchParams({
      q: QUERY, timeMin, timeMax, singleEvents: 'true', orderBy: 'startTime', maxResults: '50',
    })
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } },
    )
    if (!res.ok) {
      console.error(`Calendar list failed for ${STUDENT_ID}:`, res.status, await res.text())
      return []
    }
    const data = await res.json() as { items?: CalEvent[] }
    return (data.items ?? []).filter(e => (e.summary ?? '').toLowerCase() === QUERY.toLowerCase())
  }

  const events = await listEvents(now.toISOString(), maxDate.toISOString())

  for (const event of events) {
    const eventId = event.id
    const startRaw = event.start.dateTime
    const endRaw = event.end.dateTime
    if (!startRaw) continue

    const startDate = new Date(startRaw)
    const endDate = endRaw ? new Date(endRaw) : null
    const sessionId = `${idPrefix}${toCompactUTC(startRaw)}`
    const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

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
        const meetUrl = await ensureMeet(accessToken, event)
        const movedPatch: Record<string, unknown> = {
          scheduled_at: startDate.toISOString(),
          end_time: endDate ? endDate.toISOString() : null,
          session_reminder_sent_at: null,
        }
        if (meetUrl && byEventId.meet_url !== meetUrl) movedPatch.meet_url = meetUrl
        const { error: moveErr } = await supabase.from('sessions').update(movedPatch).eq('id', byEventId.id)
        if (moveErr) console.error('Session move update error:', moveErr)
        movedSessionIds.add(byEventId.id)
        results.push({ eventId, date: dateStr, status: 'moved' })
        continue
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
      results.push({ eventId, date: dateStr, status: patch.meet_url ? 'meet_backfilled' : 'already_done' })
      continue
    }

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
        body: JSON.stringify({ name: `${QUERY} – ${dateStr}`, teamId: MIRO_TEAM_ID }),
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

  // Forward-looking orphan cleanup.
  const validIds = new Set(
    events.filter(e => e.start.dateTime).map(e => `${idPrefix}${toCompactUTC(e.start.dateTime!)}`),
  )
  const { data: futureSessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('student_id', STUDENT_ID)
    .like('id', `${idPrefix}%`)
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', maxDate.toISOString())
  for (const s of futureSessions ?? []) {
    if (validIds.has(s.id) || movedSessionIds.has(s.id)) continue
    const { error } = await supabase.from('sessions').delete().eq('id', s.id)
    if (error) console.error('Orphan session delete error:', error)
    else results.push({ eventId: '', date: s.id, status: 'orphan_deleted' })
  }

  // 14-day lookback cleanup, so an event moved off a recent past date doesn't
  // leave a stale row behind (Borna's sync function established this fix).
  const lookbackDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const pastEvents = await listEvents(lookbackDate.toISOString(), now.toISOString())
  for (const e of pastEvents) {
    if (e.start.dateTime) validIds.add(`${idPrefix}${toCompactUTC(e.start.dateTime)}`)
  }
  const { data: pastSessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('student_id', STUDENT_ID)
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

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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
