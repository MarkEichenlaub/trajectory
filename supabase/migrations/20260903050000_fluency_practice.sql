-- Algebraic/procedural fluency drill (see "Leo fluency" design spec email,
-- 2026-09-02): short, adaptive, interleaved skill drills, gated per student
-- so it can be turned on for Leo and QA'd with the test student before
-- anyone else sees it.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS fluency_practice_enabled boolean NOT NULL DEFAULT false;

-- Catalog of drillable skills. The generator logic itself lives in
-- src/fluency/generators.js (`generator_key` must match a SKILLS[].slug
-- there) -- this table is metadata + per-student enablement, not a problem
-- template DSL.
CREATE TABLE IF NOT EXISTS public.fluency_skills (
  id            text PRIMARY KEY,
  generator_key text NOT NULL,
  name          text NOT NULL,
  description   text NOT NULL DEFAULT '',
  category      text NOT NULL DEFAULT '',
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Which skills are in a given student's active rotation.
CREATE TABLE IF NOT EXISTS public.fluency_student_skills (
  student_id text NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  skill_id   text NOT NULL REFERENCES public.fluency_skills(id) ON DELETE CASCADE,
  enabled    boolean NOT NULL DEFAULT true,
  added_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, skill_id)
);

-- Leitner box / spacing state per student per skill. `level` (0-5) drives
-- both problem difficulty (generators.js) and how far out next_due_at is
-- pushed (src/fluency/spacing.js).
CREATE TABLE IF NOT EXISTS public.fluency_skill_state (
  student_id      text NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  skill_id        text NOT NULL REFERENCES public.fluency_skills(id) ON DELETE CASCADE,
  level           int NOT NULL DEFAULT 0,
  streak          int NOT NULL DEFAULT 0,
  attempt_count   int NOT NULL DEFAULT 0,
  correct_count   int NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  next_due_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, skill_id)
);

-- Full attempt log -- the "record of everything he's done" so progress can
-- be reviewed later. `params` (the generator seed/level) makes every problem
-- reproducible for auditing a grading dispute.
CREATE TABLE IF NOT EXISTS public.fluency_attempts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     text NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  skill_id       text NOT NULL REFERENCES public.fluency_skills(id) ON DELETE CASCADE,
  mode           text NOT NULL DEFAULT 'untimed' CHECK (mode IN ('untimed', 'timed')),
  level          int NOT NULL,
  seed           bigint NOT NULL,
  submitted      jsonb NOT NULL,
  is_correct     boolean NOT NULL,
  response_ms    int,
  level_before   int NOT NULL,
  level_after    int NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fluency_attempts_student_idx ON public.fluency_attempts (student_id, created_at DESC);

-- Mark's low-friction, live-session tagging workflow: jot a note about a
-- micro-skill Leo hesitated on, without needing a generator built yet.
-- Purely an admin scratchpad -- resolved once a matching generator ships.
CREATE TABLE IF NOT EXISTS public.fluency_skill_notes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id         text NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  note               text NOT NULL,
  resolved           boolean NOT NULL DEFAULT false,
  resolved_skill_id  text REFERENCES public.fluency_skills(id),
  created_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fluency_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fluency_student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fluency_skill_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fluency_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fluency_skill_notes ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.fluency_skills TO service_role;
GRANT ALL ON public.fluency_student_skills TO service_role;
GRANT ALL ON public.fluency_skill_state TO service_role;
GRANT ALL ON public.fluency_attempts TO service_role;
GRANT ALL ON public.fluency_skill_notes TO service_role;

-- Catalog is not sensitive -- readable by any logged-in account.
GRANT SELECT ON public.fluency_skills TO authenticated;
DROP POLICY IF EXISTS fluency_skills_read ON public.fluency_skills;
CREATE POLICY fluency_skills_read ON public.fluency_skills FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS fluency_skills_admin ON public.fluency_skills;
CREATE POLICY fluency_skills_admin ON public.fluency_skills FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT ON public.fluency_student_skills TO authenticated;
DROP POLICY IF EXISTS fluency_student_skills_own ON public.fluency_student_skills;
CREATE POLICY fluency_student_skills_own ON public.fluency_student_skills FOR SELECT TO authenticated
  USING (student_id IN (SELECT public.my_student_ids()));
