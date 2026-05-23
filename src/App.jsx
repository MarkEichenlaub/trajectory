import { useState, useEffect, useCallback } from 'react'
import { fetchJSON, writeJSON } from './utils/github'
import FilterSidebar from './components/FilterSidebar'
import ProblemTable from './components/ProblemTable'
import StudentHistory from './components/StudentHistory'
import Settings from './components/Settings'
import AssignModal from './components/AssignModal'
import Toast from './components/Toast'

const VIEWS = { BROWSER: 'browser', HISTORY: 'history', SETTINGS: 'settings' }

const DEFAULT_FILTERS = {
  contests: new Set(),
  types: new Set(),
  topics: new Set(),
  tagSearch: '',
  textSearch: '',
  hideDone: false,
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
  const [assignModalOpen, setAssignModalOpen] = useState(false)
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

  // Compute done set for active student
  const doneIds = new Set(
    assignments
      .filter(a => a.studentId === activeStudentId)
      .flatMap(a => a.problemIds)
  )

  // Filtering
  const filteredProblems = problems.filter(p => {
    if (filters.contests.size > 0 && !filters.contests.has(p.contest)) return false
    if (filters.types.size > 0 && !filters.types.has(p.type)) return false
    if (filters.topics.size > 0 && !p.topics.some(t => filters.topics.has(t))) return false
    if (filters.hideDone && doneIds.has(p.id)) return false
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
  })

  // Sorting
  const sorted = [...filteredProblems].sort((a, b) => {
    let av = a[sortCol], bv = b[sortCol]
    if (sortCol === 'name') { av = av.toLowerCase(); bv = bv.toLowerCase() }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

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

  async function handleAssign(note) {
    if (!activeStudent) return
    const newAssignment = {
      id: Date.now().toString(),
      studentId: activeStudent.id,
      problemIds: [...selected],
      date: new Date().toISOString().slice(0, 10),
      note,
    }
    const updated = [...assignments, newAssignment]
    try {
      await writeJSON('data/assignments.json', updated)
      setAssignments(updated)
      setSelected(new Set())
      setAssignModalOpen(false)
      showToast(`Assigned ${selectedProblems.length} problem${selectedProblems.length > 1 ? 's' : ''} to ${activeStudent.name}`)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleUpdateAssignment(id, field, value) {
    const updated = assignments.map(a => a.id === id ? { ...a, [field]: value } : a)
    try {
      await writeJSON('data/assignments.json', updated)
      setAssignments(updated)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleDeleteAssignment(id) {
    const updated = assignments.filter(a => a.id !== id)
    try {
      await writeJSON('data/assignments.json', updated)
      setAssignments(updated)
      showToast('Assignment deleted')
    } catch (e) {
      showToast(e.message, 'error')
    }
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

  function handleCopyUrls() {
    const text = selectedProblems.map(p =>
      `${p.name} (${p.contest} ${p.year} ${p.label})\n  Problem: ${p.problemUrl}${p.solutionUrl ? '\n  Solution: ' + p.solutionUrl : ''}`
    ).join('\n\n')
    navigator.clipboard.writeText(text)
    showToast(`Copied ${selectedProblems.length} URL${selectedProblems.length > 1 ? 's' : ''}`)
  }

  if (loading) return <div className="empty-state" style={{marginTop: 80}}>Loading… <span className="spin">⟳</span></div>
  if (error) return <div className="empty-state" style={{marginTop: 80, color: 'var(--red)'}}>Error: {error}</div>

  return (
    <div className="layout">
      <div className="topbar">
        <span className="logo">Trajectory</span>
        <nav>
          <button className={view === VIEWS.BROWSER ? 'active' : ''} onClick={() => setView(VIEWS.BROWSER)}>Problems</button>
          <button className={view === VIEWS.HISTORY ? 'active' : ''} onClick={() => setView(VIEWS.HISTORY)}>History</button>
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
              filters={filters}
              setFilters={setFilters}
              doneIds={doneIds}
            />
            <div className="problem-area">
              {selected.size > 0 && (
                <div className="action-bar">
                  <span className="sel-count">{selected.size} selected</span>
                  <button className="sm" onClick={clearSelection}>Clear</button>
                  <button className="sm" onClick={selectAll}>Select all {sorted.length}</button>
                  <div className="spacer" />
                  <button className="sm" onClick={handleCopyUrls}>Copy URLs</button>
                  <button className="sm primary" onClick={() => setAssignModalOpen(true)}>
                    Assign to {activeStudent?.name}
                  </button>
                </div>
              )}
              <ProblemTable
                problems={sorted}
                selected={selected}
                doneIds={doneIds}
                filters={filters}
                setFilters={setFilters}
                onToggle={toggleSelect}
                onSelectAll={selectAll}
                onClearAll={clearSelection}
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={handleSort}
                assignments={assignments}
                activeStudentId={activeStudentId}
                students={students}
              />
            </div>
          </>
        )}

        {view === VIEWS.HISTORY && (
          <StudentHistory
            student={activeStudent}
            assignments={assignments.filter(a => a.studentId === activeStudentId)}
            problems={problems}
            onUpdateAssignment={handleUpdateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
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

      {assignModalOpen && (
        <AssignModal
          student={activeStudent}
          problems={selectedProblems}
          onConfirm={handleAssign}
          onClose={() => setAssignModalOpen(false)}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
