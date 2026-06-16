-- Add session reminder opt-in flag to student_contacts
alter table public.student_contacts
  add column if not exists receives_session_reminders boolean not null default false;

-- Track whether a session reminder has been sent (prevents duplicate sends)
alter table public.sessions
  add column if not exists session_reminder_sent_at timestamptz;
