import { useState, useRef } from 'react'

function NoteField({ assignmentId, initialNote, onSave }) {
  const [value, setValue] = useState(initialNote || '')
  const [editing, setEditing] = useState(false)

  function handleBlur() {
    setEditing(false)
    if (value !== (initialNote || '')) onSave(assignmentId, value)
  }

  if (!editing && !value) {
    return (
      <span
        className="assignment-note-placeholder"
        onClick={() => setEditing(true)}
      >
        Add note…
      </span>
    )
  }

  if (editing) {
    return (
      <input
        className="assignment-note-input"
        value={value}
        autoFocus
        onChange={e => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
        placeholder="e.g. Chapter 1, problems 1–8"
      />
    )
  }

  return (
    <span
      className="assignment-note"
      onClick={() => setEditing(true)}
      title="Click to edit note"
    >
      {value}
    </span>
  )
}

export default function AssignedView({
  student, assignments, problems,
  assignedOrder, onReorder,
  onToggleStatus, onUnassign, onGenerateEmail, onUpdateNote, onUploadFeedback,
}) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const [uploadingId, setUploadingId] = useState(null)
  const feedbackInputRef = useRef(null)
  const pendingFeedbackId = useRef(null)

  if (!student) return <div className="assigned-view"><div className="empty-state">No student selected.</div></div>

  function problemById(id) {
    return problems.find(p => p.id === id)
  }

  const assignedCount = assignments.filter(a => a.status === 'assigned').length
  const submittedCount = assignments.filter(a => a.status === 'submitted').length
  const reviewedCount = assignments.filter(a => a.status === 'reviewed').length
  const completedCount = assignments.filter(a => a.status === 'completed').length

  function triggerFeedbackUpload(assignmentId) {
    pendingFeedbackId.current = assignmentId
    feedbackInputRef.current?.click()
  }

  async function handleFeedbackFileChange(e) {
    const file = e.target.files?.[0]
    const assignmentId = pendingFeedbackId.current
    e.target.value = ''
    if (!file || !assignmentId) return
    setUploadingId(assignmentId)
    try {
      await onUploadFeedback(assignmentId, file)
    } finally {
      setUploadingId(null)
    }
  }

  const filtered = [...assignments]
    .filter(a => statusFilter === 'all' || a.status === statusFilter)
    .sort((a, b) => {
      if (statusFilter === 'assigned') {
        return assignedOrder.indexOf(a.problem_id) - assignedOrder.indexOf(b.problem_id)
      }
      return (b.assigned_date || '').localeCompare(a.assigned_date || '')
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

      {/* Hidden file input for feedback uploads */}
      <input
        ref={feedbackInputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFeedbackFileChange}
      />

      <div className="assigned-tabs">
        {[
          ['all', 'All', assignments.length],
          ['assigned', 'Assigned', assignedCount],
          ['submitted', 'Submitted', submittedCount],
          ['reviewed', 'Reviewed', reviewedCount],
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
            const p = problemById(a.problem_id)
            if (!p) return (
              <div key={a.id} className="assigned-row">
                <span style={{ color: 'var(--red)', flex: 1 }}>Unknown problem: {a.problem_id}</span>
                <button className="sm danger" onClick={() => onUnassign(a.problem_id)}>Remove</button>
              </div>
            )

            const isBeingDragged = dragId === a.problem_id
            const isDragTarget = dragOverId === a.problem_id

            return (
              <div
                key={a.id}
                className={`assigned-row${isBeingDragged ? ' dragging' : ''}${isDragTarget ? ' drag-over' : ''}`}
                draggable={isDraggable}
                onDragStart={isDraggable ? e => handleDragStart(e, a.problem_id) : undefined}
                onDragOver={isDraggable ? e => handleDragOver(e, a.problem_id) : undefined}
                onDrop={isDraggable ? e => handleDrop(e, a.problem_id) : undefined}
                onDragEnd={isDraggable ? handleDragEnd : undefined}
              >
                {isDraggable && (
                  <span className="drag-handle" title="Drag to reorder">⠿</span>
                )}
                <button
                  className={`status-toggle ${a.status}`}
                  onClick={() => onToggleStatus(a.problem_id)}
                  title={a.status === 'completed' ? 'Click to revert to assigned' : 'Click to mark as completed'}
                >
                  {a.status === 'assigned' ? '→ Assigned'
                    : a.status === 'submitted' ? '⬆ Submitted'
                    : a.status === 'reviewed' ? '◎ Reviewed'
                    : '✓ Completed'}
                </button>
                <div className="assigned-problem-info">
                  <span className="p-label">{p.contest} {p.year} {p.label}</span>
                  <span className="p-name">{p.name}</span>
                  {a.assigned_date && (
                    <span className="p-date">{a.assigned_date}</span>
                  )}
                  <NoteField
                    assignmentId={a.id}
                    initialNote={a.notes}
                    onSave={onUpdateNote}
                  />
                </div>
                <div className="assigned-row-links">
                  {p.problemUrl && (
                    <a href={p.problemUrl} target="_blank" rel="noreferrer">
                      {p.type === 'Book' ? 'Book ↗' : p.type === 'Handout' ? 'Handout ↗' : 'Problem ↗'}
                    </a>
                  )}
                  {p.solutionUrl && <a href={p.solutionUrl} target="_blank" rel="noreferrer">Solution ↗</a>}
                  {a.submission_url && (
                    <a href={a.submission_url} target="_blank" rel="noreferrer">Submission ↗</a>
                  )}
                  {a.status === 'submitted' && (
                    <button
                      className="sm"
                      style={{ fontSize: 11, padding: '1px 6px' }}
                      disabled={uploadingId === a.id}
                      onClick={() => triggerFeedbackUpload(a.id)}
                    >
                      {uploadingId === a.id ? 'Uploading…' : 'Upload feedback'}
                    </button>
                  )}
                  {a.feedback_url && (
                    <a href={a.feedback_url} target="_blank" rel="noreferrer">Feedback ↗</a>
                  )}
                  <button
                    className="sm"
                    style={{ color: 'var(--text-dim)', fontSize: 11, padding: '1px 6px' }}
                    onClick={() => onUnassign(a.problem_id)}
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
