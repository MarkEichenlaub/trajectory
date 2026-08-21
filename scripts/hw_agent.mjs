// Helper CLI for the /build-homework agent: reads and updates homework-packet
// build requests (handout rows whose status isn't 'active') with the service
// role, and uploads built PDFs to the handout-pdfs bucket.
//
// Usage:
//   node scripts/hw_agent.mjs pending
//       Print all rows with status requested/revise, oldest first, as JSON.
//   node scripts/hw_agent.mjs get <id>
//       Print one row as JSON (any status; errors if missing).
//   node scripts/hw_agent.mjs list
//       Print {id, status, name, request} for every packet row (any status),
//       for callers that need to check what's already been built.
//   node scripts/hw_agent.mjs create --student <id> --lesson "MCH04: ..."
//       --problems <id1,id2,...> [--title "..."] [--instructions "..."]
//       Insert a build request the way the portal's "Create assignment…" button
//       does, and print the new row id. For batching packets without the UI.
//   node scripts/hw_agent.mjs set <id> [--status S] [--clear-notes]
//       [--name "..."] [--description "..."] [--notes "..."] [--request-json <file>]
//       Update columns on a row. --request-json replaces the request payload
//       with the JSON object in <file> (e.g. to reorder problem_ids).
//   node scripts/hw_agent.mjs upload <id> <pdfPath> [--solutions <solPdfPath>]
//       Upload the packet PDF (and optional solutions PDF) to handout-pdfs as
//       <id>.pdf / <id>-sol.pdf and set pdf_url / solution_url. URLs carry a
//       ?v=<epoch> cache-buster so re-uploads show fresh in the portal preview.
//   node scripts/hw_agent.mjs wait <id> [--interval <seconds>]
//       Poll the row until its status leaves 'draft' (or the row is deleted),
//       then print {"status": ...} and exit. Used to watch for Mark's review.
//
// Reads VITE_SUPABASE_SERVICE_KEY from trajectory/.env (same as the seed scripts).

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'

