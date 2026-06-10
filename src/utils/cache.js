// IndexedDB-backed key-value cache + stale-while-revalidate combinator.
//
// The portal's boot data (problem-bank JSON ~2MB, Supabase rows) is cached
// here so a returning visit renders instantly from disk while fresh data is
// fetched in the background. localStorage is too small (5MB UTF-16, shared
// with the Supabase session), hence IndexedDB.
//
// Every helper swallows IDB errors: in private browsing or a broken profile
// the app silently degrades to network-only behavior.

const DB_NAME = 'trajectory-cache'
const STORE = 'kv'
// Bump to invalidate every cached entry after a shape change.
const SCHEMA_VERSION = 1

let dbPromise = null
function openDB() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    } catch (e) {
      reject(e)
    }
  })
  return dbPromise
}

// Build a versioned cache key: k('sb', userId, 'students') etc.
export function k(...parts) {
  return `v${SCHEMA_VERSION}:` + parts.join(':')
}

export async function cacheGet(key) {
  try {
    const db = await openDB()
    return await new Promise((resolve) => {
      const req = db.transaction(STORE).objectStore(STORE).get(key)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(undefined)
    })
  } catch {
    return undefined
  }
}

export async function cacheSet(key, value) {
  try {
    const db = await openDB()
    db.transaction(STORE, 'readwrite').objectStore(STORE)
      .put({ value, savedAt: Date.now() }, key)
  } catch {
    /* cache is best-effort */
  }
}

export async function cacheDelete(key) {
  try {
    const db = await openDB()
    db.transaction(STORE, 'readwrite').objectStore(STORE).delete(key)
  } catch {
    /* cache is best-effort */
  }
}

// Remove all cached Supabase data for a user (called on sign-out so accounts
// sharing a browser never see each other's rows).
export async function cacheClearUser(userId) {
  if (!userId) return
  try {
    const db = await openDB()
    const store = db.transaction(STORE, 'readwrite').objectStore(STORE)
    const prefix = k('sb', userId)
    const req = store.getAllKeys()
    req.onsuccess = () => {
      for (const key of req.result) {
        if (typeof key === 'string' && key.startsWith(prefix)) store.delete(key)
      }
    }
  } catch {
    /* cache is best-effort */
  }
}

// Synchronously read the logged-in user's id from the Supabase session that
// supabase-js persists in localStorage — available before any network call.
export function getCachedUserId() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (/^sb-.*-auth-token$/.test(key)) {
        return JSON.parse(localStorage.getItem(key))?.user?.id || null
      }
    }
  } catch {
    /* fall through */
  }
  return null
}

// Stale-while-revalidate: returns { cached, fresh }.
//   cached — resolves from IndexedDB in ~5-15ms (undefined on miss)
//   fresh  — the network result, written through to the cache; if the network
//            fails but a cached value exists, resolves to the cached value.
// Callers apply `cached` first, then let `fresh` replace it.
export function swr(key, fetcher) {
  const cached = cacheGet(key).then(e => e?.value)
  const fresh = fetcher()
    .then(v => { cacheSet(key, v); return v })
    .catch(async err => {
      const c = await cached
      if (c !== undefined) return c
      throw err
    })
  return { cached, fresh }
}

// Cache-first variant for one-shot awaits (e.g. the session launcher): resolve
// with the cached value when present — the network fetch still runs and
// refreshes the cache for next time — otherwise wait for the network.
export async function swrFirst(key, fetcher) {
  const { cached, fresh } = swr(key, fetcher)
  fresh.catch(() => {}) // background refresh; don't surface as unhandled
  const c = await cached
  return c !== undefined ? c : fresh
}
