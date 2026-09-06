/**
 * AI first-pass review of a submitted homework assignment — a summary, a
 * per-question breakdown, and flagged issues to work on. Uses Mark's Claude
 * subscription (not API credits), same as scripts/ai-server.mjs.
 *
 * This only covers non-F=ma submissions. F=ma practice exams already grade
 * themselves the moment a student submits on screen (submit_fma_attempt /
 * submit_fma_score_only RPCs) and never touch assignment_submissions — so
 * requiring at least one assignment_submissions row is what naturally keeps
 * F=ma out of this script's candidate pool, no special-casing needed.
 *
 * Run via `node scripts/grade-submission-agent.mjs --once` — this is how it
 * runs in production: a Windows Scheduled Task fires it every ~20 minutes
 * (see scripts/setup-grade-submission-task.ps1). Each pass is a fresh,
 * independent process, same self-healing rationale as ai-server.mjs and
 * hw-email-agent.mjs.
 *
 * `--dry-run` logs what it *would* grade (resolved problem, solution
 * availability, submission files) without calling claude, writing to
 * Supabase, or sending email. `--assignment <id>` re-grades one submission
 * even though it already has a review, for when the review needs redoing.
 */
import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile, writeFile, unlink, mkdir, appendFile } from 'fs/promises'
import { resolve, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'

const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')
// --assignment <id> re-grades one specific submission, review or no review;
// add --resend to rebuild and re-send the email from the stored review
// instead of grading again.
const ONLY_ASSIGNMENT = (() => {
  const i = process.argv.indexOf('--assignment')
  return i !== -1 ? process.argv[i + 1] : ''
})()
const RESEND = process.argv.includes('--resend')

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
const GITHUB_OWNER = 'MarkEichenlaub'
const GITHUB_REPO = 'trajectory'
const GITHUB_BRANCH = 'main'
const MAX_CANDIDATES_PER_PASS = 15

if (!SERVICE_KEY) { console.error('ERROR: VITE_SUPABASE_SERVICE_KEY not found in .env'); process.exit(1) }

const LOG_FILE = resolve(ROOT, 'logs', 'grade-submission-agent.log')
async function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`
  console.log(stamped)
  await mkdir(dirname(LOG_FILE), { recursive: true }).catch(() => {})
  await appendFile(LOG_FILE, stamped + '\n').catch(() => {})
}

// A bad submission must never take down the whole pass (same rationale as
// ai-server.mjs / hw-email-agent.mjs's guards).
process.on('unhandledRejection', (reason) => log(`[guard] unhandled rejection: ${reason?.stack || reason}`))
process.on('uncaughtException', (err) => log(`[guard] uncaught exception: ${err?.stack || err}`))

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

// ── Problem resolution ──────────────────────────────────────────────────────
// A single-item version of src/utils/problemBank.js#assembleProblemBank() —
// no need to import the browser module for just one lookup.

function rawGithubUrl(path) {
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`
}

async function fetchGithubJSON(path) {
  const res = await fetch(rawGithubUrl(path))
  if (!res.ok) throw new Error(`GitHub fetch ${path} failed: ${res.status}`)
  return res.json()
}

async function findInAopsFiles(problemId) {
  const index = await fetchGithubJSON('data/aops-index.json').catch(() => ({ files: [] }))
  for (const f of index.files || []) {
    const list = await fetchGithubJSON(`data/${f}`).catch(() => [])
    const hit = list.find(p => p.id === problemId)
    if (hit) return hit
  }
  return null
}

// Returns { name, desc, topics, tags, problemUrl, solutionUrl } or null.
async function resolveProblem(problemId) {
  const { data: handout } = await supabase
    .from('handouts').select('*').eq('id', problemId).maybeSingle()
  if (handout) {
    return {
      name: handout.name,
      desc: handout.description || '',
      topics: handout.topics || [],
      tags: handout.tags || [],
      problemUrl: handout.pdf_url || '',
      solutionUrl: handout.solution_url || '',
    }
  }

  const problems = await fetchGithubJSON('data/problems.json').catch(() => [])
  const contestHit = problems.find(p => p.id === problemId)
  if (contestHit) {
    return {
      name: contestHit.name || problemId,
      desc: contestHit.desc || '',
      topics: contestHit.topics || [],
      tags: contestHit.tags || [],
      problemUrl: contestHit.problemUrl || '',
      solutionUrl: contestHit.solutionUrl || '',
    }
  }

  const aopsHit = await findInAopsFiles(problemId)
  if (aopsHit) {
    return {
      name: aopsHit.name || aopsHit.lesson || problemId,
      desc: aopsHit.desc || '',
      topics: aopsHit.topics || [],
      tags: aopsHit.tags || [],
      problemUrl: aopsHit.problemUrl || '',
      solutionUrl: aopsHit.solutionUrl || '',
    }
  }

  return null
}

