-- Lets gcal-webhook tell "Mark cancelled this on purpose" apart from "a session
-- silently vanished", so the alert it sends is worth reading.
--
-- Every function that deliberately deletes a Google Calendar event drops a marker
-- here FIRST, then deletes. Google's push notification arrives seconds to minutes
-- later; the webhook finds the marker, stays quiet, and clears it. A cancellation
-- with no marker is the case worth an email.
--
-- Writing the marker before the delete is the whole point: cancel-session removes
-- the calendar event and the session row back to back, so a webhook that inferred
-- intent from "is the row gone yet?" would be racing that gap.
create table if not exists public.expected_calendar_cancellations (
  gcal_event_id text primary key,
  reason        text,
  created_at    timestamptz not null default now()
);

create index if not exists expected_calendar_cancellations_created_at_idx
  on public.expected_calendar_cancellations (created_at);

-- No policies: the service key (edge functions) bypasses RLS, and nothing else
-- has any business reading or writing this.
alter table public.expected_calendar_cancellations enable row level security;

-- Required: default privileges here grant new tables only REFERENCES/TRIGGER/
-- TRUNCATE, so without this the marker writes fail silently and every portal
-- cancellation would look unexpected and send Mark an alert.
grant select, insert, update, delete on public.expected_calendar_cancellations to service_role;
