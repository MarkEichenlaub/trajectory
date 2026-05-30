import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!  // new secret API key (RLS-bypass); replaces legacy service_role
const PORTAL_URL = 'https://portal.eichenlaubphysics.com/'

function page(title: string, message: string) {
  return `<!doctype html><html><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title}</title></head>
    <body style="font-family:system-ui,sans-serif;background:#f5f6f8;margin:0">
      <div style="max-width:440px;margin:14vh auto;background:#fff;border:1px solid #e3e6ea;border-radius:12px;padding:32px;text-align:center">
        <h1 style="font-size:20px;margin:0 0 12px;color:#1a1a1a">${title}</h1>
        <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 24px">${message}</p>
        <a href="${PORTAL_URL}" style="background:#2a4a6d;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">Go to the portal</a>
      </div>
    </body></html>`
}

function html(body: string, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get('token')
  if (!token) return html(page('Invalid link', 'This confirmation link is missing its token.'), 400)

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Only an unverified row with a matching token is updated; clearing the token
  // makes the link single-use.
  const { data, error } = await supabase
    .from('student_contacts')
    .update({ verified: true, verified_at: new Date().toISOString(), verification_token: null })
    .eq('verification_token', token)
    .select('email')
    .maybeSingle()

  if (error) return html(page('Something went wrong', 'Please try again or contact mark@eichenlaubphysics.com.'), 500)
  if (!data) return html(page('Link already used or expired', 'This email may already be confirmed. If not, request a new confirmation link from the portal.'))

  return html(page('Email confirmed', `${data.email} will now receive tutoring updates. Thank you!`))
})
