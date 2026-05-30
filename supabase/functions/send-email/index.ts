import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Only internal service-role callers (other edge functions) and admin users may
// send mail. Without this, any logged-in student/parent could invoke this with an
// arbitrary recipient/subject/body and use it as a spam relay from Mark's domain.
async function isAuthorized(req: Request): Promise<boolean> {
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return false
  if (token === SERVICE_KEY) return true
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return false
  const admin = createClient(SUPABASE_URL, SERVICE_KEY)
  const { data: profile } = await admin
    .from('profiles').select('account_type').eq('id', user.id).single()
  return profile?.account_type === 'admin'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!(await isAuthorized(req))) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { to, subject, body } = await req.json()

    // Body may be plain text or HTML — send as html when it looks like markup
    // so existing plain-text callers keep their line breaks.
    const isHtml = /<[a-z][\s\S]*>/i.test(body || '')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
        to: Array.isArray(to) ? to : [to],
        subject,
        ...(isHtml ? { html: body } : { text: body }),
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
