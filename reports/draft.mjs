#!/usr/bin/env node
// ============================================================================
// draft.mjs — AI-draft a progress report from portal data.
//
// Pulls one student's sessions, study plan, and assignments from Supabase,
// hands them to the `claude` CLI (your Claude subscription — no API key), and
// writes a ready-to-edit Typst report at reports/<student>/<cycle>.typ.
//
// Usage:
//   node reports/draft.mjs <studentId> [--cycle "Cycle 2 · Fall 2026"]
//                                      [--dry-run] [--model <name>]
//
//   --dry-run   Assemble the prompt and write it to _prompt.txt without calling
//               claude (free; use it to inspect what the model will see).
//
// After it runs:
//   typst watch reports/<student>/<file>.typ reports/<student>/<file>.pdf
//   ...edit the prose, then compile, then upload via the portal Reports tab.
// ============================================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'

// ---- args ----
const args = process.argv.slice(2)
const studentId = args.find(a => !a.startsWith('--'))
const dryRun = args.includes('--dry-run')
const cycleArg = argValue('--cycle')
const model = argValue('--model')
function argValue(flag) {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : null
}
if (!studentId) {
  console.error('Usage: node reports/draft.mjs <studentId> [--cycle "..."] [--dry-run] [--model <name>]')
  process.exit(1)
}

