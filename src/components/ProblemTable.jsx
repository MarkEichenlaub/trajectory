import { useState, useEffect, useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const COLS = [
  { key: 'status', label: 'Status', width: 72, sortable: true },
  { key: 'year', label: 'Year', width: 56, sortable: true },
  { key: 'label', label: '#', width: 48, sortable: true },
  { key: 'name', label: 'Problem', width: null, sortable: true },
  { key: 'topics', label: 'Topics', width: 170, sortable: false },
  { key: 'links', label: 'Links', width: 88, sortable: false },
]

function StatusBadge({ status }) {
  if (!status || status === 'not-started') return null
  if (status === 'assigned') return <span className="status-badge assigned">→ Assigned</span>
  if (status === 'completed') return <span className="status-badge completed">✓ Done</span>
  return null
}

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
export function ProblemPreviewModal({ problem, onClose }) {
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

const INITIAL_VISIBLE = 100

export default function ProblemTable({
  problems, selected, statusMap, filters, setFilters,
  onToggle, onSelectAll, onClearAll,
  sortCol, sortDir, onSort,
}) {
  const [previewProblem, setPreviewProblem] = useState(null)
  // Rendering all ~900+ rows at once blocks the main thread for over a second,
  // so only a slice is mounted; selection/sort still operate on the full list.
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)
  useEffect(() => { setVisibleCount(INITIAL_VISIBLE) }, [problems])
  const visibleProblems = problems.length > visibleCount ? problems.slice(0, visibleCount) : problems
  const allSelected = problems.length > 0 && problems.every(p => selected.has(p.id))

  if (problems.length === 0) {
    return (
      <>
        <div className="search-bar">
          <input
            placeholder="Search problems…"
            value={filters.textSearch}
            onChange={e => setFilters(f => ({ ...f, textSearch: e.target.value }))}
          />
          <span className="result-count">0 problems</span>
        </div>
        <div className="empty-state">No problems match the current filters.</div>
      </>
    )
  }

  return (
    <>
      <div className="search-bar">
        <input
          placeholder="Search problems, tags, countries…"
          value={filters.textSearch}
          onChange={e => setFilters(f => ({ ...f, textSearch: e.target.value }))}
        />
        <span className="result-count">{problems.length} problem{problems.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="problem-table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: 32 }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => allSelected ? onClearAll() : onSelectAll()}
                  style={{ accentColor: 'var(--accent)' }}
                />
              </th>
              {COLS.map(col => (
                <th
                  key={col.key}
                  style={{ ...(col.width ? { width: col.width } : {}), cursor: col.sortable ? 'pointer' : 'default' }}
                  onClick={() => col.sortable && onSort(col.key)}
                >
                  {col.label}
                  {sortCol === col.key && (
                    <span className="sort-icon">{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleProblems.map(p => {
              const status = statusMap[p.id]
              const isSelected = selected.has(p.id)
              const isAssigned = status === 'assigned'
              const isCompleted = status === 'completed'

              return (
                <tr
                  key={p.id}
                  className={isSelected ? 'selected' : isCompleted ? 'done' : isAssigned ? 'assigned-row-tr' : ''}
                  onClick={() => onToggle(p.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggle(p.id)}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                  </td>
                  <td>
                    <StatusBadge status={status} />
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {(p.type === 'Handout' || p.type === 'Book')
                      ? <span style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 500 }}>{p.contest}</span>
                      : <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{p.year}</span>
                    }
                  </td>
                  <td>
                    {p.type !== 'Handout' && p.type !== 'Book' && (
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                        <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{p.label}</span>
                        {p.set_label && (
                          <span style={{ color: p.type === 'AoPS Script' ? 'var(--accent)' : 'var(--text-dim)', fontSize: 10, whiteSpace: 'nowrap' }}>
                            {p.type === 'AoPS Script' ? `★ ${p.set_label}` : p.set_label}
                          </span>
                        )}
                        {(p.figures || []).length > 0 && (
                          <span style={{ color: 'var(--text-dim)', fontSize: 10, whiteSpace: 'nowrap' }} title={`${p.figures.length} figure${p.figures.length !== 1 ? 's' : ''}`}>
                            🖼 {p.figures.length}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <div
                        className="problem-name"
                        style={{ flex: 1, cursor: 'pointer' }}
                        title="Preview problem"
                        onClick={e => { e.stopPropagation(); setPreviewProblem(p) }}
                      >
                        {p.name}
                      </div>
                      <button
                        className="sm"
                        style={{ fontSize: 11, padding: '0 5px', flexShrink: 0 }}
                        title="Preview problem"
                        onClick={e => { e.stopPropagation(); setPreviewProblem(p) }}
                      >👁</button>
                    </div>
                    <div className="problem-desc">{p.desc}</div>
                  </td>
                  <td>
                    <div className="tag-list">
                      {p.topics.map(t => <span key={t} className="tag topic">{t}</span>)}
                    </div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {p.problemUrl && (
                        <a className="pdf-link" href={p.problemUrl} target="_blank" rel="noreferrer">
                          {p.type === 'Book' ? 'PDF ↗' : p.type === 'Handout' ? 'PDF ↗' : 'Problem ↗'}
                        </a>
                      )}
                      {p.solutionUrl && <a className="pdf-link" href={p.solutionUrl} target="_blank" rel="noreferrer">Solution ↗</a>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {problems.length > visibleCount && (
          <div className="table-show-more">
            <span>Showing {visibleCount} of {problems.length}</span>
            <button className="sm" onClick={() => setVisibleCount(c => c + 250)}>Show 250 more</button>
            <button className="sm" onClick={() => setVisibleCount(problems.length)}>Show all</button>
          </div>
        )}
      </div>
      {previewProblem && (
        <ProblemPreviewModal problem={previewProblem} onClose={() => setPreviewProblem(null)} />
      )}
    </>
  )
}
