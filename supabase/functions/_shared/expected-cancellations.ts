// Call this immediately BEFORE deleting a Google Calendar event on purpose.
//
// gcal-webhook emails Mark when a session's calendar event disappears. Without a
// marker, his own portal cancellations would trigger that alert too, and an alert
// that cries wolf is one he stops reading. See
// 20260828020000_expected_calendar_cancellations.sql.
//
// Best-effort by design: a failure here must never block the cancellation the
// user actually asked for. The cost of losing a marker is one redundant email.
// deno-lint-ignore no-explicit-any
export async function markExpectedCancellation(admin: any, eventId: string, reason: string) {
  if (!eventId) return
  const { error } = await admin
    .from('expected_calendar_cancellations')
    .upsert({ gcal_event_id: eventId, reason, created_at: new Date().toISOString() })
  if (error) console.error('Failed to mark expected cancellation:', error.message)
}
