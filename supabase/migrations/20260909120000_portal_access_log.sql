-- Backend-only login/activity log (Mark asked, 2026-09-09, after Leo claimed
-- weekend fluency practice that never showed up: "is there a log of when a
-- student's been on the portal"). There wasn't one -- auth.sessions only
-- keeps the current session per device, not history, and this project's
-- auth.audit_log_entries has never been populated. resolve_my_account() is
-- the one RPC every portal boot calls exactly once per login (App.jsx only
-- re-runs it when the user id changes, not on token refresh), so it's the
-- natural place to log a visit without touching any client code.
--
-- Deliberately not surfaced anywhere in the app or admin UI -- Mark said not
-- to add it to the site, just keep it queryable via SQL when he wants it,
-- e.g.:
--   select email, role, student_ids, created_at from public.portal_access_log
--   where 'leo' = any(student_ids) order by created_at desc limit 20;

CREATE TABLE IF NOT EXISTS public.portal_access_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id   uuid NOT NULL,
  email        text,
  role         text,
  student_ids  text[] NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portal_access_log_account_idx ON public.portal_access_log (account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS portal_access_log_student_ids_idx ON public.portal_access_log USING gin (student_ids);

-- RLS on with no policies for `authenticated`: only the SECURITY DEFINER
-- function below (and service_role, e.g. this migration or a future admin
-- script run with the service key) can touch it. Nothing here is reachable
-- from the portal's own Supabase client.
ALTER TABLE public.portal_access_log ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.portal_access_log TO service_role;

-- Identical to the resolve_my_account() in 20260903130000_fluency_new_skills.sql
-- except for the logging insert right before the final return.
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
      INSERT INTO public.portal_access_log (account_id, email, role, student_ids)
      VALUES (v_uid, v_email, 'none', '{}');
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

  INSERT INTO public.portal_access_log (account_id, email, role, student_ids)
  SELECT v_uid, v_profile.email, v_profile.account_type,
         coalesce((SELECT array_agg(x->>'id') FROM jsonb_array_elements(v_result->'students') x), '{}');

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_my_account() TO authenticated;
