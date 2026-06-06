import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, degrees } from 'https://esm.sh/pdf-lib@1.17.1'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SB_PUBLISHABLE_KEY')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

const MARK_EMAIL = 'mark.d.eichenlaub@gmail.com'
const PORTAL_URL = 'https://portal.eichenlaubphysics.com/'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

// Read the EXIF Orientation tag from JPEG bytes.
// Returns: 1 (normal), 3 (180°), 6 (90° CW), 8 (90° CCW), or 1 if not found.
function readExifOrientation(bytes: Uint8Array): number {
  if (bytes[0] !== 0xFF || bytes[1] !== 0xD8) return 1  // not JPEG

  let i = 2
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xFF) break
    const marker = bytes[i + 1]
    const segLen = (bytes[i + 2] << 8) | bytes[i + 3]

    if (marker === 0xE1 && segLen >= 10) {  // APP1 segment
      // "Exif\0\0"
      if (bytes[i+4] === 0x45 && bytes[i+5] === 0x78 && bytes[i+6] === 0x69 &&
          bytes[i+7] === 0x66 && bytes[i+8] === 0x00 && bytes[i+9] === 0x00) {
        const tiff = i + 10
        const le = bytes[tiff] === 0x49  // "II" = little-endian; "MM" = big-endian

        const r16 = (o: number) => le
          ? bytes[tiff+o] | (bytes[tiff+o+1] << 8)
          : (bytes[tiff+o] << 8) | bytes[tiff+o+1]
        const r32 = (o: number) => le
          ? bytes[tiff+o] | (bytes[tiff+o+1]<<8) | (bytes[tiff+o+2]<<16) | (bytes[tiff+o+3]<<24)
          : (bytes[tiff+o]<<24) | (bytes[tiff+o+1]<<16) | (bytes[tiff+o+2]<<8) | bytes[tiff+o+3]

        if (r16(2) !== 42) break  // TIFF magic check
        const ifdOff = r32(4)
        const entryCount = r16(ifdOff)

        for (let j = 0; j < entryCount; j++) {
          const e = ifdOff + 2 + j * 12
          if (r16(e) === 0x0112) return r16(e + 8)  // Orientation tag = 0x0112
        }
      }
    }
    i += 2 + segLen
  }
  return 1
}

