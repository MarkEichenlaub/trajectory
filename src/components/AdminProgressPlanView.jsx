import { useState, useEffect } from 'react'
import {
  fetchProgressReports, uploadProgressReport, deleteProgressReport,
} from '../utils/supabase'

export default function AdminProgressPlanView({ studentId, studentName, onEmailReport }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!studentId) return
    setLoading(true)
    setErr(null)
    fetchProgressReports(studentId)
      .then(setReports)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [studentId])

  async function handleUpload() {
    if (!file || !title.trim()) return
    setUploading(true)
    setErr(null)
    try {
      const row = await uploadProgressReport(file, studentId, title.trim())
      setReports(prev => [row, ...prev])
      setTitle('')
      setFile(null)
    } catch (e) {
      setErr(e.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this report? This cannot be undone.')) return
    try {
      await deleteProgressReport(id)
      setReports(prev => prev.filter(r => r.id !== id))
    } catch (e) {
      setErr(e.message)
    }
  }

  function fmt(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) return <div style={{ color: 'var(--muted)', fontSize: 13, padding: '20px 0' }}>Loading…</div>

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Draft hint */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Generate AI draft</div>
        <code style={{ display: 'block', fontSize: 13, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px', marginBottom: 8 }}>
          node reports/draft.mjs {studentId}
        </code>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>
          Edit <code>reports/{studentId}/&lt;cycle&gt;.typ</code>, then:
          <code style={{ display: 'block', marginTop: 4, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px' }}>
            typst compile reports/{studentId}/&lt;cycle&gt;.typ
          </code>
        </div>
      </div>

      {/* Upload */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Upload report</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={`Progress and Plan — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
            style={{ width: '100%' }}
          />
          <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} style={{ fontSize: 13 }} />
          <div>
            <button className="sm primary" onClick={handleUpload} disabled={uploading || !file || !title.trim()}>
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
      </div>

      {err && <div style={{ fontSize: 12, color: 'var(--red)' }}>{err}</div>}

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>History</h3>
        {reports.length === 0 ? (
          <div className="empty-state">No reports uploaded yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reports.map(r => (
              <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                    {fmt(r.created_at)}{r.sessions_covered ? ` · ${r.sessions_covered} sessions` : ''}
                  </div>
                </div>
                {r.pdf_url && (
                  <a href={r.pdf_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, flexShrink: 0 }}>Download ↗</a>
                )}
                {r.pdf_url && onEmailReport && (
                  <button className="sm" style={{ flexShrink: 0 }} onClick={() => onEmailReport(r)}>✉ Email</button>
                )}
                <button className="sm danger" style={{ fontSize: 11, padding: '1px 6px', flexShrink: 0 }} onClick={() => handleDelete(r.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
