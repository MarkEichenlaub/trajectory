import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import katex from 'katex'
import {
  fetchFluencySkills, fetchFluencyStudentSkills, fetchFluencySkillState,
  saveFluencySkillState, recordFluencyAttempt, fetchFluencyAttempts,
} from '../../utils/supabase'
import { generateProblem, gradeAnswer } from '../../fluency/generators'
import { nextLevel, nextDueAt, buildSessionPlan, MAX_LEVEL, TIMED_MODE_MIN_LEVEL } from '../../fluency/spacing'
import { renderStatementHtml } from '../../utils/renderStatement'

function katexHtml(tex) {
  return katex.renderToString(tex, { throwOnError: false, displayMode: false })
}

// Renders a problem as a real fill-in-the-equation line -- static KaTeX
// segments alternating with inline <input>s bound to answer fields -- rather
// than a rendered "?" placeholder (which reads as a 7 at small sizes) plus a
// detached answer box below. `sup` segments are visually raised to sit like
// an exponent right after the preceding text.
function EquationLine({ equation, fields, values, result, setField }) {
  return (
    <div className="fl-eq-row">
      {equation.map((seg, i) => {
        if (seg.tex) {
          return <span key={i} className="fl-eq-tex" dangerouslySetInnerHTML={{ __html: katexHtml(seg.tex) }} />
        }
        const f = fields.find(x => x.key === seg.blank)
        const v = values[seg.blank] ?? ''
        // Grows with the typed value (e.g. converting 9.6 kg to g needs
        // "9600") instead of a fixed width that overflows on a longer answer.
        const minCh = seg.sup ? 3 : 5
        return (
          <input
            key={i}
            type="text" autoComplete="off"
            value={v}
            disabled={!!result}
            onChange={e => setField(seg.blank, e.target.value)}
            className={`fl-eq-blank${seg.sup ? ' sup' : ''}${result ? (result.perField[seg.blank] ? ' ok' : ' bad') : ''}`}
            style={{ width: `${Math.max(minCh, v.length + 1.5)}ch` }}
            aria-label={f?.label}
          />
        )
      })}
    </div>
  )
}

const SESSION_LENGTH = 8

function levelLabel(level) {
  if (level >= MAX_LEVEL) return 'mastered'
  if (level >= TIMED_MODE_MIN_LEVEL) return 'solid'
  if (level >= 1) return 'building'
  return 'new'
}

function MasteryBar({ level }) {
  return (
    <div className="fl-bar" title={`${level}/${MAX_LEVEL}`}>
      {Array.from({ length: MAX_LEVEL }, (_, i) => (
        <span key={i} className={`fl-bar-seg${i < level ? ' on' : ''}`} />
      ))}
    </div>
  )
}

function newSeed() { return Math.floor(Math.random() * 2 ** 31) }

