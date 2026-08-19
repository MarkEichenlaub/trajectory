import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  fetchFmaExams, fetchFmaQuestions, createFmaAttempt, fetchFmaAttempts, fetchFmaAttemptDetail,
  fetchFmaAttemptAnswers, deleteFmaAttempt,
} from '../../utils/supabase'
import FmaTestRunner from './FmaTestRunner'
import FmaBatchEntry from './FmaBatchEntry'
import FmaScoreOnly from './FmaScoreOnly'
import FmaAttemptDetail from './FmaAttemptDetail'

// Rough USAPhO-qualifying score band, shaded on the chart as a reference.
const BAND_LOW = 15
const BAND_HIGH = 18
const MAX_SCORE = 25

const MODES = [
  { key: 'live', label: 'Live entry', desc: 'Answer question-by-question in the portal as you work.' },
  { key: 'paper_first', label: 'Paper first', desc: 'Work the whole test on paper, then enter all 25 answers afterward.' },
  { key: 'score_only', label: 'Score only', desc: "Just record your final score — no per-question answers." },
]

const MODE_LABEL = { live: 'live entry', paper_first: 'paper first', score_only: 'score only' }

export function FmaChart({ attempts, onSelect }) {
  const scored = attempts
    .filter(a => a.score != null && (a.submitted_at || a.started_at))
    .sort((a, b) => new Date(a.submitted_at || a.started_at) - new Date(b.submitted_at || b.started_at))
  const width = 640, height = 230
  const padL = 34, padR = 16, padT = 12, padB = 26
  const plotW = width - padL - padR, plotH = height - padT - padB

  const times = scored.map(a => new Date(a.submitted_at || a.started_at).getTime())
  const minT = times.length ? Math.min(...times) : 0
  const maxT = times.length ? Math.max(...times) : 0
  // When every attempt shares a timestamp the time span is 0, which used to pile
  // every point on the left edge; fall back to even spacing by index.
  const spread = maxT - minT
  const xAt = i => {
    if (scored.length <= 1) return padL + plotW / 2
    if (spread === 0) return padL + (i / (scored.length - 1)) * plotW
    return padL + ((times[i] - minT) / spread) * plotW
  }
  // Clamp so a bad/forged score can't render off-canvas and blank the chart.
  const yScale = s => padT + (1 - Math.min(Math.max(s, 0), MAX_SCORE) / MAX_SCORE) * plotH

  const ticks = [0, 5, 10, 15, 20, 25]
  const fmtDate = t => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (scored.length === 0) {
    return <div className="empty-state">No graded practice tests yet — take one to start seeing your progress here.</div>
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: width, display: 'block' }} role="img" aria-label="F=ma scores over time">
      {ticks.map(t => (
        <g key={t}>
          <line x1={padL} x2={width - padR} y1={yScale(t)} y2={yScale(t)} stroke="var(--border)" strokeWidth={1} />
          <text x={padL - 8} y={yScale(t) + 4} fontSize={10} fill="var(--text-dim)" textAnchor="end">{t}</text>
        </g>
      ))}
      <rect x={padL} y={yScale(BAND_HIGH)} width={plotW} height={yScale(BAND_LOW) - yScale(BAND_HIGH)} fill="var(--accent)" opacity={0.12} />
      <text x={width - padR} y={yScale(BAND_HIGH) - 3} fontSize={9} fill="var(--accent)" textAnchor="end">~USAPhO band</text>

      {scored.length > 1 && (
        <polyline
          points={scored.map((a, i) => `${xAt(i)},${yScale(a.score)}`).join(' ')}
          fill="none" stroke="var(--accent)" strokeWidth={1.5} opacity={0.45}
        />
      )}

      {/* Dates on the axis: the tooltip alone is unreachable on a touch screen. */}
      <text x={padL} y={height - 8} fontSize={9} fill="var(--text-dim)" textAnchor="start">{fmtDate(minT)}</text>
      {spread > 0 && <text x={width - padR} y={height - 8} fontSize={9} fill="var(--text-dim)" textAnchor="end">{fmtDate(maxT)}</text>}

      {scored.map((a, i) => (
        <circle
          key={a.id}
          cx={xAt(i)} cy={yScale(a.score)} r={6}
          fill="var(--accent)" stroke="var(--surface)" strokeWidth={1.5}
          style={{ cursor: 'pointer' }}
          onClick={() => onSelect(a.id)}
        >
          <title>{`${a.handouts?.name || a.exam_id}: ${a.score}/${MAX_SCORE} (${fmtDate(times[i])})`}</title>
        </circle>
      ))}
    </svg>
  )
}