// Text-based answer key for AoPS/contest problems (withheld from students,
// see supabase/migrations/20260827120000_problem_solutions.sql) — used when
// there's no downloadable solution PDF.
async function resolveTextSolution(problemId) {
  const { data } = await supabase
    .from('problem_solutions').select('answer, solution').eq('problem_id', problemId).maybeSingle()
  if (!data) return ''
  return [data.answer && `Answer: ${data.answer}`, data.solution].filter(Boolean).join('\n\n')
}

// ── File download ───────────────────────────────────────────────────────────

const DOWNLOADABLE_EXT = new Set(['.pdf', '.jpg', '.jpeg', '.png'])

// Downloads a URL to a temp file if it looks like a directly-fetchable
// image/PDF. Returns the temp path, or null if the URL is missing / not a
// recognized file type / the fetch fails.
async function downloadToTemp(url, label) {
  if (!url) return null
  const ext = extname(new URL(url).pathname).toLowerCase()
  if (!DOWNLOADABLE_EXT.has(ext)) return null
  try {
    const res = await fetch(url)
    if (!res.ok) { await log(`[download] ${label}: HTTP ${res.status} for ${url}`); return null }
    const bytes = Buffer.from(await res.arrayBuffer())
    const path = resolve(tmpdir(), `trajectory-grade-${randomUUID()}${ext}`)
    await writeFile(path, bytes)
    return path
  } catch (e) {
    await log(`[download] ${label}: fetch failed for ${url}: ${e.message}`)
    return null
  }
}

// ── PDF text extraction ─────────────────────────────────────────────────────
// A source "handout" is often a whole book (Blue Morin is 353 pages). Reading
// that PDF page by page to find the assigned chapter burns the whole budget
// before any grading happens, so extract a page-indexed text version up front
// and let the model grep it for the chapter, then read only those PDF pages.

async function extractPageIndexedText(pdfPath) {
  const out = pdfPath.replace(/\.pdf$/i, '.txt')
  try {
    await execAsync(`pdftotext -layout "${pdfPath}" "${out}"`, { timeout: 180000 })
  } catch (e) {
    await log(`[pdftotext] failed for ${pdfPath}: ${e.message}`)
    return null
  }
  let text
  try { text = await readFile(out, 'utf8') } catch { return null }
  // pdftotext separates pages with a form feed; turn those into greppable
  // markers so the model can report a real PDF page number back to Mark.
  const pages = text.split('\f')
  const marked = pages
    .map((p, i) => `=== PDF page ${i + 1} ===\n${p.replace(/\s+$/, '')}`)
    .join('\n')
  await writeFile(out, marked)
  return { path: out, pageCount: pages.length }
}

// ── claude -p grading call ──────────────────────────────────────────────────

const GRADE_SCHEMA = JSON.stringify({
  type: 'object',
  properties: {
    source_label: { type: 'string' },
    source_page: { type: 'integer' },
    score_correct: { type: 'integer' },
    score_total: { type: 'integer' },
    summary: { type: 'string' },
    breakdown: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          prompt: { type: 'string' },
          student_answer: { type: 'string' },
          correct_answer: { type: 'string' },
          status: { type: 'string', enum: ['correct', 'misconception', 'careless', 'unclear'] },
          note: { type: 'string' },
          detail: { type: 'string' },
        },
        required: ['question', 'prompt', 'student_answer', 'correct_answer', 'status', 'note', 'detail'],
      },
    },
    issues: { type: 'array', items: { type: 'string' } },
  },
  required: ['source_label', 'score_correct', 'score_total', 'summary', 'breakdown', 'issues'],
})

