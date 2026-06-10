import { useState, useMemo } from 'react'

// Modal for "Create assignment": records a homework-packet build request as a
// draft handout row. The local build agent (run via /build-homework in the
// terminal) picks it up, compiles the PDF, and posts it back for review in the
// Handouts tab.
export default function CreatePacketModal({ problems, student, onSubmit, onClose }) {
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [saving, setSaving] = useState(false)

  // Majority raw lesson code among the selected problems (e.g. "MCH01: Velocity").
  const { lesson, mixed } = useMemo(() => {
    const counts = {}
    for (const p of problems) {
      const l = p.rawLesson || ''
      if (l) counts[l] = (counts[l] || 0) + 1
    }
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return {
      lesson: entries[0]?.[0] || '',
      mixed: entries.length > 1,
    }
  }, [problems])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({ title: title.trim(), instructions: instructions.trim(), lesson })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Create assignment for {student?.name}</h3>

        <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '4px 0 12px' }}>
          {problems.length} problem{problems.length !== 1 ? 's' : ''} will be compiled into a
          homework packet{lesson ? <> for <strong>{lesson}</strong></> : ''}.
        </p>
        {mixed && (
          <p style={{ fontSize: 12, color: 'var(--yellow, #b58900)', margin: '0 0 12px' }}>
            ⚠ Selected problems come from more than one lesson — the packet summary will use
            the most common one ({lesson}).
          </p>
        )}

        <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', marginBottom: 14 }}>
          {problems.map((p, i) => (
            <div key={p.id} style={{ fontSize: 12, padding: '2px 0', color: 'var(--text)' }}>
              {i + 1}. {p.name}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="student-card-row">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Leave blank to let the builder pick one"
              style={{ flex: 1 }}
            />
          </div>
          <div className="student-card-row" style={{ alignItems: 'flex-start' }}>
            <label style={{ paddingTop: 6 }}>Instructions</label>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Anything special for this packet (optional)…"
              rows={3}
              style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 4, padding: '6px 8px', fontSize: 13, resize: 'vertical' }}
            />
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? 'Requesting…' : 'Request build'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
