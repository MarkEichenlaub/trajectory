import { useState } from 'react'
import { getServiceKey, setServiceKey } from '../utils/supabase'

export default function Settings({ students, onSaveStudent, showToast }) {
  const [key, setKey] = useState(getServiceKey)
  const [saving, setSaving] = useState(null) // studentId being saved

  function saveKey() {
    setServiceKey(key)
    showToast('Service key saved')
  }

  function updateStudent(id, field, value) {
    // Handled via individual save buttons — no draft buffer needed
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
          />
        ))}
        <button onClick={handleAdd} style={{ marginTop: 8 }}>+ Add Student</button>
      </div>
    </div>
  )
}

function StudentCard({ student, onSave, onRemove, saving }) {
  const [draft, setDraft] = useState({ ...student })
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
    </div>
  )
}
