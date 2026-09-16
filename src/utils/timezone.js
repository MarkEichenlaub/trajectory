// Dates in the student's own timezone, not the browser's.
//
// Anything a student does has a day attached to it from their point of view:
// Leo practicing at 9pm Pacific did that on Sunday, whatever the clock on
// Mark's East Coast laptop says. Formatting those timestamps with the plain
// toLocaleDateString() reads the viewer's timezone, so the same practice
// session landed on different days depending on who was looking at it.

export const DEFAULT_TZ = 'America/New_York'

// Every student row carries a timezone, but a null one shouldn't blow up a
// formatter, so fall back rather than throw.
function zone(tz) {
  return tz || DEFAULT_TZ
}

// 'YYYY-MM-DD' for the calendar day a timestamp falls on in `tz`. Sortable and
// comparable as a plain string, which is what the day-grouping code wants.
export function dayInTz(when, tz) {
  const d = when instanceof Date ? when : new Date(when)
  return d.toLocaleDateString('en-CA', { timeZone: zone(tz) })
}

// Today's 'YYYY-MM-DD' in `tz`.
export function todayInTz(tz) {
  return dayInTz(new Date(), tz)
}

// A short human date ("Sep 14") for a timestamp, in the student's timezone.
export function formatDayInTz(when, tz, opts = { month: 'short', day: 'numeric' }) {
  const d = when instanceof Date ? when : new Date(when)
  return d.toLocaleDateString('en-US', { ...opts, timeZone: zone(tz) })
}

// Same, with the time of day — used where "when exactly did they do this"
// matters, as in the admin attempt log.
export function formatDateTimeInTz(when, tz, opts = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) {
  const d = when instanceof Date ? when : new Date(when)
  return d.toLocaleString('en-US', { ...opts, timeZone: zone(tz) })
}

// A 'YYYY-MM-DD' day string rendered for display. Parsed at noon so the label
// can't slip a day when the viewer's own timezone is applied to it.
export function formatDayLabel(day, opts = { month: 'short', day: 'numeric' }) {
  return new Date(`${day}T12:00:00`).toLocaleDateString('en-US', opts)
}

// "PT" / "ET" — the short zone name, for saying whose day is being shown.
export function tzAbbrev(tz) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone(tz), timeZoneName: 'short' })
      .formatToParts(new Date())
    return parts.find(p => p.type === 'timeZoneName')?.value || ''
  } catch {
    return ''
  }
}
