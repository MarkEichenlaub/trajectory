import { useState, useEffect, useRef, useMemo } from 'react'
import { renderStatementHtml } from '../../utils/renderStatement'
import ScratchWorkLink from './ScratchWorkLink'
import {
  saveFmaAnswer, uploadFmaScratchWork, submitFmaAttempt, logFmaQuestionView,
  setFmaFlag, setFmaEliminated,
} from '../../utils/supabase'

const CHOICES = ['A', 'B', 'C', 'D', 'E']
const LIMIT_SEC = 75 * 60

function fmt(sec) {
  const s = Math.abs(Math.round(sec))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

// The real exam is 75 minutes. This counts down like a live sitting and warns as
// the time goes, but never submits for you -- on a practice test, losing work to
// the clock teaches nothing.
function Countdown({ startedAt }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const elapsed = Math.max(0, (now - new Date(startedAt).getTime()) / 1000)
  const left = LIMIT_SEC - elapsed
  const over = left < 0
  const warn = !over && left <= 10 * 60

  let label, note
  if (over) {
    // Resuming a day later shouldn't render a nonsense figure.
    label = elapsed > 6 * 3600 ? 'over time' : `+${fmt(-left)}`
    note = 'past 75:00'
  } else {
    label = fmt(left)
    note = left <= 60 ? 'under a minute' : warn ? `${Math.ceil(left / 60)} min left` : 'of 75:00'
  }

  return (
    <span
      role="timer"
      style={{
        fontSize: 15, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono, monospace)',
        fontWeight: over || warn ? 700 : 500,
        color: over ? 'var(--red)' : warn ? 'var(--yellow)' : 'var(--text-dim)',
      }}
    >
      {label} <span style={{ opacity: 0.75, fontWeight: 400, fontSize: 12 }}>{note}</span>
    </span>
  )
}

