/**
 * Auto-files homework a student emails Mark instead of submitting through the
 * portal. Uses Mark's Claude subscription (not API credits) for the one
 * narrow judgment call this needs; everything else is deterministic.
 *
 * Run via `node scripts/hw-email-agent.mjs --once` — this is how it runs in
 * production: a Windows Scheduled Task fires it every ~20 minutes (see
 * scripts/setup-hw-email-task.ps1). Each pass is a fresh, independent
 * process, same self-healing rationale as scripts/ai-server.mjs.
 *
 * `--dry-run` logs what it *would* do (matched student/assignment,
 * confidence, plausibility verdict) without writing to Supabase, uploading
 * anything, or touching Gmail labels. Use this to sanity-check matching
 * against real mail before trusting it to write.
 *
 * `--match-test --from <email> [--text-file <path>] [--files "a.pdf,b.pdf"]`
 * runs only the matching step against live assignment data and prints the
 * result. It touches Gmail not at all, so it works on a machine that has the
 * Supabase key but no Gmail credentials — which is how you debug "why didn't
 * it know which assignment this was".
 *
 * One-time setup: node scripts/get-gmail-refresh-token.mjs, then add
 * GMAIL_REFRESH_TOKEN (and GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET, already
 * used for Calendar access) to .env.
 */
import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile, mkdir, appendFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')
const MATCH_TEST = process.argv.includes('--match-test')
const argValue = (name) => {
  const i = process.argv.indexOf(name)
  return i !== -1 ? process.argv[i + 1] : ''
}

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
const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET
const GMAIL_REFRESH_TOKEN = env.GMAIL_REFRESH_TOKEN
const MARK_EMAIL = 'mark.d.eichenlaub@gmail.com'

const LOG_FILE = resolve(ROOT, 'logs', 'hw-email-agent.log')
async function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`
  console.log(stamped)
  await mkdir(dirname(LOG_FILE), { recursive: true }).catch(() => {})
  await appendFile(LOG_FILE, stamped + '\n').catch(() => {})
}

if (!SERVICE_KEY) { console.error('ERROR: VITE_SUPABASE_SERVICE_KEY not found in .env'); process.exit(1) }
if (!MATCH_TEST && (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN)) {
  console.error('ERROR: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GMAIL_REFRESH_TOKEN not found in .env.')
  console.error('Run: node scripts/get-gmail-refresh-token.mjs')
  process.exit(1)
}

// A bad message must never take down the whole pass (same rationale as
// ai-server.mjs's guards) — but a --once run is a single short-lived process
// anyway, so these mainly stop a stray rejection from producing a silent exit
// with nothing logged.
process.on('unhandledRejection', (reason) => log(`[guard] unhandled rejection: ${reason?.stack || reason}`))
process.on('uncaughtException', (err) => log(`[guard] uncaught exception: ${err?.stack || err}`))

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

// ── Gmail API ──────────────────────────────────────────────────────────────

async function getGmailAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`Gmail token refresh failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.access_token
}

