/**
 * Cuts a student's whole-test scan up by question.
 *
 * A student uploads one set of photos of their scratch paper at the end of a
 * practice exam (they used to be asked, in effect, for one upload per question,
 * and unsurprisingly nobody ever did it). This reads each page, works out which
 * question each patch of work belongs to, and records a box for it. The review
 * screen then shows the problem, the answer they gave, the key, the solution,
 * and what they actually wrote -- per question, without anyone sorting paper.
 *
 * Nothing is re-cropped into new files. A box is four fractions of the page,
 * and the page image is drawn through it in the browser, so a box the model got
 * wrong is four numbers to fix rather than an image to regenerate.
 *
 * The reading goes through Mark's Claude subscription via `claude -p` (never
 * API credits), which is why this runs here rather than in an edge function.
 *
 * Run via `node scripts/fma-work-splitter.mjs`, fired by a Windows Scheduled
 * Task every ~10 minutes (scripts/setup-fma-work-splitter-task.ps1). Each pass
 * is a fresh process, so a crash or hang in one can never stop the next.
 *
 *   --dry-run         show what it would read, call nothing
 *   --attempt <id>    re-split one attempt, discarding any boxes it already has
 *   --verbose         print each region as it is found
 */
import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile, writeFile, unlink, mkdir, appendFile, readdir } from 'fs/promises'
import { resolve, dirname, extname, basename, join } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'

const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const DRY_RUN = process.argv.includes('--dry-run')
const VERBOSE = process.argv.includes('--verbose')
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
const SERVICE_KEY = env.VITE_SUPABASE_SERVICE_KEY
const BUCKET = 'fma-scratch-work'
const MAX_PER_PASS = 4
// Three goes at a page is enough to ride out a transient failure; past that the
// scan itself is the problem (a photo of a thumb, a page of pure doodles) and
// re-reading it every ten minutes forever helps nobody.
const MAX_TRIES = 3
// Boxes come back tight against the writing. A little air on every side costs
// nothing and stops a descender or a stray exponent being sliced off.
const PAD = 0.015

if (!SERVICE_KEY) { console.error('ERROR: VITE_SUPABASE_SERVICE_KEY not found in .env'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const LOG_FILE = resolve(ROOT, 'logs', 'fma-work-splitter.log')
async function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`
  console.log(stamped)
  try {
    await mkdir(dirname(LOG_FILE), { recursive: true })
    await appendFile(LOG_FILE, stamped + '\n')
  } catch { /* logging must never be the thing that fails a pass */ }
}

// ── Local image tools ───────────────────────────────────────────────────────

// Tries a command and says whether it exists, so the PDF path can fall back
// across the three rasterizers that might be installed on a given laptop.
async function has(cmd) {
  try {
    await execAsync(process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`)
    return true
  } catch {
    return false
  }
}

async function imageSize(file) {
  try {
    const { stdout } = await execAsync(`magick identify -format "%w %h" "${file}[0]"`)
    const [w, h] = stdout.trim().split(/\s+/).map(Number)
    if (w > 0 && h > 0) return { width: w, height: h }
  } catch { /* fall through */ }
  try {
    const py = `import sys;from PIL import Image;im=Image.open(sys.argv[1]);print(im.width,im.height)`
    const { stdout } = await execAsync(`python -c "${py}" "${file}"`)
    const [w, h] = stdout.trim().split(/\s+/).map(Number)
    if (w > 0 && h > 0) return { width: w, height: h }
  } catch { /* fall through */ }
  return null
}

// A PDF can't be shown as an <img>, and a scanner app is a perfectly ordinary
// way for a student to send four sheets. Rasterize to PNGs and carry on as if
// they had sent photos. Returns the generated file paths, in page order.
async function rasterizePdf(pdfPath, outDir) {
  await mkdir(outDir, { recursive: true })
  const stem = join(outDir, 'page')
  if (await has('pdftoppm')) {
    await execAsync(`pdftoppm -r 150 -png "${pdfPath}" "${stem}"`)
  } else if (await has('magick')) {
    await execAsync(`magick -density 150 "${pdfPath}" "${stem}-%d.png"`)
  } else {
    const py = [
      'import sys, fitz',
      'doc = fitz.open(sys.argv[1])',
      'for i, page in enumerate(doc):',
      '    page.get_pixmap(dpi=150).save(sys.argv[2] + "-" + str(i + 1) + ".png")',
    ].join('\n')
    const script = resolve(tmpdir(), `pdf2png-${randomUUID()}.py`)
    await writeFile(script, py)
    try {
      await execAsync(`python "${script}" "${pdfPath}" "${stem}"`)
    } finally {
      await unlink(script).catch(() => {})
    }
  }
  const files = (await readdir(outDir))
    .filter(f => f.toLowerCase().endsWith('.png'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  return files.map(f => join(outDir, f))
}

// ── Storage ─────────────────────────────────────────────────────────────────

async function downloadPage(storagePath) {
  const { data: blob, error } = await supabase.storage.from(BUCKET).download(storagePath)
  if (error) throw new Error(error.message)
  const out = resolve(tmpdir(), `fma-work-${randomUUID()}${extname(storagePath) || '.jpg'}`)
  await writeFile(out, Buffer.from(await blob.arrayBuffer()))
  return out
}

// ── The claude -p call ──────────────────────────────────────────────────────

const REGION_SCHEMA = JSON.stringify({
  type: 'object',
  properties: {
    regions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question_num: { type: 'integer' },
          x: { type: 'number' },
          y: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' },
          labeled: { type: 'boolean' },
          note: { type: 'string' },
        },
        required: ['question_num', 'x', 'y', 'width', 'height', 'labeled'],
      },
    },
    page_note: { type: 'string' },
  },
  required: ['regions'],
})

