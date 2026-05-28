import { useState, useEffect } from 'react'
import { supabase, fetchStudentAssignments, fetchStudentSessions, linkStudentAccount } from '../utils/supabase'
import StudentLogin from './StudentLogin'
import StudentView from './StudentView'

export default function StudentPortal({ student, studentId, problems }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [assignments, setAssignments] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loadError, setLoadError] = useState(null)

  // Track auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Once logged in, link account + load assignments
  useEffect(() => {
    if (!session) return
    async function load() {
      try {
        await linkStudentAccount()
        const [data, sess] = await Promise.all([fetchStudentAssignments(), fetchStudentSessions()])
        setAssignments(data)
        setSessions(sess)
      } catch (e) {
        setLoadError(e.message)
      }
    }
    load()
  }, [session])

  if (session === undefined) {
    return <div className="empty-state" style={{ marginTop: 80 }}>Loading… <span className="spin">⟳</span></div>
  }

  if (!session) {
    return <StudentLogin studentName={student?.name} />
  }

  if (loadError) {
    return (
      <div className="student-portal">
        <div className="empty-state" style={{ color: 'var(--red)' }}>
          Error loading assignments: {loadError}
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>
    )
  }

  if (assignments === null) {
    return <div className="empty-state" style={{ marginTop: 80 }}>Loading assignments… <span className="spin">⟳</span></div>
  }

  // Check if logged-in user's data was found (user_id linked to a student)
  if (assignments.length === 0) {
    const sessionEmail = session.user?.email
    return (
      <div className="student-portal">
        <div className="empty-state">
          <p>No assignments found for <strong>{sessionEmail}</strong>.</p>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>
            If this is your first login, ask your tutor to verify your email address matches your account.
          </p>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>
    )
  }

  return (
    <StudentView
      student={student}
      assignments={assignments}
      sessions={sessions}
      problems={problems}
      onSignOut={() => supabase.auth.signOut()}
    />
  )
}
