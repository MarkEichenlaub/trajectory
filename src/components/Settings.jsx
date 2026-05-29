import { useState, useEffect } from 'react'
import { getServiceKey, setServiceKey, fetchStudentContacts, saveStudentContact, updateStudentContact, deleteStudentContact } from '../utils/supabase'

export default function Settings({ students, onSaveStudent, showToast }) {
  const [key, setKey] = useState(getServiceKey)
  const [saving, setSaving] = useState(null)

  function saveKey() {
    setServiceKey(key)
    showToast('Service key saved')
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
        <h3>Supabase Service Key</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 10 }}>
          Required for saving assignments and student data. Find it at{' '}
          <a href="https://supabase.com/dashboard/project/nxvtaxbntqhcfqtazbnt/settings/api-keys/legacy" target="_blank" rel="noreferrer">
            Supabase → Settings → API Keys → Legacy → service_role
          </a>. Never share this key.
        </p>
        <div className="settings-row">
          <label>Service key</label>
          <input
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="eyJ…"
            style={{ fontFamily: 'monospace' }}
          />
          <button onClick={saveKey}>Save</button>
        </div>
      </div>

      <div className="settings-section">
        <h3>Students</h3>
        {students.map(s => (
          <StudentCard
            key={s.id}
            student={s}
            onSave={handleSave}
            onRemove={handleRemove}
            saving={saving === s.id}
            showToast={showToast}
          />
        ))}
        <button onClick={handleAdd} style={{ marginTop: 8 }}>+ Add Student</button>
      </div>
    </div>
  )
}

function StudentCard({ student, onSave, onRemove, saving, showToast }) {
  const [draft, setDraft] = useState({ ...student })
  const [showContacts, setShowContacts] = useState(false)
  const dirty = JSON.stringify(draft) !== JSON.stringify(student)

  function set(field, value) {
    setDraft(d => ({ ...d, [field]: value }))
  }

  return (
    <div className="student-card">
      <div className="student-card-row">
        <label>Name</label>
        <input value={draft.name} onChange={e => set('name', e.target.value)} />
        <button className="sm danger" onClick={() => onRemove(student)}>Remove</button>
      </div>
      <div className="student-card-row">
        <label>Email</label>
        <input value={draft.email || ''} onChange={e => set('email', e.target.value)} placeholder="student@example.com" />
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
    </div>
  )
}

const CONTACT_TOGGLES = [
  ['receives_meets', 'Meets'],
  ['receives_reports', 'Reports'],
  ['receives_invoices', 'Invoice'],
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

  async function handleAdd() {
    if (!newEmail.trim()) return
    setAdding(true)
    try {
      await saveStudentContact({
        student_id: studentId,
        email: newEmail.trim().toLowerCase(),
        label: newLabel,
        receives_meets: true,
        receives_reports: true,
        receives_invoices: false,
        can_login: true,
      })
      setContacts(await fetchStudentContacts(studentId))
      setNewEmail('')
      showToast('Contact added')
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setAdding(false)
    }
  }

  async function handleToggle(id, field, value) {
    if (field === 'receives_invoices' && value) {
      for (const c of contacts) {
        if (c.id !== id && c.receives_invoices) {
          await updateStudentContact(c.id, { receives_invoices: false })
        }
      }
      setContacts(prev => prev.map(c => c.id !== id ? { ...c, receives_invoices: false } : c))
    }
    await updateStudentContact(id, { [field]: value })
    setContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  async function handleDelete(id) {
    try {
      await deleteStudentContact(id)
      setContacts(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

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
          <span style={{ color: 'var(--text-dim)', width: 50, flexShrink: 0, fontSize: 11 }}>{c.label}</span>
          {CONTACT_TOGGLES.map(([field, label]) => (
            <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 11, color: c[field] ? 'var(--accent)' : 'var(--text-dim)' }}>
              <input
                type="checkbox"
                checked={!!c[field]}
                onChange={e => handleToggle(c.id, field, e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              {label}
            </label>
          ))}
          <button className="sm danger" style={{ fontSize: 11, padding: '1px 6px', flexShrink: 0 }} onClick={() => handleDelete(c.id)}>✕</button>
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
