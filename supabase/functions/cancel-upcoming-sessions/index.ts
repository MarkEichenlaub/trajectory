import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SB_PUBLISHABLE_KEY')!  // new publishable key; replaces legacy anon (apikey for auth.getUser)
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!  // new secret API key (RLS-bypass); replaces legacy service_role

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

    const { data: sessions, error: fetchErr } = await admin
      .from('sessions')
      .select('id')
      .eq('student_id', studentId)
      .gt('scheduled_at', now)

    if (fetchErr) return json({ error: fetchErr.message }, 500)
    if (!sessions?.length) return json({ ok: true, cancelled: 0 })

    const { error: delErr } = await admin
      .from('sessions')
      .delete()
      .eq('student_id', studentId)
      .gt('scheduled_at', now)

    if (delErr) return json({ error: delErr.message }, 500)

    return json({ ok: true, cancelled: sessions.length })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})
