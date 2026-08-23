// Removes the Google Calendar event backing a session, without any of the
// client-facing extras cancel-session does (ICS emails, Miro teardown, due-date
// warnings). The admin Sessions tab deletes rows through the delete_session RPC
// — a pure DB call that cannot reach Google — so without this the calendar event
// survives the delete, and sync-recurring-sessions then re-creates the session
// row from that surviving event on its next run.
//
// Only future events are touched: deleting a past event would rewrite history
// for a row the admin is merely cleaning up.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getGoogleAccessToken } from '../_shared/google-auth.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const SUPABASE_ANON_KEY = Deno.env.get('SB_PUBLISHABLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function isAdmin(req: Request): Promise<boolean> {
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return false
  if (token === SERVICE_KEY) return true
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase
    .from('profiles').select('account_type').eq('id', user.id).single()
  return profile?.account_type === 'admin'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  if (!(await isAdmin(req))) return json({ error: 'forbidden' }, 403)

  try {
    const { session_id } = await req.json()
    if (!session_id) return json({ error: 'session_id required' }, 400)

    const { data: session } = await supabase
      .from('sessions').select('id, gcal_event_id, scheduled_at')
      .eq('id', session_id).maybeSingle()
    if (!session) return json({ error: 'session not found' }, 404)

    if (!session.gcal_event_id) return json({ ok: true, skipped: 'no_event' })
    if (new Date(session.scheduled_at as string).getTime() < Date.now()) {
      return json({ ok: true, skipped: 'past' })
    }

    const accessToken = await getGoogleAccessToken()
    if (!accessToken) return json({ error: 'failed to get Google token' }, 500)

    // sendUpdates=all so the family gets Google's cancellation notice, matching
    // what cancel-session already does for portal-initiated cancellations.
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${session.gcal_event_id}?sendUpdates=all`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } },
    )
    // 404/410 mean it is already gone, which is the state we wanted anyway.
    if (!res.ok && res.status !== 404 && res.status !== 410) {
      const detail = await res.text()
      console.error('Calendar DELETE failed:', res.status, detail)
      return json({ error: 'calendar delete failed', detail }, 500)
    }

    return json({ ok: true, eventId: session.gcal_event_id })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})
