import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchAssignments, fetchStudents, firstReview, updateAssignmentReviewNotes } from '../utils/supabase'
import { loadProblemBank } from '../utils/problemBank'
import { REVIEW_STATUS_COLOR, ReviewNotesField } from './AssignedView'

// Standalone, admin-only page showing one assignment's AI review -- the same
// report that goes out in the grading email (scripts/grade-submission-agent.mjs)
// and shows inline in AssignedView. Gated at /report by App.jsx the same way
// /launch is: only reachable when account.role === 'admin'. Exists so the
// pre-class popup (SessionLauncher) can link straight to a single report.
export default function AssignmentReportView() {
  const [searchParams] = useSearchParams()
  const assignmentId = searchParams.get('assignment')

  const [assignments, setAssignments] = useState(null)
  const [students, setStudents] = useState([])
  const [bank, setBank] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([fetchAssignments(), fetchStudents(), loadProblemBank()])
      .then(([asgs, studs, pb]) => {
        setAssignments(asgs)
        setStudents(studs)
        setBank(pb)
      })
      .catch(e => setError(e.message))
  }, [])

  const assignment = useMemo(
    () => assignments?.find(a => a.id === assignmentId) || null,
    [assignments, assignmentId]
  )
  const student = useMemo(
    () => students.find(s => s.id === assignment?.student_id) || null,
    [students, assignment]
  )
  const problem = useMemo(
    () => bank.find(p => p.id === assignment?.problem_id) || null,
    [bank, assignment]
  )
  const review = assignment ? firstReview(assignment) : null

  function saveNotes(id, notes) {
    updateAssignmentReviewNotes(id, notes).catch(e => setError(e.message))
  }

  if (error) return <div className="empty-state" style={{ marginTop: 80 }}>Error: {error}</div>
  if (assignments === null) return <div className="empty-state" style={{ marginTop: 80 }}>Loading… <span className="spin">⟳</span></div>
  if (!assignment) return <div className="empty-state" style={{ marginTop: 80 }}>No such assignment.</div>

  const problemName = problem?.name || assignment.problem_id

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: 4 }}>{student?.name || assignment.student_id}</h1>
      <div style={{ color: 'var(--text-dim)', marginBottom: 20 }}>{problemName}</div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        {problem?.problemUrl && (
          <a href={problem.problemUrl} target="_blank" rel="noreferrer">
            {problem.type === 'Book' ? 'Book ↗' : problem.type === 'Handout' ? 'Handout ↗' : 'Problem ↗'}
          </a>
        )}
        {assignment.submission_bundle_url ? (
          <a href={assignment.submission_bundle_url} target="_blank" rel="noreferrer">Submission ↗</a>
        ) : (assignment.assignment_submissions || []).map((s, i) => (
          <a key={s.id} href={s.file_url} target="_blank" rel="noreferrer">
            {(assignment.assignment_submissions.length === 1) ? 'Submission ↗' : `Sub ${i + 1} ↗`}
          </a>
        ))}
      </div>

      {!review ? (
        <div className="empty-state">No AI review yet for this assignment.</div>
      ) : (
        <div>
          {Number.isFinite(review.score_total) && (
            <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
              {review.score_correct} / {review.score_total}
              {review.source_label ? <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-dim)' }}> — {review.source_label}</span> : ''}
            </div>
          )}

          {review.ai_summary && <p style={{ marginBottom: 12 }}>🤖 {review.ai_summary}</p>}

          {(review.question_breakdown || []).length > 0 && (
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, marginBottom: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border, #2a2a2a)' }}>
                  <th style={{ padding: '4px 8px' }}>#</th>
                  <th style={{ padding: '4px 8px' }}>Answered</th>
                  <th style={{ padding: '4px 8px' }}>Correct</th>
                  <th style={{ padding: '4px 8px' }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {review.question_breakdown.map((b, i) => (
                  <tr key={i} style={{ color: REVIEW_STATUS_COLOR[b.status || b.verdict] || 'inherit' }}>
                    <td style={{ padding: '4px 8px', fontWeight: 600 }}>{b.question}</td>
                    <td style={{ padding: '4px 8px' }}>{b.student_answer}</td>
                    <td style={{ padding: '4px 8px' }}>{b.correct_answer}</td>
                    <td style={{ padding: '4px 8px' }}>{b.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(review.issues || []).length > 0 && (
            <p style={{ marginBottom: 12 }}>Work on: {review.issues.join(', ')}</p>
          )}

          <div>
            <strong>Your notes: </strong>
            <ReviewNotesField
              assignmentId={assignment.id}
              initialNotes={review.mark_notes}
              onSave={saveNotes}
            />
          </div>
        </div>
      )}
    </div>
  )
}
