import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchSessions, fetchAssignments, fetchStudents, fetchSessionProblems, firstReview } from '../utils/supabase'
import { loadProblemBank } from '../utils/problemBank'

// "What's due for this session" — match the recalc_assignment_due_dates trigger:
// due_date = (session date in America/Los_Angeles) − 1 day.
// See supabase/migrations/20260605220000_due_dates_and_submissions.sql.
function dueDateForSession(scheduledAt) {
  const laDate = new Date(scheduledAt).toLocaleDateString('en-CA', {
    timeZone: 'America/Los_Angeles',
  }) // 'YYYY-MM-DD'
  const d = new Date(laDate + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

function submissionUrl(a) {
  if (a.submission_bundle_url) return a.submission_bundle_url
  const subs = a.assignment_submissions || []
  return subs[0]?.file_url || ''
}

export default function SessionLauncher() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session')

  const [sessions, setSessions] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [students, setStudents] = useState([])
  const [bank, setBank] = useState([])
  const [sessionProblems, setSessionProblems] = useState([])
  const [error, setError] = useState(null)
  const openAllRef = useRef(null)

  useEffect(() => {
    Promise.all([fetchSessions(), fetchAssignments(), fetchStudents(), loadProblemBank(), fetchSessionProblems()])
      .then(([sess, asgs, studs, pb, sp]) => {
        setSessions(sess)
        setAssignments(asgs)
        setStudents(studs)
        setBank(pb)
        setSessionProblems(sp)
      })
      .catch(e => setError(e.message))
  }, [])

  const session = useMemo(() => {
    if (!sessions) return null
    if (sessionId) return sessions.find(s => s.id === sessionId) || null
    // Skip parent check-ins: there's no board to open and no homework to review,
    // so landing on one would hide the real next session.
    const now = Date.now()
    return sessions
      .filter(s => s.session_type !== 'checkin')
      .filter(s => new Date(s.scheduled_at).getTime() > now)
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0] || null
  }, [sessions, sessionId])

  const student = useMemo(
    () => students.find(s => s.id === session?.student_id) || null,
    [students, session]
  )

  const dueItems = useMemo(() => {
    if (!session) return []
    const dueStr = dueDateForSession(session.scheduled_at)
    return assignments
      .filter(a =>
        a.student_id === session.student_id &&
        a.requires_submission &&
        ['assigned', 'submitted'].includes(a.status) &&
        String(a.due_date || '').slice(0, 10) === dueStr
      )
      .map(a => ({
        assignment: a,
        problem: bank.find(p => p.id === a.problem_id) || null,
        submission: submissionUrl(a),
        review: firstReview(a),
      }))
  }, [session, assignments, bank])

  const onDeckItems = useMemo(() => {
    if (!session) return []
    return sessionProblems
      .filter(sp => sp.session_id === session.id)
      .map(sp => ({
        sp,
        problem: bank.find(p => p.id === sp.problem_id) || null,
      }))
  }, [session, sessionProblems, bank])

  // Focus "Open all" so it's a single keypress once the page loads.
  useEffect(() => {
    if (session && openAllRef.current) openAllRef.current.focus()
  }, [session])

  if (error) return <div className="empty-state" style={{ marginTop: 80 }}>Error: {error}</div>
  if (sessions === null) return <div className="empty-state" style={{ marginTop: 80 }}>Loading… <span className="spin">⟳</span></div>
  if (!session) return <div className="empty-state" style={{ marginTop: 80 }}>No upcoming session found.</div>

  const tz = student?.timezone || 'America/New_York'
  const startStr = new Date(session.scheduled_at).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZone: tz, timeZoneName: 'short',
  })

  const links = [
    session.meet_url && { label: 'Join Meet', url: session.meet_url, primary: true },
    session.miro_board_url && { label: 'Whiteboard', url: session.miro_board_url, primary: true },
  ].filter(Boolean)
  dueItems.forEach(({ problem, submission }) => {
    if (problem?.problemUrl) {
      const label = problem.type === 'Book' ? 'Book' : problem.type === 'Handout' ? 'Handout' : 'Problem'
      links.push({ label: `${label} ↗`, url: problem.problemUrl })
    }
    if (submission) links.push({ label: 'Submission ↗', url: submission })
  })
  onDeckItems.forEach(({ problem }) => {
    if (problem?.problemUrl) {
      const label = problem.type === 'Book' ? 'Book' : problem.type === 'Handout' ? 'Handout' : 'Problem'
      links.push({ label: `On deck: ${label} ↗`, url: problem.problemUrl })
    }
    if (problem?.solutionUrl) {
      links.push({ label: 'On deck: Solution ↗', url: problem.solutionUrl })
    }
  })

  // Browsers block multiple window.open() calls fired synchronously; staggering
  // each by 300 ms keeps them within the user-gesture window while avoiding the
  // popup blocker that fires after the first simultaneous open.
  const openAll = () => links.forEach((l, i) => {
    setTimeout(() => window.open(l.url, '_blank', 'noopener,noreferrer'), i * 300)
  })

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: 4 }}>{student?.name || session.student_id}</h1>
      <div style={{ color: 'var(--text-dim)', marginBottom: 20 }}>{startStr}</div>

      <button
        ref={openAllRef}
        onClick={openAll}
        disabled={links.length === 0}
        style={{ fontSize: 16, padding: '10px 18px', marginBottom: 24, fontWeight: 600 }}
      >
        Open all ({links.length})
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <LinkRow label="Join Meet" url={session.meet_url} fallback="No Meet link" />
        <LinkRow label="Whiteboard" url={session.miro_board_url} fallback="No whiteboard" />

        {dueItems.length === 0 && (
          <div style={{ color: 'var(--text-dim)', marginTop: 8 }}>Nothing due for this session.</div>
        )}
        {dueItems.map(({ assignment, problem, submission, review }) => (
          <div key={assignment.id} style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border, #2a2a2a)' }}>
            <div style={{ fontWeight: 500, marginBottom: 6 }}>
              {problem?.name || assignment.problem_id}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {problem?.problemUrl
                ? <a href={problem.problemUrl} target="_blank" rel="noreferrer">
                    {problem.type === 'Book' ? 'Book ↗' : problem.type === 'Handout' ? 'Handout ↗' : 'Problem ↗'}
                  </a>
                : <span style={{ color: 'var(--text-dim)' }}>No problem link</span>}
              {submission
                ? <a href={submission} target="_blank" rel="noreferrer">Submission ↗</a>
                : <span style={{ color: 'var(--text-dim)' }}>No submission yet</span>}
            </div>
            {review && (
              <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-dim)' }}>
                {review.ai_summary && <div>🤖 {review.ai_summary}</div>}
                {(review.question_breakdown || []).length > 0 && (
                  <ul style={{ margin: '4px 0', paddingLeft: 18 }}>
                    {review.question_breakdown.map((b, i) => (
                      <li key={i}><strong>{b.verdict}</strong> — {b.question}: {b.note}</li>
                    ))}
                  </ul>
                )}
                {(review.issues || []).length > 0 && (
                  <div>Work on: {review.issues.join(', ')}</div>
                )}
                {review.mark_notes && <div style={{ marginTop: 2 }}><strong>Your notes:</strong> {review.mark_notes}</div>}
              </div>
            )}
          </div>
        ))}

        {onDeckItems.length > 0 && (
          <>
            <div style={{ marginTop: 16, fontWeight: 600, color: 'var(--text-dim)' }}>On deck</div>
            {onDeckItems.map(({ sp, problem }) => (
              <div key={sp.id} style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border, #2a2a2a)' }}>
                <div style={{ fontWeight: 500, marginBottom: 6 }}>
                  {problem?.name || sp.problem_name || sp.problem_id}
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {problem?.problemUrl
                    ? <a href={problem.problemUrl} target="_blank" rel="noreferrer">
                        {problem.type === 'Book' ? 'Book ↗' : problem.type === 'Handout' ? 'Handout ↗' : 'Problem ↗'}
                      </a>
                    : <span style={{ color: 'var(--text-dim)' }}>No problem link</span>}
                  {problem?.solutionUrl
                    ? <a href={problem.solutionUrl} target="_blank" rel="noreferrer">Solution ↗</a>
                    : <span style={{ color: 'var(--text-dim)' }}>No solution</span>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function LinkRow({ label, url, fallback }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
      <span style={{ minWidth: 100, fontWeight: 500 }}>{label}</span>
      {url
        ? <a href={url} target="_blank" rel="noreferrer">{url}</a>
        : <span style={{ color: 'var(--text-dim)' }}>{fallback}</span>}
    </div>
  )
}
