import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { problemToClipboardText } from '../utils/statementText'

// Lazy so KaTeX (and its fonts) load on first preview click, not portal boot.
const ProblemPreviewModal = lazy(() => import('./ProblemPreviewModal'))

const COLS = [
  { key: 'status', label: 'Status', width: 72, sortable: true },
  { key: 'contest', label: 'Collection', width: 100, sortable: true },
  { key: 'year', label: 'Year', width: 56, sortable: true },
  { key: 'label', label: '#', width: 48, sortable: true },
  { key: 'name', label: 'Problem', width: null, sortable: true },
  { key: 'topics', label: 'Topics', width: 170, sortable: false },
  { key: 'links', label: 'Links', width: 88, sortable: false },
  { key: 'actions', label: '', width: 80, sortable: false },
]

function StatusBadge({ status }) {
  if (!status || status === 'not-started') return null
  if (status === 'assigned') return <span className="status-badge assigned">→ Assigned</span>
  if (status === 'completed') return <span className="status-badge completed">✓ Done</span>
  return null
}

const INITIAL_VISIBLE = 100

export default function ProblemTable({
  problems, selected, statusMap, filters, setFilters,
  onToggle, onSelectAll, onClearAll,
  sortCol, sortDir, onSort,
  onExclude, onMarkComplete, markingDoneId,
}) {
  const [previewProblem, setPreviewProblem] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const copiedTimer = useRef(null)
  // Rendering all ~900+ rows at once blocks the main thread for over a second,
  // so only a slice is mounted; selection/sort still operate on the full list.
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)
  useEffect(() => { setVisibleCount(INITIAL_VISIBLE) }, [problems])
  useEffect(() => () => clearTimeout(copiedTimer.current), [])
  const visibleProblems = problems.length > visibleCount ? problems.slice(0, visibleCount) : problems
  const allSelected = problems.length > 0 && problems.every(p => selected.has(p.id))

  // Source line + statement as plain text with Unicode math — the shape that
  // pastes cleanly into Miro during a session.
  async function copyProblem(p) {
    try {
      await navigator.clipboard.writeText(problemToClipboardText(p))
      setCopiedId(p.id)
      clearTimeout(copiedTimer.current)
      copiedTimer.current = setTimeout(() => setCopiedId(null), 1500)
    } catch (e) {
      console.error('Copy failed:', e)
    }
  }

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
              const isNonPhysics = p.nonPhysics === true

              return (
                <tr
                  key={p.id}
                  className={isSelected ? 'selected' : isNonPhysics ? 'non-physics-row' : isCompleted ? 'done' : isAssigned ? 'assigned-row-tr' : ''}
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
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{p.contest}</span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {p.year > 0 && <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{p.year}</span>}
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
                        {isNonPhysics && <span className="non-physics-badge" title="Not physics content — AoPS logistics or instructions">⚠ non-physics</span>}
                        {p.name}
                      </div>
                      <button
                        className="sm"
                        style={{ fontSize: 11, padding: '0 5px', flexShrink: 0 }}
                        title="Preview problem"
                        onClick={e => { e.stopPropagation(); setPreviewProblem(p) }}
                      >👁</button>
                      <button
                        className="sm"
                        style={{ fontSize: 11, padding: '0 5px', flexShrink: 0 }}
                        title="Copy source line and problem text"
                        onClick={e => { e.stopPropagation(); copyProblem(p) }}
                      >{copiedId === p.id ? '✓' : '📋'}</button>
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
                  <td onClick={e => e.stopPropagation()}>
                    {!isCompleted && onMarkComplete && (
                      <button
                        className="sm"
                        style={{ fontSize: 11, whiteSpace: 'nowrap' }}
                        disabled={markingDoneId === p.id}
                        onClick={() => onMarkComplete(p.id)}
                      >
                        {markingDoneId === p.id ? '…' : 'Mark done'}
                      </button>
                    )}
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
        <Suspense fallback={null}>
          <ProblemPreviewModal
            problem={previewProblem}
            onClose={() => setPreviewProblem(null)}
            onExclude={onExclude ? (id) => { onExclude(id); setPreviewProblem(null) } : null}
          />
        </Suspense>
      )}
    </>
  )
}
