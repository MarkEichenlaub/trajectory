import { useState } from 'react'

const STATUS_LABELS = {
  requested: { text: 'Waiting for build', color: 'var(--yellow, #b58900)' },
  building: { text: 'Building…', color: 'var(--accent)' },
  draft: { text: 'Ready for review', color: 'var(--green, #2a9d4a)' },
  revise: { text: 'Changes requested', color: 'var(--yellow, #b58900)' },
  failed: { text: 'Build failed', color: 'var(--red)' },
}

function DraftCard({ handout, onRequestChanges, onApprove, onDiscard }) {
  const [notes, setNotes] = useState(handout.review_notes || '')
  const [busy, setBusy] = useState(false)
  const [showPreview, setShowPreview] = useState(handout.status === 'draft')

  const req = handout.request || {}
  const status = STATUS_LABELS[handout.status] || { text: handout.status, color: 'var(--text-dim)' }
  const problemCount = (req.problem_ids || []).length

  async function run(fn) {
    setBusy(true)
    try { await fn() } finally { setBusy(false) }
  }

  return (
    <div className="assigned-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 99,
          color: status.color, border: `1px solid ${status.color}`,
        }}>{status.text}</span>
        <span className="p-name" style={{ fontWeight: 500 }}>{handout.name}</span>
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          for {req.student_name || 'unknown'} · {problemCount} problem{problemCount !== 1 ? 's' : ''}
          {req.lesson ? ` · ${req.lesson}` : ''}
        </span>
        <div className="spacer" style={{ flex: 1 }} />
        {handout.pdf_url && (
          <>
            <a href={handout.pdf_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>PDF ↗</a>
            {handout.solution_url && (
              <a href={handout.solution_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Solutions ↗</a>
            )}
            <button className="sm" style={{ fontSize: 11 }} onClick={() => setShowPreview(v => !v)}>
              {showPreview ? 'Hide preview' : 'Preview'}
            </button>
          </>
        )}
        <button
          className="sm danger" style={{ fontSize: 11 }} disabled={busy}
          onClick={() => { if (confirm('Discard this draft packet?')) run(() => onDiscard(handout)) }}
        >Discard</button>
      </div>

      {handout.status === 'requested' && (
        <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
          Run <code>/build-homework</code> in your terminal to build this packet.
        </p>
      )}
      {handout.status === 'failed' && handout.review_notes && (
        <p style={{ fontSize: 12, color: 'var(--red)', margin: 0 }}>{handout.review_notes}</p>
      )}

      {showPreview && handout.pdf_url && (
        <iframe
          src={handout.pdf_url}
          title={`Preview of ${handout.name}`}
          style={{ width: '100%', height: 520, border: '1px solid var(--border)', borderRadius: 4, background: '#fff' }}
        />
      )}

      {(handout.status === 'draft' || handout.status === 'revise') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What should change? (e.g. retitle it, reorder the problems, tweak the summary…)"
            rows={2}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 4, padding: '6px 8px', fontSize: 13, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {handout.status === 'revise' ? (
              <span style={{ fontSize: 12, color: 'var(--text-dim)', alignSelf: 'center' }}>
                Waiting for the build agent to apply your notes…
              </span>
            ) : (
              <button
                className="sm" disabled={busy || !notes.trim()}
                onClick={() => run(() => onRequestChanges(handout, notes.trim()))}
              >Request changes</button>
            )}
            <button
              className="sm primary" disabled={busy || handout.status !== 'draft'}
              onClick={() => run(() => onApprove(handout))}
            >Approve & assign to {req.student_name || 'student'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

// Review queue for homework packets being built by the local agent. Rendered at
// the top of the Handouts tab; only handout rows that aren't 'active' show here.
export default function HomeworkDraftsPanel({ drafts, onRequestChanges, onApprove, onDiscard }) {
  if (drafts.length === 0) return null
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="assigned-header">
        <h2>Homework packet drafts</h2>
        <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          {drafts.length} in progress
        </span>
      </div>
      <div className="assigned-list">
        {drafts.map(h => (
          <DraftCard
            key={h.id}
            handout={h}
            onRequestChanges={onRequestChanges}
            onApprove={onApprove}
            onDiscard={onDiscard}
          />
        ))}
      </div>
    </div>
  )
}
