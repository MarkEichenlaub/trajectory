import { useState } from 'react'
import { openGmailDraft, buildEmailBody } from '../utils/gmail'

export default function AssignModal({ student, problems, onConfirm, onClose }) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleConfirm() {
    setSaving(true)
    await onConfirm(note)
    setSaving(false)
  }

  function handleEmail() {
    openGmailDraft({
      to: student.email || '',
      subject: `Physics problems for ${student.name}`,
      body: buildEmailBody(student, problems),
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Assign to {student.name}</h3>
        <div className="modal-problem-list">
          {problems.map(p => (
            <div key={p.id} className="modal-problem-item">
              <strong>{p.name}</strong>{' '}
              <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{p.contest} {p.year} {p.label}</span>
            </div>
          ))}
        </div>
        <label>Notes (optional)</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. Focus on part (b), skip the experiment section…"
        />
        <div className="modal-footer">
          <button onClick={handleEmail}>Open Gmail Draft</button>
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={handleConfirm} disabled={saving}>
            {saving ? 'Saving…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}
