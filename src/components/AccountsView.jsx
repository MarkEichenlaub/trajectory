import { useState, useEffect } from 'react'
import { fetchProfiles, fetchStudentLinks, fetchInvites, deleteInvite } from '../utils/supabase'

const TYPE_COLORS = {
  admin: 'var(--accent)',
  parent: 'var(--green)',
  adult: 'var(--green)',
  student: 'var(--text-dim)',
}

// Admin overview of the account graph: who has logged in, what role they hold,
// which students they're linked to, and pending (un-accepted) invites.
export default function AccountsView({ students, showToast }) {
  const [profiles, setProfiles] = useState([])
  const [links, setLinks] = useState([])
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [groupBy, setGroupBy] = useState('student')

  function reload() {
    setLoading(true)
    Promise.all([fetchProfiles(), fetchStudentLinks(), fetchInvites()])
      .then(([p, l, i]) => { setProfiles(p); setLinks(l); setInvites(i) })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(reload, [])

  const studentName = (id) => students.find(s => s.id === id)?.name || id
  const profileByAccount = (id) => profiles.find(p => p.id === id)
  const now = Date.now()
  const pending = invites.filter(i => !i.accepted_at && new Date(i.expires_at).getTime() > now)

  async function handleRevoke(inv) {
    if (!confirm(`Revoke the pending invite for ${inv.email}?`)) return
    try {
      await deleteInvite(inv.id)
      setInvites(prev => prev.filter(i => i.id !== inv.id))
      showToast?.('Invite revoked')
    } catch (e) {
      showToast?.(e.message, 'error')
    }
  }

  if (loading) return <div className="empty-state" style={{ marginTop: 40 }}>Loading accounts… <span className="spin">⟳</span></div>
  if (err) return <div className="empty-state" style={{ color: 'var(--red)', marginTop: 40 }}>{err}</div>

  return (
    <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', padding: '20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, flex: 1 }}>Accounts &amp; Relationships</h2>
        <div style={{ display: 'flex', gap: 4 }}>
          {['student', 'account'].map(g => (
            <button key={g} className="sm" onClick={() => setGroupBy(g)}
              style={groupBy === g ? { background: 'var(--accent-dim)', color: 'var(--accent)' } : {}}>
              {g === 'student' ? 'By student' : 'By account'}
            </button>
          ))}
        </div>
        <button className="sm" onClick={reload}>Refresh</button>
      </div>

      {groupBy === 'student' ? (
        <ByStudent students={students} links={links} pending={pending}
          profileByAccount={profileByAccount} onRevoke={handleRevoke} />
      ) : (
        <ByAccount profiles={profiles} links={links} studentName={studentName} />
      )}
    </div>
  )
}

function TypeBadge({ type }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: TYPE_COLORS[type] || 'var(--text-dim)' }}>
      {type}
    </span>
  )
}

function ByStudent({ students, links, pending, profileByAccount, onRevoke }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {students.map(s => {
        const people = links.filter(l => l.student_id === s.id)
        const pend = pending.filter(i => i.student_id === s.id)
        return (
          <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: people.length || pend.length ? 10 : 0 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
              <span style={{ fontSize: 11, color: (s.status || 'active') === 'active' ? 'var(--green)' : 'var(--text-dim)' }}>
                {(s.status || 'active') === 'active' ? '● active' : '○ inactive'}
              </span>
            </div>
            {people.length === 0 && pend.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>No linked accounts yet.</div>
            )}
            {people.map(l => {
              const p = profileByAccount(l.account_id)
              return (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '3px 0' }}>
                  <span style={{ width: 56, flexShrink: 0, color: 'var(--text-dim)', fontSize: 11 }}>
                    {l.relationship === 'self' ? 'self' : 'parent'}
                  </span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p?.email || '(unknown account)'}
                  </span>
                  {p && <TypeBadge type={p.account_type} />}
                </div>
              )
            })}
            {pend.map(i => (
              <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '3px 0' }}>
                <span style={{ width: 56, flexShrink: 0, color: 'var(--yellow)', fontSize: 11 }}>
                  {i.relationship === 'self' ? 'self' : 'parent'}
                </span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.email}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--yellow)' }}>INVITED</span>
                <button className="sm danger" style={{ fontSize: 11, padding: '1px 6px' }} onClick={() => onRevoke(i)}>Revoke</button>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function ByAccount({ profiles, links, studentName }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {profiles.length === 0 && <div className="empty-state">No accounts yet.</div>}
      {profiles.map(p => {
        const mine = links.filter(l => l.account_id === p.id)
        return (
          <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                {p.email} <TypeBadge type={p.account_type} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                {mine.length === 0
                  ? 'No students linked'
                  : mine.map(l => `${studentName(l.student_id)} (${l.relationship})`).join(', ')}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
