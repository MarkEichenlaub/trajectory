import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'
const env = readFileSync('.env','utf8')
const key = env.match(/VITE_SUPABASE_SERVICE_KEY\s*=\s*(.+)/)[1].trim()
const sb = createClient('https://nxvtaxbntqhcfqtazbnt.supabase.co', key, { auth: { persistSession:false } })
const { data: handouts } = await sb.from('handouts').select('id,name,status,request,pdf_url')
const { data: asg } = await sb.from('assignments').select('id,student_id,problem_id,status')
writeFileSync('scripts/_tmp_handouts.json', JSON.stringify({handouts,asg},null,1))
console.log('handouts:', handouts.length, 'assignments:', asg.length)
