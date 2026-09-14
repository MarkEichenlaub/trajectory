-- The F=ma report is now ONE email instead of two: the instant score mail from
-- notify-fma-attempt is gone, and fma-narrative-agent.mjs sends the table and
-- the narrative together. That makes the agent the only thing standing between
-- a finished exam and Mark hearing about it, so it needs a fallback: if the
-- claude call keeps failing, it eventually sends the table on its own rather
-- than staying silent.
--
-- email_kind records which of the two went out, so a fallback send is not
-- retried forever and Mark can tell a table-only mail from a real read.
-- claude_error keeps the reason around for when a fallback needs explaining.

ALTER TABLE public.fma_attempt_narratives
  ADD COLUMN IF NOT EXISTS email_kind   text NOT NULL DEFAULT 'full'
    CHECK (email_kind IN ('full', 'table_only')),
  ADD COLUMN IF NOT EXISTS claude_error text;

-- The prose columns are null on a table_only row, so drop any assumption that
-- headline is always present (it was never NOT NULL, this is just the note).
COMMENT ON COLUMN public.fma_attempt_narratives.email_kind IS
  'full = table + narrative; table_only = fallback sent because claude failed repeatedly.';
