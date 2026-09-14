/**
 * The single email Mark gets when a student finishes an F=ma practice exam:
 * the score, the per-question table with topics and times, the scan of their
 * work, and the read on the sitting -- what the student has learned, what we
 * worked on that landed this time, what still needs work, what the wrong
 * answers have in common, and, for every miss, what the question asked, what
 * they picked, and what would lead a student to pick it.
 *
 * The notify-fma-attempt edge function used to mail the score and the table by
 * itself the instant a student submitted, with this following a few minutes
 * later. Two emails about one sitting was one too many, so that one is now a
 * silent submit hook and everything arrives here, a few minutes later than the
 * old score mail but in one place.
 *
 * It runs here rather than in the edge function for two reasons. The analysis
 * goes through Mark's Claude subscription via `claude -p` (never API credits),
 * which needs a shell. And it reads the student's whole history -- earlier
 * attempts, graded homework reviews, session summaries and verbatim session
 * transcripts -- which is far more than the submit path has in hand.
 *
 * Because nothing else mails Mark now, a claude call that keeps failing would
 * mean silence about a finished exam. So an attempt that is still unreported
 * FALLBACK_AFTER_HOURS after it was submitted gets the table on its own, marked
 * as such (email_kind = 'table_only'); `--attempt <id>` re-runs it for the full
 * read once whatever broke is fixed.
 *
 * Run via `node scripts/fma-narrative-agent.mjs`, fired by a Windows Scheduled
 * Task every ~20 minutes (scripts/setup-fma-narrative-task.ps1). Each pass is a
 * fresh process, same self-healing rationale as grade-submission-agent.mjs.
 *
 *   --dry-run           show what it would analyze, call nothing
 *   --attempt <id>      re-analyze one attempt even if it already has a narrative
 *   --resend            rebuild and re-send the email from the stored narrative
 *   --no-email          write the narrative, skip the email
 */
import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile, writeFile, unlink, mkdir, appendFile } from 'fs/promises'
import { resolve, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir, hostname } from 'os'
import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'

const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const DRY_RUN = process.argv.includes('--dry-run')
const RESEND = process.argv.includes('--resend')
const NO_EMAIL = process.argv.includes('--no-email')
const ONLY_ATTEMPT = (() => {
  const i = process.argv.indexOf('--attempt')
  return i !== -1 ? process.argv[i + 1] : ''
})()

const envText = await readFile(resolve(ROOT, '.env'), 'utf8')
const env = Object.fromEntries(
  envText.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`
const SERVICE_KEY = env.VITE_SUPABASE_SERVICE_KEY
const MARK_EMAIL = 'mark.d.eichenlaub@gmail.com'
const PORTAL_URL = 'https://portal.eichenlaubphysics.com/'
const MAX_PER_PASS = 5
// A 90-minute session transcript runs ~15k words. Three of them plus the exam
// text still fits comfortably; ten would crowd out the questions themselves.
const MAX_TRANSCRIPTS = 3
const MAX_SESSIONS = 12
const MAX_PRIOR_ATTEMPTS = 8
// How long an attempt may sit unreported while claude keeps failing before the
// table goes out without a narrative. Long enough to ride out a transient
// failure across several 20-minute passes, short enough that Mark still hears
// about a morning exam the same morning.
const FALLBACK_AFTER_HOURS = 3
// Resend caps a message at 40MB and base64 inflates by a third. Dropping an
// oversized photo costs the attachment; sending it would cost the whole email.
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024

if (!SERVICE_KEY) { console.error('ERROR: VITE_SUPABASE_SERVICE_KEY not found in .env'); process.exit(1) }

const LOG_FILE = resolve(ROOT, 'logs', 'fma-narrative-agent.log')
async function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`
  console.log(stamped)
  await mkdir(dirname(LOG_FILE), { recursive: true }).catch(() => {})
  await appendFile(LOG_FILE, stamped + '\n').catch(() => {})
}

