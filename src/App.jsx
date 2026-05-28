import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchJSON } from './utils/github'
import { fetchStudents, fetchAssignments, insertAssignments, updateAssignment, deleteAssignment, saveStudent, removeStudent } from './utils/supabase'
import { openGmailDraft, buildEmailBody } from './utils/gmail'
import FilterSidebar from './components/FilterSidebar'
import ProblemTable from './components/ProblemTable'
import AssignedView from './components/AssignedView'
import StudentPortal from './components/StudentPortal'
import Settings from './components/Settings'
import Toast from './components/Toast'

const VIEWS = { BROWSER: 'browser', ASSIGNED: 'assigned', SETTINGS: 'settings' }
const MARK_STUDENT_ID = 'mark'
const STUDENT_PARAM = new URLSearchParams(window.location.search).get('student')

const DEFAULT_FILTERS = {
  contests: new Set(),
  types: new Set(),
  topics: new Set(),
  statuses: new Set(),
  selectedTags: new Set(),
  textSearch: '',
  hideCompleted: false,
}

export default function App() {
  const [problems, setProblems] = useState([])
  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [assignedOrderOverrides, setAssignedOrderOverrides] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [view, setView] = useState(VIEWS.BROWSER)
  const [activeStudentId, setActiveStudentId] = useState('borna')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selected, setSelected] = useState(new Set())
  const [toast, setToast] = useState(null)
  const [sortCol, setSortCol] = useState('year')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    async function load() {
      const p = await fetchJSON('data/problems.json').catch(() => [])
      setProblems(p)
      setLoading(false)
      try {
        const [s, a] = await Promise.all([fetchStudents(), fetchAssignments()])
        setStudents(s)
        setAssignments(a)
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

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0]

  const statusMap = useMemo(() => {
    const map = {}
    assignments
      .filter(a => a.student_id === activeStudentId)
      .forEach(a => { map[a.problem_id] = a.status })
    return map
  }, [assignments, activeStudentId])

  const preTagFilterProblems = useMemo(() => problems.filter(p => {
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
        !String(p.year).includes(q) &&
        !p.country.toLowerCase().includes(q)
      ) return false
    }
    return true
  }), [problems, filters, statusMap])

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

  const selectedProblems = problems.filter(p => selected.has(p.id))

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

    const newStatus = existing.status === 'assigned' ? 'completed' : 'assigned'
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

  async function handleUnassign(problemId) {
    try {
      await deleteAssignment(activeStudentId, problemId)
      setAssignments(prev => prev.filter(a => !(a.student_id === activeStudentId && a.problem_id === problemId)))
      showToast('Problem removed from assigned list')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  function handleGenerateEmail() {
    if (!activeStudent) return
    if (assignedOrderForStudent.length === 0) {
      showToast('No assigned problems to email', 'error')
      return
    }
    const assignedProblems = assignedOrderForStudent
      .map(id => problems.find(p => p.id === id))
      .filter(Boolean)
    const firstName = activeStudent.name.split(' ')[0]
    const dateStr = new Date().toISOString().slice(0, 10)
    openGmailDraft({
      to: activeStudent.email || '',
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

  // Student portal mode
  if (STUDENT_PARAM) {
    const portalStudent = students.find(s => s.id === STUDENT_PARAM)
    return (
      <div className="layout">
        <div className="topbar">
          <span className="logo">Trajectory <span style={{ fontSize: 11, opacity: 0.5, fontWeight: 400 }}>v2</span></span>
          <div className="spacer" />
          {portalStudent && (
            <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{portalStudent.name}'s portal</span>
          )}
        </div>
        <div className="content">
          <StudentPortal
            student={portalStudent}
            studentId={STUDENT_PARAM}
            problems={problems}
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
          <button className={view === VIEWS.SETTINGS ? 'active' : ''} onClick={() => setView(VIEWS.SETTINGS)}>Settings</button>
        </nav>
        <div className="spacer" />
        <div className="student-selector">
          <label>Student</label>
          <select value={activeStudentId} onChange={e => { setActiveStudentId(e.target.value); setSelected(new Set()) }}>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
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
              problems={problems}
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
            problems={problems}
            assignedOrder={assignedOrderForStudent}
            onReorder={handleReorder}
            onToggleStatus={handleToggleStatus}
            onUnassign={handleUnassign}
            onGenerateEmail={handleGenerateEmail}
          />
        )}

        {view === VIEWS.SETTINGS && (
          <Settings
            students={students}
            onSaveStudent={handleSaveStudent}
            showToast={showToast}
          />
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
