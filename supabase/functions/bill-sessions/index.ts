import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function stripePost(path: string, params: Record<string, string | number>) {
  const body = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) body.append(k, String(v))
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Stripe ${path} failed: ${json.error?.message || res.status}`)
  return json
}

Deno.serve(async (_req) => {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString()

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, student_id, end_time')
    .not('end_time', 'is', null)
    .lte('end_time', cutoff)
    .eq('balance_decremented', false)
    .not('student_id', 'is', null)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!sessions?.length) {
    return new Response(JSON.stringify({ processed: 0, invoicesSent: [] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let processed = 0
  const invoicesSent: string[] = []
  const errors: string[] = []

  for (const session of sessions) {
    try {
      // Mark as decremented atomically — skip if someone else already did it
      const { data: updated, error: markErr } = await supabase
        .from('sessions')
        .update({ balance_decremented: true })
        .eq('id', session.id)
        .eq('balance_decremented', false)
        .select('id')

      if (markErr || !updated?.length) continue

      // Fetch student fresh each iteration to see latest balance
      const { data: student } = await supabase
        .from('students')
        .select('id, name, billing_name, session_balance, hourly_rate, stripe_customer_id')
        .eq('id', session.student_id)
        .single()

      if (!student) continue

      const newBalance = (student.session_balance ?? 0) - 1

      await supabase.from('students')
        .update({ session_balance: newBalance })
        .eq('id', student.id)

      processed++

      // Invoice when balance hits 1 and student has a non-zero rate
      if (newBalance === 1 && student.hourly_rate > 0) {
        const { data: contacts } = await supabase
          .from('student_contacts')
          .select('email')
          .eq('student_id', student.id)
          .eq('receives_invoices', true)
          .limit(1)

        const invoiceEmail = contacts?.[0]?.email
        if (!invoiceEmail) continue

        // Get or create Stripe customer
        let customerId = student.stripe_customer_id
        if (!customerId) {
          const customer = await stripePost('customers', {
            email: invoiceEmail,
            name: student.billing_name || student.name,
            'metadata[student_id]': student.id,
          })
          customerId = customer.id
          await supabase.from('students')
            .update({ stripe_customer_id: customerId })
            .eq('id', student.id)
        }

        const unitAmountCents = Math.round(student.hourly_rate * 100)

        // Create invoice first, then attach item (newer Stripe API requires explicit invoice ID on item)
        const invoice = await stripePost('invoices', {
          customer: customerId,
          collection_method: 'send_invoice',
          days_until_due: 14,
          auto_advance: 'false',
          description: `Physics tutoring — 10 sessions with ${student.name}`,
          footer: `Student portal: https://portal.eichenlaubphysics.com/?student=${student.id}`,
          'metadata[student_id]': student.id,
          'payment_settings[payment_method_types][0]': 'card',
          'payment_settings[payment_method_types][1]': 'us_bank_account',
        })

        await stripePost('invoiceitems', {
          customer: customerId,
          invoice: invoice.id,
          quantity: 10,
          'price_data[currency]': 'usd',
          'price_data[product]': 'prod_UbcwrASWAMCNgU',
          'price_data[unit_amount]': unitAmountCents,
        })

        // Store as draft — admin reviews and sends manually
        await supabase.from('invoices').insert({
          student_id: student.id,
          stripe_invoice_id: invoice.id,
          stripe_invoice_url: `https://dashboard.stripe.com/invoices/${invoice.id}`,
          amount_cents: unitAmountCents * 10,
          sessions_count: 10,
          status: 'draft',
        })

        invoicesSent.push(`${student.name} — $${student.hourly_rate * 10} (draft)`)
      }
    } catch (e) {
      const msg = (e as Error).message
      console.error('bill-sessions error for', session.id, msg)
      errors.push(msg)
    }
  }

  return new Response(JSON.stringify({ processed, invoicesSent, errors }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
