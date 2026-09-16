import { describe, it, expect } from 'vitest'
import { dayInTz, formatDayInTz, formatDayLabel, tzAbbrev, DEFAULT_TZ } from '../timezone'

// Leo's actual 2026-09-14 session, recorded at 21:52 Pacific. Read from the
// East Coast that timestamp is already the 15th, which is how a Sunday evening
// of practice ended up on Monday's row in the admin view.
const LEO_EVENING = '2026-09-15T04:52:46.416Z'

describe('dayInTz', () => {
  it('puts a late-evening Pacific attempt on the Pacific day', () => {
    expect(dayInTz(LEO_EVENING, 'America/Los_Angeles')).toBe('2026-09-14')
  })

  it('puts the same instant on the next day in Eastern', () => {
    expect(dayInTz(LEO_EVENING, 'America/New_York')).toBe('2026-09-15')
  })

  it('accepts a Date as well as an ISO string', () => {
    expect(dayInTz(new Date(LEO_EVENING), 'America/Los_Angeles')).toBe('2026-09-14')
  })

  it('falls back to Eastern when a student has no timezone set', () => {
    expect(dayInTz(LEO_EVENING, null)).toBe(dayInTz(LEO_EVENING, DEFAULT_TZ))
  })

  it('sorts as a plain string, which is what the day grouping relies on', () => {
    const days = ['2026-09-15', '2026-09-02', '2026-10-01'].sort((a, b) => b.localeCompare(a))
    expect(days).toEqual(['2026-10-01', '2026-09-15', '2026-09-02'])
  })
})

describe('formatDayInTz', () => {
  it('labels the instant by the student day, not the viewer day', () => {
    expect(formatDayInTz(LEO_EVENING, 'America/Los_Angeles')).toBe('Sep 14')
    expect(formatDayInTz(LEO_EVENING, 'America/New_York')).toBe('Sep 15')
  })
})

describe('formatDayLabel', () => {
  // Parsed at noon so applying the viewer's own offset can't slide the label
  // onto the neighbouring day.
  it('renders a YYYY-MM-DD day without slipping', () => {
    expect(formatDayLabel('2026-09-14')).toBe('Sep 14')
    expect(formatDayLabel('2026-01-01')).toBe('Jan 1')
  })
})

describe('tzAbbrev', () => {
  it('names the zone', () => {
    expect(tzAbbrev('America/Los_Angeles')).toMatch(/P[DS]T/)
    expect(tzAbbrev('America/New_York')).toMatch(/E[DS]T/)
  })

  it('never throws on a bad zone', () => {
    expect(() => tzAbbrev('Not/AZone')).not.toThrow()
  })
})
