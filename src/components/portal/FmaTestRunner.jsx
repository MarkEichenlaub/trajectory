import { useState, useEffect, useRef, useMemo } from 'react'
import { renderStatementHtml } from '../../utils/renderStatement'
import { saveFmaAnswer, uploadFmaScratchWork, submitFmaAttempt } from '../../utils/supabase'

const CHOICES = ['A', 'B', 'C', 'D', 'E']

function Stopwatch({ startedAt }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const elapsedSec = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000))
  const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0')
  const ss = String(elapsedSec % 60).padStart(2, '0')
  const over = elapsedSec > 75 * 60
  return (
    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono, monospace)', color: over ? 'var(--yellow)' : 'var(--text-dim)' }}>
      {mm}:{ss} <span style={{ opacity: 0.7 }}>/ 75:00 (soft limit)</span>
    </span>
  )
}

export default function FmaTestRunner({ studentId, attempt, questions, onDone, onCancel }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // questionId -> choice
  const [uploadingFor, setUploadingFor] = useState(null)
  const [scratchByQuestion, setScratchByQuestion] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)
  const fileInputRef = useRef(null)
  const pendingUploadQuestionId = useRef(null)

  const q = questions[index]
  const answeredCount = Object.keys(answers).length

  async function handleChoose(choice) {
    setAnswers(prev => ({ ...prev, [q.id]: choice }))
    try {
      await saveFmaAnswer(attempt.id, q.id, choice)
    } catch (e) {
      setErr(e.message)
    }
  }

  function triggerUpload(questionId) {
    pendingUploadQuestionId.current = questionId
    fileInputRef.current?.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    const questionId = pendingUploadQuestionId.current
    e.target.value = ''
    if (!file || !questionId) return
    setUploadingFor(questionId)
    try {
      const url = await uploadFmaScratchWork(studentId, attempt.id, file, questionId)
      setScratchByQuestion(prev => ({ ...prev, [questionId]: url }))
    } catch (e) {
      setErr(e.message)
    } finally {
      setUploadingFor(null)
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
    }
  }

  const html = useMemo(() => renderStatementHtml(q?.statement), [q])

  if (!q) return null

  return (
    <div style={{ maxWidth: 720 }}>
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleFileChange} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="sm" onClick={onCancel}>← Cancel</button>
        <Stopwatch startedAt={attempt.started_at} />
      </div>

      {err && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{err}</div>}

      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
        Question {q.question_num} of {questions.length} · {answeredCount} answered
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        {(q.figure_urls || []).map(url => (
          <img key={url} src={url} alt="" style={{ maxWidth: '100%', border: '1px solid var(--border)', borderRadius: 4, margin: '12px 0' }} />
        ))}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {CHOICES.map(c => (
            <label key={c} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', padding: '6px 10px', borderRadius: 6, background: answers[q.id] === c ? 'var(--accent-dim)' : 'transparent' }}>
              <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === c} onChange={() => handleChoose(c)} />
              <strong>{c}</strong>
              <span dangerouslySetInnerHTML={{ __html: renderStatementHtml(q.choices?.[c] || '') }} />
            </label>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <button className="sm" disabled={uploadingFor === q.id} onClick={() => triggerUpload(q.id)}>
            {uploadingFor === q.id ? 'Uploading…' : scratchByQuestion[q.id] ? 'Replace scratch work' : 'Upload scratch work'}
          </button>
          {scratchByQuestion[q.id] && (
            <a href={scratchByQuestion[q.id]} target="_blank" rel="noreferrer" style={{ fontSize: 12, marginLeft: 10 }}>View ↗</a>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <button disabled={index === 0} onClick={() => setIndex(i => i - 1)}>← Previous</button>
        {index < questions.length - 1 ? (
          <button className="primary" onClick={() => setIndex(i => i + 1)}>Next →</button>
        ) : (
          <button className="primary" disabled={submitting} onClick={handleSubmit}>
            {submitting ? 'Submitting…' : 'Submit test'}
          </button>
        )}
      </div>
    </div>
  )
}
