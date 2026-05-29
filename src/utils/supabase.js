import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dnRheGJudHFoY2ZxdGF6Ym50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTcyMDcsImV4cCI6MjA5NTQ5MzIwN30.uPWnJGvQQtCfbpZj3Slwdq8jA3p40NupQWK5F9ViNHM'

// Public client — used for student auth and RLS-scoped reads
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Admin helpers (service key, bypasses RLS) ──────────────────────────────

const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || ''

export function getServiceKey() {
  return localStorage.getItem('trajectory_supabase_service_key') || SUPABASE_SERVICE_KEY
}

export function setServiceKey(key) {
  localStorage.setItem('trajectory_supabase_service_key', key)
}

function adminClient() {
  return createClient(SUPABASE_URL, getServiceKey(), { auth: { persistSession: false } })
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
  const q = adminClient().from('sessions').select('*').order('scheduled_at', { ascending: false })
  if (studentId) q.eq('student_id', studentId)
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

export async function fetchStudentSessions() {
  const { data, error } = await supabase
    .from('sessions').select('*').order('scheduled_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}
