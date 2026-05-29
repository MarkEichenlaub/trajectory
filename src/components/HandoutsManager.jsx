import { useState } from 'react'
import { saveHandout, deleteHandout, uploadHandoutPDF } from '../utils/supabase'

const TOPIC_ORDER = [
  'Mechanics', 'Electromagnetism', 'Waves & Oscillations', 'Optics',
  'Thermodynamics', 'Quantum Physics', 'Relativity',
  'Nuclear/Particle', 'Astrophysics', 'Experimental Methods',
]

const EMPTY_FORM = { resource_type: 'handout', name: '', source: '', description: '', topics: [], tagsInput: '', file: null }

export default function HandoutsManager({ handouts, onHandoutsChange, showToast }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  function toggleTopic(topic) {
    setForm(f => ({
      ...f,
      topics: f.topics.includes(topic)
        ? f.topics.filter(t => t !== topic)
        : [...f.topics, topic],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.source.trim()) {
      showToast('Name and source are required', 'error')
      return
    }
    setSaving(true)
    try {
      const id = `handout-${Date.now()}`
      let pdf_url = ''
      if (form.file) {
        pdf_url = await uploadHandoutPDF(form.file, id)
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
      })
      await onHandoutsChange()
      setForm(EMPTY_FORM)
      showToast('Handout added')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteHandout(id)
      await onHandoutsChange()
      showToast('Handout deleted')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="assigned-view">
      <div className="assigned-header">
        <h2>Handouts</h2>
        <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{handouts.length} handout{handouts.length !== 1 ? 's' : ''}</span>
      </div>

      <form onSubmit={handleSubmit} className="session-edit-card" style={{ marginBottom: 24 }}>
        <div className="student-card-row">
          <label>Type</label>
          <div style={{ display: 'flex', gap: 12 }}>
            {['handout', 'book'].map(t => (
              <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="resource_type"
                  value={t}
                  checked={form.resource_type === t}
                  onChange={() => setForm(f => ({ ...f, resource_type: t }))}
                  style={{ accentColor: 'var(--accent)' }}
                />
                {t === 'handout' ? 'Handout' : 'Book'}
              </label>
            ))}
          </div>
        </div>
        <div className="student-card-row">
          <label>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Thévenin Equivalents"
            style={{ flex: 1 }}
          />
        </div>
        <div className="student-card-row">
          <label>{form.resource_type === 'book' ? 'Author' : 'Source'}</label>
          <input
            type="text"
            value={form.source}
            onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
            placeholder={form.resource_type === 'book' ? 'Purcell, Griffiths…' : 'PhysicsWOOT, class notes…'}
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
          <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 2 }}>
            {TOPIC_ORDER.map(t => (
              <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer', userSelect: 'none' }}>
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
        <div className="student-card-row">
          <label>PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={e => setForm(f => ({ ...f, file: e.target.files[0] || null }))}
            style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="submit" className="sm primary" disabled={saving}>
            {saving ? 'Uploading…' : 'Add Handout'}
          </button>
        </div>
      </form>

      {handouts.length === 0 ? (
        <div className="empty-state">No handouts yet.</div>
      ) : (
        <div className="assigned-list">
          {handouts.map(h => (
            <div key={h.id} className="assigned-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <span className="p-name" style={{ fontWeight: 500 }}>{h.name}</span>
                  <span className="p-label" style={{ color: 'var(--text-dim)', fontSize: 11, marginLeft: 8 }}>
                    {h.resource_type === 'book' ? 'Book' : 'Handout'} · {h.source}
                  </span>
                </div>
                <div className="assigned-row-links">
                  {h.pdf_url && <a href={h.pdf_url} target="_blank" rel="noreferrer">PDF ↗</a>}
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
                {(h.topics || []).map(t => <span key={t} className="tag topic">{t}</span>)}
                {(h.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
