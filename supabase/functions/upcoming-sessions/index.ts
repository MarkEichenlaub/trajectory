import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
// Either a dedicated launcher token or the existing cron secret authorizes a read.
const LAUNCHER_TOKEN = Deno.env.get('LAUNCHER_TOKEN') || ''
const CRON_SECRET = Deno.env.get('CRON_SECRET') || ''
const PORTAL = 'https://portal.eichenlaubphysics.com'

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
    .select('id, scheduled_at, miro_board_url, student_id, students(name)')
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

  // Open assignments per student, resolved to something linkable. Only handouts,
  // books and exams live in the database; competition problems come from a JSON
  // catalog the browser loads, so they can't be resolved here and are named
  // without a link rather than dropped.
  const studentIds = [...new Set((data ?? []).map(s => s.student_id as string).filter(Boolean))]
  const linksByStudent: Record<string, string[]> = {}
  if (studentIds.length > 0) {
    const { data: assignments } = await supabase
      .from('assignments')
      .select('student_id, problem_id, status')
      .in('student_id', studentIds)
      .neq('status', 'completed')

    const problemIds = [...new Set((assignments ?? []).map(a => a.problem_id as string))]
    const { data: handouts } = await supabase
      .from('handouts').select('id, name, pdf_url').in('id', problemIds)
    const handoutById: Record<string, { name: string; pdf_url: string | null }> = {}
    for (const h of handouts ?? []) handoutById[h.id as string] = h as never

    // A digitized exam is sat in the portal, so point there rather than at a PDF
    // the student can't answer on.
    const { data: fmaRows } = await supabase.from('fma_questions').select('exam_id').in('exam_id', problemIds)
    const takeable = new Set((fmaRows ?? []).map(r => r.exam_id as string))

    for (const a of assignments ?? []) {
      const sid = a.student_id as string
      const pid = a.problem_id as string
      const h = handoutById[pid]
      if (!linksByStudent[sid]) linksByStudent[sid] = []
      if (takeable.has(pid)) {
        linksByStudent[sid].push(`${h?.name || pid} - ${PORTAL}/fma-progress`)
      } else if (h?.pdf_url) {
        linksByStudent[sid].push(`${h.name} - ${h.pdf_url}`)
      } else if (h) {
        linksByStudent[sid].push(h.name)
      }
    }
  }

  // Plain text, one session per line (so the AHK client needs no JSON parser):
  //   <startISO>\t<studentName>\t<sessionId>\t<prob1|prob2>\t<miroUrl>\t<name - url|name - url>
  // Fields 4-6 may be empty. Fields were appended, never reordered, so an older
  // client that only reads the first three keeps working.
  const lines = (data ?? []).map((s: Record<string, unknown>) => {
    const name = (s.students as { name?: string } | null)?.name || (s.id as string)
    const onDeck = (onDeckMap[s.id as string] || []).join('|')
    const miro = (s.miro_board_url as string) || ''
    const links = (linksByStudent[s.student_id as string] || []).join('|')
    return `${s.scheduled_at}\t${name}\t${s.id}\t${onDeck}\t${miro}\t${links}`
  })

  return new Response(lines.join('\n'), { status: 200, headers: { 'Content-Type': 'text/plain' } })
})
