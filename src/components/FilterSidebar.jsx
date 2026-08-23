import { useState, useMemo } from 'react'

const TOPIC_ORDER = [
  'Mechanics', 'Electromagnetism', 'Waves & Oscillations', 'Optics',
  'Thermodynamics', 'Quantum Physics', 'Relativity',
  'Nuclear/Particle', 'Astrophysics', 'Experimental Methods',
]

const STATUS_OPTIONS = [
  { key: 'not-started', label: 'Not started' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'completed', label: 'Completed' },
]

// Display order for the normalized source filter; any extras get appended.
const SOURCE_ORDER = ['homework', 'script', 'handout', 'summary', 'book', 'exam']

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

function isAops(p) {
  return p.type === 'AoPS' || p.type === 'AoPS Script'
}

function useCollapsed(key, defaultVal = false) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('traj_collapsed_' + key)) ?? defaultVal }
    catch { return defaultVal }
  })
  function toggle() {
    setCollapsed(v => {
      localStorage.setItem('traj_collapsed_' + key, !v)
      return !v
    })
  }
  return [collapsed, toggle]
}

function Section({ title, collapsed, onToggle, action, children }) {
  return (
    <div className="sidebar-section">
      <div className="sidebar-section-header" onClick={onToggle}>
        <span>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {action && <span onClick={e => e.stopPropagation()}>{action}</span>}
          <span>{collapsed ? '▶' : '▼'}</span>
        </div>
      </div>
      {!collapsed && children}
    </div>
  )
}

