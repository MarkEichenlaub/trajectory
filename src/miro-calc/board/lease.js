// Single-evaluator election: if Mark has the board open in two tabs, only one
// engine host evaluates. Lease lives in board storage; a same-origin
// BroadcastChannel gives fast intra-browser coordination.
/* global miro */
import { STORAGE_COLLECTION } from './widget.js'

const LEASE_KEY = 'lease'
const RENEW_MS = 15000
// Headless (hidden cross-origin) iframes get their timers throttled by Chrome
// to ~1/minute, so a headless leaseholder may renew that slowly — staleness
// must be comfortably above one minute.
const STALE_MS = 150000

// priority: 2 = panel host (visible iframe, fast ticks — preferred),
//           1 = headless host (throttled safety net when the panel is closed).
export function createLease(priority = 1) {
  const sessionId = Math.random().toString(36).slice(2, 12)
  let leader = false
  let stopped = false
  let timer = null

  async function step() {
    if (stopped) return
    const col = miro.board.storage.collection(STORAGE_COLLECTION)
    let lease = null
    try {
      lease = await col.get(LEASE_KEY)
    } catch {
      /* treat as absent */
    }
    const now = Date.now()
    const mine = lease && lease.sessionId === sessionId
    const stale = !lease || !lease.ts || now - lease.ts > STALE_MS
    const outranked = lease && (lease.priority ?? 1) < priority
    if (mine || stale || outranked) {
      try {
        await col.set(LEASE_KEY, { sessionId, ts: now, priority })
        leader = true
      } catch {
        leader = false
      }
    } else {
      leader = false
    }
  }

  async function start() {
    await step()
    timer = setInterval(step, RENEW_MS)
    window.addEventListener('pagehide', release)
  }

  async function release() {
    stopped = true
    if (timer) clearInterval(timer)
    if (leader) {
      try {
        await miro.board.storage.collection(STORAGE_COLLECTION).remove(LEASE_KEY)
      } catch {
        /* best effort */
      }
    }
    leader = false
  }

  return {
    start,
    release,
    isLeader: () => leader,
    // a higher-priority host announced itself (via BroadcastChannel) — yield
    // immediately instead of waiting for the next (possibly throttled) step
    demote: () => {
      leader = false
    },
    sessionId,
    priority,
  }
}

export async function createBus() {
  let boardId = 'board'
  try {
    const info = await miro.board.getInfo()
    boardId = info.id
  } catch {
    /* fall back to a shared channel */
  }
  const channel = new BroadcastChannel(`miro-calc:${boardId}`)
  const listeners = new Set()
  channel.onmessage = (ev) => {
    for (const cb of listeners) cb(ev.data)
  }
  return {
    boardId,
    send: (msg) => channel.postMessage(msg),
    on: (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
  }
}
