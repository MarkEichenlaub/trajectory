import { useState } from 'react'
import { getPAT, setPAT } from '../utils/github'

export default function Settings({ students, onSave, showToast }) {
  const [pat, setPATState] = useState(getPAT)
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(students)))
  const [saving, setSaving] = useState(false)

  function savePAT() {
    setPAT(pat)
    showToast('PAT saved to browser')
  }

  function updateStudent(id, field, value) {
    setDraft(d => d.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  function addStudent() {
    const name = prompt('Student name?')
    if (!name) return
    const id = name.toLowerCase().replace(/\s+/g, '-')
    setDraft(d => [...d, { id, name, email: '', notes: '' }])
  }

  function removeStudent(id) {
    if (!confirm('Remove student? (Assignment history is kept.)')) return
    setDraft(d => d.filter(s => s.id !== id))
  }

  async function saveStudents() {
    setSaving(true)
    await onSave(draft)
    setSaving(false)
  }

  return (
    <div className="settings-view">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>GitHub Personal Access Token</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 10 }}>
          Required for saving assignments and notes. Create a PAT at GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens. Grant <strong>Contents: Read & Write</strong> on the <code>trajectory</code> repo.
        </p>
        <div className="settings-row">
          <label>PAT</label>
          <input
            type="password"
            value={pat}
            onChange={e => setPATState(e.target.value)}
            placeholder="github_pat_…"
            style={{ fontFamily: 'monospace' }}
          />
          <button onClick={savePAT}>Save</button>
        </div>
      </div>

      <div className="settings-section">
        <h3>Students</h3>
        {draft.map(s => (
          <div key={s.id} className="student-card">
            <div className="student-card-row">
              <label>Name</label>
              <input value={s.name} onChange={e => updateStudent(s.id, 'name', e.target.value)} />
              <button className="sm danger" onClick={() => removeStudent(s.id)}>Remove</button>
            </div>
            <div className="student-card-row">
              <label>Email</label>
              <input value={s.email} onChange={e => updateStudent(s.id, 'email', e.target.value)} placeholder="student@example.com" />
            </div>
            <div className="student-card-row">
              <label>Notes</label>
              <input value={s.notes} onChange={e => updateStudent(s.id, 'notes', e.target.value)} placeholder="General notes about this student" />
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={addStudent}>+ Add Student</button>
          <button className="primary" onClick={saveStudents} disabled={saving}>
            {saving ? 'Saving…' : 'Save Students'}
          </button>
        </div>
      </div>
    </div>
  )
}
