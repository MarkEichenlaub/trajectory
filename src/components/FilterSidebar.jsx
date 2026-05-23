import { useState, useMemo } from 'react'

const TOPIC_ORDER = [
  'Mechanics', 'Electromagnetism', 'Waves & Oscillations', 'Optics',
  'Thermodynamics', 'Quantum Physics', 'Relativity',
  'Nuclear/Particle', 'Astrophysics', 'Experimental Methods',
]

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

function Section({ title, collapsed, onToggle, children }) {
  return (
    <div className="sidebar-section">
      <div className="sidebar-section-header" onClick={onToggle}>
        <span>{title}</span>
        <span>{collapsed ? '▶' : '▼'}</span>
      </div>
      {!collapsed && children}
    </div>
  )
}

export default function FilterSidebar({ problems, filters, setFilters, doneIds }) {
  const [contestCollapsed, toggleContest] = useCollapsed('contest')
  const [typeCollapsed, toggleType] = useCollapsed('type')
  const [topicCollapsed, toggleTopic] = useCollapsed('topic')
  const [tagCollapsed, toggleTag] = useCollapsed('tag', true)
  const [tagSearch, setTagSearch] = useState('')

  const contests = useMemo(() => [...new Set(problems.map(p => p.contest))].sort(), [problems])
  const types = useMemo(() => [...new Set(problems.map(p => p.type))].sort(), [problems])

  // Collect all tags
  const allTags = useMemo(() => {
    const counts = {}
    problems.forEach(p => p.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [problems])

  const filteredTags = tagSearch
    ? allTags.filter(([t]) => t.toLowerCase().includes(tagSearch.toLowerCase()))
    : allTags

  // Count problems per topic after other filters
  const topicCounts = useMemo(() => {
    const counts = {}
    TOPIC_ORDER.forEach(t => { counts[t] = 0 })
    problems.forEach(p => {
      p.topics.forEach(t => { if (counts[t] !== undefined) counts[t]++ })
    })
    return counts
  }, [problems])

  function toggleSet(filterKey, value) {
    setFilters(prev => {
      const next = new Set(prev[filterKey])
      if (next.has(value)) next.delete(value); else next.add(value)
      return { ...prev, [filterKey]: next }
    })
  }

  function clearAll() {
    setFilters(prev => ({
      ...prev,
      contests: new Set(),
      types: new Set(),
      topics: new Set(),
    }))
  }

  const hasAnyFilter = filters.contests.size > 0 || filters.types.size > 0 || filters.topics.size > 0 || filters.hideDone

  return (
    <div className="sidebar">
      <div style={{ padding: '8px 14px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Filters</span>
        {hasAnyFilter && <button className="sm" onClick={clearAll}>Clear</button>}
      </div>

      {/* Hide done */}
      <div className="sidebar-item" onClick={() => setFilters(f => ({ ...f, hideDone: !f.hideDone }))}>
        <input type="checkbox" checked={filters.hideDone} readOnly />
        <span>Hide assigned</span>
        <span className="sidebar-count">{doneIds.size}</span>
      </div>

      <Section title="Contest" collapsed={contestCollapsed} onToggle={toggleContest}>
        {contests.map(c => (
          <div key={c} className={`sidebar-item ${filters.contests.has(c) ? 'active' : ''}`} onClick={() => toggleSet('contests', c)}>
            <input type="checkbox" checked={filters.contests.has(c)} readOnly />
            <span>{c}</span>
            <span className="sidebar-count">{problems.filter(p => p.contest === c).length}</span>
          </div>
        ))}
      </Section>

      <Section title="Type" collapsed={typeCollapsed} onToggle={toggleType}>
        {types.map(t => (
          <div key={t} className={`sidebar-item ${filters.types.has(t) ? 'active' : ''}`} onClick={() => toggleSet('types', t)}>
            <input type="checkbox" checked={filters.types.has(t)} readOnly />
            <span>{t}</span>
            <span className="sidebar-count">{problems.filter(p => p.type === t).length}</span>
          </div>
        ))}
      </Section>

      <Section title="Topic" collapsed={topicCollapsed} onToggle={toggleTopic}>
        {TOPIC_ORDER.filter(t => topicCounts[t] > 0).map(t => (
          <div key={t} className={`sidebar-item ${filters.topics.has(t) ? 'active' : ''}`} onClick={() => toggleSet('topics', t)}>
            <input type="checkbox" checked={filters.topics.has(t)} readOnly />
            <span>{t}</span>
            <span className="sidebar-count">{topicCounts[t]}</span>
          </div>
        ))}
      </Section>

      <Section title="Tags" collapsed={tagCollapsed} onToggle={toggleTag}>
        <div className="filter-search">
          <input
            placeholder="Search tags…"
            value={tagSearch}
            onChange={e => setTagSearch(e.target.value)}
            onClick={e => e.stopPropagation()}
          />
        </div>
        {filteredTags.slice(0, 60).map(([tag, count]) => (
          <div
            key={tag}
            className="sidebar-item"
            style={{ fontSize: 12 }}
            onClick={() => setFilters(f => ({
              ...f,
              textSearch: f.textSearch ? f.textSearch : tag,
            }))}
          >
            <span style={{ flex: 1 }}>{tag}</span>
            <span className="sidebar-count">{count}</span>
          </div>
        ))}
      </Section>
    </div>
  )
}
