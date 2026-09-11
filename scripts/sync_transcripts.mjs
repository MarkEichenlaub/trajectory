#!/usr/bin/env node
// ============================================================================
// sync_transcripts.mjs — pull Wispr Flow session recordings into the portal.
//
// Wispr's meeting recorder writes a diarized, timestamped transcript next to the
// audio for every meeting it records:
//
//   %APPDATA%\Wispr Flow\meetings\<meeting-id>\live.ndjson
//
// Each line is one utterance with absolute epoch timestamps and the audio source
// it came from — "mic" is Mark talking, "system" is the call audio coming back
// out of the speakers, i.e. the student. (refined.ndjson holds a cleaned-up pass,
// but it renumbers speakers and uses its own clock, so live.ndjson is the source
// of truth here and refined.ndjson is only a fallback.)
//
// This script matches each recording to a `sessions` row by clock overlap, writes
// a local markdown copy under transcripts/ (gitignored — this repo is public),
// and upserts it into the backend-only `session_transcripts` table so the session
// summarizer and the progress-report drafter can read it.
//
// Transcripts are NEVER student-facing; see the migration for the RLS reasoning.
//
// Usage:
//   node scripts/sync_transcripts.mjs                  # sync anything new
//   node scripts/sync_transcripts.mjs --all            # re-render and re-upload all
//   node scripts/sync_transcripts.mjs --dry-run        # show matches, write nothing
//   node scripts/sync_transcripts.mjs --attach <wisprMeetingId> <sessionId>
// ============================================================================

import { DatabaseSync } from 'node:sqlite'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const TRANSCRIPT_DIR = join(ROOT, 'transcripts')
const WISPR_DIR = join(process.env.APPDATA || '', 'Wispr Flow')
const FLOW_DB = join(WISPR_DIR, 'flow.sqlite')
const MEETINGS_DIR = join(WISPR_DIR, 'meetings')

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const REST_URL = `${SUPABASE_URL}/rest/v1`

// A recording and a session are the same event if their clocks overlap this long.
const HIGH_CONFIDENCE_OVERLAP_S = 10 * 60
const MIN_OVERLAP_S = 3 * 60

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const FORCE_ALL = args.includes('--all')
const QUIET = args.includes('--quiet')
const attachIdx = args.indexOf('--attach')

function log(...a) { if (!QUIET) console.log(...a) }

// ── env ──────────────────────────────────────────────────────────────────────

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
const DB_HEADERS = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }

async function db(path, init = {}) {
  const res = await fetch(`${REST_URL}/${path}`, {
    ...init,
    headers: { ...DB_HEADERS, 'Content-Type': 'application/json', ...(init.headers || {}) },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`DB ${res.status} on ${path}: ${text.slice(0, 300)}`)
  return text ? JSON.parse(text) : null
}

// ── reading Wispr ────────────────────────────────────────────────────────────

// Meetings.createdAt is '2026-09-11 01:34:21.805 +00:00'; endedAt is epoch ms.
function parseWisprDate(s) {
  if (!s) return null
  const d = new Date(String(s).trim().replace(' +00:00', 'Z').replace(' ', 'T'))
  return isNaN(d.getTime()) ? null : d
}

// Opened read-only, so this can never disturb the running Wispr app.
function readMeetings() {
  const conn = new DatabaseSync(FLOW_DB, { readOnly: true })
  try {
    return conn.prepare(`
      SELECT id, title, createdAt, endedAt, summary, notes, participantNames
      FROM Meetings
      WHERE finalized = 1 AND isDeleted = 0 AND isTourDemo = 0
      ORDER BY createdAt
    `).all()
  } finally {
    conn.close()
  }
}

function readNdjson(file) {
  if (!existsSync(file)) return []
  const out = []
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t) continue
    try {
      const o = JSON.parse(t)
      if (o.text) out.push(o)
    } catch { /* half-written last line while Wispr is still recording */ }
  }
  return out
}

// One meeting folder → { utterances, startMs, endMs, refinedOnly }.
function readTranscriptFiles(meetingId, meeting) {
  const dir = join(MEETINGS_DIR, meetingId)
  const live = readNdjson(join(dir, 'live.ndjson'))

  if (live.length) {
    const utterances = live.map(u => ({
      startMs: u.startEpochMs ?? null,
      offsetMs: u.startRecordingMs ?? null,
      source: u.speaker?.source || 'unknown',
      speakerId: u.speaker?.id ?? null,
      text: (u.text || '').trim(),
    })).filter(u => u.text)
    const stamped = utterances.filter(u => u.startMs)
    const startMs = stamped.length ? Math.min(...stamped.map(u => u.startMs)) : null
    const endMs = live.reduce((m, u) => Math.max(m, u.endEpochMs || 0), 0) || null
    return { utterances, startMs, endMs, refinedOnly: false }
  }

  // Fallback: only the refined pass survived. Its speaker ids are renumbered in
  // order of first appearance and it carries no absolute clock, so we date it
  // from the Meetings row and label the speakers generically.
  const refined = readNdjson(join(dir, 'refined.ndjson'))
  if (!refined.length) return null
  const utterances = refined.map(u => ({
    startMs: null,
    offsetMs: parseClock(u.timestamp),
    source: `speaker${u.speaker?.id ?? '?'}`,
    speakerId: u.speaker?.id ?? null,
    text: (u.text || '').trim(),
  })).filter(u => u.text)
  return {
    utterances,
    startMs: parseWisprDate(meeting.createdAt)?.getTime() ?? null,
    endMs: Number(meeting.endedAt) || null,
    refinedOnly: true,
  }
}

