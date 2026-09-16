import { useRef, useState } from 'react'
import { renderStatementHtml } from '../../utils/renderStatement'
import { copyNodeAsImage } from '../../utils/copyImage'
import ScratchWorkLink from './ScratchWorkLink'
import WorkCrop from './WorkCrop'

const CHOICES = ['A', 'B', 'C', 'D', 'E']
const LIMIT_SEC = 75 * 60

function formatSeconds(s) {
  if (!s || s < 1) return null
  // Round the total first, not the remainder -- rounding sec independently
  // let 59.6s display as "60s" instead of carrying into the minute.
  const total = Math.round(s)
  const m = Math.floor(total / 60), sec = total % 60
  return m > 0 ? `~${m}m ${sec}s` : `~${sec}s`
}

// Time actually spent working, banked by the runner. Not submitted_at -
// started_at: that counts every hour the test sat saved-and-exited too.
function formatDuration(s) {
  if (!s || s < 60) return null
  const totalMin = Math.round(s / 60)
  const h = Math.floor(totalMin / 60), m = totalMin % 60
  return h > 0 ? `${h}h ${m}m` : `${m} min`
}

// One question, redrawn for the clipboard. The image is built from the card
// that's already on screen, so this only adds the context the card doesn't
// carry (which exam, which question) and, on the "with answer" copy, the line
// saying what happened -- all of it created here rather than rendered into the
// page, because none of it belongs on screen twice.
function buildShotHeader({ examName, questionNum, verdictLine, badges }) {
  const head = document.createElement('div')
  head.className = 'fma-shot-head'

  const title = document.createElement('div')
  title.className = 'fma-shot-title'
  title.textContent = `${examName} · Question ${questionNum}`
  head.appendChild(title)

  for (const badge of badges || []) {
    const el = document.createElement('span')
    el.className = `fma-shot-badge ${badge.kind}`
    el.textContent = badge.label
    title.appendChild(el)
  }

  if (verdictLine) {
    const line = document.createElement('div')
    line.className = 'fma-shot-verdict'
    line.textContent = verdictLine
    head.appendChild(line)
  }
  return head
}

// The two clipboard buttons on a question card. Kept as its own component so
// each card owns its own "Copied" / error state instead of one shared banner
// 20 questions away from the button that was pressed.
function CopyButtons({ shotRef, workRef, hasWork, examName, questionNum, verdictLine, badges, answerer }) {
  const [state, setState] = useState(null) // { kind: 'ok' | 'err' | 'busy', msg }

  async function copy(node, prepare) {
    setState({ kind: 'busy', msg: 'Copying…' })
    try {
      await copyNodeAsImage(node, { width: 680, prepare })
      setState({ kind: 'ok', msg: 'Copied' })
      setTimeout(() => setState(null), 2000)
    } catch (e) {
      setState({ kind: 'err', msg: e.message || "couldn't copy" })
    }
  }

  function runQuestion(withAnswer) {
    copy(shotRef.current, clone => {
      if (!withAnswer) {
        // The bare question: no key, no "your answer", nothing coloured in.
        clone.querySelectorAll('.fma-tag').forEach(el => el.remove())
        clone.querySelectorAll('.fma-review-choice').forEach(el => {
          el.classList.remove('key', 'picked-wrong')
        })
      }
      clone.prepend(buildShotHeader({
        examName, questionNum,
        verdictLine: withAnswer ? verdictLine : null,
        badges: withAnswer ? badges : null,
      }))
    })
  }

  function runWork() {
    copy(workRef.current, clone => {
      clone.prepend(buildShotHeader({
        examName, questionNum,
        verdictLine: `${answerer}'s work`,
      }))
    })
  }

  const busy = state?.kind === 'busy'
  return (
    <div className="fma-copy-row">
      <button className="sm" disabled={busy} onClick={() => runQuestion(false)} title="Copy the question alone as an image, ready to paste into Miro">
        Copy problem
      </button>
      <button className="sm" disabled={busy} onClick={() => runQuestion(true)} title="Copy the question with the answer given and the key">
        Copy with answer
      </button>
      {hasWork && (
        <button className="sm" disabled={busy} onClick={runWork} title="Copy just what they wrote for this question">
          Copy their work
        </button>
      )}
      {state && (
        <span className={`fma-copy-status${state.kind === 'err' ? ' err' : ''}`}>{state.msg}</span>
      )}
    </div>
  )
}

