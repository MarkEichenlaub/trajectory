import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SB_PUBLISHABLE_KEY')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SECRET_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN')!
const MIRO_ACCESS_TOKEN = Deno.env.get('MIRO_ACCESS_TOKEN') || ''
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

const MARK_EMAIL = 'mark.d.eichenlaub@gmail.com'
const PORTAL_URL = 'https://portal.eichenlaubphysics.com/'
const TIMEZONE = 'America/New_York'
const SESSION_DURATION_MIN = 60

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

async function getGoogleAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: GOOGLE_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }).toString(),
    })
    if (!res.ok) return null
    const data = await res.json() as { access_token?: string }
    return data.access_token ?? null
  } catch {
    return null
  }
}

function fmtWhen(iso: string, tz: string = TIMEZONE): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    timeZone: tz,
  })
}

// deno-lint-ignore no-explicit-any
async function resolveSelfStudent(admin: any, userId: string) {
  const { data: links } = await admin
    .from('student_links').select('student_id, relationship').eq('account_id', userId)
  const link = (links || []).find((l: { relationship: string }) => l.relationship === 'self') || (links || [])[0]
  if (!link) return null
  const { data: student } = await admin
    .from('students').select('id, name, email, timezone').eq('id', link.student_id).maybeSingle()
  return student
}

// Deleting the Google event with sendUpdates=all already removes it from every
// guest's calendar, so this is a plain notice with no .ics cancellation attached.
async function sendPlainEmail(params: {
  to: string[]; subject: string; text: string
}): Promise<void> {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
      bcc: 'mark.d.eichenlaub@gmail.com',
      to: params.to,
      subject: params.subject,
      text: params.text,
    }),
  }).catch(e => console.error('Email send failed:', e))
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

  const { data: callerProfile } = await admin
    .from('profiles').select('account_type').eq('id', user.id).maybeSingle()
  const isAdminCaller = callerProfile?.account_type === 'admin'

  const { session_id, message } = await req.json() as { session_id: string; message?: string }
  if (!session_id) return json({ error: 'session_id required' }, 400)

  // deno-lint-ignore no-explicit-any
  let student: any
  // deno-lint-ignore no-explicit-any
  let session: any

  if (isAdminCaller) {
    const { data: sess } = await admin
      .from('sessions')
      .select('id, student_id, scheduled_at, end_time, gcal_event_id, miro_board_id, balance_decremented')
      .eq('id', session_id).maybeSingle()
    if (!sess) return json({ error: 'session not found' }, 404)
    if (sess.balance_decremented) return json({ error: 'session already completed, cannot cancel' }, 400)
    if (sess.end_time && new Date(sess.end_time as string).getTime() < Date.now()) {
      return json({ error: 'session has already ended' }, 400)
    }
    session = sess
    const { data: s } = await admin
      .from('students').select('id, name, email, timezone').eq('id', sess.student_id).maybeSingle()
    if (!s) return json({ error: 'student not found' }, 404)
    student = s
  } else {
    const selfStudent = await resolveSelfStudent(admin, user.id)
    if (!selfStudent) return json({ error: 'no student record' }, 403)
    student = selfStudent
    const { data: sess } = await admin
      .from('sessions')
      .select('id, student_id, scheduled_at, end_time, gcal_event_id, miro_board_id, balance_decremented')
      .eq('id', session_id).eq('student_id', student.id).maybeSingle()
    if (!sess) return json({ error: 'session not found' }, 404)
    if (sess.balance_decremented) return json({ error: 'session already completed, cannot cancel' }, 400)
    if (sess.end_time && new Date(sess.end_time as string).getTime() < Date.now()) {
      return json({ error: 'session has already ended' }, 400)
    }
    session = sess
  }

  const tz = (student.timezone as string) || TIMEZONE

  // Delete Google Calendar event if we have the event ID (best-effort)
  if (session.gcal_event_id) {
    const accessToken = await getGoogleAccessToken()
    if (accessToken) {
      // sendUpdates=all so Google removes the event from every guest's calendar and
      // sends the cancellation notice, matching delete-session-event.
      const delRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${session.gcal_event_id}?sendUpdates=all`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } },
      )
      if (!delRes.ok && delRes.status !== 404 && delRes.status !== 410) {
        console.error('Google Calendar DELETE failed:', delRes.status, await delRes.text())
      }
    }
  }

  // Delete the Miro whiteboard so cancelled sessions don't leave orphan boards (best-effort)
  if (session.miro_board_id && MIRO_ACCESS_TOKEN) {
    try {
      const miroRes = await fetch(`https://api.miro.com/v2/boards/${session.miro_board_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${MIRO_ACCESS_TOKEN}`, Accept: 'application/json' },
      })
      if (!miroRes.ok && miroRes.status !== 404) {
        console.error('Miro board DELETE failed:', miroRes.status, await miroRes.text())
      }
    } catch (e) {
      console.error('Miro board DELETE error:', e)
    }
  }

  // Delete DB session row — trigger clears non-overridden assignment due dates automatically
  const { error: dbErr } = await admin.from('sessions').delete()
    .eq('id', session_id).eq('balance_decremented', false)
  if (dbErr) return json({ error: 'DB delete failed', detail: dbErr.message }, 500)

  // Warn Mark if any assignments have manually-overridden due dates (trigger won't touch those)
  const { data: overridden } = await admin
    .from('assignments')
    .select('problem_id, due_date')
    .eq('student_id', student.id)
    .eq('requires_submission', true)
    .eq('due_date_overridden', true)
    .in('status', ['assigned', 'submitted'])
  if (overridden?.length) {
    const cancelledWhen = fmtWhen(session.scheduled_at as string, tz)
    const lines = overridden.map(a => `  - ${a.problem_id}: due ${a.due_date}`)
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
        to: [MARK_EMAIL],
        subject: `Heads up: ${student.name}'s session cancelled — check assignment due dates`,
        text: [
          `${student.name}'s session for ${cancelledWhen} was cancelled.`,
          '',
          'These assignments have manually-set due dates that were NOT auto-updated:',
          ...lines,
          '',
          `Review them at: ${PORTAL_URL}`,
        ].join('\n'),
      }),
    }).catch(e => console.error('Warning email failed:', e))
  }

  // Get contact emails (use receives_meets — the "Meet invites" checkbox)
  const { data: contacts } = await admin
    .from('student_contacts').select('email')
    .eq('student_id', student.id)
    .eq('receives_meets', true)
    .eq('verified', true).eq('bounced', false)
  const studentEmails = (contacts ?? []).map(c => c.email as string).filter(Boolean)
  if (!studentEmails.length && student.email) studentEmails.push(student.email as string)

  const when = fmtWhen(session.scheduled_at as string, tz)

  const cancelBody = [
    `Your physics session for ${when} has been cancelled.`,
    ...(message ? ['', `Message: ${message}`] : []),
    '',
    `To book a new time, or to view assignments and session summaries, visit: ${PORTAL_URL}`,
  ].join('\n')

  if (studentEmails.length) {
    await sendPlainEmail({
      to: studentEmails,
      subject: `Session cancelled: ${when}`,
      text: cancelBody,
    })
  }
  // Only notify Mark when a student self-cancels; Mark doesn't need a notice about their own cancellation
  if (!isAdminCaller) {
    await sendPlainEmail({
      to: [MARK_EMAIL],
      subject: `Session cancelled: ${student.name} – ${when}`,
      text: `${student.name} cancelled their session for ${when}.${message ? '\n\nMessage: ' + message : ''}`,
    })
  }

  return json({ ok: true })
})