DROP POLICY IF EXISTS fluency_student_skills_admin ON public.fluency_student_skills;
CREATE POLICY fluency_student_skills_admin ON public.fluency_student_skills FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- The student's own client drives leveling (it already computes the correct
-- answer client-side to give immediate feedback -- see design spec's
-- feedback requirement), so it needs to read/upsert its own state and insert
-- its own attempts. This is a low-stakes practice tool, not a graded exam:
-- the only thing a student could gain by tampering is a falsely-easy drill
-- for themselves, which defeats the point of practicing at all.
GRANT SELECT, INSERT, UPDATE ON public.fluency_skill_state TO authenticated;
DROP POLICY IF EXISTS fluency_skill_state_own ON public.fluency_skill_state;
CREATE POLICY fluency_skill_state_own ON public.fluency_skill_state FOR ALL TO authenticated
  USING (student_id IN (SELECT public.my_student_ids()) OR public.is_admin())
  WITH CHECK (student_id IN (SELECT public.my_student_ids()) OR public.is_admin());

GRANT SELECT, INSERT ON public.fluency_attempts TO authenticated;
DROP POLICY IF EXISTS fluency_attempts_own ON public.fluency_attempts;
CREATE POLICY fluency_attempts_own ON public.fluency_attempts FOR SELECT TO authenticated
  USING (student_id IN (SELECT public.my_student_ids()) OR public.is_admin());
DROP POLICY IF EXISTS fluency_attempts_insert ON public.fluency_attempts;
CREATE POLICY fluency_attempts_insert ON public.fluency_attempts FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT public.my_student_ids()) OR public.is_admin());

-- Notes are Mark's admin scratchpad -- no student-facing read/write.
DROP POLICY IF EXISTS fluency_skill_notes_admin ON public.fluency_skill_notes;
CREATE POLICY fluency_skill_notes_admin ON public.fluency_skill_notes FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── resolve_my_account: expose the per-student flag so the portal can show
-- (or hide) the Fluency Practice tab without a second round trip. ──────────
CREATE OR REPLACE FUNCTION public.resolve_my_account()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid     uuid := auth.uid();
  v_email   text := lower(auth.email());
  v_profile public.profiles%rowtype;
  v_inv     public.invites%rowtype;
  v_result  jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('role', 'none', 'students', '[]'::jsonb);
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid;

  FOR v_inv IN
    SELECT * FROM public.invites
    WHERE lower(email) = v_email
      AND accepted_at IS NULL
      AND expires_at > now()
    ORDER BY created_at
  LOOP
    IF v_profile.id IS NULL THEN
      INSERT INTO public.profiles (id, email, account_type)
      VALUES (v_uid, auth.email(), v_inv.account_type)
      ON CONFLICT (id) DO NOTHING;
      SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid;
    END IF;

    INSERT INTO public.student_links (account_id, student_id, relationship)
    VALUES (v_uid, v_inv.student_id, v_inv.relationship)
    ON CONFLICT (account_id, student_id) DO NOTHING;

    INSERT INTO public.student_contacts (
      student_id, email, label, can_login, verified, verified_at,
      receives_meets, receives_reports, receives_schedule_changes,
      added_by_account_id
    )
    VALUES (
      v_inv.student_id, v_email,
      CASE WHEN v_inv.relationship = 'self' THEN 'student' ELSE 'parent' END,
      true, true, now(), true, true, (v_inv.relationship = 'parent'),
      v_inv.invited_by
    )
    ON CONFLICT (student_id, email) DO UPDATE
      SET verified    = true,
          verified_at = coalesce(public.student_contacts.verified_at, now()),
          can_login   = true;

    UPDATE public.invites SET accepted_at = now() WHERE id = v_inv.id;
  END LOOP;

  IF v_profile.id IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.student_contacts
      WHERE lower(email) = v_email AND label = 'student'
    ) THEN
      INSERT INTO public.profiles (id, email, account_type)
      VALUES (v_uid, auth.email(), 'student')
      ON CONFLICT (id) DO NOTHING;
    ELSIF EXISTS (
      SELECT 1 FROM public.student_contacts WHERE lower(email) = v_email
    ) THEN
      INSERT INTO public.profiles (id, email, account_type)
      VALUES (v_uid, auth.email(), 'parent')
      ON CONFLICT (id) DO NOTHING;
    ELSE
      RETURN jsonb_build_object('role', 'none', 'students', '[]'::jsonb);
    END IF;

    SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid;

    INSERT INTO public.student_links (account_id, student_id, relationship)
    SELECT DISTINCT v_uid, c.student_id,
           CASE WHEN c.label = 'student' THEN 'self' ELSE 'parent' END
    FROM public.student_contacts c
    WHERE lower(c.email) = v_email
    ON CONFLICT (account_id, student_id) DO NOTHING;

    UPDATE public.student_contacts
    SET verified = true, verified_at = coalesce(verified_at, now())
    WHERE lower(email) = v_email AND verified = false;
  END IF;

  SELECT jsonb_build_object(
    'role',  v_profile.account_type,
    'email', v_profile.email,
    'students', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
               'id', s.id, 'name', s.name,
               'first_name', s.first_name, 'last_name', s.last_name,
               'status', s.status, 'relationship', sl.relationship,
               'timezone', s.timezone,
               'fluency_practice_enabled', s.fluency_practice_enabled
             ) ORDER BY s.name)
      FROM public.student_links sl
      JOIN public.students s ON s.id = sl.student_id
      WHERE sl.account_id = v_uid
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_my_account() TO authenticated;

