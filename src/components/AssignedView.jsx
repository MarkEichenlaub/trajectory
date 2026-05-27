import { useState } from 'react'

export default function AssignedView({
  student, assignments, problems,
  assignedOrder, onReorder,
  onToggleStatus, onUnassign, onGenerateEmail,
}) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  if (!student) return <div className="assigned-view"><div className="empty-state">No student selected.</div></div>

  function problemById(id) {
    return problems.find(p => p.id === id)
  }

  const assignedCount = assignments.filter(a => a.status === 'assigned').length
  const completedCount = assignments.filter(a => a.status === 'completed').length

  const filtered = [...assignments]
    .filter(a => statusFilter === 'all' || a.status === statusFilter)
    .sort((a, b) => {
      if (statusFilter === 'assigned') {
        return assignedOrder.indexOf(a.problemId) - assignedOrder.indexOf(b.problemId)
      }
      return b.assignedDate.localeCompare(a.assignedDate)
    })

  const isDraggable = statusFilter === 'assigned'

  function handleDragStart(e, problemId) {
    setDragId(problemId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, problemId) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (problemId !== dragId) setDragOverId(problemId)
  }

  function handleDrop(e, targetId) {
    e.preventDefault()
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return }
    const newOrder = [...assignedOrder]
    const fromIdx = newOrder.indexOf(dragId)
    const toIdx = newOrder.indexOf(targetId)
    if (fromIdx === -1 || toIdx === -1) { setDragId(null); setDragOverId(null); return }
    newOrder.splice(fromIdx, 1)
    newOrder.splice(toIdx, 0, dragId)
    onReorder(newOrder)
    setDragId(null)
    setDragOverId(null)
  }

  function handleDragEnd() {
    setDragId(null)
    setDragOverId(null)
  }

  return (
    <div className="assigned-view">
      <div className="assigned-header">
        <div>
          <h2>{student.name}'s Problems</h2>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            {assignedCount} assigned · {completedCount} completed
          </span>
        </div>
        {assignedCount > 0 && (
          <button className="primary" onClick={onGenerateEmail}>
            ✉ Generate Email ({assignedCount})
          </button>
        )}
      </div>

      <div className="assigned-tabs">
        {[
          ['all', 'All', assignments.length],
          ['assigned', 'Assigned', assignedCount],
          ['completed', 'Completed', completedCount],
        ].map(([key, label, count]) => (
          <button
            key={key}
            className={statusFilter === key ? 'active' : ''}
            onClick={() => setStatusFilter(key)}
          >
            {label}
            <span className="tab-count">{count}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {assignments.length === 0
            ? `No problems assigned to ${student.name} yet. Select problems in the browser and click "Assign".`
            : `No ${statusFilter} problems.`}
        </div>
      ) : (
        <div className="assigned-list">
          {filtered.map(a => {
            const p = problemById(a.problemId)
            if (!p) return (
              <div key={a.id} className="assigned-row">
                <span style={{ color: 'var(--red)', flex: 1 }}>Unknown problem: {a.problemId}</span>
                <button className="sm danger" onClick={() => onUnassign(a.problemId)}>Remove</button>
              </div>
            )

            const isBeingDragged = dragId === a.problemId
            const isDragTarget = dragOverId === a.problemId

            return (
              <div
                key={a.id}
                className={`assigned-row${isBeingDragged ? ' dragging' : ''}${isDragTarget ? ' drag-over' : ''}`}
                draggable={isDraggable}
                onDragStart={isDraggable ? e => handleDragStart(e, a.problemId) : undefined}
                onDragOver={isDraggable ? e => handleDragOver(e, a.problemId) : undefined}
                onDrop={isDraggable ? e => handleDrop(e, a.problemId) : undefined}
                onDragEnd={isDraggable ? handleDragEnd : undefined}
              >
                {isDraggable && (
                  <span className="drag-handle" title="Drag to reorder">⠿</span>
                )}
                <button
                  className={`status-toggle ${a.status}`}
                  onClick={() => onToggleStatus(a.problemId)}
                  title={`Click to mark as ${a.status === 'assigned' ? 'completed' : 'assigned'}`}
                >
                  {a.status === 'assigned' ? '→ Assigned' : '✓ Completed'}
                </button>
                <div className="assigned-problem-info">
                  <span className="p-label">{p.contest} {p.year} {p.label}</span>
                  <span className="p-name">{p.name}</span>
                  {a.assignedDate && (
                    <span className="p-date">{a.assignedDate}</span>
                  )}
                </div>
                <div className="assigned-row-links">
                  <a href={p.problemUrl} target="_blank" rel="noreferrer">Problem ↗</a>
                  {p.solutionUrl && <a href={p.solutionUrl} target="_blank" rel="noreferrer">Solution ↗</a>}
                  <button
                    className="sm"
                    style={{ color: 'var(--text-dim)', fontSize: 11, padding: '1px 6px' }}
                    onClick={() => onUnassign(a.problemId)}
                    title="Remove assignment"
                  >✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
