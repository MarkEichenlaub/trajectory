// Submit hook for a finished F=ma practice exam.
//
// This used to email Mark the score and the per-question table the instant a
// student submitted, and scripts/fma-narrative-agent.mjs followed a few minutes
// later with the analysis. Two emails about one sitting was one too many, so
// the agent now sends a single message carrying both the table and the read,
// and this function no longer mails anything. Mark waits a few extra minutes
// and gets it all in one place.
//
// The function stays because the portal calls it on submit and because it is
// the natural place to hang anything that has to happen the moment an attempt
// closes. It validates the caller and confirms the attempt is finished, so a
// broken submit path still shows up as an error here rather than silently.
//
// The email itself, the scratch-work attachment and the topics column all live
// in scripts/fma-narrative-agent.mjs now.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SB_PUBLISHABLE_KEY')!
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const authHeader = req.headers.get('Authorization') || ''
  if (!authHeader) return json({ error: 'unauthorized' }, 401)

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return json({ error: 'unauthorized' }, 401)

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data: links } = await admin
    .from('student_links').select('student_id, relationship').eq('account_id', user.id)
  const link = (links || []).find((l: { relationship: string }) => l.relationship === 'self') || (links || [])[0]
  if (!link) return json({ error: 'no student found' }, 403)
  const { data: student } = await admin
    .from('students').select('id, name').eq('id', link.student_id).maybeSingle()
  if (!student) return json({ error: 'no student found' }, 403)

  const { attempt_id } = await req.json() as { attempt_id: string }
  if (!attempt_id) return json({ error: 'missing attempt_id' }, 400)

  const { data: attempt } = await admin
    .from('fma_attempts')
    .select('id, status, mode, score, exam_id')
    .eq('id', attempt_id)
    .eq('student_id', student.id)
    .maybeSingle()
  if (!attempt) return json({ error: 'attempt not found' }, 404)

  // An in_progress row means the caller got here without going through one of
  // the submit RPCs.
  if (attempt.status === 'in_progress') {
    return json({ ok: true, skipped: 'attempt still in progress' })
  }

  // The narrative agent polls for finished attempts with no narrative row, so
  // there is nothing to enqueue here -- just say the attempt is ready for it.
  console.log(`fma attempt ${attempt_id} (${student.name}, ${attempt.exam_id}) finished; narrative agent will report it.`)
  return json({ ok: true, reported_by: 'fma-narrative-agent' })
})
