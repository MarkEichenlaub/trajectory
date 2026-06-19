-- session_problems: on-deck problems queued for an upcoming session.
-- Students see them only after the session ends (end_time IS NOT NULL).

CREATE TABLE IF NOT EXISTS session_problems (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   TEXT        NOT NULL,
  student_id   TEXT        NOT NULL,
  problem_id   TEXT        NOT NULL,
  problem_name TEXT        NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE session_problems ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON session_problems TO authenticated;

-- Admin: full CRUD
DROP POLICY IF EXISTS "session_problems: admin all" ON session_problems;
CREATE POLICY "session_problems: admin all" ON session_problems
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Students and linked parents/adults: read-only, only after session ends
DROP POLICY IF EXISTS "session_problems: linked read after session" ON session_problems;
CREATE POLICY "session_problems: linked read after session" ON session_problems
  FOR SELECT TO authenticated
  USING (
    student_id IN (SELECT public.my_student_ids())
    AND EXISTS (
      SELECT 1 FROM sessions s WHERE s.id = session_id AND s.end_time IS NOT NULL
    )
  );
