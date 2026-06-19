import { useState, useEffect, useMemo } from 'react'
import { getAvailability, bookSession, rescheduleSession, cancelSession } from '../../utils/supabase'

export default function SchedulingTab({ sessions, formatDate, student, isPreview, isAdmin, sessionProblems, allProblems }) {
  const nowIso = new Date().toISOString()
  const tz = student?.timezone || 'America/New_York'
  const tzAbbr = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' })
    .formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value || tz

  // Local session mutations (avoid needing to re-fetch from parent after actions)
  const [localAdded, setLocalAdded] = useState([])
  const [canceledIds, setCanceledIds] = useState(new Set())
  const [updatedSessions, setUpdatedSessions] = useState({})

  const effectiveSessions = useMemo(() => {
    return [...(sessions || []), ...localAdded]
      .filter(s => !canceledIds.has(s.id))
      .map(s => updatedSessions[s.id] ? { ...s, ...updatedSessions[s.id] } : s)
  }, [sessions, localAdded, canceledIds, updatedSessions])

  const upcoming = useMemo(() =>
    effectiveSessions
      .filter(s => s.scheduled_at > nowIso)
      .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)),
    [effectiveSessions, nowIso]
  )

  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const viewYear = viewDate.getFullYear()
  const viewMonth = viewDate.getMonth()

  // Availability slots by student timezone date
  const [slotsByDate, setSlotsByDate] = useState({})
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // UI state
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null) // YYYY-MM-DD for booking
  const [reschedulingId, setReschedulingId] = useState(null) // session.id being rescheduled
  const [pendingSlot, setPendingSlot] = useState(null) // ISO slot being confirmed
  const [cancelingSession, setCancelingSession] = useState(null)
  const [cancelMsg, setCancelMsg] = useState('')
  const [working, setWorking] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Fetch availability for the visible month. Previously-loaded days stay on
  // screen (dimmed) while the new month loads — keys are full dates, so months
  // never collide.
  useEffect(() => {
    if (!student?.id) return
    setSlotsLoading(true)
    setSlotsError(null)
    const from = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-CA')
    const to = new Date(viewYear, viewMonth + 1, 0).toLocaleDateString('en-CA')
    getAvailability(from, to)
      .then(slots => {
        const byDate = {}
        slots.forEach(iso => {
          const key = new Date(iso).toLocaleDateString('en-CA', { timeZone: tz })
          if (!byDate[key]) byDate[key] = []
          byDate[key].push(iso)
        })
        // Replace this month's entries wholesale (a re-fetch must drop days
        // whose slots were booked out) but keep other months' cached days.
        const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
        setSlotsByDate(prev => {
          const next = {}
          for (const [day, isos] of Object.entries(prev)) {
            if (!day.startsWith(monthPrefix)) next[day] = isos
          }
          return { ...next, ...byDate }
        })
      })
      .catch(e => setSlotsError(e.message))
      .finally(() => setSlotsLoading(false))
  }, [viewYear, viewMonth, student?.id, isPreview, refreshKey, tz])

  const sessionsByDate = useMemo(() => {
    const map = {}
    upcoming.forEach(s => {
      const key = new Date(s.scheduled_at).toLocaleDateString('en-CA')
      if (!map[key]) map[key] = []
      map[key].push(s)
    })
    return map
  }, [upcoming])

  const firstDow = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7
  const todayKey = new Date().toLocaleDateString('en-CA')
  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function prevMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    clearAction()
  }
  function nextMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    clearAction()
  }
  function clearAction() {
    setSelectedSession(null); setSelectedDay(null); setReschedulingId(null)
    setPendingSlot(null); setCancelingSession(null); setCancelMsg('')
    setActionError(null); setSuccessMsg(null)
  }

  function handleDayClick(key, daySessions, daySlots) {
    setActionError(null); setSuccessMsg(null)
    if (reschedulingId) {
      // In reschedule mode: show slots for any day
      if (daySlots.length) { setSelectedDay(key); setSelectedSession(null) }
      return
    }
    if (daySessions.length) {
      setSelectedSession(daySessions[0]); setSelectedDay(null)
    } else if (daySlots.length) {
      setSelectedDay(key); setSelectedSession(null)
    }
  }

  async function handleBook(slot) {
    if (!student || isPreview) return
    setPendingSlot(slot)
  }

  async function confirmBook() {
    if (!pendingSlot || working) return
    setWorking(true); setActionError(null)
    try {
      // Admins book on the active student's behalf; students book for themselves.
      const result = await bookSession(pendingSlot, isAdmin ? student.id : undefined)
      setLocalAdded(prev => [...prev, {
        id: result.session_id,
        student_id: student.id,
        scheduled_at: result.scheduled_at,
        end_time: result.end_time,
        miro_board_url: result.miro_board_url,
        miro_board_id: result.miro_board_id,
        meet_url: result.meet_url,
        gcal_event_id: result.gcal_event_id,
      }])
      setSuccessMsg(isAdmin
        ? `Session booked for ${student?.first_name || student?.name}! The calendar invite, Google Meet link, and whiteboard have been emailed to the family.`
        : 'Session booked! A confirmation with the calendar invite, Google Meet link, and whiteboard is on its way to your email.')
      setRefreshKey(k => k + 1)
      clearAction()
    } catch (e) {
      setActionError(e.message)
    } finally {
      setWorking(false)
    }
  }

  async function confirmReschedule() {
    if (!pendingSlot || !reschedulingId || working) return
    setWorking(true); setActionError(null)
    try {
      const result = await rescheduleSession(reschedulingId, pendingSlot)
      setUpdatedSessions(prev => ({ ...prev, [reschedulingId]: {
        scheduled_at: result.scheduled_at,
        end_time: result.end_time,
      }}))
      setSuccessMsg('Session rescheduled! Check your email for the updated calendar invite.')
      setRefreshKey(k => k + 1)
      clearAction()
    } catch (e) {
      setActionError(e.message)
    } finally {
      setWorking(false)
    }
  }

  async function confirmCancel() {
    if (!cancelingSession || working) return
    setWorking(true); setActionError(null)
    try {
      await cancelSession(cancelingSession.id, cancelMsg || undefined)
      setCanceledIds(prev => new Set([...prev, cancelingSession.id]))
      setSuccessMsg(isAdmin
        ? 'Session cancelled. A cancellation email has been sent to the family.'
        : 'Session cancelled. A confirmation has been sent to your email.'
      )
      setRefreshKey(k => k + 1)
      clearAction()
    } catch (e) {
      setActionError(e.message)
    } finally {
      setWorking(false)
    }
  }

  // Determine panel mode
  const inRescheduleSlotPick = reschedulingId && !pendingSlot
  const daySlots = (selectedDay ? slotsByDate[selectedDay] : null) || []

  // Right panel content
  function renderPanel() {
    if (successMsg) {
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
          <div style={{ fontSize: 13, color: 'var(--green)', marginBottom: 10 }}>{successMsg}</div>
          <button className="sm" onClick={clearAction}>Close</button>
        </div>
      )
    }

    if (cancelingSession) {
      const when = formatDate(cancelingSession.scheduled_at)
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Cancel session?</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>{when}</div>
          <input
            placeholder={isAdmin ? 'Optional explanation to include in cancellation email to family…' : 'Optional message to Mark…'}
            value={cancelMsg}
            onChange={e => setCancelMsg(e.target.value)}
            style={{ fontSize: 12 }}
          />
          {actionError && <div style={{ fontSize: 12, color: 'var(--red)' }}>{actionError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="sm danger" disabled={working} onClick={confirmCancel}>
              {working ? 'Cancelling…' : 'Confirm cancel'}
            </button>
            <button className="sm" disabled={working} onClick={clearAction}>Nevermind</button>
          </div>
        </div>
      )
    }

    if (pendingSlot) {
      const when = new Date(pendingSlot).toLocaleString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
        hour: 'numeric', minute: '2-digit', timeZone: tz, timeZoneName: 'short',
      })
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {reschedulingId ? 'Reschedule to this time?'
              : isAdmin ? `Book this session for ${student?.first_name || student?.name}?`
              : 'Book this session?'}
          </div>
          <div style={{ fontSize: 13 }}>{when}</div>
          {actionError && <div style={{ fontSize: 12, color: 'var(--red)' }}>{actionError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="sm primary" disabled={working} onClick={reschedulingId ? confirmReschedule : confirmBook}>
              {working ? 'Working…' : 'Confirm'}
            </button>
            <button className="sm" disabled={working} onClick={() => setPendingSlot(null)}>Back</button>
          </div>
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
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {inRescheduleSlotPick ? 'Pick new time' : 'Available times'} — {dateLabel}
            </div>
            <button className="sm" style={{ fontSize: 11, padding: '1px 6px' }} onClick={clearAction}>✕</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {daySlots.map(slot => (
              <button key={slot} className="sm" style={{ fontSize: 12 }}
                onClick={() => setPendingSlot(slot)}>
                {new Date(slot).toLocaleTimeString('en-US', {
                  hour: 'numeric', minute: '2-digit', timeZone: tz,
                })}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{isAdmin ? `Click a time to book it for ${student?.first_name || student?.name || 'this student'} — all times ${tzAbbr}` : `All times ${tzAbbr}`}</div>
        </div>
      )
    }

    if (selectedDay && daySlots.length === 0 && !slotsLoading) {
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>No available times on this day.</div>
          <button className="sm" onClick={clearAction}>Back</button>
        </div>
      )
    }

    if (selectedSession) {
      const canReschedule = !!selectedSession.gcal_event_id
      const sessionOnDeck = isAdmin
        ? (sessionProblems || []).filter(sp => sp.session_id === selectedSession.id)
        : []
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{formatDate(selectedSession.scheduled_at)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                {new Date(selectedSession.scheduled_at).toLocaleTimeString('en-US', {
                  hour: 'numeric', minute: '2-digit', timeZone: tz,
                })}
                {selectedSession.end_time && ` – ${new Date(selectedSession.end_time).toLocaleTimeString('en-US', {
                  hour: 'numeric', minute: '2-digit', timeZone: tz, timeZoneName: 'short',
                })}`}
              </div>
            </div>
            <button className="sm" style={{ fontSize: 11, padding: '1px 6px', flexShrink: 0 }} onClick={clearAction}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {selectedSession.meet_url && (
              <a href={selectedSession.meet_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Join video (Meet) ↗</a>
            )}
            {selectedSession.miro_board_url && (
              <a href={selectedSession.miro_board_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Whiteboard ↗</a>
            )}
            {isAdmin ? (
              <>
                {selectedSession.cal_uid && (
                  <a href={`https://cal.com/reschedule/${selectedSession.cal_uid}`} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Reschedule ↗</a>
                )}
                <button className="sm danger" style={{ fontSize: 11 }} onClick={() => {
                  setCancelingSession(selectedSession)
                  setSelectedSession(null)
                }}>
                  Cancel session
                </button>
              </>
            ) : (
              <>
                {!isPreview && canReschedule && (
                  <button className="sm" onClick={() => {
                    setReschedulingId(selectedSession.id)
                    setSelectedSession(null)
                    setSelectedDay(null)
                  }}>
                    Reschedule
                  </button>
                )}
                {!isPreview && (
                  <button className="sm danger" style={{ fontSize: 11 }} onClick={() => {
                    setCancelingSession(selectedSession)
                    setSelectedSession(null)
                  }}>
                    Cancel session
                  </button>
                )}
              </>
            )}
          </div>
          {sessionOnDeck.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>On deck</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sessionOnDeck.map(sp => {
                  const p = (allProblems || []).find(pr => pr.id === sp.problem_id)
                  return (
                    <div key={sp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <span style={{ flex: 1 }}>{sp.problem_name}</span>
                      {p?.problemUrl && <a href={p.problemUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Problem ↗</a>}
                      {p?.solutionUrl && <a href={p.solutionUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Solution ↗</a>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {actionError && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{actionError}</div>}
        </div>
      )
    }

    if (inRescheduleSlotPick) {
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Rescheduling — pick a new day</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Click any highlighted day to see available times.</div>
          <button className="sm" style={{ alignSelf: 'flex-start' }} onClick={clearAction}>Cancel</button>
        </div>
      )
    }

    if (upcoming.length === 0 && !slotsLoading) {
      return <div className="empty-state" style={{ padding: '20px 0' }}>No upcoming sessions scheduled.</div>
    }

    return null
  }

  return (
    <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="sm" onClick={prevMonth}>‹</button>
        <span style={{ fontSize: 15, fontWeight: 600, flex: 1, textAlign: 'center' }}>{monthLabel}</span>
        <button className="sm" onClick={nextMonth}>›</button>
        {slotsLoading && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Loading…</span>}
      </div>

      {slotsError && (
        <div style={{ fontSize: 12, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>Couldn't load available times: {slotsError}</span>
          <button className="sm" onClick={() => setRefreshKey(n => n + 1)}>Retry</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, opacity: slotsLoading ? 0.6 : 1, transition: 'opacity 0.15s' }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', padding: '4px 0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
        ))}
        {Array.from({ length: totalCells }, (_, i) => {
          const dayNum = i - firstDow + 1
          if (dayNum < 1 || dayNum > daysInMonth) return <div key={i} />
          const key = new Date(viewYear, viewMonth, dayNum).toLocaleDateString('en-CA')
          const daySessions = sessionsByDate[key] || []
          const daySlotList = slotsByDate[key] || []
          const hasSession = daySessions.length > 0
          const hasSlots = daySlotList.length > 0
          const isToday = key === todayKey
          const isSelected = (selectedSession && new Date(selectedSession.scheduled_at).toLocaleDateString('en-CA') === key)
            || selectedDay === key

          const clickable = hasSession || hasSlots
          let bg = 'transparent'
          if (isSelected) bg = 'var(--accent)'
          else if (hasSession) bg = 'var(--accent-dim)'
          else if (hasSlots) bg = 'var(--surface)'

          return (
            <div
              key={key}
              onClick={clickable ? () => handleDayClick(key, daySessions, daySlotList) : undefined}
              style={{
                padding: '6px 2px',
                borderRadius: 6,
                cursor: clickable ? 'pointer' : 'default',
                background: bg,
                border: `1px solid ${isToday ? 'var(--border)' : hasSlots && !hasSession && !isSelected ? 'var(--border)' : 'transparent'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                minHeight: 44,
              }}
            >
              <span style={{
                fontSize: 13,
                fontWeight: hasSession || hasSlots ? 500 : 400,
                color: isSelected ? 'white'
                  : hasSession ? 'var(--accent)'
                  : hasSlots ? 'var(--text)'
                  : isToday ? 'var(--text)'
                  : 'var(--text-dim)',
              }}>
                {dayNum}
              </span>
              {hasSession && (
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--accent)' }} />
              )}
              {!hasSession && hasSlots && (
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-dim)', opacity: 0.4 }} />
              )}
            </div>
          )
        })}
      </div>

      {renderPanel()}

      {!isPreview && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            {slotsLoading
              ? 'Checking availability…'
              : `Filled days ● have sessions · bordered days have available times · all times ${tzAbbr}`}
          </div>
        </div>
      )}
    </div>
  )
}

export { SchedulingTab }
