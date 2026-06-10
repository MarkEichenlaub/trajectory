import { useState, useEffect } from 'react'
import { supabase, resolveMyAccount } from './utils/supabase'
import { bootUserId, bootAccount, writeCachedAccount, clearCachedAccount } from './utils/boot'
import { cacheClearUser } from './utils/cache'
import StudentLogin from './components/StudentLogin'
import AdminApp from './components/AdminApp'
import PortalApp from './components/PortalApp'
import SessionLauncher from './components/SessionLauncher'

const SUPPORT_EMAIL = 'mark@eichenlaubphysics.com'
const PORTAL_ROLES = ['student', 'parent', 'adult']

// Single entry point. The URL is always "/": who you are is decided by which
// account you log in as, not a query param. After auth we resolve the account
// once (which also grandfathers first-time logins) and route by role.
//
// Returning visits render instantly: the last-resolved account is cached in
// localStorage (see utils/boot.js), so the role-appropriate app mounts without
// waiting on auth or the resolve RPC — both still run and correct the state if
// anything changed (sign-out elsewhere, role revoked, …).
export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [account, setAccount] = useState(() => bootAccount)
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  // Derive a stable userId so this effect only re-runs when the user actually
  // changes (sign-in / sign-out), not on every TOKEN_REFRESHED event that
  // Supabase fires when the tab regains focus — which was resetting the portal.
  const userId = session === undefined ? undefined : (session?.user?.id ?? null)

  useEffect(() => {
    if (userId === undefined) return
    if (!userId) {
      setAccount(null)
      // Signed out: drop this browser's cached account + data so another
      // account on the same machine can't see it.
      clearCachedAccount(bootUserId)
      cacheClearUser(bootUserId)
      return
    }
    // Only show the blocking spinner when there's no cached account to render.
    if (!account) setResolving(true)
    resolveMyAccount()
      .then(acct => {
        setAccount(acct)
        writeCachedAccount(userId, acct)
      })
      .catch(e => setAccount(prev => prev || { role: 'none', students: [], error: e.message }))
      .finally(() => setResolving(false))
  }, [userId])

  const signOut = () => supabase.auth.signOut()

  // With a cached account we render immediately, even while the session is
  // still being confirmed; if auth turns out to be gone, the effects above
  // null the account and we fall back to the login screen.
  if (!account) {
    if (session === undefined || resolving) {
      return <div className="empty-state" style={{ marginTop: 80 }}>Loading… <span className="spin">⟳</span></div>
    }
    if (!session) return <StudentLogin />
    return <div className="empty-state" style={{ marginTop: 80 }}>Loading… <span className="spin">⟳</span></div>
  }

  if (session === null) return <StudentLogin />

  const effectiveUserId = userId ?? bootUserId

  if (account.role === 'admin') {
    if (window.location.pathname.startsWith('/launch')) return <SessionLauncher />
    return <AdminApp userId={effectiveUserId} />
  }

  if (PORTAL_ROLES.includes(account.role) && (account.students || []).length > 0) {
    return <PortalApp account={account} userId={effectiveUserId} onSignOut={signOut} />
  }

  return <NoAccess email={session?.user?.email} />
}

function NoAccess({ email }) {
  return (
    <div className="student-login-wrap">
      <div className="student-login">
        <div className="student-login-logo">Eichenlaub Physics</div>
        <p className="student-login-error" style={{ marginTop: 16 }}>
          We couldn't find an account for <strong>{email}</strong>.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>
          If you were expecting access, contact{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and we'll get you set up.
        </p>
        <button className="sm" style={{ marginTop: 16 }} onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>
    </div>
  )
}