function parseClock(s) {
  const parts = String(s || '').split(':').map(Number)
  if (!parts.length || parts.some(Number.isNaN)) return null
  const sec = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2]
    : parts.length === 2 ? parts[0] * 60 + parts[1]
      : parts[0]
  return sec * 1000
}

// ── matching a recording to a session ────────────────────────────────────────

function overlapSeconds(aStart, aEnd, bStart, bEnd) {
  return Math.max(0, Math.round((Math.min(aEnd, bEnd) - Math.max(aStart, bStart)) / 1000))
}

function matchSession(startMs, endMs, sessions) {
  let best = null
  for (const s of sessions) {
    const sStart = new Date(s.scheduled_at).getTime()
    const sEnd = s.end_time ? new Date(s.end_time).getTime() : sStart + 60 * 60 * 1000
    const ov = overlapSeconds(startMs, endMs, sStart, sEnd)
    if (ov > 0 && (!best || ov > best.overlap)) best = { session: s, overlap: ov }
  }
  if (!best || best.overlap < MIN_OVERLAP_S) return null
  return {
    session: best.session,
    overlap: best.overlap,
    confidence: best.overlap >= HIGH_CONFIDENCE_OVERLAP_S ? 'high' : 'low',
  }
}

// ── rendering ────────────────────────────────────────────────────────────────

function labelsFor(studentName, refinedOnly) {
  if (refinedOnly) return {}
  return { mic: 'Mark', system: (studentName || 'Student').split(/\s+/)[0] }
}