function buildPrompt({ imagePath, width, height, examName, questionNums, answered }) {
  return [
    "You are looking at ONE page of a student's handwritten scratch work from a",
    `practice ${examName}, a 25-question multiple-choice physics exam.`,
    '',
    `Read the image at: ${imagePath}`,
    width ? `The page is ${width} pixels wide and ${height} tall.` : '',
    '',
    `The exam's questions are numbered ${questionNums[0]} to ${questionNums[questionNums.length - 1]}.`,
    answered.length
      ? `The student recorded an answer for questions: ${answered.join(', ')}. Work for one of those is far more likely than work for a question they left blank, but blank ones do get attempted on paper, so don't rule them out.`
      : '',
    '',
    'YOUR JOB',
    'Find each question whose work appears on this page, and say where that work',
    'sits. Give coordinates as PERCENTAGES of the page, 0 to 100, measured from',
    'the top-left corner: x and y are the corner of the box, width and height are',
    'its size.',
    '',
    'For each region:',
    '  - question_num: the exam question the work belongs to.',
    '  - x, y, width, height: a box around ALL of that work, including the',
    '    question number the student wrote next to it.',
    '  - labeled: true when the question number is actually written on the page',
    '    beside that work; false when you worked out which question it is from',
    '    the physics itself.',
    '  - note: one short sentence, and only when something is genuinely doubtful.',
    '',
    'RULES',
    '  - Be generous with every box. A bit of extra white space costs nothing;',
    '    slicing off the last line of algebra ruins it.',
    '  - A question worked in two separate places on the page gets two regions.',
    "  - Don't let one box swallow another question's work. Where the page is in",
    '    columns, treat the columns separately.',
    '  - If the whole page is one question, return a single region covering it.',
    '  - If you cannot tell whose work any of it is, return an empty list rather',
    '    than guessing. A wrong attribution is worse than a missing one.',
    '  - Only return question numbers that exist on this exam.',
    '',
    'Return JSON matching the schema. No prose.',
  ].filter(Boolean).join('\n')
}