async function gradeSubmission({
  studentName, problemName, problemDesc, assignmentNote, assignedDate, submittedDate,
  problemFile, problemText, solutionFile, solutionText, submissionFiles,
}) {
  const hasKey = Boolean(solutionFile || solutionText)
  const lines = [
    'You are helping a physics tutor (Mark) do a first-pass review of a',
    "student's submitted homework. The review is for Mark only — the student",
    'never sees it. Mark reads it in an email, away from the book and away from',
    "the student's paper, so everything you write has to stand on its own.",
    '',
    `Student: ${studentName}`,
    `Source material: ${problemName}`,
    problemDesc ? `About the source: ${problemDesc}` : '',
    assignmentNote
      ? `What Mark assigned: "${assignmentNote}"`
      : 'Mark left no note about what was assigned; work it out from what the student turned in.',
    assignedDate ? `Assigned ${assignedDate}${submittedDate ? `, submitted ${submittedDate}` : ''}` : '',
    '',
    `The student's work is at: ${submissionFiles.join(', ')}`,
    'Read all of it first, and work out which problems it covers.',
    '',
  ]

  if (problemText) {
    lines.push(
      `The source material is a ${problemText.pageCount}-page PDF at: ${problemFile}`,
      `A plain-text version with page markers is at: ${problemText.path}`,
      'Grep that text file to find the assigned section fast (do NOT read the',
      'whole PDF). Marker lines look like "=== PDF page 231 ===" and the number',
      'is the PDF page number — report the first page of the assigned material',
      'as source_page. Then Read just those pages of the PDF itself when you need',
      'the figures.',
      '',
    )
  } else if (problemFile) {
    lines.push(`Read the problem statement at: ${problemFile}`, '')
  }

  if (hasKey) {
    lines.push(
      'An answer key is available:',
      solutionFile ? `Read the solution at: ${solutionFile}` : '',
      solutionText ? `Solution text:\n${solutionText}` : '',
      '',
    )
  } else {
    lines.push(
      'No separate answer key was supplied. You still have to produce the correct',
      'answer for every question. Books like Morin print their own solutions right',
      'after the problems — find them in the source material and use them. If the',
      'book has no solution, work the problem yourself. Only write "not determined"',
      'for correct_answer as a last resort, and say why in the note.',
      '',
    )
  }

  lines.push(
    'Produce one breakdown row for every question in the assigned set — including',
    'ones the student left blank or skipped. Fields:',
    '',
    '- question: the number as the book writes it, e.g. "8.4".',
    '- prompt: one sentence saying what the question actually asks, with enough',
    '  detail that Mark understands it without opening the book. Name the objects',
    '  and the quantity asked for. For multiple choice, if an option letter',
    '  matters, say what that option is, never just the letter.',
    '- student_answer: what the student put down, spelled out (e.g. "(c) 3/2 mR^2 w",',
    '  "blank", "unreadable"). Not a bare letter.',
    '- correct_answer: the right answer, spelled out the same way.',
    '- status: exactly one of',
    '    "correct"       — right answer;',
    '    "misconception" — wrong because of a real physics or math misunderstanding;',
    '    "careless"      — wrong for a trivial reason: arithmetic, algebra, a sign,',
    '                      a misread of the question, a dropped factor;',
    '    "unclear"       — blank, missing, illegible, or you cannot tell what they',
    '                      answered.',
    '- note: at most about ten words, the kind of thing Mark would jot in a',
    '  gradebook: "dropped a factor of 2", "used force instead of torque",',
    '  "no work shown, letter only".',
    '- detail: two to five sentences that stand alone — what the question asks,',
    '  what the student did, and exactly where it went right or wrong. Do not',
    '  refer to "option (c)" or "the second case" without saying what it is.',
    '',
    'score_correct is the number of "correct" rows; score_total is the number of',
    'rows. An "unclear" row never counts as correct.',
    '',
    'source_label: a short description of what was assigned, with the book\'s own',
    'page numbers if you can see them, e.g. "Chapter 8 multiple choice, pp. 231-236".',
    '',
    'summary: 2-5 sentences telling Mark what to work on with this student in the',
    'next session, based on what actually went wrong here. Be specific — name the',
    'rule, the confusion, or the habit, and point at the problems where it showed',
    'up. If the work was clean, say that instead of inventing something.',
    '',
    'issues: a short list of specific concepts or skills to drill (empty if none).',
  )

  const prompt = lines.filter(Boolean).join('\n')
  const schema = GRADE_SCHEMA.replace(/'/g, "''")
  const p = prompt.replace(/'/g, "''")
  const isWin = process.platform === 'win32'
  const base = `claude -p --allowedTools Read,Grep --output-format json --json-schema '${schema}' '${p}'`
  const cmd = isWin ? `'' | ${base}` : `${base} < /dev/null`

  const { stdout } = await execAsync(cmd, {
    // Grading now means grepping a book-sized text file, reading a few PDF
    // pages and the student's scan — give it real headroom.
    shell: isWin ? 'pwsh.exe' : undefined,
    timeout: 900000,
    cwd: ROOT,
    maxBuffer: 10 * 1024 * 1024,
  })

  let envelope
  try {
    envelope = JSON.parse(stdout.trim())
  } catch {
    throw new Error(`Could not parse claude output: ${stdout.slice(0, 200)}`)
  }
  const result = envelope.structured_output || envelope
  if (typeof result.summary !== 'string' || !Array.isArray(result.breakdown) || !Array.isArray(result.issues)) {
    throw new Error(`No structured output from claude (is_error=${envelope.is_error}): ${stdout.slice(0, 200)}`)
  }
  return result
}

// ── The review email ────────────────────────────────────────────────────────

// Row colour by what kind of mistake it is: green right, orange a slip, red a
// real misunderstanding, yellow missing or unreadable.
const STATUS_STYLE = {
  correct:       { bg: '#e3f4e6', mark: '✓', label: 'correct' },
  careless:      { bg: '#ffe3c9', mark: '✗', label: 'slip' },
  misconception: { bg: '#fbd7d4', mark: '✗', label: 'misunderstanding' },
  unclear:       { bg: '#fff3c4', mark: '?', label: 'unclear' },
}

function esc(s) {
  return String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
}

const TD = 'padding:6px 8px;border:1px solid #d8d8d8'

function reviewEmailHtml({ studentName, problemName, result, assignmentNote, assignmentUrl, submissionLinks }) {
  const page = Number.isFinite(result.source_page) ? result.source_page : null
  // #page= is honored by every PDF viewer worth the name, so the link lands on
  // the assigned chapter instead of page 1 of a 353-page book.
  const assignmentHref = assignmentUrl ? (page ? `${assignmentUrl}#page=${page}` : assignmentUrl) : ''
  const breakdown = result.breakdown || []

  const rows = breakdown.map(b => {
    const s = STATUS_STYLE[b.status] || STATUS_STYLE.unclear
    return `<tr style="background:${s.bg}">` +
      `<td style="${TD};white-space:nowrap"><strong>${esc(b.question)}</strong></td>` +
      `<td style="${TD};text-align:center">${s.mark}</td>` +
      `<td style="${TD}">${esc(b.student_answer)}</td>` +
      `<td style="${TD}">${esc(b.correct_answer)}</td>` +
      `<td style="${TD}">${esc(b.note)}</td>` +
      `</tr>`
  }).join('\n')

  const details = breakdown.map(b => {
    const s = STATUS_STYLE[b.status] || STATUS_STYLE.unclear
    return `<div style="margin:0 0 14px 0;padding:8px 10px;border-left:5px solid ${s.bg};background:#fafafa">
      <div><strong>${esc(b.question)}</strong> — ${esc(b.prompt)}</div>
      <div style="color:#555;margin:2px 0">Answered ${esc(b.student_answer)}; correct answer ${esc(b.correct_answer)} (${s.label}).</div>
      <div>${esc(b.detail)}</div>
    </div>`
  }).join('\n')

  const links = [
    ...submissionLinks.map(l => `<a href="${esc(l.url)}">${esc(l.label)}</a>`),
    assignmentHref
      ? `<a href="${esc(assignmentHref)}">${esc(result.source_label || problemName)}${page ? ` (PDF page ${page})` : ''}</a>`
      : '',
    `<a href="${PORTAL_URL}">Portal</a>`,
  ].filter(Boolean).join(' &nbsp;·&nbsp; ')

  const total = Number.isFinite(result.score_total) ? result.score_total : breakdown.length
  const correct = Number.isFinite(result.score_correct) ? result.score_correct : '?'

  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:14px;color:#222;max-width:760px">
  <p style="margin:0 0 4px 0"><strong>${esc(studentName)}</strong> — ${esc(problemName)}</p>
  <p style="margin:0 0 4px 0;color:#555">Assigned: ${assignmentNote ? esc(`"${assignmentNote}"`) : '(no note)'}${result.source_label ? ` — ${esc(result.source_label)}` : ''}</p>
  <p style="margin:0 0 14px 0">${links}</p>

  <p style="font-size:22px;margin:0 0 10px 0"><strong>${correct} / ${total}</strong></p>

  <table style="border-collapse:collapse;width:100%;font-size:13px">
    <tr style="background:#efefef">
      <th style="${TD};text-align:left">#</th>
      <th style="${TD}">✓</th>
      <th style="${TD};text-align:left">Answered</th>
      <th style="${TD};text-align:left">Correct</th>
      <th style="${TD};text-align:left">Note</th>
    </tr>
    ${rows}
  </table>
  <p style="font-size:11px;color:#777;margin:6px 0 18px 0">
    Green: correct. Orange: a slip (algebra, arithmetic, misread). Red: a real misunderstanding. Yellow: missing, or can't tell what they answered.
  </p>

  <h3 style="margin:0 0 6px 0">Next session</h3>
  <p style="margin:0 0 8px 0">${esc(result.summary)}</p>
  ${(result.issues || []).length ? `<ul style="margin:0 0 18px 0">${result.issues.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}

  <h3 style="margin:0 0 8px 0">Question by question</h3>
  ${details}
</div>`
}

// ── Notify Mark ──────────────────────────────────────────────────────────────

// `body` may be plain text or HTML — send-email sniffs for markup and picks
// text/html accordingly.
async function notifyMark(subject, body) {
  if (DRY_RUN) { await log(`[dry-run] would email Mark: ${subject}`); return }
  try {
    const res = await fetch(`${FUNCTIONS_URL}/send-email`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: MARK_EMAIL, subject, body }),
    })
    const text = await res.text()
    // A silently-dropped review email is worse than a noisy one: log whatever
    // Resend said, not just transport failures.
    if (!res.ok || /"error"/.test(text)) await log(`[notify-mark] send-email HTTP ${res.status}: ${text.slice(0, 400)}`)
  } catch (e) {
    await log(`[notify-mark] send-email call failed: ${e.message}`)
  }
}

