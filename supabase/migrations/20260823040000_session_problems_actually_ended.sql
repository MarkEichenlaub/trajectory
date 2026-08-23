-- session_problems: "read after session" policy checked end_time IS NOT NULL,
-- meant as a proxy for "the session has happened". But sync-recurring-sessions
-- (and the Leo/Borna equivalents) set end_time on sessions up to 90 days out
-- at creation time, so students/parents could see on-deck problems queued for
-- a session that hasn't happened yet. Require end_time to actually be in the
-- past, matching the fix already applied to the admin Billing view.

DROP POLICY IF EXISTS "session_problems: linked read after session" ON session_problems;
CREATE POLICY "session_problems: linked read after session" ON session_problems
  FOR SELECT TO authenticated
  USING (
    student_id IN (SELECT public.my_student_ids())
    AND EXISTS (
      SELECT 1 FROM sessions s WHERE s.id = session_id AND s.end_time <= now()
    )
  );
