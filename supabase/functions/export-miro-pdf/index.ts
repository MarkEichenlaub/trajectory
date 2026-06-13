import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!  // new secret API key (RLS-bypass); replaces legacy service_role
const MIRO_ACCESS_TOKEN = Deno.env.get('MIRO_ACCESS_TOKEN')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')!
const BUCKET = 'session-pdfs'

Deno.serve(async (req) => {
  // Deployed --no-verify-jwt; the cron authenticates with this shared-secret header.
  if (req.headers.get('X-Cron-Secret') !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Ensure storage bucket exists
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {})

  // Find sessions that ended >15 minutes ago, have a Miro board, but no PDF yet
  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, miro_board_id')
    .lte('end_time', cutoff)
    .is('miro_pdf_url', null)
    .not('miro_board_id', 'is', null)
    .neq('miro_board_id', '')
    .limit(5)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  const results: Array<{ id: string; status: string; error?: string }> = []

  for (const session of sessions ?? []) {
    try {
      const downloadUrl = await exportMiroPDF(session.miro_board_id)
      if (!downloadUrl) {
        results.push({ id: session.id, status: 'export_pending' })
        continue
      }

      // Download the PDF from Miro
      const pdfRes = await fetch(downloadUrl)
      if (!pdfRes.ok) throw new Error(`PDF download failed: ${pdfRes.status}`)
      const pdfBytes = await pdfRes.arrayBuffer()

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(`${session.id}.pdf`, pdfBytes, { contentType: 'application/pdf', upsert: true })
      if (uploadError) throw new Error(uploadError.message)

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(`${session.id}.pdf`)

      await supabase.from('sessions').update({ miro_pdf_url: urlData.publicUrl }).eq('id', session.id)

      results.push({ id: session.id, status: 'done' })
    } catch (e) {
      console.error('Export error for session', session.id, e)
      results.push({ id: session.id, status: 'error', error: (e as Error).message })
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

// encodeURIComponent encodes '=' as '%3D', which Miro's router doesn't handle — keep '=' literal.
function encodeMiroBoardId(boardId: string): string {
  return encodeURIComponent(boardId).replace(/%3D/gi, '=')
}

async function exportMiroPDF(boardId: string): Promise<string | null> {
  // Create export job
  const createRes = await fetch(`https://api.miro.com/v2/boards/${encodeMiroBoardId(boardId)}/export/jobs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MIRO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ format: 'pdf' }),
  })

  if (!createRes.ok) {
    console.error('Miro export job create failed:', createRes.status, await createRes.text())
    return null
  }

  const job = await createRes.json() as { id: string; status: string }
  console.log('Miro export job created:', job.id, 'status:', job.status)

  // Poll for up to 50 seconds (10 × 5s)
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 5000))

    const statusRes = await fetch(
      `https://api.miro.com/v2/boards/${encodeMiroBoardId(boardId)}/export/jobs/${job.id}`,
      { headers: { 'Authorization': `Bearer ${MIRO_ACCESS_TOKEN}`, 'Accept': 'application/json' } }
    )
    const status = await statusRes.json() as { id: string; status: string; url?: string; downloadLink?: string }
    console.log('Miro export job status:', status.status)

    if (status.status === 'FINISHED' || status.status === 'finished' || status.status === 'completed') {
      return status.url || status.downloadLink || null
    }
    if (status.status === 'FAILED' || status.status === 'failed' || status.status === 'error') {
      console.error('Miro export job failed')
      return null
    }
  }

  console.log('Miro export timed out, will retry next cycle')
  return null
}
