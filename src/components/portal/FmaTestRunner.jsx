import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { renderStatementHtml } from '../../utils/renderStatement'
import ScratchWorkLink from './ScratchWorkLink'
import {
  saveFmaAnswer, uploadFmaScratchWork, submitFmaAttempt, logFmaQuestionView,
  setFmaFlag, setFmaStar, setFmaEliminated, bumpFmaActiveSeconds,
} from '../../utils/supabase'

const CHOICES = ['A', 'B', 'C', 'D', 'E']
const LIMIT_SEC = 75 * 60
const FLUSH_MS = 15000
// A jump larger than this between one-second ticks means the page wasn't
// running -- laptop asleep, tab frozen by the browser -- not that the student
// sat there for that long.
const STALL_MS = 60000

function fmt(sec) {
  const s = Math.abs(Math.round(sec))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

// The exam clock, measuring time actually spent on the test.
//
// It used to be wall-clock from attempt.started_at, so it kept draining while
// the student was away: hit "Save & exit", get called away for two hours, come
// back to a test with no time left. Now the runner banks its own total, pausing
// whenever the test isn't on screen, and flushes it to the server every 15s so
// a resume picks the clock up where it stopped rather than where the calendar
// got to. `seconds` is also the honest total time to report after submission.
function useExamClock(attemptId, baseSeconds) {
  const banked = useRef(baseSeconds || 0)
  const runningSince = useRef(null)
  const [seconds, setSeconds] = useState(baseSeconds || 0)

  const total = useCallback(
    () => banked.current + (runningSince.current ? (Date.now() - runningSince.current) / 1000 : 0),
    []
  )

  const pause = useCallback(() => {
    if (runningSince.current === null) return
    banked.current += (Date.now() - runningSince.current) / 1000
    runningSince.current = null
  }, [])

  const resume = useCallback(() => {
    if (runningSince.current === null) runningSince.current = Date.now()
  }, [])

  const flush = useCallback(() => bumpFmaActiveSeconds(attemptId, total()), [attemptId, total])

  useEffect(() => {
    if (document.visibilityState === 'visible') resume()
    let lastTick = Date.now()
    let sinceFlush = 0

    const tick = setInterval(() => {
      const now = Date.now()
      const gap = now - lastTick
      // Bank only up to the last tick we actually saw and restart the span, so
      // a sleeping machine doesn't bill the student for hours it was closed.
      if (gap > STALL_MS && runningSince.current !== null) {
        banked.current += Math.max(0, (lastTick - runningSince.current) / 1000)
        runningSince.current = now
      }
      lastTick = now
      setSeconds(total())

      sinceFlush += gap
      if (sinceFlush >= FLUSH_MS) { sinceFlush = 0; flush() }
    }, 1000)

    // Switching tabs or apps isn't taking the test either.
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') { pause(); flush() } else { lastTick = Date.now(); resume() }
    }
    document.addEventListener('visibilitychange', onVisibility)
    // Closing the tab outright: last chance to save the clock.
    window.addEventListener('pagehide', flush)

    return () => {
      clearInterval(tick)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', flush)
      pause()
      flush()
    }
  }, [total, pause, resume, flush])

  // `total` is exposed so events can be stamped with the clock reading at the
  // instant they happen: per-question times are differences of those stamps, so
  // they inherit this clock's pausing instead of measuring wall time.
  return { seconds, total, flush, pause }
}

