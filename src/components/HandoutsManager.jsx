import { useState, useMemo } from 'react'
import { saveHandout, deleteHandout, uploadHandoutPDF, uploadHandoutSolutionPDF } from '../utils/supabase'
import HomeworkDraftsPanel from './HomeworkDraftsPanel'

const TOPIC_ORDER = [
  'Mechanics', 'Electromagnetism', 'Waves & Oscillations', 'Optics',
  'Thermodynamics', 'Quantum Physics', 'Relativity',
  'Nuclear/Particle', 'Astrophysics', 'Experimental Methods',
]

const EMPTY_FORM = { resource_type: 'handout', name: '', source: '', description: '', topics: [], tagsInput: '', file: null, year: '', solutionFile: null }

function handoutToForm(h) {
  return {
    resource_type: h.resource_type || 'handout',
    name: h.name || '',
    source: h.source || '',
    description: h.description || '',
    topics: h.topics || [],
    tagsInput: (h.tags || []).join(', '),
    file: null,
    year: h.year ? String(h.year) : '',
    solutionFile: null,
  }
}

function scoreHandout(h, q) {
  if (!q) return 0
  const lower = q.toLowerCase()
  let score = 0
  if (h.name.toLowerCase().includes(lower)) score += 4
  if ((h.description || '').toLowerCase().includes(lower)) score += 2
  if ((h.tags || []).some(t => t.toLowerCase().includes(lower))) score += 2
  if ((h.topics || []).some(t => t.toLowerCase().includes(lower))) score += 1
  if ((h.source || '').toLowerCase().includes(lower)) score += 1
  return score
}

