import { describe, it, expect } from 'vitest'
import { fmaSecondsByQuestion } from '../supabase'

// Events as the runner writes them: `active_seconds` is the exam clock's
// reading at the instant of the event, `clicked_at` the wall time.
function ev(q, stamp, wallSec, type = 'view') {
  return {
    question_id: q,
    event_type: type,
    active_seconds: stamp,
    clicked_at: new Date(Date.UTC(2026, 7, 26, 0, 0, wallSec)).toISOString(),
  }
}
const submittedAt = wallSec => new Date(Date.UTC(2026, 7, 26, 0, 0, wallSec)).toISOString()

describe('fmaSecondsByQuestion', () => {
  it('credits each question the clock time up to the next event', () => {
    const events = [ev('q1', 0, 0), ev('q2', 30, 30), ev('q3', 45, 45)]
    const attempt = { active_seconds: 100, submitted_at: submittedAt(100) }
    const got = fmaSecondsByQuestion(events, attempt)
    expect(got.get('q1')).toBe(30)
    expect(got.get('q2')).toBe(15)
    expect(got.get('q3')).toBe(55) // runs to the final clock reading
  })

  // The regression this whole mechanism exists for: the student sat on q1, left
  // for an hour of wall time, and came back. The clock was paused throughout, so
  // q1 must be charged only the 20 seconds actually spent on it -- not 3620.
  it('does not bill a question for time the clock was paused', () => {
    const events = [ev('q1', 0, 0), ev('q2', 20, 3620), ev('q2', 25, 3625, 'answer')]
    const attempt = { active_seconds: 30, submitted_at: submittedAt(3630) }
    const got = fmaSecondsByQuestion(events, attempt)
    expect(got.get('q1')).toBe(20)
    expect(got.get('q2')).toBe(10)
  })

  // The numbers the review page shows must add up to the number in its header.
  it('sums to the attempt total', () => {
    const events = [ev('q1', 0, 0), ev('q2', 42, 900), ev('q3', 71, 1800)]
    const attempt = { active_seconds: 120, submitted_at: submittedAt(2400) }
    const total = [...fmaSecondsByQuestion(events, attempt).values()].reduce((a, b) => a + b, 0)
    expect(total).toBe(120)
  })

  it('revisiting a question accumulates rather than overwrites', () => {
    const events = [ev('q1', 0, 0), ev('q2', 10, 10), ev('q1', 25, 25), ev('q2', 40, 40)]
    const attempt = { active_seconds: 50, submitted_at: submittedAt(50) }
    const got = fmaSecondsByQuestion(events, attempt)
    expect(got.get('q1')).toBe(10 + 15)
    expect(got.get('q2')).toBe(15 + 10)
  })

  // Attempts recorded before the stamp column existed still have to render.
  it('falls back to wall clock when no event is stamped', () => {
    const events = [ev('q1', null, 0), ev('q2', null, 30)]
    const attempt = { active_seconds: 0, submitted_at: submittedAt(45) }
    const got = fmaSecondsByQuestion(events, attempt)
    expect(got.get('q1')).toBe(30)
    expect(got.get('q2')).toBe(15)
  })

  it('skips unstamped events rather than mixing scales', () => {
    const events = [ev('q1', 0, 0), ev('q2', null, 30), ev('q3', 50, 60)]
    const attempt = { active_seconds: 60, submitted_at: submittedAt(90) }
    const got = fmaSecondsByQuestion(events, attempt)
    // q1's span ends at an unstamped event, and q2's starts at one: both are
    // unmeasurable, so neither is guessed at.
    expect(got.has('q1')).toBe(false)
    expect(got.has('q2')).toBe(false)
    expect(got.get('q3')).toBe(10)
  })

  it('ignores an in-progress attempt with no end position', () => {
    const events = [ev('q1', 0, 0)]
    const attempt = { active_seconds: null, submitted_at: null }
    expect(fmaSecondsByQuestion(events, attempt).size).toBe(0)
  })
})
