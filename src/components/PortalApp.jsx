import { useState, useEffect, useMemo } from 'react'
import { fetchJSON } from '../utils/github'
import { supabase, fetchStudentAssignments, fetchStudentSessions, fetchHandoutsPublic, fetchMyAccessibleSources } from '../utils/supabase'
import StudentView from './StudentView'

const SUPPORT_EMAIL = 'mark@eichenlaubphysics.com'

// Portal shell for student / parent / adult accounts. The logged-in account may
// be linked to several students; a switcher picks the active one. All reads go
// through the public client + RLS, so the rows returned are already scoped to
// the accounts this login may see — we filter client-side by active student.
export default function PortalApp({ account, onSignOut }) {
  const students = account.students || []
  const [activeId, setActiveId] = useState(students[0]?.id || null)
  const [problems, setProblems] = useState([])
  const [handouts, setHandouts] = useState([])
  const [assignments, setAssignments] = useState(null)
  const [sessions, setSessions] = useState([])
  const [accessibleSources, setAccessibleSources] = useState([])
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    fetchJSON('data/problems.json').then(setProblems).catch(() => setProblems([]))
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [a, sess, hout, sources] = await Promise.all([
          fetchStudentAssignments(),
          fetchStudentSessions(),
          fetchHandoutsPublic().catch(() => []),
          fetchMyAccessibleSources().catch(() => []),
        ])
        setAssignments(a)
        setSessions(sess)
        setHandouts(hout)
        setAccessibleSources(sources)
      } catch (e) {
        setLoadError(e.message)
      }
    }
    load()
  }, [])

  // A handout's solutions stay hidden until the active student's assignment for it
  // is marked completed; only then does solutionUrl become non-null and the
  // "Solution ↗" link appear.
  const completedHandoutIds = useMemo(() => {
    const sid = students.find(s => s.id === activeId)?.id || students[0]?.id || null
    const set = new Set()
    for (const a of (assignments || [])) {
      if (a.student_id === sid && a.status === 'completed') set.add(a.problem_id)
    }
    return set
  }, [assignments, students, activeId])

  const allProblems = useMemo(() => [
    ...problems,
    ...handouts.map(h => ({
      id: h.id,
      contest: h.source,
      type: h.resource_type === 'book' ? 'Book' : 'Handout',
      name: h.name,
      desc: h.description || '',
      topics: h.topics || [],
      tags: h.tags || [],
      year: 0,
      label: '',
      country: '',
      problemUrl: h.pdf_url || '',
      solutionUrl: completedHandoutIds.has(h.id) ? (h.solution_url || null) : null,
    })),
  ], [problems, handouts, completedHandoutIds])

  const activeStudent = useMemo(
    () => students.find(s => s.id === activeId) || students[0] || null,
    [students, activeId]
  )

  const studentAssignments = useMemo(
    () => (assignments || []).filter(a => a.student_id === activeStudent?.id),
    [assignments, activeStudent]
  )
  const studentSessions = useMemo(
    () => sessions.filter(s => s.student_id === activeStudent?.id),
    [sessions, activeStudent]
  )

  function handleMarkCompleted(updatedAssignment) {
    setAssignments(prev => {
      if (!prev) return [updatedAssignment]
      const exists = prev.find(a => a.id === updatedAssignment.id)
      if (exists) return prev.map(a => a.id === updatedAssignment.id ? updatedAssignment : a)
      return [...prev, updatedAssignment]
    })
  }

  if (loadError) {
    return (
      <div className="layout">
        <PortalTopbar account={account} students={students} activeId={activeId} setActiveId={setActiveId} onSignOut={onSignOut} />
        <div className="content">
          <div className="student-portal">
            <div className="empty-state" style={{ color: 'var(--red)' }}>Error loading your portal: {loadError}</div>
          </div>
        </div>
      </div>
    )
  }

  if (assignments === null) {
    return <div className="empty-state" style={{ marginTop: 80 }}>Loading your portal… <span className="spin">⟳</span></div>
  }

  return (
    <div className="layout">
      <PortalTopbar account={account} students={students} activeId={activeStudent?.id} setActiveId={setActiveId} onSignOut={onSignOut} />
      <div className="content">
        <StudentView
          student={activeStudent}
          assignments={studentAssignments}
          sessions={studentSessions}
          problems={allProblems}
          accessibleSources={accessibleSources}
          onMarkCompleted={handleMarkCompleted}
          account={account}
        />
      </div>
    </div>
  )
}

function PortalTopbar({ account, students, activeId, setActiveId, onSignOut }) {
  return (
    <div className="topbar">
      <span className="logo" style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span>Eichenlaub Physics</span>
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase' }}>
          {account.role === 'parent' ? 'Parent Portal' : account.role === 'adult' ? 'Portal' : 'Student Portal'}
        </span>
      </span>
      {students.length > 1 && (
        <div className="student-selector" style={{ marginLeft: 20 }}>
          <label>Student</label>
          <select value={activeId || ''} onChange={e => setActiveId(e.target.value)}>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}
      <div className="spacer" />
      <a href={`mailto:${SUPPORT_EMAIL}`} style={{ fontSize: 13, color: 'var(--text-dim)', textDecoration: 'none', marginRight: 16 }}>
        Contact {SUPPORT_EMAIL}
      </a>
      {onSignOut && (
        <button className="sm" style={{ marginRight: 16, opacity: 0.7 }} onClick={onSignOut}>Sign out</button>
      )}
    </div>
  )
}
