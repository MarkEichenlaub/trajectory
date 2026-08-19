import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  fetchFmaExams, fetchFmaQuestions, createFmaAttempt, fetchFmaAttempts, fetchFmaAttemptDetail,
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

function FmaChart({ attempts, onSelect }) {
  const scored = attempts.filter(a => a.score != null && (a.submitted_at || a.started_at))
  const width = 640, height = 230
  const padL = 34, padR = 16, padT = 12, padB = 26
  const plotW = width - padL - padR, plotH = height - padT - padB

  const times = scored.map(a => new Date(a.submitted_at || a.started_at).getTime())
  const minT = times.length ? Math.min(...times) : 0
  const maxT = times.length ? Math.max(...times) : 0
  const xScale = t => times.length <= 1 ? padL + plotW / 2 : padL + ((t - minT) / (maxT - minT || 1)) * plotW
  const yScale = s => padT + (1 - s / MAX_SCORE) * plotH

  const ticks = [0, 5, 10, 15, 20, 25]

  if (scored.length === 0) {
    return <div className="empty-state">No graded practice tests yet — take one to start seeing your progress here.</div>
  }

  return (
    <svg width={width} height={height} style={{ maxWidth: '100%' }}>
      {ticks.map(t => (
        <g key={t}>
          <line x1={padL} x2={width - padR} y1={yScale(t)} y2={yScale(t)} stroke="var(--border)" strokeWidth={1} />
          <text x={padL - 8} y={yScale(t) + 4} fontSize={10} fill="var(--text-dim)" textAnchor="end">{t}</text>
        </g>
      ))}
      <rect x={padL} y={yScale(BAND_HIGH)} width={plotW} height={yScale(BAND_LOW) - yScale(BAND_HIGH)} fill="var(--accent)" opacity={0.12} />
      <text x={width - padR} y={yScale(BAND_HIGH) - 3} fontSize={9} fill="var(--accent)" textAnchor="end">~USAPhO band</text>
      {scored.map(a => {
        const t = new Date(a.submitted_at || a.started_at).getTime()
        const date = new Date(a.submitted_at || a.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        return (
          <circle
            key={a.id}
            cx={xScale(t)} cy={yScale(a.score)} r={6}
            fill="var(--accent)" stroke="var(--surface)" strokeWidth={1.5}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect(a.id)}
          >
            <title>{`${a.handouts?.name || a.exam_id}: ${a.score}/${MAX_SCORE} (${date})`}</title>
          </circle>
        )
      })}
    </svg>
  )
}

function TagBreakdown({ attempts }) {
  const [breakdown, setBreakdown] = useState(null)
  const [loading, setLoading] = useState(true)

  const attemptIds = useMemo(
    () => attempts.filter(a => a.status === 'graded' && a.mode !== 'score_only').map(a => a.id).sort().join(','),
    [attempts]
  )

  useEffect(() => {
    const ids = attemptIds ? attemptIds.split(',') : []
    if (ids.length === 0) { setBreakdown({}); setLoading(false); return }
    setLoading(true)
    Promise.all(ids.map(id => fetchFmaAttemptDetail(id)))
      .then(details => {
        const map = {}
        for (const { questions, answerByQuestion } of details) {
          for (const q of questions) {
            const ans = answerByQuestion.get(q.id)
            if (!ans || ans.selected_choice == null) continue
            for (const tag of q.tags || []) {
              if (!map[tag]) map[tag] = { correct: 0, total: 0 }
              map[tag].total++
              if (ans.is_correct) map[tag].correct++
            }
          }
        }
        setBreakdown(map)
      })
      .finally(() => setLoading(false))
  }, [attemptIds])

  if (loading) return <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>Loading…</div>
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

export default function FmaProgress({ studentId, isPreview }) {
  const [view, setView] = useState('list') // 'list' | 'live' | 'batch' | 'score' | 'detail'
  const [exams, setExams] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const [selectedExamId, setSelectedExamId] = useState('')
  const [selectedMode, setSelectedMode] = useState('live')
  const [starting, setStarting] = useState(false)

  const [activeAttempt, setActiveAttempt] = useState(null)
  const [activeQuestions, setActiveQuestions] = useState([])
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    Promise.all([fetchFmaExams(), fetchFmaAttempts(studentId)])
      .then(([e, a]) => { setExams(e); setAttempts(a); if (e[0]) setSelectedExamId(e[0].id) })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [studentId])

  const refreshAttempts = useCallback(async () => {
    const a = await fetchFmaAttempts(studentId)
    setAttempts(a)
  }, [studentId])

  async function handleStart() {
    if (!selectedExamId || isPreview) return
    setStarting(true)
    setErr(null)
    try {
      const attempt = await createFmaAttempt(studentId, selectedExamId, selectedMode)
      if (selectedMode === 'score_only') {
        setActiveAttempt(attempt)
        setView('score')
      } else {
        const questions = await fetchFmaQuestions(selectedExamId)
        setActiveAttempt(attempt)
        setActiveQuestions(questions)
        setView(selectedMode === 'live' ? 'live' : 'batch')
      }
    } catch (e) {
      setErr(e.message)
    } finally {
      setStarting(false)
    }
  }

  async function handleFinished(attemptId) {
    await refreshAttempts()
    const d = await fetchFmaAttemptDetail(attemptId)
    setDetail(d)
    setActiveAttempt(null)
    setActiveQuestions([])
    setView('detail')
  }

  async function handleViewAttempt(attemptId) {
    try {
      const d = await fetchFmaAttemptDetail(attemptId)
      setDetail(d)
      setView('detail')
    } catch (e) {
      setErr(e.message)
    }
  }

  function handleBack() {
    setView('list')
    setActiveAttempt(null)
    setActiveQuestions([])
    setDetail(null)
  }

  if (loading) return <div style={{ color: 'var(--text-dim)', fontSize: 13, padding: '20px 0' }}>Loading…</div>

  if (view === 'live') {
    return <FmaTestRunner studentId={studentId} attempt={activeAttempt} questions={activeQuestions} onDone={() => handleFinished(activeAttempt.id)} onCancel={handleBack} />
  }
  if (view === 'batch') {
    return <FmaBatchEntry studentId={studentId} attempt={activeAttempt} questions={activeQuestions} onDone={() => handleFinished(activeAttempt.id)} onCancel={handleBack} />
  }
  if (view === 'score') {
    return <FmaScoreOnly attempt={activeAttempt} onDone={() => handleFinished(activeAttempt.id)} onCancel={handleBack} />
  }
  if (view === 'detail' && detail) {
    return <FmaAttemptDetail detail={detail} onBack={handleBack} />
  }

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {err && <div style={{ fontSize: 12, color: 'var(--red)' }}>{err}</div>}

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
              <button className="primary" disabled={starting} onClick={handleStart}>
                {starting ? 'Starting…' : 'Start'}
              </button>
            </>
          )}
        </div>
      )}

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Past attempts</h3>
        {attempts.length === 0 ? (
          <div className="empty-state">No practice tests taken yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {attempts.map(a => (
              <div
                key={a.id}
                onClick={() => handleViewAttempt(a.id)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              >
                <div style={{ flex: 1, fontSize: 13 }}>{a.handouts?.name || a.exam_id}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{a.mode.replace('_', ' ')}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  {a.status === 'graded' ? `${a.score}/${MAX_SCORE}` : a.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
