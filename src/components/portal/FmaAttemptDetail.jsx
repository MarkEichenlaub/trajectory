import { useRef, useState } from 'react'
import { renderStatementHtml } from '../../utils/renderStatement'
import ScratchWorkLink from './ScratchWorkLink'

const CHOICES = ['A', 'B', 'C', 'D', 'E']

function formatSeconds(s) {
  if (!s || s < 1) return null
  const m = Math.floor(s / 60), sec = Math.round(s % 60)
  return m > 0 ? `~${m}m ${sec}s` : `~${sec}s`
}

export default function FmaAttemptDetail({ detail, onBack }) {
  const { attempt, questions, answerByQuestion, secondsByQuestion } = detail
  const questionRefs = useRef({})

  // Solutions are collapsed by default and expand in place, so a student who
  // wants to re-attempt a question they got wrong isn't shown the answer first.
  const [openSolutions, setOpenSolutions] = useState(() => new Set())
  function toggleSolution(qid) {
    setOpenSolutions(prev => {
      const next = new Set(prev)
      next.has(qid) ? next.delete(qid) : next.add(qid)
      return next
    })
  }

  // An ungraded attempt must not reveal the key: correct_choice comes back null
  // from the server until the attempt is graded, and we hide the verdict UI too.
  const graded = attempt.status === 'graded'
  const outOf = questions.length || 25

  // A skipped question is a question you got wrong -- there's no partial credit
  // on the F=ma -- so it belongs in the same bucket as a wrong answer.
  const verdicts = questions.map(q => {
    const ans = answerByQuestion.get(q.id)
    if (!ans?.selected_choice) return 'unanswered'
    return ans.is_correct ? 'correct' : 'incorrect'
  })
  const nCorrect = verdicts.filter(v => v === 'correct').length
  const nIncorrect = verdicts.filter(v => v === 'incorrect').length
  const nUnanswered = verdicts.filter(v => v === 'unanswered').length

  const date = new Date(attempt.submitted_at || attempt.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  function jumpTo(qid) {
    // Instant, not smooth: smooth scrolling is a no-op inside this scroll
    // container (and whenever the OS asks for reduced motion), which made
    // clicking a question number look like nothing happened.
    questionRefs.current[qid]?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <button className="sm" onClick={onBack} style={{ marginBottom: 16 }}>← Back</button>

      <div className="fma-summary">
        <div className="fma-summary-score">{attempt.score != null ? `${attempt.score}/${outOf}` : '—'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{attempt.handouts?.name || attempt.exam_id}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{date} · {attempt.mode.replace('_', ' ')}</div>
          {graded && attempt.mode !== 'score_only' && (
            <div className="fma-summary-counts">
              <span><b className="ok">{nCorrect}</b> correct</span>
              <span><b className="bad">{nIncorrect}</b> wrong</span>
              <span><b className="bad">{nUnanswered}</b> skipped</span>
            </div>
          )}
        </div>
        <ScratchWorkLink path={attempt.scratch_work_url} />
      </div>

      {graded && attempt.mode !== 'score_only' && (
        <div style={{ marginBottom: 20 }}>
          <div className="fma-grid">
            {questions.map((q, i) => (
              <button
                key={q.id}
                className={`fma-grid-btn result-${verdicts[i]}`}
                onClick={() => jumpTo(q.id)}
                aria-label={`Question ${q.question_num}, ${verdicts[i]}`}
              >
                {q.question_num}
              </button>
            ))}
          </div>
          <div className="fma-legend">
            <span><i className="swatch result-correct" /> correct</span>
            <span><i className="swatch result-incorrect" /> wrong</span>
            <span><i className="swatch result-unanswered" /> skipped</span>
          </div>
        </div>
      )}

      {attempt.mode === 'score_only' ? (
        <div className="empty-state">Score-only attempt — no per-question answers recorded.</div>
      ) : !graded ? (
        <div className="empty-state">
          This attempt is still in progress — answers and the answer key stay hidden until you submit it.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {questions.map((q, i) => {
            const ans = answerByQuestion.get(q.id)
            const html = renderStatementHtml(q.statement)
            const verdict = verdicts[i]
            const alsoAccepted = q.also_accepted || []
            return (
              <div
                key={q.id}
                ref={el => { questionRefs.current[q.id] = el }}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, scrollMarginTop: 12 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                    Question {q.question_num}
                    {formatSeconds(secondsByQuestion?.get(q.id)) && <span style={{ marginLeft: 8 }}>· {formatSeconds(secondsByQuestion.get(q.id))} spent</span>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: verdict === 'correct' ? 'var(--green)' : verdict === 'incorrect' ? 'var(--red)' : 'var(--yellow)' }}>
                    {ans?.selected_choice ? `Your answer: ${ans.selected_choice}` : 'Not answered'}
                    {' · Correct: '}{q.correct_choice}
                    {alsoAccepted.length > 0 && (
                      <span style={{ fontWeight: 500, color: 'var(--text-dim)' }}>
                        {alsoAccepted.length === 4
                          ? ' · every answer credited'
                          : ` · ${alsoAccepted.join(', ')} also credited`}
                      </span>
                    )}
                  </div>
                </div>
                {(q.tags || []).length > 0 && (
                  <div className="tag-list" style={{ marginBottom: 8 }}>
                    {q.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                  </div>
                )}
                <div dangerouslySetInnerHTML={{ __html: html }} />
                {(q.figure_urls || []).map(url => (
                  <img key={url} src={url} alt="" loading="lazy" className="fma-figure" />
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                  {CHOICES.map(c => {
                    const isKey = c === q.correct_choice
                    // AAPT credited more than one option on a handful of
                    // questions. Those earn the mark, so they must not be shown
                    // in red just because they aren't the canonical answer.
                    const isAlso = alsoAccepted.includes(c)
                    const earnsCredit = isKey || isAlso
                    const isPicked = c === ans?.selected_choice
                    return (
                      <div key={c} className={`fma-review-choice${earnsCredit ? ' key' : ''}${isPicked && !earnsCredit ? ' picked-wrong' : ''}`}>
                        <strong>{c}</strong>{' '}
                        {q.choice_figure_urls?.[c] ? (
                          <img src={q.choice_figure_urls[c]} alt={`Option ${c}`} className="fma-choice-figure" loading="lazy" />
                        ) : (
                          <span dangerouslySetInnerHTML={{ __html: renderStatementHtml(q.choices?.[c] || '') }} />
                        )}
                        {isKey && <span className="fma-tag ok">correct answer</span>}
                        {isAlso && <span className="fma-tag ok">also accepted</span>}
                        {isPicked && !earnsCredit && <span className="fma-tag bad">your answer</span>}
                      </div>
                    )
                  })}
                </div>
                {ans?.scratch_work_url && (
                  <ScratchWorkLink path={ans.scratch_work_url} label="Scratch work for this question ↗"
                    style={{ marginTop: 8, display: 'inline-block' }} />
                )}
                {q.solution && (
                  <div className="fma-solution-block">
                    <button
                      type="button"
                      className="fma-solution-toggle"
                      onClick={() => toggleSolution(q.id)}
                      aria-expanded={openSolutions.has(q.id)}
                      aria-controls={`solution-${q.id}`}
                    >
                      <span className="fma-solution-caret" aria-hidden="true">
                        {openSolutions.has(q.id) ? '▾' : '▸'}
                      </span>
                      {openSolutions.has(q.id) ? 'Hide Solution' : 'Show Solution'}
                    </button>
                    {openSolutions.has(q.id) && (
                      <div
                        id={`solution-${q.id}`}
                        className="fma-solution"
                        dangerouslySetInnerHTML={{ __html: renderStatementHtml(q.solution) }}
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
