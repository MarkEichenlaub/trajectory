-- Longer sessions (e.g. Akshatha's 90-minute bookings) must cost proportionally
-- more than a standard 1-hour session, so bill-sessions now decrements
-- session_balance by the session's actual length in hours (1.5 for a 90-minute
-- session) instead of a flat 1. session_balance needs to hold that fraction.
alter table public.students
  alter column session_balance type numeric using session_balance::numeric,
  alter column session_balance set default 0;

-- Refund the same amount that was actually charged. Previously this always
-- credited back exactly 1, which under-refunds a deleted long session and
-- leaves the student owing hours they didn't use.
create or replace function public.delete_session(p_session_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id   text;
  v_decremented  boolean;
  v_type         text;
  v_scheduled_at timestamptz;
  v_end_time     timestamptz;
  v_refund       numeric;
begin
  if not public.is_admin() then
    raise exception 'not authorized to delete sessions';
  end if;

  select student_id, coalesce(balance_decremented, false), coalesce(session_type, 'session'),
         scheduled_at, end_time
    into v_student_id, v_decremented, v_type, v_scheduled_at, v_end_time
  from public.sessions
  where id = p_session_id
  for update;

  if not found then
    return;
  end if;

  if v_decremented and v_student_id is not null and v_type = 'session' then
    if v_scheduled_at is not null and v_end_time is not null and v_end_time > v_scheduled_at then
      v_refund := round(extract(epoch from (v_end_time - v_scheduled_at)) / 3600.0, 2);
    else
      v_refund := 1;
    end if;

    update public.students
      set session_balance = coalesce(session_balance, 0) + v_refund
    where id = v_student_id;
  end if;

  perform set_config('app.delete_source', 'portal: admin delete_session', true);
  delete from public.sessions where id = p_session_id;
end;
$$;

grant execute on function public.delete_session(text) to authenticated;
