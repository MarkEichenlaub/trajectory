import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN')!
const WEBHOOK_SECRET = Deno.env.get('GCAL_WEBHOOK_SECRET')!

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
      // Sync token expired — reset to a fresh token and wait for the next notification
      const reset = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=1',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      const d = await reset.json() as { nextSyncToken?: string }
      if (d.nextSyncToken) {
        await admin.from('app_config').upsert({
          key: 'gcal_sync_token', value: d.nextSyncToken, updated_at: new Date().toISOString(),
        })
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
      .select('id, scheduled_at, end_time, balance_decremented')
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
      }
    }
  }

  return new Response('ok', { status: 200 })
})
