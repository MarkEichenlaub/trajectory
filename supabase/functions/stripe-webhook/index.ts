import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!  // new secret API key (RLS-bypass); replaces legacy service_role
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts: Record<string, string[]> = {}
  for (const part of sigHeader.split(',')) {
    const idx = part.indexOf('=')
    if (idx < 0) continue
    const k = part.slice(0, idx)
    const v = part.slice(idx + 1)
    if (!parts[k]) parts[k] = []
    parts[k].push(v)
  }

  const timestamp = parts['t']?.[0]
  const signatures = parts['v1'] ?? []
  if (!timestamp || signatures.length === 0) return false

  const signed = `${timestamp}.${payload}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed))
  const computed = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return signatures.some(s => s === computed)
}

Deno.serve(async (req) => {
  const sigHeader = req.headers.get('stripe-signature')
  if (!sigHeader) return new Response('No signature', { status: 400 })

  const payload = await req.text()

  // Signature verification is mandatory. A missing secret is a misconfiguration,
  // not a reason to trust unsigned input — without this, anyone could POST a fake
  // "payment_succeeded" and mint free session credits.
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set — refusing to process webhook')
    return new Response('Webhook secret not configured', { status: 500 })
  }
  const valid = await verifyStripeSignature(payload, sigHeader, STRIPE_WEBHOOK_SECRET)
  if (!valid) return new Response('Invalid signature', { status: 400 })

  const event = JSON.parse(payload)

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object

    // Idempotency: claim the invoice by flipping it to 'paid' only if it isn't
    // already. The row-level UPDATE is atomic, so duplicate/redelivered webhooks
    // (Stripe guarantees at-least-once, not exactly-once) can't double-credit —
    // exactly one delivery wins the claim and credits the balance.
    const { data: claimed, error: claimErr } = await supabase
      .from('invoices')
      .update({ status: 'paid' })
      .eq('stripe_invoice_id', invoice.id)
      .neq('status', 'paid')
      .select('student_id, sessions_count')

    if (claimErr) {
      console.error('invoice claim failed:', claimErr.message)
      return new Response(JSON.stringify({ error: claimErr.message }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      })
    }

    if (claimed && claimed.length > 0) {
      const { student_id, sessions_count } = claimed[0]
      const { data: student } = await supabase
        .from('students')
        .select('session_balance')
        .eq('id', student_id)
        .single()

      if (student) {
        await supabase.from('students')
          .update({ session_balance: (student.session_balance ?? 0) + (sessions_count ?? 10) })
          .eq('id', student_id)
      }
    } else {
      // No unpaid local invoice matched — already processed, or an invoice with
      // no local row (e.g. created outside this system). Either way, don't credit.
      console.log('no unpaid invoice row for', invoice.id, '— skipping credit')
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
