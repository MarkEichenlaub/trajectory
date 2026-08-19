import { useState, useEffect, useRef, useMemo } from 'react'
import { renderStatementHtml } from '../../utils/renderStatement'
import { saveFmaAnswer, uploadFmaScratchWork, submitFmaAttempt, logFmaQuestionView } from '../../utils/supabase'

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

export default function FmaTestRunner({ studentId, attempt, questions, initialAnswers, onDone, onCancel }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(initialAnswers || {}) // questionId -> choice
  const [uploading, setUploading] = useState(false)
  const [scratchUrl, setScratchUrl] = useState(attempt.scratch_work_url || null)
  const [submitting, setSubmitting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [err, setErr] = useState(null)
  const fileInputRef = useRef(null)

  const q = questions[index]
  const answeredCount = Object.keys(answers).length
  const unanswered = questions.filter(x => !answers[x.id])

  // Mark which question is on screen, so time-per-question reflects the question
  // actually being read rather than the gap between answer clicks.
  useEffect(() => {
    if (q) logFmaQuestionView(attempt.id, q.id)
  }, [attempt.id, q?.id])

  async function handleChoose(choice) {
    setAnswers(prev => ({ ...prev, [q.id]: choice }))
    setErr(null)
    try {
      await saveFmaAnswer(attempt.id, q.id, choice)
    } catch (e) {
      // The optimistic tick above would otherwise imply this was recorded.
      setAnswers(prev => { const next = { ...prev }; delete next[q.id]; return next })
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

  const html = useMemo(() => renderStatementHtml(q?.statement), [q])

  if (!q) return null

  return (
    <div style={{ maxWidth: 720 }}>
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleFileChange} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button className="sm" onClick={onCancel}>← Save &amp; exit</button>
        <Stopwatch startedAt={attempt.started_at} />
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 12 }}>
        Every answer is saved as you tap it — you can leave and pick up where you left off.
      </div>

      {err && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{err}</div>}

      {/* Jump grid: reviewing Q3 from Q25 shouldn't take 22 clicks of Previous. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {questions.map((x, i) => (
          <button
            key={x.id}
            onClick={() => setIndex(i)}
            title={answers[x.id] ? `Answered ${answers[x.id]}` : 'Not answered'}
            style={{
              width: 28, height: 28, padding: 0, fontSize: 11, borderRadius: 4, cursor: 'pointer',
              border: i === index ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: answers[x.id] ? 'var(--accent-dim)' : 'var(--surface)',
              fontWeight: i === index ? 700 : 400,
            }}
          >
            {x.question_num}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
        Question {q.question_num} of {questions.length} · {answeredCount} answered
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        {(q.figure_urls || []).map(url => (
          <img key={url} src={url} alt="" loading="lazy" style={{ maxWidth: '100%', border: '1px solid var(--border)', borderRadius: 4, margin: '12px 0' }} />
        ))}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {CHOICES.map(c => (
            <label key={c} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', padding: '8px 10px', borderRadius: 6, background: answers[q.id] === c ? 'var(--accent-dim)' : 'transparent' }}>
              <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === c} onChange={() => handleChoose(c)} />
              <strong>{c}</strong>
              <span dangerouslySetInnerHTML={{ __html: renderStatementHtml(q.choices?.[c] || '') }} />
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
          {uploading ? 'Uploading…' : scratchUrl ? 'Replace scratch work' : 'Upload scratch work (whole test)'}
        </button>
        {scratchUrl && <a href={scratchUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>View ↗</a>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <button disabled={index === 0} onClick={() => setIndex(i => i - 1)}>← Previous</button>
        {index < questions.length - 1 ? (
          <button className="primary" onClick={() => setIndex(i => i + 1)}>Next →</button>
        ) : (
          <button onClick={() => setConfirming(true)} style={{ borderColor: 'var(--green, #22c55e)', color: 'var(--green, #22c55e)' }}>
            Finish &amp; submit
          </button>
        )}
      </div>

      {confirming && (
        <div style={{ marginTop: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Submit this test?</div>
          {unanswered.length > 0 ? (
            <div style={{ fontSize: 13, marginBottom: 12 }}>
              <span style={{ color: 'var(--yellow)' }}>
                {unanswered.length} question{unanswered.length === 1 ? '' : 's'} still unanswered:
              </span>{' '}
              {unanswered.map(x => x.question_num).join(', ')}
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>
                There's no penalty for guessing on the F=ma — tap a number above to go back.
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, marginBottom: 12 }}>All {questions.length} questions answered.</div>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
            Once submitted the test is graded and can't be changed.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="primary" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Submitting…' : 'Yes, submit'}
            </button>
            <button className="sm" disabled={submitting} onClick={() => setConfirming(false)}>Keep working</button>
          </div>
        </div>
      )}
    </div>
  )
}
