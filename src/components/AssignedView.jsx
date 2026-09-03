import { useState, useRef } from 'react'
import { problemSummary } from '../utils/problemBank'
import { firstReview } from '../utils/supabase'

// AI review's mark_notes field (assignment_reviews table) — same edit pattern
// as NoteField above, kept separate since it saves to a different table/row.
function ReviewNotesField({ assignmentId, initialNotes, onSave }) {
  const [value, setValue] = useState(initialNotes || '')
  const [editing, setEditing] = useState(false)

  function handleBlur() {
    setEditing(false)
    if (value !== (initialNotes || '')) onSave(assignmentId, value)
  }

  if (!editing && !value) {
    return (
      <span className="assignment-note-placeholder" onClick={() => setEditing(true)}>
        Add your notes…
      </span>
    )
  }

  if (editing) {
    return (
      <textarea
        className="assignment-note-input"
        value={value}
        autoFocus
        rows={2}
        onChange={e => setValue(e.target.value)}
        onBlur={handleBlur}
        style={{ width: '100%' }}
      />
    )
  }

  return <span onClick={() => setEditing(true)} style={{ cursor: 'text' }}>{value}</span>
}

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

function DueDateField({ assignmentId, dueDate, overridden, requiresSubmission, onSave }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(dueDate || '')

  if (!requiresSubmission) return null

  function handleBlur() {
    setEditing(false)
    if (value !== (dueDate || '')) onSave(assignmentId, value || null)
  }

  if (editing) {
    return (
      <input
        type="date"
        className="assignment-note-input"
        value={value}
        autoFocus
        onChange={e => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
        style={{ width: 120, fontSize: 11 }}
      />
    )
  }

  return (
    <span
      className="p-date"
      onClick={() => { setValue(dueDate || ''); setEditing(true) }}
      title="Click to set due date"
      style={{ cursor: 'pointer' }}
    >
      {dueDate ? `Due ${dueDate}` : 'Set due date…'}
      {overridden && <span style={{ marginLeft: 4, fontSize: 9, color: 'var(--text-dim)', fontStyle: 'italic' }}>manual</span>}
    </span>
  )
}

export default function AssignedView({
  student, assignments, problems,
  assignedOrder, onReorder,
  onToggleStatus, onUnassign, onGenerateEmail, onUpdateNote, onUpdateDueDate, onUploadFeedback, onToggleRequiresSubmission,
  onUpdateReviewNotes,
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
        return assignedOrder.indexOf(a.id) - assignedOrder.indexOf(b.id)
      }
      return (b.assigned_date || '').localeCompare(a.assigned_date || '')
    })

  const isDraggable = statusFilter === 'assigned'

  function handleDragStart(e, assignmentId) {
    setDragId(assignmentId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, assignmentId) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (assignmentId !== dragId) setDragOverId(assignmentId)
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
                <button className="sm danger" onClick={() => onUnassign(a.id)}>Remove</button>
              </div>
            )

            const isBeingDragged = dragId === a.id
            const isDragTarget = dragOverId === a.id
            const summary = problemSummary(p)
            const review = firstReview(a)

            return (
              <div
                key={a.id}
                className={`assigned-row${isBeingDragged ? ' dragging' : ''}${isDragTarget ? ' drag-over' : ''}`}
                draggable={isDraggable}
                onDragStart={isDraggable ? e => handleDragStart(e, a.id) : undefined}
                onDragOver={isDraggable ? e => handleDragOver(e, a.id) : undefined}
                onDrop={isDraggable ? e => handleDrop(e, a.id) : undefined}
                onDragEnd={isDraggable ? handleDragEnd : undefined}
              >
                {isDraggable && (
                  <span className="drag-handle" title="Drag to reorder">⠿</span>
                )}
                <button
                  className={`status-toggle ${a.status}`}
                  onClick={() => onToggleStatus(a.id)}
                  title={a.status === 'completed' ? 'Click to revert to assigned' : 'Click to mark as completed'}
                >
                  {a.status === 'assigned' ? '→ Assigned'
                    : a.status === 'submitted' ? '⬆ Submitted'
                    : a.status === 'reviewed' ? '◎ Reviewed'
                    : '✓ Completed'}
                </button>
                <div className="assigned-problem-info">
                  <span className="p-label">{p.contest} {p.year} {p.label}</span>
                  <span className="p-name" title={summary ? `${p.name} — ${summary}` : undefined}>
                    {p.name}
                    {summary && <span className="p-meta"> ({summary})</span>}
                  </span>
                  {a.assigned_date && (
                    <span className="p-date">{a.assigned_date}</span>
                  )}
                  <span
                    className="p-date"
                    onClick={() => onToggleRequiresSubmission?.(a.id, !a.requires_submission)}
                    title="Toggle submission requirement"
                    style={{ cursor: 'pointer', color: a.requires_submission ? 'var(--accent)' : 'var(--text-dim)', userSelect: 'none' }}
                  >
                    {a.requires_submission ? '⬆ submission' : '⬆ no submission'}
                  </span>
                  <DueDateField
                    assignmentId={a.id}
                    dueDate={a.due_date}
                    overridden={a.due_date_overridden}
                    requiresSubmission={a.requires_submission}
                    onSave={onUpdateDueDate}
                  />
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
                  {a.submission_bundle_url ? (
                    <a href={a.submission_bundle_url} target="_blank" rel="noreferrer" style={{ fontWeight: 500 }}>Bundle ↗</a>
                  ) : (a.assignment_submissions || []).map((s, i) => (
                    <a key={s.id} href={s.file_url} target="_blank" rel="noreferrer">
                      {(a.assignment_submissions.length === 1) ? 'Submission ↗' : `Sub ${i + 1} ↗`}
                    </a>
                  ))}
                  {/* Submitting now marks the assignment completed directly (see
                      notify-submission), so this can't gate on status === 'submitted'
                      anymore -- gate on "has a submission, not yet reviewed" instead. */}
                  {a.status !== 'reviewed' && (a.assignment_submissions || []).length > 0 && (
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
                    onClick={() => onUnassign(a.id)}
                    title="Remove assignment"
                  >✕</button>
                </div>
                {review && (
                  <div className="assigned-row-review" style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
                    {review.ai_summary && <div>🤖 {review.ai_summary}</div>}
                    {(review.question_breakdown || []).length > 0 && (
                      <ul style={{ margin: '2px 0', paddingLeft: 18 }}>
                        {review.question_breakdown.map((b, i) => (
                          <li key={i}><strong>{b.verdict}</strong> — {b.question}: {b.note}</li>
                        ))}
                      </ul>
                    )}
                    {(review.issues || []).length > 0 && (
                      <div>Work on: {review.issues.join(', ')}</div>
                    )}
                    <div style={{ marginTop: 2 }}>
                      <strong>Your notes: </strong>
                      <ReviewNotesField
                        assignmentId={a.id}
                        initialNotes={review.mark_notes}
                        onSave={onUpdateReviewNotes}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
