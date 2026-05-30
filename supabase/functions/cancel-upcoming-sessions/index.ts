import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CAL_API_KEY = Deno.env.get('CAL_API_KEY') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader) return json({ error: 'not authenticated' }, 401)

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userErr } = await userClient.auth.getUser()
    if (userErr || !user) return json({ error: 'not authenticated' }, 401)

    const body = await req.json()
    const studentId = String(body.student_id || '')
    if (!studentId) return json({ error: 'student_id required' }, 400)

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Authorize: admin or billing-capable parent/adult
    const { data: profile } = await admin
      .from('profiles').select('account_type').eq('id', user.id).maybeSingle()
    const isAdmin = profile?.account_type === 'admin'

    let authorized = isAdmin
    if (!authorized) {
      const { data: link } = await admin
        .from('student_links')
        .select('relationship')
        .eq('account_id', user.id)
        .eq('student_id', studentId)
        .maybeSingle()
      authorized = link?.relationship === 'parent'
        || (!!link && (profile?.account_type === 'adult' || profile?.account_type === 'admin'))
    }
    if (!authorized) return json({ error: 'not authorized for this student' }, 403)

    const now = new Date().toISOString()

    // Fetch upcoming sessions before deleting so we have the cal_uids for Cal.com.
    const { data: sessions, error: fetchErr } = await admin
      .from('sessions')
      .select('id, cal_uid, cal_booking_id, scheduled_at')
      .eq('student_id', studentId)
      .gt('scheduled_at', now)

    if (fetchErr) return json({ error: fetchErr.message }, 500)
    if (!sessions?.length) return json({ ok: true, cancelled: 0 })

    // Delete DB rows first so that the BOOKING_CANCELLED webhook (fired by Cal.com
    // below) finds no session to look up and skips the redundant notification email.
    const { error: delErr } = await admin
      .from('sessions')
      .delete()
      .eq('student_id', studentId)
      .gt('scheduled_at', now)

    if (delErr) return json({ error: delErr.message }, 500)

    // Cancel each Cal.com booking so the student stops receiving reminder emails.
    if (CAL_API_KEY) {
      await Promise.all(
        sessions
          .filter(s => s.cal_uid)
          .map(async (s) => {
            try {
              const res = await fetch(`https://api.cal.com/v2/bookings/${s.cal_uid}/cancel`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${CAL_API_KEY}`,
                  'Content-Type': 'application/json',
                  'cal-api-version': '2024-08-13',
                },
                body: JSON.stringify({ reason: 'Tutoring account paused' }),
              })
              if (!res.ok) {
                console.error(`Cal.com cancel failed for ${s.cal_uid}:`, res.status, await res.text())
              }
            } catch (e) {
              console.error(`Cal.com cancel error for ${s.cal_uid}:`, (e as Error).message)
            }
          }),
      )
    }

    return json({ ok: true, cancelled: sessions.length })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})
