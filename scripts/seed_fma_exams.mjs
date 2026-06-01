// Seed all F=ma exams into the portal.
// Downloads PDFs from AAPT, uploads to Supabase storage, inserts handout rows,
// and grants Leo access to the F=ma source.
//
// Requires: node 18+ (built-in fetch), @supabase/supabase-js in node_modules
// Usage:    node scripts/seed_fma_exams.mjs
//
// Run AFTER applying supabase/handouts_exam_support.sql in the Supabase SQL editor.

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(__dirname, '../.env'), 'utf8')
    .split('\n')
    .find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
    ?.split('=').slice(1).join('=').trim()

if (!SERVICE_KEY) { console.error('Could not read service key from .env'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const AAPT_BASE = 'https://www.aapt.org'

const EXAMS = [
  { id: 'fma-2008', year: 2008, name: '2008 F=ma',
    examPath: '/Programs/contests/upload/olympiad_2008_fnet_ma.pdf',
    solPath:  '/Programs/contests/upload/olympiad_2008_fnet_ma_soln.pdf' },
  { id: 'fma-2009', year: 2009, name: '2009 F=ma',
    examPath: '/physicsteam/2010/upload/2009_F-ma.pdf',
    solPath:  '/physicsteam/2010/upload/2009_F-maSolutions.pdf' },
  { id: 'fma-2010', year: 2010, name: '2010 F=ma',
    examPath: '/physicsteam/2010/upload/2010_Fma.pdf',
    solPath:  '/physicsteam/2010/upload/2010_FmaSolutions.pdf' },
  { id: 'fma-2011', year: 2011, name: '2011 F=ma',
    examPath: '/physicsteam/2012/upload/WebAssign-exam1-2011-1-4.pdf',
    solPath:  '/physicsteam/2012/upload/exam1-2011-1-3-answers_1.pdf' },
  { id: 'fma-2012', year: 2012, name: '2012 F=ma',
    examPath: '/physicsteam/2013/upload/exam1-2012-unlocked.pdf',
    solPath:  '/physicsteam/2013/upload/exam1-2012-unlocked-solutions.pdf' },
  { id: 'fma-2013', year: 2013, name: '2013 F=ma',
    examPath: '/physicsteam/2014/upload/exam1-2013-1-6-unlocked.pdf',
    solPath:  '/physicsteam/2014/upload/exam1-2013-solutions.pdf' },
  { id: 'fma-2014', year: 2014, name: '2014 F=ma',
    examPath: '/physicsteam/2015/upload/exam1-2014-2-2.pdf',
    solPath:  '/physicsteam/2015/upload/exam1-2014-2-2-solutions.pdf' },
  { id: 'fma-2015', year: 2015, name: '2015 F=ma',
    examPath: '/physicsteam/2015/upload/exam1-2015-1-8.pdf',
    solPath:  '/physicsteam/2016/upload/exam1-2015-1-8-answer-typo-corrected.pdf' },
  { id: 'fma-2016', year: 2016, name: '2016 F=ma',
    examPath: '/physicsteam/2016/upload/exam1-2016-3-1-2.pdf',
    solPath:  '/physicsteam/2016/upload/exam1-2016-3-1-solutions.pdf' },
  { id: 'fma-2017', year: 2017, name: '2017 F=ma',
    examPath: '/physicsteam/2018/upload/2017-Fma-exam.pdf',
    solPath:  '/physicsteam/2018/upload/Fma-Answers.pdf' },
  { id: 'fma-2018-a', year: 2018, name: '2018 F=ma A',
    examPath: '/physicsteam/2019/upload/Fma-2018-A.pdf',
    solPath:  '/physicsteam/2019/upload/Fma-2018-A-Solutions.pdf' },
  { id: 'fma-2018-b', year: 2018, name: '2018 F=ma B',
    examPath: '/physicsteam/2019/upload/Fma-2018-B.pdf',
    solPath:  '/physicsteam/2019/upload/Fma-2018-B-Solutions.pdf' },
  { id: 'fma-2019-a', year: 2019, name: '2019 F=ma A',
    examPath: '/physicsteam/upload/2019_Fma_A.pdf',
    solPath:  '/physicsteam/2020/upload/2019_Fma_A_solution.pdf' },
  { id: 'fma-2019-b', year: 2019, name: '2019 F=ma B',
    examPath: '/physicsteam/upload/2019_Fma_B.pdf',
    solPath:  '/physicsteam/2020/upload/2019_Fma_B_solution_rev.pdf' },
  { id: 'fma-2020-a', year: 2020, name: '2020 F=ma A',
    examPath: '/physicsteam/upload/2020_Fma_A_v2.pdf',
    solPath:  '/physicsteam/upload/2020_Fma_A_Solutions_v2.pdf' },
  { id: 'fma-2020-b', year: 2020, name: '2020 F=ma B',
    examPath: '/physicsteam/upload/2020_Fma_B.pdf',
    solPath:  '/Common/upload/2020-Fma-Exam-B_solutions.pdf' },
  { id: 'fma-2021', year: 2021, name: '2021 F=ma',
    examPath: '/physicsteam/upload/F-ma-2021.pdf',
    solPath:  '/physicsteam/upload/F-ma-2021-Solutions.pdf' },
  { id: 'fma-2022-a', year: 2022, name: '2022 F=ma A',
    examPath: '/physicsteam/upload/2022_Fma_Exam_A-2.pdf',
    solPath:  '/physicsteam/upload/2022_Fma_Exam_A_Solutions.pdf' },
  { id: 'fma-2022-b', year: 2022, name: '2022 F=ma B',
    examPath: '/physicsteam/upload/2022_Fma_Exam_B.pdf',
    solPath:  '/physicsteam/upload/2022_Fma_Exam_B_Solutions.pdf' },
  { id: 'fma-2023', year: 2023, name: '2023 F=ma',
    examPath: '/physicsteam/upload/2023_F-ma_Exam.pdf',
    solPath:  '/physicsteam/upload/F-ma-2023-Solutions.pdf' },
  { id: 'fma-2024', year: 2024, name: '2024 F=ma',
    examPath: '/physicsteam/upload/2024_F-ma_Exam.pdf',
    solPath:  '/physicsteam/upload/F-ma-2024-Solutions_v2.pdf' },
  { id: 'fma-2025', year: 2025, name: '2025 F=ma',
    examPath: '/physicsteam/upload/FMA-exam.pdf',
    solPath:  '/physicsteam/upload/FMA_solutions.pdf' },
]

async function applyMigration() {
  // Verify that the required columns exist by probing a select.
  const { error } = await supabase.from('handouts').select('solution_url, year').limit(0)
  if (!error) {
    console.log('✓ Schema columns present (solution_url, year)')
    return
  }
  // Columns missing — try the Supabase Management API.
  console.log('Schema columns missing — attempting Management API migration…')
  const sql = `
    ALTER TABLE public.handouts ADD COLUMN IF NOT EXISTS solution_url TEXT DEFAULT '';
    ALTER TABLE public.handouts ADD COLUMN IF NOT EXISTS year INT DEFAULT 0;
  `
  const PROJECT_REF = 'nxvtaxbntqhcfqtazbnt'
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_KEY}` },
    body: JSON.stringify({ query: sql }),
  })
  if (res.ok) {
    console.log('✓ Schema migration applied via Management API')
    return
  }
  const body = await res.text()
  console.error('Management API migration failed:', body)
  console.error('\n──────────────────────────────────────────────')
  console.error('Run the following SQL in the Supabase SQL editor')
  console.error('(supabase.com → your project → SQL Editor):')
  console.error('──────────────────────────────────────────────')
  console.error("ALTER TABLE public.handouts ADD COLUMN IF NOT EXISTS solution_url TEXT DEFAULT '';")
  console.error("ALTER TABLE public.handouts ADD COLUMN IF NOT EXISTS year INT DEFAULT 0;")
  console.error('──────────────────────────────────────────────\n')
  process.exit(1)
}

async function downloadPdf(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; trajectory-seed/1.0)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function uploadToStorage(buffer, storagePath) {
  const { error } = await supabase.storage
    .from('handout-pdfs')
    .upload(storagePath, buffer, { upsert: true, contentType: 'application/pdf' })
  if (error) throw new Error(`Storage upload failed for ${storagePath}: ${error.message}`)
  const { data } = supabase.storage.from('handout-pdfs').getPublicUrl(storagePath)
  return data.publicUrl
}

async function seedExam(exam) {
  console.log(`\n  ${exam.name}`)

  // Download both PDFs
  let examBuf, solBuf
  try {
    examBuf = await downloadPdf(`${AAPT_BASE}${exam.examPath}`)
    console.log(`    ✓ exam PDF downloaded (${Math.round(examBuf.length / 1024)} KB)`)
  } catch (e) {
    console.error(`    ✗ exam PDF failed: ${e.message}`)
    throw e
  }
  try {
    solBuf = await downloadPdf(`${AAPT_BASE}${exam.solPath}`)
    console.log(`    ✓ solution PDF downloaded (${Math.round(solBuf.length / 1024)} KB)`)
  } catch (e) {
    console.error(`    ✗ solution PDF failed: ${e.message}`)
    throw e
  }

  // Upload both PDFs
  const examUrl = await uploadToStorage(examBuf, `${exam.id}.pdf`)
  console.log(`    ✓ exam PDF uploaded`)
  const solUrl = await uploadToStorage(solBuf, `${exam.id}-sol.pdf`)
  console.log(`    ✓ solution PDF uploaded`)

  // Upsert handout row
  const { error } = await supabase.from('handouts').upsert({
    id:            exam.id,
    resource_type: 'exam',
    source:        'F=ma',
    name:          exam.name,
    description:   '',
    topics:        ['Mechanics'],
    tags:          [],
    year:          exam.year,
    pdf_url:       examUrl,
    solution_url:  solUrl,
  }, { onConflict: 'id' })
  if (error) throw new Error(`DB upsert failed for ${exam.id}: ${error.message}`)
  console.log(`    ✓ database row upserted`)
}

async function grantLeoAccess() {
  const { error } = await supabase.from('student_accessible_sources')
    .upsert({ student_id: 'leo', source: 'F=ma' }, { onConflict: 'student_id,source' })
  if (error) throw new Error(`Accessible sources failed: ${error.message}`)
  console.log('\n✓ Leo granted access to F=ma source')
}

async function run() {
  console.log('=== F=ma exam seed ===')
  console.log(`Seeding ${EXAMS.length} exams\n`)

  await applyMigration()

  let passed = 0
  let failed = 0
  for (const exam of EXAMS) {
    try {
      await seedExam(exam)
      passed++
    } catch (e) {
      console.error(`  FAILED: ${e.message}`)
      failed++
    }
  }

  await grantLeoAccess()

  console.log(`\n=== Done: ${passed} seeded, ${failed} failed ===`)
  if (failed > 0) process.exit(1)
}

run()
