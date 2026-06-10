// Boot prefetch: imported FIRST from main.jsx, so every network request the
// portal needs is already in flight before React mounts. Which Supabase
// queries to fire is decided from the *cached* account (localStorage), so we
// never wait on the resolve_my_account RPC to start loading data.
//
// Components consume these entries via bootEntry(); a cold first login (no
// cached account) simply gets `undefined` back and fetches directly.

import {
  fetchStudents, fetchAssignments, fetchSessions, fetchHandouts,
  fetchStudentAssignments, fetchStudentSessions, fetchHandoutsPublic,
  fetchMyAccessibleSources,
} from './supabase'
import { fetchJSON } from './github'
import { fetchAopsProblems } from './problemBank'
import { swr, k, getCachedUserId } from './cache'

const PORTAL_ROLES = ['student', 'parent', 'adult']

export function readCachedAccount(userId) {
  if (!userId) return null
  try {
    return JSON.parse(localStorage.getItem(`traj:acct:${userId}`))
  } catch {
    return null
  }
}

export function writeCachedAccount(userId, account) {
  if (!userId) return
  try {
    localStorage.setItem(`traj:acct:${userId}`, JSON.stringify(account))
  } catch {
    /* best-effort */
  }
}

export function clearCachedAccount(userId) {
  if (!userId) return
  try {
    localStorage.removeItem(`traj:acct:${userId}`)
  } catch {
    /* best-effort */
  }
}

// Who was logged in when this page loaded (sync reads, ~0ms).
export const bootUserId = getCachedUserId()
export const bootAccount = readCachedAccount(bootUserId)

const boot = {}
if (bootUserId) {
  // Problem-bank JSON is public and role-independent.
  boot.problems = swr(k('gh', 'problems'), () => fetchJSON('data/problems.json'))
  boot.aops = swr(k('gh', 'aops'), fetchAopsProblems)

  if (bootAccount?.role === 'admin') {
    boot.students = swr(k('sb', bootUserId, 'students'), fetchStudents)
    boot.assignments = swr(k('sb', bootUserId, 'assignments'), fetchAssignments)
    boot.sessions = swr(k('sb', bootUserId, 'sessions'), () => fetchSessions())
    boot.handouts = swr(k('sb', bootUserId, 'handouts'), () => fetchHandouts().catch(() => []))
  } else if (PORTAL_ROLES.includes(bootAccount?.role)) {
    boot.portalAssignments = swr(k('sb', bootUserId, 'portal', 'assignments'), fetchStudentAssignments)
    boot.portalSessions = swr(k('sb', bootUserId, 'portal', 'sessions'), fetchStudentSessions)
    boot.portalHandouts = swr(k('sb', bootUserId, 'portal', 'handouts'), () => fetchHandoutsPublic().catch(() => []))
    boot.portalSources = swr(k('sb', bootUserId, 'portal', 'sources'), () => fetchMyAccessibleSources().catch(() => []))
  }
}

// Hand out a prefetched entry, but only to the user it was fetched for — if a
// different account signed in after page load the entry is withheld and the
// caller fetches fresh.
export function bootEntry(name, userId) {
  if (!userId || userId !== bootUserId) return undefined
  return boot[name]
}
