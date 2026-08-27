import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = readFileSync('.env','utf8')
const key = env.match(/VITE_SUPABASE_SERVICE_KEY\s*=\s*(.+)/)[1].trim()
const sb = createClient('https://nxvtaxbntqhcfqtazbnt.supabase.co', key, { auth: { persistSession:false } })
const { data } = await sb.from('handouts').select('*').in('id',['handout-mch01-script','handout-mch04','hwset-1787236382781'])
console.log(JSON.stringify(data,null,1))
