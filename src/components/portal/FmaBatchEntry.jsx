import { useState, useRef } from 'react'
import { saveFmaAnswer, uploadFmaScratchWork, submitFmaAttempt } from '../../utils/supabase'

const CHOICES = ['A', 'B', 'C', 'D', 'E']

export default function FmaBatchEntry({ studentId, attempt, questions, onDone, onCancel }) {
  const [answers, setAnswers] = useState({}) // questionId -> choice
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [scratchUrl, setScratchUrl] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)
  const fileInputRef = useRef(null)

  function handleChoose(questionId, choice) {
    setAnswers(prev => ({ ...prev, [questionId]: choice }))
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFmaScratchWork(studentId, attempt.id, file)
      setScratchUrl(url)
    } catch (e) {
      setErr(e.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setErr(null)
    try {
      setSaving(true)
      await Promise.all(
        Object.entries(answers).map(([questionId, choice]) => saveFmaAnswer(attempt.id, questionId, choice))
      )
      setSaving(false)
      await submitFmaAttempt(attempt.id)
      onDone()
    } catch (e) {
      setErr(e.message)
      setSaving(false)
      setSubmitting(false)
    }
  }

  const answeredCount = Object.keys(answers).length

  return (
    <div style={{ maxWidth: 520 }}>
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleFileChange} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="sm" onClick={onCancel}>← Cancel</button>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{answeredCount} of {questions.length} entered</div>
      </div>

      {err && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{err}</div>}

      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
        Work the whole test on paper first, then enter your final answers below.
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {questions.map(q => (
          <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 24, fontSize: 12, color: 'var(--text-dim)', flexShrink: 0 }}>{q.question_num}.</div>
            {CHOICES.map(c => (
              <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                <input type="radio" name={`bq-${q.id}`} checked={answers[q.id] === c} onChange={() => handleChoose(q.id, c)} />
                <span style={{ fontSize: 12 }}>{c}</span>
              </label>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
          {uploading ? 'Uploading…' : scratchUrl ? 'Replace scratch work' : 'Upload scratch work (whole test)'}
        </button>
        {scratchUrl && <a href={scratchUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, marginLeft: 10 }}>View ↗</a>}
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="primary" disabled={submitting || saving} onClick={handleSubmit}>
          {submitting ? 'Submitting…' : 'Submit test'}
        </button>
      </div>
    </div>
  )
}
