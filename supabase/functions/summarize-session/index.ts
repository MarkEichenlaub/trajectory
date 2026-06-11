import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const MIRO_ACCESS_TOKEN = Deno.env.get('MIRO_ACCESS_TOKEN')!

// Exports the Miro board PDF for a session and returns its public URL.
// The actual AI analysis is done by the local ai-server.mjs using the claude CLI
// (runs on Mark's machine via his Claude subscription, not API credits).
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'unauthorized' }, 401)

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Accept the service key (from the local AI server) OR a valid admin user JWT.
  const token = authHeader.replace(/^bearer\s+/i, '')
  let authorized = token === SUPABASE_SERVICE_KEY

  if (!authorized) {
    const callerClient = createClient(SUPABASE_URL, Deno.env.get('SB_PUBLISHABLE_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authErr } = await callerClient.auth.getUser()
    if (!authErr && user) {
      const { data: profile } = await supabase
        .from('students').select('account_type').eq('id', user.id).single()
      authorized = profile?.account_type === 'admin'
    }
  }

  if (!authorized) return json({ error: 'forbidden' }, 403)

  const body = await req.json().catch(() => ({}))
  const { sessionId } = body
  if (!sessionId) return json({ error: 'sessionId required' }, 400)

  const { data: session, error: sessionErr } = await supabase
    .from('sessions')
    .select('id, miro_board_id, miro_pdf_url')
    .eq('id', sessionId)
    .single()

  if (sessionErr || !session) return json({ error: 'session not found' }, 404)
  if (!session.miro_board_id && !session.miro_pdf_url) {
    return json({ error: 'no whiteboard for this session' }, 400)
  }

  // Return existing PDF URL, or export a new one from Miro.
  let pdfUrl = session.miro_pdf_url
  if (!pdfUrl && session.miro_board_id) {
    pdfUrl = await exportMiroPDF(session.miro_board_id)
    if (!pdfUrl) return json({ error: 'miro export failed or timed out' }, 502)
    await supabase.from('sessions').update({ miro_pdf_url: pdfUrl }).eq('id', sessionId)
  }

  return json({ pdfUrl })
})

async function exportMiroPDF(boardId: string): Promise<string | null> {
  const createRes = await fetch(`https://api.miro.com/v2/boards/${encodeURIComponent(boardId)}/export/jobs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MIRO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ format: 'pdf' }),
  })
  if (!createRes.ok) return null

  const job = await createRes.json() as { id: string; status: string }

  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 5000))
    const statusRes = await fetch(
      `https://api.miro.com/v2/boards/${encodeURIComponent(boardId)}/export/jobs/${job.id}`,
      { headers: { 'Authorization': `Bearer ${MIRO_ACCESS_TOKEN}` } }
    )
    const status = await statusRes.json() as { status: string; url?: string; downloadLink?: string }
    if (['FINISHED', 'finished', 'completed'].includes(status.status)) {
      return status.url || status.downloadLink || null
    }
    if (['FAILED', 'failed', 'error'].includes(status.status)) return null
  }
  return null
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}
