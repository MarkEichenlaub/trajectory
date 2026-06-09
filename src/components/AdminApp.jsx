import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { fetchJSON } from '../utils/github'
import { assembleProblemBank } from '../utils/problemBank'
import { supabase, fetchStudents, fetchAssignments, fetchSessions, fetchHandouts, fetchStudentContacts, fetchInvoices, insertAssignments, updateAssignment, deleteAssignment, saveStudent, removeStudent, sendEmail, fetchStudentAccessibleSources, uploadFeedback, publishFeedback, insertHomeworkSet } from '../utils/supabase'
import { buildEmailBody } from '../utils/gmail'
import SendEmailModal from './SendEmailModal'
import FilterSidebar from './FilterSidebar'
import ProblemTable from './ProblemTable'
import AssignedView from './AssignedView'
import SessionsView from './SessionsView'
import HandoutsManager from './HandoutsManager'
import StudentView, { ContactsTab, SchedulingTab } from './StudentView'
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
  lessons: new Set(),
  statuses: new Set(),
  selectedTags: new Set(),
  textSearch: '',
  hideCompleted: false,
}

export default function AdminApp() {
  const [problems, setProblems] = useState([])
  const [aopsProblems, setAopsProblems] = useState([])
  const [handouts, setHandouts] = useState([])
  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [sessions, setSessions] = useState([])
  const [assignedOrderOverrides, setAssignedOrderOverrides] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [view, setViewState] = useState(() => {
    const v = searchParams.get('view')
    return Object.values(VIEWS).includes(v) ? v : VIEWS.BROWSER
  })
  const [activeStudentId, setActiveStudentIdState] = useState(
    () => searchParams.get('student') || 'borna'
  )

  function setView(v) {
    setViewState(v)
    setSearchParams(p => { p.set('view', v); return p }, { replace: true })
  }
  function setActiveStudentId(id) {
    setActiveStudentIdState(id)
    setSearchParams(p => { p.set('student', id); return p }, { replace: true })
  }
  const [previewStudentId, setPreviewStudentId] = useState(null)
  const [previewRole, setPreviewRole] = useState('student')
  const [previewAccessibleSources, setPreviewAccessibleSources] = useState([])
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selected, setSelected] = useState(new Set())
  const [toast, setToast] = useState(null)
  const [sortCol, setSortCol] = useState('year')
  const [sortDir, setSortDir] = useState('desc')
  const [emailDraft, setEmailDraft] = useState(null)
  const [requiresSubmission, setRequiresSubmission] = useState(false)
  const [homeworkModal, setHomeworkModal] = useState(null)

  useEffect(() => {
    async function load() {
      const p = await fetchJSON('data/problems.json').catch(() => [])
      setProblems(p)
      fetchJSON('data/aops-mechanics.json').then(setAopsProblems).catch(() => setAopsProblems([]))
      setLoading(false)
      try {
        const [s, a, sess, hout] = await Promise.all([fetchStudents(), fetchAssignments(), fetchSessions(), fetchHandouts().catch(() => [])])
        setStudents(s)
        const urlStudent = searchParams.get('student')
        const resolved = (urlStudent && s.find(st => st.id === urlStudent)) ? urlStudent : s[0]?.id || 'borna'
        setActiveStudentIdState(resolved)
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

  // Keep previewStudentId in sync with the URL slug (/:firstNameSlug/:tab?)
  useEffect(() => {
    const slug = location.pathname.split('/').filter(Boolean)[0]
    if (!slug) { setPreviewStudentId(null); return }
    if (!students.length) return
    const match = students.find(s => (s.first_name || '').toLowerCase() === slug.toLowerCase())
    setPreviewStudentId(match?.id || null)
  }, [location.pathname, students])

  const allProblems = useMemo(
    () => assembleProblemBank({ problems, aopsProblems, handouts }),
    [problems, aopsProblems, handouts]
  )

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
    if (filters.lessons.size > 0 && !filters.lessons.has(p.lesson)) return false
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
  // AoPS problems in selection, kept in the table's current display order so the
  // homework PDF follows the order Mark sees on screen.
  const selectedAopsProblems = sorted.filter(p => selected.has(p.id) && p.type === 'AoPS')

  function openHomeworkModal() {
    if (selectedAopsProblems.length === 0) return
    const lessonsInSel = [...new Set(selectedAopsProblems.map(p => p.lesson).filter(Boolean))]
    const lesson = lessonsInSel.length === 1 ? lessonsInSel[0] : ''
    const defaultTitle = lesson || 'Mechanics Homework'
    setHomeworkModal({ title: defaultTitle, lesson, dueDate: '' })
  }

  async function handleCreateHomeworkSet() {
    if (!homeworkModal || !activeStudent || selectedAopsProblems.length === 0) return
    const today = new Date().toISOString().slice(0, 10)
    const row = {
      id: `hw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      student_id: activeStudent.id,
      title: homeworkModal.title.trim() || 'Mechanics Homework',
      lesson: homeworkModal.lesson || null,
      problem_ids: selectedAopsProblems.map(p => p.id),
      assigned_date: today,
      due_date: homeworkModal.dueDate || null,
      pdf_url: null,
      status: 'draft',
    }
    try {
      await insertHomeworkSet(row)
      setHomeworkModal(null)
      setSelected(new Set())
      showToast(`Created homework set "${row.title}" for ${activeStudent.name} (${row.problem_ids.length} problems). Build the PDF locally with build_homework_set.py ${row.id}`)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleAssign() {
    if (!activeStudent || selected.size === 0) return
    const date = new Date().toISOString().slice(0, 10)
    const toAdd = []

    const markStatusMap = {}
    if (activeStudent.id !== MARK_STUDENT_ID) {
      assignments
        .filter(a => a.student_id === MARK_STUDENT_ID)
        .forEach(a => { markStatusMap[a.problem_id] = a.status })
    }

    for (const pid of selected) {
      toAdd.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${pid}`,
        student_id: activeStudent.id,
        problem_id: pid,
        status: 'assigned',
        assigned_date: date,
        completed_date: null,
        requires_submission: requiresSubmission,
      })
      if (activeStudent.id !== MARK_STUDENT_ID && !markStatusMap[pid]) {
        toAdd.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${pid}`,
          student_id: MARK_STUDENT_ID,
          problem_id: pid,
          status: 'assigned',
          assigned_date: date,
          completed_date: null,
          requires_submission: requiresSubmission,
        })
      }
    }

    try {
      await insertAssignments(toAdd)
      setAssignments(prev => [...prev, ...toAdd])
      setSelected(new Set())
      const studentAssigned = toAdd.filter(a => a.student_id === activeStudent.id).length
      const markCoAssigned = toAdd.filter(a => a.student_id === MARK_STUDENT_ID).length
      showToast(`Assigned ${studentAssigned} problem${studentAssigned > 1 ? 's' : ''} to ${activeStudent.name}${markCoAssigned > 0 ? `, ${markCoAssigned} also added for you` : ''}`)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleToggleStatus(assignmentId) {
    const existing = assignments.find(a => a.id === assignmentId)
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

  async function handleUpdateDueDate(assignmentId, dueDate) {
    try {
      await updateAssignment(assignmentId, { due_date: dueDate, due_date_overridden: true })
      setAssignments(prev => prev.map(a =>
        a.id === assignmentId ? { ...a, due_date: dueDate, due_date_overridden: true } : a
      ))
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleToggleRequiresSubmission(assignmentId, value) {
    try {
      await updateAssignment(assignmentId, { requires_submission: value })
      setAssignments(prev => prev.map(a =>
        a.id === assignmentId ? { ...a, requires_submission: value } : a
      ))
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

  async function handleUnassign(assignmentId) {
    try {
      await deleteAssignment(assignmentId)
      setAssignments(prev => prev.filter(a => a.id !== assignmentId))
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
      .map(assignmentId => {
        const a = activeAssignments.find(a => a.id === assignmentId)
        if (!a) return null
        const p = allProblems.find(p => p.id === a.problem_id)
        return p ? { ...p, assignmentNote: a.notes || '' } : null
      })
      .filter(Boolean)

    const contacts = await fetchStudentContacts(activeStudent.id).catch(() => [])
    const recipients = contacts.filter(c => c.receives_assignments && c.verified && !c.bounced).map(c => c.email)
    if (recipients.length === 0 && activeStudent.email) recipients.push(activeStudent.email)

    const firstName = activeStudent.first_name || activeStudent.name.split(' ')[0] || ''
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
      .map(a => a.id)
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
  // If the URL has a student slug but students haven't loaded yet, show a spinner
  // so the admin panel doesn't flash before the preview takes over.
  const pathSlug = location.pathname.split('/').filter(Boolean)[0]
  if (pathSlug && !students.length) {
    return <div className="empty-state" style={{ marginTop: 80 }}>Loading… <span className="spin">⟳</span></div>
  }

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
          <button className="sm" style={{ marginRight: 16 }} onClick={() => navigate('/' + location.search)}>← Back to admin</button>
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
          <button className="sm" style={{ marginLeft: 6, padding: '2px 8px', whiteSpace: 'nowrap' }} title="Preview student portal" onClick={() => {
              const s = students.find(st => st.id === activeStudentId)
              const slug = (s?.first_name || '').toLowerCase()
              navigate(slug ? '/' + slug : '/')
            }}>↗ preview</button>
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
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={requiresSubmission}
                      onChange={e => setRequiresSubmission(e.target.checked)}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    Submission
                  </label>
                  {selectedAopsProblems.length > 0 && (
                    <button className="sm" onClick={openHomeworkModal} title="Compile the selected AoPS problems into one PDF homework set">
                      Create homework set ({selectedAopsProblems.length})
                    </button>
                  )}
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
            onUpdateDueDate={handleUpdateDueDate}
            onUploadFeedback={handleUploadFeedback}
            onToggleRequiresSubmission={handleToggleRequiresSubmission}
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

      {homeworkModal && (
        <div className="modal-overlay" onClick={() => setHomeworkModal(null)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Create homework set</h3>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: -4 }}>
              {selectedAopsProblems.length} problem{selectedAopsProblems.length !== 1 ? 's' : ''} for {activeStudent?.name}
            </p>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Title</label>
            <input
              style={{ width: '100%', marginBottom: 12, padding: '6px 8px' }}
              value={homeworkModal.title}
              onChange={e => setHomeworkModal(m => ({ ...m, title: e.target.value }))}
              autoFocus
            />
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Due date (optional)</label>
            <input
              type="date"
              style={{ width: '100%', marginBottom: 16, padding: '6px 8px' }}
              value={homeworkModal.dueDate}
              onChange={e => setHomeworkModal(m => ({ ...m, dueDate: e.target.value }))}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="sm" onClick={() => setHomeworkModal(null)}>Cancel</button>
              <button className="sm primary" onClick={handleCreateHomeworkSet}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Admin scheduling tab ──────────────────────────────────────────────────────

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
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Schedule invitees</div>
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

      <SchedulingTab
        sessions={sessions}
        formatDate={formatDate}
        student={student}
        isAdmin={true}
      />
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
