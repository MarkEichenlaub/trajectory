-- Verbatim session transcripts from Wispr Flow's meeting recorder.
--
-- Mark started recording tutoring sessions with Wispr on 2026-09-10. Wispr keeps
-- the diarized transcript on disk next to the audio
-- (%APPDATA%\Wispr Flow\meetings\<meeting-id>\live.ndjson), which is richer than
-- the AI summary omnisearch already indexes. scripts/sync_transcripts.mjs reads
-- those files, matches each recording to a session by clock overlap, and upserts
-- a row here.
--
-- These are BACKEND-ONLY. RLS is on with no policies and the only grant is to
-- service_role, exactly like portal_access_log: nothing a student or parent's
-- Supabase client can reach. They exist to feed the session summarizer, the
-- progress-report drafter, and Mark's own questions about what happened in a
-- session -- never to be shown in the portal.

CREATE TABLE IF NOT EXISTS public.session_transcripts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source            text NOT NULL DEFAULT 'wispr',
  source_meeting_id text NOT NULL,
  session_id        text REFERENCES public.sessions(id) ON DELETE SET NULL,
  student_id        text REFERENCES public.students(id) ON DELETE SET NULL,
  title             text,
  started_at        timestamptz NOT NULL,
  ended_at          timestamptz,
  duration_seconds  integer,
  -- How the recording was tied to a session: 'overlap' (clock match) or
  -- 'manual' (attached by hand with --attach). 'high' confidence means the
  -- recording and the session overlap by 10+ minutes.
  match_method      text,
  match_confidence  text,
  overlap_seconds   integer,
  -- {"mic": "Mark", "system": "Akshatha"} -- Wispr tags each utterance with the
  -- audio source it came from; the tutor is always the microphone and the
  -- student is always the call audio coming back out of the speakers.
  speaker_labels    jsonb NOT NULL DEFAULT '{}'::jsonb,
  wispr_summary     text,
  transcript        text NOT NULL,
  word_count        integer,
  local_path        text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS session_transcripts_source_key
  ON public.session_transcripts (source, source_meeting_id);
CREATE INDEX IF NOT EXISTS session_transcripts_session_idx
  ON public.session_transcripts (session_id);
CREATE INDEX IF NOT EXISTS session_transcripts_student_idx
  ON public.session_transcripts (student_id, started_at DESC);

ALTER TABLE public.session_transcripts ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.session_transcripts TO service_role;
-- Deliberately no grant to `authenticated` / `anon`.
