-- Store the Google Meet link generated when a session is booked through the portal,
-- so the portal can surface a "Join by video" button on upcoming sessions.
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS meet_url text;
