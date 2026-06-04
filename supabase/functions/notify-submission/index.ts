import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SB_PUBLISHABLE_KEY')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

const MARK_EMAIL = 'mark.d.eichenlaub@gmail.com'
const PORTAL_URL = 'https://portal.eichenlaubphysics.com/'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const authHeader = req.headers.get('Authorization') || ''
  if (!authHeader) return json({ error: 'unauthorized' }, 401)

  // Authenticate the calling student
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return json({ error: 'unauthorized' }, 401)

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Resolve student record
  const { data: student } = await admin
    .from('students').select('id, name').eq('user_id', user.id).maybeSingle()
  if (!student) return json({ error: 'no student found' }, 403)

  const { assignment_id, submission_url } = await req.json() as {
    assignment_id: string; submission_url: string
  }
  if (!assignment_id || !submission_url) return json({ error: 'missing fields' }, 400)

  // Verify the assignment belongs to this student
  const { data: assignment } = await admin
    .from('assignments')
    .select('id, status, problem_id')
    .eq('id', assignment_id)
    .eq('student_id', student.id)
    .maybeSingle()
  if (!assignment) return json({ error: 'assignment not found' }, 404)
  if (assignment.status !== 'assigned') return json({ ok: true, skipped: 'already submitted' })

  // Update to submitted
  const { error: updateErr } = await admin.from('assignments').update({
    status: 'submitted',
    submission_url,
    submission_at: new Date().toISOString(),
  }).eq('id', assignment_id)
  if (updateErr) return json({ error: updateErr.message }, 500)

  // Fetch problem name for the email
  const { data: problem } = await admin
    .from('problems').select('name, contest, year, label').eq('id', assignment.problem_id).maybeSingle()
  const problemLabel = problem
    ? `${problem.contest} ${problem.year} ${problem.label} — ${problem.name}`
    : assignment.problem_id

  // Email Mark
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
      to: [MARK_EMAIL],
      subject: `${student.name} submitted a solution`,
      text: [
        `${student.name} submitted a solution for:`,
        `  ${problemLabel}`,
        '',
        `View submission: ${submission_url}`,
        '',
        `Upload feedback at: ${PORTAL_URL}`,
      ].join('\n'),
    }),
  }).catch(e => console.error('email failed:', e))

  return json({ ok: true })
})
