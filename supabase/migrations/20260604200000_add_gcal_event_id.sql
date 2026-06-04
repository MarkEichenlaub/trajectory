-- Stores the Google Calendar event ID for sessions booked directly through
-- the portal (not via Cal.com). Used by reschedule-session and cancel-session
-- to update or delete the corresponding Google Calendar event.
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS gcal_event_id text;
