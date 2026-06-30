import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN')!
const WEBHOOK_SECRET = Deno.env.get('GCAL_WEBHOOK_SECRET')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

const MARK_EMAIL = 'mark.d.eichenlaub@gmail.com'
const PORTAL_URL = 'https://portal.eichenlaubphysics.com/'

// Students whose sessions are mirrored from Google Calendar by a dedicated sync
// function rather than booked through the portal. Their sessions are keyed by start
// time (no gcal_event_id), so the per-event update loop below can't match them.
// When one of their events changes, re-run the sync — it reconciles moves/cancels
// (creates the new time, deletes the stale old row) in one pass.
const CRON_SYNCED_STUDENTS = [
  { summaryMatch: 'leo / mark physics', fn: 'sync-leo-sessions' },
  { summaryMatch: 'borna', fn: 'sync-borna-sessions' },
]

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

type CalEvent = {
  id?: string
  status?: string
  summary?: string
  start?: { dateTime?: string }
  end?: { dateTime?: string }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok')

  // Google sends the token we supplied during watch registration
  const channelToken = req.headers.get('x-goog-channel-token')
  if (channelToken !== WEBHOOK_SECRET) return new Response('unauthorized', { status: 401 })

  // Initial sync ping when the channel is first created — nothing to process
  const resourceState = req.headers.get('x-goog-resource-state')
  if (resourceState !== 'exists') return new Response('ok', { status: 200 })

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  let accessToken: string
  try {
    accessToken = await getGoogleAccessToken()
  } catch (e) {
    console.error('Google auth failed:', e)
    return new Response('ok', { status: 200 })
  }

  // Retrieve stored sync token
  const { data: tokenRow } = await admin
    .from('app_config').select('value').eq('key', 'gcal_sync_token').maybeSingle()
  let syncToken = tokenRow?.value

  if (!syncToken) {
    console.error('No gcal_sync_token in app_config — run gcal-watch-register first')
    return new Response('ok', { status: 200 })
  }

  // Page through all changes since the last sync
  const changedEvents: CalEvent[] = []
  let pageToken: string | undefined
  let newSyncToken: string | undefined

  do {
    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
    url.searchParams.set('syncToken', syncToken)
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (res.status === 410) {
      // Sync token expired — reset to a fresh token and wait for the next notification.
      // nextSyncToken only appears on the final page, so page to the end (same params
      // as the incremental query above: no time bounds, no singleEvents).
      let resetPageToken: string | undefined
      let freshToken: string | undefined
      for (let i = 0; i < 50; i++) {
        const resetUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
        resetUrl.searchParams.set('maxResults', '2500')
        if (resetPageToken) resetUrl.searchParams.set('pageToken', resetPageToken)
        const reset = await fetch(resetUrl.toString(), {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!reset.ok) {
          console.error('Sync-token reset failed:', reset.status, await reset.text())
          break
        }
        const d = await reset.json() as { nextPageToken?: string; nextSyncToken?: string }
        if (d.nextSyncToken) { freshToken = d.nextSyncToken; break }
        if (!d.nextPageToken) break
        resetPageToken = d.nextPageToken
      }
      if (freshToken) {
        const { error } = await admin.from('app_config').upsert({
          key: 'gcal_sync_token', value: freshToken, updated_at: new Date().toISOString(),
        })
        if (error) console.error('Failed to store reset gcal_sync_token:', error.message)
      }
      return new Response('ok', { status: 200 })
    }

    if (!res.ok) {
      console.error('Events list failed:', res.status, await res.text())
      return new Response('ok', { status: 200 })
    }

    const data = await res.json() as {
      items?: CalEvent[]; nextPageToken?: string; nextSyncToken?: string
    }
    changedEvents.push(...(data.items ?? []))
    pageToken = data.nextPageToken
    newSyncToken = data.nextSyncToken
  } while (pageToken)

  // Persist the new sync token before processing so a crash doesn't cause double-processing
  if (newSyncToken) {
    await admin.from('app_config').upsert({
      key: 'gcal_sync_token', value: newSyncToken, updated_at: new Date().toISOString(),
    })
  }

  // Update sessions whose times changed in Google Calendar
  for (const event of changedEvents) {
    if (!event.id) continue

    const { data: session } = await admin
      .from('sessions')
      .select('id, student_id, scheduled_at, end_time, balance_decremented, students!inner(name)')
      .eq('gcal_event_id', event.id)
      .maybeSingle()
    if (!session) continue
    if (session.balance_decremented) continue

    if (event.status === 'cancelled') {
      // Event was removed from Google Calendar — log but don't auto-delete
      // (Mark can cancel through the portal to keep things consistent)
      console.log(`GCal event ${event.id} cancelled; session ${session.id} left untouched`)
      continue
    }

    const newStart = event.start?.dateTime
    const newEnd = event.end?.dateTime
    if (!newStart || !newEnd) continue

    if (newStart !== session.scheduled_at || newEnd !== session.end_time) {
      const { error } = await admin.from('sessions').update({
        scheduled_at: newStart,
        end_time: newEnd,
      }).eq('id', session.id)
      if (error) {
        console.error(`Failed to update session ${session.id}:`, error.message)
      } else {
        console.log(`Session ${session.id}: ${session.scheduled_at} → ${newStart}`)

        // Warn Mark if any overridden due dates exist for this student
        const studentName = (session.students as { name: string }).name
        const { data: overridden } = await admin
          .from('assignments')
          .select('problem_id, due_date')
          .eq('student_id', session.student_id)
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
              subject: `Heads up: ${studentName}'s session moved in Google Calendar — check assignment due dates`,
              text: [
                `${studentName}'s session was moved in Google Calendar (${session.scheduled_at} → ${newStart}).`,
                '',
                'These assignments have manually-set due dates that were NOT auto-updated:',
                ...lines,
                '',
                `Review them at: ${PORTAL_URL}`,
              ].join('\n'),
            }),
          }).catch(e => console.error('Warning email failed:', e))
        }
      }
    }
  }

  // Re-run the dedicated sync for any cron-mirrored student whose event changed, so
  // moves/cancels reflect instantly instead of waiting for the daily cron. The sync
  // lists the calendar fresh and reconciles, so duplicate/stale rows never linger.
  // (Cancelled events arrive without a summary; those are caught by the daily cron.)
  const toResync = new Set<string>()
  for (const event of changedEvents) {
    const summary = (event.summary ?? '').toLowerCase()
    if (!summary) continue
    for (const s of CRON_SYNCED_STUDENTS) {
      if (summary.includes(s.summaryMatch)) toResync.add(s.fn)
    }
  }
  for (const fn of toResync) {
    const task = fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: '{}',
    })
      .then(async (r) => {
        if (!r.ok) console.error(`Resync ${fn} failed:`, r.status, await r.text())
        else console.log(`Triggered ${fn} after calendar change`)
      })
      .catch((e) => console.error(`Resync ${fn} error:`, e))
    // Run in the background so Google's notification is acked immediately
    if (typeof EdgeRuntime !== 'undefined') EdgeRuntime.waitUntil(task)
    else await task
  }

  return new Response('ok', { status: 200 })
})

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void } | undefined