// Rebuilds a grade result from a stored review row (for --resend).
async function loadReview(assignmentId) {
  const { data } = await supabase
    .from('assignment_reviews')
    .select('ai_summary, question_breakdown, issues, score_correct, score_total, source_page, source_label')
    .eq('assignment_id', assignmentId).maybeSingle()
  if (!data) return null
  return {
    summary: data.ai_summary || '',
    breakdown: data.question_breakdown || [],
    issues: data.issues || [],
    score_correct: data.score_correct,
    score_total: data.score_total,
    source_page: data.source_page,
    source_label: data.source_label || '',
  }
}

// ── Main pass ────────────────────────────────────────────────────────────────

async function run() {
  await log(DRY_RUN ? '=== grade-submission-agent dry run ===' : '=== grade-submission-agent pass ===')

  const SELECT = 'id, student_id, problem_id, notes, assigned_date, submission_at, submission_bundle_url, assignment_submissions!inner(file_url, file_name)'

  let pending
  if (ONLY_ASSIGNMENT) {
    // --assignment <id> re-grades one submission that already has a review,
    // for when the review itself (not the work) needs redoing.
    const { data, error } = await supabase.from('assignments').select(SELECT).eq('id', ONLY_ASSIGNMENT)
    if (error) throw new Error(error.message)
    pending = data || []
    if (pending.length === 0) { await log(`No assignment ${ONLY_ASSIGNMENT} with a submission.`); return }
  } else {
    // Candidates: completed assignments with at least one real file submission
    // (excludes F=ma, which completes via a different RPC path and never
    // writes assignment_submissions) and no review yet.
    const { data: candidates, error: candErr } = await supabase
      .from('assignments')
      .select(SELECT)
      .eq('status', 'completed')
      .order('submission_at', { ascending: false })
      .limit(MAX_CANDIDATES_PER_PASS * 3)
    if (candErr) throw new Error(candErr.message)

    const { data: reviewed, error: revErr } = await supabase.from('assignment_reviews').select('assignment_id')
    if (revErr) throw new Error(revErr.message)
    const reviewedIds = new Set((reviewed || []).map(r => r.assignment_id))

    pending = (candidates || []).filter(a => !reviewedIds.has(a.id)).slice(0, MAX_CANDIDATES_PER_PASS)
    if (pending.length === 0) { await log('No ungraded submissions.'); return }
  }
  await log(`Found ${pending.length} submission(s) to grade.`)

  const { data: students } = await supabase.from('students').select('id, name')
  const studentName = id => (students || []).find(s => s.id === id)?.name || id

  for (const a of pending) {
    const tmpFiles = []
    try {
      const problem = await resolveProblem(a.problem_id)
      const problemName = problem?.name || a.problem_id
      const student = studentName(a.student_id)
      await log(`${a.id}: grading "${problemName}" for ${student}`)

      // Re-sending an existing review needs none of the source files.
      const stored = RESEND ? await loadReview(a.id) : null
      if (RESEND && !stored) { await log(`${a.id}: no stored review to resend, skipping`); continue }

      const problemFile = (!RESEND && problem?.problemUrl) ? await downloadToTemp(problem.problemUrl, 'problem') : null
      const solutionFile = (!RESEND && problem?.solutionUrl) ? await downloadToTemp(problem.solutionUrl, 'solution') : null
      const solutionText = (RESEND || solutionFile) ? '' : await resolveTextSolution(a.problem_id)
      if (problemFile) tmpFiles.push(problemFile)
      if (solutionFile) tmpFiles.push(solutionFile)

      const problemText = problemFile ? await extractPageIndexedText(problemFile) : null
      if (problemText) tmpFiles.push(problemText.path)

      const submissionUrls = a.submission_bundle_url
        ? [{ url: a.submission_bundle_url, file_name: 'bundle.pdf' }]
        : a.assignment_submissions.map(s => ({ url: s.file_url, file_name: s.file_name }))
      const submissionFiles = []
      if (!RESEND) {
        for (const s of submissionUrls) {
          const path = await downloadToTemp(s.url, `submission (${s.file_name || s.url})`)
          if (path) { submissionFiles.push(path); tmpFiles.push(path) }
          else await log(`${a.id}: could not download submission file ${s.file_name || s.url}`)
        }
        if (submissionFiles.length === 0) { await log(`${a.id}: no downloadable submission files, skipping`); continue }
      }

      if (DRY_RUN) {
        await log(`[dry-run] ${a.id}: problem=${Boolean(problemFile)} pages=${problemText?.pageCount ?? '-'} solution=${Boolean(solutionFile || solutionText)} submissionFiles=${submissionFiles.length}`)
        continue
      }

      const result = stored || await gradeSubmission({
        studentName: student,
        problemName,
        problemDesc: problem?.desc || '',
        assignmentNote: a.notes || '',
        assignedDate: a.assigned_date || '',
        submittedDate: a.submission_at ? a.submission_at.slice(0, 10) : '',
        problemFile,
        problemText,
        solutionFile,
        solutionText,
        submissionFiles,
      })

      const { error: upsertErr } = stored ? {} : await supabase.from('assignment_reviews').upsert({
        assignment_id: a.id,
        ai_summary: result.summary,
        question_breakdown: result.breakdown,
        issues: result.issues,
        score_correct: Number.isFinite(result.score_correct) ? result.score_correct : null,
        score_total: Number.isFinite(result.score_total) ? result.score_total : null,
        source_page: Number.isFinite(result.source_page) ? result.source_page : null,
        source_label: result.source_label || null,
        graded_at: new Date().toISOString(),
      }, { onConflict: 'assignment_id' })
      if (upsertErr) throw new Error(upsertErr.message)

      const submissionLinks = a.submission_bundle_url
        ? [{ url: a.submission_bundle_url, label: 'Submission' }]
        : a.assignment_submissions.map((s, i) => ({
            url: s.file_url,
            label: a.assignment_submissions.length === 1 ? 'Submission' : `Submission ${i + 1}`,
          }))

      const scored = Number.isFinite(result.score_correct) && Number.isFinite(result.score_total)
        ? ` (${result.score_correct}/${result.score_total})`
        : ''
      await notifyMark(
        `AI review: ${student} — ${problemName}${scored}`,
        reviewEmailHtml({
          studentName: student,
          problemName,
          result,
          assignmentNote: a.notes || '',
          assignmentUrl: problem?.problemUrl || '',
          submissionLinks,
        }),
      )
      await log(`${a.id}: graded and notified.`)
    } catch (e) {
      await log(`${a.id}: FAILED — ${e.message}`)
    } finally {
      for (const f of tmpFiles) await unlink(f).catch(() => {})
    }
  }
}

await run().catch(e => log(`FATAL: ${e.stack || e.message}`))
await log(DRY_RUN ? '=== dry run done ===' : '=== pass done ===')