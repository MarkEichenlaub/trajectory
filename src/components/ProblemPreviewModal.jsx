import { useEffect, useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// KaTeX (~280KB + fonts) lives in this module so it loads on the first
// preview click rather than on portal boot — import this component lazily.

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Render a problem statement to HTML: paragraphs split on blank lines,
// $$...$$ segments rendered as INLINE KaTeX, __text__ as bold, rest escaped.
function renderStatementHtml(text) {
  if (!text) return ''
  return text
    .split(/\n\s*\n/)
    .map(par => {
      const parts = par.split(/(\$\$[\s\S]*?\$\$)/)
      const html = parts.map(part => {
        if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
          return katex.renderToString(part.slice(2, -2), { throwOnError: false, displayMode: false })
        }
        return escapeHtml(part).replace(/__([\s\S]+?)__/g, '<strong>$1</strong>')
      }).join('')
      return `<p>${html}</p>`
    })
    .join('')
}

// Modal preview of a single problem: full statement with KaTeX, figures, tags
// and links. Used in the admin Problems browser and the student problem bank.
export default function ProblemPreviewModal({ problem, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const html = useMemo(
    () => renderStatementHtml(problem.statement || problem.desc || ''),
    [problem]
  )

  const subtitle = [
    problem.contest,
    problem.lesson,
    problem.set_label,
  ].filter(Boolean).join(' · ')

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
        <div className="modal-footer">
          {problem.problemUrl && (
            <a className="pdf-link" href={problem.problemUrl} target="_blank" rel="noreferrer" style={{ marginRight: 'auto' }}>Problem ↗</a>
          )}
          {problem.solutionUrl && (
            <a className="pdf-link" href={problem.solutionUrl} target="_blank" rel="noreferrer" style={problem.problemUrl ? {} : { marginRight: 'auto' }}>Solution ↗</a>
          )}
          <button className="sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