async function runClaude(prompt) {
  const schema = REGION_SCHEMA.replace(/'/g, "''")
  const p = prompt.replace(/'/g, "''")
  const isWin = process.platform === 'win32'
  const base = `claude -p --allowedTools Read --output-format json --json-schema '${schema}' '${p}'`
  const cmd = isWin ? `'' | ${base}` : `${base} < /dev/null`
  // Launched from inside a Claude Code session, the parent injects
  // ANTHROPIC_API_KEY and the child bills API credits instead of the
  // subscription -- and then dies on "Credit balance is too low". Strip it.
  const childEnv = { ...process.env }
  delete childEnv.ANTHROPIC_API_KEY
  delete childEnv.CLAUDECODE

  const { stdout } = await execAsync(cmd, {
    shell: isWin ? 'pwsh.exe' : undefined,
    timeout: 600000,
    cwd: ROOT,
    env: childEnv,
    maxBuffer: 10 * 1024 * 1024,
  })
  let envelope
  try { envelope = JSON.parse(stdout.trim()) }
  catch { throw new Error(`Could not parse claude output: ${stdout.slice(0, 300)}`) }
  const result = envelope.structured_output || envelope
  if (!Array.isArray(result.regions)) {
    throw new Error(`No structured output from claude (is_error=${envelope.is_error}): ${stdout.slice(0, 300)}`)
  }
  return result
}

// Percentages in, fractions out: padded, clamped to the page, and dropped
// outright if what's left is too small to be anybody's working.
function normalizeBox(r) {
  const x0 = Math.min(r.x, r.x + r.width) / 100
  const y0 = Math.min(r.y, r.y + r.height) / 100
  const w0 = Math.abs(r.width) / 100
  const h0 = Math.abs(r.height) / 100

  const x = Math.max(0, x0 - PAD)
  const y = Math.max(0, y0 - PAD)
  const w = Math.min(1 - x, w0 + PAD * 2)
  const h = Math.min(1 - y, h0 + PAD * 2)
  if (!(w > 0.02 && h > 0.01)) return null
  return { x, y, w, h }
}

// ── Pages ───────────────────────────────────────────────────────────────────

// Gets every page of an attempt into a local PNG/JPEG with known dimensions,
// splitting any PDF into one row per sheet so the review screen only ever has
// plain images to draw.
async function materializePages(attempt, pages) {
  const out = []
  for (const page of pages) {
    const local = await downloadPage(page.storage_path)

    if (extname(page.storage_path).toLowerCase() !== '.pdf') {
      const size = page.width && page.height
        ? { width: page.width, height: page.height }
        : await imageSize(local)
      if (size && (!page.width || !page.height)) {
        await supabase.from('fma_scratch_pages')
          .update({ width: size.width, height: size.height }).eq('id', page.id)
      }
      out.push({ ...page, ...(size || {}), local })
      continue
    }

    // A PDF becomes N image rows at the same position in the order, and its own
    // row goes away. The PDF object stays in the bucket: it is the original.
    const dir = resolve(tmpdir(), `fma-pdf-${randomUUID()}`)
    const rendered = await rasterizePdf(local, dir)
    await log(`  page ${page.page_index}: PDF -> ${rendered.length} image${rendered.length === 1 ? '' : 's'}`)

    let sub = 0
    for (const file of rendered) {
      const size = await imageSize(file)
      const path = `${attempt.student_id}/${attempt.id}/p${page.page_index}-pdf${sub}.png`
      const { error } = await supabase.storage
        .from(BUCKET).upload(path, await readFile(file), { upsert: true, contentType: 'image/png' })
      if (error) throw new Error(error.message)
      const { data: row, error: rowErr } = await supabase.from('fma_scratch_pages').insert({
        attempt_id: attempt.id,
        // Keeps the rendered sheets in order after the pages before them and
        // before the pages after: page 2 of a PDF at index 3 lands at 3.001.
        page_index: page.page_index * 1000 + sub,
        storage_path: path,
        file_name: `${basename(page.file_name || 'scan.pdf')} p${sub + 1}`,
        width: size?.width ?? null, height: size?.height ?? null,
      }).select().single()
      if (rowErr) throw new Error(rowErr.message)
      out.push({ ...row, local: file })
      sub++
    }
    await supabase.from('fma_scratch_pages').delete().eq('id', page.id)
    await unlink(local).catch(() => {})
  }
  return out
}

// ── Main pass ───────────────────────────────────────────────────────────────

async function splitAttempt(attempt) {
  const { data: pagesRaw } = await supabase
    .from('fma_scratch_pages').select('*').eq('attempt_id', attempt.id).order('page_index')
  if (!pagesRaw?.length) {
    await log(`${attempt.id}: no pages uploaded, nothing to split.`)
    return
  }

  const { data: questions } = await supabase
    .from('fma_questions').select('id, question_num').eq('exam_id', attempt.exam_id).order('question_num')
  if (!questions?.length) throw new Error(`no digitized questions for ${attempt.exam_id}`)
  const idByNum = new Map(questions.map(q => [q.question_num, q.id]))

  const { data: answers } = await supabase
    .from('fma_attempt_answers').select('question_id, selected_choice').eq('attempt_id', attempt.id)
  const numById = new Map(questions.map(q => [q.id, q.question_num]))
  const answered = (answers || [])
    .filter(a => a.selected_choice)
    .map(a => numById.get(a.question_id))
    .filter(Boolean)
    .sort((a, b) => a - b)

  const { data: examRow } = await supabase
    .from('handouts').select('name').eq('id', attempt.exam_id).maybeSingle()
  const examName = examRow?.name || attempt.exam_id

  const pages = await materializePages(attempt, pagesRaw)
  const rows = []
  const failures = []

  for (const page of pages) {
    try {
      const result = await runClaude(buildPrompt({
        imagePath: page.local,
        width: page.width, height: page.height,
        examName,
        questionNums: questions.map(q => q.question_num),
        answered,
      }))
      for (const r of result.regions) {
        const qid = idByNum.get(r.question_num)
        if (!qid) continue
        const box = normalizeBox(r)
        if (!box) continue
        rows.push({
          attempt_id: attempt.id, question_id: qid, page_index: page.page_index,
          ...box,
          labeled: r.labeled !== false,
          note: r.note || result.page_note || null,
          source: 'ai',
        })
        if (VERBOSE) {
          await log(`    q${r.question_num} p${page.page_index} ` +
            `[${box.x.toFixed(2)} ${box.y.toFixed(2)} ${box.w.toFixed(2)} ${box.h.toFixed(2)}]` +
            `${r.labeled === false ? ' (unlabeled)' : ''}`)
        }
      }
    } catch (e) {
      failures.push(`page ${page.page_index}: ${e.message}`)
      await log(`  ${attempt.id} page ${page.page_index} failed: ${e.message}`)
    } finally {
      await unlink(page.local).catch(() => {})
    }
  }

  if (failures.length === pages.length) {
    throw new Error(failures.join('; '))
  }

  // Replace rather than append: a re-run with --attempt should leave one set of
  // boxes, not two overlapping ones.
  await supabase.from('fma_question_work')
    .delete().eq('attempt_id', attempt.id).eq('source', 'ai')
  if (rows.length) {
    const { error } = await supabase.from('fma_question_work').insert(rows)
    if (error) throw new Error(error.message)
  }

  const covered = new Set(rows.map(r => r.question_id)).size
  await supabase.from('fma_attempts').update({
    work_split_at: new Date().toISOString(),
    work_split_error: failures.length ? failures.join('; ') : null,
    work_split_claimed_at: null,
  }).eq('id', attempt.id)

  await log(`${attempt.id}: ${rows.length} region${rows.length === 1 ? '' : 's'} across ` +
    `${pages.length} page${pages.length === 1 ? '' : 's'}, covering ${covered} of ${questions.length} questions.`)
}

async function run() {
  await log(DRY_RUN ? '=== fma-work-splitter dry run ===' : '=== fma-work-splitter pass ===')

  let pending
  if (ONLY_ATTEMPT) {
    const { data, error } = await supabase.from('fma_attempts').select('*').eq('id', ONLY_ATTEMPT)
    if (error) throw new Error(error.message)
    pending = data || []
    if (!pending.length) { await log(`No attempt ${ONLY_ATTEMPT}.`); return }
  } else {
    // Anything finished, with pages uploaded, that has never been split (or was
    // split before more pages arrived) and hasn't already failed its way out.
    const { data: candidates, error } = await supabase
      .from('fma_attempts')
      .select('*, fma_scratch_pages(id, created_at)')
      .in('status', ['submitted', 'graded'])
      .neq('mode', 'score_only')
      .lt('work_split_tries', MAX_TRIES)
      .order('submitted_at', { ascending: false })
      .limit(MAX_PER_PASS * 6)
    if (error) throw new Error(error.message)

    pending = (candidates || []).filter(a => {
      const pages = a.fma_scratch_pages || []
      if (!pages.length) return false
      if (!a.work_split_at) return true
      // A page added after the last split means there is new paper to read.
      return pages.some(p => new Date(p.created_at) > new Date(a.work_split_at))
    }).slice(0, MAX_PER_PASS)
  }

  if (!pending.length) { await log('Nothing to split.'); return }
  await log(`${pending.length} attempt${pending.length === 1 ? '' : 's'} to split.`)

  for (const attempt of pending) {
    if (DRY_RUN) {
      await log(`[dry run] would split ${attempt.id} (${attempt.student_id}, ${attempt.exam_id})`)
      continue
    }

    // Claim it before the minutes-long claude calls, so the other laptop's copy
    // of this task can't read the same pages at the same time.
    if (!ONLY_ATTEMPT) {
      const { data: claimed } = await supabase
        .from('fma_attempts')
        .update({
          work_split_claimed_at: new Date().toISOString(),
          work_split_tries: (attempt.work_split_tries || 0) + 1,
        })
        .eq('id', attempt.id)
        .or(`work_split_claimed_at.is.null,work_split_claimed_at.lt.${new Date(Date.now() - 60 * 60 * 1000).toISOString()}`)
        .select()
      if (!claimed?.length) { await log(`${attempt.id}: claimed elsewhere, skipping.`); continue }
    }

    try {
      await splitAttempt(attempt)
    } catch (e) {
      await log(`${attempt.id}: FAILED ${e.message}`)
      await supabase.from('fma_attempts')
        .update({ work_split_error: e.message, work_split_claimed_at: null })
        .eq('id', attempt.id)
    }
  }
}

run().catch(async e => {
  await log(`FATAL ${e.stack || e.message}`)
  process.exit(1)
})
