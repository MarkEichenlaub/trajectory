// Batch-build one packet per Physics 1: Mechanics week, the way Mark normally
// does it by hand in the portal: every homework (or script) problem for the
// week, in set order, with that week's hand-written summary on the front.
//
// Usage:
//   node scripts/build_mechanics_weeks.mjs --weeks 5-24 [--student india]
//                                          [--source homework|script]
//                                          [--rebuild] [--dry-run]
//
// --source picks which problems from data/aops-mechanics.json go in the
// packet: 'homework' (default) builds "<Topic> Homework"; 'script' builds
// "<Topic>: Class Problems" from that week's script problems.
//
// --rebuild re-renders weeks that already have an unapproved packet (draft /
// building / failed), reusing the same row and re-uploading both PDFs. Weeks
// whose packet is already active are never touched.
//
// For each week it creates a build request (same shape as the portal's
// "Create assignment…" button), builds the problems + solutions PDFs with
// EigenNode's builder, uploads both, and leaves the packet in `draft` for
// review in the portal's Handouts tab. Weeks that already have a packet with
// this exact title for this student are skipped, so the script is safe to
// re-run after a failure.

import { execFileSync } from 'child_process'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dirname, '..')
const EIGENNODE = join(REPO, '..', 'EigenNode')
const SUMMARY_DIR = join(EIGENNODE, 'scripts', 'handout_summaries')
const OUTPUT_DIR = join(EIGENNODE, 'scripts', 'output')

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag)
  return i >= 0 ? process.argv[i + 1] : fallback
}
const dryRun = process.argv.includes('--dry-run')
const rebuild = process.argv.includes('--rebuild')
const student = arg('--student', 'india')
const source = arg('--source', 'homework')
if (source !== 'homework' && source !== 'script') {
  throw new Error(`--source must be "homework" or "script", got "${source}"`)
}
// --weeks takes ranges and single weeks: "5-24", "9", "5,10-13,22"
const weeks = arg('--weeks', '5-24').split(',').flatMap(tok => {
  const [a, b] = tok.split('-').map(Number)
  return Array.from({ length: (b ?? a) - a + 1 }, (_, i) => a + i)
})

const problems = JSON.parse(readFileSync(join(REPO, 'data', 'aops-mechanics.json'), 'utf8'))

const hw = (...args) => execFileSync('node', [join(__dirname, 'hw_agent.mjs'), ...args], {
  cwd: REPO, encoding: 'utf8',
}).trim()

// Packet this student already has with this exact title, so re-runs skip
// finished weeks without confusing a homework packet for a script one (both
// share the same lesson string).
const existing = new Map(
  JSON.parse(hw('list'))
    .filter(r => r.request.student_id === student && r.status !== 'deleted')
    .map(r => [r.request.title, r])
)
const REBUILDABLE = ['draft', 'building', 'failed', 'requested']

function summaryFor(code) {
  const hit = readdirSync(SUMMARY_DIR)
    .find(f => f.startsWith(code.toLowerCase()) && f.endsWith('summary.tex'))
  return hit ? join(SUMMARY_DIR, hit) : null
}

const failures = []
for (const week of weeks) {
  const set = problems
    .filter(p => p.source === source && p.week === week)
    .sort((a, b) => a.set_number - b.set_number)
  if (!set.length) { console.log(`Week ${week}: no ${source} problems — skipped`); continue }

  const lesson = set[0].lesson                              // "MCH04: Energy Conservation"
  const code = set[0].label                                 // "MCH04"
  const topic = lesson.slice(lesson.indexOf(':') + 1).trim()
  const title = source === 'script' ? `${topic}: Class Problems` : `${topic} Homework`
  const ids = set.map(p => p.id).join(',')

  const prior = existing.get(title)
  const reuseId = prior && rebuild && REBUILDABLE.includes(prior.status) ? prior.id : null
  if (prior && !reuseId) {
    const why = prior.status === 'active' ? 'already approved' : 'a packet already exists'
    console.log(`Week ${week} (${code}): ${why} — skipped`)
    continue
  }
  const summary = summaryFor(code)
  if (!summary) { failures.push(`${code}: no summary file in handout_summaries/`); continue }

  console.log(`\n=== Week ${week} ${lesson} — ${set.length} problems`)
  if (dryRun) { console.log(`  would ${reuseId ? `rebuild ${reuseId}` : 'build'} "${title}"`); continue }

  let builtId = null
  try {
    const id = builtId = reuseId || hw('create', '--student', student, '--lesson', lesson,
      '--problems', ids, '--title', title)
    const name = JSON.parse(hw('get', id)).request.student_name
    hw('set', id, '--status', 'building')

    for (const solutions of [false, true]) {
      execFileSync('python', ['scripts/build_homework_set.py', id, '--problems', ids,
        '--lesson', lesson, '--student', name, '--title', title,
        '--summary-file', summary, ...(solutions ? ['--solutions'] : [])],
      { cwd: EIGENNODE, encoding: 'utf8', stdio: 'pipe' })
    }
    const report = readFileSync(join(OUTPUT_DIR, 'build_report.txt'), 'utf8').trim()
    if (report) console.log(`  [warnings]\n${report}`)

    // The renderer emits a placeholder instead of failing when it can't find a
    // problem's text, which is easy to miss — a blank page reaches the student.
    const tex = readFileSync(join(OUTPUT_DIR, `homework_set_${id}.tex`), 'utf8')
    const blanks = (tex.match(/\[Problem text unavailable\]/g) || []).length
    if (blanks) throw new Error(`${blanks} problem(s) rendered with no text`)

    const pdf = join(OUTPUT_DIR, `homework_set_${id}.pdf`)
    const sol = join(OUTPUT_DIR, `homework_set_${id}_solutions.pdf`)
    if (!existsSync(pdf) || !existsSync(sol)) throw new Error('builder produced no PDF')

    hw('upload', id, pdf, '--solutions', sol)
    const kind = source === 'script' ? 'class problems' : 'homework'
    hw('set', id, '--status', 'draft', '--clear-notes', '--name', title,
      '--description', `${code} ${topic} ${kind} for ${name}, ${set.length} problems`)
    console.log(`  ✓ draft ready: ${id}`)
  } catch (e) {
    const detail = (e.stderr || e.message || '').toString().trim().split('\n').slice(-6).join('\n')
    const oneLine = detail.split('\n').pop()
    console.log(`  ✗ FAILED: ${detail}`)
    failures.push(`Week ${week} (${code}): ${oneLine}`)
    // Leave the row saying so rather than sitting in 'building' behind a stale PDF.
    if (builtId) {
      try {
        hw('set', builtId, '--status', 'failed', '--notes', `Build failed: ${oneLine}`)
      } catch { /* reporting is best-effort */ }
    }
  }
}

console.log(failures.length ? `\nFailures:\n- ${failures.join('\n- ')}` : '\nAll weeks built.')