async function gmail(token, path, opts = {}) {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  })
  if (!res.ok) throw new Error(`Gmail API ${path} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function ensureLabels(token) {
  const { labels } = await gmail(token, '/labels')
  const wanted = ['HW-Filed', 'HW-Flagged', 'HW-Ignored']
  const ids = {}
  for (const name of wanted) {
    const existing = (labels || []).find(l => l.name === name)
    if (existing) { ids[name] = existing.id; continue }
    if (DRY_RUN) { ids[name] = `dry-run-${name}`; continue }
    const created = await gmail(token, '/labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, labelListVisibility: 'labelShow', messageListVisibility: 'show' }),
    })
    ids[name] = created.id
  }
  return ids
}

function b64urlDecode(s) {
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

const ACCEPTED_MIME_EXT = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' }

function walkParts(part, { onText, onAttachment }) {
  if (!part) return
  if (part.filename && part.body?.attachmentId && ACCEPTED_MIME_EXT[part.mimeType]) {
    onAttachment({ filename: part.filename, mimeType: part.mimeType, attachmentId: part.body.attachmentId })
  } else if (part.mimeType === 'text/plain' && part.body?.data) {
    onText(b64urlDecode(part.body.data).toString('utf8'))
  }
  for (const child of part.parts || []) walkParts(child, { onText, onAttachment })
}

function headerValue(headers, name) {
  return (headers || []).find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''
}

function extractEmail(fromHeader) {
  const m = fromHeader.match(/<([^>]+)>/)
  return (m ? m[1] : fromHeader).trim().toLowerCase()
}

// ── claude -p judgment call (mirrors scripts/ai-server.mjs's pattern) ──────

const JUDGE_SCHEMA = JSON.stringify({
  type: 'object',
  properties: {
    isSubmission: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['isSubmission', 'reason'],
})

async function judgeIsSubmission(messageText) {
  const prompt = [
    'A student emailed their physics tutor. Below is the plain-text body of that email',
    '(it may be empty or very short — students often just attach a photo/PDF with no text).',
    'The email already has a PDF/image attachment and already deterministically matches',
    "one of the student's outstanding homework assignments by other signals — this",
    'question is only about whether the email TEXT itself is consistent with submitting',
    'completed homework, versus clearly being something else (a question about the',
    'material, a scheduling request, an unrelated attachment like a permission slip).',
    'An empty or minimal body (e.g. just "here you go" or nothing) with an attachment IS',
    'consistent with a submission — only say false if the text clearly indicates',
    'something other than a submission.',
    '',
    '--- email body ---',
    messageText || '(empty)',
    '--- end email body ---',
  ].join('\n')

  const schema = JUDGE_SCHEMA.replace(/'/g, "''")
  const p = prompt.replace(/'/g, "''")
  const isWin = process.platform === 'win32'
  const base = `claude -p --output-format json --json-schema '${schema}' '${p}'`
  const cmd = isWin ? `'' | ${base}` : `${base} < /dev/null`

  const { stdout } = await execAsync(cmd, {
    shell: isWin ? 'pwsh.exe' : undefined,
    timeout: 120000,
    cwd: ROOT,
    maxBuffer: 10 * 1024 * 1024,
  })
  const envelope = JSON.parse(stdout.trim())
  const result = envelope.structured_output || envelope
  if (typeof result.isSubmission !== 'boolean') {
    throw new Error(`No structured output from claude: ${stdout.slice(0, 200)}`)
  }
  return result
}

// Second judgment call, used only when the deterministic signals leave more
// than one outstanding assignment on the table. The assignment email lists the
// whole problem set, so the thread text always mentions every handout the
// student has open — the only thing that says *which* one this is, is what the
// student wrote in their own reply ("here are my Ch. 11 multiple choice") and
// what they named the file ("morin ch 11.pdf").

const CHOOSE_SCHEMA = JSON.stringify({
  type: 'object',
  properties: {
    assignmentId: { type: 'string' },
    isSubmission: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['assignmentId', 'isSubmission', 'reason'],
})

async function chooseAssignment({ ownText, attachmentNames, candidates }) {
  const prompt = [
    'A student emailed their physics tutor a completed homework assignment as a',
    'PDF/image attachment. Work out which of their outstanding assignments it is.',
    '',
    'Here is what the student wrote (quoted text from earlier messages in the',
    'thread has been stripped, so this is their own words only):',
    '--- student message ---',
    ownText || '(empty)',
    '--- end student message ---',
    '',
    `Attached file name(s): ${attachmentNames.join(', ') || '(none)'}`,
    '',
    "The student's outstanding assignments, one per line, as",
    '"<assignmentId> | <source material> | <what Mark asked for>":',
    ...candidates.map(c => `${c.id} | ${c.name} | ${c.notes || '(no note)'}`),
    '',
    'Set assignmentId to the id of the one this email is turning in. A chapter',
    'number, a topic, or a book name in the message text or the file name is',
    'usually the deciding signal. If nothing distinguishes one candidate from',
    'another, set assignmentId to the empty string rather than guessing.',
    '',
    'Also set isSubmission: true if this email is turning in completed work,',
    'false if it is clearly something else (a question about the material, a',
    'scheduling request, an unrelated attachment like a permission slip). An',
    'empty or minimal body with an attachment IS consistent with a submission.',
    '',
    'reason: one short sentence naming the signal you used.',
  ].join('\n')

  const schema = CHOOSE_SCHEMA.replace(/'/g, "''")
  const p = prompt.replace(/'/g, "''")
  const isWin = process.platform === 'win32'
  const base = `claude -p --output-format json --json-schema '${schema}' '${p}'`
  const cmd = isWin ? `'' | ${base}` : `${base} < /dev/null`

  const { stdout } = await execAsync(cmd, {
    shell: isWin ? 'pwsh.exe' : undefined,
    timeout: 120000,
    cwd: ROOT,
    maxBuffer: 10 * 1024 * 1024,
  })
  const envelope = JSON.parse(stdout.trim())
  const result = envelope.structured_output || envelope
  if (typeof result.assignmentId !== 'string' || typeof result.isSubmission !== 'boolean') {
    throw new Error(`No structured output from claude: ${stdout.slice(0, 200)}`)
  }
  // Never let the model invent an id.
  if (result.assignmentId && !candidates.some(c => c.id === result.assignmentId)) {
    return { ...result, assignmentId: '' }
  }
  return result
}

// Strips quoted history so the model sees only what the student typed. Gmail
// quotes with "> " and prefaces the block with "On <date> ... wrote:".
function ownWordsOnly(text) {
  const lines = (text || '').split('\n')
  const out = []
  for (const line of lines) {
    if (/^\s*>/.test(line)) continue
    if (/^\s*On .*wrote:\s*$/.test(line)) break
    out.push(line)
  }
  return out.join('\n').trim()
}

// ── Deterministic matching ──────────────────────────────────────────────────

// Assignments the student takes inside the portal (digitized F=ma exams and
// weekly F=ma homework sets) can't be turned in as an email attachment, so
// they're never candidates for filing one. Same source of truth the assignment
// email uses to decide those get a portal link instead of a PDF link.
async function portalOnlyProblemIds() {
  const [{ data: examRows }, { data: hwRows }] = await Promise.all([
    supabase.from('fma_questions').select('exam_id'),
    supabase.from('fma_homework_questions').select('set_id'),
  ])
  return new Set([
    ...(examRows || []).map(r => r.exam_id),
    ...(hwRows || []).map(r => r.set_id),
  ].filter(Boolean))
}

// Human-readable name for each candidate, so the model has something to match
// "Ch. 11" against. Handout-backed assignments are the common case; anything
// else falls back to its problem id.
async function describeCandidates(rows) {
  const ids = [...new Set(rows.map(r => r.problem_id))]
  const { data: handouts } = await supabase.from('handouts').select('id, name').in('id', ids)
  const nameById = new Map((handouts || []).map(h => [h.id, h.name]))
  return rows.map(r => ({
    id: r.id,
    problem_id: r.problem_id,
    name: nameById.get(r.problem_id) || r.problem_id,
    notes: r.notes || '',
  }))
}

async function matchCandidate(senderEmail, threadText, { ownText = '', attachmentNames = [] } = {}) {
  const { data: contacts, error: contactErr } = await supabase
    .from('student_contacts').select('student_id').ilike('email', senderEmail)
  if (contactErr) throw new Error(contactErr.message)
  const studentIds = [...new Set((contacts || []).map(c => c.student_id))]
  if (studentIds.length === 0) return { result: 'ignored', reason: 'unknown_sender' }
  if (studentIds.length > 1) return { result: 'ambiguous', reason: 'sender_linked_to_multiple_students', studentIds }
  const studentId = studentIds[0]

  // Only 'assigned' (not yet completed/reviewed) rows are real candidates — a
  // handout can be re-assigned after a prior round was already completed,
  // which would otherwise match the stale, already-done row too.
  //
  // Not gated on requires_submission: in practice handout-based assignments
  // aren't reliably flagged that way, but an 'assigned' row is still the right
  // signal that something is outstanding.
  const { data: outstandingRaw, error: oErr } = await supabase
    .from('assignments').select('id, status, problem_id, notes')
    .eq('student_id', studentId).eq('status', 'assigned')
  if (oErr) throw new Error(oErr.message)

  const portalOnly = await portalOnlyProblemIds()
  const outstanding = (outstandingRaw || []).filter(a => !portalOnly.has(a.problem_id))

  if (outstanding.length === 0) {
    return { result: 'ambiguous', reason: 'no_outstanding_assignments', studentId, candidates: [] }
  }
  if (outstanding.length === 1) {
    return { result: 'match', confidence: 'medium', reason: 'sole_outstanding', studentId, assignment: outstanding[0] }
  }

  // Narrow by handout PDFs linked anywhere in the thread. This only decides
  // the match when it leaves exactly one candidate — the assignment email
  // lists the whole problem set, so normally every open handout is linked and
  // this narrows nothing.
  const handoutFilenames = [...new Set(
    [...threadText.matchAll(/handout-pdfs\/([\w.-]+\.pdf)/gi)].map(m => m[1])
  )]
  let pool = outstanding
  if (handoutFilenames.length > 0) {
    const orFilter = handoutFilenames.map(f => `pdf_url.ilike.%${f}%`).join(',')
    const { data: handouts, error: hErr } = await supabase.from('handouts').select('id').or(orFilter)
    if (hErr) throw new Error(hErr.message)
    const linkedIds = new Set((handouts || []).map(h => h.id))
    const linked = outstanding.filter(a => linkedIds.has(a.problem_id))
    if (linked.length === 1) {
      return { result: 'match', confidence: 'high', reason: 'handout_link', studentId, assignment: linked[0] }
    }
    if (linked.length > 1) pool = linked
  }

  // Still more than one. Let the model read the student's own words and the
  // attachment name and pick.
  const candidates = await describeCandidates(pool)
  const choice = await chooseAssignment({ ownText: ownWordsOnly(ownText), attachmentNames, candidates })
  if (choice.isSubmission && choice.assignmentId) {
    return {
      result: 'match',
      confidence: 'model',
      reason: `model_choice: ${choice.reason}`,
      studentId,
      assignment: pool.find(a => a.id === choice.assignmentId),
      judged: { isSubmission: true, reason: choice.reason },
    }
  }
  return {
    result: 'ambiguous',
    reason: choice.isSubmission
      ? `multiple_outstanding (model could not tell: ${choice.reason})`
      : `not_a_submission: ${choice.reason}`,
    studentId,
    candidates,
  }
}

// ── Filing / notifying ──────────────────────────────────────────────────────

function magicBytesOk(mimeType, bytes) {
  if (mimeType === 'application/pdf') return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46
  if (mimeType === 'image/jpeg') return bytes[0] === 0xFF && bytes[1] === 0xD8
  if (mimeType === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47
  return false
}

async function fileAttachments(token, { messageId, studentId, assignmentId, attachments }) {
  const submissions = []
  for (const att of attachments) {
    const { data } = await gmail(token, `/messages/${messageId}/attachments/${att.attachmentId}`)
    const bytes = b64urlDecode(data)
    if (!magicBytesOk(att.mimeType, bytes)) {
      throw new Error(`attachment ${att.filename} failed magic-byte check for ${att.mimeType}`)
    }
    const ext = ACCEPTED_MIME_EXT[att.mimeType]
    const path = `${studentId}/${assignmentId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
    const { error: upErr } = await supabase.storage.from('submissions')
      .upload(path, bytes, { contentType: att.mimeType, upsert: false })
    if (upErr) throw new Error(`upload failed for ${att.filename}: ${upErr.message}`)
    const { data: { publicUrl } } = supabase.storage.from('submissions').getPublicUrl(path)
    submissions.push({ url: publicUrl, file_name: att.filename })
  }

  const res = await fetch(`${FUNCTIONS_URL}/notify-submission-admin`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_id: studentId, assignment_id: assignmentId, submissions }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`notify-submission-admin failed: ${res.status} ${JSON.stringify(body)}`)
  return body
}

