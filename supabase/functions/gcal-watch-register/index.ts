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
    const syncRes = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=1',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    if (!syncRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Initial sync failed', detail: await syncRes.text() }), { status: 500 },
      )
    }
    const syncData = await syncRes.json() as { nextSyncToken?: string }
    if (syncData.nextSyncToken) {
      await admin.from('app_config').upsert({
        key: 'gcal_sync_token', value: syncData.nextSyncToken, updated_at: new Date().toISOString(),
      })
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

  await admin.from('app_config').upsert([
    { key: 'gcal_channel_id',     value: watchData.id,          updated_at: new Date().toISOString() },
    { key: 'gcal_resource_id',    value: watchData.resourceId,  updated_at: new Date().toISOString() },
    { key: 'gcal_channel_expiry', value: watchData.expiration,  updated_at: new Date().toISOString() },
  ])

  const expiresAt = new Date(Number(watchData.expiration)).toISOString()
  console.log(`Watch channel registered: ${channelId}, expires ${expiresAt}`)

  return new Response(
    JSON.stringify({ ok: true, channel_id: watchData.id, expires: expiresAt }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
})