// ---- service key from .env ----
function readEnv(name) {
  const envPath = path.join(ROOT, '.env')
  if (!fs.existsSync(envPath)) return process.env[name]
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && m[1] === name) return m[2]
  }
  return process.env[name]
}
const SERVICE_KEY = readEnv('VITE_SUPABASE_SERVICE_KEY')
if (!SERVICE_KEY) {
  console.error('Missing VITE_SUPABASE_SERVICE_KEY (.env or environment).')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

// ---- helpers ----
function season(d) {
  const m = d.getMonth()
  if (m <= 1 || m === 11) return 'Winter'
  if (m <= 4) return 'Spring'
  if (m <= 7) return 'Summer'
  return 'Fall'
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function esc(s) { return String(s ?? '').replace(/"/g, '\\"') }

async function main() {
  const { data: student, error: sErr } = await db
    .from('students').select('id, name, billing_name').eq('id', studentId).single()
  if (sErr || !student) { console.error('Student not found:', studentId, sErr?.message || ''); process.exit(1) }

  // Anchor = last report; the cycle covers everything since then.
  const { data: lastReport } = await db
    .from('progress_reports').select('created_at, title')
    .eq('student_id', studentId).order('created_at', { ascending: false }).limit(1).maybeSingle()
  const anchor = lastReport?.created_at ?? null

  // Sessions this cycle: completed (end_time set and past), since the last
  // report, oldest first. Mirrors how bill-sessions counts completed sessions
  // so the drafted report covers exactly the sessions that triggered it.
  const nowIso = new Date().toISOString()
  let sq = db.from('sessions')
    .select('scheduled_at, end_time, summary, tags')
    .eq('student_id', studentId)
    .not('end_time', 'is', null)
    .lte('end_time', nowIso)
    .order('scheduled_at', { ascending: true })
  if (anchor) sq = sq.gt('end_time', anchor)
  const { data: sessions = [] } = await sq

  // Active study plan.
  const { data: plan } = await db
    .from('study_plans').select('content')
    .eq('student_id', studentId).eq('status', 'active')
    .order('created_at', { ascending: false }).limit(1).maybeSingle()

  // Assignments this cycle, with problem titles resolved from the JSON catalog.
  const problems = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'problems.json'), 'utf8'))
  const byId = new Map(problems.map(p => [p.id, p]))
  let aq = db.from('assignments')
    .select('problem_id, status, assigned_date, completed_date, notes')
    .eq('student_id', studentId).order('assigned_date', { ascending: true })
  if (anchor) aq = aq.gte('assigned_date', anchor.slice(0, 10))
  const { data: assignments = [] } = await aq
  const assignLines = assignments.map(a => {
    const p = byId.get(a.problem_id)
    const title = p ? `${p.contest} ${p.year ?? ''} ${p.label ?? ''} — ${p.name}`.replace(/\s+/g, ' ').trim() : a.problem_id
    const when = a.status === 'completed' ? `completed ${a.completed_date || '?'}` : `assigned ${a.assigned_date || '?'}`
    return `- ${title} (${when})${a.notes ? ` — note: ${a.notes}` : ''}`
  })

  // Cycle label.
  const { count: reportCount } = await db
    .from('progress_reports').select('id', { count: 'exact', head: true }).eq('student_id', studentId)
  const now = new Date()
  const cycle = cycleArg || `Cycle ${(reportCount ?? 0) + 1} · ${season(now)} ${now.getFullYear()}`

  // ---- assemble context the model will read ----
  const ctx = []
  ctx.push(`STUDENT: ${student.name}`)
  ctx.push(`CYCLE LABEL: ${cycle}`)
  ctx.push(lastReport
    ? `PREVIOUS REPORT: "${lastReport.title}" on ${fmtDate(lastReport.created_at)} — only cover progress SINCE then.`
    : `PREVIOUS REPORT: none — this is the first report.`)
  ctx.push('')
  ctx.push(`ACTIVE STUDY PLAN:\n${plan?.content?.trim() || '(none on file)'}`)
  ctx.push('')
  ctx.push(`SESSIONS THIS CYCLE (${sessions.length}):`)
  for (const s of sessions) {
    const tags = (s.tags || []).join(', ')
    ctx.push(`- ${fmtDate(s.scheduled_at)}: ${s.summary || '(no summary)'}${tags ? ` [topics: ${tags}]` : ''}`)
  }
  ctx.push('')
  ctx.push(`ASSIGNMENTS THIS CYCLE (${assignLines.length}):`)
  ctx.push(assignLines.length ? assignLines.join('\n') : '(none recorded)')

  const prompt = buildPrompt(student, cycle, sessions, ctx.join('\n'))

  const outDir = path.join(__dirname, studentId)
  fs.mkdirSync(outDir, { recursive: true })
  const slug = cycle.toLowerCase().replace(/[·.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  if (dryRun) {
    const pf = path.join(outDir, '_prompt.txt')
    fs.writeFileSync(pf, prompt)
    console.log(`Dry run — prompt written to ${path.relative(ROOT, pf)}`)
    console.log(`Context: ${sessions.length} sessions, ${assignLines.length} assignments, plan ${plan ? 'present' : 'absent'}.`)
    return
  }

  console.log(`Drafting ${student.name} — ${cycle} (${sessions.length} sessions) via claude…`)
  const claudeArgs = ['-p']
  if (model) claudeArgs.push('--model', model)
  const res = spawnSync('claude', claudeArgs, {
    input: prompt, encoding: 'utf8', shell: true, maxBuffer: 16 * 1024 * 1024,
  })
  if (res.status !== 0 || !res.stdout?.trim()) {
    console.error('claude CLI failed.', res.stderr || res.error?.message || `exit ${res.status}`)
    process.exit(1)
  }

  let dataBlock = res.stdout.replace(/```[a-zA-Z]*\n?/g, '').trim()
  const i = dataBlock.indexOf('#let data')
  if (i >= 0) dataBlock = dataBlock.slice(i)
  dataBlock = dataBlock.replace(/#report\s*\([^)]*\)\s*$/, '').trim()
  if (!dataBlock.startsWith('#let data')) {
    console.error('Unexpected model output (no `#let data` block). Raw output:\n' + res.stdout)
    process.exit(1)
  }

  const file = path.join(outDir, `${slug}.typ`)
  const rel = path.relative(ROOT, file).replace(/\\/g, '/')
  const reportsRel = path.relative(ROOT, __dirname).replace(/\\/g, '/')
  const pdfFile = file.replace(/\.typ$/, '.pdf')
  const pdfRel = path.relative(ROOT, pdfFile).replace(/\\/g, '/')

  function writeTyp(block) {
    fs.writeFileSync(file, `#import "../lib.typ": report\n\n${block}\n\n#report(data)\n`)
  }
  writeTyp(dataBlock)
  console.log(`\nDraft written to ${rel}`)

  // ---- compile verification + retry ----
  const typstCheck = spawnSync('typst', ['--version'], { encoding: 'utf8', shell: true })
  if (typstCheck.status !== 0) {
    console.warn('Note: typst not found on PATH — skipping compile check. Install via: scoop install typst')
  } else {
    let compiled = false
    let lastErr = ''
    for (let attempt = 1; attempt <= 3; attempt++) {
      const cr = spawnSync('typst', ['compile', '--root', reportsRel, rel, pdfRel], {
        cwd: ROOT, encoding: 'utf8', shell: true,
      })
      if (cr.status === 0 && fs.existsSync(pdfFile)) {
        compiled = true
        console.log(attempt > 1 ? `Compiled to PDF (attempt ${attempt}).` : 'Compiled to PDF.')
        break
      }
      lastErr = (cr.stderr || cr.stdout || `exit ${cr.status}`).trim()
      console.error(`Typst compile failed (attempt ${attempt}):\n${lastErr}`)
      if (attempt === 3) break

      console.log('Sending error back to Claude to fix…')
      const fixPrompt = `The Typst file you generated does not compile. Current file:\n\n${fs.readFileSync(file, 'utf8')}\n\nTypst error:\n\n${lastErr}\n\nFix the error and output ONLY the corrected #let data block — same format as before, no prose, no code fences, no #report call.`
      const fixRes = spawnSync('claude', ['-p'], {
        input: fixPrompt, encoding: 'utf8', shell: true, maxBuffer: 16 * 1024 * 1024,
      })
      if (fixRes.status !== 0 || !fixRes.stdout?.trim()) {
        console.error('claude CLI failed during fix.', fixRes.stderr || '')
        break
      }
      let fixedBlock = fixRes.stdout.replace(/```[a-zA-Z]*\n?/g, '').trim()
      const fi = fixedBlock.indexOf('#let data')
      if (fi >= 0) fixedBlock = fixedBlock.slice(fi)
      fixedBlock = fixedBlock.replace(/#report\s*\([^)]*\)\s*$/, '').trim()
      if (!fixedBlock.startsWith('#let data')) {
        console.error('Claude fix did not produce a valid #let data block.')
        break
      }
      writeTyp(fixedBlock)
    }
    if (!compiled) {
      console.warn(`\nCould not compile after 3 attempts. .typ file saved; fix manually.`)
      console.warn(`Last error:\n${lastErr}`)
    }
  }

  console.log(`Live preview: typst watch --root ${reportsRel} ${rel} ${pdfRel}`)
  console.log(`Compile:      typst compile --root ${reportsRel} ${rel} ${pdfRel}`)
}

function buildPrompt(student, cycle, sessions, context) {
  return `You are drafting a physics tutoring progress report in the voice of Mark Eichenlaub,
the tutor. Write in the first person ("I worked with ${student.name} on…"), warm,
specific, and concrete — like the example tone of an experienced mentor who knows
the student well. Avoid generic praise; ground observations in the actual session
data below.

Output ONLY a Typst data block in EXACTLY this shape, with no prose before or after,
no markdown code fences, and no #report(...) call:

#let data = (
  student: "${esc(student.name)}",
  mentor:  "Mark Eichenlaub",
  cycle:   "${esc(cycle)}",
  summary: ( "…", "…", "…" ),
  goals: ( "…", "…" ),
  progress: ( "paragraph…", "paragraph…" ),
  plan: ( "…", "…" ),
  resources: ( "…", "…" ),
  support: ( "…", "…" ),
  sessions: (
    ("Mon DD, YYYY", "one-sentence summary.", "assignment"),
  ),
)

Rules:
- summary: 3-4 bullets with the headline facts of this cycle.
- goals: what ${student.name} is working toward this cycle.
- progress: 2-3 narrative paragraphs. Reference real moments from the session
  summaries; include a specific anecdote if the data supports one. Relate progress
  to the goals.
- plan: concrete next-cycle focus (skills, topics, what they're preparing for).
- resources: books/courses/tools to use next cycle (omit the field entirely if none apply).
- support: 3-4 concrete, low-pressure things the parent can do at home.
- sessions: ONE tuple per session listed below, in order, each summary ONE sentence.
  Use the assignment that best matches that session (or "" if unknown).
- Escape any double-quotes inside strings as \\". Keep "cycle" terminology.
- Plain ASCII punctuation is fine; the layout handles styling.

There are ${sessions.length} sessions this cycle, so the sessions tuple must have
${sessions.length} rows.

=== PORTAL DATA ===
${context}
=== END DATA ===`
}

main().catch(e => { console.error(e); process.exit(1) })
