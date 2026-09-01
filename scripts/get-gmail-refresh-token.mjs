// One-time setup for the homework-email agent: mints a Gmail API refresh
// token via the OAuth "installed app" flow and prints it so it can be pasted
// into .env as GMAIL_REFRESH_TOKEN. Reuses the same GOOGLE_CLIENT_ID/
// GOOGLE_CLIENT_SECRET already used for Calendar access (see
// supabase/functions/_shared/google-auth.ts) — those must already be present
// in .env for this to run (the edge functions only have them as Supabase
// secrets, which aren't readable back out, so copy the values into .env once).
//
// Usage:
//   node scripts/get-gmail-refresh-token.mjs
// Opens a consent screen in your browser. Approve it, then this prints the
// refresh token to paste into .env.
//
// If Google rejects the redirect with "redirect_uri_mismatch": the OAuth
// client (GOOGLE_CLIENT_ID) needs http://127.0.0.1:53682/oauth2callback
// added as an authorized redirect URI in Google Cloud Console > APIs &
// Services > Credentials, under that client's "Web application" settings.

import http from 'http'
import { exec } from 'child_process'
import { readFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PORT = 53682
const REDIRECT_URI = `http://127.0.0.1:${PORT}/oauth2callback`
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
].join(' ')

const envText = await readFile(resolve(ROOT, '.env'), 'utf8')
const env = Object.fromEntries(
  envText.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const CLIENT_ID = env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    'ERROR: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not found in .env.\n' +
    'These are already set as Supabase edge function secrets (used by gcal-webhook etc.)\n' +
    'but secrets are write-only once set — copy the same values into .env as\n' +
    'GOOGLE_CLIENT_ID=... and GOOGLE_CLIENT_SECRET=... (from wherever they were\n' +
    'originally saved, or Google Cloud Console > Credentials), then re-run this.'
  )
  process.exit(1)
}

const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  response_type: 'code',
  scope: SCOPES,
  access_type: 'offline',
  prompt: 'consent', // forces a refresh_token even if this account has consented before
})

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI)
  if (url.pathname !== '/oauth2callback') { res.writeHead(404); res.end(); return }

  const code = url.searchParams.get('code')
  const err = url.searchParams.get('error')

  if (err) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`<h2>Google reported an error: ${err}</h2>You can close this tab.`)
    console.error(`Google returned an error: ${err}`)
    server.close()
    process.exit(1)
  }
  if (!code) {
    res.writeHead(400)
    res.end('Missing ?code')
    return
  }

  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end('<h2>Got it — you can close this tab.</h2>Check your terminal.')

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })
    const data = await tokenRes.json()
    if (!tokenRes.ok) {
      console.error('Token exchange failed:', tokenRes.status, JSON.stringify(data))
      if (data.error === 'redirect_uri_mismatch') {
        console.error(`\nAdd ${REDIRECT_URI} as an authorized redirect URI for this OAuth client in Google Cloud Console.`)
      }
      process.exit(1)
    }
    if (!data.refresh_token) {
      console.error(
        'No refresh_token in the response. This usually means the account already has\n' +
        'a live grant for this client without offline access — try again; the\n' +
        '?prompt=consent on the auth URL should force one. If it still doesn\'t appear,\n' +
        'revoke prior access at https://myaccount.google.com/permissions and retry.'
      )
      process.exit(1)
    }
    console.log('\nSuccess. Add this line to .env:\n')
    console.log(`GMAIL_REFRESH_TOKEN=${data.refresh_token}\n`)
  } catch (e) {
    console.error('Token exchange request failed:', e.message)
    process.exit(1)
  } finally {
    server.close()
    process.exit(0)
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Opening consent screen in your browser (listening on ${REDIRECT_URI} for the redirect)...\n`)
  console.log(`If it doesn't open automatically, visit:\n${authUrl}\n`)
  const opener = process.platform === 'win32' ? `start "" "${authUrl}"`
    : process.platform === 'darwin' ? `open "${authUrl}"`
    : `xdg-open "${authUrl}"`
  exec(opener, () => {})
})
