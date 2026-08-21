const SB_SECRET_KEY = Deno.env.get('SB_SECRET_KEY')!
const MIRO_ACCESS_TOKEN = Deno.env.get('MIRO_ACCESS_TOKEN')!
const MIRO_TEAM_ID = Deno.env.get('MIRO_TEAM_ID')!

// One-off admin utility: creates real Miro boards (with a few sticky notes each)
// for backfilling demo/historical session data, using the same MIRO_ACCESS_TOKEN
// board-creation call as book-session. Not reachable without the secret key, and
// deployed --no-verify-jwt since the caller is a local admin script sending
// `Authorization: Bearer <SB_SECRET_KEY>` (not a user JWT).
//
// Usage: POST { boards: [{ key, name, notes: string[] }], cleanupPrefix?: string }
// -> { results: [{ key, id, url }], cleaned?: number }
//
// cleanupPrefix: if set, deletes any OTHER team board whose name starts with
// this prefix (i.e. not one just (re)created in this call) — makes reruns of
// a failed/partial seeding pass idempotent instead of piling up orphan boards.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok')
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const auth = req.headers.get('authorization') || ''
  if (auth !== `Bearer ${SB_SECRET_KEY}`) return json({ error: 'unauthorized' }, 401)

  const { boards, cleanupPrefix } = await req.json().catch(() => ({}))
  if (!Array.isArray(boards) || !boards.length) return json({ error: 'boards[] required' }, 400)

  const results = []
  for (const b of boards) {
    const { key, name, notes } = b as { key: string; name: string; notes?: string[] }
    try {
      const createRes = await fetch('https://api.miro.com/v2/boards', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${MIRO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ name, teamId: MIRO_TEAM_ID, sharingPolicy: { access: 'edit' } }),
      })
      if (!createRes.ok) {
        results.push({ key, error: `board create failed: ${createRes.status} ${await createRes.text()}` })
        continue
      }
      const board = await createRes.json() as Record<string, unknown>
      const id = board.id as string
      const url = (board.viewLink as string) ?? `https://miro.com/app/board/${id}/`

      // Belt-and-suspenders sharing policy, same as book-session.
      await fetch(`https://api.miro.com/v2/boards/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${MIRO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ sharingPolicy: { access: 'edit' } }),
      })

      for (let i = 0; i < (notes || []).length; i++) {
        await fetch(`https://api.miro.com/v2/boards/${id}/sticky_notes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${MIRO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            data: { content: notes[i] },
            position: { x: (i % 3) * 320, y: Math.floor(i / 3) * 320 },
            style: { fillColor: 'light_yellow' },
          }),
        })
      }

      results.push({ key, id, url })
    } catch (e) {
      results.push({ key, error: String(e) })
    }
  }

  let cleaned
  if (cleanupPrefix) {
    const keep = new Set(results.map(r => r.id).filter(Boolean))
    const stray = await findBoardsByPrefix(cleanupPrefix, keep)
    for (const id of stray) {
      await fetch(`https://api.miro.com/v2/boards/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${MIRO_ACCESS_TOKEN}` },
      })
    }
    cleaned = stray.length
  }

  return json({ results, cleaned })
})

async function findBoardsByPrefix(prefix: string, exclude: Set<string>): Promise<string[]> {
  const stray: string[] = []
  let cursor: string | undefined
  do {
    const url = new URL('https://api.miro.com/v2/boards')
    url.searchParams.set('team_id', MIRO_TEAM_ID)
    url.searchParams.set('limit', '50')
    if (cursor) url.searchParams.set('cursor', cursor)
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${MIRO_ACCESS_TOKEN}`, Accept: 'application/json' },
    })
    if (!res.ok) break
    const page = await res.json() as { data?: { id: string; name?: string }[]; cursor?: string }
    for (const b of page.data || []) {
      if (b.name?.startsWith(prefix) && !exclude.has(b.id)) stray.push(b.id)
    }
    cursor = page.cursor
  } while (cursor)
  return stray
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
