import { useState, useEffect } from 'react'
import { fetchFmaAttempts, fetchFmaAttemptDetail } from '../utils/supabase'
import FmaAttemptDetail from './portal/FmaAttemptDetail'
import { FmaChart, TagBreakdown } from './portal/FmaProgress'

export default function AdminFmaView({ studentId, studentName }) {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    if (!studentId) return
    setLoading(true)
    setDetail(null)
    fetchFmaAttempts(studentId)
      .then(setAttempts)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [studentId])

  async function handleView(attemptId) {
    try {
      const d = await fetchFmaAttemptDetail(attemptId)
      setDetail(d)
    } catch (e) {
      setErr(e.message)
    }
  }

  if (!studentId) return <div className="empty-state">Select a student first.</div>
  if (loading) return <div style={{ color: 'var(--text-dim)', fontSize: 13, padding: '20px 0' }}>Loading…</div>

  if (detail) {
    // Needs its own scroll too: a 25-question review is the longest page here.
    return (
      <div className="admin-pane">
        <FmaAttemptDetail detail={detail} onBack={() => setDetail(null)} />
      </div>
    )
  }

  return (
    <div className="admin-pane" style={{ maxWidth: 720 }}>
      {err && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{err}</div>}
      <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>{studentName}'s F=ma practice tests</h3>

      {/* The tutor should see at least what the student sees. */}
      {attempts.length > 0 && (
        <>
          <div style={{ marginBottom: 20 }}>
            <FmaChart attempts={attempts} onSelect={handleView} />
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Performance by tag</h3>
          <div style={{ marginBottom: 24 }}>
            <TagBreakdown attempts={attempts} />
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Attempts</h3>
        </>
      )}

      {attempts.length === 0 ? (
        <div className="empty-state">No practice tests taken yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {attempts.map(a => (
            <div
              key={a.id}
              onClick={() => handleView(a.id)}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            >
              <div style={{ flex: 1, fontSize: 13 }}>{a.handouts?.name || a.exam_id}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{a.mode.replace('_', ' ')}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{new Date(a.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>
                {a.score != null ? `${a.score}/25` : a.status === 'in_progress' ? 'in progress' : '—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
