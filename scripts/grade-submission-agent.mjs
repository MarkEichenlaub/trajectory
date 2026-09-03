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
 * Supabase, or sending email.
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

// ── claude -p grading call ──────────────────────────────────────────────────

const GRADE_SCHEMA = JSON.stringify({
  type: 'object',
  properties: {
    summary: { type: 'string' },
    breakdown: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          verdict: { type: 'string', enum: ['correct', 'incorrect', 'partial', 'unclear'] },
          note: { type: 'string' },
        },
        required: ['question', 'verdict', 'note'],
      },
    },
    issues: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'breakdown', 'issues'],
})

async function gradeSubmission({ problemName, problemDesc, problemFile, solutionFile, solutionText, submissionFiles }) {
  const hasKey = Boolean(solutionFile || solutionText)
  const lines = [
    'You are helping a physics/math tutor do a first-pass review of a student\'s',
    'submitted homework. This review is for the tutor only — the student will',
    'never see it.',
    '',
    `Problem: ${problemName}`,
    problemDesc ? `Problem description: ${problemDesc}` : '',
    problemFile ? `Read the full problem statement at: ${problemFile}` : '',
    '',
    `Read the student's submitted work at: ${submissionFiles.join(', ')}`,
    '',
  ]

  if (hasKey) {
    lines.push(
      'An answer key is available:',
      solutionFile ? `Read the solution at: ${solutionFile}` : '',
      solutionText ? `Solution text:\n${solutionText}` : '',
      '',
      'Grade the student\'s work against this key. For each distinct question or',
      'part, give a verdict of "correct", "incorrect", or "partial", with a short',
      'note explaining why (what they got right/wrong, where the error is).',
    )
  } else {
    lines.push(
      'No answer key is available for this problem. Do NOT claim to know whether',
      'the final answers are correct. Instead assess completeness and apparent',
      'understanding: for each distinct question or part, use verdict "unclear"',
      'and use the note to describe what was attempted, how complete the work',
      'looks, and anything that stands out (a plausible approach, a likely',
      'error in reasoning you can see even without a key, work left blank).',
    )
  }

  lines.push(
    '',
    'Also produce a 2-4 sentence overall summary of how the student did, and a',
    'short list of specific concepts/skills this student should work on based',
    'on what you saw (empty list if nothing stands out).',
  )

  const prompt = lines.filter(Boolean).join('\n')
  const schema = GRADE_SCHEMA.replace(/'/g, "''")
  const p = prompt.replace(/'/g, "''")
  const isWin = process.platform === 'win32'
  const base = `claude -p --allowedTools Read --output-format json --json-schema '${schema}' '${p}'`
  const cmd = isWin ? `'' | ${base}` : `${base} < /dev/null`

  const { stdout } = await execAsync(cmd, {
    // Grading can involve several images/a multi-page PDF plus a solution
    // file — give it real headroom (same rationale as ai-server.mjs's 5 min).
    shell: isWin ? 'pwsh.exe' : undefined,
    timeout: 300000,
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

// ── Notify Mark ──────────────────────────────────────────────────────────────

async function notifyMark(subject, bodyLines) {
  if (DRY_RUN) { await log(`[dry-run] would email Mark: ${subject}`); return }
  await fetch(`${FUNCTIONS_URL}/send-email`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: MARK_EMAIL, subject, body: bodyLines.join('\n') }),
  }).catch(e => log(`[notify-mark] send-email call failed: ${e.message}`))
}

// ── Main pass ────────────────────────────────────────────────────────────────

async function run() {
  await log(DRY_RUN ? '=== grade-submission-agent dry run ===' : '=== grade-submission-agent pass ===')

  // Candidates: completed assignments with at least one real file submission
  // (excludes F=ma, which completes via a different RPC path and never
  // writes assignment_submissions) and no review yet.
  const { data: candidates, error: candErr } = await supabase
    .from('assignments')
    .select('id, student_id, problem_id, submission_bundle_url, assignment_submissions!inner(file_url, file_name)')
    .eq('status', 'completed')
    .order('submission_at', { ascending: false })
    .limit(MAX_CANDIDATES_PER_PASS * 3)
  if (candErr) throw new Error(candErr.message)

  const { data: reviewed, error: revErr } = await supabase.from('assignment_reviews').select('assignment_id')
  if (revErr) throw new Error(revErr.message)
  const reviewedIds = new Set((reviewed || []).map(r => r.assignment_id))

  const pending = (candidates || []).filter(a => !reviewedIds.has(a.id)).slice(0, MAX_CANDIDATES_PER_PASS)
  if (pending.length === 0) { await log('No ungraded submissions.'); return }
  await log(`Found ${pending.length} ungraded submission(s).`)

  const { data: students } = await supabase.from('students').select('id, name')
  const studentName = id => (students || []).find(s => s.id === id)?.name || id

  for (const a of pending) {
    const tmpFiles = []
    try {
      const problem = await resolveProblem(a.problem_id)
      const problemName = problem?.name || a.problem_id
      const student = studentName(a.student_id)
      await log(`${a.id}: grading "${problemName}" for ${student}`)

      const problemFile = problem?.problemUrl ? await downloadToTemp(problem.problemUrl, 'problem') : null
      const solutionFile = problem?.solutionUrl ? await downloadToTemp(problem.solutionUrl, 'solution') : null
      const solutionText = solutionFile ? '' : await resolveTextSolution(a.problem_id)
      if (problemFile) tmpFiles.push(problemFile)
      if (solutionFile) tmpFiles.push(solutionFile)

      const submissionUrls = a.submission_bundle_url
        ? [{ url: a.submission_bundle_url, file_name: 'bundle.pdf' }]
        : a.assignment_submissions.map(s => ({ url: s.file_url, file_name: s.file_name }))
      const submissionFiles = []
      for (const s of submissionUrls) {
        const path = await downloadToTemp(s.url, `submission (${s.file_name || s.url})`)
        if (path) { submissionFiles.push(path); tmpFiles.push(path) }
        else await log(`${a.id}: could not download submission file ${s.file_name || s.url}`)
      }
      if (submissionFiles.length === 0) { await log(`${a.id}: no downloadable submission files, skipping`); continue }

      if (DRY_RUN) {
        await log(`[dry-run] ${a.id}: problem=${Boolean(problemFile)} solution=${Boolean(solutionFile || solutionText)} submissionFiles=${submissionFiles.length}`)
        continue
      }

      const result = await gradeSubmission({
        problemName,
        problemDesc: problem?.desc || '',
        problemFile,
        solutionFile,
        solutionText,
        submissionFiles,
      })

      const { error: upsertErr } = await supabase.from('assignment_reviews').upsert({
        assignment_id: a.id,
        ai_summary: result.summary,
        question_breakdown: result.breakdown,
        issues: result.issues,
        graded_at: new Date().toISOString(),
      }, { onConflict: 'assignment_id' })
      if (upsertErr) throw new Error(upsertErr.message)

      const breakdownLines = result.breakdown.map(b => `  - ${b.question}: ${b.verdict} — ${b.note}`)
      await notifyMark(`AI review: ${student} — ${problemName}`, [
        result.summary,
        '',
        'Breakdown:',
        ...breakdownLines,
        '',
        result.issues.length ? `Issues to work on:\n${result.issues.map(i => `  - ${i}`).join('\n')}` : '',
        '',
        `Review in the portal: ${PORTAL_URL}`,
      ])
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
