-- ============================================================================
-- Portal rework — Phase 3: contact invariants (deletion/untoggle protection).
--
-- For an ACTIVE student, you may not remove the LAST contact that:
--   • is verified AND receives meeting invites, or
--   • receives invoices, or
--   • can log in.
--
-- "Transition" semantics: the trigger blocks an operation only when it takes a
-- count from 1 → 0 (the row being changed was the last contributor). It does
-- NOT force a contact to exist — students who legacy-started with zero of a
-- given recipient stay editable, so this never bricks contact management.
--
-- Bounce updates don't change verified/receives_*/can_login, so the bounce
-- webhook is never rejected by this trigger.
-- ============================================================================

create or replace function public.enforce_contact_invariants()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  sid text := coalesce(NEW.student_id, OLD.student_id);
  active boolean;
begin
  select status = 'active' into active from public.students where id = sid;
  if not coalesce(active, false) then
    return null;  -- inactive students are exempt
  end if;

  -- >= 1 verified meet recipient
  if (OLD.verified and OLD.receives_meets)
     and (select count(*) from public.student_contacts
          where student_id = sid and verified and receives_meets) = 0 then
    raise exception 'Cannot remove the last verified contact that receives meeting invites for an active student.';
  end if;

  -- >= 1 invoice recipient
  if OLD.receives_invoices
     and (select count(*) from public.student_contacts
          where student_id = sid and receives_invoices) = 0 then
    raise exception 'Cannot remove the last contact that receives invoices for an active student.';
  end if;

  -- >= 1 login-capable contact
  if OLD.can_login
     and (select count(*) from public.student_contacts
          where student_id = sid and can_login) = 0 then
    raise exception 'Cannot remove the last login-capable contact for an active student.';
  end if;

  return null;
end;
$$;

drop trigger if exists trg_contact_invariants on public.student_contacts;
create trigger trg_contact_invariants
  after update or delete on public.student_contacts
  for each row execute function public.enforce_contact_invariants();
