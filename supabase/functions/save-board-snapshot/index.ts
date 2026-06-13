import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!  // new secret API key (RLS-bypass)
const BUCKET = 'session-pdfs'

// Receives a board snapshot from the Miro panel (which exports the whole board to
// an image client-side — the only way to capture handwriting, since the Miro REST
// API exposes no board picture) and stores it as the session's content. The local
// ai-server's auto-summarize loop later turns it into a summary + tags.
//
// Deployed --no-verify-jwt: the panel runs in Mark's browser with no Supabase
// session, so it can't send a JWT. A snapshot can only ever be attached to an
// existing session for a known board id, so there is nothing sensitive to leak.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const { boardId, imageBase64, imageType } = await req.json().catch(() => ({}))
  if (!boardId || !imageBase64) return json({ error: 'boardId and imageBase64 required' }, 400)

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {})

  // Attach the snapshot to the in-progress (or most recently started) session on
  // this board — the one being tutored now. Excluding not-yet-started sessions
  // keeps a snapshot off a future recurring session that reuses the same board.
  const { data: sessions, error: selErr } = await supabase
    .from('sessions')
    .select('id')
    .eq('miro_board_id', boardId)
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: false })
    .limit(1)
  if (selErr) return json({ error: selErr.message }, 500)
  if (!sessions?.length) return json({ error: 'no session found for this board' }, 404)
  const sessionId = sessions[0].id

  let bytes: Uint8Array
  try {
    bytes = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0))
  } catch {
    return json({ error: 'imageBase64 is not valid base64' }, 400)
  }

  const ext = (imageType || '').includes('jpeg') || (imageType || '').includes('jpg') ? 'jpg' : 'png'
  const path = `${sessionId}.${ext}`
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: imageType || 'image/png', upsert: true })
  if (upErr) return json({ error: `storage upload failed: ${upErr.message}` }, 500)

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)

  // Only point the session at the latest snapshot — never touch `summary`. The
  // auto-loop summarizes any finished session whose summary is still empty (so a
  // fresh session fills in, and "clear the summary to regenerate" still works),
  // while a summary Mark has written or edited is preserved.
  const { error: updErr } = await supabase
    .from('sessions')
    .update({ miro_pdf_url: pub.publicUrl })
    .eq('id', sessionId)
  if (updErr) return json({ error: updErr.message }, 500)

  return json({ sessionId, imageUrl: pub.publicUrl })
})

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
