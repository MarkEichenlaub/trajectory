import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dnRheGJudHFoY2ZxdGF6Ym50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTcyMDcsImV4cCI6MjA5NTQ5MzIwN30.uPWnJGvQQtCfbpZj3Slwdq8jA3p40NupQWK5F9ViNHM'

// Public client — used for student auth and RLS-scoped reads
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Admin helpers (service key, bypasses RLS) ──────────────────────────────

export function getServiceKey() {
  return localStorage.getItem('trajectory_supabase_service_key') || ''
}

export function setServiceKey(key) {
  localStorage.setItem('trajectory_supabase_service_key', key)
}

function adminClient() {
  const key = getServiceKey()
  if (!key) throw new Error('No Supabase service key configured. Go to Settings.')
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false } })
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
