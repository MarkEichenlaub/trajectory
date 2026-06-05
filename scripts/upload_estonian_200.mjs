import { createClient } from '@supabase/supabase-js'
import { readFileSync, createReadStream, statSync } from 'fs'
import { request } from 'https'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(__dirname, '../.env'), 'utf8')
    .split('\n')
    .find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
    ?.split('=').slice(1).join('=').trim()

if (!SERVICE_KEY) { console.error('Could not read service key'); process.exit(1) }

const PDF_PATH = 'G:\\My Drive\\references\\200EstonianProblems-1.pdf'
const STORAGE_NAME = 'estonian-200-1.pdf'
const HANDOUT_ID = 'estonian-200-1'
const SOURCE = 'Estonian Physics Olympiad'

const fileSize = statSync(PDF_PATH).size
console.log(`File size: ${Math.round(fileSize / 1024 / 1024 * 10) / 10} MB`)

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

function uploadViaHttps() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/storage/v1/object/handout-pdfs/${STORAGE_NAME}`)
    let uploaded = 0
    let lastPct = -1

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/pdf',
        'Content-Length': fileSize,
        'x-upsert': 'true',
      },
      timeout: 900000,
    }

    const req = request(options, (res) => {
      let body = ''
      res.on('data', d => body += d)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('\nUpload successful:', res.statusCode)
          resolve(body)
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`))
        }
      })
    })

    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')) })

    const stream = createReadStream(PDF_PATH, { highWaterMark: 2 * 1024 * 1024 })
    stream.on('data', chunk => {
      uploaded += chunk.length
      const pct = Math.floor(uploaded / fileSize * 100)
      if (pct !== lastPct && pct % 5 === 0) {
        process.stdout.write(`\r  ${pct}% (${Math.round(uploaded/1024/1024)}/${Math.round(fileSize/1024/1024)} MB)`)
        lastPct = pct
      }
    })
    stream.pipe(req)
  })
}

console.log('Uploading PDF...')
try {
  await uploadViaHttps()
} catch (e) {
  console.error('\nUpload failed:', e.message)
  process.exit(1)
}

const { data } = supabase.storage.from('handout-pdfs').getPublicUrl(STORAGE_NAME)
console.log('Public URL:', data.publicUrl)

const { error: dbErr } = await supabase.from('handouts').upsert({
  id: HANDOUT_ID,
  resource_type: 'book',
  source: SOURCE,
  name: '200 Estonian Physics Olympiad Problems (2012–2018)',
  description: 'A collection of 200 problems from the regional and national rounds of the Estonian Physics Olympiad, with hints and solutions. Compiled by Taavet Kalda.',
  topics: ['Mechanics', 'Electromagnetism', 'Waves & Oscillations', 'Optics', 'Thermodynamics'],
  tags: ['olympiad', 'problems', 'solutions', 'Estonian'],
  pdf_url: data.publicUrl,
  solution_url: '',
  year: 0,
}, { onConflict: 'id' })

if (dbErr) { console.error('DB insert failed:', dbErr.message); process.exit(1) }
console.log('Book added to portal.')

// Grant Borna view access (not an assignment — just makes it appear in her portal library)
const { error: accessErr } = await supabase.from('student_accessible_sources').upsert({
  student_id: 'borna',
  source: SOURCE,
}, { onConflict: 'student_id,source' })

if (accessErr) { console.error('Access grant failed:', accessErr.message); process.exit(1) }
console.log('Borna granted view access to source:', SOURCE)
