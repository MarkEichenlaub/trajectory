import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = readFileSync('.env','utf8')
const key = env.match(/VITE_SUPABASE_SERVICE_KEY\s*=\s*(.+)/)[1].trim()
const sb = createClient('https://nxvtaxbntqhcfqtazbnt.supabase.co', key, { auth: { persistSession:false } })

const { data: students } = await sb.from('students').select('id,name,status')
console.log('STUDENTS:', JSON.stringify(students,null,1))

const { data: asg } = await sb.from('assignments').select('*').eq('student_id','india').order('assigned_date',{ascending:true})
console.log('\nINDIA ASSIGNMENTS:', asg?.length)
for (const a of asg||[]) console.log(` ${a.id} | ${a.status.padEnd(10)} | prob=${a.problem_id} | assigned=${a.assigned_date} | due=${a.due_date} | completed=${a.completed_date}`)
