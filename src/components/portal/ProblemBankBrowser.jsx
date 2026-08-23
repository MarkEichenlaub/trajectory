import { useState, useMemo, lazy, Suspense } from 'react'
import { markMyProblemCompleted } from '../../utils/supabase'
import FilterSidebar from '../FilterSidebar'

// Lazy so KaTeX (and its fonts) load on first preview click, not portal boot.
const ProblemPreviewModal = lazy(() => import('../ProblemPreviewModal'))

const DEFAULT_BANK_FILTERS = {
  contests: new Set(),
  types: new Set(),
  topics: new Set(),
  courses: new Set(),
  weeks: new Set(),
  sources: new Set(),
  statuses: new Set(),
  selectedTags: new Set(),
  textSearch: '',
  hideCompleted: false,
}

export default function ProblemBankBrowser({ bankProblems, assignments, student, onMarkCompleted, isPreview, hideStatusControls, emptyMessage }) {
  const [filters, setFilters] = useState(DEFAULT_BANK_FILTERS)
  const [sortCol, setSortCol] = useState('year')
  const [sortDir, setSortDir] = useState('desc')
  const [markingDoneId, setMarkingDoneId] = useState(null)
  const [previewProblem, setPreviewProblem] = useState(null)

  const statusMap = useMemo(() => {
    const map = {}
    assignments.forEach(a => {
      // A book can have several independent assignment rows (e.g. separate
      // chapters) — show it as still-open as long as any of them are, and
      // only "completed" once every one of them is.
      const prev = map[a.problem_id]
      if (!prev || prev === 'completed') map[a.problem_id] = a.status
    })
    return map
  }, [assignments])

  const preTagFiltered = useMemo(() => bankProblems.filter(p => {
    if (filters.contests.size > 0 && !filters.contests.has(p.contest)) return false
    if (filters.types.size > 0 && !filters.types.has(p.type)) return false
    if (filters.topics.size > 0 && !p.topics.some(t => filters.topics.has(t))) return false
    if (filters.courses.size > 0 && !filters.courses.has(p.contest)) return false
    if (filters.weeks.size > 0 && !filters.weeks.has(p.label)) return false
    if (filters.sources.size > 0 && !filters.sources.has(p.source)) return false
    if (filters.hideCompleted && statusMap[p.id] === 'completed') return false
    if (filters.statuses.size > 0) {
      const s = statusMap[p.id] || 'not-started'
      if (!filters.statuses.has(s)) return false
    }
    if (filters.textSearch) {
      const q = filters.textSearch.toLowerCase()
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.desc.toLowerCase().includes(q) &&
        !p.tags.some(t => t.toLowerCase().includes(q)) &&
        !(p.topics || []).some(t => t.toLowerCase().includes(q)) &&
        !(p.year ? String(p.year).includes(q) : false) &&
        !(p.country || '').toLowerCase().includes(q)
      ) return false
    }
    return true
  }), [bankProblems, filters, statusMap])

  const filtered = useMemo(() => {
    if (filters.selectedTags.size === 0) return preTagFiltered
    return preTagFiltered.filter(p =>
      [...filters.selectedTags].every(tag => p.tags.includes(tag))
    )
  }, [preTagFiltered, filters.selectedTags])

  const sorted = useMemo(() => {
    const statusOrder = { assigned: 0, 'not-started': 1, completed: 2 }
    return [...filtered].sort((a, b) => {
      let av, bv
      if (sortCol === 'status') {
        av = statusOrder[statusMap[a.id] || 'not-started']
        bv = statusOrder[statusMap[b.id] || 'not-started']
      } else {
        av = a[sortCol]; bv = b[sortCol]
        if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase() }
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortCol, sortDir, statusMap])

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir(col === 'year' ? 'desc' : 'asc') }
  }

  async function handleMarkDone(problemId) {
    if (!student?.id || !onMarkCompleted || isPreview) return
    setMarkingDoneId(problemId)
    try {
      const result = await markMyProblemCompleted(student.id, problemId)
      if (result) onMarkCompleted(result)
    } catch (e) {
      console.error('Failed to mark done:', e)
    } finally {
      setMarkingDoneId(null)
    }
  }

  if (bankProblems.length === 0) {
    return (
      <div className="empty-state">
        {emptyMessage || 'No problem bank configured yet. Your tutor will add accessible sources.'}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
      <FilterSidebar
        problems={bankProblems}
        filteredProblems={preTagFiltered}
        filters={filters}
        setFilters={setFilters}
        statusMap={statusMap}
        hideStatusControls={hideStatusControls}
      />
      <div className="problem-area" style={{ flex: 1, minWidth: 0, overflowX: 'auto' }}>
        <div className="search-bar">
          <input
            placeholder="Search problems, tags, countries…"
            value={filters.textSearch}
            onChange={e => setFilters(f => ({ ...f, textSearch: e.target.value }))}
          />
          <span className="result-count">{sorted.length} problem{sorted.length !== 1 ? 's' : ''}</span>
        </div>
        {sorted.length === 0 ? (
          <div className="empty-state">No problems match the current filters.</div>
        ) : (
          <div className="problem-table-wrap">
            <table style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ width: 80, cursor: 'pointer' }} onClick={() => handleSort('status')}>
                    Status {sortCol === 'status' && <span className="sort-icon">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th style={{ width: 56, cursor: 'pointer' }} onClick={() => handleSort('year')}>
                    Year {sortCol === 'year' && <span className="sort-icon">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th style={{ width: 48 }}>#</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    Problem {sortCol === 'name' && <span className="sort-icon">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th style={{ width: 170 }}>Topics</th>
                  <th style={{ width: 88 }}>Links</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(p => {
                  const status = statusMap[p.id]
                  const isResource = p.type === 'Book' || p.type === 'Handout' || p.type === 'Exam'
                  const isCompleted = status === 'completed'
                  return (
                    <tr key={p.id} className={isCompleted ? 'done' : status === 'assigned' ? 'assigned-row-tr' : ''}>
                      <td>
                        {status === 'assigned' && <span className="status-badge assigned">→ Assigned</span>}
                        {status === 'completed' && <span className="status-badge completed">✓ Done</span>}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {isResource
                          ? <span style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 500 }}>{p.contest}</span>
                          : <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{p.year}</span>
                        }
                      </td>
                      <td>
                        {!isResource && (
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
                            style={p.statement ? { flex: 1, cursor: 'pointer' } : { flex: 1 }}
                            title={p.statement ? 'Preview problem' : undefined}
                            onClick={p.statement ? () => setPreviewProblem(p) : undefined}
                          >
                            {p.name}
                          </div>
                          {p.statement && (
                            <button
                              className="sm"
                              style={{ fontSize: 11, padding: '0 5px', flexShrink: 0 }}
                              title="Preview problem"
                              onClick={() => setPreviewProblem(p)}
                            >👁</button>
                          )}
                        </div>
                        {!isResource && <div className="problem-desc">{p.desc}</div>}
                      </td>
                      <td>
                        <div className="tag-list">
                          {(p.topics || []).map(t => <span key={t} className="tag topic">{t}</span>)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {p.problemUrl && (
                            <a className="pdf-link" href={p.problemUrl} target="_blank" rel="noreferrer">
                              {p.type === 'Exam' ? 'Exam ↗' : isResource ? 'PDF ↗' : 'Problem ↗'}
                            </a>
                          )}
                          {p.solutionUrl && isCompleted && <a className="pdf-link" href={p.solutionUrl} target="_blank" rel="noreferrer">Solution ↗</a>}
                        </div>
                      </td>
                      <td>
                        {!isCompleted && !isPreview && onMarkCompleted && (
                          <button
                            className="sm"
                            style={{ fontSize: 11, whiteSpace: 'nowrap' }}
                            disabled={markingDoneId === p.id}
                            onClick={() => handleMarkDone(p.id)}
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
          </div>
        )}
      </div>
      {previewProblem && (
        <Suspense fallback={null}>
          <ProblemPreviewModal problem={previewProblem} onClose={() => setPreviewProblem(null)} />
        </Suspense>
      )}
    </div>
  )
}
