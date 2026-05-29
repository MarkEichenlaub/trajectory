import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
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

  if (STRIPE_WEBHOOK_SECRET) {
    const valid = await verifyStripeSignature(payload, sigHeader, STRIPE_WEBHOOK_SECRET)
    if (!valid) return new Response('Invalid signature', { status: 400 })
  }

  const event = JSON.parse(payload)

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object
    const studentId = invoice.metadata?.student_id

    if (studentId) {
      const { data: student } = await supabase
        .from('students')
        .select('session_balance')
        .eq('id', studentId)
        .single()

      if (student) {
        await supabase.from('students')
          .update({ session_balance: (student.session_balance ?? 0) + 10 })
          .eq('id', studentId)

        await supabase.from('invoices')
          .update({ status: 'paid' })
          .eq('stripe_invoice_id', invoice.id)
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