process.on('unhandledRejection', (reason) => log(`[guard] unhandled rejection: ${reason?.stack || reason}`))
process.on('uncaughtException', (err) => log(`[guard] uncaught exception: ${err?.stack || err}`))

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmtSeconds(s) {
  if (s == null) return '—'
  const total = Math.round(s)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function esc(s) {
  return String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
}

// Turns the model's plain-text paragraphs into HTML without letting any markup
// in the text through.
function paras(text) {
  return String(text || '').split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
    .map(p => `<p style="margin:0 0 10px 0">${esc(p).replace(/\n/g, '<br>')}</p>`).join('')
}

// ── Gathering the attempt ───────────────────────────────────────────────────

// Per-question seconds, computed exactly the way notify-fma-attempt does, so
// the narrative and the score email never disagree about the same sitting.
async function perQuestionSeconds(attempt) {
  const byQuestion = new Map()
  if (attempt.mode !== 'live') return byQuestion
  const { data: events } = await supabase
    .from('fma_answer_events')
    .select('question_id, clicked_at, active_seconds')
    .eq('attempt_id', attempt.id)
    .order('clicked_at')
  const evs = events || []
  const stamped = evs.some(ev => ev.active_seconds != null)
  const endedAt = attempt.submitted_at ? new Date(attempt.submitted_at).getTime() : null
  const posOf = ev => (stamped ? ev.active_seconds : new Date(ev.clicked_at).getTime() / 1000)
  const finalPos = stamped ? attempt.active_seconds : endedAt && endedAt / 1000
  evs.forEach((ev, i) => {
    const from = posOf(ev)
    const to = evs[i + 1] ? posOf(evs[i + 1]) : finalPos
    if (from == null || to == null) return
    const span = to - from
    if (span > 0) byQuestion.set(ev.question_id, (byQuestion.get(ev.question_id) || 0) + span)
  })
  return byQuestion
}

async function loadAttemptDetail(attempt) {
  const { data: questions } = await supabase
    .from('fma_questions')
    .select('id, question_num, statement, choices, correct_choice, tags, figure_urls')
    .eq('exam_id', attempt.exam_id)
    .order('question_num')

  const { data: answers } = await supabase
    .from('fma_attempt_answers')
    .select('question_id, selected_choice, is_correct')
    .eq('attempt_id', attempt.id)
  const answerBy = new Map((answers || []).map(a => [a.question_id, a]))
  const secondsBy = await perQuestionSeconds(attempt)

  return (questions || []).map(q => {
    const a = answerBy.get(q.id)
    return {
      num: q.question_num,
      statement: q.statement,
      choices: q.choices || {},
      key: q.correct_choice,
      picked: a?.selected_choice ?? null,
      correct: !!a?.is_correct,
      secs: secondsBy.get(q.id) ?? null,
      // `tags` carries the real per-question topics; the `topics` column is a
      // single coarse bucket ('Mechanics') on every F=ma question.
      topics: q.tags || [],
      figures: (q.figure_urls || []).length,
    }
  })
}

// ── Gathering the history ───────────────────────────────────────────────────

async function loadHistory(studentId, currentAttempt) {
  const { data: priorRaw } = await supabase
    .from('fma_attempts')
    .select('id, exam_id, mode, status, score, submitted_at, started_at, active_seconds, scratch_work_url')
    .eq('student_id', studentId)
    .neq('id', currentAttempt.id)
    .in('status', ['submitted', 'graded'])
    .order('submitted_at', { ascending: false })
    .limit(MAX_PRIOR_ATTEMPTS)

  // For each earlier attempt, which topics went right and which went wrong --
  // that per-topic history is what makes "she fixed rotation" sayable at all.
  const prior = []
  for (const p of priorRaw || []) {
    const { data: qs } = await supabase
      .from('fma_questions').select('id, question_num, tags').eq('exam_id', p.exam_id)
    const { data: as } = await supabase
      .from('fma_attempt_answers').select('question_id, selected_choice, is_correct').eq('attempt_id', p.id)
    const ansBy = new Map((as || []).map(a => [a.question_id, a]))
    prior.push({
      exam_id: p.exam_id,
      submitted_at: p.submitted_at,
      score: p.score,
      mode: p.mode,
      work_uploaded: Boolean(p.scratch_work_url),
      questions: (qs || []).map(q => {
        const a = ansBy.get(q.id)
        return {
          num: q.question_num,
          topics: q.tags || [],
          picked: a?.selected_choice ?? null,
          correct: !!a?.is_correct,
        }
      }).sort((x, y) => x.num - y.num),
    })
  }

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, scheduled_at, summary, notes, tags')
    .eq('student_id', studentId)
    .lte('scheduled_at', new Date().toISOString())
    .not('summary', 'is', null)
    .order('scheduled_at', { ascending: false })
    .limit(MAX_SESSIONS)

  const { data: transcripts } = await supabase
    .from('session_transcripts')
    .select('session_id, title, started_at, duration_seconds, wispr_summary, transcript')
    .eq('student_id', studentId)
    .order('started_at', { ascending: false })
    .limit(MAX_TRANSCRIPTS)

  // Graded homework: the AI review rows carry the per-question verdicts, which
  // are a far better record of what the student actually gets wrong than the
  // bare completed/assigned status on the assignment.
  const { data: assignments } = await supabase
    .from('assignments')
    .select('id, problem_id, status, notes, assigned_date, submission_at, completed_date')
    .eq('student_id', studentId)
    .order('completed_date', { ascending: false, nullsFirst: false })
    .limit(30)

  const ids = (assignments || []).map(a => a.id)
  let reviews = []
  if (ids.length) {
    const { data } = await supabase
      .from('assignment_reviews')
      .select('assignment_id, ai_summary, question_breakdown, issues, score_correct, score_total, source_label, graded_at')
      .in('assignment_id', ids)
    reviews = data || []
  }
  const reviewBy = new Map(reviews.map(r => [r.assignment_id, r]))

  return {
    prior,
    sessions: sessions || [],
    transcripts: transcripts || [],
    homework: (assignments || []).map(a => ({
      problem_id: a.problem_id,
      status: a.status,
      note: a.notes || '',
      completed_date: a.completed_date,
      review: reviewBy.get(a.id) || null,
    })),
  }
}

// ── The claude -p call ──────────────────────────────────────────────────────

const NARRATIVE_SCHEMA = JSON.stringify({
  type: 'object',
  properties: {
    headline: { type: 'string' },
    learned: { type: 'string' },
    improved: { type: 'string' },
    needs_work: { type: 'string' },
    wrong_answer_trend: { type: 'string' },
    what_helped: { type: 'string' },
    misses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question_num: { type: 'integer' },
          topics: { type: 'array', items: { type: 'string' } },
          what_it_asks: { type: 'string' },
          their_answer: { type: 'string' },
          correct_answer: { type: 'string' },
          likely_reasoning: { type: 'string' },
          verdict: { type: 'string', enum: ['misconception', 'careless', 'guess', 'blank', 'unclear'] },
        },
        required: ['question_num', 'topics', 'what_it_asks', 'their_answer',
                   'correct_answer', 'likely_reasoning', 'verdict'],
      },
    },
  },
  required: ['headline', 'learned', 'improved', 'needs_work',
             'wrong_answer_trend', 'what_helped', 'misses'],
})

