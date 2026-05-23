import { useMemo } from 'react'

const COLS = [
  { key: 'year', label: 'Year', width: 56 },
  { key: 'label', label: '#', width: 48 },
  { key: 'name', label: 'Problem', width: null },
  { key: 'topics', label: 'Topics', width: 180 },
  { key: 'links', label: 'Links', width: 90 },
]

export default function ProblemTable({
  problems, selected, doneIds, filters, setFilters,
  onToggle, onSelectAll, onClearAll,
  sortCol, sortDir, onSort,
  assignments, activeStudentId, students,
}) {
  const allSelected = problems.length > 0 && problems.every(p => selected.has(p.id))

  // Build assignment lookup: problemId → [{date, studentName}]
  const assignmentMap = useMemo(() => {
    const map = {}
    assignments.forEach(a => {
      const student = students.find(s => s.id === a.studentId)
      a.problemIds.forEach(pid => {
        if (!map[pid]) map[pid] = []
        map[pid].push({ date: a.date, studentName: student?.name || a.studentId, studentId: a.studentId })
      })
    })
    return map
  }, [assignments, students])

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
                  style={col.width ? { width: col.width } : {}}
                  onClick={() => col.key !== 'links' && col.key !== 'topics' && onSort(col.key)}
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
            {problems.map(p => {
              const isDone = doneIds.has(p.id)
              const isSelected = selected.has(p.id)
              const assignedTo = assignmentMap[p.id] || []
              const assignedToActive = assignedTo.find(a => a.studentId === activeStudentId)

              return (
                <tr
                  key={p.id}
                  className={isSelected ? 'selected' : isDone ? 'done' : ''}
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
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{p.year}</span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{p.label}</span>
                  </td>
                  <td>
                    <div className="problem-name">{p.name}</div>
                    <div className="problem-desc">{p.desc}</div>
                    {assignedToActive && (
                      <span className="done-badge" style={{ marginTop: 4, display: 'inline-block' }}>
                        ✓ {assignedToActive.date}
                      </span>
                    )}
                    {assignedTo.filter(a => a.studentId !== activeStudentId).length > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 6 }}>
                        also: {assignedTo.filter(a => a.studentId !== activeStudentId).map(a => a.studentName).join(', ')}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="tag-list">
                      {p.topics.map(t => <span key={t} className="tag topic">{t}</span>)}
                    </div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <a className="pdf-link" href={p.problemUrl} target="_blank" rel="noreferrer">Problem ↗</a>
                      {p.solutionUrl && <a className="pdf-link" href={p.solutionUrl} target="_blank" rel="noreferrer">Solution ↗</a>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
