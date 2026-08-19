import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(Boolean).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()]}))
const sb = createClient('https://nxvtaxbntqhcfqtazbnt.supabase.co', env.VITE_SUPABASE_SERVICE_KEY, {auth:{persistSession:false}})

const { data: st } = await sb.from('students').select('*').eq('id','leo').single()
console.log('LEO student row:', JSON.stringify({id:st.id,name:st.name,timezone:st.timezone,status:st.status,invoicing_enabled:st.invoicing_enabled,gender:st.gender}))

const { data: asg } = await sb.from('assignments').select('*').eq('student_id','leo')
console.log('\nLEO assignments:', asg.length)
for (const a of asg) console.log('  ', JSON.stringify({problem_id:a.problem_id, status:a.status, due:a.due_date, requires_submission:a.requires_submission}))

const { data: links } = await sb.from('student_links').select('*').eq('student_id','leo')
console.log('\nLEO links:', JSON.stringify(links.map(l=>({acct:l.account_id, rel:l.relationship}))))

const { data: fma } = await sb.from('fma_attempts').select('*').eq('student_id','leo')
console.log('LEO fma attempts:', fma.length)

// which problem ids look like F=ma exams?
const ids = asg.map(a=>a.problem_id)
const { data: h } = await sb.from('handouts').select('id,name,resource_type').in('id', ids)
console.log('\nassigned handouts:', JSON.stringify(h))