// One drill session: builds the queue once, then walks it one problem at a
// time with immediate right/wrong + diagnostic feedback (per the deliberate-
// practice requirement in the design spec) before moving on.
function Runner({ studentId, mode, queue, skillsById, stateBySkill, onFinish, onExit }) {
  const [index, setIndex] = useState(0)
  const [problem, setProblem] = useState(() => generateProblem(queue[0], (stateBySkill[queue[0]]?.level ?? 0), newSeed()))
  const [values, setValues] = useState({})
  const [result, setResult] = useState(null) // { correct, perField, levelBefore, levelAfter }
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [tally, setTally] = useState({ correct: 0, total: 0 })
  const [levelDeltas, setLevelDeltas] = useState({}) // skillId -> {before, after}
  const [saving, setSaving] = useState(false)
  const formRef = useRef(null)
  const nextRef = useRef(null)

  useEffect(() => {
    if (index >= queue.length) return
    const skillId = queue[index]
    const level = stateBySkill[skillId]?.level ?? 0
    setProblem(generateProblem(skillId, level, newSeed()))
    setValues({})
    setResult(null)
    setStartedAt(Date.now())
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard-only flow: focus the first blank on a fresh problem, then focus
  // Next once it's graded, so answering never needs a mouse -- type, Enter to
  // check, Enter again to advance.
  useEffect(() => {
    if (!result) formRef.current?.querySelector('input')?.focus()
  }, [problem, result])
  useEffect(() => {
    if (result) nextRef.current?.focus()
  }, [result])

  if (index >= queue.length) {
    return (
      <div className="fma-runner">
        <div className="fma-bar">
          <button className="sm" onClick={onExit}>← Fluency Practice</button>
        </div>
        <div className="fma-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Session done</h3>
          <div style={{ fontSize: 13, marginBottom: 14 }}>
            <strong>{tally.correct}</strong> of <strong>{tally.total}</strong> correct
          </div>
          {Object.entries(levelDeltas).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {Object.entries(levelDeltas).map(([sid, { before, after }]) => (
                <div key={sid} style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  {skillsById[sid]?.name || sid}: level {before} → <strong style={{ color: after > before ? 'var(--green)' : after < before ? 'var(--red)' : 'var(--text-dim)' }}>{after}</strong>
                </div>
              ))}
            </div>
          )}
          <button className="primary" onClick={onFinish}>Done</button>
        </div>
      </div>
    )
  }

  const skillId = queue[index]
  const skill = skillsById[skillId]
  const html = renderStatementHtml(problem.promptMd)
  const explanationHtml = result ? renderStatementHtml(problem.explanationMd) : ''
  const nextLabel = index + 1 < queue.length ? 'Next →' : 'Finish'
  const goNext = () => setIndex(i => i + 1)

  function setField(key, v) {
    setValues(prev => ({ ...prev, [key]: v }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (result || saving) return
    const responseMs = Date.now() - startedAt
    const graded = gradeAnswer(problem, values)
    const before = stateBySkill[skillId]?.level ?? 0
    const after = nextLevel({ level: before, correct: graded.correct, mode, responseMs, timeTargetSec: problem.timeTargetSec })

    setSaving(true)
    try {
      const prevState = stateBySkill[skillId] || {}
      const streak = graded.correct ? (prevState.streak || 0) + 1 : 0
      stateBySkill[skillId] = {
        ...prevState,
        level: after,
        streak,
        attempt_count: (prevState.attempt_count || 0) + 1,
        correct_count: (prevState.correct_count || 0) + (graded.correct ? 1 : 0),
        last_attempt_at: new Date().toISOString(),
        next_due_at: nextDueAt(after),
      }
      await saveFluencySkillState(studentId, skillId, {
        level: after, streak,
        attempt_count: stateBySkill[skillId].attempt_count,
        correct_count: stateBySkill[skillId].correct_count,
        last_attempt_at: stateBySkill[skillId].last_attempt_at,
        next_due_at: stateBySkill[skillId].next_due_at,
      })
      await recordFluencyAttempt({
        student_id: studentId, skill_id: skillId, mode, level: problem.level, seed: problem.seed,
        submitted: values, is_correct: graded.correct, response_ms: responseMs,
        level_before: before, level_after: after,
      })
    } catch { /* leveling still shows locally even if the write is flaky */ }
    setSaving(false)

    setResult({ ...graded, levelBefore: before, levelAfter: after })
    setTally(t => ({ correct: t.correct + (graded.correct ? 1 : 0), total: t.total + 1 }))
    setLevelDeltas(d => ({ ...d, [skillId]: { before: d[skillId]?.before ?? before, after } }))
  }

  return (
    <div className="fma-runner">
      <div className="fma-bar">
        <button className="sm" onClick={onExit}>← Save &amp; exit</button>
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{index + 1} of {queue.length}</span>
      </div>
      <div className="fl-progress"><div className="fl-progress-fill" style={{ width: `${(index / queue.length) * 100}%` }} /></div>

      <div className="fma-card">
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>
          {skill?.name || skillId} · level {problem.level}
        </div>
        <div className="fl-prompt" dangerouslySetInnerHTML={{ __html: html }} />

        <form ref={formRef} onSubmit={handleSubmit} style={{ marginTop: 10 }}>
          {problem.equation ? (
            <EquationLine equation={problem.equation} fields={problem.fields} values={values} result={result} setField={setField} />
          ) : (
            <div className="fl-fields">
              {problem.fields.map(f => (
                <label key={f.key} className="fl-field">
                  <span>{f.label}</span>
                  <input
                    type="text" autoComplete="off"
                    value={values[f.key] ?? ''}
                    disabled={!!result}
                    onChange={e => setField(f.key, e.target.value)}
                    className={result ? (result.perField[f.key] ? 'fl-input ok' : 'fl-input bad') : 'fl-input'}
                  />
                </label>
              ))}
            </div>
          )}
          {!result && (
            <button className="primary" type="submit" disabled={saving || problem.fields.some(f => !values[f.key])} style={{ marginTop: 16 }}>
              Check
            </button>
          )}
        </form>

        {result && (
          <div className={`fl-feedback${result.correct ? ' ok' : ' bad'}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>{result.correct ? 'Correct' : 'Not quite'}</div>
              <button ref={nextRef} className="primary sm" onClick={goNext}>{nextLabel}</button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: explanationHtml }} />
          </div>
        )}
      </div>

      {/* Sticky so Next is always reachable without scrolling past a long
          explanation — same fix FmaTestRunner uses for its nav row. */}
      {result && (
        <div className="fl-next-bar">
          <button className="primary" onClick={goNext}>{nextLabel}</button>
        </div>
      )}
    </div>
  )
}

function History({ attempts, skillsById, onBack }) {
  return (
    <div style={{ maxWidth: 720 }}>
      <button className="sm" style={{ marginBottom: 16 }} onClick={onBack}>← Fluency Practice</button>
      <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Practice history</h3>
      {attempts.length === 0 ? (
        <div className="empty-state">No attempts yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {attempts.map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
              padding: '8px 12px', borderRadius: 'var(--radius)',
              background: 'var(--surface)', border: '1px solid var(--border)',
            }}>
              <span style={{ color: a.is_correct ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                {a.is_correct ? '✓' : '✕'}
              </span>
              <span style={{ flex: 1 }}>{a.fluency_skills?.name || a.skill_id}</span>
              <span style={{ color: 'var(--text-dim)' }}>L{a.level_before}→{a.level_after}</span>
              <span style={{ color: 'var(--text-dim)' }}>{a.mode}</span>
              {a.response_ms != null && <span style={{ color: 'var(--text-dim)' }}>{(a.response_ms / 1000).toFixed(1)}s</span>}
              <span style={{ color: 'var(--text-dim)' }}>
                {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FluencyPractice({ studentId, isPreview }) {
  const [view, setView] = useState('home') // 'home' | 'untimed' | 'timed' | 'history'
  const [skills, setSkills] = useState([])
  const [studentSkills, setStudentSkills] = useState([])
  const [state, setState] = useState({})
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [queue, setQueue] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const [sk, ss, st, at] = await Promise.all([
        fetchFluencySkills(), fetchFluencyStudentSkills(studentId),
        fetchFluencySkillState(studentId), fetchFluencyAttempts(studentId),
      ])
      setSkills(sk)
      setStudentSkills(ss)
      setState(Object.fromEntries(st.map(s => [s.skill_id, s])))
      setAttempts(at)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => { load() }, [load])

  const skillsById = useMemo(() => Object.fromEntries(skills.map(s => [s.id, s])), [skills])
  const enabledIds = useMemo(
    () => studentSkills.filter(s => s.enabled).map(s => s.skill_id).filter(id => skillsById[id]),
    [studentSkills, skillsById]
  )

  const anyTimedEligible = enabledIds.some(id => (state[id]?.level ?? 0) >= TIMED_MODE_MIN_LEVEL)

  function startSession(mode) {
    const plan = buildSessionPlan({ enabledSkillIds: enabledIds, stateBySkill: state, targetCount: SESSION_LENGTH, mode })
    if (plan.length === 0) return
    setQueue(plan)
    setView(mode)
  }

  function finishSession() {
    setQueue(null)
    setView('home')
    load()
  }

  if (loading) return <div style={{ color: 'var(--text-dim)', fontSize: 13, padding: '20px 0' }}>Loading…</div>
  if (err) return <div style={{ fontSize: 12, color: 'var(--red)' }}>{err}</div>

  if ((view === 'untimed' || view === 'timed') && queue) {
    return (
      <Runner
        studentId={studentId} mode={view} queue={queue}
        skillsById={skillsById} stateBySkill={state}
        onFinish={finishSession} onExit={finishSession}
      />
    )
  }
  if (view === 'history') {
    return <History attempts={attempts} skillsById={skillsById} onBack={() => setView('home')} />
  }

  const today = new Date().toDateString()
  const doneToday = attempts.filter(a => new Date(a.created_at).toDateString() === today).length

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>Fluency Practice</h3>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          Short, mixed drills on the algebra moves that should feel automatic on the F=ma.
          {doneToday > 0 && ` · ${doneToday} done today`}
        </div>
      </div>

      {enabledIds.length === 0 ? (
        <div className="empty-state">No skills are in rotation yet — Mark adds these as they come up in sessions.</div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="primary" disabled={isPreview} onClick={() => startSession('untimed')}>
              Start practice (~5 min)
            </button>
            <button className="sm" disabled={isPreview || !anyTimedEligible} title={!anyTimedEligible ? 'Get a skill to level 3+ first' : ''} onClick={() => startSession('timed')}>
              Timed drill
            </button>
            <button className="sm" onClick={() => setView('history')}>History</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {enabledIds.map(id => {
              const skill = skillsById[id]
              const level = state[id]?.level ?? 0
              const attemptCount = state[id]?.attempt_count ?? 0
              return (
                <div key={id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{skill.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      {levelLabel(level)} · {attemptCount} attempt{attemptCount === 1 ? '' : 's'}
                    </div>
                  </div>
                  <MasteryBar level={level} />
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