export default function HandoutsManager({ handouts, drafts = [], onDraftRequestChanges, onDraftApprove, onDraftDiscard, onHandoutsChange, showToast }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState(new Set())

  // Collect all tags across all handouts with frequency counts
  const allTagCounts = useMemo(() => {
    const counts = {}
    handouts.forEach(h => {
      ;(h.tags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1 })
      ;(h.topics || []).forEach(t => { counts[t] = (counts[t] || 0) + 1 })
    })
    return counts
  }, [handouts])

  const sortedTags = useMemo(() =>
    Object.entries(allTagCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    [allTagCounts]
  )

  const filtered = useMemo(() => {
    let list = handouts

    // Tag filter
    if (selectedTags.size > 0) {
      list = list.filter(h => {
        const allH = [...(h.tags || []), ...(h.topics || [])]
        return [...selectedTags].every(t => allH.includes(t))
      })
    }

    if (!searchQuery.trim()) return list

    const q = searchQuery.trim()
    const scored = list
      .map(h => ({ h, score: scoreHandout(h, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
    return scored.map(({ h }) => h)
  }, [handouts, searchQuery, selectedTags])

  function toggleTag(tag) {
    setSelectedTags(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag); else next.add(tag)
      return next
    })
  }

  function toggleTopic(topic) {
    setForm(f => ({
      ...f,
      topics: f.topics.includes(topic)
        ? f.topics.filter(t => t !== topic)
        : [...f.topics, topic],
    }))
  }

  function formDirty() {
    const existing = editingId ? handouts.find(h => h.id === editingId) : null
    const baseline = existing ? handoutToForm(existing) : EMPTY_FORM
    return JSON.stringify(form) !== JSON.stringify(baseline)
  }

  function startEdit(h) {
    if (formDirty() && !confirm('Discard unsaved changes?')) return
    setForm(handoutToForm(h))
    setEditingId(h.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    if (formDirty() && !confirm('Discard unsaved changes?')) return
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.source.trim()) {
      showToast('Name and source are required', 'error')
      return
    }
    setSaving(true)
    try {
      const id = editingId || `handout-${Date.now()}`
      let pdf_url = ''
      let solution_url = ''

      if (editingId) {
        const existing = handouts.find(h => h.id === editingId)
        pdf_url = existing?.pdf_url || ''
        solution_url = existing?.solution_url || ''
      }

      if (form.file) {
        pdf_url = await uploadHandoutPDF(form.file, id)
      }

      if (form.solutionFile) {
        solution_url = await uploadHandoutSolutionPDF(form.solutionFile, id)
      }

      await saveHandout({
        id,
        resource_type: form.resource_type,
        source: form.source.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        topics: form.topics,
        tags: (form.tagsInput || '').split(',').map(t => t.trim()).filter(Boolean),
        pdf_url,
        solution_url,
        year: form.resource_type === 'exam' ? (parseInt(form.year) || 0) : 0,
      })
      await onHandoutsChange()
      setForm(EMPTY_FORM)
      setEditingId(null)
      showToast(editingId ? 'Saved' : 'Handout added')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteHandout(id)
      if (editingId === id) { setForm(EMPTY_FORM); setEditingId(null) }
      await onHandoutsChange()
      showToast('Handout deleted')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const isBook = form.resource_type === 'book'
  const isExam = form.resource_type === 'exam'
  const typeLabel = isBook ? 'Book' : isExam ? 'Exam' : 'Handout'

  return (
    <div className="assigned-view">
      <HomeworkDraftsPanel
        drafts={drafts}
        onRequestChanges={onDraftRequestChanges}
        onApprove={onDraftApprove}
        onDiscard={onDraftDiscard}
      />

      <div className="assigned-header">
        <h2>{editingId ? 'Edit' : 'Add'} {typeLabel}</h2>
        <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{handouts.length} resource{handouts.length !== 1 ? 's' : ''}</span>
      </div>

      <form onSubmit={handleSubmit} className="session-edit-card" style={{ marginBottom: 24 }}>
        <div className="student-card-row">
          <label>Type</label>
          <div style={{ display: 'flex', gap: 12 }}>
            {['handout', 'book', 'exam'].map(t => (
              <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="resource_type"
                  value={t}
                  checked={form.resource_type === t}
                  onChange={() => setForm(f => ({ ...f, resource_type: t }))}
                  style={{ accentColor: 'var(--accent)' }}
                />
                {t === 'handout' ? 'Handout' : t === 'book' ? 'Book' : 'Exam'}
              </label>
            ))}
          </div>
        </div>
        {isExam && (
          <div className="student-card-row">
            <label>Year</label>
            <input
              type="number"
              value={form.year}
              onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
              placeholder="2025"
              style={{ width: 100 }}
            />
          </div>
        )}
        <div className="student-card-row">
          <label>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder={isBook ? 'Introduction to Electrodynamics' : 'Thévenin Equivalents'}
            style={{ flex: 1 }}
          />
        </div>
        <div className="student-card-row">
          <label>{isBook ? 'Author' : 'Source'}</label>
          <input
            type="text"
            value={form.source}
            onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
            placeholder={isBook ? 'Purcell, Griffiths…' : isExam ? 'F=ma' : 'PhysicsWOOT, class notes…'}
            style={{ flex: 1 }}
          />
        </div>
        <div className="student-card-row" style={{ alignItems: 'flex-start' }}>
          <label style={{ paddingTop: 6 }}>Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief description…"
            rows={2}
            style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 4, padding: '6px 8px', fontSize: 13, resize: 'vertical' }}
          />
        </div>
        <div className="student-card-row" style={{ alignItems: 'flex-start' }}>
          <label style={{ paddingTop: 4 }}>Topics</label>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 2 }}>
            {TOPIC_ORDER.map(t => (
              <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', width: 'auto' }}>
                <input
                  type="checkbox"
                  checked={form.topics.includes(t)}
                  onChange={() => toggleTopic(t)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                {t}
              </label>
            ))}
          </div>
        </div>
        <div className="student-card-row">
          <label>Tags</label>
          <input
            type="text"
            value={form.tagsInput}
            onChange={e => setForm(f => ({ ...f, tagsInput: e.target.value }))}
            placeholder="Thévenin, circuit analysis, DC circuits"
            style={{ flex: 1 }}
          />
        </div>
        <div className="student-card-row" style={{ alignItems: 'flex-start' }}>
          <label style={{ paddingTop: 4 }}>{isExam ? 'Exam PDF' : 'PDF'}</label>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {editingId && (() => {
              const existing = handouts.find(h => h.id === editingId)
              return existing?.pdf_url
                ? <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                    Current: <a href={existing.pdf_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>view ↗</a>
                    {' '}— upload below to replace
                  </div>
                : <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>No PDF attached — upload one below</div>
            })()}
            <input
              type="file"
              accept=".pdf"
              onChange={e => setForm(f => ({ ...f, file: e.target.files[0] || null }))}
              style={{ fontSize: 13, color: 'var(--text)' }}
            />
          </div>
        </div>
        {isExam && (
          <div className="student-card-row" style={{ alignItems: 'flex-start' }}>
            <label style={{ paddingTop: 4 }}>Solutions PDF</label>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {editingId && (() => {
                const existing = handouts.find(h => h.id === editingId)
                return existing?.solution_url
                  ? <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                      Current: <a href={existing.solution_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>view ↗</a>
                      {' '}— upload below to replace
                    </div>
                  : <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>No solutions PDF attached</div>
              })()}
              <input
                type="file"
                accept=".pdf"
                onChange={e => setForm(f => ({ ...f, solutionFile: e.target.files[0] || null }))}
                style={{ fontSize: 13, color: 'var(--text)' }}
              />
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          {editingId && (
            <button type="button" className="sm" onClick={cancelEdit}>Cancel</button>
          )}
          <button type="submit" className="sm primary" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add'}
          </button>
        </div>
      </form>

      {handouts.length === 0 ? (
        <div className="empty-state">No handouts yet.</div>
      ) : (
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

          {/* Tag pane */}
          {sortedTags.length > 0 && (
            <div style={{ width: 180, flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', position: 'sticky', top: 0, maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ padding: '10px 10px 8px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 0 }}>
                  Tags
                </div>
              </div>
              {selectedTags.size > 0 && (
                <div style={{ padding: '6px 10px 0' }}>
                  <button className="sm" onClick={() => setSelectedTags(new Set())}
                    style={{ width: '100%', fontSize: 11, background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    Clear {selectedTags.size} filter{selectedTags.size > 1 ? 's' : ''}
                  </button>
                </div>
              )}
              <div style={{ paddingBottom: 6, paddingTop: 4 }}>
                {sortedTags.map(([tag, count]) => (
                  <div key={tag} onClick={() => toggleTag(tag)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '3px 10px', cursor: 'pointer', fontSize: 12,
                      background: selectedTags.has(tag) ? 'var(--accent-dim)' : 'transparent',
                      color: selectedTags.has(tag) ? 'var(--accent)' : 'var(--text)',
                      borderLeft: `2px solid ${selectedTags.has(tag) ? 'var(--accent)' : 'transparent'}`,
                    }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tag}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 4, flexShrink: 0 }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="search-bar" style={{ marginBottom: 10 }}>
              <input
                placeholder="Search titles, descriptions, tags…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <span className="result-count">
                {filtered.length} of {handouts.length}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">No handouts match.</div>
            ) : (
              <div className="assigned-list">
                {filtered.map(h => (
                  <div
                    key={h.id}
                    className={`assigned-row${editingId === h.id ? ' selected' : ''}`}
                    style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <span className="p-name" style={{ fontWeight: 500 }}>{h.name}</span>
                        <span className="p-label" style={{ color: 'var(--text-dim)', fontSize: 11, marginLeft: 8 }}>
                          {h.resource_type === 'book' ? 'Book' : h.resource_type === 'exam' ? 'Exam' : 'Handout'} · {h.source}
                          {h.resource_type === 'exam' && h.year ? ` · ${h.year}` : ''}
                        </span>
                      </div>
                      <div className="assigned-row-links">
                        {h.pdf_url && <a href={h.pdf_url} target="_blank" rel="noreferrer">{h.resource_type === 'exam' ? 'Exam ↗' : 'PDF ↗'}</a>}
                        {h.solution_url && <a href={h.solution_url} target="_blank" rel="noreferrer">Solutions ↗</a>}
                        <button
                          className="sm"
                          style={{ fontSize: 11, padding: '1px 6px' }}
                          onClick={() => startEdit(h)}
                        >Edit</button>
                        <button
                          className="sm danger"
                          style={{ fontSize: 11, padding: '1px 6px' }}
                          onClick={() => handleDelete(h.id)}
                        >✕</button>
                      </div>
                    </div>
                    {h.description && (
                      <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>{h.description}</p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(h.topics || []).map(t => (
                        <span key={t} className="tag topic" style={{ cursor: 'pointer' }}
                          onClick={() => toggleTag(t)}>
                          {t}
                        </span>
                      ))}
                      {(h.tags || []).map(t => (
                        <span key={t} className="tag" style={{ cursor: 'pointer' }}
                          onClick={() => toggleTag(t)}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
