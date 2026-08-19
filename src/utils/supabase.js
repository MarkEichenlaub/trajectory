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
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { flowType: 'implicit' },
})

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
    .from('assignments').select('*, assignment_submissions(id, file_url)').order('assigned_date', { ascending: false })
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

export async function deleteAssignment(assignmentId) {
  const { error } = await adminClient().from('assignments')
    .delete().eq('id', assignmentId)
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

// Explicit columns (the student-facing list + admin billing fields) and a row
// cap keep this query fast — it runs on every admin boot.
const ADMIN_SESSION_COLUMNS = 'id, student_id, scheduled_at, notes, miro_board_id, miro_board_url, miro_pdf_url, meet_url, cal_booking_id, cal_uid, gcal_event_id, end_time, created_at, summary, tags, paid, balance_decremented'

export async function fetchSessions(studentId) {
  let q = adminClient().from('sessions').select(ADMIN_SESSION_COLUMNS)
    .order('scheduled_at', { ascending: false }).limit(300)
  if (studentId) q = q.eq('student_id', studentId)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data || []
}

export async function saveSession(session) {
  const { error } = await adminClient().from('sessions').upsert(session, { onConflict: 'id' })
  if (error) throw new Error(error.message)
}

export async function updateSession(id, updates) {
  const { error } = await adminClient().from('sessions').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
}

// Routes through the delete_session RPC (SECURITY DEFINER, admin-guarded) rather
// than a plain table delete: the RPC also refunds the session credit if the
// session had already been billed, so a deleted session never counts against the
// student's balance. Callers should refresh students afterward to show the new
// balance.
export async function deleteSession(id) {
  const { error } = await adminClient().rpc('delete_session', { p_session_id: id })
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

// Targeted column update (draft status transitions, review notes). Unlike
// saveHandout's whole-row upsert, this never touches columns it isn't given.
export async function updateHandout(id, updates) {
  const { error } = await adminClient().from('handouts').update(updates).eq('id', id)
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

export async function uploadHandoutSolutionPDF(file, handoutId) {
  const ext = file.name.split('.').pop()
  const path = `${handoutId}-sol.${ext}`
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
    .from('assignments').select('*, assignment_submissions(id, file_url)').order('assigned_date', { ascending: false })
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

// Excludes admin-only columns (paid, balance_decremented) from the student-facing query.
export async function fetchStudentSessions() {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, student_id, scheduled_at, notes, miro_board_id, miro_board_url, miro_pdf_url, meet_url, cal_booking_id, cal_uid, gcal_event_id, end_time, created_at, summary, tags')
    .order('scheduled_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

// ── Direct scheduling (Google Calendar-backed) ────────────────────────────────

export async function getAvailability(from, to) {
  const { data, error } = await supabase.functions.invoke('get-availability', {
    body: { from, to },
  })
  if (error) throw new Error(error.message || String(error))
  if (data?.error) throw new Error(data.error)
  return data?.slots || []
}

export async function bookSession(slot, studentId) {
  // studentId is supplied only when an admin books on a student's behalf;
  // otherwise the edge function books for the caller's own linked student.
  const { data, error } = await supabase.functions.invoke('book-session', {
    body: studentId ? { slot, student_id: studentId } : { slot },
  })
  if (error) throw new Error(error.message || String(error))
  if (data?.error) throw new Error(data.error)
  if (!data?.session_id || !data?.scheduled_at) throw new Error('Unexpected response from booking service')
  return data
}

export async function rescheduleSession(sessionId, newSlot) {
  const { data, error } = await supabase.functions.invoke('reschedule-session', {
    body: { session_id: sessionId, new_slot: newSlot },
  })
  if (error) throw new Error(error.message || String(error))
  if (data?.error) throw new Error(data.error)
  if (!data?.scheduled_at) throw new Error('Unexpected response from booking service')
  return data
}

// ── Trial session booking (public, no auth required) ─────────────────────────

export async function getTrialAvailability(from, to) {
  const { data, error } = await supabase.functions.invoke('get-trial-availability', {
    body: { from, to },
  })
  if (error) throw new Error(error.message || String(error))
  if (data?.error) throw new Error(data.error)
  return data?.slots || []
}

export async function bookTrial({ slot, name, email, notes }) {
  const { data, error } = await supabase.functions.invoke('book-trial', {
    body: { slot, name, email, notes },
  })
  if (error) throw new Error(error.message || String(error))
  if (data?.error) throw new Error(data.error)
  return data
}

export async function cancelSession(sessionId, message) {
  const { data, error } = await supabase.functions.invoke('cancel-session', {
    body: { session_id: sessionId, ...(message ? { message } : {}) },
  })
  if (error) throw new Error(error.message || String(error))
  if (data?.error) throw new Error(data.error)
  return data
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

// Cancels all upcoming sessions for a student (DB rows).
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

// ── Submissions (student uploads work; admin uploads feedback) ────────────────

// Upload a student's submission file and return the public URL.
// Each file gets a unique path so multiple submissions per assignment don't overwrite each other.
export async function uploadSubmission(studentId, assignmentId, file) {
  const ext = file.name.split('.').pop() || 'bin'
  const uniqueSuffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
  const path = `${studentId}/${assignmentId}-${uniqueSuffix}.${ext}`
  const { error } = await supabase.storage
    .from('submissions')
    .upload(path, file, { contentType: file.type })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('submissions').getPublicUrl(path)
  return data.publicUrl
}

// After uploading all files, call notify-submission to record them and email Mark.
// submissions: [{ url, fileName }]
export async function notifySubmission(assignmentId, submissions) {
  const { data, error } = await supabase.functions.invoke('notify-submission', {
    body: { assignment_id: assignmentId, submissions },
  })
  if (error) throw new Error(error.message || String(error))
  return data
}

// Admin: upload feedback for an assignment and return the public URL.
export async function uploadFeedback(studentId, assignmentId, file) {
  const ext = file.name.split('.').pop() || 'bin'
  const path = `${studentId}/${assignmentId}.${ext}`
  const { error } = await supabase.storage
    .from('feedback')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('feedback').getPublicUrl(path)
  return data.publicUrl
}

// Admin: mark assignment as reviewed + email the student's contacts.
export async function publishFeedback(assignment, feedbackUrl, studentName, problemLabel) {
  const { error } = await supabase.from('assignments').update({
    status: 'reviewed',
    feedback_url: feedbackUrl,
    feedback_at: new Date().toISOString(),
  }).eq('id', assignment.id)
  if (error) throw new Error(error.message)

  // Notify contacts who opted into assignment emails
  const { data: contacts } = await supabase
    .from('student_contacts')
    .select('email')
    .eq('student_id', assignment.student_id)
    .eq('receives_assignments', true)
    .eq('verified', true)
    .eq('bounced', false)
  const emails = (contacts || []).map(c => c.email).filter(Boolean)
  if (!emails.length) return

  await supabase.functions.invoke('send-email', {
    body: {
      to: emails,
      subject: `Feedback ready for ${studentName}: ${problemLabel}`,
      body: [
        `Hi,`,
        '',
        `Feedback is now available for ${studentName}'s submission of:`,
        `  ${problemLabel}`,
        '',
        `View feedback and your progress at: https://portal.eichenlaubphysics.com/`,
      ].join('\n'),
    },
  })
}

// ── Excluded problems (admin) ─────────────────────────────────────────────────

export async function fetchExcludedProblems() {
  const { data, error } = await adminClient().from('excluded_problems').select('problem_id')
  if (error) throw new Error(error.message)
  return new Set((data || []).map(r => r.problem_id))
}

export async function excludeProblem(problemId) {
  const { error } = await adminClient()
    .from('excluded_problems')
    .upsert({ problem_id: problemId }, { onConflict: 'problem_id' })
  if (error) throw new Error(error.message)
}

// ── Session problems (on-deck, admin) ────────────────────────────────────────

export async function fetchSessionProblems(studentId) {
  let q = adminClient().from('session_problems').select('*').order('created_at')
  if (studentId) q = q.eq('student_id', studentId)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data || []
}

export async function insertSessionProblems(rows) {
  const { error } = await adminClient().from('session_problems').insert(rows)
  if (error) throw new Error(error.message)
}

export async function deleteSessionProblem(id) {
  const { error } = await adminClient().from('session_problems').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// Student-facing: RLS limits to this student's sessions with end_time set
export async function fetchMySessionProblems() {
  const { data, error } = await supabase.from('session_problems').select('*').order('created_at')
  if (error) throw new Error(error.message)
  return data || []
}

export async function markMyProblemCompleted(studentId, problemId) {
  const date = new Date().toISOString().slice(0, 10)
  const { data: existing } = await supabase
    .from('assignments').select('id, status').eq('student_id', studentId).eq('problem_id', problemId)
  // A book/source can have several independent assignment rows (e.g. separate
  // chapters); complete the still-open one rather than whichever row sorts first.
  const pending = (existing || []).find(a => a.status !== 'completed')
  if (pending) {
    const { error } = await supabase
      .from('assignments').update({ status: 'completed', completed_date: date }).eq('id', pending.id)
    if (error) throw new Error(error.message)
    return { ...pending, status: 'completed', completed_date: date }
  }
  if (existing && existing.length > 0) return null
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}-${problemId.slice(-8)}`
  const { data, error } = await supabase
    .from('assignments')
    .insert({ id, student_id: studentId, problem_id: problemId, status: 'completed', assigned_date: date, completed_date: date })
    .select().single()
  if (error) throw new Error(error.message)
  return data
}

// ── F=ma practice tests ────────────────────────────────────────────────────

// Every column of fma_questions EXCEPT correct_choice, which is column-revoked
// from `authenticated` (see 20260819150000_fma_hardening.sql). Selecting '*'
// here would 403 — the key is served only by fetchFmaAttemptDetail, and only
// once the attempt is graded.
const FMA_QUESTION_COLS = 'id, exam_id, question_num, statement, figure_urls, choices, topics, tags'

// Exams that have digitized questions, newest first. `pdf_url` is included so
// paper-first mode can link out to the exam the student is meant to work from.
export async function fetchFmaExams() {
  const { data, error } = await supabase.from('fma_questions').select('exam_id')
  if (error) throw new Error(error.message)
  const ids = [...new Set((data || []).map(r => r.exam_id))]
  if (ids.length === 0) return []
  const { data: exams, error: hErr } = await supabase
    .from('handouts').select('id, name, year, pdf_url').in('id', ids)
  if (hErr) throw new Error(hErr.message)
  return (exams || []).sort((a, b) => (b.year || 0) - (a.year || 0))
}

export async function fetchFmaQuestions(examId) {
  const { data, error } = await supabase
    .from('fma_questions').select(FMA_QUESTION_COLS).eq('exam_id', examId).order('question_num')
  if (error) throw new Error(error.message)
  return data || []
}

export async function createFmaAttempt(studentId, examId, mode) {
  const { data, error } = await supabase
    .from('fma_attempts').insert({ student_id: studentId, exam_id: examId, mode }).select().single()
  if (error) throw new Error(error.message)
  return data
}

// Upserts the student's current choice for one question (live or paper-first mode),
// and appends a timestamped event so every click — not just the final one — is
// logged. The event log is analysis-only, so a failure there must not surface as
// an error on an answer that genuinely saved.
export async function saveFmaAnswer(attemptId, questionId, selectedChoice) {
  const { error } = await supabase
    .from('fma_attempt_answers')
    .upsert({ attempt_id: attemptId, question_id: questionId, selected_choice: selectedChoice }, { onConflict: 'attempt_id,question_id' })
  if (error) throw new Error(error.message)

  await supabase
    .from('fma_answer_events')
    .insert({ attempt_id: attemptId, question_id: questionId, selected_choice: selectedChoice, event_type: 'answer' })
    .then(({ error: evErr }) => { if (evErr) console.warn('fma: answer event not logged', evErr.message) })
}

// Flag / unflag a question for review. A flag may exist before any answer, so
// this upserts a row that can legitimately carry a null selected_choice.
export async function setFmaFlag(attemptId, questionId, flagged) {
  const { error } = await supabase
    .from('fma_attempt_answers')
    .upsert({ attempt_id: attemptId, question_id: questionId, flagged }, { onConflict: 'attempt_id,question_id' })
  if (error) throw new Error(error.message)
}

// Crossed-out choices for one question, as an array of 'A'..'E'.
export async function setFmaEliminated(attemptId, questionId, eliminated) {
  const { error } = await supabase
    .from('fma_attempt_answers')
    .upsert({ attempt_id: attemptId, question_id: questionId, eliminated_choices: eliminated }, { onConflict: 'attempt_id,question_id' })
  if (error) throw new Error(error.message)
}

// Records that a question became the one on screen. Together with 'answer'
// events this gives an honest per-question time: a question is "active" from
// the moment it is shown until the next event on a different question. Purely
// analytical — never blocks or errors the student's flow.
export async function logFmaQuestionView(attemptId, questionId) {
  const { error } = await supabase
    .from('fma_answer_events')
    .insert({ attempt_id: attemptId, question_id: questionId, selected_choice: null, event_type: 'view' })
  if (error) console.warn('fma: view event not logged', error.message)
}

// Answers already recorded for an attempt, so a resumed test can be rehydrated.
export async function fetchFmaAttemptAnswers(attemptId) {
  const { data, error } = await supabase
    .from('fma_attempt_answers').select('*').eq('attempt_id', attemptId)
  if (error) throw new Error(error.message)
  return data || []
}

// Discards an attempt the student backed out of. Only ever called for an
// attempt with no answers recorded, so nothing of value is lost — this keeps
// Start→Cancel from littering "Past attempts" with empty in_progress rows.
export async function deleteFmaAttempt(attemptId) {
  const { error } = await supabase.from('fma_attempts').delete().eq('id', attemptId)
  if (error) throw new Error(error.message)
}

// Full event history for an attempt, in order.
export async function fetchFmaAnswerEvents(attemptId) {
  const { data, error } = await supabase
    .from('fma_answer_events').select('*').eq('attempt_id', attemptId).order('clicked_at')
  if (error) throw new Error(error.message)
  return data || []
}

// One scratch-work upload per attempt, in every mode. This used to be
// per-question in live mode, which nobody would realistically do 25 times — and
// it silently did nothing when the student uploaded before picking an answer,
// because it UPDATEd an fma_attempt_answers row that did not exist yet.
export async function uploadFmaScratchWork(studentId, attemptId, file) {
  const ext = file.name.split('.').pop() || 'bin'
  const path = `${studentId}/${attemptId}.${ext}`
  const { error } = await supabase.storage
    .from('fma-scratch-work')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw new Error(error.message)
  // The bucket is private, so we persist the object path and sign it on demand
  // rather than storing a permanent world-readable URL.
  const { error: aErr } = await supabase
    .from('fma_attempts').update({ scratch_work_url: path }).eq('id', attemptId)
  if (aErr) throw new Error(aErr.message)
  return path
}

// Short-lived link to a scratch-work file. Accepts a stored path, or a legacy
// full public URL from before the bucket was made private.
export async function signFmaScratchWork(pathOrUrl, expiresInSec = 3600) {
  if (!pathOrUrl) return null
  const marker = '/fma-scratch-work/'
  const path = pathOrUrl.includes(marker)
    ? pathOrUrl.slice(pathOrUrl.indexOf(marker) + marker.length)
    : pathOrUrl
  const { data, error } = await supabase.storage
    .from('fma-scratch-work').createSignedUrl(path, expiresInSec)
  if (error) throw new Error(error.message)
  return data.signedUrl
}

// Grades a live/paper-first attempt. The grading itself runs in a SECURITY
// DEFINER function: the browser never sees the answer key, can't write `score`
// (column-revoked), and the whole thing is one atomic statement rather than 25
// sequential UPDATEs that could half-apply.
export async function submitFmaAttempt(attemptId) {
  const { data, error } = await supabase.rpc('submit_fma_attempt', { p_attempt_id: attemptId })
  if (error) throw new Error(error.message)
  return Array.isArray(data) ? data[0] : data
}

// score_only mode: self-reported by design, but range-checked server-side.
export async function submitFmaScoreOnly(attemptId, score) {
  const { data, error } = await supabase.rpc('submit_fma_score_only', { p_attempt_id: attemptId, p_score: score })
  if (error) throw new Error(error.message)
  return Array.isArray(data) ? data[0] : data
}

export async function fetchFmaAttempts(studentId) {
  const { data, error } = await supabase
    .from('fma_attempts').select('*, handouts:exam_id(id, name, year)').eq('student_id', studentId).order('started_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

export async function fetchFmaAttemptDetail(attemptId) {
  const { data: attempt, error: aErr } = await supabase
    .from('fma_attempts').select('*, handouts:exam_id(id, name, year)').eq('id', attemptId).single()
  if (aErr) throw new Error(aErr.message)
  const { data: answers, error: ansErr } = await supabase
    .from('fma_attempt_answers').select('*').eq('attempt_id', attemptId)
  if (ansErr) throw new Error(ansErr.message)
  // correct_choice comes back non-null only once the attempt is graded, so an
  // in-progress attempt can never leak the key into the review screen.
  const { data: questions, error: qErr } = await supabase
    .rpc('fma_attempt_questions', { p_attempt_id: attemptId })
  if (qErr) throw new Error(qErr.message)
  const answerByQuestion = new Map((answers || []).map(a => [a.question_id, a]))

  // Seconds per question. Every event ('view' on navigation, 'answer' on a
  // click) marks the question on screen from that instant, so each question is
  // credited with the span running up to the next event elsewhere. Only live
  // mode navigates question-by-question; paper-first enters answers in bulk, so
  // there is no meaningful per-question time to report.
  const events = attempt.mode === 'live' ? await fetchFmaAnswerEvents(attemptId) : []
  const secondsByQuestion = new Map()
  const endedAt = attempt.submitted_at ? new Date(attempt.submitted_at) : null
  events.forEach((ev, i) => {
    const next = events[i + 1] ? new Date(events[i + 1].clicked_at) : endedAt
    if (!next) return
    const span = (next - new Date(ev.clicked_at)) / 1000
    if (span <= 0) return
    secondsByQuestion.set(ev.question_id, (secondsByQuestion.get(ev.question_id) || 0) + span)
  })

  return { attempt, questions: questions || [], answerByQuestion, events, secondsByQuestion }
}