function fmtOffset(ms) {
  if (ms == null) return '--:--'
  const total = Math.round(ms / 1000)
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60
  const pad = n => String(n).padStart(2, '0')
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

// Wispr emits short bursts, so consecutive lines from the same person are joined
// into one paragraph stamped with the time that person started talking.
function renderTranscript(utterances, labels) {
  const blocks = []
  for (const u of utterances) {
    const who = labels[u.source] || (u.source === 'mic' ? 'Mark'
      : u.source === 'system' ? 'Student'
        : `Speaker ${u.speakerId ?? '?'}`)
    const last = blocks[blocks.length - 1]
    if (last && last.who === who) last.text += ' ' + u.text
    else blocks.push({ who, at: u.offsetMs, text: u.text })
  }
  return blocks
    .map(b => `[${fmtOffset(b.at)}] ${b.who}: ${b.text.replace(/\s+/g, ' ').trim()}`)
    .join('\n\n')
}

function slugify(s, maxlen = 50) {
  return String(s || '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .toLowerCase().slice(0, maxlen).replace(/-+$/, '') || 'session'
}

const TZ = 'America/New_York'
function localDay(ms) { return new Date(ms).toLocaleDateString('en-CA', { timeZone: TZ }) }
function localTime(ms) {
  return new Date(ms).toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
}

function writeLocalCopy(rec) {
  const day = localDay(rec.startMs)
  const dir = join(TRANSCRIPT_DIR, rec.studentId || '_unmatched')
  const file = join(dir, `${day}_${localTime(rec.startMs).replace(':', '')}_${slugify(rec.title)}.md`)
  const lines = [
    '---',
    `student: ${rec.studentName || ''}`,
    `student_id: ${rec.studentId || ''}`,
    `session_id: ${rec.sessionId || ''}`,
    `date: ${day}`,
    `started: ${new Date(rec.startMs).toISOString()}`,
    `ended: ${rec.endMs ? new Date(rec.endMs).toISOString() : ''}`,
    `duration_minutes: ${Math.round((rec.endMs - rec.startMs) / 60000)}`,
    `title: ${rec.title}`,
    `tags: [${(rec.tags || []).join(', ')}]`,
    'source: Wispr Flow',
    `wispr_meeting_id: ${rec.meetingId}`,
    `match: ${rec.matchMethod || 'none'} (${rec.matchConfidence || 'unmatched'})`,
    'visibility: internal - never shown to students or parents',
    '---',
    '',
    `# ${rec.title}`,
    '',
    `${rec.studentName ? rec.studentName + ' · ' : ''}${day} ${localTime(rec.startMs)}`,
    '',
  ]
  if (rec.wisprSummary) lines.push('## Wispr summary', '', rec.wisprSummary.trim(), '')
  lines.push('## Transcript', '', rec.transcript, '')
  const body = lines.join('\n')
  if (!DRY_RUN) {
    mkdirSync(dir, { recursive: true })
    if (!existsSync(file) || readFileSync(file, 'utf8') !== body) writeFileSync(file, body, 'utf8')
  }
  return file
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(FLOW_DB)) {
    log(`No Wispr Flow install on this machine (${FLOW_DB}); nothing to sync.`)
    return
  }

  const meetings = readMeetings()
  if (!meetings.length) { log('No finalized Wispr meetings.'); return }

  // Manual attach: force one recording onto one session, overriding clock matching.
  let forcedSessionId = null, forcedMeetingId = null
  if (attachIdx >= 0) {
    forcedMeetingId = args[attachIdx + 1]
    forcedSessionId = args[attachIdx + 2]
    if (!forcedMeetingId || !forcedSessionId) {
      console.error('Usage: --attach <wisprMeetingId> <sessionId>'); process.exit(1)
    }
  }

  const existing = await db('session_transcripts?select=source_meeting_id,session_id')
  const known = new Map(existing.map(r => [r.source_meeting_id, r]))

  // Every session that could plausibly own one of these recordings.
  const earliest = Math.min(...meetings.map(m => parseWisprDate(m.createdAt)?.getTime() || Date.now()))
  const since = new Date(earliest - 24 * 3600 * 1000).toISOString()
  const sessions = await db(
    'sessions?select=id,student_id,scheduled_at,end_time,tags,session_type'
    + `&scheduled_at=gte.${encodeURIComponent(since)}&order=scheduled_at.asc`)
  const studentName = new Map((await db('students?select=id,name')).map(s => [s.id, s.name]))

  let written = 0, skipped = 0, unmatched = 0
  for (const m of meetings) {
    if (forcedMeetingId && m.id !== forcedMeetingId) continue

    const files = readTranscriptFiles(m.id, m)
    if (!files || !files.utterances.length) {
      log(`- ${m.title}: no transcript files on disk (Wispr may have cleaned them up)`)
      continue
    }

    const startMs = files.startMs ?? parseWisprDate(m.createdAt)?.getTime()
    const endMs = files.endMs ?? Number(m.endedAt) ?? startMs
    if (!startMs) { log(`- ${m.title}: no usable timestamps`); continue }

    let match = null
    if (forcedSessionId) {
      const s = sessions.find(x => x.id === forcedSessionId)
      if (!s) { console.error(`Session not found: ${forcedSessionId}`); process.exit(1) }
      match = { session: s, overlap: overlapSeconds(startMs, endMs,
        new Date(s.scheduled_at).getTime(), new Date(s.end_time || s.scheduled_at).getTime()),
      confidence: 'high', method: 'manual' }
    } else {
      const found = matchSession(startMs, endMs, sessions)
      if (found) match = { ...found, method: 'overlap' }
    }

    if (!match) {
      unmatched++
      log(`- ${m.title} (${localDay(startMs)} ${localTime(startMs)}): no session overlaps — `
        + 'left in omnisearch only')
      continue
    }

    const prior = known.get(m.id)
    if (prior && !FORCE_ALL && !forcedSessionId && prior.session_id === match.session.id) {
      skipped++
      continue
    }

    const sid = match.session.student_id
    const name = studentName.get(sid) || sid
    const labels = labelsFor(name, files.refinedOnly)
    const transcript = renderTranscript(files.utterances, labels)
    const rec = {
      meetingId: m.id,
      sessionId: match.session.id,
      studentId: sid,
      studentName: name,
      title: m.title || 'Tutoring session',
      startMs,
      endMs,
      tags: match.session.tags || [],
      wisprSummary: (m.summary || '').trim() || null,
      transcript,
      matchMethod: match.method,
      matchConfidence: match.confidence,
    }
    const localPath = writeLocalCopy(rec)

    const row = {
      source: 'wispr',
      source_meeting_id: m.id,
      session_id: match.session.id,
      student_id: sid,
      title: rec.title,
      started_at: new Date(startMs).toISOString(),
      ended_at: endMs ? new Date(endMs).toISOString() : null,
      duration_seconds: Math.round((endMs - startMs) / 1000),
      match_method: match.method,
      match_confidence: match.confidence,
      overlap_seconds: match.overlap,
      speaker_labels: labels,
      wispr_summary: rec.wisprSummary,
      transcript,
      word_count: transcript.split(/\s+/).length,
      local_path: localPath.slice(ROOT.length + 1).replace(/\\/g, '/'),
      updated_at: new Date().toISOString(),
    }

    if (DRY_RUN) {
      log(`[dry] ${name} ${localDay(startMs)} ${localTime(startMs)} -> ${match.session.id} `
        + `(${match.confidence}, ${Math.round(match.overlap / 60)} min overlap, ${row.word_count} words)`)
      continue
    }

    await db('session_transcripts?on_conflict=source,source_meeting_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(row),
    })
    written++
    log(`✓ ${name} ${localDay(startMs)} ${localTime(startMs)} -> ${match.session.id} `
      + `(${row.word_count} words, ${match.confidence} match)`)
  }

  log(`Done: ${written} written, ${skipped} already current, ${unmatched} not a tutoring session.`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
