// Renders the plan that sits above the progress reports: what we're doing next
// session, then the month-by-month route to the goal exam. Both the admin view
// and the student/parent view show the same thing; only the admin can edit it.

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

export default function PlanOutline({ nextSession, outline }) {
  const blocks = parsePlanOutline(outline)
  if (!nextSession && blocks.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {nextSession && (
        <div style={{
          background: 'var(--accent-dim)', border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius)', padding: '14px 18px',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: 'var(--text-dim)',
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
          }}>Next session</div>
          <div style={{ fontSize: 15, color: 'var(--text-strong)', lineHeight: 1.5 }}>{nextSession}</div>
        </div>
      )}

      {blocks.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>The plan</h3>
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
