import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const MIRO_ACCESS_TOKEN = Deno.env.get('MIRO_ACCESS_TOKEN')!
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() })
  }

  // Require admin auth via the service key header or the caller's JWT
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return json({ error: 'unauthorized' }, 401)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Validate that the caller is an admin
  const callerClient = createClient(SUPABASE_URL, Deno.env.get('SB_PUBLISHABLE_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: authErr } = await callerClient.auth.getUser()
  if (authErr || !user) return json({ error: 'unauthorized' }, 401)
  const { data: profile } = await supabase.from('students').select('account_type').eq('id', user.id).single()
  if (profile?.account_type !== 'admin') return json({ error: 'forbidden' }, 403)

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

  // Get PDF url — export if not already available
  let pdfUrl = session.miro_pdf_url
  if (!pdfUrl && session.miro_board_id) {
    pdfUrl = await exportMiroPDF(session.miro_board_id)
    if (!pdfUrl) return json({ error: 'miro export failed or timed out' }, 502)
    await supabase.from('sessions').update({ miro_pdf_url: pdfUrl }).eq('id', sessionId)
  }

  // Download PDF and encode as base64
  const pdfRes = await fetch(pdfUrl!)
  if (!pdfRes.ok) return json({ error: 'could not download PDF' }, 502)
  const pdfBytes = await pdfRes.arrayBuffer()
  const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)))

  // Call Claude with the whiteboard PDF
  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
          },
          {
            type: 'text',
            text: `This is a whiteboard from a one-on-one physics/math tutoring session.
Summarize what was covered in 2-5 sentences, written as session notes (past tense, specific topics and key ideas).
Then list 3-8 concise topic tags.

Respond with valid JSON only, in this exact shape:
{"summary": "...", "tags": ["...", "..."]}`,
          },
        ],
      }],
    }),
  })

  if (!claudeRes.ok) {
    const err = await claudeRes.text()
    console.error('Claude error:', err)
    return json({ error: 'AI generation failed', detail: err }, 502)
  }

  const claudeData = await claudeRes.json()
  const rawText = claudeData.content?.[0]?.text ?? ''

  let parsed: { summary: string; tags: string[] }
  try {
    // Strip markdown code fences if Claude wrapped the JSON
    const jsonStr = rawText.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
    parsed = JSON.parse(jsonStr)
  } catch {
    return json({ error: 'could not parse AI response', raw: rawText }, 502)
  }

  return json({ summary: parsed.summary, tags: parsed.tags })
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
