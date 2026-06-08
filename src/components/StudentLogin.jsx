import { useState, useEffect } from 'react'
import { supabase, getTrialAvailability, bookTrial } from '../utils/supabase'

const MARK_EMAIL = 'mark@eichenlaubphysics.com'

export default function StudentLogin({ studentName }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{
        borderBottom: '1px solid var(--border)', background: 'var(--surface)',
        padding: '0 28px', height: 52, display: 'flex', alignItems: 'center',
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', fontFamily: 'var(--font-display)' }}>
          Eichenlaub Physics
        </span>
      </div>

      <div style={{
        maxWidth: 1060, margin: '0 auto', padding: '48px 24px 64px',
        display: 'flex', gap: 56, alignItems: 'flex-start', flexWrap: 'wrap',
      }}>
        {/* ── Sign in (existing students) ── */}
        <div style={{ flex: '0 0 300px' }}>
          <h2 style={{ fontSize: 11, fontWeight: 600, marginBottom: 20, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Existing Students
          </h2>
          <SignInCard studentName={studentName} />
        </div>

        {/* ── New Students ── */}
        <div style={{ flex: '1 1 520px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>
            New Students
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-dim)', marginBottom: 6, maxWidth: 520 }}>
            Book a free 30-minute trial session. We'll work through a problem together so you can see
            the tutoring style before committing to anything.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.65, marginBottom: 28, maxWidth: 520 }}>
            Questions or general inquiries?{' '}
            <a
              href={`mailto:${MARK_EMAIL}`}
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
            >
              {MARK_EMAIL}
            </a>
          </p>

          <TrialBookingWidget />
        </div>
      </div>
    </div>
  )
}

function SignInCard({ studentName }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.href },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '28px 24px',
    }}>
      {studentName && (
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>
          Sign in to view {studentName}'s assignments
        </p>
      )}

      {sent ? (
        <div style={{ lineHeight: 1.6, color: 'var(--text)' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>✉</div>
          <p style={{ fontSize: 14 }}>Check your email for a login link.</p>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>
            The link expires after 1 hour. Check your spam folder if you don't see it.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ fontSize: 12, color: 'var(--text-dim)' }}>Your email address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
            style={{ width: '100%' }}
          />
          {error && <p style={{ fontSize: 12, color: 'var(--red)', margin: 0 }}>{error}</p>}
          <button type="submit" className="primary" disabled={loading} style={{ width: '100%', padding: 9, fontSize: 14, marginTop: 2 }}>
            {loading ? 'Sending…' : 'Send login link'}
          </button>
        </form>
      )}
    </div>
  )
}

