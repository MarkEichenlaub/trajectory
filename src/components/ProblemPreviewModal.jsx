import { useEffect, useMemo, useState } from 'react'
import 'katex/dist/katex.min.css'
import { renderStatementHtml } from '../utils/renderStatement'
import { problemSourceLine, problemToClipboardText } from '../utils/statementText'
import { fetchProblemSolution } from '../utils/supabase'

// KaTeX (~280KB + fonts) lives in this module so it loads on the first
// preview click rather than on portal boot — import this component lazily.

// Whether the solution panel is expanded, remembered for the session: opening a
// run of problems to check answers shouldn't mean clicking "Show" every time.
// Starts closed so a solution never lands on screen unasked (this preview gets
// opened while screen-sharing).
let solutionOpenByDefault = false

// Modal preview of a single problem: full statement with KaTeX, figures, tags
// and links. Used in the admin Problems browser and the student problem bank.
// `canSeeSolution` is passed only from the admin table — the worked solution is
// admin-only in the database too, so a student's fetch would return nothing.
export default function ProblemPreviewModal({ problem, onClose, onExclude, canSeeSolution }) {
  const [copied, setCopied] = useState(false)
  const [showSolution, setShowSolution] = useState(solutionOpenByDefault)
  const [solution, setSolution] = useState(null)
  const [solutionError, setSolutionError] = useState(null)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Fetched per problem as the panel is opened, not with the bank: it is over a
  // megabyte of text across the ~1200 problems that have one.
  useEffect(() => {
    if (!canSeeSolution || !showSolution) return
    let cancelled = false
    setSolution(null)
    setSolutionError(null)
    fetchProblemSolution(problem.id)
      .then(row => { if (!cancelled) setSolution(row || { empty: true }) })
      .catch(e => { if (!cancelled) setSolutionError(e.message) })
    return () => { cancelled = true }
  }, [canSeeSolution, showSolution, problem.id])

  function toggleSolution() {
    setShowSolution(open => (solutionOpenByDefault = !open))
  }

  const html = useMemo(
    () => renderStatementHtml(problem.statement || problem.desc || ''),
    [problem]
  )

  const subtitle = problemSourceLine(problem)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(problemToClipboardText(problem))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      console.error('Copy failed:', e)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginBottom: 4 }}>{problem.name}</h3>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>{subtitle}</div>
        )}
        <div className="problem-preview-body" dangerouslySetInnerHTML={{ __html: html }} />
        {(problem.figures || []).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {problem.figures.map((url, i) => (
              <img key={i} src={url} alt={`Figure ${i + 1}`} loading="lazy" style={{ maxWidth: '100%', borderRadius: 6, border: '1px solid var(--border)', alignSelf: 'flex-start' }} />
            ))}
          </div>
        )}
        {(problem.tags || []).length > 0 && (
          <div className="tag-list" style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {problem.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
        {canSeeSolution && (
          <div className="preview-solution">
            <button
              type="button"
              className="preview-solution-toggle"
              onClick={toggleSolution}
              aria-expanded={showSolution}
            >
              <span aria-hidden="true">{showSolution ? '▾' : '▸'}</span>
              {showSolution ? 'Hide solution' : 'Show solution'}
            </button>
            {showSolution && (
              <div className="preview-solution-body">
                {solutionError && <div className="empty-state">Couldn’t load the solution: {solutionError}</div>}
                {!solutionError && !solution && <div className="empty-state">Loading…</div>}
                {solution?.empty && <div className="empty-state">No solution on file for this problem.</div>}
                {solution && !solution.empty && (
                  <>
                    {solution.answer && (
                      <div className="preview-solution-answer">
                        Answer: {/^[a-e]$/.test(solution.answer) ? `(${solution.answer})` : solution.answer}
                      </div>
                    )}
                    {solution.solution && (
                      <div
                        className="problem-preview-body"
                        dangerouslySetInnerHTML={{ __html: renderStatementHtml(solution.solution) }}
                      />
                    )}
                    {(solution.figure_urls || []).map((url, i) => (
                      <img key={url} src={url} alt={`Solution figure ${i + 1}`} loading="lazy" style={{ maxWidth: '100%', borderRadius: 6, border: '1px solid var(--border)', marginTop: 10 }} />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
        {problem.nonPhysics && (
          <div style={{ marginTop: 16, padding: '8px 12px', background: 'var(--red-bg, #fff0f0)', border: '1px solid var(--red-line, #ffb3b3)', borderRadius: 6, fontSize: 13, color: 'var(--red, #c0392b)' }}>
            <strong>Not physics content</strong> — This is an AoPS course logistics or instructions problem, not an actual physics problem.
          </div>
        )}
        <div className="modal-footer">
          {problem.problemUrl && (
            <a className="pdf-link" href={problem.problemUrl} target="_blank" rel="noreferrer" style={{ marginRight: 'auto' }}>Problem ↗</a>
          )}
          {problem.solutionUrl && (
            <a className="pdf-link" href={problem.solutionUrl} target="_blank" rel="noreferrer" style={problem.problemUrl ? {} : { marginRight: 'auto' }}>Solution ↗</a>
          )}
          <button className="sm" title="Copy source line and problem text" onClick={handleCopy}>
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
          {onExclude && (
            <button
              className="sm"
              style={{ color: 'var(--red, #c0392b)', borderColor: 'var(--red-line, #ffb3b3)' }}
              title="Permanently hide this problem from the portal"
              onClick={() => {
                if (window.confirm('Hide this problem permanently? It will no longer appear in the portal. (You can undo this in the database if needed.)')) {
                  onExclude(problem.id)
                }
              }}
            >
              Delete
            </button>
          )}
          <button className="sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
