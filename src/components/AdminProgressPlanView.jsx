import { useState, useEffect } from 'react'
import {
  fetchProgressReports, uploadProgressReport, deleteProgressReport,
  fetchStudyPlans, saveStudyPlan, approvePendingPlan, rejectPendingPlan,
} from '../utils/supabase'

export default function AdminProgressPlanView({ studentId, studentName }) {
  const [reports, setReports] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [planDraft, setPlanDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPlanHistory, setShowPlanHistory] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!studentId) return
    setLoading(true)
    setEditing(false)
    setErr(null)
    Promise.all([
      fetchProgressReports(studentId),
      fetchStudyPlans(studentId),
    ]).then(([r, p]) => {
      setReports(r)
      setPlans(p)
    }).catch(e => setErr(e.message)).finally(() => setLoading(false))
  }, [studentId])

  const activePlan = plans.find(p => p.status === 'active')
  const pendingPlan = plans.find(p => p.status === 'pending_approval')
  const archivedPlans = plans.filter(p => p.status === 'archived')

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

  function handleStartEditPlan() {
    setPlanDraft(activePlan?.content || '')
    setEditing(true)
    setErr(null)
  }

  async function handleSavePlan() {
    setSaving(true)
    setErr(null)
    try {
      await saveStudyPlan(studentId, planDraft)
      const updated = await fetchStudyPlans(studentId)
      setPlans(updated)
      setEditing(false)
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleApprovePlan() {
    await approvePendingPlan(pendingPlan.id, studentId)
    setPlans(await fetchStudyPlans(studentId))
  }

  async function handleRejectPlan() {
    await rejectPendingPlan(pendingPlan.id)
    setPlans(await fetchStudyPlans(studentId))
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

      {/* Study plan */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Study plan</h3>
          {!editing && (
            <button className="sm" onClick={handleStartEditPlan}>{activePlan ? 'Edit' : 'Create'}</button>
          )}
        </div>

        {pendingPlan && !editing && (
          <div style={{ background: 'var(--yellow-bg)', border: '1px solid var(--yellow-line)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--yellow)' }}>Student proposed changes · {fmt(pendingPlan.created_at)}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="sm primary" onClick={handleApprovePlan}>Approve</button>
                <button className="sm danger" onClick={handleRejectPlan}>Reject</button>
              </div>
            </div>
            <pre style={{ fontFamily: 'var(--font)', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, color: 'var(--text)' }}>{pendingPlan.content}</pre>
          </div>
        )}

        {editing ? (
          <div>
            <textarea
              value={planDraft}
              onChange={e => setPlanDraft(e.target.value)}
              style={{ width: '100%', height: 320, fontFamily: 'var(--font)', fontSize: 13, lineHeight: 1.7, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="sm primary" onClick={handleSavePlan} disabled={saving || !planDraft.trim()}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button className="sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : activePlan ? (
          <>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Updated {fmt(activePlan.created_at)}
            </div>
            <pre style={{ fontFamily: 'var(--font)', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0, color: 'var(--text)' }}>{activePlan.content}</pre>
            {archivedPlans.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <button className="sm" onClick={() => setShowPlanHistory(v => !v)}>
                  {showPlanHistory ? 'Hide' : 'Show'} history ({archivedPlans.length})
                </button>
                {showPlanHistory && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                    {archivedPlans.map(p => (
                      <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', opacity: 0.65 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                          {fmt(p.created_at)} · {p.proposed_by === 'student' ? 'student proposal' : 'by mentor'}
                        </div>
                        <pre style={{ fontFamily: 'var(--font)', fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, color: 'var(--text)' }}>{p.content}</pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>No study plan yet.</div>
        )}
      </div>

      {/* Report history */}
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
                <button className="sm danger" style={{ fontSize: 11, padding: '1px 6px', flexShrink: 0 }} onClick={() => handleDelete(r.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
