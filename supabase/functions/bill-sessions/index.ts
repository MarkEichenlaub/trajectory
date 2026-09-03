import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!  // new secret API key (RLS-bypass); replaces legacy service_role
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')!

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

async function stripeGet(path: string) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Stripe GET ${path} failed: ${json.error?.message || res.status}`)
  return json
}

const MARK_EMAIL = 'mark.d.eichenlaub@gmail.com'

async function sendEmail(to: string | string[], subject: string, body: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, subject, body }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`send-email failed: ${res.status} ${t}`)
  }
}

function buildInvoiceEmail(studentName: string, amountDollars: number, hostedUrl: string): { subject: string; body: string } {
  const subject = `Invoice for ${studentName}'s physics tutoring — next 10 sessions`
  const body = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f4efe3;font-family:'IBM Plex Sans',Helvetica,Arial,sans-serif;color:#2a3142;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <h1 style="font-family:Spectral,Georgia,serif;color:#2a4a6d;font-size:22px;font-weight:600;margin:0 0 4px;">Eichenlaub Physics</h1>
    <div style="height:2px;background:#e2d8c4;margin:14px 0 22px;"></div>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Hello,</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      ${studentName} has nearly used their current block of tutoring sessions. To keep things uninterrupted,
      here is the invoice for the next block of <strong>10 sessions</strong>, totaling
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

// Reminds Mark when a student has accumulated 10 completed sessions since their
// last progress report. Fires once per cycle; re-arms when the next report exists.
async function checkReportReminder(
  student: { id: string; name: string; last_report_reminder_at: string | null },
) {
  const { data: lastReport } = await supabase
    .from('progress_reports')
    .select('created_at')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const anchor = lastReport?.created_at ?? null
  const nowIso = new Date().toISOString()

  let q = supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', student.id)
    .eq('session_type', 'session')
    .not('end_time', 'is', null)
    .lte('end_time', nowIso)
  if (anchor) q = q.gt('end_time', anchor)

  const { count } = await q
  const completed = count ?? 0
  if (completed < 10) return

  const remindedAt = student.last_report_reminder_at
  const alreadyRemindedThisCycle = remindedAt && (!anchor || remindedAt >= anchor)
  if (alreadyRemindedThisCycle) return

  await sendEmail(
    MARK_EMAIL,
    `Time for ${student.name}'s progress report`,
    `Time for ${student.name}'s progress report — ${completed} sessions since the last one.\n\nGenerate a draft:\n  node reports/draft.mjs ${student.id}\n\nEdit the .typ file in reports/${student.id}/, compile to PDF, then upload from the admin portal (Progress & Plan tab).\n\nAdmin: https://portal.eichenlaubphysics.com/`,
  )

  await supabase.from('students')
    .update({ last_report_reminder_at: nowIso })
    .eq('id', student.id)
}

async function sendVenmoReminder(
  student: { id: string; name: string; first_name: string | null; billing_name: string | null; gender: string | null },
  cycleSessions: { id: string; scheduled_at: string; tags: string[] | null }[],
) {
  const count = cycleSessions.length
  const sessionLines = cycleSessions.map(s => {
    const d = new Date(s.scheduled_at)
    const date = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'America/New_York' })
    const tags = (s.tags || []).join(', ')
    return tags ? `${date}: ${tags}` : date
  }).join('\n')

  const firstName = student.first_name || student.name.split(' ')[0]
  const billingName = student.billing_name || 'their parent'
  const pronoun = student.gender === 'female' ? 'She' : student.gender === 'male' ? 'He' : 'They'

  await sendEmail(
    MARK_EMAIL,
    `Venmo invoice due for ${student.name}`,
    `Hi Mark,\n\n${student.name} is due for a new invoice on Venmo to ${billingName}. ${pronoun} has 0 sessions of credit remaining.\n\nHere is a message for the Venmo request:\n\n${firstName} next ${count} physics sessions.\n\nLast cycle:\n${sessionLines}`,
  )

  const ids = cycleSessions.map(s => s.id)
  await supabase.from('sessions')
    .update({ venmo_invoiced: true })
    .in('id', ids)
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

