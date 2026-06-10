/**
 * One-time fix for the June 25 Leo session Miro board:
 *   - Rename from "Jun 26" → "Jun 25, 2026"
 *   - Set sharing to "Anyone with the link can edit"
 *
 * Run: MIRO_ACCESS_TOKEN=<token> node scripts/fix-miro-june25.mjs
 * (Get the token from Supabase dashboard → Edge Functions → Secrets)
 */

const token = process.env.MIRO_ACCESS_TOKEN
if (!token) {
  console.error('Set MIRO_ACCESS_TOKEN env var before running this script.')
  process.exit(1)
}

const BOARD_ID = 'uXjVHJ7Lijs='  // June 25 real session board
const CORRECT_NAME = 'Leo Li-Savarese – Jun 25, 2026'

const res = await fetch(`https://api.miro.com/v2/boards/${encodeURIComponent(BOARD_ID)}`, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify({
    name: CORRECT_NAME,
    sharingPolicy: { access: 'edit' },
  }),
})

const body = await res.json()
if (res.ok) {
  console.log('Board fixed:', body.name, '| access:', body.sharingPolicy?.access)
} else {
  console.error('Miro API error:', res.status, JSON.stringify(body))
}
