import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = readFileSync('.env','utf8')
const key = env.match(/VITE_SUPABASE_SERVICE_KEY\s*=\s*(.+)/)[1].trim()
const sb = createClient('https://nxvtaxbntqhcfqtazbnt.supabase.co', key, { auth: { persistSession:false } })
const { data } = await sb.from('handouts').select('id,name,description,status,resource_type,topics,tags,pdf_url,request').order('created_at')
for (const h of data||[]) {
  console.log(`--- ${h.id}`)
  console.log(`    name=${h.name}`)
  console.log(`    status=${h.status} type=${h.resource_type} topics=${JSON.stringify(h.topics)} tags=${JSON.stringify(h.tags)}`)
  console.log(`    desc=${(h.description||'').slice(0,120)}`)
  if (h.request) console.log(`    request=${JSON.stringify(h.request).slice(0,300)}`)
  console.log(`    pdf=${h.pdf_url? 'yes':'NO'}`)
}