// Stripe owns the due date — it is set by days_until_due at finalization and is
// what the customer sees on their invoice. The portal used to write its own
// "send date + 30 days" into this column, which drifted weeks away from reality
// and made the admin overdue badge useless. Copy the real value back, which also
// repairs rows written under the old behavior.
//
// Nothing else watches unpaid invoices: Stripe's own dunning is off (these are
// created with auto_advance false so Mark can send his own branded email), and
// no other job reads due dates. Without the notice below an unpaid invoice is
// silent forever.
async function checkOverdueInvoices() {
  const { data: open } = await supabase
    .from('invoices')
    .select('id, student_id, stripe_invoice_id, due_date, status, amount_cents, overdue_notified_at, students(name, billing_name)')
    .in('status', ['draft', 'sent'])
    .not('stripe_invoice_id', 'is', null)

  const now = Date.now()

  for (const inv of open || []) {
    let dueDate = inv.due_date as string | null

    try {
      const remote = await stripeGet(`invoices/${inv.stripe_invoice_id}`) as {
        due_date?: number | null; status?: string
      }
      // Stripe reports seconds; the column is timestamptz.
      const remoteDue = remote.due_date ? new Date(remote.due_date * 1000).toISOString() : null
      if (remoteDue && remoteDue !== dueDate) {
        const { error } = await supabase.from('invoices')
          .update({ due_date: remoteDue }).eq('id', inv.id)
        if (error) console.error('due_date sync failed for', inv.id, error.message)
        else console.log(`invoice ${inv.id}: due_date ${dueDate} → ${remoteDue}`)
        dueDate = remoteDue
      }
      // The webhook normally marks payment, but a missed delivery would leave a
      // paid invoice nagging forever. Trust Stripe here.
      if (remote.status === 'paid' || remote.status === 'void') {
        await supabase.from('invoices')
          .update({ status: remote.status === 'paid' ? 'paid' : 'void' }).eq('id', inv.id)
        continue
      }
    } catch (e) {
      console.error('Stripe invoice fetch failed for', inv.stripe_invoice_id, (e as Error).message)
      // Fall through and still evaluate the stored date rather than going quiet.
    }

    if (inv.status !== 'sent' || !dueDate) continue
    if (new Date(dueDate).getTime() > now) continue

    // Nag once when it lapses, then weekly — this runs every 5 minutes.
    const last = inv.overdue_notified_at ? new Date(inv.overdue_notified_at as string).getTime() : 0
    if (last && now - last < WEEK_MS) continue

    const rel = inv.students as unknown as { name?: string; billing_name?: string } | { name?: string; billing_name?: string }[]
    const s = Array.isArray(rel) ? rel[0] : rel
    const studentName = s?.name ?? inv.student_id
    const payer = s?.billing_name ?? 'the family'
    const amount = ((inv.amount_cents as number) / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    const dueWhen = new Date(dueDate).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York',
    })
    const daysLate = Math.floor((now - new Date(dueDate).getTime()) / (24 * 60 * 60 * 1000))
    const lateLabel = daysLate < 1 ? 'due today' : `${daysLate} day${daysLate === 1 ? '' : 's'} past due`

    try {
      await sendEmail(
        MARK_EMAIL,
        `Unpaid invoice: ${studentName} — ${amount} (${lateLabel})`,
        `${studentName}'s invoice for ${amount} was due ${dueWhen} and is still unpaid (${lateLabel}).\n\n`
        + `Billed to: ${payer}\n`
        + `Stripe: https://dashboard.stripe.com/invoices/${inv.stripe_invoice_id}\n\n`
        + `You'll get this again in a week if it stays open.`,
      )
      await supabase.from('invoices')
        .update({ overdue_notified_at: new Date().toISOString() }).eq('id', inv.id)
    } catch (e) {
      console.error('overdue notice failed for', inv.id, (e as Error).message)
    }
  }
}

