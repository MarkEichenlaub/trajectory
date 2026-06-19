import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
// Either a dedicated launcher token or the existing cron secret authorizes a read.
const LAUNCHER_TOKEN = Deno.env.get('LAUNCHER_TOKEN') || ''
const CRON_SECRET = Deno.env.get('CRON_SECRET') || ''

// Deployed --no-verify-jwt: this function authenticates itself via X-Launcher-Token,
// so the gateway must not require a JWT. See memory edge-function-verify-jwt.
Deno.serve(async (req) => {
  const token = req.headers.get('X-Launcher-Token') || ''
  const ok = token && ((LAUNCHER_TOKEN && token === LAUNCHER_TOKEN) || (CRON_SECRET && token === CRON_SECRET))
  if (!ok) {
    return new Response('forbidden', { status: 401, headers: { 'Content-Type': 'text/plain' } })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const now = new Date()
  const max = new Date(now.getTime() + 12 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('sessions')
    .select('id, scheduled_at, students(name)')
    .gt('scheduled_at', now.toISOString())
    .lte('scheduled_at', max.toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) {
    return new Response('error: ' + error.message, { status: 500, headers: { 'Content-Type': 'text/plain' } })
  }

  // Fetch on-deck problems for these sessions
  const sessionIds = (data ?? []).map((s: Record<string, unknown>) => s.id as string)
  const onDeckMap: Record<string, string[]> = {}
  if (sessionIds.length > 0) {
    const { data: spData } = await supabase
      .from('session_problems')
      .select('session_id, problem_name')
      .in('session_id', sessionIds)
    for (const row of (spData ?? [])) {
      const sid = row.session_id as string
      if (!onDeckMap[sid]) onDeckMap[sid] = []
      onDeckMap[sid].push(row.problem_name as string)
    }
  }

  // Plain text, one session per line: <startISO>\t<studentName>\t<sessionId>\t<prob1|prob2>
  // (plain text so the AHK client needs no JSON parser; 4th field is empty when no on-deck problems)
  const lines = (data ?? []).map((s: Record<string, unknown>) => {
    const name = (s.students as { name?: string } | null)?.name || (s.id as string)
    const onDeck = (onDeckMap[s.id as string] || []).join('|')
    return `${s.scheduled_at}\t${name}\t${s.id}\t${onDeck}`
  })

  return new Response(lines.join('\n'), { status: 200, headers: { 'Content-Type': 'text/plain' } })
})