function TrialBookingWidget() {
  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const viewYear = viewDate.getFullYear()
  const viewMonth = viewDate.getMonth()

  const [slotsByDate, setSlotsByDate] = useState({})
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)

  // Booking form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [working, setWorking] = useState(false)
  const [formError, setFormError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    setSlotsLoading(true)
    setSlotsByDate({})
    const from = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-CA')
    const to = new Date(viewYear, viewMonth + 1, 0).toLocaleDateString('en-CA')
    getTrialAvailability(from, to)
      .then(slots => {
        const byDate = {}
        slots.forEach(iso => {
          const key = new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
          if (!byDate[key]) byDate[key] = []
          byDate[key].push(iso)
        })
        setSlotsByDate(byDate)
      })
      .catch(e => console.error('Trial availability fetch failed:', e))
      .finally(() => setSlotsLoading(false))
  }, [viewYear, viewMonth])

  const firstDow = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7
  const todayKey = new Date().toLocaleDateString('en-CA')
  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function clearSelection() {
    setSelectedDay(null)
    setSelectedSlot(null)
    setFormError(null)
    setName('')
    setEmail('')
    setNotes('')
  }

  function prevMonth() { setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)); clearSelection() }
  function nextMonth() { setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); clearSelection() }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedSlot || !name.trim() || !email.trim()) return
    setWorking(true)
    setFormError(null)
    try {
      await bookTrial({ slot: selectedSlot, name: name.trim(), email: email.trim(), notes: notes.trim() })
      setSuccessMsg(`Your trial session is confirmed! A calendar invite is on its way to ${email.trim()}.`)
      clearSelection()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setWorking(false)
    }
  }

  const daySlots = selectedDay ? (slotsByDate[selectedDay] || []) : []

  function renderPanel() {
    if (successMsg) {
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>Session confirmed!</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>{successMsg}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            Mark will follow up with more details. Feel free to email{' '}
            <a href={`mailto:${MARK_EMAIL}`} style={{ color: 'var(--accent)' }}>{MARK_EMAIL}</a> with questions.
          </div>
        </div>
      )
    }

    if (selectedSlot) {
      const when = new Date(selectedSlot).toLocaleString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
        hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', timeZoneName: 'short',
      })
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>30-minute trial session</div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 3 }}>{when}</div>
            </div>
            <button className="sm" style={{ fontSize: 11, padding: '1px 6px', flexShrink: 0, marginLeft: 8 }} onClick={() => setSelectedSlot(null)}>✕</button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Your name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="First and last name"
                required
                autoFocus
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Your email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>
                About you / your student{' '}
                <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. 10th grader, taking AP Physics next year, wants help with mechanics and problem-solving…"
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }}
              />
            </div>
            {formError && <div style={{ fontSize: 12, color: 'var(--red)' }}>{formError}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <button type="submit" className="sm primary" disabled={working || !name.trim() || !email.trim()}>
                {working ? 'Booking…' : 'Confirm trial session'}
              </button>
              <button type="button" className="sm" disabled={working} onClick={() => setSelectedSlot(null)}>Back</button>
            </div>
          </form>
        </div>
      )
    }

    if (selectedDay && daySlots.length > 0) {
      const dateLabel = new Date(`${selectedDay}T12:00:00Z`).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Available times — {dateLabel}</div>
            <button className="sm" style={{ fontSize: 11, padding: '1px 6px' }} onClick={clearSelection}>✕</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {daySlots.map(slot => (
              <button
                key={slot}
                className="sm"
                style={{ fontSize: 12 }}
                onClick={() => setSelectedSlot(slot)}
              >
                {new Date(slot).toLocaleTimeString('en-US', {
                  hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York',
                })}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>All times Eastern · 30-minute sessions</div>
        </div>
      )
    }

    if (selectedDay && daySlots.length === 0 && !slotsLoading) {
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>No available times on this day.</div>
          <button className="sm" style={{ marginTop: 8 }} onClick={clearSelection}>Back</button>
        </div>
      )
    }

    return null
  }

  return (
    <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Month navigator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="sm" onClick={prevMonth}>‹</button>
        <span style={{ fontSize: 15, fontWeight: 600, flex: 1, textAlign: 'center' }}>{monthLabel}</span>
        <button className="sm" onClick={nextMonth}>›</button>
        {slotsLoading && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Loading…</span>}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={{
            fontSize: 10, fontWeight: 600, color: 'var(--text-dim)',
            padding: '4px 0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>{d}</div>
        ))}
        {Array.from({ length: totalCells }, (_, i) => {
          const dayNum = i - firstDow + 1
          if (dayNum < 1 || dayNum > daysInMonth) return <div key={i} />
          const key = new Date(viewYear, viewMonth, dayNum).toLocaleDateString('en-CA')
          const daySlotList = slotsByDate[key] || []
          const hasSlots = daySlotList.length > 0
          const isToday = key === todayKey
          const isSelected = selectedDay === key

          let bg = 'transparent'
          if (isSelected) bg = 'var(--accent)'
          else if (hasSlots) bg = 'var(--surface)'

          return (
            <div
              key={key}
              onClick={hasSlots ? () => { setSelectedDay(key); setSelectedSlot(null); setFormError(null) } : undefined}
              style={{
                padding: '6px 2px', borderRadius: 6,
                cursor: hasSlots ? 'pointer' : 'default',
                background: bg,
                border: `1px solid ${isToday || (hasSlots && !isSelected) ? 'var(--border)' : 'transparent'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                minHeight: 44,
              }}
            >
              <span style={{
                fontSize: 13,
                fontWeight: hasSlots ? 500 : 400,
                color: isSelected ? 'white' : hasSlots ? 'var(--text)' : isToday ? 'var(--text)' : 'var(--text-dim)',
              }}>
                {dayNum}
              </span>
              {hasSlots && !isSelected && (
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }} />
              )}
            </div>
          )
        })}
      </div>

      {renderPanel()}

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          {slotsLoading
            ? 'Checking availability…'
            : 'Highlighted days have available 30-minute slots · all times Eastern'}
        </div>
      </div>
    </div>
  )
}
