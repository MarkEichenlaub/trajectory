// Shared Miro board helpers.
//
// A session board is useless unless the student can open it. Miro creates
// boards `private` by default, which means only Mark's own account can get in —
// the student clicks the link in the calendar invite and is bounced. Every
// board therefore has to be explicitly set to "anyone with the link can edit".
//
// book-session did this; the three calendar-sync crons (leo/borna/recurring)
// each grew their own copy of the create-board call and none of them set the
// policy, so 71 of 97 upcoming boards were private. Board creation now goes
// through createSessionBoard() so there is one place that can get this wrong.

const MIRO_API = 'https://api.miro.com/v2/boards'

// "Anyone with the link can edit." Miro accepts this shape both on create and
// on update, and echoes it back under `policy.sharingPolicy` — verified against
// the live API rather than the docs, which describe only the nested form.
export const LINK_EDIT_POLICY = { access: 'edit' } as const

function miroHeaders(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

/**
 * Force a board to link-can-edit. Idempotent, so it is safe to call on every
 * sync pass as a self-heal for boards created before this was enforced.
 * Returns the resulting access level, or '' if the call failed.
 */
export async function ensureBoardSharing(token: string, boardId: string): Promise<string> {
  try {
    const res = await fetch(`${MIRO_API}/${encodeURIComponent(boardId)}`, {
      method: 'PATCH',
      headers: miroHeaders(token),
      body: JSON.stringify({ sharingPolicy: LINK_EDIT_POLICY }),
    })
    if (!res.ok) {
      console.error('Miro sharing patch failed:', boardId, res.status, await res.text())
      return ''
    }
    const data = await res.json() as {
      policy?: { sharingPolicy?: { access?: string } }
      sharingPolicy?: { access?: string }
    }
    return data.policy?.sharingPolicy?.access ?? data.sharingPolicy?.access ?? ''
  } catch (e) {
    console.error('Miro sharing patch error:', boardId, e)
    return ''
  }
}

/**
 * Create a session board the student can open from the calendar link.
 * Throws if Miro rejects the create; callers decide whether that is fatal.
 */
export async function createSessionBoard(
  token: string,
  teamId: string,
  name: string,
): Promise<{ id: string; url: string }> {
  const res = await fetch(MIRO_API, {
    method: 'POST',
    headers: miroHeaders(token),
    body: JSON.stringify({ name, teamId, sharingPolicy: LINK_EDIT_POLICY }),
  })
  if (!res.ok) throw new Error(`Miro create failed: ${res.status} ${await res.text()}`)

  const data = await res.json() as {
    id: string
    viewLink?: string
    policy?: { sharingPolicy?: { access?: string } }
  }
  const id = data.id
  const url = data.viewLink ?? `https://miro.com/app/board/${id}/`

  // Belt and suspenders: confirm the policy actually took. Miro has been known
  // to ignore sharingPolicy on create depending on the team plan.
  if (data.policy?.sharingPolicy?.access !== 'edit') await ensureBoardSharing(token, id)

  return { id, url }
}

const MIRO_LINE = 'Miro whiteboard:'

/**
 * Make sure the calendar event's description carries the board link, so the
 * student gets it in the invite. Returns true if the event was patched.
 *
 * Callers must pass the event's current description; the link is appended
 * rather than replacing the description so hand-written notes survive.
 */
export async function ensureMiroInDescription(
  accessToken: string,
  eventId: string,
  currentDescription: string,
  boardUrl: string,
): Promise<boolean> {
  if (!boardUrl) return false
  const desc = currentDescription ?? ''
  if (desc.includes(boardUrl)) return false

  // An older, now-stale board link: replace it rather than stacking a second one.
  const stale = new RegExp(`^${MIRO_LINE}.*$`, 'm')
  const next = stale.test(desc)
    ? desc.replace(stale, `${MIRO_LINE} ${boardUrl}`)
    : (desc.trimEnd() ? `${desc.trimEnd()}\n\n` : '') + `${MIRO_LINE} ${boardUrl}`

  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: next }),
      },
    )
    if (!res.ok) {
      console.error('Calendar description patch failed:', eventId, res.status, await res.text())
      return false
    }
    return true
  } catch (e) {
    console.error('Calendar description patch error:', eventId, e)
    return false
  }
}
