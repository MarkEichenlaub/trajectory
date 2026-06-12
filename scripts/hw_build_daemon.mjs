// Homework build daemon — subscribes to Supabase Realtime and automatically
// starts a Claude Code build session whenever a new homework packet is requested.
//
// Usage:
//   node scripts/hw_build_daemon.mjs
//
// Keep this running in a terminal (or add to Windows startup).
// When you click "Create assignment" in the portal, Claude Code opens
// automatically and builds the packet without any further action from you.

import { createClient } from '@supabase/supabase-js'
import { appendFileSync, readFileSync } from 'fs'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const LOG_FILE = join(REPO_ROOT, 'logs', 'hw_build_daemon.log')
const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'

function readServiceKey() {
  if (process.env.SUPABASE_SERVICE_KEY) return process.env.SUPABASE_SERVICE_KEY
  const env = readFileSync(join(REPO_ROOT, '.env'), 'utf8')
  const m = env.match(/VITE_SUPABASE_SERVICE_KEY\s*=\s*(.+)/)
  if (!m) throw new Error('VITE_SUPABASE_SERVICE_KEY not found in .env')
  return m[1].trim().replace(/^['"]|['"]$/g, '')
}

function log(msg) {
  const ts = new Date().toLocaleString()
  const line = `[${ts}] ${msg}`
  console.log(line)
  try { appendFileSync(LOG_FILE, line + '\n') } catch (_) {}
}

let buildInProgress = false

function triggerBuild(record) {
  if (buildInProgress) {
    log(`Build already in progress — skipping trigger for ${record.id}`)
    return
  }
  buildInProgress = true
  log(`New homework request detected: ${record.name || record.id}`)
  log('Starting Claude Code build session...')

  // Open a new Windows Terminal tab running Claude Code.
  // --dangerously-skip-permissions lets it run tool calls without prompting.
  const claudeCmd = `claude --dangerously-skip-permissions -p "build the homework"`
  const proc = spawn(
    'wt',
    ['-w', '0', 'new-tab', '--title', 'HW Build', 'pwsh', '-NoExit', '-Command',
     `cd '${REPO_ROOT}'; ${claudeCmd}`],
    { detached: true, stdio: 'ignore' }
  )
  proc.unref()

  // Reset the lock after a generous window — the build can take several minutes.
  // Claude Code's own deduplication handles simultaneous requests from the portal.
  setTimeout(() => { buildInProgress = false }, 10 * 60 * 1000)
}

async function startRealtime(supabase) {
  log('Connecting to Supabase Realtime...')

  // If SUBSCRIBED is never received within 30s, force a reconnect so the daemon
  // doesn't silently stop catching events after a dropped connection.
  let subscribeTimer = setTimeout(() => {
    log('Subscribe timed out after 30s — reconnecting...')
    try { supabase.removeAllChannels() } catch (_) {}
    startRealtime(supabase)
  }, 30_000)

  supabase
    .channel('hw-build-requests')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'handouts', filter: 'status=eq.requested' },
      ({ new: record }) => triggerBuild(record)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'handouts', filter: 'status=eq.requested' },
      ({ new: record }) => triggerBuild(record)
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        clearTimeout(subscribeTimer)
        log('Listening for homework build requests. Waiting...')
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        clearTimeout(subscribeTimer)
        log(`Realtime error (${status}): ${err?.message ?? ''}. Reconnecting in 10s...`)
        setTimeout(() => startRealtime(supabase), 10_000)
      } else if (status === 'CLOSED') {
        clearTimeout(subscribeTimer)
        log('Realtime channel closed. Reconnecting in 5s...')
        setTimeout(() => startRealtime(supabase), 5_000)
      }
    })
}

const supabase = createClient(SUPABASE_URL, readServiceKey(), {
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 2 } }
})

log('Homework build daemon starting...')
startRealtime(supabase)

// Keep process alive
process.on('SIGINT', () => {
  log('Daemon stopped.')
  process.exit(0)
})
