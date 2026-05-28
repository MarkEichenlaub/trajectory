import { useState } from 'react'

export default function StudentView({ student, assignments, sessions, problems, onSignOut }) {
  const [tab, setTab] = useState('assigned')
  const [selectedTags, setSelectedTags] = useState(new Set())
  const [tagSort, setTagSort] = useState('freq')
  const [tagSearch, setTagSearch] = useState('')

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

  // Build tag frequency map from all sessions
  const allTagCounts = {}
  sortedSessions.forEach(s => {
    ;(s.tags || []).forEach(tag => {
      allTagCounts[tag] = (allTagCounts[tag] || 0) + 1
    })
  })

  const filteredTagList = Object.entries(allTagCounts)
    .filter(([tag]) => tag.toLowerCase().includes(tagSearch.toLowerCase()))
    .sort(tagSort === 'freq'
      ? ([, a], [, b]) => b - a
      : ([a], [b]) => a.localeCompare(b))

  const filteredSessions = selectedTags.size === 0
    ? sortedSessions
    : sortedSessions.filter(s => [...selectedTags].every(tag => (s.tags || []).includes(tag)))

  function toggleTag(tag) {
    setSelectedTags(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag); else next.add(tag)
      return next
    })
  }

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
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            {/* Tag browser sidebar */}
            {filteredTagList.length > 0 && (
              <div style={{ width: 182, flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', position: 'sticky', top: 0 }}>
                <div style={{ padding: '10px 10px 8px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Topics
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['freq', 'alpha'].map(s => (
                      <button key={s} className="sm" onClick={() => setTagSort(s)}
                        style={{ flex: 1, textAlign: 'center', ...(tagSort === s ? { background: 'var(--accent-dim)', color: 'var(--accent)' } : {}) }}>
                        {s === 'freq' ? 'By use' : 'A–Z'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '6px 10px' }}>
                  <input
                    style={{ width: '100%', fontSize: 12 }}
                    placeholder="Search…"
                    value={tagSearch}
                    onChange={e => setTagSearch(e.target.value)}
                  />
                </div>
                {selectedTags.size > 0 && (
                  <div style={{ padding: '0 10px 6px' }}>
                    <button className="sm" onClick={() => setSelectedTags(new Set())}
                      style={{ width: '100%', fontSize: 11, background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                      Clear {selectedTags.size} filter{selectedTags.size > 1 ? 's' : ''}
                    </button>
                  </div>
                )}
                <div style={{ paddingBottom: 6 }}>
                  {filteredTagList.map(([tag, count]) => (
                    <div key={tag} onClick={() => toggleTag(tag)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '4px 10px', cursor: 'pointer', fontSize: 12,
                        background: selectedTags.has(tag) ? 'var(--accent-dim)' : 'transparent',
                        color: selectedTags.has(tag) ? 'var(--accent)' : 'var(--text)',
                        borderLeft: `2px solid ${selectedTags.has(tag) ? 'var(--accent)' : 'transparent'}`,
                      }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tag}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 4, flexShrink: 0 }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session cards */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredSessions.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 0' }}>No sessions match the selected topics.</div>
              ) : filteredSessions.map(s => (
                <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: s.summary ? 8 : 0 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{formatDate(s.scheduled_at)}</span>
                    {s.miro_board_url && (
                      <a href={s.miro_board_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Whiteboard ↗</a>
                    )}
                  </div>
                  {s.summary && (
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)', margin: 0, marginBottom: (s.tags || []).length ? 10 : 0 }}>
                      {s.summary}
                    </p>
                  )}
                  {(s.tags || []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(s.tags || []).map(tag => (
                        <span key={tag} className="tag" onClick={() => toggleTag(tag)}
                          style={{
                            cursor: 'pointer',
                            ...(selectedTags.has(tag) ? { background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'var(--accent)' } : {}),
                          }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
