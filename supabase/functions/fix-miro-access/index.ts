import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const MIRO_ACCESS_TOKEN = Deno.env.get('MIRO_ACCESS_TOKEN')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok')

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const now = new Date().toISOString()
  const { data: sessions, error } = await admin
    .from('sessions')
    .select('id, miro_board_id, scheduled_at')
    .gte('scheduled_at', now)
    .neq('miro_board_id', '')
    .not('miro_board_id', 'is', null)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  const results = []
  for (const session of sessions ?? []) {
    const res = await fetch(
      `https://api.miro.com/v2/boards/${encodeURIComponent(session.miro_board_id)}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${MIRO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ sharingPolicy: { access: 'edit' } }),
      }
    )
    const body = await res.json()
    results.push({
      session_id: session.id,
      scheduled_at: session.scheduled_at,
      board_id: session.miro_board_id,
      ok: res.ok,
      access: body.sharingPolicy?.access ?? body.message,
    })
  }

  return new Response(JSON.stringify({ fixed: results.length, results }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  })
})
