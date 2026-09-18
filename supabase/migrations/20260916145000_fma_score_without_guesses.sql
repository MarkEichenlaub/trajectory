-- A third score, for a student who doesn't want a lucky guess flattering her.
--
-- Akshatha stars the questions she guessed on (that's what the star is for),
-- and her worry is that a guess landing right inflates a practice score she is
-- using to predict a real sitting. So she gets the score she'd have had if
-- every guess had missed: the 75-minute score with the starred questions thrown
-- out. Three numbers in all --
--
--   score_without_guesses : at 75 minutes, counting only unstarred questions
--   score_at_limit        : at 75 minutes, everything
--   score                 : the finished test, however long it took
--
-- It is a per-student setting rather than the default, because for most
-- students a third number on the chart is noise.

ALTER TABLE public.fma_attempts
  ADD COLUMN IF NOT EXISTS score_without_guesses int;

COMMENT ON COLUMN public.fma_attempts.score_without_guesses IS
  'Score at the 75-minute mark counting only questions the student did NOT star '
  'as a guess. Null when it cannot be worked out.';

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS show_unguessed_score boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.students.show_unguessed_score IS
  'Show the "without the guesses" score alongside the other two on the F=ma '
  'results page, chart and report email.';

-- As fma_score_at_limit, but a question the student starred scores nothing
-- whether or not the guess landed. Kept as its own function rather than a third
-- argument on that one, so neither call site can be read the wrong way round.
CREATE OR REPLACE FUNCTION public.fma_score_unstarred_at_limit(p_attempt_id uuid, p_limit int DEFAULT 4500)
RETURNS int
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_score int;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.fma_answer_events
     WHERE attempt_id = p_attempt_id AND event_type = 'answer' AND active_seconds IS NOT NULL
  ) THEN
    RETURN NULL;
  END IF;

  SELECT count(*)::int INTO v_score
  FROM (
    SELECT DISTINCT ON (e.question_id) e.question_id, e.selected_choice
      FROM public.fma_answer_events e
     WHERE e.attempt_id = p_attempt_id
       AND e.event_type = 'answer'
       AND e.active_seconds IS NOT NULL
       AND e.active_seconds <= p_limit
     ORDER BY e.question_id, e.active_seconds DESC, e.clicked_at DESC
  ) standing
  JOIN public.fma_questions q ON q.id = standing.question_id
  -- The star lives on the answer row, not the event log: it marks the question,
  -- not the moment, so when it was set doesn't matter.
  LEFT JOIN public.fma_attempt_answers ans
         ON ans.attempt_id = p_attempt_id AND ans.question_id = standing.question_id
  WHERE standing.selected_choice IS NOT NULL
    AND NOT coalesce(ans.starred, false)
    AND (standing.selected_choice = q.correct_choice
         OR standing.selected_choice = ANY(coalesce(q.also_accepted, '{}')));

  RETURN coalesce(v_score, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.fma_score_unstarred_at_limit(uuid, int) FROM public;
GRANT EXECUTE ON FUNCTION public.fma_score_unstarred_at_limit(uuid, int) TO authenticated, service_role;

-- Grading records all three numbers in the same atomic statement as the score.
CREATE OR REPLACE FUNCTION public.submit_fma_attempt(p_attempt_id uuid)
RETURNS public.fma_attempts
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_attempt   public.fma_attempts;
  v_score     int;
  v_at_limit  int;
  v_unstarred int;
  v_no_guess  int;
BEGIN
  SELECT * INTO v_attempt FROM public.fma_attempts WHERE id = p_attempt_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'attempt not found';
  END IF;
  IF NOT (v_attempt.student_id IN (SELECT public.my_student_ids()) OR public.is_admin()) THEN
    RAISE EXCEPTION 'not authorized for this attempt';
  END IF;
  IF v_attempt.mode = 'score_only' THEN
    RAISE EXCEPTION 'score_only attempts use submit_fma_score_only()';
  END IF;

  UPDATE public.fma_attempt_answers ans
     SET is_correct = (
           ans.selected_choice IS NOT NULL
           AND (ans.selected_choice = q.correct_choice
                OR ans.selected_choice = ANY(q.also_accepted))
         )
    FROM public.fma_questions q
   WHERE ans.question_id = q.id
     AND ans.attempt_id  = p_attempt_id;

  SELECT count(*) INTO v_score
    FROM public.fma_attempt_answers
   WHERE attempt_id = p_attempt_id AND is_correct;

  SELECT count(*) INTO v_unstarred
    FROM public.fma_attempt_answers
   WHERE attempt_id = p_attempt_id AND is_correct AND NOT coalesce(starred, false);

  -- A sitting that stayed inside the limit has one score wearing two hats.
  -- Only one that ran over needs the clock replayed.
  IF coalesce(v_attempt.active_seconds, 0) <= 4500 THEN
    v_at_limit := v_score;
    v_no_guess := v_unstarred;
  ELSE
    v_at_limit := coalesce(public.fma_score_at_limit(p_attempt_id), v_score);
    v_no_guess := coalesce(public.fma_score_unstarred_at_limit(p_attempt_id), v_unstarred);
  END IF;

  UPDATE public.fma_attempts
     SET status = 'graded', score = v_score,
         score_at_limit = v_at_limit, score_without_guesses = v_no_guess,
         submitted_at = now()
   WHERE id = p_attempt_id
  RETURNING * INTO v_attempt;

  PERFORM public.complete_fma_assignment(v_attempt.student_id, v_attempt.exam_id);

  RETURN v_attempt;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_fma_attempt(uuid) FROM public;
-- service_role as well as authenticated: an admin script re-grading an attempt
-- after an answer-key correction has no session to borrow, and until now that
-- call came back "permission denied".
GRANT EXECUTE ON FUNCTION public.submit_fma_attempt(uuid) TO authenticated, service_role;

-- Derived server-side, never sent by the browser.
REVOKE UPDATE ON public.fma_attempts FROM authenticated;
GRANT UPDATE (scratch_work_url) ON public.fma_attempts TO authenticated;

-- ── Expose the flag to the student's own portal ─────────────────────────────
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
               'fluency_daily_goal', s.fluency_daily_goal,
               'show_unguessed_score', s.show_unguessed_score
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

-- ── Turn it on for Akshatha, and backfill every attempt already taken ───────
-- On for the QA student too, so this path is always exercised in preview.
UPDATE public.students SET show_unguessed_score = true WHERE id IN ('akshatha', 'test-student');

UPDATE public.fma_attempts a
   SET score_without_guesses = CASE
         WHEN a.score IS NULL THEN NULL
         WHEN coalesce(a.active_seconds, 0) <= 4500 THEN (
           SELECT count(*)::int FROM public.fma_attempt_answers ans
            WHERE ans.attempt_id = a.id AND ans.is_correct AND NOT coalesce(ans.starred, false)
         )
         ELSE coalesce(
           public.fma_score_unstarred_at_limit(a.id),
           (SELECT count(*)::int FROM public.fma_attempt_answers ans
             WHERE ans.attempt_id = a.id AND ans.is_correct AND NOT coalesce(ans.starred, false))
         )
       END
 WHERE a.score_without_guesses IS NULL
   AND a.status IN ('submitted', 'graded');