// Counts down like a live sitting and warns as the time goes, but never submits
// for you -- on a practice test, losing work to the clock teaches nothing. Going
// over is allowed; the total time taken is recorded either way.
function Countdown({ seconds }) {
  const left = LIMIT_SEC - seconds
  const over = left < 0
  const warn = !over && left <= 10 * 60

  let label, note
  if (over) {
    label = `+${fmt(-left)}`
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

function Navigator({ questions, answers, flags, stars, index, onJump }) {
  return (
    <div>
      <div className="fma-grid">
        {questions.map((q, i) => {
          const answered = !!answers[q.id]
          const flagged = !!flags[q.id]
          const starred = !!stars[q.id]
          return (
            <button
              key={q.id}
              className={`fma-grid-btn${answered ? ' answered' : ''}${flagged ? ' flagged' : ''}${starred ? ' starred' : ''}${i === index ? ' current' : ''}`}
              onClick={() => onJump(i)}
              aria-label={`Question ${q.question_num}${answered ? `, answered ${answers[q.id]}` : ', not answered'}${flagged ? ', flagged' : ''}${starred ? ', starred' : ''}`}
              aria-current={i === index ? 'true' : undefined}
            >
              {q.question_num}
              {flagged && <span className="fma-flag-dot" aria-hidden="true" />}
              {starred && <span className="fma-star-mark" aria-hidden="true">★</span>}
            </button>
          )
        })}
      </div>
      <div className="fma-legend">
        <span><i className="swatch answered" /> answered</span>
        <span><i className="swatch" /> unanswered</span>
        <span><i className="swatch flagged" /> flagged</span>
        <span><i className="swatch starred" /> starred</span>
      </div>
    </div>
  )
}

export default function FmaTestRunner({ studentId, attempt, questions, initialAnswers, initialFlags, initialStars, initialEliminated, initialIndex = 0, onDone, onCancel }) {
  const [index, setIndex] = useState(initialIndex)
  const [answers, setAnswers] = useState(initialAnswers || {})
  const [flags, setFlags] = useState(initialFlags || {})
  const [stars, setStars] = useState(initialStars || {})
  const [eliminated, setEliminated] = useState(initialEliminated || {})
  const [uploading, setUploading] = useState(false)
  const [scratchUrl, setScratchUrl] = useState(attempt.scratch_work_url || null)
  const [submitting, setSubmitting] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  // Set when Submit was tapped with no scratch work attached; see requestSubmit.
  const [confirmNoWork, setConfirmNoWork] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [err, setErr] = useState(null)
  const [overAcked, setOverAcked] = useState(false)
  const fileInputRef = useRef(null)

  const { seconds, total, flush } = useExamClock(attempt.id, attempt.active_seconds)
  const overTime = seconds > LIMIT_SEC

  const q = questions[index]
  const answeredCount = Object.keys(answers).length
  const unanswered = questions.filter(x => !answers[x.id])
  const flagged = questions.filter(x => flags[x.id])
  const starred = questions.filter(x => stars[x.id])

  useEffect(() => {
    if (q && !reviewing) logFmaQuestionView(attempt.id, q.id, total())
  }, [attempt.id, q?.id, reviewing, total])

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
      await saveFmaAnswer(attempt.id, q.id, choice, total())
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

  // A star outlives the test. Flagging is for "come back to this before I
  // submit" and gets cleared once you have; starring says "I guessed, go over
  // this one with me later", and shows up on the results page and in Mark's
  // report whether the guess landed or not.
  async function toggleStar() {
    const next = !stars[q.id]
    setStars(prev => ({ ...prev, [q.id]: next }))
    try {
      await setFmaStar(attempt.id, q.id, next)
    } catch {
      setStars(prev => ({ ...prev, [q.id]: !next }))
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
      setConfirmNoWork(false)
    } catch (e) {
      setErr(`Scratch work upload failed: ${e.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Submitting with no scan attached is allowed, but it has to be a decision
  // rather than an oversight: almost every student who skipped the upload just
  // forgot it was there, and without the work Mark can only guess at what led
  // to a wrong answer. So the first tap on Submit opens the prompt below, and
  // getting past it takes an explicit "submit without my work".
  function requestSubmit() {
    if (!scratchUrl) { setConfirmNoWork(true); return }
    handleSubmit()
  }

  async function handleSubmit() {
    setConfirmNoWork(false)
    setSubmitting(true)
    setErr(null)
    try {
      // The clock freezes at submit, so bank the final total first -- otherwise
      // the last stretch of work (up to 15s, or the whole review screen) is lost
      // and the recorded time comes in short.
      await flush()
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
      <Countdown seconds={seconds} />
    </div>
  )

  // Going past 75 minutes is allowed -- finishing the questions is worth more
  // than the deadline on a practice test -- but it shouldn't slip by unnoticed,
  // so say it once, plainly, and let it be dismissed.
  const overNotice = overTime && !overAcked && (
    <div className="fma-card" style={{ borderColor: 'var(--yellow)', marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>You're past the 75-minute limit</div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>
        Keep going and finish the test — nothing is cut off. Your total working time is being
        recorded ({fmt(seconds)} so far), so you and Mark can see how far over the real limit
        this sitting ran.
      </div>
      <button className="sm" onClick={() => setOverAcked(true)}>Got it</button>
    </div>
  )

  // Only one of the two screens below renders at a time, so the same ref is
  // never claimed twice.
  const hiddenFileInput = (
    <input ref={fileInputRef} type="file" accept="image/*,application/pdf"
      style={{ display: 'none' }} onChange={handleFileChange} />
  )

  // Four ways out, and submitting anyway is the one that takes a deliberate tap
  // on a plainly-labeled button rather than the primary action.
  const noWorkPrompt = confirmNoWork && (
    <div className="fma-card" style={{ borderColor: 'var(--yellow)', marginTop: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
        You haven't attached your work. Attach it now?
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
        A photo of your scratch paper is what lets Mark see where a wrong answer came from,
        instead of guessing from the letter you picked. One picture of each page is plenty.
      </div>
      {err && <div className="fma-err" style={{ marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="primary" disabled={uploading || submitting}
          onClick={() => fileInputRef.current?.click()}>
          {uploading ? 'Uploading…' : 'Attach my work'}
        </button>
        <button className="sm" disabled={uploading || submitting}
          onClick={() => { setConfirmNoWork(false); setReviewing(false) }}>
          Go back to the test
        </button>
        <button className="sm" disabled={uploading || submitting}
          onClick={() => setConfirmNoWork(false)}>
          Not now
        </button>
        <button className="sm" disabled={uploading || submitting} onClick={handleSubmit}
          style={{ marginLeft: 'auto', color: 'var(--red)' }}>
          Submit without my work
        </button>
      </div>
    </div>
  )

  if (reviewing) {
    return (
      <div className="fma-runner">
        {hiddenFileInput}
        {header}
        {overNotice}
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '8px 0 4px' }}>Review your test</h3>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>
          Tap any question to go back to it.
        </div>
        {err && <div className="fma-err">{err}</div>}

        <Navigator questions={questions} answers={answers} flags={flags} stars={stars} index={-1}
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
          {starred.length > 0 && (
            <div style={{ fontSize: 13, marginBottom: 10 }}>
              Starred as guesses: {starred.map(x => x.question_num).join(', ')}
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
                These stay starred on your results page and in Mark's report, even the ones you get right.
              </div>
            </div>
          )}
          <div style={{ fontSize: 13, marginBottom: 10 }}>
            Working time: <strong>{fmt(seconds)}</strong>
            <span style={{ color: 'var(--text-dim)' }}>
              {overTime ? ` — ${fmt(seconds - LIMIT_SEC)} over the 75:00 limit` : ' of 75:00'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>
            Once submitted the test is graded and can't be changed.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="primary" disabled={submitting || confirmNoWork} onClick={requestSubmit}>
              {submitting ? 'Submitting…' : 'Submit test'}
            </button>
            <button className="sm" disabled={submitting} onClick={() => setReviewing(false)}>Keep working</button>
          </div>
          {scratchUrl && (
            <div style={{ fontSize: 12, color: 'var(--green, #1a7f37)', marginTop: 10 }}>
              Your work is attached. <ScratchWorkLink path={scratchUrl} label="View ↗" />
            </div>
          )}
        </div>
        {noWorkPrompt}
      </div>
    )
  }

  const gone = eliminated[q.id] || []

  return (
    <div className="fma-runner">
      {hiddenFileInput}
      {header}
      {overNotice}

      <Navigator questions={questions} answers={answers} flags={flags} stars={stars} index={index} onJump={setIndex} />

      {err && <div className="fma-err">{err}</div>}

      <div className="fma-qhead">
        <span>Question {q.question_num} of {questions.length} · {answeredCount} answered</span>
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className={`sm fma-starbtn${stars[q.id] ? ' on' : ''}`} onClick={toggleStar}
            aria-pressed={stars[q.id] ? 'true' : 'false'}
            title="Mark this one as a guess, so it shows up in your results and Mark's report even if you get it right">
            {stars[q.id] ? '★ Starred' : '☆ Star — I guessed'}
          </button>
          <button className={`sm fma-flagbtn${flags[q.id] ? ' on' : ''}`} onClick={toggleFlag}
            aria-pressed={flags[q.id] ? 'true' : 'false'}
            title="Come back to this before submitting">
            {flags[q.id] ? '⚑ Flagged' : '⚐ Flag for review'}
          </button>
        </span>
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
