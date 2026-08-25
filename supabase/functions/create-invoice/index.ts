// Raise a Stripe invoice for one student on demand, from the admin Billing tab.
//
// bill-sessions raises invoices automatically as a block of sessions runs out,
// but it can only do so at the moment the balance crosses its threshold. A
// student who is already at zero — or who is being switched onto Stripe billing
// for the first time — has no crossing left to catch, so there has to be a way
// to bill them deliberately.
//
// Like the automatic path this finalizes the invoice but does NOT let Stripe
// email it (auto_advance false). The covering email is staged onto the invoice
// row and sent from the portal after Mark reads it.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SB_PUBLISHABLE_KEY')!
const SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const SESSIONS_PER_BLOCK = 10
const STRIPE_PRODUCT = 'prod_UbcwrASWAMCNgU'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function stripePost(path: string, body: Record<string, string | number>) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body as Record<string, string>).toString(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error?.message || `stripe ${path} failed`)
  return json
}

// Same wording as the automatic path, so a hand-raised invoice is
// indistinguishable to the person receiving it.
function buildInvoiceEmail(studentName: string, amountDollars: number, hostedUrl: string) {
  const subject = `Invoice for ${studentName}'s physics tutoring — next ${SESSIONS_PER_BLOCK} sessions`
  const body = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f4efe3;font-family:'IBM Plex Sans',Helvetica,Arial,sans-serif;color:#2a3142;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <h1 style="font-family:Spectral,Georgia,serif;color:#2a4a6d;font-size:22px;font-weight:600;margin:0 0 4px;">Eichenlaub Physics</h1>
    <div style="height:2px;background:#e2d8c4;margin:14px 0 22px;"></div>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Hello,</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      Here is the invoice for ${studentName}'s next block of <strong>${SESSIONS_PER_BLOCK} sessions</strong>, totaling
      <strong>$${amountDollars.toLocaleString()}</strong>.
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">
      You can pay securely online (card or bank transfer) using the button below. Sessions are credited
      to ${studentName}'s portal balance as soon as payment is received.
    </p>
    <p style="margin:0 0 28px;">
      <a href="${hostedUrl}" style="display:inline-block;background:#2a4a6d;color:#f4efe3;text-decoration:none;font-size:15px;font-weight:600;padding:12px 28px;border-radius:6px;">Pay invoice</a>
    </p>
    <p style="font-size:13px;line-height:1.6;color:#6b7280;margin:0 0 4px;">
      If the button doesn't work, copy this link into your browser:<br>
      <a href="${hostedUrl}" style="color:#2a4a6d;word-break:break-all;">${hostedUrl}</a>
    </p>
    <div style="height:1px;background:#e2d8c4;margin:24px 0 16px;"></div>
    <p style="font-size:13px;line-height:1.6;color:#6b7280;margin:0;">
      Thank you,<br>Mark Eichenlaub<br>
      Sign in to the <a href="https://portal.eichenlaubphysics.com/" style="color:#2a4a6d;">portal</a> to schedule sessions, view assignments, and check session summaries.
    </p>
  </div>
</body></html>`
  return { subject, body }
}

async function isAdmin(req: Request): Promise<boolean> {
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return false
  if (token === SERVICE_KEY) return true
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase
    .from('profiles').select('account_type').eq('id', user.id).single()
  return profile?.account_type === 'admin'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  if (!(await isAdmin(req))) return json({ error: 'forbidden' }, 403)

  try {
    const { student_id } = await req.json()
    if (!student_id) return json({ error: 'student_id required' }, 400)

    const { data: student } = await supabase
      .from('students')
      .select('id, name, billing_name, hourly_rate, stripe_customer_id')
      .eq('id', student_id).single()
    if (!student) return json({ error: 'student not found' }, 404)
    if (!student.hourly_rate) return json({ error: `${student.name} has no hourly rate set` }, 400)

    // Refuse to stack a second unpaid invoice on the same student.
    const { data: open } = await supabase
      .from('invoices').select('id, status')
      .eq('student_id', student_id).in('status', ['draft', 'sent'])
    if (open?.length) {
      return json({ error: `${student.name} already has an unpaid invoice (${open[0].status}). Send or void it first.` }, 409)
    }

    const { data: contacts } = await supabase
      .from('student_contacts').select('email')
      .eq('student_id', student_id)
      .eq('receives_invoices', true).eq('verified', true).eq('bounced', false)
      .limit(1)
    const invoiceEmail = contacts?.[0]?.email
    if (!invoiceEmail) return json({ error: `No verified billing contact for ${student.name}` }, 400)

    let customerId = student.stripe_customer_id
    if (!customerId) {
      const customer = await stripePost('customers', {
        email: invoiceEmail,
        name: student.billing_name || student.name,
        'metadata[student_id]': student.id,
      })
      customerId = customer.id
      await supabase.from('students').update({ stripe_customer_id: customerId }).eq('id', student.id)
    }

    const unitAmountCents = Math.round(student.hourly_rate * 100)

    const invoice = await stripePost('invoices', {
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 7,
      auto_advance: 'false',
      description: `Physics tutoring — ${SESSIONS_PER_BLOCK} sessions with ${student.name}`,
      footer: `Student portal: https://portal.eichenlaubphysics.com/`,
      'metadata[student_id]': student.id,
      'payment_settings[payment_method_types][0]': 'card',
      'payment_settings[payment_method_types][1]': 'us_bank_account',
    })

    // Record locally before finalizing, so a finalized (real, owed) Stripe
    // invoice can never exist without a row pointing at it.
    const { error: insertErr } = await supabase.from('invoices').insert({
      student_id: student.id,
      stripe_invoice_id: invoice.id,
      stripe_invoice_url: `https://dashboard.stripe.com/invoices/${invoice.id}`,
      amount_cents: unitAmountCents * SESSIONS_PER_BLOCK,
      sessions_count: SESSIONS_PER_BLOCK,
      status: 'draft',
      staged_email_to: invoiceEmail,
    })
    if (insertErr) throw new Error(`invoice insert failed: ${insertErr.message}`)

    await stripePost('invoiceitems', {
      customer: customerId,
      invoice: invoice.id,
      quantity: SESSIONS_PER_BLOCK,
      'price_data[currency]': 'usd',
      'price_data[product]': STRIPE_PRODUCT,
      'price_data[unit_amount]': unitAmountCents,
    })

    const finalized = await stripePost(`invoices/${invoice.id}/finalize`, { auto_advance: 'false' })
    const hostedUrl = finalized.hosted_invoice_url as string

    const amountDollars = student.hourly_rate * SESSIONS_PER_BLOCK
    const staged = buildInvoiceEmail(student.name, amountDollars, hostedUrl)
    const { error: stageErr } = await supabase.from('invoices')
      .update({ staged_email_subject: staged.subject, staged_email_body: staged.body })
      .eq('stripe_invoice_id', invoice.id)
    if (stageErr) throw new Error(`invoice stage update failed: ${stageErr.message}`)

    return json({
      ok: true,
      stripe_invoice_id: invoice.id,
      amount_dollars: amountDollars,
      staged_email_to: invoiceEmail,
      hosted_invoice_url: hostedUrl,
    })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})