// Finds non-invoicing active students whose balance has hit 0 and who have
// un-emailed sessions, then sends the Venmo reminder. Runs at the end of every
// cron invocation so it also catches failures from prior runs.
async function checkVenmoReminders() {
  const { data: students } = await supabase
    .from('students')
    .select('id, name, first_name, billing_name, gender')
    .lte('session_balance', 0)
    .eq('invoicing_enabled', false)
    .eq('status', 'active')

  for (const student of students || []) {
    const { data: cycleSessions } = await supabase
      .from('sessions')
      .select('id, scheduled_at, tags')
      .eq('student_id', student.id)
      .eq('session_type', 'session')
      .eq('balance_decremented', true)
      .eq('venmo_invoiced', false)
      .order('scheduled_at', { ascending: true })

    if (!cycleSessions?.length) continue

    try {
      await sendVenmoReminder(student, cycleSessions)
    } catch (e) {
      console.error('venmo reminder failed for', student.id, (e as Error).message)
    }
  }
}

Deno.serve(async (req) => {
  // Deployed --no-verify-jwt (the cron posts the publishable key, not a JWT, so the
  // gateway can't authenticate it). Auth is this shared-secret header instead.
  if (req.headers.get('X-Cron-Secret') !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString()

  // Parent check-ins are free, so they must never reach the balance decrement
  // below — a 15-minute call would otherwise cost the family a full session.
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, student_id, scheduled_at, end_time')
    .eq('session_type', 'session')
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
    try {
      await checkVenmoReminders()
    } catch (e) {
      console.error('checkVenmoReminders failed:', (e as Error).message)
    }
    try {
      await checkOverdueInvoices()
    } catch (e) {
      console.error('checkOverdueInvoices failed:', (e as Error).message)
    }
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
        .select('id, name, billing_name, session_balance, hourly_rate, stripe_customer_id, last_report_reminder_at, status, invoicing_enabled')
        .eq('id', session.student_id)
        .single()

      if (!student) continue

      // A session normally costs 1 credit, but longer bookings (e.g. Akshatha's
      // 90-minute sessions) cost proportionally more: credits are hours long,
      // computed from the calendar-synced scheduled_at/end_time span so a
      // 1.5-hour session counts as 1.5 rather than silently costing the same
      // as a 1-hour one.
      const startMs = new Date(session.scheduled_at as string).getTime()
      const endMs = new Date(session.end_time as string).getTime()
      const sessionCost = Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs
        ? Math.round(((endMs - startMs) / (60 * 60 * 1000)) * 100) / 100
        : 1

      const newBalance = (student.session_balance ?? 0) - sessionCost

      await supabase.from('students')
        .update({ session_balance: newBalance })
        .eq('id', student.id)

      processed++

      // Paused (inactive) students: keep the balance accounting but stop all
      // automated nudges and invoicing.
      if (student.status !== 'active') continue

      // Progress-report reminder: nudge Mark every 10 completed sessions per cycle.
      try {
        await checkReportReminder(student)
      } catch (e) {
        console.error('report reminder check failed for', student.id, (e as Error).message)
      }

      // Invoice when the balance is down to its last session, invoicing is
      // enabled, and the student has a non-zero rate.
      //
      // This tested `=== 1`, which silently skipped anyone already at or below
      // zero: a student switched onto invoicing after their block had run out
      // had no crossing left to catch, so they were never billed at all. `<= 1`
      // catches them, and the open-invoice guard is what stops it raising a
      // fresh invoice every session while one is still unpaid.
      if (newBalance <= 1 && student.invoicing_enabled && student.hourly_rate > 0) {
        const { data: openInvoices } = await supabase
          .from('invoices').select('id')
          .eq('student_id', student.id)
          .in('status', ['draft', 'sent'])
          .limit(1)
        if (openInvoices?.length) continue

        const { data: contacts } = await supabase
          .from('student_contacts')
          .select('email')
          .eq('student_id', student.id)
          .eq('receives_invoices', true)
          .eq('verified', true)
          .eq('bounced', false)
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
          days_until_due: 7,
          auto_advance: 'false',
          description: `Physics tutoring — 10 sessions with ${student.name}`,
          footer: `Student portal: https://portal.eichenlaubphysics.com/`,
          'metadata[student_id]': student.id,
          'payment_settings[payment_method_types][0]': 'card',
          'payment_settings[payment_method_types][1]': 'us_bank_account',
        })

        // Record the local invoice row BEFORE finalizing the Stripe invoice. If a
        // later step fails, we still have a row tied to stripe_invoice_id — so a
        // finalized (real, owed) Stripe invoice is never orphaned without a local
        // record. If this insert fails, we throw before finalizing, so nothing
        // billable was created. The staged email (which needs the hosted URL from
        // finalize) is filled in by the update below.
        const { error: insertErr } = await supabase.from('invoices').insert({
          student_id: student.id,
          stripe_invoice_id: invoice.id,
          stripe_invoice_url: `https://dashboard.stripe.com/invoices/${invoice.id}`,
          amount_cents: unitAmountCents * 10,
          sessions_count: 10,
          status: 'draft',
          staged_email_to: invoiceEmail,
        })
        if (insertErr) throw new Error(`invoice insert failed: ${insertErr.message}`)

        await stripePost('invoiceitems', {
          customer: customerId,
          invoice: invoice.id,
          quantity: 10,
          'price_data[currency]': 'usd',
          'price_data[product]': 'prod_UbcwrASWAMCNgU',
          'price_data[unit_amount]': unitAmountCents,
        })

        // Finalize to generate the hosted payment page URL. auto_advance is false,
        // so Stripe will NOT email anyone — Mark sends our own email from the portal.
        const finalized = await stripePost(`invoices/${invoice.id}/finalize`, {
          auto_advance: 'false',
        })
        const hostedUrl = finalized.hosted_invoice_url as string

        // Compose the billing-contact email now and stage it onto the existing row.
        const amountDollars = student.hourly_rate * 10
        const staged = buildInvoiceEmail(student.name, amountDollars, hostedUrl)

        const { error: stageErr } = await supabase.from('invoices')
          .update({
            staged_email_subject: staged.subject,
            staged_email_body: staged.body,
          })
          .eq('stripe_invoice_id', invoice.id)
        if (stageErr) throw new Error(`invoice stage update failed: ${stageErr.message}`)

        // Notify Mark that an invoice is staged and ready to review/send.
        try {
          await sendEmail(
            MARK_EMAIL,
            `Invoice ready for ${student.name}`,
            `Invoice ready for ${student.name} — review and send from the portal: https://portal.eichenlaubphysics.com/`,
          )
        } catch (e) {
          console.error('Mark invoice-notice email failed:', (e as Error).message)
        }

        invoicesSent.push(`${student.name} — $${amountDollars} (draft)`)
      }
    } catch (e) {
      const msg = (e as Error).message
      console.error('bill-sessions error for', session.id, msg)
      errors.push(msg)
    }
  }

  // Send Venmo reminders for any non-invoicing students whose balance has hit 0.
  // Runs after session processing so this-run decrements are included, and also
  // catches emails that failed on a previous cron invocation.
  try {
    await checkVenmoReminders()
  } catch (e) {
    console.error('checkVenmoReminders failed:', (e as Error).message)
  }
  try {
    await checkOverdueInvoices()
  } catch (e) {
    console.error('checkOverdueInvoices failed:', (e as Error).message)
  }

  return new Response(JSON.stringify({ processed, invoicesSent, errors }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