function readServiceKey() {
  if (process.env.SUPABASE_SERVICE_KEY) return process.env.SUPABASE_SERVICE_KEY
  const env = readFileSync(join(__dirname, '..', '.env'), 'utf8')
  const m = env.match(/VITE_SUPABASE_SERVICE_KEY\s*=\s*(.+)/)
  if (!m) throw new Error('VITE_SUPABASE_SERVICE_KEY not found in .env')
  return m[1].trim().replace(/^['"]|['"]$/g, '')
}

const supabase = createClient(SUPABASE_URL, readServiceKey(), { auth: { persistSession: false } })

function arg(flag) {
  const i = process.argv.indexOf(flag)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const hasFlag = flag => process.argv.includes(flag)

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function getRow(id) {
  const { data, error } = await supabase.from('handouts').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

async function cmdPending() {
  const { data, error } = await supabase
    .from('handouts').select('*')
    .in('status', ['requested', 'revise'])
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  console.log(JSON.stringify(data || [], null, 2))
}

async function cmdGet(id) {
  const row = await getRow(id)
  if (!row) throw new Error(`No handout row with id ${id}`)
  console.log(JSON.stringify(row, null, 2))
}

async function cmdList() {
  const { data, error } = await supabase
    .from('handouts').select('id,status,name,request')
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  console.log(JSON.stringify((data || []).filter(r => r.request), null, 2))
}

// Mirrors AdminApp's handleCreatePacket so a CLI-made request is indistinguishable
// from one made with the portal's "Create assignment…" button.
async function cmdCreate() {
  const studentId = arg('--student')
  const lesson = arg('--lesson') || ''
  const problems = (arg('--problems') || '').split(',').map(s => s.trim()).filter(Boolean)
  if (!studentId || !problems.length) {
    throw new Error('Usage: create --student <id> --lesson "MCH04: ..." --problems <id1,id2,...>')
  }
  const { data: student, error: sErr } = await supabase
    .from('students').select('id,name').eq('id', studentId).maybeSingle()
  if (sErr) throw new Error(sErr.message)
  if (!student) throw new Error(`No student with id ${studentId}`)

  const lessonCode = (lesson.match(/^([A-Za-z][A-Za-z0-9]{0,4}\d{1,3})\b/) || [])[1] || ''
  const title = arg('--title') || null
  const id = `hwset-${Date.now()}`
  const { error } = await supabase.from('handouts').insert({
    id,
    name: title || `${lesson || 'Homework'} packet for ${student.name}`,
    source: 'Eichenlaub Physics',
    resource_type: 'handout',
    description: '',
    topics: ['Mechanics'],
    tags: lessonCode ? [lessonCode] : [],
    pdf_url: '',
    solution_url: '',
    year: 0,
    status: 'requested',
    review_notes: '',
    request: {
      student_id: student.id,
      student_name: student.name,
      problem_ids: problems,
      lesson,
      title,
      instructions: arg('--instructions') || '',
      requested_at: new Date().toISOString(),
    },
  })
  if (error) throw new Error(error.message)
  console.log(id)
}

async function cmdSet(id) {
  const updates = {}
  if (arg('--status')) updates.status = arg('--status')
  if (arg('--name')) updates.name = arg('--name')
  if (arg('--description')) updates.description = arg('--description')
  if (arg('--notes')) updates.review_notes = arg('--notes')
  if (hasFlag('--clear-notes')) updates.review_notes = ''
  if (arg('--request-json')) {
    updates.request = JSON.parse(readFileSync(arg('--request-json'), 'utf8'))
  }
  if (Object.keys(updates).length === 0) throw new Error('Nothing to update — pass --status/--name/...')
  const { error } = await supabase.from('handouts').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
  console.log(`Updated ${id}: ${JSON.stringify(updates)}`)
}

async function uploadPdf(storageKey, pdfPath) {
  const bytes = readFileSync(pdfPath)
  if (bytes.slice(0, 4).toString('latin1') !== '%PDF') {
    throw new Error(`${pdfPath} doesn't look like a PDF`)
  }
  const { error } = await supabase.storage
    .from('handout-pdfs')
    .upload(storageKey, bytes, { contentType: 'application/pdf', upsert: true })
  if (error) throw new Error(`upload ${storageKey}: ${error.message}`)
  const { data } = supabase.storage.from('handout-pdfs').getPublicUrl(storageKey)
  // Cache-buster: re-uploads keep the same storage key, so the portal's iframe
  // preview would otherwise show the stale cached PDF.
  return `${data.publicUrl}?v=${Date.now()}`
}

async function cmdUpload(id, pdfPath) {
  if (!pdfPath) throw new Error('Usage: upload <id> <pdfPath> [--solutions <solPdfPath>]')
  const updates = { pdf_url: await uploadPdf(`${id}.pdf`, pdfPath) }
  const solPath = arg('--solutions')
  if (solPath) updates.solution_url = await uploadPdf(`${id}-sol.pdf`, solPath)
  const { error } = await supabase.from('handouts').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
  console.log(`Uploaded ${id}.pdf${solPath ? ` + ${id}-sol.pdf` : ''}`)
}

async function cmdWait(id) {
  const interval = Math.max(5, parseInt(arg('--interval') || '20', 10)) * 1000
  for (;;) {
    const row = await getRow(id)
    if (!row) { console.log(JSON.stringify({ status: 'deleted' })); return }
    if (row.status !== 'draft') {
      console.log(JSON.stringify({ status: row.status, review_notes: row.review_notes || '' }))
      return
    }
    await sleep(interval)
  }
}

const [, , cmd, id] = process.argv
const commands = {
  pending: () => cmdPending(),
  get: () => cmdGet(id),
  create: () => cmdCreate(),
  list: () => cmdList(),
  set: () => cmdSet(id),
  upload: () => cmdUpload(id, process.argv[4]),
  wait: () => cmdWait(id),
}

if (!commands[cmd]) {
  console.error('Usage: node scripts/hw_agent.mjs <pending|get|set|upload|wait> [args]')
  process.exit(1)
}
commands[cmd]().catch(e => { console.error('FAILED:', e.message); process.exit(1) })
