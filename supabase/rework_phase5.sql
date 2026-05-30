-- ============================================================================
-- Portal rework — Phase 5: invite acceptance.
--
-- Invites are created by admin/parents (see the create-invite edge function).
-- Acceptance happens implicitly at login: resolve_my_account() now also applies
-- any pending invite matching the caller's (magic-link-verified) email —
-- creating the profile, the student_link, and a verified login-capable contact,
-- then marking the invite accepted. SECURITY DEFINER, additive, idempotent.
-- ============================================================================

create or replace function public.resolve_my_account()
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid     uuid := auth.uid();
  v_email   text := lower(auth.email());
  v_profile public.profiles%rowtype;
  v_inv     public.invites%rowtype;
  v_result  jsonb;
begin
  if v_uid is null then
    return jsonb_build_object('role', 'none', 'students', '[]'::jsonb);
  end if;

  select * into v_profile from public.profiles where id = v_uid;

  -- Apply any pending invites for this verified email. Logging in via magic link
  -- proves email ownership, so we trust the match.
  for v_inv in
    select * from public.invites
    where lower(email) = v_email
      and accepted_at is null
      and expires_at > now()
    order by created_at
  loop
    if v_profile.id is null then
      insert into public.profiles (id, email, account_type)
      values (v_uid, auth.email(), v_inv.account_type)
      on conflict (id) do nothing;
      select * into v_profile from public.profiles where id = v_uid;
    end if;

    insert into public.student_links (account_id, student_id, relationship)
    values (v_uid, v_inv.student_id, v_inv.relationship)
    on conflict (account_id, student_id) do nothing;

    insert into public.student_contacts (
      student_id, email, label, can_login, verified, verified_at,
      receives_meets, receives_reports, receives_schedule_changes,
      added_by_account_id
    )
    values (
      v_inv.student_id, v_email,
      case when v_inv.relationship = 'self' then 'student' else 'parent' end,
      true, true, now(), true, true, (v_inv.relationship = 'parent'),
      v_inv.invited_by
    )
    on conflict (student_id, email) do update
      set verified    = true,
          verified_at = coalesce(public.student_contacts.verified_at, now()),
          can_login   = true;

    update public.invites set accepted_at = now() where id = v_inv.id;
  end loop;

  -- First-time login with no invite: grandfather from existing contacts.
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
      return jsonb_build_object('role', 'none', 'students', '[]'::jsonb);
    end if;

    select * into v_profile from public.profiles where id = v_uid;

    insert into public.student_links (account_id, student_id, relationship)
    select distinct v_uid, c.student_id,
           case when c.label = 'student' then 'self' else 'parent' end
    from public.student_contacts c
    where lower(c.email) = v_email
    on conflict (account_id, student_id) do nothing;

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
