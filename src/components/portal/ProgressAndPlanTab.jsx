import { useState, useEffect } from 'react'
import { fetchMyProgressReports } from '../../utils/supabase'

export default function ProgressAndPlanTab({ studentId }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    // fetchMyProgressReports() returns all rows the caller's RLS allows
    // (admin sees every student), so scope to this student client-side.
    fetchMyProgressReports()
      .then(r => setReports(r.filter(rep => rep.student_id === studentId)))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [studentId])

  function fmt(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) return <div style={{ color: 'var(--muted)', fontSize: 13, padding: '20px 0' }}>Loading…</div>

  return (
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {err && <div style={{ fontSize: 12, color: 'var(--red)' }}>{err}</div>}

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Progress and Plan</h3>
        {reports.length === 0 ? (
          <div className="empty-state">No reports yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reports.map(r => (
              <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{fmt(r.created_at)}</div>
                </div>
                {r.pdf_url && (
                  <a href={r.pdf_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, flexShrink: 0 }}>Download ↗</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
