import { useState, useEffect } from 'react'
import { fetchStudentContacts, saveStudentContact, updateStudentContact, deleteStudentContact, sendContactVerification, createInvite, setStudentStatus, cancelUpcomingSessions, fetchStudentAccessibleSources, saveStudentAccessibleSources } from '../utils/supabase'

export default function Settings({ students, allSources, onSaveStudent, onStatusChange, showToast }) {
  const [saving, setSaving] = useState(null)

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
    const name = prompt('Student name?')
    if (!name) return
    const id = name.toLowerCase().replace(/\s+/g, '-')
    const newStudent = { id, name, email: '', notes: '' }
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
    setDraft(d => ({ ...d, [field]: value }))
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
        <label>Name</label>
        <input value={draft.name} onChange={e => set('name', e.target.value)} />
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
          style={{ width: 80 }}
        />
        <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 4 }}>sessions</span>
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
    if (!addr) return
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

const CONTACT_TOGGLES = [
  ['receives_meets', 'Meets'],
  ['receives_reports', 'Reports'],
  ['receives_invoices', 'Invoice'],
  ['receives_assignments', 'Assignments'],
]

function ContactsSection({ studentId, showToast }) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newLabel, setNewLabel] = useState('parent')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchStudentContacts(studentId)
      .then(setContacts)
      .catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false))
  }, [studentId])

  const email = newEmail.trim().toLowerCase()

  async function handleAdd() {
    if (!email) return
    setAdding(true)
    try {
      await saveStudentContact({
        student_id: studentId,
        email,
        label: newLabel,
        receives_meets: true,
        receives_reports: true,
        receives_invoices: false,
        can_login: true,
      })
      const fresh = await fetchStudentContacts(studentId)
      setContacts(fresh)
      setNewEmail('')
      const newId = fresh.find(c => c.email === email)?.id
      if (newId) {
        try {
          await sendContactVerification(newId, true)
          showToast('Contact added — confirmation email sent')
        } catch (e) {
          showToast(`Added, but confirmation email failed: ${e.message}`, 'error')
        }
      }
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setAdding(false)
    }
  }

  async function handleResend(c) {
    try {
      await sendContactVerification(c.id, true)
      showToast(`Confirmation re-sent to ${c.email}`)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleToggle(id, field, value) {
    // Set the new invoice recipient ON before clearing others so the count
    // never hits 0 and trips the DB invariant trigger.
    if (field === 'receives_invoices' && value) {
      await updateStudentContact(id, { receives_invoices: true })
      for (const c of contacts) {
        if (c.id !== id && c.receives_invoices) {
          await updateStudentContact(c.id, { receives_invoices: false })
        }
      }
      setContacts(prev => prev.map(c => ({ ...c, receives_invoices: c.id === id })))
      return
    }
    try {
      await updateStudentContact(id, { [field]: value })
      setContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleDelete(id) {
    try {
      await deleteStudentContact(id)
      setContacts(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const verifiedMeetIds = contacts.filter(c => c.verified && c.receives_meets).map(c => c.id)
  const invoiceIds = contacts.filter(c => c.receives_invoices).map(c => c.id)
  const loginIds = contacts.filter(c => c.can_login).map(c => c.id)
  const isLastVerifiedMeet = (c) => verifiedMeetIds.length === 1 && verifiedMeetIds[0] === c.id
  const isLastInvoice = (c) => invoiceIds.length === 1 && invoiceIds[0] === c.id
  const isLastLogin = (c) => loginIds.length === 1 && loginIds[0] === c.id
  const deleteLocked = (c) => isLastVerifiedMeet(c) || isLastInvoice(c) || isLastLogin(c)
  const toggleLocked = (c, field) =>
    (field === 'receives_meets' && isLastVerifiedMeet(c)) ||
    (field === 'receives_invoices' && isLastInvoice(c))

  if (loading) {
    return <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '4px 0 4px 68px' }}>Loading…</div>
  }

  return (
    <div style={{ paddingLeft: 68, paddingBottom: 4 }}>
      {contacts.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>No contacts yet.</div>
      )}
      {contacts.map(c => (
        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 12 }}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{c.email}</span>
          {c.bounced ? (
            <span title={c.bounce_reason || 'email bounced'} style={{ color: 'var(--red)', fontWeight: 600, fontSize: 10, flexShrink: 0 }}>bounced</span>
          ) : c.verified ? (
            <span style={{ color: 'var(--green)', fontSize: 10, flexShrink: 0 }}>verified</span>
          ) : (
            <button className="sm" style={{ fontSize: 10, padding: '0 5px', flexShrink: 0, color: 'var(--yellow)' }} title="unconfirmed — click to resend" onClick={() => handleResend(c)}>resend</button>
          )}
          <span style={{ color: 'var(--text-dim)', width: 50, flexShrink: 0, fontSize: 11 }}>{c.label}</span>
          {CONTACT_TOGGLES.map(([field, label]) => {
            const locked = toggleLocked(c, field)
            return (
              <label key={field} title={locked ? 'Active student must keep at least one recipient here' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: locked ? 'default' : 'pointer', whiteSpace: 'nowrap', fontSize: 11, color: c[field] ? 'var(--accent)' : 'var(--text-dim)' }}>
                <input
                  type="checkbox"
                  checked={!!c[field]}
                  disabled={locked}
                  onChange={e => handleToggle(c.id, field, e.target.checked)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                {label}
              </label>
            )
          })}
          <button className="sm danger" style={{ fontSize: 11, padding: '1px 6px', flexShrink: 0 }} disabled={deleteLocked(c)} title={deleteLocked(c) ? 'Last required recipient for an active student' : undefined} onClick={() => handleDelete(c.id)}>✕</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <input
          type="email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="email@example.com"
          style={{ flex: 1, fontSize: 12 }}
        />
        <select
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          style={{ fontSize: 12, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 4, padding: '4px 6px' }}
        >
          <option value="parent">parent</option>
          <option value="student">student</option>
          <option value="other">other</option>
        </select>
        <button className="sm" onClick={handleAdd} disabled={adding || !newEmail.trim()}>
          {adding ? '…' : 'Add'}
        </button>
      </div>
    </div>
  )
}
