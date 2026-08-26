import { useState, useEffect, useMemo } from 'react'
import { getAvailability, bookSession, rescheduleSession, cancelSession } from '../../utils/supabase'

const CHECKIN_MIN = 15

// A check-in is a short, unbilled catch-up with a student's parents. It shares
// this whole screen with tutoring sessions — same calendar, same available
// times, same reschedule and cancel buttons — and differs only in length, in
// who is invited, and in never touching the student's balance or homework.
function isCheckin(s) {
  return s?.session_type === 'checkin'
}

export default function SchedulingTab({
  sessions, formatDate, student, isPreview, isAdmin, sessionProblems, allProblems,
  // 'parent' when the signed-in account is a parent rather than the student.
  // Parents are the people check-ins are for, so the picker starts there.
  viewerRole,
}) {
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

  const pastCheckins = useMemo(() =>
    effectiveSessions
      .filter(s => isCheckin(s) && s.scheduled_at <= nowIso)
      .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at)),
    [effectiveSessions, nowIso]
  )

  // What the viewer may book. Parents and Mark always get the choice; a student
  // only sees it once check-ins are actually in use for them, so the picker
  // doesn't appear on portals where it would do nothing.
  const checkinsAvailable = isAdmin || viewerRole === 'parent'
    || effectiveSessions.some(isCheckin)

  const [bookingType, setBookingType] = useState(
    () => (viewerRole === 'parent' ? 'checkin' : 'session')
  )

  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const viewYear = viewDate.getFullYear()
  const viewMonth = viewDate.getMonth()

  // Availability slots by student timezone date, tagged with the kind of booking
  // they were fetched for — a 15-minute check-in fits gaps an hour-long session
  // can't, so the two lists genuinely differ and must not be mixed.
  const [slots, setSlots] = useState({ type: 'session', byDate: {} })
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

  const reschedulingSession = useMemo(
    () => effectiveSessions.find(s => s.id === reschedulingId) || null,
    [effectiveSessions, reschedulingId]
  )

  // Moving an existing booking keeps its own length, so the slots offered during
  // a reschedule follow that booking rather than whatever the picker last showed.
  const slotType = reschedulingSession
    ? (isCheckin(reschedulingSession) ? 'checkin' : 'session')
    : bookingType

  // Fetch availability for the visible month. Previously-loaded days stay on
  // screen (dimmed) while the new month loads — keys are full dates, so months
  // never collide.
  useEffect(() => {
    if (!student?.id) return
    setSlotsLoading(true)
    setSlotsError(null)
    const from = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-CA')
    const to = new Date(viewYear, viewMonth + 1, 0).toLocaleDateString('en-CA')
    getAvailability(from, to, slotType)
      .then(isos => {
        const byDate = {}
        isos.forEach(iso => {
          const key = new Date(iso).toLocaleDateString('en-CA', { timeZone: tz })
          if (!byDate[key]) byDate[key] = []
          byDate[key].push(iso)
        })
        // Replace this month's entries wholesale (a re-fetch must drop days
        // whose slots were booked out) but keep other months' cached days.
        // Switching booking type throws the cache away instead: those days were
        // computed for a different meeting length.
        const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
        setSlots(prev => {
          const next = {}
          if (prev.type === slotType) {
            for (const [day, list] of Object.entries(prev.byDate)) {
              if (!day.startsWith(monthPrefix)) next[day] = list
            }
          }
          return { type: slotType, byDate: { ...next, ...byDate } }
        })
      })
      .catch(e => setSlotsError(e.message))
      .finally(() => setSlotsLoading(false))
  }, [viewYear, viewMonth, student?.id, isPreview, refreshKey, tz, slotType])

  // Slots fetched for the other booking length are not shown at all — an empty
  // calendar for a moment beats offering a time that can't be booked.
  const slotsByDate = slots.type === slotType ? slots.byDate : {}

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

  async function confirmBook() {
    if (!pendingSlot || working) return
    setWorking(true); setActionError(null)
    const booking = bookingType
    try {
      // Admins book on the active student's behalf; students book for themselves.
      const result = await bookSession(pendingSlot, isAdmin ? student.id : undefined, booking)
      setLocalAdded(prev => [...prev, {
        id: result.session_id,
        student_id: student.id,
        session_type: result.session_type || booking,
        scheduled_at: result.scheduled_at,
        end_time: result.end_time,
        miro_board_url: result.miro_board_url,
        miro_board_id: result.miro_board_id,
        meet_url: result.meet_url,
        gcal_event_id: result.gcal_event_id,
      }])
      const who = student?.first_name || student?.name
      const msg = booking === 'checkin'
        ? (isAdmin
          ? `Check-in booked. The calendar invite and Google Meet link have been emailed to ${who}'s parents.`
          : 'Check-in booked! A calendar invite with the Google Meet link is on its way to your email.')
        : (isAdmin
          ? `Session booked for ${who}! The calendar invite, Google Meet link, and whiteboard have been emailed to the family.`
          : 'Session booked! A confirmation with the calendar invite, Google Meet link, and whiteboard is on its way to your email.')
      // clearAction() blanks successMsg, so it has to run before the message is
      // set or React collapses both updates and the confirmation never shows.
      clearAction()
      setSuccessMsg(msg)
      setRefreshKey(k => k + 1)
    } catch (e) {
      setActionError(e.message)
    } finally {
      setWorking(false)
    }
  }

  async function confirmReschedule() {
    if (!pendingSlot || !reschedulingId || working) return
    setWorking(true); setActionError(null)
    const wasCheckin = isCheckin(reschedulingSession)
    try {
      const result = await rescheduleSession(reschedulingId, pendingSlot)
      setUpdatedSessions(prev => ({ ...prev, [reschedulingId]: {
        scheduled_at: result.scheduled_at,
        end_time: result.end_time,
      }}))
      const msg = wasCheckin
        ? 'Check-in rescheduled! Check your email for the updated calendar invite.'
        : 'Session rescheduled! Check your email for the updated calendar invite.'
      clearAction()
      setSuccessMsg(msg)
      setRefreshKey(k => k + 1)
    } catch (e) {
      setActionError(e.message)
    } finally {
      setWorking(false)
    }
  }

  async function confirmCancel() {
    if (!cancelingSession || working) return
    setWorking(true); setActionError(null)
    const wasCheckin = isCheckin(cancelingSession)
    try {
      await cancelSession(cancelingSession.id, cancelMsg || undefined)
      setCanceledIds(prev => new Set([...prev, cancelingSession.id]))
      const noun = wasCheckin ? 'Check-in' : 'Session'
      const msg = isAdmin
        ? `${noun} cancelled. A cancellation email has been sent to the family.`
        : `${noun} cancelled. A confirmation has been sent to your email.`
      clearAction()
      setSuccessMsg(msg)
      setRefreshKey(k => k + 1)
    } catch (e) {
      setActionError(e.message)
    } finally {
      setWorking(false)
    }
  }

  // Determine panel mode
  const inRescheduleSlotPick = reschedulingId && !pendingSlot
  const daySlots = (selectedDay ? slotsByDate[selectedDay] : null) || []
  const bookingCheckin = bookingType === 'checkin'

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
      const checkin = isCheckin(cancelingSession)
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{checkin ? 'Cancel check-in?' : 'Cancel session?'}</div>
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
      const who = student?.first_name || student?.name
      let heading
      if (reschedulingId) {
        heading = isCheckin(reschedulingSession) ? 'Move the check-in to this time?' : 'Reschedule to this time?'
      } else if (bookingCheckin) {
        heading = isAdmin ? `Book a check-in about ${who}?` : 'Book this check-in?'
      } else {
        heading = isAdmin ? `Book this session for ${who}?` : 'Book this session?'
      }
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{heading}</div>
          <div style={{ fontSize: 13 }}>{when}</div>
          {!reschedulingId && bookingCheckin && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              {CHECKIN_MIN} minutes, by Google Meet. There's no charge for a check-in.
            </div>
          )}
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
      const heading = inRescheduleSlotPick
        ? 'Pick new time'
        : bookingCheckin ? `Available check-in times (${CHECKIN_MIN} min)` : 'Available times'
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {heading} — {dateLabel}
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
      const checkin = isCheckin(selectedSession)
      const sessionOnDeck = isAdmin
        ? (sessionProblems || []).filter(sp => sp.session_id === selectedSession.id)
        : []
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                {formatDate(selectedSession.scheduled_at)}
                {checkin && <CheckinBadge />}
              </div>
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
                <button className="sm danger" style={{ fontSize: 11 }} onClick={() => {
                  setCancelingSession(selectedSession)
                  setSelectedSession(null)
                }}>
                  {checkin ? 'Cancel check-in' : 'Cancel session'}
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
                    {checkin ? 'Cancel check-in' : 'Cancel session'}
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
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
            {isCheckin(reschedulingSession) ? 'Moving the check-in' : 'Rescheduling'} — pick a new day
          </div>
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
      {checkinsAvailable && !reschedulingId && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              ['checkin', `Check-in (${CHECKIN_MIN} min)`],
              ['session', 'Session (1 hour)'],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`sm${bookingType === value ? ' primary' : ''}`}
                style={{ fontSize: 12 }}
                onClick={() => { setBookingType(value); clearAction() }}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            {bookingCheckin
              ? `A short catch-up about ${student?.first_name || student?.name || 'your student'} — no charge.`
              : 'A full tutoring hour.'}
          </div>
        </div>
      )}

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
          const allCheckins = hasSession && daySessions.every(isCheckin)
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
                // A hollow marker distinguishes a day that holds only check-ins
                // from a day with a booked tutoring session.
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: allCheckins ? 'transparent'
                    : isSelected ? 'rgba(255,255,255,0.8)' : 'var(--accent)',
                  border: allCheckins
                    ? `1px solid ${isSelected ? 'rgba(255,255,255,0.8)' : 'var(--accent)'}`
                    : 'none',
                }} />
              )}
              {!hasSession && hasSlots && (
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-dim)', opacity: 0.4 }} />
              )}
            </div>
          )
        })}
      </div>

      {renderPanel()}

      {pastCheckins.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Past check-ins
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {pastCheckins.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 13 }}>
                <span>{formatDate(c.scheduled_at)}</span>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  {new Date(c.scheduled_at).toLocaleTimeString('en-US', {
                    hour: 'numeric', minute: '2-digit', timeZone: tz,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isPreview && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            {slotsLoading
              ? 'Checking availability…'
              : `Filled days ● have sessions · hollow ○ are check-ins · bordered days have available times · all times ${tzAbbr}`}
          </div>
        </div>
      )}
    </div>
  )
}

function CheckinBadge() {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: 'var(--text-dim)', border: '1px solid var(--border)', borderRadius: 4,
      padding: '1px 5px',
    }}>
      Check-in
    </span>
  )
}

export { SchedulingTab }
