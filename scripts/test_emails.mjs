// One-off script to test the two admin notification emails:
//   1. "Invoice ready" notice for the most recent draft invoice
//   2. "Time for progress report" reminder for Borna
// Usage: node scripts/test_emails.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(__dirname, '../.env'), 'utf8')
    .split('\n')
    .find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
    ?.split('=').slice(1).join('=').trim()

if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const MARK_EMAIL = 'mark.d.eichenlaub@gmail.com'

async function sendEmail(to, subject, body) {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: { to, subject, body },
  })
  if (error) throw new Error(`invoke error: ${error.message}`)
  if (data?.name === 'validation_error' || (data && !data.id)) {
    throw new Error(data?.message || `send failed: ${JSON.stringify(data)}`)
  }
  return data
}

// ── 1. Invoice ready notification ─────────────────────────────────────────────

const { data: invoices, error: invErr } = await supabase
  .from('invoices')
  .select('id, student_id, status, created_at')
  .order('created_at', { ascending: false })
  .limit(5)

if (invErr) { console.error('invoices query failed:', invErr.message); process.exit(1) }

if (!invoices?.length) {
  console.log('No invoices found in the database.')
} else {
  const invoice = invoices[0]
  console.log(`Found invoice ${invoice.id} (status: ${invoice.status}) for student ${invoice.student_id}`)

  const { data: student } = await supabase
    .from('students')
    .select('id, name')
    .eq('id', invoice.student_id)
    .single()

  const studentName = student?.name ?? invoice.student_id
  const subject = `Invoice ready for ${studentName}`
  const body = `Invoice ready for ${studentName} — review and send from the portal: https://portal.eichenlaubphysics.com/`

  console.log(`\nSending invoice notification email...`)
  console.log(`  To: ${MARK_EMAIL}`)
  console.log(`  Subject: ${subject}`)
  try {
    await sendEmail(MARK_EMAIL, subject, body)
    console.log('  ✓ Invoice notification sent.')
  } catch (e) {
    console.error('  ✗ Failed:', e.message)
  }
}

// ── 2. Progress report reminder for Borna ─────────────────────────────────────

const { data: bornaRows } = await supabase
  .from('students')
  .select('id, name, last_report_reminder_at')
  .ilike('name', '%borna%')

if (!bornaRows?.length) {
  console.error('\nCould not find a student named Borna.')
  process.exit(1)
}

const borna = bornaRows[0]
console.log(`\nFound student: ${borna.name} (${borna.id})`)

// Count completed sessions since last report
const { data: lastReport } = await supabase
  .from('progress_reports')
  .select('created_at')
  .eq('student_id', borna.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle()

const anchor = lastReport?.created_at ?? null
const nowIso = new Date().toISOString()

let countQ = supabase
  .from('sessions')
  .select('id', { count: 'exact', head: true })
  .eq('student_id', borna.id)
  .not('end_time', 'is', null)
  .lte('end_time', nowIso)
if (anchor) countQ = countQ.gt('end_time', anchor)

const { count } = await countQ
const completed = count ?? 0
console.log(`Sessions since last report: ${completed} (anchor: ${anchor ?? 'none'})`)

const reportSubject = `Time for ${borna.name}'s progress report`
const reportBody = `Time for ${borna.name}'s progress report — ${completed} sessions since the last one.\nPortal: https://portal.eichenlaubphysics.com/`

console.log(`\nSending progress report reminder email...`)
console.log(`  To: ${MARK_EMAIL}`)
console.log(`  Subject: ${reportSubject}`)
try {
  await sendEmail(MARK_EMAIL, reportSubject, reportBody)
  console.log('  ✓ Report reminder sent.')

  // Update reminder timestamp so this cycle is marked as reminded
  await supabase.from('students')
    .update({ last_report_reminder_at: nowIso })
    .eq('id', borna.id)
  console.log('  ✓ last_report_reminder_at updated.')
} catch (e) {
  console.error('  ✗ Failed:', e.message)
}