async function notifyMark(subject, bodyLines) {
  if (DRY_RUN) { await log(`[dry-run] would email Mark: ${subject}`); return }
  await fetch(`${FUNCTIONS_URL}/send-email`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: MARK_EMAIL, subject, body: bodyLines.join('\n') }),
  }).catch(e => log(`[notify-mark] send-email call failed: ${e.message}`))
}

async function setLabel(token, messageId, labelId) {
  if (DRY_RUN) return
  await gmail(token, `/messages/${messageId}/modify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addLabelIds: [labelId] }),
  })
}

// ── Main pass ────────────────────────────────────────────────────────────

async function run() {
  await log(DRY_RUN ? '=== hw-email-agent dry run ===' : '=== hw-email-agent pass ===')
  const token = await getGmailAccessToken()
  const labelIds = await ensureLabels(token)

  const query = [
    'has:attachment',
    '(filename:pdf OR filename:jpg OR filename:jpeg OR filename:png)',
    '{to:mark@eichenlaubphysics.com to:mark.d.eichenlaub@gmail.com}',
    '-in:sent',
    '-label:HW-Filed', '-label:HW-Flagged', '-label:HW-Ignored',
    'newer_than:90d',
  ].join(' ')

  const list = await gmail(token, `/messages?${new URLSearchParams({ q: query, maxResults: '25' })}`)
  const messages = list.messages || []
  if (messages.length === 0) { await log('No candidate emails.'); return }
  await log(`Found ${messages.length} candidate email(s).`)

  for (const { id: messageId } of messages) {
    try {
      const msg = await gmail(token, `/messages/${messageId}?format=full`)
      const senderEmail = extractEmail(headerValue(msg.payload.headers, 'From'))
      const subject = headerValue(msg.payload.headers, 'Subject')

      let ownText = ''
      const attachments = []
      walkParts(msg.payload, { onText: t => { ownText += t }, onAttachment: a => attachments.push(a) })
      if (attachments.length === 0) { await log(`${messageId}: matched search but no accepted attachment parts, skipping`); continue }

      const thread = await gmail(token, `/threads/${msg.threadId}?format=full`)
      let threadText = ''
      for (const m of thread.messages || []) walkParts(m.payload, { onText: t => { threadText += t + '\n' }, onAttachment: () => {} })

      const match = await matchCandidate(senderEmail, threadText, {
        ownText,
        attachmentNames: attachments.map(a => a.filename),
      })
      await log(`${messageId} (${senderEmail}, "${subject}"): ${JSON.stringify(match)}`)

      if (match.result === 'ignored') {
        await setLabel(token, messageId, labelIds['HW-Ignored'])
        continue
      }

      if (match.result === 'ambiguous') {
        await setLabel(token, messageId, labelIds['HW-Flagged'])
        await notifyMark(
          `Needs manual filing: email from ${senderEmail} didn't clearly match an assignment`,
          [
            `Subject: ${subject}`,
            `From: ${senderEmail}`,
            `Reason: ${match.reason}`,
            ...((match.candidates || []).length
              ? ['', 'Outstanding assignments it could have been:',
                 ...match.candidates.map(c => `  - ${c.name || c.problem_id}${c.notes ? ` — "${c.notes}"` : ''}`)]
              : []),
            '',
            `Thread: https://mail.google.com/mail/u/0/#all/${msg.threadId}`,
          ],
        )
        continue
      }

      // match.result === 'match'. A model-chosen match already answered the
      // "is this even a submission" question, so don't ask twice.
      const verdict = match.judged || await judgeIsSubmission(ownText)
      await log(`${messageId}: plausibility verdict ${JSON.stringify(verdict)}`)
      if (!verdict.isSubmission) {
        await setLabel(token, messageId, labelIds['HW-Flagged'])
        await notifyMark(
          `Needs manual filing: email from ${senderEmail} matched an assignment but didn't read like a submission`,
          [
            `Subject: ${subject}`,
            `From: ${senderEmail}`,
            `Matched assignment: ${match.assignment.id} (${match.reason})`,
            `Model's reason: ${verdict.reason}`,
            '',
            `Thread: https://mail.google.com/mail/u/0/#all/${msg.threadId}`,
          ],
        )
        continue
      }

      if (DRY_RUN) {
        await log(`[dry-run] would file ${attachments.length} attachment(s) against assignment ${match.assignment.id}`)
        continue
      }

      await fileAttachments(token, {
        messageId, studentId: match.studentId, assignmentId: match.assignment.id, attachments,
      })
      await setLabel(token, messageId, labelIds['HW-Filed'])
      await log(`${messageId}: filed against assignment ${match.assignment.id}`)
    } catch (e) {
      await log(`${messageId}: FAILED — ${e.message}`)
      try {
        await setLabel(token, messageId, labelIds['HW-Flagged'])
        await notifyMark(`Homework-email agent error processing a message`, [
          `Message id: ${messageId}`,
          `Error: ${e.message}`,
        ])
      } catch (e2) {
        await log(`${messageId}: also failed to flag/notify — ${e2.message}`)
      }
    }
  }
}

// Matching only, no Gmail: `--match-test --from <email> --text-file <path>`.
async function matchTest() {
  const from = argValue('--from').toLowerCase()
  if (!from) { console.error('--match-test needs --from <email>'); process.exit(1) }
  const textFile = argValue('--text-file')
  const text = textFile ? await readFile(resolve(textFile), 'utf8') : argValue('--text')
  const files = argValue('--files').split(',').map(s => s.trim()).filter(Boolean)
  const match = await matchCandidate(from, text || '', { ownText: text || '', attachmentNames: files })
  console.log(JSON.stringify(match, null, 2))
}

if (MATCH_TEST) {
  await matchTest().catch(e => { console.error(e.stack || e.message); process.exit(1) })
} else {
  await run().catch(e => log(`FATAL: ${e.stack || e.message}`))
  await log(DRY_RUN ? '=== dry run done ===' : '=== pass done ===')
}