-- ── Seed the initial skill catalog ──────────────────────────────────────
INSERT INTO public.fluency_skills (id, generator_key, name, description, category) VALUES
  ('exp-sign-division', 'exp-sign-division', 'Exponent sign across a division bar',
   'Simplifying a^m / a^n to a single power, including negative and fractional exponents.', 'exponents'),
  ('sci-notation-arith', 'sci-notation-arith', 'Scientific-notation arithmetic',
   'Multiplying/dividing numbers in scientific notation and renormalizing, including inside physics formulas.', 'scientific notation'),
  ('unit-prefix-convert', 'unit-prefix-convert', 'Unit-prefix conversion (incl. squared/cubed)',
   'Converting between SI prefixes, including squaring/cubing the conversion factor for area/volume units.', 'units'),
  ('vector-components', 'vector-components', 'Signed vector components',
   'Decomposing a vector into x/y components with the correct sign for its quadrant, including worded directions.', 'vectors'),
  ('isolate-variable', 'isolate-variable', 'Isolate a variable, then evaluate',
   'Rearranging a physics formula to solve for a target variable, including one buried under a square or square root.', 'algebra')
ON CONFLICT (id) DO NOTHING;

-- ── Turn it on for Leo, and enable all seed skills for him ─────────────
UPDATE public.students SET fluency_practice_enabled = true WHERE id = 'leo';

INSERT INTO public.fluency_student_skills (student_id, skill_id)
SELECT 'leo', id FROM public.fluency_skills
WHERE EXISTS (SELECT 1 FROM public.students WHERE id = 'leo')
ON CONFLICT (student_id, skill_id) DO NOTHING;

-- ── Also turn it on for the persistent test student, if it exists yet
-- (scripts/setup_test_student.mjs creates it) -- so it can be QA'd end to
-- end before opening it up further. ─────────────────────────────────────
UPDATE public.students SET fluency_practice_enabled = true WHERE id = 'test-student';

INSERT INTO public.fluency_student_skills (student_id, skill_id)
SELECT 'test-student', id FROM public.fluency_skills
WHERE EXISTS (SELECT 1 FROM public.students WHERE id = 'test-student')
ON CONFLICT (student_id, skill_id) DO NOTHING;
