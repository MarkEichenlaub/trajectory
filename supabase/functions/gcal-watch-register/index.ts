import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN')!
const WEBHOOK_SECRET = Deno.env.get('GCAL_WEBHOOK_SECRET')!
const CRON_SECRET = Deno.env.get('CRON_SECRET') || ''

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

// Obtain an incremental-sync token. Google only returns nextSyncToken on the FINAL
// page of an events.list, so a single maxResults=1 request never yields one when the
// calendar has more than one event — we must page to the end. The token must come
// from the same query params the webhook's incremental sync uses (no time bounds,
// no singleEvents) or Google rejects it with 400.
async function fetchSyncToken(accessToken: string): Promise<string | null> {
  let pageToken: string | undefined
  for (let i = 0; i < 50; i++) {
    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
    url.searchParams.set('maxResults', '2500')
    if (pageToken) url.searchParams.set('pageToken', pageToken)
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } })
    if (!res.ok) throw new Error(`events.list failed: ${res.status} ${await res.text()}`)
    const data = await res.json() as { nextPageToken?: string; nextSyncToken?: string }
    if (data.nextSyncToken) return data.nextSyncToken
    if (!data.nextPageToken) return null
    pageToken = data.nextPageToken
  }
  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok')

  // Accept the webhook secret (manual call), the service key, or the cron secret
  // (so a renewal cron can keep the watch channel alive without it expiring).
  const bearer = (req.headers.get('authorization') || '').replace('Bearer ', '')
  const cronHeader = req.headers.get('X-Cron-Secret')
  if (bearer !== WEBHOOK_SECRET && bearer !== SUPABASE_SERVICE_KEY &&
      (!CRON_SECRET || cronHeader !== CRON_SECRET)) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  let accessToken: string
  try {
    accessToken = await getGoogleAccessToken()
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }

  // Get an initial sync token if we don't have one yet
  const { data: existing } = await admin
    .from('app_config').select('value').eq('key', 'gcal_sync_token').maybeSingle()

  if (!existing?.value) {
    let syncToken: string | null
    try {
      syncToken = await fetchSyncToken(accessToken)
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Initial sync failed', detail: String(e) }), { status: 500 },
      )
    }
    if (syncToken) {
      const { error } = await admin.from('app_config').upsert({
        key: 'gcal_sync_token', value: syncToken, updated_at: new Date().toISOString(),
      })
      if (error) console.error('Failed to store gcal_sync_token:', error.message)
    } else {
      console.error('No nextSyncToken returned after paging through events')
    }
  }

  // Register (or re-register) the push notification channel
  const channelId = crypto.randomUUID()
  const watchRes = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events/watch',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: channelId,
        type: 'web_hook',
        address: `${SUPABASE_URL}/functions/v1/gcal-webhook`,
        token: WEBHOOK_SECRET,
      }),
    },
  )

  if (!watchRes.ok) {
    const text = await watchRes.text()
    console.error('Watch registration failed:', watchRes.status, text)
    return new Response(JSON.stringify({ error: 'Watch registration failed', detail: text }), { status: 500 })
  }

  const watchData = await watchRes.json() as {
    id: string; resourceId: string; expiration: string
  }

  const { error: cfgErr } = await admin.from('app_config').upsert([
    { key: 'gcal_channel_id',     value: watchData.id,          updated_at: new Date().toISOString() },
    { key: 'gcal_resource_id',    value: watchData.resourceId,  updated_at: new Date().toISOString() },
    { key: 'gcal_channel_expiry', value: watchData.expiration,  updated_at: new Date().toISOString() },
  ])
  if (cfgErr) console.error('Failed to store watch-channel config:', cfgErr.message)

  const expiresAt = new Date(Number(watchData.expiration)).toISOString()
  console.log(`Watch channel registered: ${channelId}, expires ${expiresAt}`)

  return new Response(
    JSON.stringify({ ok: true, channel_id: watchData.id, expires: expiresAt }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
})
