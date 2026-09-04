-- Adds three new fluency skills (see "Leo fluency additions" request,
-- 2026-09-03): Taylor series, physics-symbol literacy (meaning/pronunciation/
-- units/dimensions), and exponent rules. Also adds a per-student daily
-- question-count goal, so Mark can calibrate it against the time-per-day
-- data the app now surfaces (src/fluency/generators.js: response_ms was
-- already recorded per attempt; this just exposes it) instead of guessing.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS fluency_daily_goal int NOT NULL DEFAULT 8;

INSERT INTO public.fluency_skills (id, generator_key, name, description, category) VALUES
  ('exponent-rules', 'exponent-rules', 'Exponent rules',
   'Power-of-a-power, product of powers, and roots of powers (e.g. sqrt(T^-2)), in both bare-variable and physics-flavored form.', 'exponents'),
  ('physics-symbols', 'physics-symbols', 'Physics symbols: meaning, units & dimensions',
   'Given a common F=ma symbol, recall its meaning, pronunciation, SI units, or M/L/T dimensions -- and the reverse.', 'symbols'),
  ('taylor-series', 'taylor-series', 'Taylor series (1st & 2nd order)',
   'Recall and apply the standard small-x approximations (sin, cos, e^x, (1+x)^n, ...), including simple mechanics applications.', 'taylor series')
ON CONFLICT (id) DO NOTHING;

-- ── Turn the new skills on for Leo ──────────────────────────────────────
INSERT INTO public.fluency_student_skills (student_id, skill_id)
SELECT 'leo', id FROM public.fluency_skills
WHERE id IN ('exponent-rules', 'physics-symbols', 'taylor-series')
  AND EXISTS (SELECT 1 FROM public.students WHERE id = 'leo')
ON CONFLICT (student_id, skill_id) DO NOTHING;

-- ── Same for the persistent test student, for QA (matches the convention
-- set in the earlier fluency migrations). ──────────────────────────────
INSERT INTO public.fluency_student_skills (student_id, skill_id)
SELECT 'test-student', id FROM public.fluency_skills
WHERE id IN ('exponent-rules', 'physics-symbols', 'taylor-series')
  AND EXISTS (SELECT 1 FROM public.students WHERE id = 'test-student')
ON CONFLICT (student_id, skill_id) DO NOTHING;

-- ── resolve_my_account: expose fluency_daily_goal alongside the existing
-- fluency_practice_enabled flag, same reasoning (avoid a second round trip
-- for a logged-in student's own portal). Identical to the definition in
-- 20260903050000_fluency_practice.sql except for that one added field. ────
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
               'fluency_practice_enabled', s.fluency_practice_enabled,
               'fluency_daily_goal', s.fluency_daily_goal
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