export function TagBreakdown({ attempts }) {
  const [breakdown, setBreakdown] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const attemptIds = useMemo(
    () => attempts.filter(a => a.status === 'graded' && a.mode !== 'score_only').map(a => a.id).sort().join(','),
    [attempts]
  )

  useEffect(() => {
    const ids = attemptIds ? attemptIds.split(',') : []
    if (ids.length === 0) { setBreakdown({}); setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setErr(null)
    Promise.all(ids.map(id => fetchFmaAttemptDetail(id)))
      .then(details => {
        if (cancelled) return
        const map = {}
        for (const { questions, answerByQuestion } of details) {
          for (const q of questions) {
            const ans = answerByQuestion.get(q.id)
            // Every question on a submitted test counts. Skipping the unanswered
            // ones scored a test where 4 of 25 were attempted as 4/4 -- a clean
            // sweep on every tag -- when the other 21 were in fact all missed.
            // There's no partial credit on the F=ma, so a blank is a miss.
            for (const tag of q.tags || []) {
              if (!map[tag]) map[tag] = { correct: 0, total: 0 }
              map[tag].total++
              if (ans?.selected_choice && ans.is_correct) map[tag].correct++
            }
          }
        }
        setBreakdown(map)
      })
      // Without this a failed fetch rendered the cheerful "nothing yet" state.
      .catch(e => { if (!cancelled) setErr(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [attemptIds])

  if (loading) return <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>Loading…</div>
  if (err) return <div style={{ fontSize: 12, color: 'var(--red)' }}>Couldn't load the tag breakdown: {err}</div>
  const tags = Object.keys(breakdown || {})
  if (tags.length === 0) return <div className="empty-state">No answered questions yet to break down by tag.</div>

  const sorted = tags
    .map(tag => ({ tag, ...breakdown[tag], pct: breakdown[tag].correct / breakdown[tag].total }))
    .sort((a, b) => a.pct - b.pct)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {sorted.map(({ tag, correct, total, pct }) => (
        <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 160, fontSize: 12, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tag}</div>
          <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${pct * 100}%`, height: '100%', background: pct < 0.5 ? 'var(--red)' : pct < 0.8 ? 'var(--yellow)' : 'var(--green)' }} />
          </div>
          <div style={{ width: 48, fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>{correct}/{total}</div>
        </div>
      ))}
    </div>
  )
}

export default function FmaProgress({ studentId, isPreview, assignedExamIds = [], preselectExamId = null }) {
  const [view, setView] = useState('list') // 'list' | 'live' | 'batch' | 'score' | 'detail'
  const [exams, setExams] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const [selectedExamId, setSelectedExamId] = useState('')
  const [selectedMode, setSelectedMode] = useState('live')
  const [starting, setStarting] = useState(false)
  const [busyAttemptId, setBusyAttemptId] = useState(null)

  const [activeAttempt, setActiveAttempt] = useState(null)
  const [activeQuestions, setActiveQuestions] = useState([])
  const [activeState, setActiveState] = useState({ answers: {}, flags: {}, eliminated: {} })
  const [detail, setDetail] = useState(null)

  // Assignments are the tutor saying "sit this one", so an assigned exam wins
  // over the newest-first default.
  const assignedKey = assignedExamIds.join(',')
  useEffect(() => {
    Promise.all([fetchFmaExams(), fetchFmaAttempts(studentId)])
      .then(([e, a]) => {
        setExams(e)
        setAttempts(a)
        // "Take Test" on a specific assignment beats the generic assigned/newest
        // fallback, so the picker opens on the exam that was clicked.
        const wanted = e.find(x => x.id === preselectExamId)
        const assigned = e.find(x => assignedExamIds.includes(x.id))
        const pick = wanted || assigned || e[0]
        if (pick) setSelectedExamId(pick.id)
      })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [studentId, assignedKey, preselectExamId])

  const refreshAttempts = useCallback(async () => {
    setAttempts(await fetchFmaAttempts(studentId))
  }, [studentId])

  const inProgress = attempts.filter(a => a.status === 'in_progress')
  const finished = attempts.filter(a => a.status !== 'in_progress')
  const examById = useMemo(() => Object.fromEntries(exams.map(e => [e.id, e])), [exams])

  function enterAttempt(attempt, questions, state) {
    setActiveAttempt(attempt)
    setActiveQuestions(questions)
    setActiveState(state)
    setView(attempt.mode === 'live' ? 'live' : attempt.mode === 'paper_first' ? 'batch' : 'score')
  }

  const EMPTY_STATE = { answers: {}, flags: {}, eliminated: {} }

  async function handleStart() {
    if (!selectedExamId || isPreview) return
    setStarting(true)
    setErr(null)
    try {
      const attempt = await createFmaAttempt(studentId, selectedExamId, selectedMode)
      const questions = selectedMode === 'score_only' ? [] : await fetchFmaQuestions(selectedExamId)
      enterAttempt(attempt, questions, EMPTY_STATE)
    } catch (e) {
      setErr(e.message)
    } finally {
      setStarting(false)
    }
  }

  // Picks an unfinished attempt back up with its saved answers restored.
  async function handleResume(attempt) {
    setBusyAttemptId(attempt.id)
    setErr(null)
    try {
      const [questions, saved] = await Promise.all([
        attempt.mode === 'score_only' ? Promise.resolve([]) : fetchFmaQuestions(attempt.exam_id),
        fetchFmaAttemptAnswers(attempt.id),
      ])
      // Flags and crossed-out choices are restored alongside the answers, so a
      // resumed test looks exactly as it did when the student stepped away.
      const state = { answers: {}, flags: {}, eliminated: {} }
      for (const a of saved) {
        if (a.selected_choice) state.answers[a.question_id] = a.selected_choice
        if (a.flagged) state.flags[a.question_id] = true
        if (a.eliminated_choices?.length) state.eliminated[a.question_id] = a.eliminated_choices
      }
      enterAttempt(attempt, questions, state)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusyAttemptId(null)
    }
  }

  async function handleFinished(attemptId) {
    try {
      await refreshAttempts()
      setDetail(await fetchFmaAttemptDetail(attemptId))
      setActiveAttempt(null)
      setActiveQuestions([])
      setActiveState(EMPTY_STATE)
      setView('detail')
    } catch (e) {
      // The submit itself succeeded; don't strand the student on a dead screen.
      setErr(`Your test was submitted, but the results view failed to load: ${e.message}`)
      setActiveAttempt(null)
      setView('list')
      refreshAttempts().catch(() => {})
    }
  }

  async function handleViewAttempt(attemptId) {
    try {
      setDetail(await fetchFmaAttemptDetail(attemptId))
      setView('detail')
    } catch (e) {
      setErr(e.message)
    }
  }

  // Leaving a test keeps everything already answered. An attempt with nothing
  // recorded is discarded instead, so browsing the modes doesn't leave a trail
  // of empty in_progress rows.
  async function handleExitAttempt() {
    const attempt = activeAttempt
    setView('list')
    setActiveAttempt(null)
    setActiveQuestions([])
    setActiveState(EMPTY_STATE)
    setDetail(null)
    if (attempt) {
      try {
        const saved = await fetchFmaAttemptAnswers(attempt.id)
        if (saved.length === 0) await deleteFmaAttempt(attempt.id)
      } catch { /* leaving a stray row is harmless; never block the exit */ }
      refreshAttempts().catch(() => {})
    }
  }

  function handleBack() {
    setView('list')
    setDetail(null)
  }

  if (loading) return <div style={{ color: 'var(--text-dim)', fontSize: 13, padding: '20px 0' }}>Loading…</div>

  if (view === 'live') {
    return <FmaTestRunner studentId={studentId} attempt={activeAttempt} questions={activeQuestions}
      initialAnswers={activeState.answers} initialFlags={activeState.flags} initialEliminated={activeState.eliminated}
      onDone={() => handleFinished(activeAttempt.id)} onCancel={handleExitAttempt} />
  }
  if (view === 'batch') {
    return <FmaBatchEntry studentId={studentId} attempt={activeAttempt} questions={activeQuestions} initialAnswers={activeState.answers} examPdfUrl={examById[activeAttempt?.exam_id]?.pdf_url} onDone={() => handleFinished(activeAttempt.id)} onCancel={handleExitAttempt} />
  }
  if (view === 'score') {
    return <FmaScoreOnly attempt={activeAttempt} onDone={() => handleFinished(activeAttempt.id)} onCancel={handleExitAttempt} />
  }
  if (view === 'detail' && detail) {
    return <FmaAttemptDetail detail={detail} onBack={handleBack} />
  }

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {err && <div style={{ fontSize: 12, color: 'var(--red)' }}>{err}</div>}

      {!isPreview && inProgress.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>Unfinished test{inProgress.length === 1 ? '' : 's'}</h3>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
            Pick up where you left off — your saved answers are still there.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {inProgress.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, fontSize: 13 }}>
                  {a.handouts?.name || a.exam_id}
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    {' · '}{MODE_LABEL[a.mode] || a.mode}
                    {' · started '}{new Date(a.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <button className="primary sm" disabled={busyAttemptId === a.id} onClick={() => handleResume(a)}>
                  {busyAttemptId === a.id ? 'Opening…' : 'Continue'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>F=ma Progress</h3>
        <FmaChart attempts={attempts} onSelect={handleViewAttempt} />
      </div>

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Performance by tag</h3>
        <TagBreakdown attempts={attempts} />
      </div>

      {!isPreview && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Take a practice test</h3>
          {exams.length === 0 ? (
            <div className="empty-state">No digitized F=ma exams available yet.</div>
          ) : (
            <>
              <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} style={{ marginBottom: 12 }}>
                {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
              </select>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {MODES.map(m => (
                  <label key={m.key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
                    <input type="radio" name="fma-mode" checked={selectedMode === m.key} onChange={() => setSelectedMode(m.key)} style={{ marginTop: 3 }} />
                    <span>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{m.desc}</div>
                    </span>
                  </label>
                ))}
              </div>
              {selectedMode !== 'live' && examById[selectedExamId]?.pdf_url && (
                <div style={{ fontSize: 12, marginBottom: 12 }}>
                  <a href={examById[selectedExamId].pdf_url} target="_blank" rel="noreferrer">Open the exam PDF ↗</a>
                </div>
              )}
              <button className="primary" disabled={starting} onClick={handleStart}>
                {starting ? 'Starting…' : 'Start'}
              </button>
            </>
          )}
        </div>
      )}

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Past attempts</h3>
        {finished.length === 0 ? (
          <div className="empty-state">No completed practice tests yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {finished.map(a => (
              <div
                key={a.id}
                onClick={() => handleViewAttempt(a.id)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              >
                <div style={{ flex: 1, fontSize: 13 }}>{a.handouts?.name || a.exam_id}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{MODE_LABEL[a.mode] || a.mode}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  {a.score != null ? `${a.score}/${MAX_SCORE}` : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
