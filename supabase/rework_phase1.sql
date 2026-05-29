-- ============================================================================
-- Portal rework — Phase 1: account resolution RPC.
--
-- resolve_my_account() is called once after login. It (a) grandfathers a
-- first-time login into a profile + student_links by matching the auth email
-- against existing student_contacts, and (b) returns the caller's role and the
-- students they can see. SECURITY DEFINER so it can read auth.users / write
-- profiles without tripping RLS.
--
-- Grandfathering rule: if any matching contact has label='student' the login is
-- a student (self-link); otherwise it's a parent (parent-link). Admin/adult
-- accounts are created by the migration or invite-accept flow, not here.
-- ADDITIVE and idempotent.
-- ============================================================================

create or replace function public.resolve_my_account()
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid     uuid := auth.uid();
  v_email   text := lower(auth.email());
  v_profile public.profiles%rowtype;
  v_result  jsonb;
begin
  if v_uid is null then
    return jsonb_build_object('role', 'none', 'students', '[]'::jsonb);
  end if;

  select * into v_profile from public.profiles where id = v_uid;

  -- First-time login: try to grandfather from existing contacts.
  if v_profile.id is null then
    if exists (
      select 1 from public.student_contacts
      where lower(email) = v_email and label = 'student'
    ) then
      insert into public.profiles (id, email, account_type)
      values (v_uid, auth.email(), 'student')
      on conflict (id) do nothing;
    elsif exists (
      select 1 from public.student_contacts where lower(email) = v_email
    ) then
      insert into public.profiles (id, email, account_type)
      values (v_uid, auth.email(), 'parent')
      on conflict (id) do nothing;
    else
      -- No profile, no matching contact: no access (an invite-accept flow,
      -- handled separately, is the only other way to gain access).
      return jsonb_build_object('role', 'none', 'students', '[]'::jsonb);
    end if;

    select * into v_profile from public.profiles where id = v_uid;

    -- Link every student this email is a contact for.
    insert into public.student_links (account_id, student_id, relationship)
    select distinct v_uid, c.student_id,
           case when c.label = 'student' then 'self' else 'parent' end
    from public.student_contacts c
    where lower(c.email) = v_email
    on conflict (account_id, student_id) do nothing;

    -- Logging in proves email ownership → mark those contacts verified.
    update public.student_contacts
    set verified = true, verified_at = coalesce(verified_at, now())
    where lower(email) = v_email and verified = false;
  end if;

  select jsonb_build_object(
    'role',  v_profile.account_type,
    'email', v_profile.email,
    'students', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', s.id, 'name', s.name,
               'status', s.status, 'relationship', sl.relationship
             ) order by s.name)
      from public.student_links sl
      join public.students s on s.id = sl.student_id
      where sl.account_id = v_uid
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.resolve_my_account() to authenticated;