export default function FmaAttemptDetail({ detail, onBack, isAdmin = false, studentName = '', showUnguessedScore = false }) {
  const { attempt, questions, answerByQuestion, secondsByQuestion, scratchPages = [], workByQuestion } = detail
  const questionRefs = useRef({})
  // Two capture nodes per question: the slice of the card that becomes the
  // question image (statement, figures, choices), and the student's work, which
  // copies to Miro on its own.
  const shotRefs = useRef({})
  const workRefs = useRef({})

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

  const graded = attempt.status === 'graded'
  // A student's own ungraded attempt must not reveal the key: correct_choice
  // comes back null from the server until the attempt is graded. Mark is
  // allowed to see it any time, so the RPC also fills it in whenever the
  // caller is an admin -- that's what lets him watch a still-in-progress test.
  const canReveal = graded || isAdmin
  const outOf = questions.length || 25
  const examName = attempt.handouts?.name || attempt.exam_id
  const wentOver = (attempt.active_seconds || 0) > LIMIT_SEC
  // The timed line only earns its place once it differs from the final score.
  const showTimedSplit = wentOver && attempt.score_at_limit != null && attempt.score != null
  // The "without the guesses" line is per-student: for most of them a third
  // number is noise, but a student who deliberately stars every guess is asking
  // exactly this question -- what would this be if none of them had landed?
  const showGuessSplit = showUnguessedScore && attempt.score_without_guesses != null && attempt.score != null

  // A skipped question is a question you got wrong -- there's no partial credit
  // on the F=ma -- so it belongs in the same bucket as a wrong answer. Verdicts
  // are derived from correct_choice/also_accepted rather than the stored
  // is_correct column, because is_correct is only computed at grading time and
  // stays null for an attempt Mark is peeking at before the student submits.
  const verdicts = questions.map(q => {
    const ans = answerByQuestion.get(q.id)
    if (!ans?.selected_choice) return 'unanswered'
    if (q.correct_choice != null) {
      const credited = ans.selected_choice === q.correct_choice || (q.also_accepted || []).includes(ans.selected_choice)
      return credited ? 'correct' : 'incorrect'
    }
    return ans.is_correct ? 'correct' : 'incorrect'
  })
  const nCorrect = verdicts.filter(v => v === 'correct').length
  const nIncorrect = verdicts.filter(v => v === 'incorrect').length
  const nUnanswered = verdicts.filter(v => v === 'unanswered').length

  // Stars are the student saying "I guessed here, go over it with me" while
  // they were taking the test. A starred question they happened to get right
  // is the whole reason the marker exists, so it's reported next to the score
  // rather than left to be discovered question by question.
  const starredQuestions = questions.filter(q => answerByQuestion.get(q.id)?.starred)
  const luckyStars = starredQuestions
    .filter(q => verdicts[questions.indexOf(q)] === 'correct').length

  // Mirrors the email summary Mark already gets, so he doesn't have to click
  // through every question just to see the right/wrong/time-spent breakdown.
  const [sortCol, setSortCol] = useState('num')
  const [sortDir, setSortDir] = useState('asc')
  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }
  const resultRank = { correct: 0, incorrect: 1, unanswered: 2 }
  const sortedRows = questions
    .map((q, i) => ({
      q, verdict: verdicts[i],
      seconds: secondsByQuestion?.get(q.id) || 0,
      starred: !!answerByQuestion.get(q.id)?.starred,
    }))
    .sort((a, b) => {
      let av, bv
      if (sortCol === 'result') { av = resultRank[a.verdict]; bv = resultRank[b.verdict] }
      else if (sortCol === 'time') { av = a.seconds; bv = b.seconds }
      else if (sortCol === 'star') { av = a.starred ? 0 : 1; bv = b.starred ? 0 : 1 }
      else { av = a.q.question_num; bv = b.q.question_num }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const date = new Date(attempt.submitted_at || attempt.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  function jumpTo(qid) {
    // Instant, not smooth: smooth scrolling is a no-op inside this scroll
    // container (and whenever the OS asks for reduced motion), which made
    // clicking a question number look like nothing happened.
    questionRefs.current[qid]?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }

  // Who picked the answer, for the caption burned into a copied image. The
  // student's own copy says "You"; on Mark's screen it says their name.
  const answerer = studentName ? studentName.split(' ')[0] : 'You'

  return (
    <div style={{ maxWidth: 760 }}>
      <button className="sm" onClick={onBack} style={{ marginBottom: 16 }}>← Back</button>

      <div className="fma-summary">
        <div>
          <div className="fma-summary-score">
            {attempt.score != null
              ? `${attempt.score}/${outOf}`
              : canReveal && attempt.mode !== 'score_only'
                ? `${nCorrect}/${outOf} so far`
                : '—'}
          </div>
          {/* One sitting, up to three results. The big number above stays the
              finished test; these say where it stood when the real clock would
              have stopped them, and -- for a student who wants it -- what that
              number would have been had every guess missed. */}
          {(showTimedSplit || showGuessSplit) && (
            <div className="fma-summary-split">
              {showGuessSplit && (
                <div title="Starred questions score nothing here, right or wrong">
                  <b>{attempt.score_without_guesses}</b>/{outOf} at 75 min, without the guesses
                </div>
              )}
              {showTimedSplit && <div><b>{attempt.score_at_limit}</b>/{outOf} at 75 min</div>}
              <div className="dim">
                <b>{attempt.score}</b>/{outOf}
                {wentOver
                  ? ` with ${formatDuration(attempt.active_seconds - LIMIT_SEC)} extra`
                  : ' final'}
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{examName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            {date} · {attempt.mode.replace('_', ' ')}
            {formatDuration(attempt.active_seconds) && <> · {formatDuration(attempt.active_seconds)} working time</>}
          </div>
          {wentOver && (
            <div style={{ fontSize: 11, color: 'var(--yellow)', marginTop: 2 }}>
              Ran {formatDuration(attempt.active_seconds - LIMIT_SEC)} past the 75-minute limit.
              {attempt.score_at_limit != null && attempt.score != null && (
                attempt.score > attempt.score_at_limit
                  ? ` The extra time was worth ${attempt.score - attempt.score_at_limit} more question${attempt.score - attempt.score_at_limit === 1 ? '' : 's'}.`
                  : ' Nothing changed after the clock ran out.'
              )}
            </div>
          )}
          {!graded && isAdmin && (
            <div style={{ fontSize: 11, color: 'var(--yellow)', marginTop: 2 }}>
              Still in progress — the student hasn't submitted yet. Showing work saved so far.
            </div>
          )}
          {canReveal && attempt.mode !== 'score_only' && (
            <div className="fma-summary-counts">
              <span><b className="ok">{nCorrect}</b> correct</span>
              <span><b className="bad">{nIncorrect}</b> wrong</span>
              <span><b className="bad">{nUnanswered}</b> skipped</span>
              {starredQuestions.length > 0 && (
                <span><b className="star">{starredQuestions.length}</b> starred</span>
              )}
            </div>
          )}
        </div>
        <ScratchWorkLink path={attempt.scratch_work_url} />
      </div>

      {canReveal && attempt.mode !== 'score_only' && starredQuestions.length > 0 && (
        <div className="fma-starred-note">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
            ★ Starred while taking the test: {starredQuestions.map(q => q.question_num).join(', ')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            These are the ones that were a guess, whether or not the guess landed. Worth going over together.
            {showGuessSplit && luckyStars > 0 && (
              <> {luckyStars} of them came out right, which is why the score above is also given
              without the guesses.</>
            )}
          </div>
        </div>
      )}

      {attempt.tutor_report && (
        <div
          className="fma-tutor-report"
          style={{
            background: 'var(--surface)', border: '1px solid var(--accent)',
            borderRadius: 'var(--radius)', padding: 16, marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Mark's report on this test</div>
          <div
            style={{ fontSize: 13, lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: renderStatementHtml(attempt.tutor_report) }}
          />
        </div>
      )}

      {canReveal && attempt.mode !== 'score_only' && (
        <div style={{ marginBottom: 20 }}>
          <div className="fma-grid">
            {questions.map((q, i) => {
              const starred = !!answerByQuestion.get(q.id)?.starred
              return (
                <button
                  key={q.id}
                  className={`fma-grid-btn result-${verdicts[i]}${starred ? ' starred' : ''}`}
                  onClick={() => jumpTo(q.id)}
                  aria-label={`Question ${q.question_num}, ${verdicts[i]}${starred ? ', starred' : ''}`}
                >
                  {q.question_num}
                  {starred && <span className="fma-star-mark" aria-hidden="true">★</span>}
                </button>
              )
            })}
          </div>
          <div className="fma-legend">
            <span><i className="swatch result-correct" /> correct</span>
            <span><i className="swatch result-incorrect" /> wrong</span>
            <span><i className="swatch result-unanswered" /> skipped</span>
            <span><i className="swatch starred" /> starred</span>
          </div>

          <div className="fma-results-table-wrap">
            <table className="fma-results-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('num')}>
                    #{sortCol === 'num' && <span className="sort-icon">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th onClick={() => handleSort('result')}>
                    Result{sortCol === 'result' && <span className="sort-icon">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th onClick={() => handleSort('star')}>
                    ★{sortCol === 'star' && <span className="sort-icon">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th onClick={() => handleSort('time')}>
                    Time{sortCol === 'time' && <span className="sort-icon">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map(({ q, verdict, seconds, starred }) => (
                  <tr key={q.id} onClick={() => jumpTo(q.id)}>
                    <td>{q.question_num}</td>
                    <td>
                      <span className={`fma-tag ${verdict === 'correct' ? 'ok' : 'bad'}`}>
                        {verdict === 'correct' ? 'correct' : verdict === 'incorrect' ? 'wrong' : 'skipped'}
                      </span>
                    </td>
                    <td className="fma-star-cell">{starred ? '★' : ''}</td>
                    <td>{formatSeconds(seconds) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {attempt.mode === 'score_only' ? (
        <div className="empty-state">Score-only attempt — no per-question answers recorded.</div>
      ) : !canReveal ? (
        <div className="empty-state">
          This attempt is still in progress — answers and the answer key stay hidden until you submit it.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {questions.map((q, i) => {
            const ans = answerByQuestion.get(q.id)
            const html = renderStatementHtml(q.statement)
            const verdict = verdicts[i]
            const skipped = verdict === 'unanswered'
            const starred = !!ans?.starred
            const alsoAccepted = q.also_accepted || []
            if (!shotRefs.current[q.id]) shotRefs.current[q.id] = { current: null }
            if (!workRefs.current[q.id]) workRefs.current[q.id] = { current: null }
            const shotRef = shotRefs.current[q.id]
            const workRef = workRefs.current[q.id]
            const workPieces = workByQuestion?.get(q.id) || []
            // The caption on a "with answer" copy, so the picture carries the
            // same verdict the card does once it's off on a Miro board.
            const verdictLine = skipped
              ? `Skipped — never answered. Correct: ${q.correct_choice}`
              : `${answerer} answered ${ans.selected_choice} · Correct: ${q.correct_choice}`
            const badges = [
              ...(skipped ? [{ kind: 'bad', label: 'Skipped' }] : []),
              ...(starred ? [{ kind: 'star', label: '★ Starred' }] : []),
            ]
            return (
              <div
                key={q.id}
                ref={el => { questionRefs.current[q.id] = el }}
                className={`fma-review-card${skipped ? ' skipped' : ''}${starred ? ' starred' : ''}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                    Question {q.question_num}
                    {formatSeconds(secondsByQuestion?.get(q.id)) && <span style={{ marginLeft: 8 }}>· {formatSeconds(secondsByQuestion.get(q.id))} spent</span>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: verdict === 'correct' ? 'var(--green)' : verdict === 'incorrect' ? 'var(--red)' : 'var(--red)' }}>
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

                {/* Called out on the question itself: a skipped one used to
                    show nothing but the green key, so at a glance it read
                    exactly like a question that had been answered correctly. */}
                {(skipped || starred) && (
                  <div className="fma-card-badges">
                    {skipped && <span className="fma-card-badge bad">Skipped — no answer given</span>}
                    {starred && <span className="fma-card-badge star">★ Starred — this was a guess</span>}
                  </div>
                )}

                {(q.tags || []).length > 0 && (
                  <div className="tag-list" style={{ marginBottom: 8 }}>
                    {q.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                  </div>
                )}

                <div ref={el => { shotRef.current = el }}>
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
                </div>

                {/* What they actually wrote for this question, cut out of the
                    whole-test scan by scripts/fma-work-splitter.mjs. The letter
                    they picked says almost nothing on its own; this is where a
                    wrong answer came from. */}
                {workPieces.length > 0 && (
                  <div className="fma-work-block">
                    <div className="fma-work-label">
                      {answerer}'s work
                      {workPieces.some(wp => !wp.labeled) && (
                        <span className="fma-work-warn" title="The question number wasn't written next to this, so the match is a guess from context">
                          unlabeled — matched from context
                        </span>
                      )}
                    </div>
                    <div ref={el => { workRef.current = el }} className="fma-work-shot">
                      {workPieces.map(wp => (
                        <WorkCrop key={wp.id} work={wp} alt={`Work for question ${q.question_num}`} />
                      ))}
                    </div>
                  </div>
                )}

                <CopyButtons
                  shotRef={shotRef}
                  workRef={workRef}
                  hasWork={workPieces.length > 0}
                  answerer={answerer}
                  examName={examName}
                  questionNum={q.question_num}
                  verdictLine={verdictLine}
                  badges={badges}
                />

                {workPieces.length === 0 && scratchPages.length > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8 }}>
                    No work found for this one in the scan.{' '}
                    <ScratchWorkLink path={scratchPages[0].storage_path} label="Open the whole scan ↗" />
                  </div>
                )}
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
                      <div id={`solution-${q.id}`} className="fma-solution">
                        <div dangerouslySetInnerHTML={{ __html: renderStatementHtml(q.solution) }} />
                        {(q.solution_figure_urls || []).map(url => (
                          <img key={url} src={url} alt="" loading="lazy" className="fma-figure" />
                        ))}
                      </div>
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