export default function FilterSidebar({ problems, filteredProblems, filters, setFilters, statusMap, hideStatusControls }) {
  const [contestCollapsed, toggleContest] = useCollapsed('contest')
  const [courseCollapsed, toggleCourse_] = useCollapsed('course')
  const [weekCollapsed, toggleWeek] = useCollapsed('week')
  const [sourceCollapsed, toggleSource] = useCollapsed('psource', true)
  const [typeCollapsed, toggleType] = useCollapsed('type')
  const [topicCollapsed, toggleTopic] = useCollapsed('topic')
  const [statusCollapsed, toggleStatus] = useCollapsed('status', true)
  const [tagCollapsed, toggleTag] = useCollapsed('tag', true)
  const [tagSearch, setTagSearch] = useState('')

  const contests = useMemo(() => [...new Set(problems.map(p => p.contest))].sort(), [problems])
  const types = useMemo(() => [...new Set(problems.map(p => p.type))].sort(), [problems])

  // AoPS courses in load (manifest) order — Sets preserve insertion order.
  const courses = useMemo(() => {
    const seen = new Set()
    const out = []
    problems.forEach(p => {
      if (isAops(p) && p.contest && !seen.has(p.contest)) { seen.add(p.contest); out.push(p.contest) }
    })
    return out
  }, [problems])

  // Lessons ("weeks") for the selected courses, ordered by week number.
  const weekOptions = useMemo(() => {
    if (filters.courses.size === 0) return []
    const byLabel = new Map()
    problems.forEach(p => {
      if (!isAops(p) || !filters.courses.has(p.contest) || !p.label) return
      if (!byLabel.has(p.label)) {
        const title = p.lesson ? (p.lesson.split(/:\s*/).slice(1).join(': ') || p.lesson) : ''
        byLabel.set(p.label, { label: p.label, title, week: p.week ?? 0 })
      }
    })
    return [...byLabel.values()].sort((a, b) => (a.week - b.week) || a.label.localeCompare(b.label))
  }, [problems, filters.courses])

  // Normalized source values present in the bank (homework / script / handout / …).
  const sources = useMemo(() => {
    const present = new Set(problems.map(p => p.source).filter(Boolean))
    const ordered = SOURCE_ORDER.filter(s => present.has(s))
    present.forEach(s => { if (!SOURCE_ORDER.includes(s)) ordered.push(s) })
    return ordered
  }, [problems])

  // Counts based on filteredProblems (after all filters except selectedTags)
  const contestCounts = useMemo(() => {
    const counts = {}
    filteredProblems.forEach(p => { counts[p.contest] = (counts[p.contest] || 0) + 1 })
    return counts
  }, [filteredProblems])

  const typeCounts = useMemo(() => {
    const counts = {}
    filteredProblems.forEach(p => { counts[p.type] = (counts[p.type] || 0) + 1 })
    return counts
  }, [filteredProblems])

  const weekCounts = useMemo(() => {
    const counts = {}
    filteredProblems.forEach(p => { if (p.label) counts[p.label] = (counts[p.label] || 0) + 1 })
    return counts
  }, [filteredProblems])

  const sourceCounts = useMemo(() => {
    const counts = {}
    filteredProblems.forEach(p => { if (p.source) counts[p.source] = (counts[p.source] || 0) + 1 })
    return counts
  }, [filteredProblems])

  const topicCounts = useMemo(() => {
    const counts = {}
    TOPIC_ORDER.forEach(t => { counts[t] = 0 })
    filteredProblems.forEach(p => {
      p.topics.forEach(t => { if (counts[t] !== undefined) counts[t]++ })
    })
    return counts
  }, [filteredProblems])

  const statusCounts = useMemo(() => {
    const counts = { 'not-started': 0, assigned: 0, completed: 0 }
    filteredProblems.forEach(p => {
      const s = statusMap[p.id] || 'not-started'
      counts[s] = (counts[s] || 0) + 1
    })
    return counts
  }, [filteredProblems, statusMap])

  // Tag counts from filteredProblems, sorted: selected tags first, then by count
  const tagData = useMemo(() => {
    const counts = {}
    filteredProblems.forEach(p => p.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1 }))
    return Object.entries(counts).sort(([tagA, cntA], [tagB, cntB]) => {
      const aSelected = filters.selectedTags.has(tagA)
      const bSelected = filters.selectedTags.has(tagB)
      if (aSelected !== bSelected) return aSelected ? -1 : 1
      return cntB - cntA
    })
  }, [filteredProblems, filters.selectedTags])

  const displayedTags = tagSearch
    ? tagData.filter(([t]) => t.toLowerCase().includes(tagSearch.toLowerCase()))
    : tagData

  function toggleSet(filterKey, value) {
    setFilters(prev => {
      const next = new Set(prev[filterKey])
      if (next.has(value)) next.delete(value); else next.add(value)
      return { ...prev, [filterKey]: next }
    })
  }

  // Toggling a course also prunes week selections that no longer belong to any
  // selected course (otherwise stale labels would filter everything out).
  function toggleCourse(course) {
    setFilters(prev => {
      const nextCourses = new Set(prev.courses)
      if (nextCourses.has(course)) nextCourses.delete(course); else nextCourses.add(course)
      const validLabels = new Set()
      if (nextCourses.size > 0) {
        problems.forEach(p => { if (isAops(p) && nextCourses.has(p.contest) && p.label) validLabels.add(p.label) })
      }
      const nextWeeks = new Set([...prev.weeks].filter(l => validLabels.has(l)))
      return { ...prev, courses: nextCourses, weeks: nextWeeks }
    })
  }

  function clearAll() {
    setFilters(prev => ({
      ...prev,
      contests: new Set(),
      types: new Set(),
      topics: new Set(),
      courses: new Set(),
      weeks: new Set(),
      sources: new Set(),
      statuses: new Set(),
      selectedTags: new Set(),
      hideCompleted: false,
    }))
  }

  const hasAnyFilter = filters.contests.size > 0 || filters.types.size > 0 || filters.topics.size > 0
    || filters.courses.size > 0 || filters.weeks.size > 0 || filters.sources.size > 0
    || filters.statuses.size > 0 || filters.selectedTags.size > 0 || filters.hideCompleted

  return (
    <div className="sidebar">
      <div style={{ padding: '8px 14px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Filters</span>
        {hasAnyFilter && <button className="sm" onClick={clearAll}>Clear all</button>}
      </div>

      {/* Hide completed */}
      {!hideStatusControls && (
        <div className="sidebar-item" onClick={() => setFilters(f => ({ ...f, hideCompleted: !f.hideCompleted }))}>
          <input type="checkbox" checked={filters.hideCompleted} readOnly />
          <span>Hide completed</span>
        </div>
      )}

      <Section title="Collection" collapsed={contestCollapsed} onToggle={toggleContest}>
        {contests.map(c => (
          <div key={c} className={`sidebar-item ${filters.contests.has(c) ? 'active' : ''}`} onClick={() => toggleSet('contests', c)}>
            <input type="checkbox" checked={filters.contests.has(c)} readOnly />
            <span>{c}</span>
            <span className="sidebar-count">{contestCounts[c] || 0}</span>
          </div>
        ))}
      </Section>

      {courses.length > 0 && (
        <Section
          title={`Course${filters.courses.size > 0 ? ` (${filters.courses.size})` : ''}`}
          collapsed={courseCollapsed}
          onToggle={toggleCourse_}
          action={filters.courses.size > 0 && (
            <button
              className="sm"
              style={{ fontSize: 11, padding: '1px 6px' }}
              onClick={() => setFilters(f => ({ ...f, courses: new Set(), weeks: new Set() }))}
            >Clear</button>
          )}
        >
          {courses.map(c => (
            <div key={c} className={`sidebar-item ${filters.courses.has(c) ? 'active' : ''}`} onClick={() => toggleCourse(c)}>
              <input type="checkbox" checked={filters.courses.has(c)} readOnly />
              <span style={{ flex: 1 }}>{c}</span>
              <span className="sidebar-count">{contestCounts[c] || 0}</span>
            </div>
          ))}
        </Section>
      )}

      {filters.courses.size > 0 && weekOptions.length > 0 && (
        <Section
          title={`Week${filters.weeks.size > 0 ? ` (${filters.weeks.size})` : ''}`}
          collapsed={weekCollapsed}
          onToggle={toggleWeek}
          action={filters.weeks.size > 0 && (
            <button
              className="sm"
              style={{ fontSize: 11, padding: '1px 6px' }}
              onClick={() => setFilters(f => ({ ...f, weeks: new Set() }))}
            >Clear</button>
          )}
        >
          {weekOptions.map(w => (
            <div key={w.label} className={`sidebar-item ${filters.weeks.has(w.label) ? 'active' : ''}`} style={{ fontSize: 12 }} onClick={() => toggleSet('weeks', w.label)}>
              <input type="checkbox" checked={filters.weeks.has(w.label)} readOnly />
              <span style={{ flex: 1 }}>
                <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginRight: 5 }}>{w.label}</span>
                {w.title}
              </span>
              <span className="sidebar-count">{weekCounts[w.label] || 0}</span>
            </div>
          ))}
        </Section>
      )}

      {sources.length > 0 && (
        <Section title="Source" collapsed={sourceCollapsed} onToggle={toggleSource}>
          {sources.map(s => (
            <div key={s} className={`sidebar-item ${filters.sources.has(s) ? 'active' : ''}`} onClick={() => toggleSet('sources', s)}>
              <input type="checkbox" checked={filters.sources.has(s)} readOnly />
              <span>{capitalize(s)}</span>
              <span className="sidebar-count">{sourceCounts[s] || 0}</span>
            </div>
          ))}
        </Section>
      )}

      <Section title="Type" collapsed={typeCollapsed} onToggle={toggleType}>
        {types.map(t => (
          <div key={t} className={`sidebar-item ${filters.types.has(t) ? 'active' : ''}`} onClick={() => toggleSet('types', t)}>
            <input type="checkbox" checked={filters.types.has(t)} readOnly />
            <span>{t}</span>
            <span className="sidebar-count">{typeCounts[t] || 0}</span>
          </div>
        ))}
      </Section>

      <Section title="Topic" collapsed={topicCollapsed} onToggle={toggleTopic}>
        {TOPIC_ORDER.filter(t => topicCounts[t] > 0 || filters.topics.has(t)).map(t => (
          <div key={t} className={`sidebar-item ${filters.topics.has(t) ? 'active' : ''}`} onClick={() => toggleSet('topics', t)}>
            <input type="checkbox" checked={filters.topics.has(t)} readOnly />
            <span>{t}</span>
            <span className="sidebar-count">{topicCounts[t] || 0}</span>
          </div>
        ))}
      </Section>

      {!hideStatusControls && (
        <Section title="Status" collapsed={statusCollapsed} onToggle={toggleStatus}>
          {STATUS_OPTIONS.map(({ key, label }) => (
            <div key={key} className={`sidebar-item ${filters.statuses.has(key) ? 'active' : ''}`} onClick={() => toggleSet('statuses', key)}>
              <input type="checkbox" checked={filters.statuses.has(key)} readOnly />
              <span>{label}</span>
              <span className="sidebar-count">{statusCounts[key] || 0}</span>
            </div>
          ))}
        </Section>
      )}

      <Section
        title={`Tags${filters.selectedTags.size > 0 ? ` (${filters.selectedTags.size})` : ''}`}
        collapsed={tagCollapsed}
        onToggle={toggleTag}
        action={filters.selectedTags.size > 0 && (
          <button
            className="sm"
            style={{ fontSize: 11, padding: '1px 6px' }}
            onClick={() => setFilters(f => ({ ...f, selectedTags: new Set() }))}
          >Clear</button>
        )}
      >
        <div className="filter-search">
          <input
            placeholder="Search tags…"
            value={tagSearch}
            onChange={e => setTagSearch(e.target.value)}
            onClick={e => e.stopPropagation()}
          />
        </div>
        {displayedTags.length === 0 && (
          <div style={{ padding: '4px 14px 8px', fontSize: 12, color: 'var(--text-dim)' }}>No tags found</div>
        )}
        {displayedTags.slice(0, 80).map(([tag, count]) => {
          const isSelected = filters.selectedTags.has(tag)
          return (
            <div
              key={tag}
              className={`sidebar-item${isSelected ? ' active' : ''}`}
              style={{ fontSize: 12 }}
              onClick={() => toggleSet('selectedTags', tag)}
            >
              <span style={{ flex: 1 }}>{tag}</span>
              <span className="sidebar-count">{count}</span>
            </div>
          )
        })}
      </Section>
    </div>
  )
}
