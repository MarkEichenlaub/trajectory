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

const PDF_PATH = 'C:\\Users\\Mark Eichenlaub\\OneDrive\\Desktop\\Resnick-Halliday-Krane-Vol-2.pdf'

const fileSize = statSync(PDF_PATH).size
console.log(`File size: ${Math.round(fileSize / 1024 / 1024)} MB`)

// Get a JWT via the Supabase client so we have a real bearer token
// (the sb_secret_ key needs the JS client to exchange it for a JWT)
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

// Grab the access token the client would use for authenticated requests
// by making a minimal authenticated call and intercepting the Authorization header
let bearerToken = SERVICE_KEY  // default; supabase-js sets this on all requests

// Use the https module directly to stream the file
function uploadViaHttps() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/storage/v1/object/handout-pdfs/hrk-vol-2.pdf`)
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
      timeout: 900000, // 15 minutes
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

    const stream = createReadStream(PDF_PATH, { highWaterMark: 2 * 1024 * 1024 }) // 2 MB chunks
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

console.log('Uploading via https stream...')
try {
  await uploadViaHttps()
} catch (e) {
  console.error('\nUpload failed:', e.message)
  process.exit(1)
}

const { data } = supabase.storage.from('handout-pdfs').getPublicUrl('hrk-vol-2.pdf')
console.log('Public URL:', data.publicUrl)

const { error: dbErr } = await supabase.from('handouts').upsert({
  id: 'hrk-vol-2',
  resource_type: 'book',
  source: 'Halliday, Resenick, Krane',
  name: 'Physics, vol 2 (HRK)',
  description: '',
  topics: ['Mechanics', 'Electromagnetism', 'Waves & Oscillations', 'Optics', 'Thermodynamics', 'Quantum Physics', 'Relativity', 'Nuclear/Particle'],
  tags: [],
  pdf_url: data.publicUrl,
  solution_url: '',
  year: 0,
}, { onConflict: 'id' })

if (dbErr) { console.error('DB insert failed:', dbErr.message); process.exit(1) }
console.log('Done — HRK vol 2 added to portal.')