function Navigator({ questions, answers, flags, index, onJump }) {
  return (
    <div>
      <div className="fma-grid">
        {questions.map((q, i) => {
          const answered = !!answers[q.id]
          const flagged = !!flags[q.id]
          return (
            <button
              key={q.id}
              className={`fma-grid-btn${answered ? ' answered' : ''}${flagged ? ' flagged' : ''}${i === index ? ' current' : ''}`}
              onClick={() => onJump(i)}
              aria-label={`Question ${q.question_num}${answered ? `, answered ${answers[q.id]}` : ', not answered'}${flagged ? ', flagged' : ''}`}
              aria-current={i === index ? 'true' : undefined}
            >
              {q.question_num}
              {flagged && <span className="fma-flag-dot" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
      <div className="fma-legend">
        <span><i className="swatch answered" /> answered</span>
        <span><i className="swatch" /> unanswered</span>
        <span><i className="swatch flagged" /> flagged</span>
      </div>
    </div>
  )
}

export default function FmaTestRunner({ studentId, attempt, questions, initialAnswers, initialFlags, initialEliminated, onDone, onCancel }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(initialAnswers || {})
  const [flags, setFlags] = useState(initialFlags || {})
  const [eliminated, setEliminated] = useState(initialEliminated || {})
  const [uploading, setUploading] = useState(false)
  const [scratchUrl, setScratchUrl] = useState(attempt.scratch_work_url || null)
  const [submitting, setSubmitting] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [err, setErr] = useState(null)
  const fileInputRef = useRef(null)

  const q = questions[index]
  const answeredCount = Object.keys(answers).length
  const unanswered = questions.filter(x => !answers[x.id])
  const flagged = questions.filter(x => flags[x.id])

  useEffect(() => {
    if (q && !reviewing) logFmaQuestionView(attempt.id, q.id)
  }, [attempt.id, q?.id, reviewing])

  // The portal header and tab strip are dead weight mid-test -- they eat a
  // couple of hundred pixels and the header overlaps the tabs once you scroll.
  // A real exam platform is chrome-free, so hide it until the test is left.
  useEffect(() => {
    document.body.classList.add('fma-exam-mode')
    return () => document.body.classList.remove('fma-exam-mode')
  }, [])

  // Warm the neighbouring questions' figures. These are a few hundred KB each,
  // and without this every Next press waits on a cold fetch and the layout jumps
  // when the image finally lands.
  useEffect(() => {
    for (const n of [index + 1, index - 1]) {
      for (const url of questions[n]?.figure_urls || []) {
        const img = new Image()
        img.src = url
      }
    }
  }, [index, questions])

  async function handleChoose(choice) {
    setAnswers(prev => ({ ...prev, [q.id]: choice }))
    setErr(null)
    try {
      await saveFmaAnswer(attempt.id, q.id, choice)
    } catch (e) {
      setAnswers(prev => { const next = { ...prev }; delete next[q.id]; return next })
      setErr(`Couldn't save that answer — check your connection and tap it again. (${e.message})`)
    }
  }

  async function toggleFlag() {
    const next = !flags[q.id]
    setFlags(prev => ({ ...prev, [q.id]: next }))
    try {
      await setFmaFlag(attempt.id, q.id, next)
    } catch {
      setFlags(prev => ({ ...prev, [q.id]: !next }))
    }
  }

  // Crossing out an option you've ruled out, as the real platform allows.
  async function toggleEliminate(choice) {
    const current = eliminated[q.id] || []
    const next = current.includes(choice) ? current.filter(c => c !== choice) : [...current, choice]
    setEliminated(prev => ({ ...prev, [q.id]: next }))
    try {
      await setFmaEliminated(attempt.id, q.id, next)
    } catch {
      setEliminated(prev => ({ ...prev, [q.id]: current }))
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    await uploadFile(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    uploadFile(e.dataTransfer.files?.[0])
  }

  async function uploadFile(file) {
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
    }
  }

  const html = useMemo(() => renderStatementHtml(q?.statement), [q])
  if (!q) return null

  const header = (
    <div className="fma-bar">
      <button className="sm" onClick={onCancel}>← Save &amp; exit</button>
      <Countdown startedAt={attempt.started_at} />
    </div>
  )

  if (reviewing) {
    return (
      <div className="fma-runner">
        {header}
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '8px 0 4px' }}>Review your test</h3>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>
          Tap any question to go back to it.
        </div>
        {err && <div className="fma-err">{err}</div>}

        <Navigator questions={questions} answers={answers} flags={flags} index={-1}
          onJump={i => { setIndex(i); setReviewing(false) }} />

        <div className="fma-card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, marginBottom: 10 }}>
            <strong>{answeredCount}</strong> of {questions.length} answered
          </div>
          {unanswered.length > 0 && (
            <div style={{ fontSize: 13, marginBottom: 10, color: 'var(--yellow)' }}>
              Unanswered: {unanswered.map(x => x.question_num).join(', ')}
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
                There's no penalty for guessing on the F=ma — a blank scores the same as a wrong answer.
              </div>
            </div>
          )}
          {flagged.length > 0 && (
            <div style={{ fontSize: 13, marginBottom: 10 }}>
              Flagged for review: {flagged.map(x => x.question_num).join(', ')}
            </div>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>
            Once submitted the test is graded and can't be changed.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="primary" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Submitting…' : 'Submit test'}
            </button>
            <button className="sm" disabled={submitting} onClick={() => setReviewing(false)}>Keep working</button>
          </div>
        </div>
      </div>
    )
  }

  const gone = eliminated[q.id] || []

  return (
    <div className="fma-runner">
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleFileChange} />
      {header}

      <Navigator questions={questions} answers={answers} flags={flags} index={index} onJump={setIndex} />

      {err && <div className="fma-err">{err}</div>}

      <div className="fma-qhead">
        <span>Question {q.question_num} of {questions.length} · {answeredCount} answered</span>
        <button className={`sm fma-flagbtn${flags[q.id] ? ' on' : ''}`} onClick={toggleFlag}
          aria-pressed={flags[q.id] ? 'true' : 'false'}>
          {flags[q.id] ? '★ Flagged' : '☆ Flag for review'}
        </button>
      </div>

      <div className="fma-card">
        <div dangerouslySetInnerHTML={{ __html: html }} />
        {(q.figure_urls || []).map(url => (
          <img key={url} src={url} alt="Figure for this question" className="fma-figure" />
        ))}

        <div className="fma-choices">
          {CHOICES.map(c => {
            const out = gone.includes(c)
            const picked = answers[q.id] === c
            return (
              <div key={c} className={`fma-choice${picked ? ' picked' : ''}${out ? ' out' : ''}`}>
                <label>
                  <input type="radio" name={`q-${q.id}`} checked={picked} onChange={() => handleChoose(c)} />
                  <strong>{c}</strong>
                  {q.choice_figure_urls?.[c] ? (
                    <img src={q.choice_figure_urls[c]} alt={`Option ${c}`} className="fma-choice-figure" />
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: renderStatementHtml(q.choices?.[c] || '') }} />
                  )}
                </label>
                <button
                  className="fma-strike"
                  onClick={() => toggleEliminate(c)}
                  title={out ? `Restore choice ${c}` : `Cross out choice ${c}`}
                  aria-label={out ? `Restore choice ${c}` : `Cross out choice ${c}`}
                  aria-pressed={out ? 'true' : 'false'}
                >
                  {out ? '↺' : '✕'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div
        className={`fma-scratch${dragging ? ' dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <button className="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
          {uploading ? 'Uploading…' : scratchUrl ? 'Replace scratch work' : 'Upload scratch work (whole test)'}
        </button>
        <ScratchWorkLink path={scratchUrl} label="View ↗" />
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          {dragging ? 'Drop to upload' : 'or drag a photo here · answers save as you tap them'}
        </span>
      </div>

      {/* Sticky: this row used to sit below the fold on a tall question, so the
          only way to submit was invisible unless you scrolled to the very end. */}
      <div className="fma-nav">
        <button disabled={index === 0} onClick={() => setIndex(i => i - 1)}>← Previous</button>
        <button className="fma-review-btn" onClick={() => setReviewing(true)}>Review &amp; submit</button>
        <button className="primary" disabled={index === questions.length - 1} onClick={() => setIndex(i => i + 1)}>Next question →</button>
      </div>
    </div>
  )
}
