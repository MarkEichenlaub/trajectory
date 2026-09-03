import { useState, useEffect, useMemo, useCallback } from 'react'
import { renderStatementHtml } from '../../utils/renderStatement'
import {
  fetchFmaHomeworkQuestions, fetchFmaHomeworkAttempts, fetchFmaHomeworkAttemptAnswers,
  fetchFmaHomeworkAttemptDetail, createFmaHomeworkAttempt, saveFmaHomeworkAnswer,
  deleteFmaHomeworkAttempt, submitFmaHomeworkAttempt,
} from '../../utils/supabase'

const CHOICES = ['A', 'B', 'C', 'D', 'E']

// Read-only "graded results" view — shared by the student runner (once its own
// attempt is graded) and the admin view (looking at any student's attempt).
export function FmaHomeworkResult({ attempt, result, setName, onBack, backLabel = '← Back' }) {
  const mcCount = result.questions.filter(rq => rq.question_type === 'mc').length
  return (
    <div className="fma-runner">
      <div className="fma-bar">
        <button className="sm" onClick={onBack}>{backLabel}</button>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, margin: '8px 0 4px' }}>{setName}</h3>
      <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>
        {attempt.score != null ? `Score: ${attempt.score}/${mcCount}` : 'Submitted — not yet graded'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {result.questions.map(rq => {
          const ans = result.answerByQuestion.get(rq.id)
          const correct = ans?.is_correct
          return (
            <div key={rq.id} className="fma-card">
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>
                Question {rq.question_num}
                {rq.question_type === 'mc' && (
                  <span style={{ marginLeft: 8, color: correct ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                    {correct ? 'Correct' : ans?.selected_choice ? 'Incorrect' : 'Not answered'}
                  </span>
                )}
              </div>
              <div dangerouslySetInnerHTML={{ __html: renderStatementHtml(rq.statement) }} />
              {(rq.figure_urls || []).map(url => (
                <img key={url} src={url} alt="Figure for this question" className="fma-figure" />
              ))}

              {rq.question_type === 'mc' ? (
                <div className="fma-choices" style={{ marginTop: 8 }}>
                  {CHOICES.map(c => {
                    const picked = ans?.selected_choice === c
                    const isRight = c === rq.correct_choice || (rq.also_accepted || []).includes(c)
                    return (
                      <div key={c} className={`fma-choice${picked ? ' picked' : ''}`}>
                        <label style={isRight ? { borderColor: 'var(--green)' } : undefined}>
                          <input type="radio" checked={picked} readOnly />
                          <strong>{c}</strong>
                          {rq.choice_figure_urls?.[c] ? (
                            <img src={rq.choice_figure_urls[c]} alt={`Option ${c}`} className="fma-choice-figure" />
                          ) : (
                            <span dangerouslySetInnerHTML={{ __html: renderStatementHtml(rq.choices?.[c] || '') }} />
                          )}
                        </label>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>
                    {onBack ? 'Answer' : 'Your answer'}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 10 }}>
                    {ans?.free_response_text || <em style={{ color: 'var(--text-dim)' }}>No answer submitted</em>}
                  </div>
                </div>
              )}

              {rq.solution && (
                <details style={{ marginTop: 10 }}>
                  <summary style={{ fontSize: 12, cursor: 'pointer', color: 'var(--accent)' }}>Solution</summary>
                  <div style={{ marginTop: 6, fontSize: 13 }} dangerouslySetInnerHTML={{ __html: renderStatementHtml(rq.solution) }} />
                  {(rq.solution_figure_urls || []).map(url => (
                    <img key={url} src={url} alt="Solution figure" className="fma-figure" />
                  ))}
                </details>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// A trimmed sibling of FmaTestRunner for the weekly F=ma homework sets: same
// question-by-question feel (multiple choice, review screen before submit),
// but no exam clock, scratch-work upload, flag/eliminate UI, or timed modes —
// this is untimed homework, not a proctored practice sitting. The set always
// ends with one multi-part free-response "discussion" problem, answered as
// plain text and excluded from auto-grading (see submit_fma_homework_attempt).
export default function FmaHomeworkRunner({ studentId, setId, setName, onExit }) {
  const [phase, setPhase] = useState('loading') // 'loading' | 'active' | 'reviewing' | 'result'
  const [err, setErr] = useState(null)

  const [attempt, setAttempt] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({}) // question_id -> { selectedChoice?, freeResponseText? }
  const [index, setIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null) // fetchFmaHomeworkAttemptDetail() once graded

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [qs, existing] = await Promise.all([
          fetchFmaHomeworkQuestions(setId),
          fetchFmaHomeworkAttempts(studentId),
        ])
        if (cancelled) return
        const mine = existing.filter(a => a.set_id === setId)
        const inProgress = mine.find(a => a.status === 'in_progress')
        const graded = mine.find(a => a.status === 'graded' || a.status === 'submitted')

        if (graded) {
          const detail = await fetchFmaHomeworkAttemptDetail(graded.id)
          if (cancelled) return
          setAttempt(detail.attempt)
          setResult(detail)
          setPhase('result')
          return
        }

        let a = inProgress
        let savedAnswers = []
        if (a) {
          savedAnswers = await fetchFmaHomeworkAttemptAnswers(a.id)
        } else {
          a = await createFmaHomeworkAttempt(studentId, setId)
        }
        if (cancelled) return

        const state = {}
        for (const sa of savedAnswers) {
          state[sa.question_id] = { selectedChoice: sa.selected_choice || undefined, freeResponseText: sa.free_response_text || undefined }
        }
        setAttempt(a)
        setQuestions(qs)
        setAnswers(state)
        const firstUnanswered = qs.findIndex(q => !state[q.id])
        setIndex(firstUnanswered === -1 ? 0 : firstUnanswered)
        setPhase('active')
      } catch (e) {
        if (!cancelled) setErr(e.message)
      }
    }
    load()
    return () => { cancelled = true }
  }, [studentId, setId])

  const q = questions[index]
  const answeredCount = Object.keys(answers).length
  const unanswered = questions.filter(x => !answers[x.id])

  async function handleChoose(choice) {
    setAnswers(prev => ({ ...prev, [q.id]: { selectedChoice: choice } }))
    setErr(null)
    try {
      await saveFmaHomeworkAnswer(attempt.id, q.id, { selectedChoice: choice })
    } catch (e) {
      setAnswers(prev => { const next = { ...prev }; delete next[q.id]; return next })
      setErr(`Couldn't save that answer — check your connection and try again. (${e.message})`)
    }
  }

  const [draftText, setDraftText] = useState('')
  useEffect(() => {
    if (q?.question_type === 'free_response') setDraftText(answers[q.id]?.freeResponseText || '')
  }, [q?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSaveText() {
    if (!q) return
    setAnswers(prev => ({ ...prev, [q.id]: { freeResponseText: draftText } }))
    try {
      await saveFmaHomeworkAnswer(attempt.id, q.id, { freeResponseText: draftText })
    } catch (e) {
      setErr(`Couldn't save your answer — check your connection and try again. (${e.message})`)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setErr(null)
    try {
      await submitFmaHomeworkAttempt(attempt.id)
      const detail = await fetchFmaHomeworkAttemptDetail(attempt.id)
      setAttempt(detail.attempt)
      setResult(detail)
      setPhase('result')
    } catch (e) {
      setErr(e.message)
      setSubmitting(false)
    }
  }

  // Leaving keeps everything already answered; an attempt with nothing
  // recorded is discarded so browsing in and back out doesn't leave a stray row.
  const handleExit = useCallback(async () => {
    if (attempt && phase === 'active') {
      try {
        const saved = await fetchFmaHomeworkAttemptAnswers(attempt.id)
        if (saved.length === 0) await deleteFmaHomeworkAttempt(attempt.id)
      } catch { /* a stray row is harmless; never block the exit */ }
    }
    onExit()
  }, [attempt, phase, onExit])

  const html = useMemo(() => renderStatementHtml(q?.statement), [q])

  if (err && phase === 'loading') return <div className="fma-err">{err}</div>
  if (phase === 'loading') return <div style={{ color: 'var(--text-dim)', fontSize: 13, padding: '20px 0' }}>Loading…</div>

  if (phase === 'result' && result) {
    return <FmaHomeworkResult attempt={attempt} result={result} setName={setName} onBack={onExit} />
  }

  if (!q) return null

  const header = (
    <div className="fma-bar">
      <button className="sm" onClick={handleExit}>← Save &amp; exit</button>
      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{setName}</span>
    </div>
  )

  if (phase === 'reviewing') {
    return (
      <div className="fma-runner">
        {header}
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '8px 0 4px' }}>Review your homework</h3>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>Tap any question to go back to it.</div>
        {err && <div className="fma-err">{err}</div>}

        <div className="fma-grid">
          {questions.map((qq, i) => (
            <button
              key={qq.id}
              className={`fma-grid-btn${answers[qq.id] ? ' answered' : ''}`}
              onClick={() => { setIndex(i); setPhase('active') }}
            >
              {qq.question_num}
            </button>
          ))}
        </div>

        <div className="fma-card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, marginBottom: 10 }}>
            <strong>{answeredCount}</strong> of {questions.length} answered
          </div>
          {unanswered.length > 0 && (
            <div style={{ fontSize: 13, marginBottom: 10, color: 'var(--yellow)' }}>
              Unanswered: {unanswered.map(x => x.question_num).join(', ')}
            </div>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>
            Once submitted, this homework set is graded (multiple-choice only) and can't be changed.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="primary" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Submitting…' : 'Submit homework'}
            </button>
            <button className="sm" disabled={submitting} onClick={() => setPhase('active')}>Keep working</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fma-runner">
      {header}

      {err && <div className="fma-err">{err}</div>}

      <div className="fma-qhead">
        <span>Question {q.question_num} of {questions.length} · {answeredCount} answered</span>
      </div>

      <div className="fma-card">
        <div dangerouslySetInnerHTML={{ __html: html }} />
        {(q.figure_urls || []).map(url => (
          <img key={url} src={url} alt="Figure for this question" className="fma-figure" />
        ))}

        {q.question_type === 'mc' ? (
          <div className="fma-choices">
            {CHOICES.map(c => {
              const picked = answers[q.id]?.selectedChoice === c
              return (
                <div key={c} className={`fma-choice${picked ? ' picked' : ''}`}>
                  <label>
                    <input type="radio" name={`q-${q.id}`} checked={picked} onChange={() => handleChoose(c)} />
                    <strong>{c}</strong>
                    {q.choice_figure_urls?.[c] ? (
                      <img src={q.choice_figure_urls[c]} alt={`Option ${c}`} className="fma-choice-figure" />
                    ) : (
                      <span dangerouslySetInnerHTML={{ __html: renderStatementHtml(q.choices?.[c] || '') }} />
                    )}
                  </label>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <textarea
              value={draftText}
              onChange={e => setDraftText(e.target.value)}
              onBlur={handleSaveText}
              placeholder="Write your answer here…"
              rows={10}
              style={{ width: '100%', fontSize: 13, padding: 10, borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', resize: 'vertical' }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
              This one isn't multiple choice — Mark reads it directly, so it isn't auto-graded.
            </div>
          </div>
        )}
      </div>

      <div className="fma-nav">
        <button disabled={index === 0} onClick={() => { if (q.question_type === 'free_response') handleSaveText(); setIndex(i => i - 1) }}>← Previous</button>
        <button className="fma-review-btn" onClick={() => { if (q.question_type === 'free_response') handleSaveText(); setPhase('reviewing') }}>Review &amp; submit</button>
        <button className="primary" disabled={index === questions.length - 1}
          onClick={() => { if (q.question_type === 'free_response') handleSaveText(); setIndex(i => i + 1) }}>Next question →</button>
      </div>
    </div>
  )
}
