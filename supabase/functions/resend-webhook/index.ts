import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!  // new secret API key (RLS-bypass); replaces legacy service_role
// Resend signs webhooks with Svix. Copy the "Signing Secret" (whsec_...) from
// the Resend dashboard webhook into this env var.
const WEBHOOK_SECRET = Deno.env.get('RESEND_WEBHOOK_SECRET') || ''

function b64decode(s: string): Uint8Array {
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
function b64encode(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

// Svix signature verification: HMAC-SHA256 over `${id}.${timestamp}.${body}`
// keyed by the base64 secret (after the whsec_ prefix). The svix-signature
// header is space-separated "v1,<sig>" entries; any match passes.
async function verifySvix(secret: string, id: string, ts: string, body: string, header: string) {
  const key = await crypto.subtle.importKey(
    'raw', b64decode(secret.replace(/^whsec_/, '')),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${ts}.${body}`))
  const expected = b64encode(new Uint8Array(sig))
  return header.split(' ').some(part => part.split(',')[1] === expected)
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const raw = await req.text()
  const id = req.headers.get('svix-id') || ''
  const ts = req.headers.get('svix-timestamp') || ''
  const sig = req.headers.get('svix-signature') || ''

  if (WEBHOOK_SECRET) {
    const ok = await verifySvix(WEBHOOK_SECRET, id, ts, raw, sig).catch(() => false)
    if (!ok) return new Response('Invalid signature', { status: 401 })
  }

  let event: { type?: string; data?: Record<string, unknown> }
  try { event = JSON.parse(raw) } catch { return new Response('Invalid JSON', { status: 400 }) }

  const type = event.type || ''
  if (type !== 'email.bounced' && type !== 'email.complained') {
    return new Response('ignored', { status: 200 })
  }

  const data = event.data || {}
  const to = Array.isArray(data.to) ? (data.to as string[]) : (data.to ? [String(data.to)] : [])
  if (to.length === 0) return new Response('no recipients', { status: 200 })

  const bounce = data.bounce as { message?: string; subType?: string } | undefined
  const reason = type === 'email.complained'
    ? 'spam complaint'
    : (bounce?.message || bounce?.subType || 'bounced')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  for (const email of to) {
    const { error } = await supabase
      .from('student_contacts')
      .update({ bounced: true, bounced_at: new Date().toISOString(), bounce_reason: reason })
      .ilike('email', email)
    if (error) console.error('bounce update failed for', email, error.message)
  }

  return new Response(JSON.stringify({ ok: true, marked: to }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
})
