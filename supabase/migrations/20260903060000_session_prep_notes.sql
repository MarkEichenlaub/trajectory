-- Admin-only "what to do next time" note, jotted after finishing a session and
-- shown when the *next* session is launched (SessionLauncher / AHK prep popup).
-- Optional URL lets it point at a specific handout or problem.
alter table sessions add column if not exists prep_note text;
alter table sessions add column if not exists prep_note_url text;
