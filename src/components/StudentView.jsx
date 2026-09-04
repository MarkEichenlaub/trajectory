import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  fetchFmaExams, fetchFmaHomeworkSets,
  fetchMyContacts, fetchMyContactsView,
  fetchStudentContacts,
  fetchInvoices, fetchMyInvoices,
  uploadSubmission, notifySubmission,
  markMyProblemCompleted,
} from '../utils/supabase'
import AccountManagement from './portal/AccountManagement'
import { ContactsTab } from './portal/ContactsPanel'
import InvoicesTab from './portal/InvoicesTab'
import ProblemBankBrowser from './portal/ProblemBankBrowser'
import ProgressAndPlanTab from './portal/ProgressAndPlanTab'
import FmaProgress from './portal/FmaProgress'
import FmaHomeworkRunner from './portal/FmaHomeworkRunner'
import FluencyPractice from './portal/FluencyPractice'
import SchedulingTab from './portal/SchedulingTab'
import { problemSummary } from '../utils/problemBank'

const VALID_TABS = new Set(['assigned', 'completed', 'all', 'sessions', 'scheduling', 'progress-plan', 'fma-progress', 'fluency', 'invoices', 'account'])

export default function StudentView({ student, assignments, sessions, problems, accessibleSources, sessionProblems, onMarkCompleted, onSignOut, isPreview, previewRole, account }) {
  // Billing (sessions-remaining, invoices, invoice routing) is visible only to
  // billing-capable roles. A logged-in student sees study info only. In admin
  // preview the role is chosen via previewRole, so Mark can see exactly what a
  // student / parent / adult sees; isPreview also switches reads to the admin
  // source and disables side-effecting actions.
  const role = isPreview ? (previewRole || 'student') : (account?.role || 'student')
  const canBill = role === 'parent' || role === 'adult'
  const isStudentRole = role === 'student'

  const location = useLocation()
  const navigate = useNavigate()

  // Derive tab from URL. Student/parent: /:tab?  Admin preview: /:slug/:tab?
  const pathSegs = location.pathname.split('/').filter(Boolean)
  const tab = (() => {
    const raw = isPreview ? pathSegs[1] : pathSegs[0]
    return VALID_TABS.has(raw) ? raw : 'assigned'
  })()

  const studentSlug = isPreview ? (student?.first_name || '').toLowerCase() : null

  function setTab(key) {
    if (!isPreview) {
      navigate(key === 'assigned' ? '/' : '/' + key)
    } else if (studentSlug) {
      navigate('/' + studentSlug + '/' + key)
    }
  }
  const [selectedTags, setSelectedTags] = useState(new Set())
  const [tagSort, setTagSort] = useState('freq')
  const [tagSearch, setTagSearch] = useState('')
  const [contacts, setContacts] = useState([])
  const [contactsLoaded, setContactsLoaded] = useState(false)
  const [invoices, setInvoices] = useState([])
  const [invoicesLoaded, setInvoicesLoaded] = useState(false)
  const [preselectExamId, setPreselectExamId] = useState(null)
  // Which assigned exams can actually be sat in the portal (vs. PDF only).
  const [digitizedExamIds, setDigitizedExamIds] = useState(new Set())
  // Which assigned F=ma weekly homework sets are digitized and takeable in-portal.
  const [digitizedHomeworkIds, setDigitizedHomeworkIds] = useState(new Set())
  const [activeHomeworkSet, setActiveHomeworkSet] = useState(null) // { id, name } | null
  const [submittingId, setSubmittingId] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [markingDoneId, setMarkingDoneId] = useState(null)
  const submitInputRef = useRef(null)
  const pendingSubmitId = useRef(null)

  useEffect(() => {
    if (tab !== 'account' || !student?.id || contactsLoaded) return
    // Admin preview → full rows; billing-capable → full rows incl invoice flags;
    // student → RPC view that omits invoice routing.
    const load = isPreview
      ? fetchStudentContacts(student.id)
      : isStudentRole
        ? fetchMyContactsView(student.id)
        : fetchMyContacts(student.id)
    load.then(c => { setContacts(c); setContactsLoaded(true) }).catch(console.error)
  }, [tab, student?.id, isPreview, isStudentRole, contactsLoaded])

  useEffect(() => {
    if ((tab !== 'account' && tab !== 'invoices') || !student?.id || invoicesLoaded || !canBill) return
    const load = isPreview ? fetchInvoices(student.id) : fetchMyInvoices()
    load.then(inv => { setInvoices(inv); setInvoicesLoaded(true) }).catch(console.error)
  }, [tab, student?.id, isPreview, canBill, invoicesLoaded])

  useEffect(() => {
    let cancelled = false
    fetchFmaExams()
      .then(e => { if (!cancelled) setDigitizedExamIds(new Set(e.map(x => x.id))) })
      .catch(() => {})
    fetchFmaHomeworkSets()
      .then(s => { if (!cancelled) setDigitizedHomeworkIds(new Set(s.map(x => x.id))) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  function problemById(id) {
    return problems.find(p => p.id === id)
  }

  const assignedItems = assignments
    // A submission-required assignment flips straight to 'completed' on
    // submit (see notify-submission) but stays here too, alongside Completed,
    // so the student can still keep adding files for an update afterward.
    .filter(a => a.status === 'assigned' || a.status === 'submitted' || a.status === 'reviewed'
      || (a.status === 'completed' && a.requires_submission))
    .sort((a, b) => (b.assigned_date || '').localeCompare(a.assigned_date || ''))

  const completedItems = assignments
    .filter(a => a.status === 'completed')
    .sort((a, b) => (b.completed_date || b.assigned_date || '').localeCompare(a.completed_date || a.assigned_date || ''))

  // Problem bank: accessible sources + any assigned/completed problems
  const bankProblems = useMemo(() => {
    const accessibleSet = new Set(accessibleSources || [])
    const assignedIds = new Set(assignments.map(a => a.problem_id))
    return problems.filter(p => accessibleSet.has(p.contest) || assignedIds.has(p.id))
  }, [problems, accessibleSources, assignments])

  // Same browse/tag/search UI as "All Problems", scoped to just what's been solved.
  const completedProblems = useMemo(() => {
    const completedIds = new Set(completedItems.map(a => a.problem_id))
    return problems.filter(p => completedIds.has(p.id))
  }, [problems, completedItems])

  const sortedSessions = [...(sessions || [])].sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at))

  // Parent check-ins share the sessions table but are not tutoring sessions:
  // they carry no summary or homework, so they belong only on the scheduling
  // screen (which gets the unfiltered list) and never in these counts.
  const tutoringSessions = sortedSessions.filter(s => s.session_type !== 'checkin')

  const now = new Date().toISOString()
  const nextSession = [...tutoringSessions]
    .filter(s => s.scheduled_at > now)
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))[0] || null

  const pastSessions = tutoringSessions.filter(s => s.end_time && s.end_time <= now)

  const allTagCounts = {}
  pastSessions.forEach(s => {
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
    ? pastSessions
    : pastSessions.filter(s => [...selectedTags].every(tag => (s.tags || []).includes(tag)))

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

  const tabs = [
    ['assigned', 'Assigned', assignedItems.length],
    ['completed', 'Completed', completedProblems.length],
    ['all', 'All Problems', bankProblems.length],
    ['sessions', 'Past Sessions', pastSessions.length],
    ['scheduling', 'Scheduling', null],
    ['progress-plan', 'Progress and Plan', null],
    ['fma-progress', 'F=ma Progress', null],
    ...(student?.fluency_practice_enabled ? [['fluency', 'Fluency Practice', null]] : []),
    ...(canBill ? [['invoices', 'Invoices', null]] : []),
    ['account', 'Account', null],
  ]

  const schedulePrefill = {
    name: student?.name || '',
    email: (isPreview ? student?.email : account?.email) || '',
  }

  function triggerSubmitUpload(assignmentId) {
    pendingSubmitId.current = assignmentId
    submitInputRef.current?.click()
  }

  async function handleSubmitFileChange(e) {
    const files = Array.from(e.target.files || [])
    const assignmentId = pendingSubmitId.current
    e.target.value = ''
    if (!files.length || !assignmentId || isPreview) return
    setSubmitError(null)
    setSubmittingId(assignmentId)
    try {
      const submissions = await Promise.all(
        files.map(async file => {
          const url = await uploadSubmission(student.id, assignmentId, file)
          return { url, fileName: file.name }
        })
      )
      await notifySubmission(assignmentId, submissions)
      // notify-submission marks the assignment completed server-side (unless
      // already reviewed); mirror that locally so the badge updates without
      // waiting for a reload.
      const existing = assignments.find(a => a.id === assignmentId)
      if (existing && existing.status !== 'reviewed' && onMarkCompleted) {
        onMarkCompleted({ ...existing, status: 'completed', completed_date: new Date().toISOString().slice(0, 10) })
      }
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmittingId(null)
    }
  }

  async function handleMarkDone(assignment) {
    if (!student?.id || !onMarkCompleted || isPreview) return
    setMarkingDoneId(assignment.id)
    try {
      const result = await markMyProblemCompleted(student.id, assignment.problem_id)
      if (result) onMarkCompleted(result)
    } catch (err) {
      console.error('Failed to mark done:', err)
    } finally {
      setMarkingDoneId(null)
    }
  }

  return (
    <div className="student-portal">
      <input
        ref={submitInputRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        multiple
        style={{ display: 'none' }}
        onChange={handleSubmitFileChange}
      />
      <div className="sp-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h1>{student?.name ? `${student.name}'s Portal` : 'My Portal'}</h1>
            <p className="sp-subtitle">
              {assignedItems.length} assigned · {completedItems.length} completed · {tutoringSessions.length} sessions
              {canBill && student?.session_balance != null && (
                <span style={{
                  marginLeft: 8,
                  color: student.session_balance <= 1 ? 'var(--yellow)' : 'var(--green)',
                  fontWeight: 600,
                }}>
                  · {student.session_balance} session{student.session_balance !== 1 ? 's' : ''} remaining
                </span>
              )}
            </p>
          </div>
          {onSignOut && (
            <button className="sm" style={{ flexShrink: 0 }} onClick={onSignOut}>Sign out</button>
          )}
        </div>
      </div>

      <div className="assigned-tabs">
        {tabs.map(([key, label, count]) => (
          <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
            {label}
            {count != null && <span className="tab-count">{count}</span>}
          </button>
        ))}
      </div>

      {activeHomeworkSet ? (
        <FmaHomeworkRunner
          studentId={student.id}
          setId={activeHomeworkSet.id}
          setName={activeHomeworkSet.name}
          onExit={() => setActiveHomeworkSet(null)}
        />
      ) : tab === 'progress-plan' ? (
        <ProgressAndPlanTab studentId={student.id} />
      ) : tab === 'fma-progress' ? (
        <FmaProgress
          studentId={student.id}
          isPreview={isPreview}
          preselectExamId={preselectExamId}
          assignedExamIds={assignments
            .filter(a => a.student_id === student.id && a.status !== 'completed')
            .map(a => a.problem_id)}
        />
      ) : tab === 'fluency' ? (
        <FluencyPractice studentId={student.id} isPreview={isPreview} dailyGoal={student?.fluency_daily_goal} />
      ) : tab === 'scheduling' ? (
        <SchedulingTab sessions={sortedSessions} formatDate={formatDate} student={student} isPreview={isPreview} viewerRole={role} />
      ) : tab === 'invoices' ? (
        <InvoicesTab invoices={invoices} setInvoices={setInvoices} isAdmin={isPreview} />
      ) : tab === 'account' ? (
        <>
          {canBill && (
            <AccountManagement
              student={student}
              relationship={isPreview ? (role === 'parent' ? 'parent' : 'self') : account?.students?.find(s => s.id === student.id)?.relationship}
              isPreview={isPreview}
            />
          )}
          <ContactsTab
            studentId={student.id}
            contacts={contacts}
            setContacts={setContacts}
            isAdmin={isPreview}
            canBill={canBill}
            isStudentRole={isStudentRole}
          />
        </>
      ) : tab === 'completed' ? (
        <ProblemBankBrowser
          bankProblems={completedProblems}
          assignments={assignments}
          student={student}
          isPreview={isPreview}
          hideStatusControls
          emptyMessage="No completed problems yet."
        />
      ) : tab === 'all' ? (
        <ProblemBankBrowser
          bankProblems={bankProblems}
          assignments={assignments}
          student={student}
          onMarkCompleted={onMarkCompleted}
          isPreview={isPreview}
        />
      ) : tab === 'sessions' ? (
        pastSessions.length === 0 ? (
          <div className="empty-state">No past sessions yet.</div>
        ) : (
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredSessions.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 0' }}>No sessions match the selected topics.</div>
              ) : filteredSessions.map(s => (
                <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: s.summary ? 8 : 0 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{formatDate(s.scheduled_at)}</span>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {s.miro_board_url && (
                        <a href={s.miro_board_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Whiteboard ↗</a>
                      )}
                      {s.miro_pdf_url && (
                        <a href={s.miro_pdf_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>PDF ↗</a>
                      )}
                    </div>
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
                  {(() => {
                    const covered = (sessionProblems || []).filter(sp => sp.session_id === s.id)
                    if (!covered.length) return null
                    return (
                      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Problems we covered
                        </div>
                        {covered.map(sp => {
                          const p = problems.find(pr => pr.id === sp.problem_id)
                          return (
                            <div key={sp.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                              <span style={{ flex: 1 }}>{sp.problem_name}</span>
                              {p?.problemUrl && (
                                <a href={p.problemUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Problem ↗</a>
                              )}
                              {p?.solutionUrl && (
                                <a href={p.solutionUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Solution ↗</a>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <>
          {assignedItems.length === 0 ? (
            (
              <div className="empty-state">
                No problems currently assigned.
              </div>
            )
          ) : (
            <div className="assigned-list">
              {submitError && (
            <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 8 }}>{submitError}</div>
          )}
          {assignedItems.map(a => {
            const p = problemById(a.problem_id)
            if (!p) return null
            const isResource = p.type === 'Book' || p.type === 'Handout' || p.type === 'Exam' || p.type === 'Homework'
            const linkLabel = p.type === 'Book' ? 'Book' : p.type === 'Handout' ? 'Handout' : p.type === 'Exam' ? 'Test PDF' : p.type === 'Homework' ? 'Homework' : 'Problem'
            // A digitized exam or homework set is taken in the portal, so send
            // the student straight into the runner rather than at a PDF/nothing.
            const takeable = p.type === 'Exam' && digitizedExamIds.has(p.id) && a.status !== 'completed'
            // Unlike exams, a completed homework set stays takeable too — the
            // runner itself shows the graded results once the attempt is graded,
            // so this doubles as "review your answers."
            const homeworkTakeable = p.type === 'Homework' && digitizedHomeworkIds.has(p.id)
            const dateLabel = a.status === 'completed' && a.completed_date
              ? `Completed ${a.completed_date}`
              : `Assigned ${a.assigned_date}`
            const dueLabel = a.requires_submission && a.due_date
              ? `Due ${a.due_date}`
              : null
            const subs = a.assignment_submissions || []
            // Completed is included so a student can keep adding files for an
            // update after submitting already marked it done.
            const canSubmit = (a.status === 'assigned' || a.status === 'submitted' || a.status === 'completed') && a.requires_submission
            // Manual "mark complete" is for problems with no file to turn in —
            // just a way to flag they've finished working on it. F=ma exams
            // and homework sets are excluded: they complete themselves once graded.
            const canMarkDone = a.status !== 'completed' && !a.requires_submission && p.type !== 'Exam' && p.type !== 'Homework'
            const summary = problemSummary(p)
            return (
              <div key={a.id} className="assigned-row">
                <span className={`status-badge ${a.status}`}>
                  {a.status === 'assigned' ? '→ Assigned'
                    : a.status === 'submitted' ? '⬆ Submitted'
                    : a.status === 'reviewed' ? '◎ Reviewed'
                    : '✓ Completed'}
                </span>
                <div className="assigned-problem-info">
                  <span className="p-label">{p.contest}{!isResource ? ` ${p.year} ${p.label}` : ''}</span>
                  <span className="p-name" title={summary ? `${p.name} — ${summary}` : undefined}>
                    {p.name}
                    {summary && <span className="p-meta"> ({summary})</span>}
                  </span>
                  {a.notes && <span className="p-date" style={{ fontStyle: 'italic' }}>{a.notes}</span>}
                  <span className="p-date">{dueLabel || dateLabel}</span>
                </div>
                <div className="assigned-row-links">
                  {takeable ? (
                    <button className="sm primary" onClick={() => { setPreselectExamId(p.id); setTab('fma-progress') }}>
                      Take Test →
                    </button>
                  ) : homeworkTakeable ? (
                    <button className="sm primary" onClick={() => setActiveHomeworkSet({ id: p.id, name: p.name })}>
                      Homework →
                    </button>
                  ) : p.problemUrl && (
                    <a href={p.problemUrl} target="_blank" rel="noreferrer">{linkLabel} ↗</a>
                  )}
                  {p.solutionUrl && a.status === 'completed' && <a href={p.solutionUrl} target="_blank" rel="noreferrer">Solution ↗</a>}
                  {subs.map((s, i) => (
                    <a key={s.id} href={s.file_url} target="_blank" rel="noreferrer">
                      {subs.length === 1 ? 'Submission ↗' : `Submission ${i + 1} ↗`}
                    </a>
                  ))}
                  {a.feedback_url && (
                    <a href={a.feedback_url} target="_blank" rel="noreferrer">Feedback ↗</a>
                  )}
                  {canSubmit && (
                    <button
                      className="sm"
                      style={{ fontSize: 11, padding: '1px 6px' }}
                      disabled={submittingId === a.id || isPreview}
                      onClick={() => !isPreview && triggerSubmitUpload(a.id)}
                      title={isPreview ? 'Submit (disabled in preview)' : undefined}
                    >
                      {submittingId === a.id ? 'Uploading…' : subs.length ? 'Add files' : 'Submit'}
                    </button>
                  )}
                  {canMarkDone && !isPreview && onMarkCompleted && (
                    <button
                      className="sm"
                      style={{ fontSize: 11, padding: '1px 6px' }}
                      disabled={markingDoneId === a.id}
                      onClick={() => handleMarkDone(a)}
                      title="Mark this as finished"
                    >
                      {markingDoneId === a.id ? '…' : 'Mark complete'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