// Combine all submitted files (JPEG, PNG, PDF) into one PDF document.
// Applies EXIF orientation correction for JPEG images so text appears upright.
async function buildBundle(
  files: Array<{ url: string; file_name: string | null }>,
): Promise<Uint8Array | null> {
  const maxW = 560  // max displayed width in points (with margins)
  const maxH = 740  // max displayed height in points (with margins)
  const margin = 26

  try {
    const bundle = await PDFDocument.create()

    for (const file of files) {
      let res: Response
      try {
        res = await fetch(file.url)
        if (!res.ok) { console.warn('Could not fetch:', file.url, res.status); continue }
      } catch (e) {
        console.warn('Fetch error for', file.url, e)
        continue
      }

      const bytes = new Uint8Array(await res.arrayBuffer())

      // Detect PDF by %PDF magic bytes
      const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 &&
                    bytes[2] === 0x44 && bytes[3] === 0x46

      if (isPdf) {
        try {
          const src = await PDFDocument.load(bytes, { ignoreEncryption: true })
          const copied = await bundle.copyPages(src, src.getPageIndices())
          copied.forEach(p => bundle.addPage(p))
        } catch (e) {
          console.warn('Could not load PDF:', file.url, e)
        }
      } else {
        // JPEG: FF D8   PNG: 89 50 4E 47
        const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8

        try {
          const img = isJpeg
            ? await bundle.embedJpg(bytes)
            : await bundle.embedPng(bytes)

          const imgW = img.width
          const imgH = img.height

          // Read EXIF orientation for JPEGs (phones often store portrait photos as
          // landscape with an orientation tag; this corrects for that).
          const orientation = isJpeg ? readExifOrientation(bytes) : 1

          // Axes are swapped for 90°/270° rotations — use displayed dimensions for scaling.
          const swapAxes = orientation === 6 || orientation === 8
          const dispW = swapAxes ? imgH : imgW
          const dispH = swapAxes ? imgW : imgH

          const scale = Math.min(maxW / dispW, maxH / dispH, 1)
          const drawW = imgW * scale  // physical (pre-rotation) drawing width
          const drawH = imgH * scale  // physical (pre-rotation) drawing height

          // Create page at physical (pre-rotation) dimensions; PDF viewer applies rotation.
          const page = bundle.addPage([drawW + margin * 2, drawH + margin * 2])
          page.drawImage(img, { x: margin, y: margin, width: drawW, height: drawH })

          // Set page rotation so PDF viewers display the image upright.
          // PDF Rotate = clockwise degrees. EXIF 6 = 90° CW, EXIF 8 = 270° CW, EXIF 3 = 180°.
          const pdfRotation: Record<number, number> = { 1: 0, 3: 180, 6: 90, 8: 270 }
          const rot = pdfRotation[orientation] ?? 0
          if (rot !== 0) page.setRotation(degrees(rot))
        } catch (e) {
          console.warn('Could not embed image:', file.url, e)
        }
      }
    }

    if (bundle.getPageCount() === 0) return null
    return bundle.save()
  } catch (e) {
    console.error('Bundle creation failed:', e)
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const authHeader = req.headers.get('Authorization') || ''
  if (!authHeader) return json({ error: 'unauthorized' }, 401)

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return json({ error: 'unauthorized' }, 401)

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data: student } = await admin
    .from('students').select('id, name').eq('user_id', user.id).maybeSingle()
  if (!student) return json({ error: 'no student found' }, 403)

  const { assignment_id, submissions } = await req.json() as {
    assignment_id: string
    submissions: Array<{ url: string; file_name: string }>
  }
  if (!assignment_id || !submissions?.length) return json({ error: 'missing fields' }, 400)

  const { data: assignment } = await admin
    .from('assignments')
    .select('id, status, problem_id')
    .eq('id', assignment_id)
    .eq('student_id', student.id)
    .maybeSingle()
  if (!assignment) return json({ error: 'assignment not found' }, 404)

  if (assignment.status === 'reviewed' || assignment.status === 'completed') {
    return json({ ok: true, skipped: 'assignment already reviewed or completed' })
  }

  // Insert submission rows
  const { error: insertErr } = await admin.from('assignment_submissions').insert(
    submissions.map(s => ({
      assignment_id,
      file_url: s.url,
      file_name: s.file_name || null,
    }))
  )
  if (insertErr) return json({ error: insertErr.message }, 500)

  // Flip status on first submission
  if (assignment.status === 'assigned') {
    const { error: updateErr } = await admin.from('assignments').update({
      status: 'submitted',
      submission_at: new Date().toISOString(),
    }).eq('id', assignment_id)
    if (updateErr) return json({ error: updateErr.message }, 500)
  }

  // Fetch ALL submissions for this assignment (including prior ones) to bundle together.
  const { data: allSubs } = await admin
    .from('assignment_submissions')
    .select('file_url, file_name')
    .eq('assignment_id', assignment_id)
    .order('created_at', { ascending: true })

  // Build PDF bundle (images auto-rotated via EXIF, PDFs copied page-by-page).
  let bundleUrl = ''
  const bundleBytes = await buildBundle(
    (allSubs || []).map(s => ({ url: s.file_url, file_name: s.file_name }))
  )

  if (bundleBytes) {
    const bundlePath = `${student.id}/${assignment_id}-bundle.pdf`
    const { error: uploadErr } = await admin.storage
      .from('submissions')
      .upload(bundlePath, bundleBytes, { contentType: 'application/pdf', upsert: true })

    if (uploadErr) {
      console.error('Bundle upload failed:', uploadErr.message)
    } else {
      const { data: { publicUrl } } = admin.storage.from('submissions').getPublicUrl(bundlePath)
      bundleUrl = publicUrl
      await admin.from('assignments')
        .update({ submission_bundle_url: bundleUrl })
        .eq('id', assignment_id)
    }
  }

  // Fetch problem name for email subject
  const { data: problem } = await admin
    .from('problems').select('name, contest, year, label').eq('id', assignment.problem_id).maybeSingle()
  const problemLabel = problem
    ? `${problem.contest} ${problem.year} ${problem.label} — ${problem.name}`
    : assignment.problem_id

  const fileLines = submissions.map(s => `  ${s.file_name || s.url}: ${s.url}`).join('\n')

  const emailLines = [
    `${student.name} submitted ${submissions.length === 1 ? 'a solution' : `${submissions.length} files`} for:`,
    `  ${problemLabel}`,
    '',
    bundleUrl
      ? `Bundle PDF (open in PDF XChange to annotate):\n  ${bundleUrl}`
      : `Files:\n${fileLines}`,
    '',
    `Upload feedback at: ${PORTAL_URL}`,
  ]

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
      to: [MARK_EMAIL],
      subject: `${student.name} submitted — ${problemLabel}`,
      text: emailLines.join('\n'),
    }),
  }).catch(e => console.error('email failed:', e))

  return json({ ok: true })
})
