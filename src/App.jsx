import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchJSON, writeJSON } from './utils/github'
import { openGmailDraft, buildEmailBody } from './utils/gmail'
import FilterSidebar from './components/FilterSidebar'
import ProblemTable from './components/ProblemTable'
import AssignedView from './components/AssignedView'
import Settings from './components/Settings'
import Toast from './components/Toast'

const VIEWS = { BROWSER: 'browser', ASSIGNED: 'assigned', SETTINGS: 'settings' }

const MARK_STUDENT_ID = 'mark'

const DEFAULT_FILTERS = {
  contests: new Set(),
  types: new Set(),
  topics: new Set(),
  statuses: new Set(),      // 'not-started' | 'assigned' | 'completed'
  selectedTags: new Set(),
  textSearch: '',
  hideCompleted: false,
}

export default function App() {
  const [problems, setProblems] = useState([])
  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])
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
      try {
        const [p, s, a] = await Promise.all([
          fetchJSON('data/problems.json'),
          fetchJSON('data/students.json'),
          fetchJSON('data/assignments.json'),
        ])
        setProblems(p)
        setStudents(s)
        setAssignments(a)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0]

  // Build status map for active student: problemId → 'assigned' | 'completed'
  const statusMap = useMemo(() => {
    const map = {}
    assignments
      .filter(a => a.studentId === activeStudentId)
      .forEach(a => { map[a.problemId] = a.status })
    return map
  }, [assignments, activeStudentId])

  // Problems filtered by everything EXCEPT selectedTags — used for tag count computation
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

  // Apply selectedTags on top
  const filteredProblems = useMemo(() => {
    if (filters.selectedTags.size === 0) return preTagFilterProblems
    return preTagFilterProblems.filter(p =>
      [...filters.selectedTags].every(tag => p.tags.includes(tag))
    )
  }, [preTagFilterProblems, filters.selectedTags])

  // Sort
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

  // Assign selected problems to active student (directly, no modal)
  async function handleAssign() {
    if (!activeStudent || selected.size === 0) return
    const date = new Date().toISOString().slice(0, 10)
    const toAdd = []
    let skipped = 0

    // Build Mark's status map so we can co-assign problems he hasn't completed
    const markStatusMap = {}
    if (activeStudent.id !== MARK_STUDENT_ID) {
      assignments
        .filter(a => a.studentId === MARK_STUDENT_ID)
        .forEach(a => { markStatusMap[a.problemId] = a.status })
    }

    for (const pid of selected) {
      if (statusMap[pid]) { skipped++; continue }
      toAdd.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${pid}`,
        studentId: activeStudent.id,
        problemId: pid,
        status: 'assigned',
        assignedDate: date,
        completedDate: null,
      })
      // Co-assign to Mark if he hasn't completed or already been assigned this problem
      if (activeStudent.id !== MARK_STUDENT_ID && !markStatusMap[pid]) {
        toAdd.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${pid}`,
          studentId: MARK_STUDENT_ID,
          problemId: pid,
          status: 'assigned',
          assignedDate: date,
          completedDate: null,
        })
      }
    }

    if (toAdd.length === 0) {
      showToast('All selected problems are already assigned or completed', 'error')
      return
    }

    const updated = [...assignments, ...toAdd]
    try {
      await writeJSON('data/assignments.json', updated)
      setAssignments(updated)
      setSelected(new Set())
      const studentAssigned = toAdd.filter(a => a.studentId === activeStudent.id).length
      const markCoAssigned = toAdd.filter(a => a.studentId === MARK_STUDENT_ID).length
      const msg = skipped > 0
        ? `Assigned ${studentAssigned} problem${studentAssigned > 1 ? 's' : ''} to ${activeStudent.name} (${skipped} skipped)${markCoAssigned > 0 ? `, ${markCoAssigned} also added for you` : ''}`
        : `Assigned ${studentAssigned} problem${studentAssigned > 1 ? 's' : ''} to ${activeStudent.name}${markCoAssigned > 0 ? `, ${markCoAssigned} also added for you` : ''}`
      showToast(msg)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  // Toggle a problem between assigned ↔ completed
  async function handleToggleStatus(problemId) {
    const existing = assignments.find(a => a.studentId === activeStudentId && a.problemId === problemId)
    if (!existing) return

    const newStatus = existing.status === 'assigned' ? 'completed' : 'assigned'
    const updated = assignments.map(a =>
      a.id === existing.id
        ? { ...a, status: newStatus, completedDate: newStatus === 'completed' ? new Date().toISOString().slice(0, 10) : null }
        : a
    )
    try {
      await writeJSON('data/assignments.json', updated)
      setAssignments(updated)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  // Remove an assignment entirely
  async function handleUnassign(problemId) {
    const updated = assignments.filter(a => !(a.studentId === activeStudentId && a.problemId === problemId))
    try {
      await writeJSON('data/assignments.json', updated)
      setAssignments(updated)
      showToast('Problem removed from assigned list')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  // Open Gmail draft for all currently-assigned problems
  function handleGenerateEmail() {
    if (!activeStudent) return
    const assignedProblems = problems.filter(p => statusMap[p.id] === 'assigned')
    if (assignedProblems.length === 0) {
      showToast('No assigned problems to email', 'error')
      return
    }
    openGmailDraft({
      to: activeStudent.email || '',
      subject: `Physics problems for ${activeStudent.name}`,
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

  async function handleSaveStudents(updated) {
    try {
      await writeJSON('data/students.json', updated)
      setStudents(updated)
      showToast('Students saved')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const activeAssignments = useMemo(() =>
    assignments.filter(a => a.studentId === activeStudentId),
    [assignments, activeStudentId]
  )
  const assignedCount = activeAssignments.filter(a => a.status === 'assigned').length

  if (loading) return <div className="empty-state" style={{ marginTop: 80 }}>Loading… <span className="spin">⟳</span></div>
  if (error) return <div className="empty-state" style={{ marginTop: 80, color: 'var(--red)' }}>Error: {error}</div>

  return (
    <div className="layout">
      <div className="topbar">
        <span className="logo">Trajectory</span>
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
            onToggleStatus={handleToggleStatus}
            onUnassign={handleUnassign}
            onGenerateEmail={handleGenerateEmail}
          />
        )}

        {view === VIEWS.SETTINGS && (
          <Settings
            students={students}
            onSave={handleSaveStudents}
            showToast={showToast}
          />
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
