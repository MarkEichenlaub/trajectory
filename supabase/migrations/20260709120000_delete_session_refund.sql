-- Admin-only session delete that also un-bills the session.
--
-- When a session ends, bill-sessions (the 15-minute cron) subtracts 1 from the
-- student's session_balance and sets balance_decremented = true. If an admin
-- deletes a session that didn't actually happen, simply removing the row would
-- leave the student wrongly charged for it. This function refunds that credit
-- (only when the session had already been billed) and then deletes the row, so
-- a deleted session never counts against the student's balance.
--
-- The FOR UPDATE lock serializes against bill-sessions: whichever runs first
-- wins cleanly. If the cron holds the row, we wait and then read
-- balance_decremented = true and refund. If we hold the row, the cron's guarded
-- UPDATE (…where balance_decremented = false) finds no row after our delete and
-- skips the decrement. Either way the session ends up not counting.
create or replace function public.delete_session(p_session_id text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_student_id  text;
  v_decremented boolean;
begin
  if not public.is_admin() then
    raise exception 'not authorized to delete sessions';
  end if;

  select student_id, coalesce(balance_decremented, false)
    into v_student_id, v_decremented
  from public.sessions
  where id = p_session_id
  for update;

  if not found then
    return;  -- already deleted; nothing to do
  end if;

  if v_decremented and v_student_id is not null then
    update public.students
      set session_balance = coalesce(session_balance, 0) + 1
    where id = v_student_id;
  end if;

  delete from public.sessions where id = p_session_id;
end;
$$;

grant execute on function public.delete_session(text) to authenticated;
