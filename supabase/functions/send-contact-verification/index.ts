import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!  // new secret API key (RLS-bypass); replaces legacy service_role
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

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
    const { contact_id } = await req.json()
    if (!contact_id) return json({ error: 'contact_id required' }, 400)

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: contact, error } = await supabase
      .from('student_contacts')
      .select('id, email, verified, students!inner(name)')
      .eq('id', contact_id)
      .single()
    if (error || !contact) return json({ error: 'contact not found' }, 404)
    if (contact.verified) return json({ ok: true, already_verified: true })

    const token = makeToken()
    const { error: upErr } = await supabase
      .from('student_contacts')
      .update({ verification_token: token })
      .eq('id', contact_id)
    if (upErr) return json({ error: upErr.message }, 500)

    const studentName = (contact.students as { name: string }).name
    const verifyUrl = `${SUPABASE_URL}/functions/v1/verify-contact?token=${token}`

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
        <p>Hi,</p>
        <p>This email address was added to receive updates about <strong>${studentName}</strong>'s
        physics tutoring with Mark Eichenlaub.</p>
        <p>Please confirm you'd like to receive these messages:</p>
        <p style="margin:24px 0">
          <a href="${verifyUrl}" style="background:#2a4a6d;color:#fff;padding:11px 20px;border-radius:6px;text-decoration:none;font-weight:600">Confirm this email</a>
        </p>
        <p style="font-size:13px;color:#666">If you weren't expecting this, you can ignore it — no messages will be sent until the address is confirmed.</p>
        <p style="font-size:13px;color:#666">— Mark Eichenlaub</p>
      </div>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
        bcc: 'mark.d.eichenlaub@gmail.com',
        to: [contact.email],
        subject: `Confirm your email for ${studentName}'s tutoring updates`,
        html,
      }),
    })
    const data = await res.json()
    if (!res.ok || !data?.id) return json({ error: data?.message || 'send failed' }, 502)

    return json({ ok: true, sent_to: contact.email })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
