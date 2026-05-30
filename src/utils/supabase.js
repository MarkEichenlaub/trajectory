import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
// Publishable key (new Supabase API-key system). Safe to ship in the browser:
// it is RLS-scoped exactly like the old anon key, never bypasses RLS.
const SUPABASE_ANON_KEY = 'sb_publishable_51M6zUC11pz8fIPkCvi4WQ_owCE99pB'

// Single authenticated client. Admin access is granted server-side through RLS
// (is_admin() policies keyed off the admin's profile), so there is NO service
// key in the browser — a privileged key shipped to the client would bypass all
// row-level security. "Admin" calls below use this same client; the database
// decides what the logged-in admin may read and write.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Retained as a thin alias so the admin data helpers below read clearly. It is
// the ordinary authenticated client — it does NOT bypass RLS.
function adminClient() {
  return supabase
}

export async function fetchStudents() {
  const { data, error } = await adminClient().from('students').select('*').order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function fetchAssignments() {
  const { data, error } = await adminClient()
    .from('assignments').select('*').order('assigned_date', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function insertAssignments(rows) {
  const { error } = await adminClient().from('assignments').insert(rows)
  if (error) throw new Error(error.message)
}

export async function updateAssignment(id, updates) {
  const { error } = await adminClient().from('assignments').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteAssignment(studentId, problemId) {
  const { error } = await adminClient().from('assignments')
    .delete().eq('student_id', studentId).eq('problem_id', problemId)
  if (error) throw new Error(error.message)
}

export async function saveStudent(student) {
  const { error } = await adminClient().from('students')
    .upsert({ ...student }, { onConflict: 'id' })
  if (error) throw new Error(error.message)
}

export async function removeStudent(id) {
  const { error } = await adminClient().from('students').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchSessions(studentId) {
  let q = adminClient().from('sessions').select('*').order('scheduled_at', { ascending: false })
  if (studentId) q = q.eq('student_id', studentId)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data || []
}

export async function saveSession(session) {
  const { error } = await adminClient().from('sessions').upsert(session, { onConflict: 'id' })
  if (error) throw new Error(error.message)
}

export async function deleteSession(id) {
  const { error } = await adminClient().from('sessions').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchStudentContacts(studentId) {
  const { data, error } = await adminClient()
    .from('student_contacts').select('*').eq('student_id', studentId).order('created_at')
  if (error) throw new Error(error.message)
  return data || []
}

export async function saveStudentContact(contact) {
  const { error } = await adminClient()
    .from('student_contacts').upsert(contact, { onConflict: 'student_id,email' })
  if (error) throw new Error(error.message)
}

export async function deleteStudentContact(id) {
  const { error } = await adminClient().from('student_contacts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function updateStudentContact(id, updates) {
  const { error } = await adminClient().from('student_contacts').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
}

// Send (or resend) the email-confirmation link for a contact. The caller's JWT
// (admin or portal user) authorizes the request server-side.
export async function sendContactVerification(contactId) {
  const { data, error } = await supabase.functions.invoke('send-contact-verification', {
    body: { contact_id: contactId },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data
}

export async function sendEmail({ to, subject, body }) {
  const { data, error } = await adminClient().functions.invoke('send-email', {
    body: { to, subject, body },
  })
  if (error) throw new Error(error.message)
  if (data?.name === 'validation_error' || (data && !data.id)) throw new Error(data?.message || 'Send failed')
  return data
}

// ── Student self-service contact management (public client, RLS-scoped) ──────

export async function fetchMyContacts(studentId) {
  const { data, error } = await supabase
    .from('student_contacts').select('*').eq('student_id', studentId).order('created_at')
  if (error) throw new Error(error.message)
  return data || []
}

// Student-role read: get_my_contacts() omits invoice routing fields, so a
// student can see what each contact receives without seeing billing info.
export async function fetchMyContactsView(studentId) {
  const { data, error } = await supabase.rpc('get_my_contacts', { p_student_id: studentId })
  if (error) throw new Error(error.message)
  return data || []
}

export async function addMyContact(contact) {
  const { data, error } = await supabase
    .from('student_contacts').insert(contact).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateMyContact(id, updates) {
  const { error } = await supabase.from('student_contacts').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteMyContact(id) {
  const { error } = await supabase.from('student_contacts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchHandouts() {
  const { data, error } = await adminClient()
    .from('handouts').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

export async function saveHandout(handout) {
  const { error } = await adminClient()
    .from('handouts').upsert(handout, { onConflict: 'id' })
  if (error) throw new Error(error.message)
}

export async function deleteHandout(id) {
  const { error } = await adminClient().from('handouts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function uploadHandoutPDF(file, handoutId) {
  const ext = file.name.split('.').pop()
  const path = `${handoutId}.${ext}`
  const { error } = await adminClient()
    .storage.from('handout-pdfs').upload(path, file, { upsert: true })
  if (error) throw new Error(error.message)
  const { data } = adminClient().storage.from('handout-pdfs').getPublicUrl(path)
  return data.publicUrl
}

// ── Invoices (admin) ─────────────────────────────────────────────────────────

export async function fetchInvoices(studentId) {
  let q = adminClient().from('invoices').select('*').order('created_at', { ascending: false })
  if (studentId) q = q.eq('student_id', studentId)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data || []
}

// Send the staged billing-contact email for a drafted invoice, then mark it sent.
export async function sendStagedInvoice(invoice) {
  await sendEmail({
    to: invoice.staged_email_to,
    subject: invoice.staged_email_subject,
    body: invoice.staged_email_body,
  })
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30)
  const { error } = await adminClient()
    .from('invoices').update({ status: 'sent', due_date: dueDate.toISOString() }).eq('id', invoice.id)
  if (error) throw new Error(error.message)
}

// ── Progress reports (admin) ───────────────────────────────────────────────

export async function fetchProgressReports(studentId) {
  const { data, error } = await adminClient()
    .from('progress_reports').select('*').eq('student_id', studentId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

export async function uploadProgressReport(file, studentId, title) {
  const ext = file.name.split('.').pop()
  const path = `${studentId}/${crypto.randomUUID()}.${ext}`
  const client = adminClient()

  const { error: upErr } = await client.storage
    .from('progress-reports').upload(path, file, { upsert: true, contentType: file.type })
  if (upErr) throw new Error(upErr.message)
  const { data: pub } = client.storage.from('progress-reports').getPublicUrl(path)

  // Count completed sessions since the previous report, for the cycle label.
  const { data: prev } = await client.from('progress_reports')
    .select('created_at').eq('student_id', studentId)
    .order('created_at', { ascending: false }).limit(1).maybeSingle()
  let countQ = client.from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .not('end_time', 'is', null)
    .lte('end_time', new Date().toISOString())
  if (prev?.created_at) countQ = countQ.gt('end_time', prev.created_at)
  const { count } = await countQ

  const { data, error } = await client.from('progress_reports')
    .insert({ student_id: studentId, title, pdf_url: pub.publicUrl, sessions_covered: count ?? 0 })
    .select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteProgressReport(id) {
  const client = adminClient()
  const { data: row } = await client.from('progress_reports').select('pdf_url').eq('id', id).single()
  if (row?.pdf_url) {
    const marker = '/progress-reports/'
    const idx = row.pdf_url.indexOf(marker)
    if (idx >= 0) {
      const path = row.pdf_url.slice(idx + marker.length)
      await client.storage.from('progress-reports').remove([path])
    }
  }
  const { error } = await client.from('progress_reports').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Progress reports (student, public client + RLS) ───────────────────────────

export async function fetchMyProgressReports() {
  const { data, error } = await supabase
    .from('progress_reports').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

// ── Student-facing helpers (uses public client + RLS) ─────────────────────

export async function fetchStudentAssignments() {
  const { data, error } = await supabase
    .from('assignments').select('*').order('assigned_date', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

export async function linkStudentAccount() {
  const { error } = await supabase.rpc('link_student_account')
  if (error) console.warn('link_student_account:', error.message)
}

// Resolve the logged-in account: grandfathers a first login into a profile +
// links, then returns { role, email, students:[{id,name,status,relationship}] }.
export async function resolveMyAccount() {
  const { data, error } = await supabase.rpc('resolve_my_account')
  if (error) throw new Error(error.message)
  return data || { role: 'none', students: [] }
}

export async function fetchStudentSessions() {
  const { data, error } = await supabase
    .from('sessions').select('*').order('scheduled_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

export async function fetchMyInvoices() {
  const { data, error } = await supabase
    .from('invoices').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

// ── Accounts graph (admin; access via is_admin() RLS policies) ───────────────

export async function fetchProfiles() {
  const { data, error } = await adminClient().from('profiles').select('*').order('email')
  if (error) throw new Error(error.message)
  return data || []
}

export async function fetchStudentLinks() {
  const { data, error } = await adminClient().from('student_links').select('*')
  if (error) throw new Error(error.message)
  return data || []
}

export async function fetchInvites() {
  const { data, error } = await adminClient()
    .from('invites').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

export async function deleteInvite(id) {
  const { error } = await adminClient().from('invites').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Invites & status (admin + parents; both have an auth session) ────────────

// Sends an invitation email. The invitee accepts by signing in with this email;
// resolve_my_account() then provisions their profile/link/contact.
export async function createInvite({ student_id, email, relationship = 'parent', account_type = 'parent' }) {
  const { data, error } = await supabase.functions.invoke('create-invite', {
    body: { student_id, email, relationship, account_type },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data
}

// Active/inactive toggle. Authorized server-side to admin or billing-capable
// accounts via the set_student_status() SECURITY DEFINER function.
export async function setStudentStatus(studentId, status) {
  const { error } = await supabase.rpc('set_student_status', {
    p_student_id: studentId, p_status: status,
  })
  if (error) throw new Error(error.message)
}

// Cancels all upcoming sessions for a student (DB rows + Cal.com bookings).
// Call after setStudentStatus when pausing.
export async function cancelUpcomingSessions(studentId) {
  const { data, error } = await supabase.functions.invoke('cancel-upcoming-sessions', {
    body: { student_id: studentId },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data
}

// ── Student accessible sources (admin; access via is_admin() RLS policies) ──

export async function fetchStudentAccessibleSources(studentId) {
  const { data, error } = await adminClient()
    .from('student_accessible_sources').select('source').eq('student_id', studentId)
  if (error) throw new Error(error.message)
  return (data || []).map(r => r.source)
}

export async function saveStudentAccessibleSources(studentId, sources) {
  const admin = adminClient()
  const { error: delErr } = await admin
    .from('student_accessible_sources').delete().eq('student_id', studentId)
  if (delErr) throw new Error(delErr.message)
  if (sources.length > 0) {
    const rows = sources.map(source => ({ student_id: studentId, source }))
    const { error } = await admin.from('student_accessible_sources').insert(rows)
    if (error) throw new Error(error.message)
  }
}

// ── Student-facing problem bank (public client + RLS) ─────────────────────

export async function fetchMyAccessibleSources() {
  const { data, error } = await supabase.from('student_accessible_sources').select('source')
  if (error) throw new Error(error.message)
  return (data || []).map(r => r.source)
}

export async function fetchHandoutsPublic() {
  const { data, error } = await supabase
    .from('handouts').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

export async function markMyProblemCompleted(studentId, problemId) {
  const date = new Date().toISOString().slice(0, 10)
  const { data: existing } = await supabase
    .from('assignments').select('id, status').eq('student_id', studentId).eq('problem_id', problemId)
    .maybeSingle()
  if (existing?.status === 'completed') return null
  if (existing) {
    const { error } = await supabase
      .from('assignments').update({ status: 'completed', completed_date: date }).eq('id', existing.id)
    if (error) throw new Error(error.message)
    return { ...existing, status: 'completed', completed_date: date }
  }
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}-${problemId.slice(-8)}`
  const { data, error } = await supabase
    .from('assignments')
    .insert({ id, student_id: studentId, problem_id: problemId, status: 'completed', assigned_date: date, completed_date: date })
    .select().single()
  if (error) throw new Error(error.message)
  return data
}