function buildPrompt({ studentName, examName, attempt, rows, attemptPath, historyPath, workUploaded, scratchFile }) {
  const missed = rows.filter(r => !r.correct)
  const lines = [
    "You are helping a physics tutor (Mark) read a student's finished F=ma",
    'practice exam. The write-up is for Mark only -- the student never sees it,',
    'so be blunt. Mark reads it in an email, away from the exam paper, so every',
    'claim has to stand on its own.',
    '',
    `Student: ${studentName}`,
    `Exam: ${examName} (${attempt.mode} mode)`,
    `Score: ${attempt.score ?? '?'} / ${rows.length}`,
    attempt.submitted_at ? `Submitted: ${attempt.submitted_at.slice(0, 10)}` : '',
    attempt.active_seconds ? `Working time: ${fmtSeconds(attempt.active_seconds)} (limit 75:00)` : '',
    `Missed or blank: ${missed.length ? missed.map(r => r.num).join(', ') : 'none'}`,
    '',
    'THE EXAM AND THIS ATTEMPT',
    'Every question, with its full statement, the five choices, the key, what',
    `${studentName} picked, and how long they spent on it, is JSON at:`,
    `  ${attemptPath}`,
    'Read that file first.',
    '',
    "THE STUDENT'S HISTORY",
    'Earlier F=ma attempts (per-question, with topic tags), past tutoring session',
    'summaries and tags, verbatim session transcripts, and graded homework',
    'reviews are JSON at:',
    `  ${historyPath}`,
    'Read that too. The session summaries and transcripts are what let you say',
    'which things were actually taught and when; the earlier attempts are what',
    'let you say whether something improved. Do not claim a topic was "worked',
    'on" unless you can point to a session or a homework review that covers it.',
    '',
  ]

  if (workUploaded && scratchFile) {
    lines.push(
      'SCRATCH WORK',
      `${studentName} uploaded a scan of the work: ${scratchFile}`,
      'Read it. For each missed question, base likely_reasoning on what is',
      'actually on the paper, and say what you can see.',
      '',
    )
  } else {
    lines.push(
      'SCRATCH WORK',
      `${studentName} uploaded NO scratch work for this attempt, so there is no`,
      'paper to read. For each missed question you must INFER what process would',
      'lead a student to that specific wrong choice: work out what the chosen',
      'distractor corresponds to (a dropped factor, the wrong axis, energy instead',
      'of momentum, sin for cos, forgetting a rotational term, and so on). Say',
      'plainly that this is inferred from the distractor, not read off their work.',
      'Do not invent details about what they wrote down.',
      '',
    )
  }

  lines.push(
    'WHAT TO WRITE',
    '',
    'headline: one or two sentences. The single most useful thing for Mark to',
    'know about this sitting.',
    '',
    'learned: what this exam shows the student has actually got hold of. Cite',
    'question numbers and topics. Where a session or homework covered it, say so.',
    '',
    'improved: things that were a problem before -- in an earlier attempt, in a',
    'homework review, or flagged in a session -- that went right this time. Name',
    'the earlier evidence and the question here that shows the change. If there',
    'is no such evidence, say so in one sentence instead of manufacturing it.',
    '',
    'needs_work: what to go after next, most important first. Be specific about',
    'the rule or habit, not the chapter.',
    '',
    'wrong_answer_trend: what the misses have in common. Look at topic overlap,',
    'at which distractor was chosen (do they consistently pick the answer that',
    'drops a factor? the one that ignores rotation?), at time spent (fast wrong',
    'answers are a different problem from slow wrong answers), and at where the',
    'misses sit in the exam. Say plainly if there is no pattern.',
    '',
    'what_helped: what this exam says about what is working in the teaching --',
    'which sessions, handouts or drills show up in the right answers. Be',
    'concrete, and say if the evidence is thin.',
    '',
    'misses: one entry per question the student got wrong or left blank.',
    '  - question_num: the number on the exam.',
    "  - topics: that question's topic tags.",
    '  - what_it_asks: one or two sentences on what the problem is about, with',
    '    enough physical detail that Mark pictures it without opening the exam.',
    '  - their_answer: the letter AND what that choice actually says, e.g.',
    '    "(C) 2mg". Never a bare letter. "blank" if unanswered.',
    '  - correct_answer: same form.',
    '  - likely_reasoning: what most likely produced that answer. If there is',
    '    scratch work, say what the paper shows. If not, name the specific wrong',
    '    move the distractor corresponds to, and mark it as inferred.',
    '  - verdict: "misconception" (a real physics error), "careless" (a slip in',
    '    algebra, arithmetic, a sign, or a misread), "guess" (no discernible',
    '    reasoning; very short time on the question), "blank" (never answered),',
    '    or "unclear".',
    '',
    'Write plain American English in short paragraphs. No bullet lists inside the',
    'prose fields, no headings, no markdown. If the evidence does not support a',
    'claim, say what you do not know rather than filling the space.',
  )
  return lines.filter(Boolean).join('\n')
}

