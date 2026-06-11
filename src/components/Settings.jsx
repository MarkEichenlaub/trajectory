import { useState, useEffect } from 'react'
import { fetchStudentContacts, createInvite, setStudentStatus, cancelUpcomingSessions, fetchStudentAccessibleSources, saveStudentAccessibleSources, fetchProfiles, fetchStudentLinks, fetchInvites, deleteInvite } from '../utils/supabase'
import ContactsPanel from './portal/ContactsPanel'

const TYPE_COLORS = {
  admin: 'var(--accent)',
  parent: 'var(--green)',
  adult: 'var(--green)',
  student: 'var(--text-dim)',
}

export default function Settings({ student, students, allSources, onSaveStudent, onStatusChange, onRefreshData, onStudentAdded, showToast }) {
  const [saving, setSaving] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  async function handleRefreshData() {
    setRefreshing(true)
    try {
      await onRefreshData()
      showToast('Problem bank refreshed from GitHub')
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setRefreshing(false)
    }
  }

  async function handleSave(s) {
    setSaving(s.id)
    await onSaveStudent(s)
    setSaving(null)
  }

  async function handleRemove(s) {
    if (!confirm(`Remove ${s.name}? (Assignment history is kept.)`)) return
    await onSaveStudent(s, true)
  }

  async function handleAdd() {
    const name = prompt('Student full name (first and last)?')
    if (!name) return
    const parts = name.trim().split(/\s+/)
    const first_name = parts[0]
    const last_name = parts.slice(1).join(' ')
    const id = name.trim().toLowerCase().replace(/\s+/g, '-')
    const newStudent = { id, name: name.trim(), first_name, last_name, email: '', notes: '' }
    await onSaveStudent(newStudent)
    onStudentAdded?.(id)
  }

  return (
    <div className="settings-view">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>Students</h3>
        {student ? (
          <StudentCard
            key={student.id}
            student={student}
            allSources={allSources || []}
            onSave={handleSave}
            onRemove={handleRemove}
            onStatusChange={onStatusChange}
            saving={saving === student.id}
            showToast={showToast}
          />
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-dim)', padding: '8px 0' }}>No student selected.</div>
        )}
        <button onClick={handleAdd} style={{ marginTop: 8 }}>+ Add Student</button>
      </div>

      {onRefreshData && (
        <div className="settings-section">
          <h3>Data</h3>
          <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: '4px 0 10px' }}>
            The problem bank is cached locally for instant loads and refreshed in the
            background. Force a refetch if you just committed new problems.
          </p>
          <button onClick={handleRefreshData} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh problem bank'}
          </button>
        </div>
      )}
    </div>
  )
}

