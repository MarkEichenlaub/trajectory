import { useState, useMemo } from 'react'
import { NODES, EDGES, getNode, getChildren, getParents, getRoots, ONTOLOGY_IDS } from '../utils/tagOntology'

function getAncestors(id, acc = new Set()) {
  for (const p of getParents(id)) {
    if (!acc.has(p)) { acc.add(p); getAncestors(p, acc) }
  }
  return acc
}

function isPrimaryChild(childId, parentId) {
  return getParents(childId)[0] === parentId
}

function TreeNode({ id, counts, depth, expanded, toggleExpand, matchSet }) {
  const node = getNode(id)
  if (!node) return null

  const allChildren = getChildren(id)
  const primaryChildren = allChildren.filter(c => isPrimaryChild(c, id))
  const parents = getParents(id)
  const secondaryParents = parents.slice(1)

  const isExpanded = expanded.has(id)
  const hasChildren = primaryChildren.length > 0
  const count = counts[id] || 0
  const isMatch = matchSet.size > 0 && matchSet.has(id)

  return (
    <div className="ont-node-wrap">
      <div
        className={`ont-node depth-${Math.min(depth, 5)}${isMatch ? ' ont-match' : ''}`}
        onClick={() => hasChildren && toggleExpand(id)}
        style={{ cursor: hasChildren ? 'pointer' : 'default' }}
      >
        <span className="ont-toggle">
          {hasChildren ? (isExpanded ? '▾' : '▸') : <span style={{ opacity: 0.3 }}>·</span>}
        </span>
        <span className="ont-label">{node.label}</span>
        {count > 0 && <span className="ont-count">{count}</span>}
        {secondaryParents.length > 0 && (
          <span className="ont-also">
            also: {secondaryParents.map(p => getNode(p)?.label || p).join(', ')}
          </span>
        )}
        {allChildren.length > primaryChildren.length && (
          <span className="ont-xref" title={`${allChildren.length - primaryChildren.length} child(ren) shown under their primary parent`}>
            +{allChildren.length - primaryChildren.length} xref
          </span>
        )}
      </div>
      {isExpanded && primaryChildren.length > 0 && (
        <div className="ont-children">
          {primaryChildren.map(childId => (
            <TreeNode
              key={childId}
              id={childId}
              counts={counts}
              depth={depth + 1}
              expanded={expanded}
              toggleExpand={toggleExpand}
              matchSet={matchSet}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function buildDefaultExpanded() {
  const set = new Set(['ipho'])
  getChildren('ipho').forEach(c => set.add(c))
  return set
}

export default function TagOntologyView({ problems = [] }) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(buildDefaultExpanded)
  const [orphanSearch, setOrphanSearch] = useState('')
  const [orphanPage, setOrphanPage] = useState(0)
  const ORPHAN_PAGE_SIZE = 80

  const counts = useMemo(() => {
    const c = {}
    problems.forEach(item => {
      ;(item.tags || []).forEach(tag => { c[tag] = (c[tag] || 0) + 1 })
    })
    return c
  }, [problems])

  const matchSet = useMemo(() => {
    if (!search.trim()) return new Set()
    const q = search.toLowerCase()
    return new Set(
      NODES.filter(n => n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)).map(n => n.id)
    )
  }, [search])

  // When searching, auto-expand all ancestors of matches
  const effectiveExpanded = useMemo(() => {
    if (!search.trim()) return expanded
    const extra = new Set(expanded)
    matchSet.forEach(id => getAncestors(id).forEach(a => extra.add(a)))
    return extra
  }, [expanded, matchSet, search])

  const orphans = useMemo(() => {
    return Object.entries(counts)
      .filter(([tag]) => !ONTOLOGY_IDS.has(tag))
      .sort((a, b) => b[1] - a[1])
  }, [counts])

  const filteredOrphans = useMemo(() => {
    if (!orphanSearch.trim()) return orphans
    const q = orphanSearch.toLowerCase()
    return orphans.filter(([tag]) => tag.toLowerCase().includes(q))
  }, [orphans, orphanSearch])

  const orphanPageCount = Math.ceil(filteredOrphans.length / ORPHAN_PAGE_SIZE)
  const orphanSlice = filteredOrphans.slice(orphanPage * ORPHAN_PAGE_SIZE, (orphanPage + 1) * ORPHAN_PAGE_SIZE)

  function toggleExpand(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function expandAll() { setExpanded(new Set(NODES.map(n => n.id))) }
  function collapseAll() { setExpanded(new Set(['ipho'])) }

  const roots = getRoots()
  const totalInOntology = NODES.length
  const totalEdges = EDGES.length
  const classifiedCount = Object.entries(counts).filter(([t]) => ONTOLOGY_IDS.has(t)).reduce((s, [, c]) => s + c, 0)
  const orphanProblemCount = Object.entries(counts).filter(([t]) => !ONTOLOGY_IDS.has(t)).reduce((s, [, c]) => s + c, 0)

  return (
    <div className="ont-view">
      <div className="ont-header">
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>Tag Ontology</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-dim)' }}>
            {totalInOntology} nodes · {totalEdges} relationships · {classifiedCount.toLocaleString()} classified problem-tags · {orphans.length} unclassified
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="ont-search"
            placeholder="Search ontology…"
            value={search}
            onChange={e => { setSearch(e.target.value) }}
          />
          <button className="sm" onClick={expandAll}>Expand all</button>
          <button className="sm" onClick={collapseAll}>Collapse all</button>
        </div>
      </div>

      <div className="ont-legend">
        <span className="ont-legend-item"><span className="ont-count" style={{ opacity: 1 }}>12</span> problems with tag</span>
        <span className="ont-legend-item"><span className="ont-also">also: Parent</span> secondary parent</span>
        <span className="ont-legend-item"><span className="ont-xref">+1 xref</span> child shown under primary parent</span>
      </div>

      <div className="ont-tree">
        {roots.map(rootId => (
          <TreeNode
            key={rootId}
            id={rootId}
            counts={counts}
            depth={0}
            expanded={effectiveExpanded}
            toggleExpand={toggleExpand}
            matchSet={matchSet}
          />
        ))}
      </div>

      <div className="ont-orphan-section">
        <div className="ont-orphan-header">
          <div>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Unclassified tags</span>
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-dim)' }}>
              {orphans.length} tags · {orphanProblemCount.toLocaleString()} problem-tags not yet in ontology
            </span>
          </div>
          <input
            className="ont-search"
            style={{ width: 200 }}
            placeholder="Filter unclassified…"
            value={orphanSearch}
            onChange={e => { setOrphanSearch(e.target.value); setOrphanPage(0) }}
          />
        </div>
        <div className="ont-orphan-tags">
          {orphanSlice.map(([tag, count]) => (
            <span key={tag} className="ont-orphan-tag" title={`${count} problem${count !== 1 ? 's' : ''}`}>
              {tag}
              <span className="ont-orphan-count">{count}</span>
            </span>
          ))}
          {filteredOrphans.length === 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-dim)', padding: '4px 0' }}>No tags match</span>
          )}
        </div>
        {orphanPageCount > 1 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
            <button className="sm" disabled={orphanPage === 0} onClick={() => setOrphanPage(p => p - 1)}>← Prev</button>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{orphanPage + 1} / {orphanPageCount}</span>
            <button className="sm" disabled={orphanPage >= orphanPageCount - 1} onClick={() => setOrphanPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}
