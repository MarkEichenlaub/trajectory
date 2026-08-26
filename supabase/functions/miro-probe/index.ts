// TEMPORARY diagnostic. Read-only: reports the real sharing policy Miro has
// stored for the boards attached to upcoming sessions. Delete once the
// sharing-policy fix is verified.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const MIRO_ACCESS_TOKEN = Deno.env.get('MIRO_ACCESS_TOKEN')!
const PROBE_TOKEN = Deno.env.get('MIRO_PROBE_TOKEN') || ''

Deno.serve(async (req) => {
  if ((req.headers.get('X-Probe-Token') || '') !== PROBE_TOKEN || !PROBE_TOKEN) {
    return new Response('forbidden', { status: 401 })
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const { data: sessions } = await admin
    .from('sessions')
    .select('id, student_id, scheduled_at, miro_board_id')
    .gte('scheduled_at', new Date().toISOString())
    .not('miro_board_id', 'is', null)
    .neq('miro_board_id', '')
    .order('scheduled_at')

  // student -> access -> count
  const census: Record<string, Record<string, number>> = {}
  const notEdit: Array<{ session: string; access: string }> = []
  for (const s of sessions ?? []) {
    const res = await fetch(
      `https://api.miro.com/v2/boards/${encodeURIComponent(s.miro_board_id)}`,
      { headers: { 'Authorization': `Bearer ${MIRO_ACCESS_TOKEN}`, 'Accept': 'application/json' } },
    )
    const body = await res.json()
    const access = res.ok ? (body?.policy?.sharingPolicy?.access ?? 'unknown') : `http_${res.status}`
    census[s.student_id] ??= {}
    census[s.student_id][access] = (census[s.student_id][access] ?? 0) + 1
    if (access !== 'edit') notEdit.push({ session: s.id, access })
  }

  return new Response(
    JSON.stringify({ total: sessions?.length ?? 0, census, locked_out: notEdit.length, notEdit }, null, 2),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
