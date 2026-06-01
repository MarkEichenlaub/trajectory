import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = readFileSync(join(__dirname, '../.env'), 'utf8')
  .split('\n').find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY=')).split('=').slice(1).join('=').trim()

// Intercept fetch to log auth headers
const origFetch = globalThis.fetch
globalThis.fetch = async (url, opts) => {
  const auth = opts?.headers?.['Authorization'] || opts?.headers?.get?.('Authorization') || '(none)'
  const apikey = opts?.headers?.['apikey'] || opts?.headers?.get?.('apikey') || '(none)'
  if (String(url).includes('storage')) {
    console.log('STORAGE REQUEST:', String(url).split('/storage')[1])
    console.log('  Authorization:', auth.slice(0, 60) + '...')
    console.log('  apikey:', apikey.slice(0, 60) + '...')
  }
  return origFetch(url, opts)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

// Do a tiny upload to see the headers
const tiny = Buffer.from('x')
const { error } = await supabase.storage.from('handout-pdfs').upload('sniff-test.txt', tiny, { upsert: true })
if (!error) await supabase.storage.from('handout-pdfs').remove(['sniff-test.txt'])
console.log('Done')
