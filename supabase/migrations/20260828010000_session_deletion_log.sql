-- An audit trail for disappearing sessions.
--
-- On 2026-08-27 Leo's Thursday session vanished: the Google Calendar event was
-- deleted overnight, the 6 AM sync then removed the orphaned session row, and
-- nothing anywhere recorded either step. Function logs age out after a day and
-- pg_net responses after minutes, so by evening the only surviving evidence was
-- Google's own 30-day calendar trash — which shows a date but no time, actor, or
-- cause. This table makes both halves of that disappearance permanent.
--
-- Two kinds of rows land here:
--   session_row_deleted     — a row left public.sessions, whatever the path
--                             (admin delete_session, cancel-session, the sync
--                             functions' orphan cleanup, or a hand-run query).
--   calendar_event_cancelled — gcal-webhook saw Google report a session's event
--                             as cancelled. This is the earlier, more precise
--                             signal: it carries the minute Google processed the
--                             deletion, usually well before any row is removed.
create table if not exists public.session_deletions (
  id                  bigint generated always as identity primary key,
  kind                text not null default 'session_row_deleted'
                        check (kind in ('session_row_deleted', 'calendar_event_cancelled')),
  session_id          text,
  student_id          text,
  scheduled_at        timestamptz,
  session_type        text,
  gcal_event_id       text,
  miro_board_url      text,
  balance_decremented boolean,
  -- Who/what did it, as far as the database can tell. `source` is the
  -- x-app-source header the edge functions set on their Supabase client, or the
  -- value delete_session() stashes for admin deletes; null means the delete came
  -- from somewhere untagged (a manual SQL query, the dashboard, a new function).
  source              text,
  deleted_by_uid      uuid,
  deleted_by_role     text,
  request_path        text,
  detected_at         timestamptz not null default now(),
  row_snapshot        jsonb
);

create index if not exists session_deletions_detected_at_idx
  on public.session_deletions (detected_at desc);
create index if not exists session_deletions_student_idx
  on public.session_deletions (student_id, scheduled_at desc);

alter table public.session_deletions enable row level security;

-- Admins read it; nobody writes through the API. The trigger and the edge
-- functions (service key, which bypasses RLS) are the only writers.
drop policy if exists session_deletions_admin_read on public.session_deletions;
create policy session_deletions_admin_read on public.session_deletions
  for select using (public.is_admin());

-- This project's default privileges hand new tables only REFERENCES/TRIGGER/
-- TRUNCATE, so without these grants every edge-function write here fails
-- silently — the same footgun that left gcal-webhook dead on app_config in June.
-- (The trigger below is SECURITY DEFINER and runs as postgres, so it would keep
-- working and hide the gap.)
grant select, insert, update, delete on public.session_deletions to service_role;
grant select on public.session_deletions to authenticated;  -- RLS still limits this to admins

create or replace function public.log_session_deletion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_headers jsonb;
  v_uid     uuid;
begin
  -- All three of these are absent outside a PostgREST request (cron, psql, a
  -- dashboard query), and malformed JSON would otherwise abort the delete the
  -- trigger is only meant to observe. Never let bookkeeping break the write.
  begin
    v_headers := nullif(current_setting('request.headers', true), '')::jsonb;
  exception when others then v_headers := null;
  end;

  begin
    v_uid := auth.uid();
  exception when others then v_uid := null;
  end;

  insert into public.session_deletions (
    kind, session_id, student_id, scheduled_at, session_type, gcal_event_id,
    miro_board_url, balance_decremented, source, deleted_by_uid, deleted_by_role,
    request_path, row_snapshot
  ) values (
    'session_row_deleted',
    old.id, old.student_id, old.scheduled_at, old.session_type, old.gcal_event_id,
    old.miro_board_url, old.balance_decremented,
    coalesce(
      nullif(current_setting('app.delete_source', true), ''),
      v_headers ->> 'x-app-source'
    ),
    v_uid,
    nullif(current_setting('request.jwt.claim.role', true), ''),
    nullif(current_setting('request.path', true), ''),
    to_jsonb(old)
  );

  return old;
end;
$$;

drop trigger if exists sessions_log_deletion on public.sessions;
create trigger sessions_log_deletion
  after delete on public.sessions
  for each row execute function public.log_session_deletion();

-- Tag admin deletes so the log distinguishes "Mark clicked delete in the portal"
-- from "a sync function cleaned up an orphan". set_config(..., true) is
-- transaction-local, so the trigger below reads it in the same statement and it
-- disappears afterwards. Body is otherwise identical to the parent-checkins
-- version in 20260826150000.
create or replace function public.delete_session(p_session_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id  text;
  v_decremented boolean;
  v_type        text;
begin
  if not public.is_admin() then
    raise exception 'not authorized to delete sessions';
  end if;

  select student_id, coalesce(balance_decremented, false), coalesce(session_type, 'session')
    into v_student_id, v_decremented, v_type
  from public.sessions
  where id = p_session_id
  for update;

  if not found then
    return;
  end if;

  if v_decremented and v_student_id is not null and v_type = 'session' then
    update public.students
      set session_balance = coalesce(session_balance, 0) + 1
    where id = v_student_id;
  end if;

  perform set_config('app.delete_source', 'portal: admin delete_session', true);
  delete from public.sessions where id = p_session_id;
end;
$$;

grant execute on function public.delete_session(text) to authenticated;
