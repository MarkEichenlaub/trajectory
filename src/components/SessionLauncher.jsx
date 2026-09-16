import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  fetchSessions, fetchAssignments, fetchStudents, fetchSessionProblems, firstReview,
  fetchFmaAttempts, fetchFmaHomeworkAttempts, fetchFmaExams, fetchFmaHomeworkSets,
} from '../utils/supabase'
import { loadProblemBank } from '../utils/problemBank'

// Calendar date (YYYY-MM-DD) for a timestamp, read in the student's timezone.
function localDate(ts, tz) {
  return new Date(ts).toLocaleDateString('en-CA', { timeZone: tz })
}

function submissionUrl(a) {
  if (a.submission_bundle_url) return a.submission_bundle_url
  const subs = a.assignment_submissions || []
  return subs[0]?.file_url || ''
}

function problemLinkLabel(p) {
  return p?.type === 'Book' ? 'Book' : p?.type === 'Handout' ? 'Handout' : p?.type === 'Exam' ? 'Exam' : 'Problem'
}

export default function SessionLauncher() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session')

  const [sessions, setSessions] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [students, setStudents] = useState([])
  const [bank, setBank] = useState([])
  const [sessionProblems, setSessionProblems] = useState([])
  const [examAttempts, setExamAttempts] = useState([])
  const [hwAttempts, setHwAttempts] = useState([])
  // Exams and homework sets digitized into the portal runners. These have no
  // PDF of their own, so without a portal link their rows read "no problem
  // link" and there's no way to pull the questions up before the session.
  const [takeableExamIds, setTakeableExamIds] = useState(new Set())
  const [takeableHwIds, setTakeableHwIds] = useState(new Set())
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
    fetchFmaExams().then(e => setTakeableExamIds(new Set(e.map(x => x.id)))).catch(() => {})
    fetchFmaHomeworkSets().then(s => setTakeableHwIds(new Set(s.map(x => x.id)))).catch(() => {})
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
  const tz = student?.timezone || 'America/New_York'

  // F=ma sittings live in their own tables, not in `assignments`, so a test the
  // student took since last time only shows up if we go get it.
  useEffect(() => {
    const sid = session?.student_id
    if (!sid) return
    let cancelled = false
    Promise.all([fetchFmaAttempts(sid), fetchFmaHomeworkAttempts(sid)])
      .then(([ex, hw]) => {
        if (cancelled) return
        setExamAttempts(ex)
        setHwAttempts(hw)
      })
      .catch(() => { if (!cancelled) { setExamAttempts([]); setHwAttempts([]) } })
    return () => { cancelled = true }
  }, [session?.student_id])

  // "Since last time" runs from the previous session with this student. With no
  // previous session (first meeting, or a gap in the calendar) fall back to two
  // weeks so the page still has something on it.
  const sinceAt = useMemo(() => {
    if (!session || !sessions) return null
    const t = new Date(session.scheduled_at).getTime()
    const prev = sessions
      .filter(s => s.student_id === session.student_id && s.session_type !== 'checkin')
      .filter(s => new Date(s.scheduled_at).getTime() < t)
      .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))[0]
    return prev ? new Date(prev.scheduled_at) : new Date(t - 14 * 86400000)
  }, [sessions, session])

  const attemptsFor = useMemo(() => {
    return problemId => [
      ...examAttempts.filter(a => a.exam_id === problemId).map(a => ({ attempt: a, kind: 'exam' })),
      ...hwAttempts.filter(a => a.set_id === problemId).map(a => ({ attempt: a, kind: 'hw' })),
    ]
  }, [examAttempts, hwAttempts])

  const toItem = useMemo(() => {
    return a => ({
      assignment: a,
      problem: bank.find(p => p.id === a.problem_id) || null,
      submission: submissionUrl(a),
      review: firstReview(a),
      attempts: attemptsFor(a.problem_id),
    })
  }, [bank, attemptsFor])

  // Everything still open, whether or not it carries a due date. Most of what
  // Mark assigns (handouts, F=ma exams) has no due date at all, so keying this
  // list off one made the page read "nothing due" almost every time.
  const openItems = useMemo(() => {
    if (!session) return []
    return assignments
      .filter(a => a.student_id === session.student_id && ['assigned', 'submitted'].includes(a.status))
      .sort((a, b) =>
        (a.due_date || '9999-99-99').localeCompare(b.due_date || '9999-99-99') ||
        String(b.assigned_date || '').localeCompare(String(a.assigned_date || ''))
      )
      .map(toItem)
  }, [session, assignments, toItem])

  const doneItems = useMemo(() => {
    if (!session || !sinceAt) return []
    const sinceDay = localDate(sinceAt, tz)
    return assignments
      .filter(a =>
        a.student_id === session.student_id &&
        a.status === 'completed' &&
        String(a.completed_date || '').slice(0, 10) >= sinceDay
      )
      .sort((a, b) => String(b.completed_date || '').localeCompare(String(a.completed_date || '')))
      .map(toItem)
  }, [session, assignments, sinceAt, tz, toItem])

  // A test taken without an assignment behind it still belongs on the page.
  const loneAttempts = useMemo(() => {
    if (!session || !sinceAt) return []
    const shown = new Set(doneItems.map(i => i.assignment.problem_id))
    return [
      ...examAttempts.map(a => ({ attempt: a, kind: 'exam', problemId: a.exam_id })),
      ...hwAttempts.map(a => ({ attempt: a, kind: 'hw', problemId: a.set_id })),
    ]
      .filter(x => !shown.has(x.problemId))
      .filter(x => x.attempt.submitted_at && new Date(x.attempt.submitted_at) >= sinceAt)
      .sort((a, b) => new Date(b.attempt.submitted_at) - new Date(a.attempt.submitted_at))
  }, [session, sinceAt, doneItems, examAttempts, hwAttempts])

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

  const startStr = new Date(session.scheduled_at).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZone: tz, timeZoneName: 'short',
  })
  const sinceStr = sinceAt
    ? new Date(sinceAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz })
    : ''

  const fmaUrl = attempt =>
    `${window.location.origin}/?view=fma&student=${session.student_id}&attempt=${attempt.id}`

  // A digitized exam or homework set is taken in the portal and has no PDF, so
  // the only way to see the questions is the student's own portal page. The
  // slug route (/akshatha/...) is the admin preview of it. Landing on the tab
  // doesn't start anything — the runner only opens on a click — so this is
  // safe to fire from "Open all".
  const slug = (student?.first_name || '').toLowerCase()
  const portalLink = problem => {
    if (!problem || !slug) return null
    const base = `${window.location.origin}/${slug}`
    if (takeableExamIds.has(problem.id)) return { url: `${base}/fma-progress`, label: 'Exam' }
    if (takeableHwIds.has(problem.id)) return { url: `${base}/assigned`, label: 'Quiz' }
    return null
  }

  const links = [
    session.meet_url && { label: 'Join Meet', url: session.meet_url, primary: true },
    session.miro_board_url && { label: 'Whiteboard', url: session.miro_board_url, primary: true },
    session.prep_note_url && { label: 'Next-time link', url: session.prep_note_url },
  ].filter(Boolean)
  openItems.forEach(({ problem }) => {
    const portal = problem?.problemUrl ? null : portalLink(problem)
    if (problem?.problemUrl) links.push({ label: `${problemLinkLabel(problem)} ↗`, url: problem.problemUrl })
    else if (portal) links.push({ label: `${portal.label} ↗`, url: portal.url })
  })
  doneItems.forEach(({ assignment, problem, submission, review, attempts }) => {
    if (problem?.problemUrl) links.push({ label: `${problemLinkLabel(problem)} ↗`, url: problem.problemUrl })
    if (submission) links.push({ label: 'Submission ↗', url: submission })
    if (review) links.push({ label: 'Report ↗', url: `${window.location.origin}/report?assignment=${assignment.id}` })
    attempts.filter(a => a.kind === 'exam' && a.attempt.submitted_at)
      .forEach(a => links.push({ label: 'F=ma results ↗', url: fmaUrl(a.attempt) }))
  })
  loneAttempts.filter(a => a.kind === 'exam')
    .forEach(a => links.push({ label: 'F=ma results ↗', url: fmaUrl(a.attempt) }))
  onDeckItems.forEach(({ problem }) => {
    const portal = problem?.problemUrl ? null : portalLink(problem)
    if (problem?.problemUrl) {
      links.push({ label: `On deck: ${problemLinkLabel(problem)} ↗`, url: problem.problemUrl })
    } else if (portal) {
      links.push({ label: `On deck: ${portal.label} ↗`, url: portal.url })
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

  const nothingAtAll = openItems.length === 0 && doneItems.length === 0 && loneAttempts.length === 0

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: 4 }}>{student?.name || session.student_id}</h1>
      <div style={{ color: 'var(--text-dim)', marginBottom: 20 }}>{startStr}</div>

      {session.prep_note && (
        <div style={{
          background: 'var(--accent-dim, #2a2416)', border: '1px solid var(--accent, #d4a72c)',
          borderRadius: 'var(--radius, 6px)', padding: '10px 14px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            Next time
          </div>
          <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{session.prep_note}</div>
          {session.prep_note_url && (
            <div style={{ marginTop: 6 }}>
              <a href={session.prep_note_url} target="_blank" rel="noreferrer">Open link ↗</a>
            </div>
          )}
        </div>
      )}

      <button
        ref={openAllRef}
        onClick={openAll}
        disabled={links.length === 0}
        style={{ fontSize: 16, padding: '10px 18px', marginBottom: 24, fontWeight: 600 }}
      >
        Open all ({links.length})
      </button>

      {/* The copilot runs on Mark's laptop, so this page can only remind him to
          start it: the portal is HTTPS and browsers block a call to
          http://localhost, which is why there is no "is it running?" check. */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        color: 'var(--text-dim)', fontSize: 13, marginBottom: 24, marginTop: -12,
      }}>
        <span aria-hidden="true">◆</span>
        <span>
          Start the session copilot — <strong>CapsLock+M</strong>, or type <code>;tutor</code>
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <LinkRow label="Join Meet" url={session.meet_url} fallback="No Meet link" />
        <LinkRow label="Whiteboard" url={session.miro_board_url} fallback="No whiteboard" />

        {nothingAtAll && (
          <div style={{ color: 'var(--text-dim)', marginTop: 8 }}>
            Nothing assigned, and nothing new since last time.
          </div>
        )}

        {doneItems.length + loneAttempts.length > 0 && (
          <SectionHeader>Since last time{sinceStr ? ` (${sinceStr})` : ''}</SectionHeader>
        )}
        {doneItems.map(item => (
          <AssignmentRow key={item.assignment.id} item={item} fmaUrl={fmaUrl} portalLink={portalLink} tz={tz} />
        ))}
        {loneAttempts.map(({ attempt, kind }) => (
          <AttemptRow key={attempt.id} attempt={attempt} kind={kind} fmaUrl={fmaUrl} tz={tz} />
        ))}

        {openItems.length > 0 && <SectionHeader>Still open</SectionHeader>}
        {openItems.map(item => (
          <AssignmentRow key={item.assignment.id} item={item} fmaUrl={fmaUrl} portalLink={portalLink} tz={tz} open />
        ))}

        {onDeckItems.length > 0 && (
          <>
            <SectionHeader>On deck</SectionHeader>
            {onDeckItems.map(({ sp, problem }) => (
              <div key={sp.id} style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border, #2a2a2a)' }}>
                <div style={{ fontWeight: 500, marginBottom: 6 }}>
                  {problem?.name || sp.problem_name || sp.problem_id}
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {problem?.problemUrl
                    ? <a href={problem.problemUrl} target="_blank" rel="noreferrer">{problemLinkLabel(problem)} ↗</a>
                    : portalLink(problem)
                      ? <a href={portalLink(problem).url} target="_blank" rel="noreferrer">{portalLink(problem).label} ↗</a>
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

function SectionHeader({ children }) {
  return (
    <div style={{ marginTop: 16, fontWeight: 600, color: 'var(--text-dim)' }}>{children}</div>
  )
}

function AssignmentRow({ item, fmaUrl, portalLink, tz, open }) {
  const { assignment, problem, submission, review, attempts } = item
  const scored = attempts.filter(a => a.attempt.submitted_at)
  const portal = problem?.problemUrl ? null : portalLink(problem)
  return (
    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border, #2a2a2a)' }}>
      <div style={{ fontWeight: 500, marginBottom: 6 }}>
        {problem?.name || assignment.problem_id}
        {open && assignment.due_date && (
          <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: 13 }}>
            {' '}— due {new Date(assignment.due_date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
          </span>
        )}
        {!open && assignment.completed_date && (
          <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: 13 }}>
            {' '}— done {new Date(assignment.completed_date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {problem?.problemUrl
          ? <a href={problem.problemUrl} target="_blank" rel="noreferrer">{problemLinkLabel(problem)} ↗</a>
          : portal
            ? <a href={portal.url} target="_blank" rel="noreferrer">{portal.label} ↗</a>
            : <span style={{ color: 'var(--text-dim)' }}>No problem link</span>}
        {submission
          ? <a href={submission} target="_blank" rel="noreferrer">Submission ↗</a>
          : assignment.requires_submission
            ? <span style={{ color: 'var(--text-dim)' }}>No submission yet</span>
            : null}
        {review && (
          <a href={`/report?assignment=${assignment.id}`} target="_blank" rel="noreferrer">Report ↗</a>
        )}
        {scored.map(({ attempt, kind }) => (
          kind === 'exam'
            ? <a key={attempt.id} href={fmaUrl(attempt)} target="_blank" rel="noreferrer">
                F=ma results{attempt.score != null ? ` (${attempt.score}/25)` : ''} ↗
              </a>
            : <span key={attempt.id} style={{ color: 'var(--text-dim)' }}>
                F=ma homework{attempt.score != null ? `: ${attempt.score}` : ''}
              </span>
        ))}
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
  )
}

function AttemptRow({ attempt, kind, fmaUrl, tz }) {
  const name = attempt.handouts?.name || attempt.exam_id || attempt.set_id
  const when = new Date(attempt.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: tz })
  return (
    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border, #2a2a2a)' }}>
      <div style={{ fontWeight: 500, marginBottom: 6 }}>
        {name}
        <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: 13 }}> — done {when}</span>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {kind === 'exam'
          ? <a href={fmaUrl(attempt)} target="_blank" rel="noreferrer">
              F=ma results{attempt.score != null ? ` (${attempt.score}/25)` : ''} ↗
            </a>
          : <span style={{ color: 'var(--text-dim)' }}>
              F=ma homework{attempt.score != null ? `: ${attempt.score}` : ''}
            </span>}
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
