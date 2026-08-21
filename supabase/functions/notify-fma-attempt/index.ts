import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SB_PUBLISHABLE_KEY')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

const MARK_EMAIL = 'mark.d.eichenlaub@gmail.com'
const PORTAL_URL = 'https://portal.eichenlaubphysics.com/'
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

// Chunked so a multi-megabyte phone photo doesn't blow the argument limit the
// way String.fromCharCode(...wholeArray) would.
function toBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function fmtSeconds(s: number | undefined): string {
  if (s == null) return '—'
  const total = Math.round(s)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))
}

// Keeps the attachment name from breaking mail clients on / \ : and friends.
function safeFilename(s: string): string {
  return s.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim()
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
    .select('*, handouts:exam_id(id, name, year)')
    .eq('id', attempt_id)
    .eq('student_id', student.id)
    .maybeSingle()
  if (!attempt) return json({ error: 'attempt not found' }, 404)

  // Only completed attempts are worth reporting; an in_progress row means the
  // caller got here without going through one of the submit RPCs.
  if (attempt.status === 'in_progress') {
    return json({ ok: true, skipped: 'attempt still in progress' })
  }

  const examName = attempt.handouts?.name || attempt.exam_id
  const isScoreOnly = attempt.mode === 'score_only'

  // ── Per-question results ───────────────────────────────────────────────────
  // Iterate over the exam's questions, not the answer rows: a question the
  // student never touched has no fma_attempt_answers row at all, and those
  // blanks are exactly the ones worth seeing.
  type Row = { num: number; picked: string | null; key: string | null; correct: boolean; secs?: number }
  let rows: Row[] = []
  let outOf = 25

  if (!isScoreOnly) {
    const { data: questions } = await admin
      .from('fma_questions')
      .select('id, question_num, correct_choice')
      .eq('exam_id', attempt.exam_id)
      .order('question_num')

    const { data: answers } = await admin
      .from('fma_attempt_answers')
      .select('question_id, selected_choice, is_correct')
      .eq('attempt_id', attempt_id)
    const answerBy = new Map((answers || []).map(a => [a.question_id, a]))

    // Per-question time only exists in live mode: every event ('view' on
    // navigation, 'answer' on a click) marks that question as on screen from
    // that instant until the next event elsewhere. paper_first enters answers
    // in bulk, so there is no meaningful per-question time to report.
    const secondsBy = new Map<string, number>()
    if (attempt.mode === 'live') {
      const { data: events } = await admin
        .from('fma_answer_events')
        .select('question_id, clicked_at')
        .eq('attempt_id', attempt_id)
        .order('clicked_at')
      const endedAt = attempt.submitted_at ? new Date(attempt.submitted_at).getTime() : null
      ;(events || []).forEach((ev, i) => {
        const nextEv = (events || [])[i + 1]
        const next = nextEv ? new Date(nextEv.clicked_at).getTime() : endedAt
        if (!next) return
        const span = (next - new Date(ev.clicked_at).getTime()) / 1000
        if (span <= 0) return
        secondsBy.set(ev.question_id, (secondsBy.get(ev.question_id) || 0) + span)
      })
    }

    rows = (questions || []).map(q => {
      const a = answerBy.get(q.id)
      return {
        num: q.question_num,
        picked: a?.selected_choice ?? null,
        key: q.correct_choice ?? null,
        correct: !!a?.is_correct,
        secs: secondsBy.get(q.id),
      }
    })
    if (rows.length) outOf = rows.length
  }

  const showTime = attempt.mode === 'live'
  const score = attempt.score
  const resultsUrl = `${PORTAL_URL}?view=fma&student=${encodeURIComponent(student.id)}&attempt=${encodeURIComponent(attempt_id)}`

  const totalSecs = attempt.submitted_at && attempt.started_at
    ? (new Date(attempt.submitted_at).getTime() - new Date(attempt.started_at).getTime()) / 1000
    : null

  // ── Scratch work attachment ────────────────────────────────────────────────
  // scratch_work_url holds an object path in the private fma-scratch-work
  // bucket (older rows may hold a full public URL from before it was locked
  // down), so download with the service key rather than linking.
  const attachments: Array<{ filename: string; content: string }> = []
  let scratchTooLarge = false
  if (attempt.scratch_work_url) {
    const marker = '/fma-scratch-work/'
    const path = attempt.scratch_work_url.includes(marker)
      ? attempt.scratch_work_url.slice(attempt.scratch_work_url.indexOf(marker) + marker.length)
      : attempt.scratch_work_url
    try {
      const { data: blob, error } = await admin.storage.from('fma-scratch-work').download(path)
      if (error) throw error
      // Resend caps a message at 40MB and base64 inflates by a third. Dropping an
      // oversized photo costs the attachment; sending it would cost the whole email.
      if (blob.size > MAX_ATTACHMENT_BYTES) {
        console.warn('scratch work too large to attach:', path, blob.size)
        scratchTooLarge = true
      } else {
        const ext = path.split('.').pop() || 'bin'
        attachments.push({
          filename: safeFilename(`${student.name} - ${examName} scratch work.${ext}`),
          content: toBase64(new Uint8Array(await blob.arrayBuffer())),
        })
      }
    } catch (e) {
      console.warn('scratch work download failed:', path, e)
    }
  }

  // ── Email ─────────────────────────────────────────────────────────────────
  const th = 'padding:6px 10px;border:1px solid #ddd;background:#f4f4f4;text-align:left;font-weight:600'
  const td = 'padding:6px 10px;border:1px solid #ddd'

  const tableHtml = rows.length ? `
    <table style="border-collapse:collapse;font-size:13px;margin-top:16px">
      <thead><tr>
        <th style="${th}">Q</th>
        <th style="${th}">Answered</th>
        <th style="${th}">Key</th>
        <th style="${th}">Result</th>
        ${showTime ? `<th style="${th}">Time</th>` : ''}
      </tr></thead>
      <tbody>
        ${rows.map(r => `<tr>
          <td style="${td}">${r.num}</td>
          <td style="${td}">${r.picked ? esc(r.picked) : '<span style="color:#999">blank</span>'}</td>
          <td style="${td}">${esc(r.key)}</td>
          <td style="${td};color:${r.correct ? '#1a7f37' : '#b3261e'};font-weight:600">${r.correct ? 'right' : 'wrong'}</td>
          ${showTime ? `<td style="${td}">${esc(fmtSeconds(r.secs))}</td>` : ''}
        </tr>`).join('')}
      </tbody>
    </table>` : ''

  const modeLabel = { live: 'timed on-screen', paper_first: 'paper first', score_only: 'score only' }[attempt.mode as string] || attempt.mode

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#222">
      <p style="font-size:15px;margin:0 0 4px"><strong>${esc(student.name)}</strong> finished <strong>${esc(examName)}</strong>.</p>
      <p style="font-size:22px;font-weight:700;margin:12px 0 4px">${score != null ? `${esc(score)} / ${outOf}` : '—'}</p>
      <p style="font-size:13px;color:#666;margin:0 0 16px">
        ${esc(modeLabel)}${totalSecs != null ? ` · ${esc(fmtSeconds(totalSecs))} total` : ''}
        ${attachments.length ? ' · scratch work attached' : ''}${scratchTooLarge ? ' · scratch work too large to attach — see the portal' : ''}
      </p>
      <p style="margin:0 0 4px"><a href="${esc(resultsUrl)}" style="font-size:14px">Open ${esc(student.name)}'s results in the portal →</a></p>
      ${!isScoreOnly && !showTime ? '<p style="font-size:12px;color:#888;margin:12px 0 0">Per-question times aren\'t recorded for paper-first attempts.</p>' : ''}
      ${tableHtml}
    </div>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
      to: [MARK_EMAIL],
      subject: `${student.name} finished ${examName} — ${score != null ? `${score}/${outOf}` : 'submitted'}`,
      html,
      ...(attachments.length ? { attachments } : {}),
    }),
  }).catch(e => { console.error('email failed:', e); return null })

  if (res && !res.ok) console.error('resend error:', res.status, await res.text())

  return json({ ok: true })
})
