import { useState } from 'react'
import { createInvite, setStudentStatus, cancelUpcomingSessions } from '../../utils/supabase'

// Parent/adult self-service: invite another guardian and pause/resume the
// student. Both go through server-authorized paths (create-invite edge function
// and set_student_status RPC), which verify billing access.
export default function AccountManagement({ student, relationship, isPreview }) {
  const [status, setStatus] = useState(student?.status || 'active')
  const [busy, setBusy] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  async function handleToggleStatus() {
    const next = status === 'active' ? 'inactive' : 'active'
    setBusy(true); setErr(null); setMsg(null)
    try {
      await setStudentStatus(student.id, next)
      if (next === 'inactive') await cancelUpcomingSessions(student.id)
      setStatus(next)
      setMsg(next === 'inactive'
        ? `${student.name} is paused — upcoming sessions cancelled, automated emails and invoicing will stop.`
        : `${student.name} is active again.`)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleInvite() {
    const addr = inviteEmail.trim().toLowerCase()
    if (sending || !addr) return
    setSending(true); setErr(null); setMsg(null)
    try {
      await createInvite({ student_id: student.id, email: addr, relationship: 'parent', account_type: 'parent' })
      setInviteEmail('')
      setMsg(`Invitation sent to ${addr}. They'll get access by signing in with that email.`)
    } catch (e) {
      setErr(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Account</h3>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, flex: 1, minWidth: 180 }}>
            Status: <strong style={{ color: status === 'active' ? 'var(--green)' : 'var(--text-dim)' }}>{status}</strong>
          </span>
          <button className="sm" disabled={busy || isPreview} onClick={handleToggleStatus}>
            {busy ? '…' : status === 'active' ? 'Pause tutoring' : 'Resume tutoring'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '8px 0 0', lineHeight: 1.5 }}>
          Pausing cancels all upcoming sessions and stops automated emails and invoicing.
        </p>
      </div>

      {relationship !== 'self' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
          <div style={{ fontSize: 13, marginBottom: 8 }}>Invite another parent or guardian</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
              placeholder="email@example.com"
              style={{ flex: 1, minWidth: 200 }}
            />
            <button className="sm primary" disabled={sending || isPreview || !inviteEmail.trim()} onClick={handleInvite}>
              {sending ? 'Sending…' : 'Send invite'}
            </button>
          </div>
        </div>
      )}

      {isPreview && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>Preview only — actions are disabled.</div>}
      {msg && <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>{msg}</div>}
      {err && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{err}</div>}
    </div>
  )
}
