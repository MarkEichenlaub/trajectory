// Shared by the generalized recurring-schedule functions. The per-student
// Leo/Borna functions each duplicate this; new functions import it instead
// rather than adding a fourth copy.

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') || ''
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') || ''
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN') || ''

export async function getGoogleAccessToken(): Promise<string | null> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) return null
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
  if (!res.ok) {
    console.error('Google token refresh failed:', res.status, await res.text())
    return null
  }
  const data = await res.json() as { access_token?: string }
  return data.access_token ?? null
}

export function toCompactUTC(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, '')
}

export type CalEvent = {
  id: string
  summary?: string
  description?: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  hangoutLink?: string
  conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> }
}

/**
 * List calendar events matching `query` in a time range, following pageToken to
 * the end of the result set.
 *
 * Returns ok:false if the listing could not be completed. Callers MUST NOT treat
 * that as "no events exist" — the sync functions delete sessions that have no
 * matching event, so a failed or partial listing deletes a real schedule. This
 * previously ran with maxResults=50 and no paging, which silently truncated any
 * student with more than 50 events in the window (5-a-week schedules hit it) and
 * then deleted the overflow as orphans on every run.
 */
export async function listCalendarEvents(
  accessToken: string,
  query: string,
  timeMin: string,
  timeMax: string,
): Promise<{ ok: boolean; events: CalEvent[] }> {
  const events: CalEvent[] = []
  let pageToken = ''
  for (let page = 0; page < 20; page++) {
    const params = new URLSearchParams({
      q: query, timeMin, timeMax,
      singleEvents: 'true', orderBy: 'startTime', maxResults: '250',
    })
    if (pageToken) params.set('pageToken', pageToken)
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } },
    )
    if (!res.ok) {
      console.error('Calendar list failed:', query, res.status, await res.text())
      return { ok: false, events: [] }
    }
    const data = await res.json() as { items?: CalEvent[]; nextPageToken?: string }
    events.push(...(data.items ?? []))
    if (!data.nextPageToken) return { ok: true, events }
    pageToken = data.nextPageToken
  }
  // Bail rather than reconcile against a partial view of the calendar.
  console.error('Calendar list exceeded page limit for', query)
  return { ok: false, events: [] }
}

// Return the event's existing Google Meet link, or create one and return it.
export async function ensureMeet(accessToken: string, event: CalEvent): Promise<string> {
  const existing = event.hangoutLink ||
    event.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri || ''
  if (existing) return existing
  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.id}?conferenceDataVersion=1`,
      {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conferenceData: {
            createRequest: {
              requestId: `meet-${event.id}-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        }),
      },
    )
    if (res.ok) {
      const data = await res.json() as CalEvent
      return data.hangoutLink ||
        data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri || ''
    }
    console.error('Meet create failed:', res.status, await res.text())
  } catch (e) {
    console.error('Meet create error:', e)
  }
  return ''
}
