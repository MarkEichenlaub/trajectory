import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchJSON } from '../utils/github'
import { supabase, fetchStudents, fetchAssignments, fetchSessions, fetchHandouts, fetchStudentContacts, fetchInvoices, insertAssignments, updateAssignment, deleteAssignment, saveStudent, removeStudent, sendEmail, fetchStudentAccessibleSources, uploadFeedback, publishFeedback } from '../utils/supabase'
import { buildEmailBody } from '../utils/gmail'
import SendEmailModal from './SendEmailModal'
import FilterSidebar from './FilterSidebar'
import ProblemTable from './ProblemTable'
import AssignedView from './AssignedView'
import SessionsView from './SessionsView'
import HandoutsManager from './HandoutsManager'
import StudentView, { ContactsTab } from './StudentView'
import AdminProgressPlanView from './AdminProgressPlanView'
import AccountsView from './AccountsView'
import Settings from './Settings'
import TagOntologyView from './TagOntologyView'
import Toast from './Toast'

const VIEWS = { BROWSER: 'browser', ASSIGNED: 'assigned', SESSIONS: 'sessions', SCHEDULE: 'schedule', HANDOUTS: 'handouts', TAGS: 'tags', PROGRESS_PLAN: 'progress-plan', BILLING: 'billing', ACCOUNTS: 'accounts', SETTINGS: 'settings' }
const MARK_STUDENT_ID = 'mark'

const DEFAULT_FILTERS = {
  contests: new Set(),
  types: new Set(),
  topics: new Set(),
  statuses: new Set(),
  selectedTags: new Set(),
  textSearch: '',
  hideCompleted: false,
}

