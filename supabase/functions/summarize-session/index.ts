import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const MIRO_ACCESS_TOKEN = Deno.env.get('MIRO_ACCESS_TOKEN')!

// Fetches board text content from Miro and returns it for AI analysis.
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
  if (!session.miro_board_id && !session.miro_pdf_url) return json({ error: 'no whiteboard for this session' }, 400)

  // If a high-res snapshot was already uploaded (e.g. from the Miro panel's
  // "Snapshot for AI" button), use it directly — it's the best content.
  if (session.miro_pdf_url) return json({ pictureUrl: session.miro_pdf_url })

  // Otherwise pull what we can from the live board. A physics whiteboard is
  // mostly handwriting/diagrams, which only the board *picture* captures — the
  // text-items API just returns typed widgets (often only the calculator's
  // placeholder). So the picture is the primary content; any meaningful typed
  // text is returned alongside it as supplementary context.
  const out: { pictureUrl?: string; boardText?: string } = {}

  try {
    out.pictureUrl = await getMiroBoardPicture(session.miro_board_id)
  } catch (e) {
    console.error('picture:', e.message)
  }

  try {
    out.boardText = await getMiroBoardText(session.miro_board_id)
  } catch (e) {
    if (!e.message.includes('No text content')) console.error('text:', e.message)
  }

  if (!out.pictureUrl && !out.boardText) {
    return json({ error: 'No readable content on this board (no picture or text).' }, 502)
  }
  return json(out)
})

// encodeURIComponent encodes '=' as '%3D', which Miro's router doesn't handle — keep '=' literal.
function encodeMiroBoardId(boardId: string): string {
  return encodeURIComponent(boardId).replace(/%3D/gi, '=')
}

async function getMiroBoardPicture(boardId: string): Promise<string> {
  const encodedId = encodeMiroBoardId(boardId)
  const res = await fetch(`https://api.miro.com/v2/boards/${encodedId}`, {
    headers: { 'Authorization': `Bearer ${MIRO_ACCESS_TOKEN}` },
  })
  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Miro board fetch failed: HTTP ${res.status} — ${errBody}`)
  }
  const board = await res.json() as { picture?: { imageURL?: string }; [key: string]: unknown }
  const url = board.picture?.imageURL
  if (!url) throw new Error(`No picture available for this Miro board. Board keys: ${Object.keys(board).join(', ')}; picture: ${JSON.stringify(board.picture)}`)
  return url
}

async function getMiroBoardText(boardId: string): Promise<string> {
  const encodedId = encodeMiroBoardId(boardId)
  const texts: string[] = []
  let cursor: string | undefined

  do {
    const url = new URL(`https://api.miro.com/v2/boards/${encodedId}/items`)
    url.searchParams.set('limit', '50')
    if (cursor) url.searchParams.set('cursor', cursor)

    const res = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${MIRO_ACCESS_TOKEN}` },
    })
    if (!res.ok) {
      const errBody = await res.text()
      throw new Error(`Miro board items fetch failed: HTTP ${res.status} — ${errBody}`)
    }
    const data = await res.json() as { data: { data?: { content?: string; title?: string } }[]; cursor?: string }

    for (const item of data.data ?? []) {
      const raw = item.data?.content ?? item.data?.title ?? ''
      if (raw) {
        const text = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        if (text) texts.push(text)
      }
    }

    cursor = data.cursor
  } while (cursor)

  if (!texts.length) throw new Error('No text content found on Miro board')
  return texts.join('\n')
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
