import { useState } from 'react'
import { saveSession, updateSession, deleteSession } from '../utils/supabase'

export default function SessionsView({ sessions, students, activeStudentId, sessionProblems, onSessionsChange, onDeleteSessionProblem, showToast }) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({})

  const student = students.find(s => s.id === activeStudentId)
  const now = new Date().toISOString()

  const upcomingSessions = sessions
    .filter(s => s.student_id === activeStudentId && s.scheduled_at > now)
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))

  const pastSessions = sessions
    .filter(s => s.student_id === activeStudentId && (s.end_time ?? s.scheduled_at) <= now)
    .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at))

  const onDeckBySession = {}
  for (const sp of (sessionProblems || [])) {
    if (!onDeckBySession[sp.session_id]) onDeckBySession[sp.session_id] = []
    onDeckBySession[sp.session_id].push(sp)
  }

  function startEdit(session) {
    setEditingId(session.id)
    setDraft({ ...session, tagsInput: (session.tags || []).join(', ') })
  }

  function startNew() {
    const id = `session-${activeStudentId}-${Date.now()}`
    const now = new Date()
    now.setMinutes(0, 0, 0)
    setEditingId(id)
    setDraft({
      id,
      student_id: activeStudentId,
      scheduled_at: now.toISOString().slice(0, 16),
      notes: '',
      miro_board_url: '',
      summary: '',
      tags: [],
      tagsInput: '',
    })
  }

  async function handleSave() {
    try {
      const { tagsInput, ...rest } = draft
      const session = {
        ...rest,
        scheduled_at: new Date(draft.scheduled_at).toISOString(),
        tags: (tagsInput || '').split(',').map(t => t.trim()).filter(Boolean),
      }
      await saveSession(session)
      await onSessionsChange()
      setEditingId(null)
      showToast('Session saved')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleTogglePaid(s) {
    const next = s.paid === true ? false : true
    try {
      await updateSession(s.id, { paid: next })
      await onSessionsChange()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleDelete(id) {
    try {
      await deleteSession(id)
      await onSessionsChange()
      showToast('Session deleted')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  if (!student) return <div className="assigned-view"><div className="empty-state">No student selected.</div></div>

  return (
    <div className="assigned-view">
      <div className="assigned-header">
        <div>
          <h2>{student.name}'s Sessions</h2>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{pastSessions.length} past sessions</span>
        </div>
        <button className="primary" onClick={startNew}>+ New Session</button>
      </div>

      {editingId && (
        <div className="session-edit-card">
          <div className="student-card-row">
            <label>Date & time</label>
            <input
              type="datetime-local"
              value={draft.scheduled_at?.slice(0, 16) || ''}
              onChange={e => setDraft(d => ({ ...d, scheduled_at: e.target.value }))}
            />
          </div>
          <div className="student-card-row">
            <label>Whiteboard</label>
            <input
              type="url"
              value={draft.miro_board_url || ''}
              onChange={e => setDraft(d => ({ ...d, miro_board_url: e.target.value }))}
              placeholder="https://app.ziteboard.com/?code=…"
            />
          </div>
          <div className="student-card-row" style={{ alignItems: 'flex-start' }}>
            <label style={{ paddingTop: 6 }}>Notes</label>
            <textarea
              value={draft.notes || ''}
              onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
              placeholder="Session notes..."
              rows={2}
              style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 4, padding: '6px 8px', fontSize: 13, resize: 'vertical' }}
            />
          </div>
          <div className="student-card-row" style={{ alignItems: 'flex-start' }}>
            <label style={{ paddingTop: 6 }}>Summary</label>
            <textarea
              value={draft.summary || ''}
              onChange={e => setDraft(d => ({ ...d, summary: e.target.value }))}
              placeholder="Fills in automatically from the whiteboard after the session — or type your own. Clear it to regenerate."
              rows={3}
              style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 4, padding: '6px 8px', fontSize: 13, resize: 'vertical' }}
            />
          </div>
          <div className="student-card-row">
            <label>Tags</label>
            <input
              type="text"
              value={draft.tagsInput ?? ''}
              onChange={e => setDraft(d => ({ ...d, tagsInput: e.target.value }))}
              placeholder="quantum mechanics, waves, IPhO"
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="sm" onClick={() => setEditingId(null)}>Cancel</button>
            <button className="sm primary" onClick={handleSave}>Save</button>
          </div>
        </div>
      )}

      {upcomingSessions.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Upcoming
          </div>
          <div className="assigned-list">
            {upcomingSessions.map(s => {
              const onDeck = onDeckBySession[s.id] || []
              return (
                <div key={s.id} className="assigned-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <span className="p-label" style={{ color: 'var(--text-dim)', fontSize: 11 }}>{formatDate(s.scheduled_at)}</span>
                      {s.notes && <span className="p-name" style={{ marginLeft: 8, fontWeight: 500 }}>{s.notes}</span>}
                    </div>
                    <div className="assigned-row-links">
                      {s.miro_board_url && (
                        <a href={s.miro_board_url} target="_blank" rel="noreferrer">Whiteboard ↗</a>
                      )}
                      <button className="sm" style={{ color: 'var(--text-dim)', fontSize: 11, padding: '1px 6px' }}
                        onClick={() => editingId === s.id ? setEditingId(null) : startEdit(s)}>
                        Edit
                      </button>
                      <button className="sm danger" style={{ fontSize: 11, padding: '1px 6px' }}
                        onClick={() => handleDelete(s.id)}>✕</button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                      On deck
                    </div>
                    {onDeck.length === 0 ? (
                      <span style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        Nothing yet — select problems in the browser and click "On deck"
                      </span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {onDeck.map(sp => (
                          <div key={sp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                            <span style={{ flex: 1 }}>{sp.problem_name}</span>
                            <button
                              className="sm danger"
                              style={{ fontSize: 11, padding: '1px 5px' }}
                              onClick={() => onDeleteSessionProblem(sp.id)}
                            >×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {pastSessions.length === 0 && !editingId ? (
        <div className="empty-state">No past sessions yet. Sessions appear here automatically once they end.</div>
      ) : (
        <div className="assigned-list">
          {pastSessions.map(s => (
            <div key={s.id} className={`assigned-row${editingId === s.id ? ' drag-over' : ''}`} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <span className="p-label" style={{ color: 'var(--text-dim)', fontSize: 11 }}>{formatDate(s.scheduled_at)}</span>
                  {s.notes && <span className="p-name" style={{ marginLeft: 8, fontWeight: 500 }}>{s.notes}</span>}
                </div>
                <div className="assigned-row-links">
                  {!student.invoicing_enabled && (
                    <button
                      className="sm"
                      style={{ fontSize: 11, padding: '1px 8px', color: s.paid === true ? 'var(--green)' : s.paid === false ? 'var(--red)' : 'var(--text-dim)' }}
                      title={s.paid === true ? 'Paid — click to mark unpaid' : s.paid === false ? 'Unpaid — click to mark paid' : 'Not marked — click to mark paid'}
                      onClick={() => handleTogglePaid(s)}
                    >
                      {s.paid === true ? '✓ paid' : s.paid === false ? '✗ unpaid' : '— ?'}
                    </button>
                  )}
                  {s.miro_board_url && (
                    <a href={s.miro_board_url} target="_blank" rel="noreferrer">Whiteboard ↗</a>
                  )}
                  <button className="sm" style={{ color: 'var(--text-dim)', fontSize: 11, padding: '1px 6px' }}
                    onClick={() => editingId === s.id ? setEditingId(null) : startEdit(s)}>
                    Edit
                  </button>
                  <button className="sm danger" style={{ fontSize: 11, padding: '1px 6px' }}
                    onClick={() => handleDelete(s.id)}>✕</button>
                </div>
              </div>
              {s.summary && (
                <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>{s.summary}</p>
              )}
              {(s.tags || []).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(s.tags || []).map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
