// Books a 30-minute trial session for a prospective student.
// Publicly callable (no auth required).
// Creates a GCal event + Miro board, sends an ICS invite to the prospect,
// and emails Mark with all contact details.

import { createSessionBoard } from '../_shared/miro.ts'

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN')!
const MIRO_ACCESS_TOKEN = Deno.env.get('MIRO_ACCESS_TOKEN')!
const MIRO_TEAM_ID = Deno.env.get('MIRO_TEAM_ID')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

const MARK_EMAIL = 'mark.d.eichenlaub@gmail.com'
const MARK_AOPS = 'eichenlaub@artofproblemsolving.com'
const TIMEZONE = 'America/New_York'
const TRIAL_DURATION_MIN = 30
const MIN_NOTICE_HOURS = 24

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

async function getGoogleAccessToken(): Promise<string> {
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
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`)
  const data = await res.json() as { access_token?: string }
  if (!data.access_token) throw new Error('No access_token')
  return data.access_token
}

function fmtWhen(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    timeZone: TIMEZONE,
  })
}

function toIcsDate(iso: string): string {
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  bytes.forEach(b => { binary += String.fromCharCode(b) })
  return btoa(binary)
}

function buildIcs(params: {
  uid: string; summary: string; description: string
  start: string; end: string; attendeeEmails: string[]
}): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Eichenlaub Physics//Portal//EN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${params.uid}`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(params.start)}`,
    `DTEND:${toIcsDate(params.end)}`,
    'SEQUENCE:0',
    `SUMMARY:${params.summary}`,
    `DESCRIPTION:${params.description.replace(/\n/g, '\\n')}`,
    'ORGANIZER:mailto:mark@eichenlaubphysics.com',
    ...params.attendeeEmails.map(e => `ATTENDEE;RSVP=TRUE:mailto:${e}`),
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

async function sendIcsEmail(params: {
  to: string[]; subject: string; text: string; icsContent: string
}): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
      bcc: 'mark.d.eichenlaub@gmail.com',
      to: params.to,
      subject: params.subject,
      text: params.text,
      attachments: [{ filename: 'trial-session.ics', content: toBase64(params.icsContent) }],
    }),
  })
  if (!res.ok) console.error('ICS email failed:', res.status, await res.text())
}

async function sendPlainEmail(params: {
  to: string[]; subject: string; text: string; replyTo?: string
}): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Mark Eichenlaub <mark@eichenlaubphysics.com>',
      bcc: 'mark.d.eichenlaub@gmail.com',
      to: params.to,
      subject: params.subject,
      text: params.text,
      ...(params.replyTo ? { reply_to: params.replyTo } : {}),
    }),
  })
  if (!res.ok) console.error('Email failed:', res.status, await res.text())
}

// Google's conferenceData.createRequest is async and occasionally comes back
// empty on the initial create (status stays "pending"). Retry once via PATCH.
async function ensureMeet(accessToken: string, eventId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?conferenceDataVersion=1`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conferenceData: {
            createRequest: {
              requestId: `meet-${eventId}-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        }),
      },
    )
    if (res.ok) {
      const data = await res.json() as {
        hangoutLink?: string
        conferenceData?: { entryPoints?: { entryPointType?: string; uri?: string }[] }
      }
      return data.hangoutLink
        || data.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri
        || ''
    }
    console.error('Meet retry failed:', res.status, await res.text())
  } catch (e) {
    console.error('Meet retry error:', e)
  }
  return ''
}

function overlapsAny(slotStart: Date, busy: { start: string; end: string }[]): boolean {
  const s = slotStart.getTime()
  const e = s + TRIAL_DURATION_MIN * 60_000
  return busy.some(b => s < new Date(b.end).getTime() && e > new Date(b.start).getTime())
}

async function fetchBusy(
  accessToken: string, timeMin: string, timeMax: string,
): Promise<{ start: string; end: string }[]> {
  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeMin, timeMax,
      items: [{ id: MARK_EMAIL }, { id: MARK_AOPS }],
    }),
  })
  const data = await res.json() as {
    calendars?: Record<string, { busy?: { start: string; end: string }[] }>
  }
  const busy: { start: string; end: string }[] = []
  for (const cal of Object.values(data.calendars ?? {})) busy.push(...(cal.busy ?? []))
  return busy
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  let body: { slot?: string; name?: string; email?: string; notes?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid JSON' }, 400)
  }

  const { slot, name, email, notes = '' } = body
  if (!slot || !name?.trim() || !email?.trim()) {
    return json({ error: 'slot, name, and email are required' }, 400)
  }
  if (!email.includes('@')) return json({ error: 'invalid email address' }, 400)

  const slotDate = new Date(slot)
  if (isNaN(slotDate.getTime())) return json({ error: 'invalid slot' }, 400)
  if (slotDate.getTime() - Date.now() < MIN_NOTICE_HOURS * 3_600_000) {
    return json({ error: 'slot is too soon (24h minimum notice required)' }, 400)
  }

  const endDate = new Date(slotDate.getTime() + TRIAL_DURATION_MIN * 60_000)
  const when = fmtWhen(slotDate.toISOString())
  const trimmedName = name.trim()
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedNotes = notes.trim()

  let accessToken: string
  try {
    accessToken = await getGoogleAccessToken()
  } catch (e) {
    return json({ error: 'Google auth failed', detail: String(e) }, 500)
  }

  // Re-verify slot is still free (prevents race conditions)
  const busy = await fetchBusy(accessToken, slot, endDate.toISOString())
  if (overlapsAny(slotDate, busy)) return json({ error: 'slot is no longer available' }, 409)

  const dateStr = slotDate.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: TIMEZONE,
  })

  // Create Google Calendar event
  const gcalBody = {
    summary: `Trial: ${trimmedName}`,
    description: [
      `30-minute trial session`,
      `Name: ${trimmedName}`,
      `Email: ${trimmedEmail}`,
      trimmedNotes ? `Notes: ${trimmedNotes}` : '',
    ].filter(Boolean).join('\n'),
    start: { dateTime: slotDate.toISOString(), timeZone: TIMEZONE },
    end: { dateTime: endDate.toISOString(), timeZone: TIMEZONE },
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  }

  const calRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(gcalBody),
  })
  if (!calRes.ok) {
    const text = await calRes.text()
    console.error('GCal create failed:', calRes.status, text)
    return json({ error: 'Failed to create calendar event', detail: text }, 500)
  }
  const calEvent = await calRes.json() as {
    id: string; hangoutLink?: string
    conferenceData?: { entryPoints?: { entryPointType?: string; uri?: string }[] }
  }
  const gcalEventId = calEvent.id
  let meetUrl = calEvent.hangoutLink
    || calEvent.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri
    || ''
  if (!meetUrl) meetUrl = await ensureMeet(accessToken, gcalEventId)

  // Create Miro board. Not fatal if it fails — the trial is still booked.
  let miroBoardUrl = ''
  let miroBoardId = ''
  try {
    const board = await createSessionBoard(
      MIRO_ACCESS_TOKEN, MIRO_TEAM_ID, `Trial – ${trimmedName} – ${dateStr}`,
    )
    miroBoardId = board.id
    miroBoardUrl = board.url
  } catch (e) {
    console.error('Miro create error:', e)
  }

  // Patch GCal event description with Miro URL
  if (miroBoardUrl) {
    await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${gcalEventId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: gcalBody.description + `\nMiro: ${miroBoardUrl}`,
      }),
    }).catch(e => console.error('GCal PATCH error:', e))
  }

  // Send ICS calendar invite to the prospect
  const icsUid = `trial-${gcalEventId}@eichenlaubphysics.com`
  const icsDescription = [
    '30-minute intro session with Mark Eichenlaub',
    meetUrl ? `Google Meet: ${meetUrl}` : '',
    miroBoardUrl ? `Miro whiteboard: ${miroBoardUrl}` : '',
  ].filter(Boolean).join('\n\n')

  const icsContent = buildIcs({
    uid: icsUid,
    summary: 'Trial session – Eichenlaub Physics',
    description: icsDescription,
    start: slotDate.toISOString(),
    end: endDate.toISOString(),
    attendeeEmails: [trimmedEmail, MARK_EMAIL],
  })

  const firstName = trimmedName.split(' ')[0]
  const confirmText = [
    `Hi ${firstName},`,
    '',
    `Your trial session is confirmed for:`,
    `  ${when}`,
    '',
    meetUrl ? `Join by video (Google Meet): ${meetUrl}` : '',
    miroBoardUrl ? `Miro whiteboard (we'll use this during the session): ${miroBoardUrl}` : '',
    '',
    `I'll be in touch before your session. Feel free to reply to this email with any questions.`,
    '',
    'Mark Eichenlaub',
    'mark@eichenlaubphysics.com',
  ].filter((l, i, arr) => !(l === '' && arr[i - 1] === '')).join('\n')

  await sendIcsEmail({
    to: [trimmedEmail],
    subject: `Trial session confirmed: ${when}`,
    text: confirmText,
    icsContent,
  })

  // Email Mark with full details
  const markText = [
    `New trial session booked!`,
    '',
    `Name:   ${trimmedName}`,
    `Email:  ${trimmedEmail}`,
    `Time:   ${when}`,
    '',
    `About them:`,
    trimmedNotes || '(No notes provided)',
    '',
    meetUrl ? `Google Meet: ${meetUrl}` : '',
    miroBoardUrl ? `Miro: ${miroBoardUrl}` : '(Miro board creation failed)',
    '',
    `Hit reply to follow up with ${trimmedEmail} with a rate and next steps.`,
  ].join('\n')

  await sendPlainEmail({
    to: [MARK_EMAIL],
    subject: `New trial session: ${trimmedName} – ${when}`,
    text: markText,
    replyTo: `${trimmedName} <${trimmedEmail}>`,
  })

  return json({ ok: true, gcal_event_id: gcalEventId, miro_board_url: miroBoardUrl, meet_url: meetUrl })
})
