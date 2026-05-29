import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const MIRO_ACCESS_TOKEN = Deno.env.get('MIRO_ACCESS_TOKEN')!
const MIRO_TEAM_ID = Deno.env.get('MIRO_TEAM_ID')!
const CAL_WEBHOOK_SECRET = Deno.env.get('CAL_WEBHOOK_SECRET') || ''

type SupabaseClient = ReturnType<typeof createClient>

async function sendEmail(to: string | string[], subject: string, body: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, subject, body }),
  })
  if (!res.ok) {
    console.error('send-email failed:', res.status, await res.text())
  }
}

function fmtWhen(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    timeZone: 'America/Los_Angeles',
  })
}

// Email contacts who opted into schedule-change notices. Held until verified
// and skipped if the address has bounced, matching the rest of the system.
async function notifyScheduleChange(
  supabase: SupabaseClient, studentId: string, subject: string, body: string,
) {
  const { data: contacts } = await supabase
    .from('student_contacts')
    .select('email')
    .eq('student_id', studentId)
    .eq('receives_schedule_changes', true)
    .eq('verified', true)
    .eq('bounced', false)

  const recipients = (contacts ?? []).map(c => c.email as string).filter(Boolean)
  if (!recipients.length) return
  await sendEmail(recipients, subject, body)
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const rawBody = await req.text()

  // Verify Cal.com HMAC-SHA256 signature
  const sigHeader = req.headers.get('X-Cal-Signature-256')
  if (CAL_WEBHOOK_SECRET && sigHeader) {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(CAL_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
    const expectedHex = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0')).join('')
    if (sigHeader !== expectedHex) {
      return new Response('Invalid signature', { status: 401 })
    }
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const payload = body.payload as Record<string, unknown>

  if (body.triggerEvent === 'BOOKING_CREATED') {
    return await handleBookingCreated(payload, supabase)
  }
  if (body.triggerEvent === 'BOOKING_RESCHEDULED') {
    return await handleBookingRescheduled(payload, supabase)
  }
  if (body.triggerEvent === 'BOOKING_CANCELLED') {
    return await handleBookingCancelled(payload, supabase)
  }

  return new Response('OK', { status: 200 })
})

async function handleBookingCreated(payload: Record<string, unknown>, supabase: SupabaseClient) {
  const startTime = payload.startTime as string
  const endTime = payload.endTime as string | undefined
  const attendees = payload.attendees as Array<{ name: string; email: string }>
  const attendee = attendees?.find(a => a.email)
  const calBookingId = String((payload.bookingId ?? payload.uid) ?? '')

  if (!attendee?.email || !startTime) {
    return new Response('Missing attendee or startTime', { status: 400 })
  }

  // Match attendee email to a student via student_contacts
  const { data: contacts } = await supabase
    .from('student_contacts')
    .select('student_id, students!inner(id, name)')
    .ilike('email', attendee.email)
    .limit(1)

  if (!contacts?.length) {
    console.log('No student found for email:', attendee.email)
    return new Response(JSON.stringify({ ok: true, message: 'no matching student' }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  }

  const studentRow = contacts[0].students as { id: string; name: string }
  const student = { id: studentRow.id, name: studentRow.name }

  const dateStr = new Date(startTime).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  // Create Miro board
  let miroBoardUrl = ''
  let miroBoardId = ''
  try {
    const miroRes = await fetch('https://api.miro.com/v2/boards', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MIRO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: `${student.name} – ${dateStr}`,
        teamId: MIRO_TEAM_ID,
      }),
    })
    if (miroRes.ok) {
      const miroData = await miroRes.json() as Record<string, unknown>
      miroBoardId = miroData.id as string
      miroBoardUrl = (miroData.viewLink as string) ?? `https://miro.com/app/board/${miroBoardId}/`
    } else {
      console.error('Miro API error:', miroRes.status, await miroRes.text())
    }
  } catch (e) {
    console.error('Miro fetch error:', e)
  }

  const sessionId = `cal-${calBookingId}-${student.id}`
  const { error } = await supabase.from('sessions').upsert({
    id: sessionId,
    student_id: student.id,
    scheduled_at: new Date(startTime).toISOString(),
    end_time: endTime ? new Date(endTime).toISOString() : null,
    notes: '',
    miro_board_id: miroBoardId,
    miro_board_url: miroBoardUrl,
    cal_booking_id: calBookingId,
    cal_uid: payload.uid ? String(payload.uid) : null,
  }, { onConflict: 'id' })

  if (error) {
    console.error('Session upsert error:', error)
    return new Response('DB error: ' + error.message, { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true, sessionId, miroBoardUrl }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}

async function handleBookingRescheduled(payload: Record<string, unknown>, supabase: SupabaseClient) {
  const newStartTime = payload.startTime as string
  const newEndTime = payload.endTime as string | undefined
  const newBookingId = String((payload.bookingId ?? payload.uid) ?? '')
  // Cal.com sends rescheduleUid = the UID of the old booking
  const oldBookingId = String(payload.rescheduleUid ?? payload.rescheduleId ?? '')

  console.log('BOOKING_RESCHEDULED payload keys:', Object.keys(payload))

  if (!newStartTime) {
    return new Response('Missing startTime', { status: 400 })
  }

  // Find the session by old booking ID
  const lookupId = oldBookingId || newBookingId
  const { data: existing } = await supabase
    .from('sessions')
    .select('id, student_id, scheduled_at, students!inner(name)')
    .eq('cal_booking_id', lookupId)
    .limit(1)

  if (!existing?.length) {
    console.log('No session found for rescheduled booking:', lookupId)
    return new Response(JSON.stringify({ ok: true, message: 'no matching session' }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  }

  const session = existing[0]
  const oldWhen = session.scheduled_at as string

  const { error } = await supabase
    .from('sessions')
    .update({
      scheduled_at: new Date(newStartTime).toISOString(),
      end_time: newEndTime ? new Date(newEndTime).toISOString() : null,
      cal_booking_id: newBookingId,
      cal_uid: payload.uid ? String(payload.uid) : null,
    })
    .eq('id', session.id)

  if (error) {
    console.error('Session reschedule error:', error)
    return new Response('DB error: ' + error.message, { status: 500 })
  }

  const studentName = (session.students as { name: string }).name
  try {
    await notifyScheduleChange(
      supabase, session.student_id as string,
      `${studentName}'s tutoring session was rescheduled`,
      `${studentName}'s tutoring session has been rescheduled.\n\n` +
        `Previously: ${fmtWhen(oldWhen)}\nNow: ${fmtWhen(newStartTime)}\n\n` +
        `View details in the portal: https://portal.eichenlaubphysics.com/`,
    )
  } catch (e) {
    console.error('reschedule notice failed:', (e as Error).message)
  }

  return new Response(JSON.stringify({ ok: true, rescheduled: session.id }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}

async function handleBookingCancelled(payload: Record<string, unknown>, supabase: SupabaseClient) {
  const calBookingId = String((payload.bookingId ?? payload.uid) ?? '')

  if (!calBookingId) {
    return new Response('Missing bookingId', { status: 400 })
  }

  // Grab the session first so we can notify before the row disappears.
  const { data: doomed } = await supabase
    .from('sessions')
    .select('student_id, scheduled_at, students!inner(name)')
    .eq('cal_booking_id', calBookingId)
    .limit(1)

  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('cal_booking_id', calBookingId)

  if (error) {
    console.error('Session delete error:', error)
    return new Response('DB error: ' + error.message, { status: 500 })
  }

  if (doomed?.length) {
    const session = doomed[0]
    const studentName = (session.students as { name: string }).name
    try {
      await notifyScheduleChange(
        supabase, session.student_id as string,
        `${studentName}'s tutoring session was cancelled`,
        `${studentName}'s tutoring session scheduled for ${fmtWhen(session.scheduled_at as string)} has been cancelled.\n\n` +
          `To book a new time, visit the portal: https://portal.eichenlaubphysics.com/`,
      )
    } catch (e) {
      console.error('cancel notice failed:', (e as Error).message)
    }
  }

  return new Response(JSON.stringify({ ok: true, cancelled: calBookingId }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}
