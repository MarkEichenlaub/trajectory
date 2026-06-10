import { useState, useEffect } from 'react'
import { fetchStudentContacts, createInvite, setStudentStatus, cancelUpcomingSessions, fetchStudentAccessibleSources, saveStudentAccessibleSources } from '../utils/supabase'
import ContactsPanel from './portal/ContactsPanel'

export default function Settings({ students, allSources, onSaveStudent, onStatusChange, onRefreshData, showToast }) {
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

  async function handleSave(student) {
    setSaving(student.id)
    await onSaveStudent(student)
    setSaving(null)
  }

  async function handleRemove(student) {
    if (!confirm(`Remove ${student.name}? (Assignment history is kept.)`)) return
    await onSaveStudent(student, true)
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
  }

  return (
    <div className="settings-view">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>Students</h3>
        {students.map(s => (
          <StudentCard
            key={s.id}
            student={s}
            allSources={allSources || []}
            onSave={handleSave}
            onRemove={handleRemove}
            onStatusChange={onStatusChange}
            saving={saving === s.id}
            showToast={showToast}
          />
        ))}
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
  const [showContacts, setShowContacts] = useState(false)
  const [showBank, setShowBank] = useState(false)
  const [accessibleSources, setAccessibleSources] = useState(null)
  const [togglingStatus, setTogglingStatus] = useState(false)
  const dirty = JSON.stringify(draft) !== JSON.stringify(student)
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
      <div className="student-card-row">
        <label>Balance</label>
        <input
          type="number" min="0"
          value={draft.session_balance ?? 0}
          onChange={e => set('session_balance', parseInt(e.target.value, 10) || 0)}
          style={{ width: 52, flex: 'none' }}
        />
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>sessions</span>
        <button
          className="sm"
          disabled={saving}
          title="Add 10 sessions (payment received)"
          onClick={async () => {
            const newBalance = (draft.session_balance ?? 0) + 10
            const updated = { ...draft, session_balance: newBalance }
            setDraft(updated)
            await onSave(updated)
          }}
        >+10</button>
      </div>
      <div className="student-card-row">
        <label>Rate</label>
        <input
          type="number" min="0" step="1"
          value={draft.hourly_rate ?? 0}
          onChange={e => set('hourly_rate', parseFloat(e.target.value) || 0)}
          style={{ width: 80 }}
        />
        <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 4 }}>/session</span>
      </div>
      <div className="student-card-row">
        <label>Invoicing</label>
        <button
          className="sm"
          style={{ color: draft.invoicing_enabled ? 'var(--green)' : 'var(--text-dim)' }}
          title={draft.invoicing_enabled ? 'Stripe invoicing on — click to disable' : 'Invoicing off — click to enable Stripe invoicing'}
          onClick={() => set('invoicing_enabled', !draft.invoicing_enabled)}
        >
          {draft.invoicing_enabled ? '● on' : '○ off'}
        </button>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 6 }}>
          {draft.invoicing_enabled ? 'auto-invoices via Stripe' : 'mark sessions paid/unpaid manually'}
        </span>
      </div>
      {dirty && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button className="sm primary" onClick={() => onSave(draft)} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}
      <InviteRow studentId={student.id} showToast={showToast} />
      <div className="student-card-row" style={{ marginTop: 4 }}>
        <label style={{ color: 'var(--text-dim)' }}>Contacts</label>
        <button
          className="sm"
          style={{ fontSize: 11 }}
          onClick={() => setShowContacts(v => !v)}
        >
          {showContacts ? 'Hide' : 'Manage'}
        </button>
      </div>
      {showContacts && (
        <ContactsSection studentId={student.id} showToast={showToast} />
      )}
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
