import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { fileSubmission } from '../_shared/submission-core.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

// Service-role twin of notify-submission for callers that already know which
// student/assignment a file belongs to and have no student JWT to prove it
// (e.g. the homework-email-agent script). Same effect as a portal submission —
// see _shared/submission-core.ts. Only a caller holding the real service key
// may call this; there is no other path in.
function isAuthorized(req: Request): boolean {
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim()
  return !!token && token === SUPABASE_SERVICE_KEY
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (!isAuthorized(req)) return json({ error: 'forbidden' }, 403)

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { student_id, assignment_id, submissions } = await req.json() as {
    student_id: string
    assignment_id: string
    submissions: Array<{ url: string; file_name: string }>
  }
  if (!student_id || !assignment_id || !submissions?.length) {
    return json({ error: 'missing fields' }, 400)
  }

  const { data: student } = await admin
    .from('students').select('id, name').eq('id', student_id).maybeSingle()
  if (!student) return json({ error: 'no student found' }, 404)

  const { data: assignment } = await admin
    .from('assignments')
    .select('id, status, problem_id')
    .eq('id', assignment_id)
    .eq('student_id', student.id)
    .maybeSingle()
  if (!assignment) return json({ error: 'assignment not found' }, 404)

  const result = await fileSubmission({ admin, student, assignment, submissions })
  if (!result.ok) return json({ error: result.error }, result.status)
  return json({ ok: true, ...(result.skipped ? { skipped: result.skipped } : {}) })
})
