#!/usr/bin/env node
// ============================================================================
// transcripts.mjs — look up what was actually said in a tutoring session.
//
// Session transcripts come from Wispr Flow (see sync_transcripts.mjs) and live
// in the backend-only `session_transcripts` table, with markdown copies under
// transcripts/ on the machine that recorded them. This is the read side: it
// works from the database, so it answers the same questions on either laptop.
//
// They are internal. Nothing here is shown to a student or a parent.
//
//   node scripts/transcripts.mjs list [student]        # what has been recorded
//   node scripts/transcripts.mjs show <student> [date] # full transcript
//   node scripts/transcripts.mjs search "escape speed" # find a moment
// ============================================================================

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const REST_URL = `${SUPABASE_URL}/rest/v1`
const TZ = 'America/New_York'

function readEnv(name) {
  const envPath = join(ROOT, '.env')
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const i = line.indexOf('=')
      if (i > 0 && line.slice(0, i).trim() === name) return line.slice(i + 1).trim()
    }
  }
  return process.env[name]
}
const SERVICE_KEY = readEnv('VITE_SUPABASE_SERVICE_KEY')
if (!SERVICE_KEY) { console.error('Missing VITE_SUPABASE_SERVICE_KEY (.env).'); process.exit(1) }

async function db(path) {
  const res = await fetch(`${REST_URL}/${path}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  })
  if (!res.ok) throw new Error(`DB ${res.status}: ${(await res.text()).slice(0, 300)}`)
  return res.json()
}

const day = iso => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ })
const time = iso => new Date(iso).toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })

const [cmd, ...rest] = process.argv.slice(2)

if (cmd === 'list') {
  const student = rest[0]
  const rows = await db('session_transcripts?select=student_id,session_id,title,started_at,'
    + 'duration_seconds,word_count,match_confidence&order=started_at.desc'
    + (student ? `&student_id=eq.${encodeURIComponent(student)}` : ''))
  if (!rows.length) { console.log('No transcripts recorded yet.'); process.exit(0) }
  for (const r of rows) {
    console.log(`${day(r.started_at)} ${time(r.started_at)}  ${(r.student_id || '?').padEnd(10)} `
      + `${String(Math.round(r.duration_seconds / 60)).padStart(3)} min  `
      + `${String(r.word_count).padStart(6)} words  ${r.title}`
      + (r.match_confidence === 'low' ? '  [uncertain session match]' : ''))
    console.log(`  ${r.session_id}`)
  }
  process.exit(0)
}

if (cmd === 'show') {
  const [student, date] = rest
  if (!student) { console.error('Usage: show <student> [YYYY-MM-DD]'); process.exit(1) }
  let q = `session_transcripts?select=*&order=started_at.desc&limit=1`
  // A session id works here too, so a summary or report can be traced straight back.
  q += student.includes('-') && student.startsWith('gcal')
    ? `&session_id=eq.${encodeURIComponent(student)}`
    : `&student_id=eq.${encodeURIComponent(student)}`
  if (date) q += `&started_at=gte.${date}T00:00:00&started_at=lt.${date}T23:59:59`
  const [row] = await db(q)
  if (!row) { console.log('No transcript found.'); process.exit(0) }
  console.log(`${row.title} — ${row.student_id}, ${day(row.started_at)} ${time(row.started_at)} `
    + `(${Math.round(row.duration_seconds / 60)} min, session ${row.session_id})`)
  if (row.wispr_summary) console.log(`\n${row.wispr_summary.trim()}`)
  console.log(`\n${row.transcript}`)
  process.exit(0)
}

if (cmd === 'search') {
  const term = rest.join(' ')
  if (!term) { console.error('Usage: search "<text>"'); process.exit(1) }
  const rows = await db('session_transcripts?select=student_id,session_id,started_at,title,transcript'
    + `&transcript=ilike.*${encodeURIComponent(term.replace(/[*%]/g, ''))}*&order=started_at.desc`)
  if (!rows.length) { console.log(`Nothing matching "${term}".`); process.exit(0) }
  const needle = term.toLowerCase()
  for (const r of rows) {
    console.log(`\n=== ${r.student_id} · ${day(r.started_at)} · ${r.title} (${r.session_id})`)
    for (const block of r.transcript.split('\n\n')) {
      if (block.toLowerCase().includes(needle)) console.log(`  ${block.slice(0, 400)}`)
    }
  }
  process.exit(0)
}

console.log(`Usage:
  node scripts/transcripts.mjs list [student]
  node scripts/transcripts.mjs show <student|sessionId> [YYYY-MM-DD]
  node scripts/transcripts.mjs search "<text>"`)
