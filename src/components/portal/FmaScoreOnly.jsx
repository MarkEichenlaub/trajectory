import { useState } from 'react'
import { submitFmaScoreOnly } from '../../utils/supabase'

export default function FmaScoreOnly({ attempt, onDone, onCancel }) {
  const [score, setScore] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)

  async function handleSubmit() {
    const n = parseInt(score, 10)
    if (Number.isNaN(n) || n < 0 || n > 25) { setErr('Enter a score between 0 and 25.'); return }
    setSubmitting(true)
    setErr(null)
    try {
      await submitFmaScoreOnly(attempt.id, n)
      onDone()
    } catch (e) {
      setErr(e.message)
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 360 }}>
      <button className="sm" onClick={onCancel} style={{ marginBottom: 16 }}>← Cancel</button>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
        <div style={{ fontSize: 13, marginBottom: 12 }}>Record your final score out of 25.</div>
        {err && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 8 }}>{err}</div>}
        <input
          type="number" min={0} max={25} value={score}
          onChange={e => setScore(e.target.value)}
          placeholder="e.g. 17"
          style={{ width: 100, marginBottom: 16 }}
        />
        <div>
          <button className="primary" disabled={submitting} onClick={handleSubmit}>
            {submitting ? 'Saving…' : 'Save score'}
          </button>
        </div>
      </div>
    </div>
  )
}
