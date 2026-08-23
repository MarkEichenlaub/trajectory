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
