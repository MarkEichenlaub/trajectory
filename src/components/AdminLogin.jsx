import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.href },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  return (
    <div className="student-login-wrap">
      <div className="student-login">
        <div className="student-login-logo">Eichenlaub Physics</div>
        <p className="student-login-greeting">Admin sign-in</p>
        {sent ? (
          <div className="student-login-sent">
            <div style={{ fontSize: 32, marginBottom: 12 }}>✉</div>
            <p>Check your email for a login link.</p>
            <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
              The link expires after 1 hour.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="student-login-form">
            <label>Your email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
            {error && <p className="student-login-error">{error}</p>}
            <button type="submit" className="primary" disabled={loading}>
              {loading ? 'Sending…' : 'Send login link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