export default function AdminApp() {
  const [problems, setProblems] = useState([])
  const [handouts, setHandouts] = useState([])
  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [sessions, setSessions] = useState([])
  const [assignedOrderOverrides, setAssignedOrderOverrides] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [view, setView] = useState(VIEWS.BROWSER)
  const [activeStudentId, setActiveStudentId] = useState('borna')
  const [previewStudentId, setPreviewStudentId] = useState(null)
  const [previewRole, setPreviewRole] = useState('student')
  const [previewAccessibleSources, setPreviewAccessibleSources] = useState([])
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selected, setSelected] = useState(new Set())
  const [toast, setToast] = useState(null)
  const [sortCol, setSortCol] = useState('year')
  const [sortDir, setSortDir] = useState('desc')
  const [emailDraft, setEmailDraft] = useState(null)

  useEffect(() => {
    async function load() {
      const p = await fetchJSON('data/problems.json').catch(() => [])
      setProblems(p)
      setLoading(false)
      try {
        const [s, a, sess, hout] = await Promise.all([fetchStudents(), fetchAssignments(), fetchSessions(), fetchHandouts().catch(() => [])])
        setStudents(s)
        setAssignments(a)
        setSessions(sess)
        setHandouts(hout)
      } catch (e) {
        setError(e.message)
      }
    }
    load()
  }, [])

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  useEffect(() => {
    if (!previewStudentId) { setPreviewAccessibleSources([]); return }
    fetchStudentAccessibleSources(previewStudentId)
      .then(setPreviewAccessibleSources)
      .catch(() => setPreviewAccessibleSources([]))
  }, [previewStudentId])

  const allProblems = useMemo(() => [
    ...problems,
    ...handouts.map(h => ({
      id: h.id,
      contest: h.source,
      type: h.resource_type === 'book' ? 'Book' : h.resource_type === 'exam' ? 'Exam' : 'Handout',
      name: h.name,
      desc: h.description || '',
      topics: h.topics || [],
      tags: h.tags || [],
      year: h.year || 0,
      label: '',
      country: '',
      problemUrl: h.pdf_url || '',
      solutionUrl: h.solution_url || null,
    })),
  ], [problems, handouts])

  const allSources = useMemo(() =>
    [...new Set(allProblems.map(p => p.contest))].sort(),
    [allProblems]
  )

  async function refreshHandouts() {
    const hout = await fetchHandouts().catch(() => [])
    setHandouts(hout)
  }

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0]

  const statusMap = useMemo(() => {
    const map = {}
    assignments
      .filter(a => a.student_id === activeStudentId)
      .forEach(a => { map[a.problem_id] = a.status })
    return map
  }, [assignments, activeStudentId])

  const preTagFilterProblems = useMemo(() => allProblems.filter(p => {
    if (filters.contests.size > 0 && !filters.contests.has(p.contest)) return false
    if (filters.types.size > 0 && !filters.types.has(p.type)) return false
    if (filters.topics.size > 0 && !p.topics.some(t => filters.topics.has(t))) return false
    if (filters.hideCompleted && statusMap[p.id] === 'completed') return false
    if (filters.statuses.size > 0) {
      const pStatus = statusMap[p.id] || 'not-started'
      if (!filters.statuses.has(pStatus)) return false
    }
    if (filters.textSearch) {
      const q = filters.textSearch.toLowerCase()
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.desc.toLowerCase().includes(q) &&
        !p.tags.some(t => t.toLowerCase().includes(q)) &&
        !(p.year ? String(p.year).includes(q) : false) &&
        !(p.country || '').toLowerCase().includes(q)
      ) return false
    }
    return true
  }), [allProblems, filters, statusMap])

  const filteredProblems = useMemo(() => {
    if (filters.selectedTags.size === 0) return preTagFilterProblems
    return preTagFilterProblems.filter(p =>
      [...filters.selectedTags].every(tag => p.tags.includes(tag))
    )
  }, [preTagFilterProblems, filters.selectedTags])

  const sorted = useMemo(() => {
    const statusOrder = { assigned: 0, 'not-started': 1, completed: 2 }
    return [...filteredProblems].sort((a, b) => {
      let av, bv
      if (sortCol === 'status') {
        av = statusOrder[statusMap[a.id] || 'not-started']
        bv = statusOrder[statusMap[b.id] || 'not-started']
      } else {
        av = a[sortCol]; bv = b[sortCol]
        if (sortCol === 'name') { av = av.toLowerCase(); bv = bv.toLowerCase() }
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredProblems, sortCol, sortDir, statusMap])

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function selectAll() { setSelected(new Set(sorted.map(p => p.id))) }
  function clearSelection() { setSelected(new Set()) }

  const selectedProblems = allProblems.filter(p => selected.has(p.id))

  async function handleAssign() {
    if (!activeStudent || selected.size === 0) return
    const date = new Date().toISOString().slice(0, 10)
    const toAdd = []
    let skipped = 0

    const markStatusMap = {}
    if (activeStudent.id !== MARK_STUDENT_ID) {
      assignments
        .filter(a => a.student_id === MARK_STUDENT_ID)
        .forEach(a => { markStatusMap[a.problem_id] = a.status })
    }

    for (const pid of selected) {
      if (statusMap[pid]) { skipped++; continue }
      toAdd.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${pid}`,
        student_id: activeStudent.id,
        problem_id: pid,
        status: 'assigned',
        assigned_date: date,
        completed_date: null,
      })
      if (activeStudent.id !== MARK_STUDENT_ID && !markStatusMap[pid]) {
        toAdd.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${pid}`,
          student_id: MARK_STUDENT_ID,
          problem_id: pid,
          status: 'assigned',
          assigned_date: date,
          completed_date: null,
        })
      }
    }

    if (toAdd.length === 0) {
      showToast('All selected problems are already assigned or completed', 'error')
      return
    }

    try {
      await insertAssignments(toAdd)
      setAssignments(prev => [...prev, ...toAdd])
      setSelected(new Set())
      const studentAssigned = toAdd.filter(a => a.student_id === activeStudent.id).length
      const markCoAssigned = toAdd.filter(a => a.student_id === MARK_STUDENT_ID).length
      const msg = skipped > 0
        ? `Assigned ${studentAssigned} problem${studentAssigned > 1 ? 's' : ''} to ${activeStudent.name} (${skipped} skipped)${markCoAssigned > 0 ? `, ${markCoAssigned} also added for you` : ''}`
        : `Assigned ${studentAssigned} problem${studentAssigned > 1 ? 's' : ''} to ${activeStudent.name}${markCoAssigned > 0 ? `, ${markCoAssigned} also added for you` : ''}`
      showToast(msg)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleToggleStatus(problemId) {
    const existing = assignments.find(a => a.student_id === activeStudentId && a.problem_id === problemId)
    if (!existing) return

    // completed → back to assigned; anything else → completed
    const newStatus = existing.status === 'completed' ? 'assigned' : 'completed'
    const updates = {
      status: newStatus,
      completed_date: newStatus === 'completed' ? new Date().toISOString().slice(0, 10) : null,
    }
    try {
      await updateAssignment(existing.id, updates)
      setAssignments(prev => prev.map(a => a.id === existing.id ? { ...a, ...updates } : a))
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleUpdateNote(assignmentId, notes) {
    try {
      await updateAssignment(assignmentId, { notes })
      setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, notes } : a))
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleUploadFeedback(assignmentId, file) {
    const assignment = assignments.find(a => a.id === assignmentId)
    if (!assignment) return
    const student = students.find(s => s.id === assignment.student_id)
    const problem = allProblems.find(p => p.id === assignment.problem_id)
    const problemLabel = problem
      ? `${problem.contest} ${problem.year} ${problem.label} — ${problem.name}`
      : assignment.problem_id
    try {
      const feedbackUrl = await uploadFeedback(assignment.student_id, assignmentId, file)
      await publishFeedback(assignment, feedbackUrl, student?.name || assignment.student_id, problemLabel)
      setAssignments(prev => prev.map(a => a.id === assignmentId
        ? { ...a, status: 'reviewed', feedback_url: feedbackUrl, feedback_at: new Date().toISOString() }
        : a))
      showToast('Feedback uploaded and student notified')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleUnassign(problemId) {
    try {
      await deleteAssignment(activeStudentId, problemId)
      setAssignments(prev => prev.filter(a => !(a.student_id === activeStudentId && a.problem_id === problemId)))
      showToast('Problem removed from assigned list')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleGenerateEmail() {
    if (!activeStudent) return
    if (assignedOrderForStudent.length === 0) {
      showToast('No assigned problems to email', 'error')
      return
    }
    const assignedProblems = assignedOrderForStudent
      .map(id => {
        const p = allProblems.find(p => p.id === id)
        const a = activeAssignments.find(a => a.problem_id === id)
        return p ? { ...p, assignmentNote: a?.notes || '' } : null
      })
      .filter(Boolean)

    const contacts = await fetchStudentContacts(activeStudent.id).catch(() => [])
    const recipients = contacts.filter(c => c.receives_assignments && c.verified && !c.bounced).map(c => c.email)
    if (recipients.length === 0 && activeStudent.email) recipients.push(activeStudent.email)

    const firstName = activeStudent.name.split(' ')[0]
    const dateStr = new Date().toISOString().slice(0, 10)
    setEmailDraft({
      to: recipients.join(', '),
      subject: `${firstName} physics problems ${dateStr}`,
      body: buildEmailBody(activeStudent, assignedProblems),
    })
  }

  function handleCopyUrls() {
    const text = selectedProblems.map(p =>
      `${p.name} (${p.contest} ${p.year} ${p.label})\n  Problem: ${p.problemUrl}${p.solutionUrl ? '\n  Solution: ' + p.solutionUrl : ''}`
    ).join('\n\n')
    navigator.clipboard.writeText(text)
    showToast(`Copied ${selectedProblems.length} URL${selectedProblems.length > 1 ? 's' : ''}`)
  }

  async function handleSaveStudent(updatedStudent, isDelete = false) {
    try {
      if (isDelete) {
        await removeStudent(updatedStudent.id)
        setStudents(prev => prev.filter(s => s.id !== updatedStudent.id))
        showToast(`Removed ${updatedStudent.name}`)
      } else {
        await saveStudent(updatedStudent)
        setStudents(prev => {
          const exists = prev.find(s => s.id === updatedStudent.id)
          return exists
            ? prev.map(s => s.id === updatedStudent.id ? updatedStudent : s)
            : [...prev, updatedStudent]
        })
        showToast('Student saved')
      }
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const activeAssignments = useMemo(() =>
    assignments.filter(a => a.student_id === activeStudentId),
    [assignments, activeStudentId]
  )
  const assignedCount = activeAssignments.filter(a => a.status === 'assigned').length

  const assignedOrderForStudent = useMemo(() => {
    const defaultOrder = assignments
      .filter(a => a.student_id === activeStudentId && a.status === 'assigned')
      .sort((a, b) => (b.assigned_date || '').localeCompare(a.assigned_date || ''))
      .map(a => a.problem_id)
    const override = assignedOrderOverrides[activeStudentId]
    if (!override) return defaultOrder
    const currentSet = new Set(defaultOrder)
    const filtered = override.filter(id => currentSet.has(id))
    const filteredSet = new Set(filtered)
    const newOnes = defaultOrder.filter(id => !filteredSet.has(id))
    return [...filtered, ...newOnes]
  }, [assignments, activeStudentId, assignedOrderOverrides])

  function handleReorder(newOrder) {
    setAssignedOrderOverrides(prev => ({ ...prev, [activeStudentId]: newOrder }))
  }

  if (loading) return <div className="empty-state" style={{ marginTop: 80 }}>Loading… <span className="spin">⟳</span></div>

  // Student-portal preview (admin), rendered inline via state instead of a URL param.
  if (previewStudentId) {
    const portalStudent = students.find(s => s.id === previewStudentId)
    const previewAssignments = assignments.filter(a => a.student_id === previewStudentId)
    const previewSessions = sessions.filter(s => s.student_id === previewStudentId)
    return (
      <div className="layout">
        <div className="topbar">
          <span className="logo" style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span>Eichenlaub Physics</span>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase' }}>Student Portal</span>
          </span>
          <div style={{ marginLeft: 16, padding: '2px 10px', background: 'var(--yellow-bg)', color: 'var(--yellow)', border: '1px solid var(--yellow-line)', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
            Admin preview
          </div>
          <div style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
            {['student', 'parent', 'adult'].map(r => (
              <button key={r} className="sm" onClick={() => setPreviewRole(r)}
                style={previewRole === r ? { background: 'var(--accent-dim)', color: 'var(--accent)' } : {}}>
                as {r}
              </button>
            ))}
          </div>
          <div className="spacer" />
          <button className="sm" style={{ marginRight: 16 }} onClick={() => setPreviewStudentId(null)}>← Back to admin</button>
        </div>
        <div className="content">
          <StudentView
            student={portalStudent}
            assignments={previewAssignments}
            sessions={previewSessions}
            problems={allProblems}
            accessibleSources={previewAccessibleSources}
            onMarkCompleted={null}
            isPreview={true}
            previewRole={previewRole}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="layout">
      <div className="topbar">
        <span className="logo">Trajectory <span style={{ fontSize: 11, opacity: 0.5, fontWeight: 400 }}>v2</span></span>
        <nav>
          <button className={view === VIEWS.BROWSER ? 'active' : ''} onClick={() => setView(VIEWS.BROWSER)}>
            Problems
          </button>
          <button className={view === VIEWS.ASSIGNED ? 'active' : ''} onClick={() => setView(VIEWS.ASSIGNED)}>
            Assigned
            {assignedCount > 0 && <span className="nav-badge">{assignedCount}</span>}
          </button>
          <button className={view === VIEWS.SESSIONS ? 'active' : ''} onClick={() => setView(VIEWS.SESSIONS)}>Sessions</button>
          <button className={view === VIEWS.SCHEDULE ? 'active' : ''} onClick={() => setView(VIEWS.SCHEDULE)}>Schedule</button>
          <button className={view === VIEWS.HANDOUTS ? 'active' : ''} onClick={() => setView(VIEWS.HANDOUTS)}>Handouts</button>
          <button className={view === VIEWS.TAGS ? 'active' : ''} onClick={() => setView(VIEWS.TAGS)}>Tags</button>
          <button className={view === VIEWS.PROGRESS_PLAN ? 'active' : ''} onClick={() => setView(VIEWS.PROGRESS_PLAN)}>Progress and Plan</button>
          <button className={view === VIEWS.BILLING ? 'active' : ''} onClick={() => setView(VIEWS.BILLING)}>Billing</button>
          <button className={view === VIEWS.ACCOUNTS ? 'active' : ''} onClick={() => setView(VIEWS.ACCOUNTS)}>Accounts</button>
          <button className={view === VIEWS.SETTINGS ? 'active' : ''} onClick={() => setView(VIEWS.SETTINGS)}>Settings</button>
        </nav>
        <div className="spacer" />
        <button className="sm" style={{ marginRight: 12, opacity: 0.5 }} onClick={() => supabase.auth.signOut()}>Sign out</button>
        <div className="student-selector">
          <label>Student</label>
          <select value={activeStudentId} onChange={e => { setActiveStudentId(e.target.value); setSelected(new Set()) }}>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="sm" style={{ marginLeft: 6, padding: '2px 8px', whiteSpace: 'nowrap' }} title="Preview student portal" onClick={() => setPreviewStudentId(activeStudentId)}>↗ preview</button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--red)', color: '#fff', padding: '8px 20px', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={() => { setError(null); setView(VIEWS.SETTINGS) }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '2px 10px', borderRadius: 4, cursor: 'pointer', marginLeft: 16 }}>Go to Settings</button>
        </div>
      )}

      <div className="content">
        {view === VIEWS.BROWSER && (
          <>
            <FilterSidebar
              problems={allProblems}
              filteredProblems={preTagFilterProblems}
              filters={filters}
              setFilters={setFilters}
              statusMap={statusMap}
            />
            <div className="problem-area">
              {selected.size > 0 && (
                <div className="action-bar">
                  <span className="sel-count">{selected.size} selected</span>
                  <button className="sm" onClick={clearSelection}>Clear</button>
                  <button className="sm" onClick={selectAll}>Select all {sorted.length}</button>
                  <div className="spacer" />
                  <button className="sm" onClick={handleCopyUrls}>Copy URLs</button>
                  <button className="sm primary" onClick={handleAssign}>
                    Assign to {activeStudent?.name}
                  </button>
                </div>
              )}
              <ProblemTable
                problems={sorted}
                selected={selected}
                statusMap={statusMap}
                filters={filters}
                setFilters={setFilters}
                onToggle={toggleSelect}
                onSelectAll={selectAll}
                onClearAll={clearSelection}
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={handleSort}
              />
            </div>
          </>
        )}

        {view === VIEWS.ASSIGNED && (
          <AssignedView
            student={activeStudent}
            assignments={activeAssignments}
            problems={allProblems}
            assignedOrder={assignedOrderForStudent}
            onReorder={handleReorder}
            onToggleStatus={handleToggleStatus}
            onUnassign={handleUnassign}
            onGenerateEmail={handleGenerateEmail}
            onUpdateNote={handleUpdateNote}
            onUploadFeedback={handleUploadFeedback}
          />
        )}

        {view === VIEWS.SESSIONS && (
          <SessionsView
            sessions={sessions}
            students={students}
            activeStudentId={activeStudentId}
            onSessionsChange={async () => setSessions(await fetchSessions())}
            showToast={showToast}
          />
        )}

        {view === VIEWS.SCHEDULE && (
          <AdminScheduleView
            key={activeStudentId}
            student={activeStudent}
            sessions={sessions.filter(s => s.student_id === activeStudentId)}
          />
        )}

        {view === VIEWS.HANDOUTS && (
          <HandoutsManager
            handouts={handouts}
            onHandoutsChange={refreshHandouts}
            showToast={showToast}
          />
        )}

        {view === VIEWS.TAGS && (
          <TagOntologyView problems={allProblems} />
        )}

        {view === VIEWS.PROGRESS_PLAN && (
          <AdminProgressPlanView
            studentId={activeStudentId}
            studentName={activeStudent?.name || ''}
          />
        )}

        {view === VIEWS.BILLING && (
          <BillingView
            key={activeStudentId}
            studentId={activeStudentId}
            studentName={activeStudent?.name || ''}
          />
        )}

        {view === VIEWS.ACCOUNTS && (
          <AccountsView students={students} showToast={showToast} />
        )}

        {view === VIEWS.SETTINGS && (
          <Settings
            students={students}
            allSources={allSources}
            onSaveStudent={handleSaveStudent}
            onStatusChange={(id, status) => setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s))}
            showToast={showToast}
          />
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {emailDraft && (
        <SendEmailModal
          draft={emailDraft}
          onSend={async ({ to, subject, body }) => {
            const toList = to.split(',').map(s => s.trim()).filter(Boolean)
            await sendEmail({ to: toList, subject, body })
            setEmailDraft(null)
            showToast(`Email sent to ${toList.length} recipient${toList.length !== 1 ? 's' : ''}`)
          }}
          onClose={() => setEmailDraft(null)}
        />
      )}
    </div>
  )
}

// ── Admin scheduling tab ──────────────────────────────────────────────────────

// Cal.com event type slug for recurring sessions booked from the admin side.
// Create this event type at cal.com/event-types with "Recurring" enabled,
// then duplicate any additional settings from the 1-hr-session type.
const CAL_ADMIN_LINK = 'markeichenlaub/1-hr-recurring'
const CAL_ADMIN_NS = 'admin-sched'
const CAL_ADMIN_BRAND = '#2a4a6d'

function loadCalApiAdmin() {
  const C = window
  const A = 'https://app.cal.com/embed/embed.js'
  const L = 'init'
  const p = (a, ar) => { a.q.push(ar) }
  const d = C.document
  C.Cal = C.Cal || function () {
    const cal = C.Cal
    const ar = arguments
    if (!cal.loaded) {
      cal.ns = {}
      cal.q = cal.q || []
      d.head.appendChild(d.createElement('script')).src = A
      cal.loaded = true
    }
    if (ar[0] === L) {
      const api = function () { p(api, arguments) }
      const namespace = ar[1]
      api.q = api.q || []
      if (typeof namespace === 'string') {
        cal.ns[namespace] = cal.ns[namespace] || api
        p(cal.ns[namespace], ar)
        p(cal, ['initNamespace', namespace])
      } else p(cal, ar)
      return
    }
    p(cal, ar)
  }
  return C.Cal
}

function AdminScheduleView({ student, sessions }) {
  const [contacts, setContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(true)

  useEffect(() => {
    if (!student?.id) return
    setLoadingContacts(true)
    fetchStudentContacts(student.id)
      .then(setContacts)
      .catch(() => {})
      .finally(() => setLoadingContacts(false))
  }, [student?.id])

  const invited = contacts.filter(c => c.receives_schedule_changes && c.verified && !c.bounced)
  const guestEmails = invited
    .filter(c => c.email?.toLowerCase() !== student?.email?.toLowerCase())
    .map(c => c.email)

  // Init Cal.com embed after contacts load so guests are pre-populated correctly.
  useEffect(() => {
    if (!student || loadingContacts) return
    if (window.Cal?.ns?.[CAL_ADMIN_NS]) delete window.Cal.ns[CAL_ADMIN_NS]
    const Cal = loadCalApiAdmin()
    Cal('init', CAL_ADMIN_NS, { origin: 'https://cal.com' })
    const config = { layout: 'month_view' }
    if (student.email) config.email = student.email
    if (student.name) config.name = student.name
    if (guestEmails.length > 0) config.guests = guestEmails
    Cal.ns[CAL_ADMIN_NS]('inline', {
      elementOrSelector: '#cal-inline-admin-sched',
      calLink: CAL_ADMIN_LINK,
      config,
    })
    Cal.ns[CAL_ADMIN_NS]('ui', {
      cssVarsPerTheme: { light: { 'cal-brand': CAL_ADMIN_BRAND } },
      hideEventTypeDetails: false,
      layout: 'month_view',
    })
  }, [student?.id, loadingContacts])

  const now = new Date().toISOString()
  const upcoming = (sessions || [])
    .filter(s => s.scheduled_at > now)
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))

  function formatDate(iso) {
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles',
    })
  }

  return (
    <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', padding: '20px 0' }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{student?.name} — Schedule</h2>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Booking invitees</div>
        {loadingContacts ? (
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Loading…</span>
        ) : contacts.length === 0 ? (
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>No contacts on file</span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {contacts.map(c => {
              const active = c.receives_schedule_changes && c.verified && !c.bounced
              return (
                <span key={c.id} style={{
                  fontSize: 12, padding: '3px 10px', borderRadius: 99,
                  background: active ? '#e8f0fe' : 'var(--surface-2, #f5f5f5)',
                  color: active ? '#1a56c4' : 'var(--text-dim)',
                  border: `1px solid ${active ? '#c5d4f8' : 'var(--border)'}`,
                }}>
                  {active ? '✓ ' : ''}{c.email}
                </span>
              )
            })}
          </div>
        )}
        {!loadingContacts && invited.length === 0 && (
          <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '8px 0 0' }}>
            No contacts have "receives schedule changes" enabled — go to Billing to configure.
          </p>
        )}
      </div>

      {upcoming.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>Upcoming sessions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcoming.map(s => (
              <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, flex: 1, minWidth: 160 }}>{formatDate(s.scheduled_at)}</span>
                {s.miro_board_url && (
                  <a href={s.miro_board_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Whiteboard ↗</a>
                )}
                {s.cal_uid ? (
                  <>
                    <a href={`https://cal.com/reschedule/${s.cal_uid}`} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Reschedule ↗</a>
                    <a href={`https://cal.com/booking/${s.cal_uid}?cancel=true`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--red)' }}>Cancel ↗</a>
                  </>
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>manual</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>Book recurring sessions</h3>
        {!loadingContacts && (
          <div id="cal-inline-admin-sched" style={{ width: '100%', minHeight: 600, overflow: 'scroll' }} />
        )}
      </div>
    </div>
  )
}

// Admin billing: manage all of a student's contacts (incl. invoice routing) and
// review / send drafted invoices. Reuses ContactsTab in full-admin mode.
function BillingView({ studentId, studentName }) {
  const [contacts, setContacts] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchStudentContacts(studentId), fetchInvoices(studentId)])
      .then(([c, inv]) => { setContacts(c); setInvoices(inv) })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [studentId])

  if (loading) return <div className="empty-state" style={{ marginTop: 40 }}>Loading billing… <span className="spin">⟳</span></div>
  if (err) return <div className="empty-state" style={{ color: 'var(--red)', marginTop: 40 }}>{err}</div>

  return (
    <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', padding: '20px 0' }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{studentName} — Billing</h2>
      <ContactsTab
        studentId={studentId}
        contacts={contacts}
        setContacts={setContacts}
        isAdmin={true}
        canBill={true}
        isStudentRole={false}
        invoices={invoices}
        setInvoices={setInvoices}
      />
    </div>
  )
}