function StudentCard({ student, allSources, onSave, onRemove, onStatusChange, saving, showToast }) {
  const [draft, setDraft] = useState({ ...student })
  const [showBank, setShowBank] = useState(false)
  const [accessibleSources, setAccessibleSources] = useState(null)
  const [togglingStatus, setTogglingStatus] = useState(false)
  const dirty = JSON.stringify(draft) !== JSON.stringify(student)
  // contacts always visible
  const status = student.status || 'active'

  useEffect(() => {
    if (!showBank || accessibleSources !== null) return
    fetchStudentAccessibleSources(student.id)
      .then(setAccessibleSources)
      .catch(() => setAccessibleSources([]))
  }, [showBank, student.id, accessibleSources])

  async function handleToggleSource(source) {
    const current = accessibleSources || []
    const next = current.includes(source)
      ? current.filter(s => s !== source)
      : [...current, source]
    setAccessibleSources(next)
    try {
      await saveStudentAccessibleSources(student.id, next)
    } catch (e) {
      showToast(e.message, 'error')
      setAccessibleSources(current)
    }
  }

  function set(field, value) {
    setDraft(d => {
      const next = { ...d, [field]: value }
      if (field === 'first_name' || field === 'last_name') {
        const fn = field === 'first_name' ? value : d.first_name
        const ln = field === 'last_name' ? value : d.last_name
        next.name = [fn, ln].filter(Boolean).join(' ')
      }
      return next
    })
  }

  async function handleToggleStatus() {
    const next = status === 'active' ? 'inactive' : 'active'
    setTogglingStatus(true)
    try {
      await setStudentStatus(student.id, next)
      if (next === 'inactive') await cancelUpcomingSessions(student.id)
      set('status', next)
      onStatusChange?.(student.id, next)
      showToast(`${student.name} marked ${next}`)
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setTogglingStatus(false)
    }
  }

  return (
    <div className="student-card">
      <div className="student-card-row">
        <label>First name</label>
        <input value={draft.first_name || ''} onChange={e => set('first_name', e.target.value)} />
        <button
          className="sm"
          style={{ color: status === 'active' ? 'var(--green)' : 'var(--text-dim)' }}
          disabled={togglingStatus}
          title={status === 'active' ? 'Active — click to make inactive' : 'Inactive — click to reactivate'}
          onClick={handleToggleStatus}
        >
          {togglingStatus ? '…' : status === 'active' ? '● active' : '○ inactive'}
        </button>
        <button className="sm danger" onClick={() => onRemove(student)}>Remove</button>
      </div>
      <div className="student-card-row">
        <label>Last name</label>
        <input value={draft.last_name || ''} onChange={e => set('last_name', e.target.value)} />
      </div>
      <div className="student-card-row">
        <label>Email</label>
        <input value={draft.email || ''} onChange={e => set('email', e.target.value)} placeholder="student@example.com" />
      </div>
      <div className="student-card-row">
        <label>Billing name</label>
        <input value={draft.billing_name || ''} onChange={e => set('billing_name', e.target.value)} placeholder="Parent / guardian name on invoice" />
      </div>
      <div className="student-card-row">
        <label>Notes</label>
        <input value={draft.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="General notes" />
      </div>
      {dirty && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button className="sm primary" onClick={() => onSave(draft)} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}
      <InviteRow studentId={student.id} showToast={showToast} />
      <ContactsSection studentId={student.id} showToast={showToast} />
      <LinkedAccountsSection studentId={student.id} showToast={showToast} />
      <div className="student-card-row" style={{ marginTop: 4 }}>
        <label style={{ color: 'var(--text-dim)' }}>Problem bank</label>
        <button
          className="sm"
          style={{ fontSize: 11 }}
          onClick={() => setShowBank(v => !v)}
        >
          {showBank ? 'Hide' : 'Manage'}
        </button>
        {accessibleSources !== null && (
          <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 6 }}>
            {accessibleSources.length} source{accessibleSources.length !== 1 ? 's' : ''} accessible
          </span>
        )}
      </div>
      {showBank && (
        <div style={{ paddingLeft: 68, paddingBottom: 4 }}>
          {accessibleSources === null ? (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '4px 0' }}>Loading…</div>
          ) : allSources.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '4px 0' }}>No problem sources available yet.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', paddingTop: 4 }}>
              {allSources.map(source => (
                <label key={source} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap', color: accessibleSources.includes(source) ? 'var(--accent)' : 'var(--text)' }}>
                  <input
                    type="checkbox"
                    checked={accessibleSources.includes(source)}
                    onChange={() => handleToggleSource(source)}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  {source}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Sends a portal invitation. relationship 'self' (the student / adult self-payer)
// or 'parent'. The invitee accepts by signing in with the invited email.
function InviteRow({ studentId, showToast }) {
  const [email, setEmail] = useState('')
  const [kind, setKind] = useState('parent')
  const [sending, setSending] = useState(false)

  async function handleInvite() {
    const addr = email.trim().toLowerCase()
    if (sending || !addr) return
    setSending(true)
    try {
      const relationship = kind === 'parent' ? 'parent' : 'self'
      const account_type = kind === 'parent' ? 'parent' : kind === 'adult' ? 'adult' : 'student'
      await createInvite({ student_id: studentId, email: addr, relationship, account_type })
      setEmail('')
      showToast(`Invitation sent to ${addr}`)
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="student-card-row" style={{ marginTop: 4 }}>
      <label style={{ color: 'var(--text-dim)' }}>Invite</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleInvite()}
        placeholder="email to invite"
        style={{ fontSize: 12 }}
      />
      <select
        value={kind}
        onChange={e => setKind(e.target.value)}
        style={{ fontSize: 12, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 4, padding: '4px 6px' }}
      >
        <option value="parent">parent</option>
        <option value="student">student</option>
        <option value="adult">adult (self-pay)</option>
      </select>
      <button className="sm" disabled={sending || !email.trim()} onClick={handleInvite}>
        {sending ? '…' : 'Send invite'}
      </button>
    </div>
  )
}

// Thin loader around the shared ContactsPanel (the same full contacts UI used
// in Billing and the student portal) so the logic can't drift between views.
function ContactsSection({ studentId, showToast }) {
  const [contacts, setContacts] = useState(null)

  useEffect(() => {
    fetchStudentContacts(studentId)
      .then(setContacts)
      .catch(e => showToast(e.message, 'error'))
  }, [studentId])

  if (contacts === null) {
    return <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '4px 0 4px 68px' }}>Loading…</div>
  }

  return (
    <div style={{ paddingLeft: 68, paddingBottom: 4 }}>
      <ContactsPanel
        studentId={studentId}
        contacts={contacts}
        setContacts={setContacts}
        isAdmin={true}
        canBill={true}
        isStudentRole={false}
      />
    </div>
  )
}

// Shows the auth accounts that can log into the portal for this student,
// plus any pending (un-accepted) invites with a revoke button.
function LinkedAccountsSection({ studentId, showToast }) {
  const [data, setData] = useState(null)

  function reload() {
    setData(null)
    const now = Date.now()
    Promise.all([fetchProfiles(), fetchStudentLinks(), fetchInvites()])
      .then(([profiles, allLinks, allInvites]) => setData({
        profiles,
        links: allLinks.filter(l => l.student_id === studentId),
        invites: allInvites.filter(i =>
          i.student_id === studentId && !i.accepted_at && new Date(i.expires_at).getTime() > now
        ),
      }))
      .catch(e => showToast(e.message, 'error'))
  }

  useEffect(reload, [studentId])

  if (data === null) return null

  const { profiles, links, invites } = data
  if (links.length === 0 && invites.length === 0) return null

  const profileByAccount = id => profiles.find(p => p.id === id)

  async function handleRevoke(inv) {
    if (!confirm(`Revoke the pending invite for ${inv.email}?`)) return
    try {
      await deleteInvite(inv.id)
      setData(prev => ({ ...prev, invites: prev.invites.filter(i => i.id !== inv.id) }))
      showToast('Invite revoked')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  return (
    <div style={{ paddingLeft: 68, paddingBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', margin: '10px 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Login accounts
      </div>
      {links.map(l => {
        const p = profileByAccount(l.account_id)
        return (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '3px 0' }}>
            <span style={{ width: 48, flexShrink: 0, fontSize: 11, color: 'var(--text-dim)' }}>
              {l.relationship === 'self' ? 'self' : 'parent'}
            </span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p?.email || '(unknown)'}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: TYPE_COLORS[p?.account_type] || 'var(--text-dim)' }}>
              {p?.account_type}
            </span>
          </div>
        )
      })}
      {invites.map(i => (
        <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '3px 0' }}>
          <span style={{ width: 48, flexShrink: 0, fontSize: 11, color: 'var(--yellow)' }}>
            {i.relationship === 'self' ? 'self' : 'parent'}
          </span>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.email}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--yellow)' }}>INVITED</span>
          <button className="sm danger" style={{ fontSize: 11, padding: '1px 6px' }} onClick={() => handleRevoke(i)}>Revoke</button>
        </div>
      ))}
    </div>
  )
}
