import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SB_PUBLISHABLE_KEY')!  // new publishable key; replaces legacy anon (apikey for auth.getUser)
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!  // new secret API key (RLS-bypass); replaces legacy service_role
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

const PORTAL_URL = 'https://portal.eichenlaubphysics.com/'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function makeToken() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader) return json({ error: 'not authenticated' }, 401)

    // Identify the caller from their JWT.
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userErr } = await userClient.auth.getUser()
    if (userErr || !user) return json({ error: 'not authenticated' }, 401)

    const body = await req.json()
    const studentId = String(body.student_id || '')
    const email = String(body.email || '').trim().toLowerCase()
    const relationship = body.relationship === 'self' ? 'self' : 'parent'
    const accountType = ['student', 'parent', 'adult'].includes(body.account_type) ? body.account_type : 'parent'

    if (!studentId || !email) return json({ error: 'student_id and email required' }, 400)
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'invalid email' }, 400)

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Authorize: caller must be admin, or have billing access to this student
    // (a parent link, or an adult/admin profile linked to the student).
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
    if (!authorized) return json({ error: 'not authorized to invite for this student' }, 403)

    const { data: student } = await admin
      .from('students').select('name').eq('id', studentId).maybeSingle()
    if (!student) return json({ error: 'student not found' }, 404)

    const token = makeToken()
    const { error: insErr } = await admin.from('invites').insert({
      token, email, student_id: studentId,
      relationship, account_type: accountType, invited_by: user.id,
    })
    if (insErr) return json({ error: insErr.message }, 500)

    const studentName = (student as { name: string }).name
    const intro = relationship === 'self'
      ? `You've been invited to access your physics tutoring portal with Mark Eichenlaub.`
      : `You've been invited to access <strong>${studentName}</strong>'s physics tutoring portal with Mark Eichenlaub.`

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
        <p>Hi,</p>
        <p>${intro}</p>
        <p>To accept, sign in to the portal using <strong>this email address</strong> (${email}):</p>
        <p style="margin:24px 0">
          <a href="${PORTAL_URL}" style="background:#2a4a6d;color:#fff;padding:11px 20px;border-radius:6px;text-decoration:none;font-weight:600">Open the portal</a>
        </p>
        <p style="font-size:13px;color:#666">You'll get a one-time sign-in link by email. Once you're in, access is set up automatically. This invitation expires in 14 days.</p>
        <p style="font-size:13px;color:#666">— Mark Eichenlaub</p>
      </div>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
        bcc: 'mark.d.eichenlaub@gmail.com',
        to: [email],
        subject: relationship === 'self'
          ? `Your invitation to the Eichenlaub Physics portal`
          : `You're invited to ${studentName}'s tutoring portal`,
        html,
      }),
    })
    const data = await res.json()
    if (!res.ok || !data?.id) return json({ error: data?.message || 'send failed' }, 502)

    return json({ ok: true, sent_to: email })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