async function runClaude(prompt) {
  const schema = NARRATIVE_SCHEMA.replace(/'/g, "''")
  const p = prompt.replace(/'/g, "''")
  const isWin = process.platform === 'win32'
  const base = `claude -p --allowedTools Read,Grep --output-format json --json-schema '${schema}' '${p}'`
  const cmd = isWin ? `'' | ${base}` : `${base} < /dev/null`
  // Launched from inside a Claude Code session, the parent injects
  // ANTHROPIC_API_KEY and the child bills API credits instead of the
  // subscription -- and then dies on "Credit balance is too low". Strip it.
  const childEnv = { ...process.env }
  delete childEnv.ANTHROPIC_API_KEY
  delete childEnv.CLAUDECODE

  const { stdout } = await execAsync(cmd, {
    shell: isWin ? 'pwsh.exe' : undefined,
    timeout: 900000,
    cwd: ROOT,
    env: childEnv,
    maxBuffer: 10 * 1024 * 1024,
  })
  let envelope
  try { envelope = JSON.parse(stdout.trim()) }
  catch { throw new Error(`Could not parse claude output: ${stdout.slice(0, 300)}`) }
  const result = envelope.structured_output || envelope
  if (typeof result.headline !== 'string' || !Array.isArray(result.misses)) {
    throw new Error(`No structured output from claude (is_error=${envelope.is_error}): ${stdout.slice(0, 300)}`)
  }
  return result
}

// ── The email ───────────────────────────────────────────────────────────────

const VERDICT_STYLE = {
  misconception: { bg: '#fbd7d4', label: 'misunderstanding' },
  careless:      { bg: '#ffe3c9', label: 'slip' },
  guess:         { bg: '#e7e0f5', label: 'guess' },
  blank:         { bg: '#fff3c4', label: 'blank' },
  unclear:       { bg: '#fff3c4', label: 'unclear' },
}

const TD = 'padding:6px 8px;border:1px solid #d8d8d8;vertical-align:top'

// `result` is null on a table_only fallback send -- everything narrative drops
// out and Mark still gets the score, the table and the scan.
function narrativeEmailHtml({ studentName, examName, attempt, rows, result, workUploaded, resultsUrl, scratchNote, claudeError }) {
  const showTime = attempt.mode === 'live'
  const table = rows.map(r => `<tr${r.correct ? '' : ' style="background:#fdecea"'}>
    <td style="${TD}">${r.num}</td>
    <td style="${TD}">${r.picked ? esc(r.picked) : '<span style="color:#999">blank</span>'}</td>
    <td style="${TD}">${esc(r.key)}</td>
    <td style="${TD};color:${r.correct ? '#1a7f37' : '#b3261e'};font-weight:600">${r.correct ? 'right' : 'wrong'}</td>
    ${showTime ? `<td style="${TD}">${esc(fmtSeconds(r.secs))}</td>` : ''}
    <td style="${TD};color:#555">${r.topics.length ? esc(r.topics.join(', ')) : '—'}</td>
  </tr>`).join('')

  const missBlocks = ((result && result.misses) || []).map(m => {
    const s = VERDICT_STYLE[m.verdict] || VERDICT_STYLE.unclear
    const tags = (m.topics || []).length
      ? ` <span style="color:#666;font-size:12px">${esc((m.topics || []).join(', '))}</span>` : ''
    return `<div style="margin:0 0 14px 0;padding:8px 10px;border-left:5px solid ${s.bg};background:#fafafa">
      <div><strong>Q${esc(m.question_num)}</strong>${tags} — ${esc(m.what_it_asks)}</div>
      <div style="color:#555;margin:3px 0">Answered ${esc(m.their_answer)}; correct answer ${esc(m.correct_answer)} (${s.label}).</div>
      <div>${esc(m.likely_reasoning)}</div>
    </div>`
  }).join('\n')

  const section = (title, body) => body
    ? `<h3 style="margin:20px 0 6px 0;font-size:15px">${title}</h3>${paras(body)}` : ''

  const noWork = workUploaded ? '' : `<p style="font-size:13px;margin:0 0 16px;padding:8px 10px;border-left:4px solid #9a6700;background:#fff8e1;color:#7a4f01">
    <strong>No scratch work uploaded.</strong> There's no scan for this attempt, so the read on
    each wrong answer below is inferred from which choice was picked, not from anything
    ${esc(studentName)} wrote down.
  </p>`

  // No narrative: say why, so a bare table never looks like the whole story.
  const noRead = result ? '' : `<p style="font-size:13px;margin:0 0 16px;padding:8px 10px;border-left:4px solid #b3261e;background:#fdecea;color:#7a1c14">
    <strong>No analysis on this one.</strong> The write-up kept failing, so this is the table by
    itself${claudeError ? ` (${esc(String(claudeError).slice(0, 200))})` : ''}. Re-run it with
    <code>node scripts/fma-narrative-agent.mjs --attempt ${esc(attempt.id)}</code>.
  </p>`

  const narrative = result ? `
  ${paras(result.headline)}

  ${section('What she has learned', result.learned)}
  ${section('Worked on before, landed this time', result.improved)}
  ${section('Needs work', result.needs_work)}
  ${section('Pattern in the wrong answers', result.wrong_answer_trend)}
  ${section('What helped', result.what_helped)}

  <h3 style="margin:24px 0 8px 0;font-size:15px">Each miss</h3>
  ${missBlocks || '<p style="margin:0 0 10px 0">Nothing missed.</p>'}
` : ''

  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:14px;color:#222;max-width:760px">
  <p style="margin:0 0 4px 0"><strong>${esc(studentName)}</strong> — ${esc(examName)}</p>
  <p style="font-size:22px;font-weight:700;margin:8px 0 4px">${attempt.score ?? '—'} / ${rows.length}</p>
  <p style="font-size:13px;color:#666;margin:0 0 12px">
    ${esc(attempt.mode)}${attempt.active_seconds ? ` · ${esc(fmtSeconds(attempt.active_seconds))} working time` : ''}${workUploaded ? '' : ' · no work uploaded'}${scratchNote ? ` · ${esc(scratchNote)}` : ''}
  </p>
  <p style="margin:0 0 14px 0"><a href="${esc(resultsUrl)}">Open in the portal →</a></p>

  ${noWork}
  ${noRead}
  ${narrative}

  <h3 style="margin:24px 0 8px 0;font-size:15px">Every question</h3>
  <table style="border-collapse:collapse;font-size:13px;width:100%">
    <thead><tr style="background:#efefef">
      <th style="${TD};text-align:left">Q</th>
      <th style="${TD};text-align:left">Answered</th>
      <th style="${TD};text-align:left">Key</th>
      <th style="${TD};text-align:left">Result</th>
      ${showTime ? `<th style="${TD};text-align:left">Time</th>` : ''}
      <th style="${TD};text-align:left">Topics</th>
    </tr></thead>
    <tbody>${table}</tbody>
  </table>
</div>`
}

async function notifyMark(subject, body, attachments = []) {
  if (DRY_RUN || NO_EMAIL) { await log(`[skip-email] would email Mark: ${subject}`); return }
  try {
    const res = await fetch(`${FUNCTIONS_URL}/send-email`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: MARK_EMAIL, subject, body, ...(attachments.length ? { attachments } : {}) }),
    })
    const text = await res.text()
    if (!res.ok || /"error"/.test(text)) await log(`[notify-mark] send-email HTTP ${res.status}: ${text.slice(0, 400)}`)
  } catch (e) {
    await log(`[notify-mark] send-email call failed: ${e.message}`)
  }
}

// ── Scratch work ────────────────────────────────────────────────────────────

// scratch_work_url holds an object path in the private fma-scratch-work bucket
// (older rows may hold a full public URL from before it was locked down), so
// pull it with the service key rather than fetching the URL.
// Returns { path, bytes, tooLarge } -- `path` is a temp file claude reads, and
// the same bytes ride along as the email attachment so Mark sees the scan
// without opening the portal.
async function downloadScratch(scratchWorkUrl) {
  if (!scratchWorkUrl) return null
  const marker = '/fma-scratch-work/'
  const path = scratchWorkUrl.includes(marker)
    ? scratchWorkUrl.slice(scratchWorkUrl.indexOf(marker) + marker.length)
    : scratchWorkUrl
  try {
    const { data: blob, error } = await supabase.storage.from('fma-scratch-work').download(path)
    if (error) throw error
    const ext = extname(path) || '.jpg'
    const out = resolve(tmpdir(), `trajectory-fma-scratch-${randomUUID()}${ext}`)
    const bytes = Buffer.from(await blob.arrayBuffer())
    await writeFile(out, bytes)
    return { path: out, bytes, ext, tooLarge: bytes.length > MAX_ATTACHMENT_BYTES }
  } catch (e) {
    await log(`[scratch] download failed for ${path}: ${e.message}`)
    return null
  }
}

// Keeps the attachment name from breaking mail clients on / \ : and friends.
function safeFilename(s) {
  return s.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim()
}

// ── Main pass ───────────────────────────────────────────────────────────────

async function run() {
  await log(DRY_RUN ? '=== fma-narrative-agent dry run ===' : '=== fma-narrative-agent pass ===')

  let pending
  if (ONLY_ATTEMPT) {
    const { data, error } = await supabase
      .from('fma_attempts').select('*').eq('id', ONLY_ATTEMPT)
    if (error) throw new Error(error.message)
    pending = data || []
    if (!pending.length) { await log(`No attempt ${ONLY_ATTEMPT}.`); return }
  } else {
    // score_only attempts are a bare number with no per-question data -- there
    // is nothing here to narrate.
    const { data: candidates, error } = await supabase
      .from('fma_attempts')
      .select('*')
      .in('status', ['submitted', 'graded'])
      .neq('mode', 'score_only')
      .order('submitted_at', { ascending: false })
      .limit(MAX_PER_PASS * 4)
    if (error) throw new Error(error.message)

    // A row with generated_at set is a report that already went out. A row with
    // only claimed_at is another machine (or a dead pass) mid-flight -- leave it
    // in the pool and let claim_fma_narrative decide whether we get it.
    const { data: done } = await supabase
      .from('fma_attempt_narratives').select('attempt_id').not('generated_at', 'is', null)
    const doneIds = new Set((done || []).map(r => r.attempt_id))
    pending = (candidates || []).filter(a => !doneIds.has(a.id)).slice(0, MAX_PER_PASS)
    if (!pending.length) { await log('No attempts awaiting a narrative.'); return }
  }
  await log(`Found ${pending.length} attempt(s) to analyze.`)

  const { data: students } = await supabase.from('students').select('id, name')
  const nameOf = id => (students || []).find(s => s.id === id)?.name || id

  for (const attempt of pending) {
    const tmpFiles = []
    try {
      const { data: exam } = await supabase
        .from('handouts').select('id, name').eq('id', attempt.exam_id).maybeSingle()
      const examName = exam?.name || attempt.exam_id
      const studentName = nameOf(attempt.student_id)
      await log(`${attempt.id}: ${studentName} — ${examName}`)

      const rows = await loadAttemptDetail(attempt)
      const workUploaded = Boolean(attempt.scratch_work_url)

      // The scan is wanted either way: claude reads it, and it rides along as
      // the email attachment.
      const scratch = workUploaded ? await downloadScratch(attempt.scratch_work_url) : null
      if (scratch) tmpFiles.push(scratch.path)
      const attachments = (scratch && !scratch.tooLarge)
        ? [{
            filename: safeFilename(`${studentName} - ${examName} scratch work${scratch.ext}`),
            content: scratch.bytes.toString('base64'),
          }]
        : []
      const scratchNote = attachments.length ? 'scratch work attached'
        : scratch?.tooLarge ? 'scratch work too large to attach — see the portal' : ''

      let result = null
      let sources = null
      let claudeError = null
      if (RESEND) {
        const { data: stored } = await supabase
          .from('fma_attempt_narratives').select('*').eq('attempt_id', attempt.id).maybeSingle()
        if (!stored) { await log(`${attempt.id}: no stored narrative to resend, skipping`); continue }
        result = stored.headline ? stored : null
        claudeError = stored.claude_error
      } else {
        const history = await loadHistory(attempt.student_id, attempt)

        const attemptPath = resolve(tmpdir(), `trajectory-fma-attempt-${randomUUID()}.json`)
        const historyPath = resolve(tmpdir(), `trajectory-fma-history-${randomUUID()}.json`)
        await writeFile(attemptPath, JSON.stringify({
          student: studentName, exam: examName, mode: attempt.mode,
          score: attempt.score, out_of: rows.length,
          working_seconds: attempt.active_seconds, questions: rows,
        }, null, 2))
        await writeFile(historyPath, JSON.stringify(history, null, 2))
        tmpFiles.push(attemptPath, historyPath)

        sources = {
          prior_attempts: history.prior.length,
          sessions: history.sessions.length,
          transcripts: history.transcripts.length,
          assignments: history.homework.length,
          homework_reviews: history.homework.filter(h => h.review).length,
        }

        if (DRY_RUN) {
          await log(`[dry-run] ${attempt.id}: ${rows.length} questions, ` +
            `${rows.filter(r => !r.correct).length} missed, ${JSON.stringify(sources)}, ` +
            `work_uploaded=${workUploaded}`)
          continue
        }

        // Claim it before the minutes-long claude call, so a second machine
        // running the same task can't analyze and email the same attempt. This
        // sits below the dry-run guard on purpose: a dry run inspects, it
        // doesn't take work.
        const { data: gotClaim, error: claimErr } = await supabase.rpc('claim_fma_narrative', {
          p_attempt_id: attempt.id,
          p_student_id: attempt.student_id,
          p_exam_id: attempt.exam_id,
          p_claimed_by: hostname(),
        })
        if (claimErr) throw new Error(`claim failed: ${claimErr.message}`)
        if (!gotClaim && !ONLY_ATTEMPT) {
          await log(`${attempt.id}: already claimed by another pass, skipping.`)
          continue
        }

        try {
          result = await runClaude(buildPrompt({
            studentName, examName, attempt, rows,
            attemptPath, historyPath, workUploaded, scratchFile: scratch?.path,
          }))
        } catch (e) {
          claudeError = e.message
          // Nothing else emails Mark now, so a persistently failing write-up
          // must not turn into silence. Give it a few passes, then send the
          // table by itself. Before that window is up, leave the attempt
          // unreported so the next pass can try again.
          const submittedAt = attempt.submitted_at ? new Date(attempt.submitted_at).getTime() : Date.now()
          const hoursWaiting = (Date.now() - submittedAt) / 3600000
          if (!ONLY_ATTEMPT && hoursWaiting < FALLBACK_AFTER_HOURS) {
            // Drop the claim so the next pass picks it straight back up rather
            // than waiting out the stale window.
            await supabase.from('fma_attempt_narratives')
              .update({ claimed_at: null, claude_error: e.message })
              .eq('attempt_id', attempt.id).is('generated_at', null)
            await log(`${attempt.id}: claude failed (${e.message}); ${hoursWaiting.toFixed(1)}h in, retrying next pass.`)
            continue
          }
          await log(`${attempt.id}: claude failed (${e.message}); sending the table without a read.`)
        }

        const { error: upsertErr } = await supabase.from('fma_attempt_narratives').upsert({
          attempt_id: attempt.id,
          student_id: attempt.student_id,
          exam_id: attempt.exam_id,
          headline: result?.headline ?? null,
          learned: result?.learned ?? null,
          improved: result?.improved ?? null,
          needs_work: result?.needs_work ?? null,
          wrong_answer_trend: result?.wrong_answer_trend ?? null,
          what_helped: result?.what_helped ?? null,
          misses: result?.misses ?? [],
          work_uploaded: workUploaded,
          sources,
          email_kind: result ? 'full' : 'table_only',
          claude_error: claudeError,
          claimed_by: hostname(),
          model: 'claude -p (subscription)',
          generated_at: new Date().toISOString(),
        }, { onConflict: 'attempt_id' })
        if (upsertErr) throw new Error(upsertErr.message)
      }

      const resultsUrl = `${PORTAL_URL}?view=fma&student=${encodeURIComponent(attempt.student_id)}&attempt=${encodeURIComponent(attempt.id)}`
      await notifyMark(
        `${studentName} finished ${examName} — ${attempt.score ?? '?'}/${rows.length}${workUploaded ? '' : ' (no work uploaded)'}`,
        narrativeEmailHtml({
          studentName, examName, attempt, rows, result,
          workUploaded, resultsUrl, scratchNote, claudeError,
        }),
        attachments,
      )
      await log(`${attempt.id}: sent (${result ? 'full' : 'table only'}).`)
    } catch (e) {
      await log(`${attempt.id}: FAILED — ${e.message}`)
    } finally {
      for (const f of tmpFiles) await unlink(f).catch(() => {})
    }
  }
}

await run().catch(e => log(`FATAL: ${e.stack || e.message}`))
