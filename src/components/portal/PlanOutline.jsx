// Renders the plan that sits above the progress reports: what we're doing next
// session, then the month-by-month route to the goal exam. Both the admin view
// and the student/parent view show the same thing; only the admin can edit it.

import { useEffect, useRef, useState } from 'react'

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

// Plain text in, month cards out:
//   Sep 2026: F=ma Topics
//   > an optional note
//   - a bullet
export function parsePlanOutline(text) {
  const blocks = []
  for (const raw of (text || '').split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('-') || line.startsWith('*')) {
      if (blocks.length) blocks[blocks.length - 1].items.push(line.slice(1).trim())
    } else if (line.startsWith('>')) {
      if (blocks.length) blocks[blocks.length - 1].note = line.slice(1).trim()
    } else {
      const i = line.indexOf(':')
      const heading = i >= 0 ? line.slice(0, i).trim() : line
      const title = i >= 0 ? line.slice(i + 1).trim() : ''
      blocks.push({ heading, title, items: [], note: '' })
    }
  }
  return blocks
}

// "Sep 2026" — matched loosely so "September 2026" and "Sept. 2026" also work.
function isCurrentMonth(heading) {
  const now = new Date()
  const m = MONTHS[now.getMonth()]
  const h = heading.toLowerCase()
  return h.startsWith(m) && h.includes(String(now.getFullYear()))
}

// In the admin view the next-session line is click-to-edit in place: it's the
// one part of the plan that changes after every session, and the full editor
// sits below a year of month cards, off the bottom of the screen.
function NextSessionBox({ nextSession, editable, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(nextSession || '')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { setDraft(nextSession || '') }, [nextSession])
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  if (!nextSession && !editable) return null

  async function save() {
    setSaving(true)
    try {
      await onSave(draft.trim())
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setDraft(nextSession || '')
    setEditing(false)
  }

  return (
    <div style={{
      background: 'var(--accent-dim)', border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius)', padding: '14px 18px',
      cursor: editable && !editing ? 'text' : 'default',
    }}
      onClick={editable && !editing ? () => setEditing(true) : undefined}
      title={editable && !editing ? 'Click to edit' : undefined}
    >
      <div style={{
        fontSize: 11, fontWeight: 600, color: 'var(--text-dim)',
        textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
      }}>Next session</div>

      {editing ? (
        <div>
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') cancel()
            }}
            placeholder="What we're doing next time"
            style={{ width: '100%', fontSize: 15 }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="sm primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="sm" onClick={cancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 15, color: 'var(--text-strong)', lineHeight: 1.5 }}>
          {nextSession || <span style={{ color: 'var(--muted)' }}>Click to say what's next…</span>}
        </div>
      )}
    </div>
  )
}

export default function PlanOutline({ nextSession, outline, editable = false, onSaveNextSession, onEditPlan }) {
  const blocks = parsePlanOutline(outline)
  if (!editable && !nextSession && blocks.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <NextSessionBox nextSession={nextSession} editable={editable} onSave={onSaveNextSession} />

      {(blocks.length > 0 || editable) && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 12px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>The plan</h3>
            {editable && onEditPlan && (
              <button className="sm" onClick={onEditPlan}>{blocks.length ? 'Edit months' : 'Add months'}</button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {blocks.map((b, i) => {
              const current = isCurrentMonth(b.heading)
              return (
                <div key={i} style={{
                  background: 'var(--surface)',
                  border: `1px solid ${current ? 'var(--border-strong)' : 'var(--border)'}`,
                  borderLeft: `3px solid ${current ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)', padding: '12px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {b.heading}
                    </span>
                    {b.title && <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-strong)' }}>{b.title}</span>}
                  </div>
                  {b.note && (
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic', marginTop: 6 }}>{b.note}</div>
                  )}
                  {b.items.length > 0 && (
                    <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13, lineHeight: 1.7, color: 'var(--text)' }}>
                      {b.items.map((it, j) => <li key={j}>{it}</li>)}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
