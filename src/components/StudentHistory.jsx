import { useState } from 'react'

export default function StudentHistory({ student, assignments, problems, onUpdateAssignment, onDeleteAssignment }) {
  const [editingNote, setEditingNote] = useState({}) // { [assignmentId]: draftText }
  const [saving, setSaving] = useState({})

  if (!student) return <div className="history-view"><div className="empty-state">No student selected.</div></div>

  const sorted = [...assignments].sort((a, b) => b.date.localeCompare(a.date))

  function problemById(id) {
    return problems.find(p => p.id === id)
  }

  async function saveNote(a) {
    setSaving(s => ({ ...s, [a.id]: true }))
    await onUpdateAssignment(a.id, 'note', editingNote[a.id] ?? a.note ?? '')
    setSaving(s => ({ ...s, [a.id]: false }))
    setEditingNote(e => { const n = { ...e }; delete n[a.id]; return n })
  }

  return (
    <div className="history-view">
      <div className="history-header">
        <h2>{student.name}'s Problem History</h2>
        <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          {assignments.length} session{assignments.length !== 1 ? 's' : ''} · {assignments.reduce((n, a) => n + a.problemIds.length, 0)} problems
        </span>
      </div>

      {sorted.length === 0 && (
        <div className="empty-state">No problems assigned to {student.name} yet.</div>
      )}

      {sorted.map(a => (
        <div key={a.id} className="assignment-card">
          <div className="assignment-card-header">
            <span className="done-badge">Session</span>
            <span className="assignment-date">{a.date}</span>
            <div style={{ flex: 1 }} />
            <button className="sm danger" onClick={() => {
              if (confirm(`Delete this session (${a.problemIds.length} problems)?`)) {
                onDeleteAssignment(a.id)
              }
            }}>Delete</button>
          </div>

          <div className="assignment-problems">
            {a.problemIds.map(pid => {
              const p = problemById(pid)
              if (!p) return <div key={pid} className="assignment-problem-row"><span style={{color:'var(--red)'}}>Unknown: {pid}</span></div>
              return (
                <div key={pid} className="assignment-problem-row">
                  <span className="p-label">{p.contest} {p.year} {p.label}</span>
                  <span style={{ fontWeight: 500 }}>{p.name}</span>
                  <a href={p.problemUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 8, fontSize: 12 }}>↗</a>
                </div>
              )
            })}
          </div>

          <div className="assignment-notes">
            <label>Notes</label>
            <textarea
              value={editingNote[a.id] ?? a.note ?? ''}
              onChange={e => setEditingNote(n => ({ ...n, [a.id]: e.target.value }))}
              placeholder="How did it go? Any follow-up?"
            />
            {editingNote[a.id] !== undefined && editingNote[a.id] !== (a.note ?? '') && (
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button className="sm primary" onClick={() => saveNote(a)} disabled={saving[a.id]}>
                  {saving[a.id] ? 'Saving…' : 'Save'}
                </button>
                <button className="sm" onClick={() => setEditingNote(e => { const n = { ...e }; delete n[a.id]; return n })}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
