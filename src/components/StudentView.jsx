import { useState } from 'react'

export default function StudentView({ student, assignments, sessions, problems, onSignOut }) {
  const [tab, setTab] = useState('assigned')

  function problemById(id) {
    return problems.find(p => p.id === id)
  }

  const assignedItems = assignments
    .filter(a => a.status === 'assigned')
    .sort((a, b) => (b.assigned_date || '').localeCompare(a.assigned_date || ''))

  const completedItems = assignments
    .filter(a => a.status === 'completed')
    .sort((a, b) => (b.completed_date || b.assigned_date || '').localeCompare(a.completed_date || a.assigned_date || ''))

  const allItems = [...assignedItems, ...completedItems]
  const tabItems = tab === 'assigned' ? assignedItems : tab === 'completed' ? completedItems : allItems

  const sortedSessions = [...(sessions || [])].sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at))

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="student-portal">
      <div className="sp-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h1>{student?.name ? `${student.name}'s Portal` : 'My Portal'}</h1>
            <p className="sp-subtitle">
              {assignedItems.length} assigned · {completedItems.length} completed · {sortedSessions.length} sessions
            </p>
          </div>
          {onSignOut && (
            <button className="sm" style={{ flexShrink: 0 }} onClick={onSignOut}>Sign out</button>
          )}
        </div>
      </div>

      <div className="assigned-tabs">
        {[
          ['assigned', 'Assigned', assignedItems.length],
          ['completed', 'Completed', completedItems.length],
          ['all', 'All Problems', allItems.length],
          ['sessions', 'Sessions', sortedSessions.length],
        ].map(([key, label, count]) => (
          <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
            {label}
            <span className="tab-count">{count}</span>
          </button>
        ))}
      </div>

      {tab === 'sessions' ? (
        sortedSessions.length === 0 ? (
          <div className="empty-state">No sessions yet.</div>
        ) : (
          <div className="assigned-list">
            {sortedSessions.map(s => (
              <div key={s.id} className="assigned-row">
                <div className="assigned-problem-info" style={{ flex: 1 }}>
                  <span className="p-label">{formatDate(s.scheduled_at)}</span>
                  {s.notes && <span className="p-name" style={{ whiteSpace: 'pre-wrap' }}>{s.notes}</span>}
                </div>
                {s.miro_board_url && (
                  <div className="assigned-row-links">
                    <a href={s.miro_board_url} target="_blank" rel="noreferrer">Whiteboard ↗</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : tabItems.length === 0 ? (
        <div className="empty-state">
          {tab === 'assigned' ? 'No problems currently assigned.'
            : tab === 'completed' ? 'No completed problems yet.'
            : 'No problems yet.'}
        </div>
      ) : (
        <div className="assigned-list">
          {tabItems.map(a => {
            const p = problemById(a.problem_id)
            if (!p) return null
            const dateLabel = a.status === 'completed' && a.completed_date
              ? `Completed ${a.completed_date}`
              : `Assigned ${a.assigned_date}`
            return (
              <div key={a.id} className="assigned-row">
                <span className={`status-badge ${a.status}`}>
                  {a.status === 'assigned' ? '→ Assigned' : '✓ Completed'}
                </span>
                <div className="assigned-problem-info">
                  <span className="p-label">{p.contest} {p.year} {p.label}</span>
                  <span className="p-name">{p.name}</span>
                  <span className="p-date">{dateLabel}</span>
                </div>
                <div className="assigned-row-links">
                  <a href={p.problemUrl} target="_blank" rel="noreferrer">Problem ↗</a>
                  {p.solutionUrl && <a href={p.solutionUrl} target="_blank" rel="noreferrer">Solution ↗</a>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
