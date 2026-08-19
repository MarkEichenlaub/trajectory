import { useState, useRef } from 'react'
import { saveFmaAnswer, uploadFmaScratchWork, submitFmaAttempt } from '../../utils/supabase'

const CHOICES = ['A', 'B', 'C', 'D', 'E']

export default function FmaBatchEntry({ studentId, attempt, questions, initialAnswers, examPdfUrl, onDone, onCancel }) {
  const [answers, setAnswers] = useState(initialAnswers || {}) // questionId -> choice
  const [uploading, setUploading] = useState(false)
  const [scratchUrl, setScratchUrl] = useState(attempt.scratch_work_url || null)
  const [submitting, setSubmitting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [err, setErr] = useState(null)
  const fileInputRef = useRef(null)

  // Written straight through on every tap. Holding 25 answers in local state
  // until submit meant a reload — or a sleeping laptop — silently discarded the
  // whole bubble sheet after the student had already worked the paper test.
  async function handleChoose(questionId, choice) {
    setAnswers(prev => ({ ...prev, [questionId]: choice }))
    setErr(null)
    try {
      await saveFmaAnswer(attempt.id, questionId, choice)
    } catch (e) {
      setAnswers(prev => { const next = { ...prev }; delete next[questionId]; return next })
      setErr(`Couldn't save that answer — check your connection and tap it again. (${e.message})`)
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setErr(null)
    try {
      setScratchUrl(await uploadFmaScratchWork(studentId, attempt.id, file))
    } catch (e) {
      setErr(`Scratch work upload failed: ${e.message}`)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setErr(null)
    try {
      await submitFmaAttempt(attempt.id)
      onDone()
    } catch (e) {
      setErr(e.message)
      setSubmitting(false)
      setConfirming(false)
    }
  }

  const answeredCount = Object.keys(answers).length
  const unanswered = questions.filter(q => !answers[q.id])

  return (
    <div style={{ maxWidth: 520 }}>
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleFileChange} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="sm" onClick={onCancel}>← Save &amp; exit</button>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{answeredCount} of {questions.length} entered</div>
      </div>

      {err && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{err}</div>}

      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
        Work the whole test on paper first, then enter your final answers below.
        {examPdfUrl && (
          <> <a href={examPdfUrl} target="_blank" rel="noreferrer">Open the exam PDF ↗</a></>
        )}
        <div style={{ marginTop: 4 }}>Each answer saves as you tap it.</div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {questions.map(q => (
          <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '3px 0' }}>
            <div style={{ width: 24, fontSize: 12, color: 'var(--text-dim)', flexShrink: 0 }}>{q.question_num}.</div>
            {CHOICES.map(c => (
              <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '6px 8px', borderRadius: 4, background: answers[q.id] === c ? 'var(--accent-dim)' : 'transparent' }}>
                <input type="radio" name={`bq-${q.id}`} checked={answers[q.id] === c} onChange={() => handleChoose(q.id, c)} />
                <span style={{ fontSize: 12 }}>{c}</span>
              </label>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
          {uploading ? 'Uploading…' : scratchUrl ? 'Replace scratch work' : 'Upload scratch work (whole test)'}
        </button>
        {scratchUrl && <a href={scratchUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>View ↗</a>}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => setConfirming(true)} style={{ borderColor: 'var(--green, #22c55e)', color: 'var(--green, #22c55e)' }}>
          Finish &amp; submit
        </button>
      </div>

      {confirming && (
        <div style={{ marginTop: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Submit this test?</div>
          {unanswered.length > 0 ? (
            <div style={{ fontSize: 13, marginBottom: 12 }}>
              <span style={{ color: 'var(--yellow)' }}>
                {unanswered.length} question{unanswered.length === 1 ? '' : 's'} still blank:
              </span>{' '}
              {unanswered.map(q => q.question_num).join(', ')}
            </div>
          ) : (
            <div style={{ fontSize: 13, marginBottom: 12 }}>All {questions.length} answers entered.</div>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
            Once submitted the test is graded and can't be changed.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="primary" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Submitting…' : 'Yes, submit'}
            </button>
            <button className="sm" disabled={submitting} onClick={() => setConfirming(false)}>Keep entering</button>
          </div>
        </div>
      )}
    </div>
  )
}
