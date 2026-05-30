-- ============================================================================
-- Portal rework — Phase 6: admin access through RLS (remove the browser service key)
--
-- Until now the admin UI used the Supabase SERVICE ROLE key in the browser,
-- which bypasses all row-level security. A privileged key shipped to (or pasted
-- into) the client is a full database compromise: anyone who can read the bundle
-- or the admin's localStorage gets read/write/delete on every table.
--
-- The admin already logs in as a normal auth user whose profile.account_type =
-- 'admin' (App.jsx gates AdminApp on role === 'admin', and is_admin() keys off
-- that same row). So the admin needs no special key — it needs RLS policies that
-- grant the admin full CRUD. This migration adds those policies + the table
-- grants they depend on, secures storage uploads, and closes one billing-read
-- leak. After applying it, the client switches to the ordinary authenticated
-- client (see src/utils/supabase.js) and the service key leaves the browser.
--
-- ADDITIVE and idempotent. It cannot widen access for non-admins: every new
-- write policy is gated on is_admin(), which is false for everyone else.
--
-- ⚠️ APPLY THIS BEFORE deploying the front-end change that drops the service key.
--    Deploying the JS first (while these policies/grants are absent) would leave
--    the admin app unable to read or write anything.
-- ============================================================================

-- ── 1. Table grants for the authenticated role ──────────────────────────────
-- RLS decides WHICH rows; the role must still be GRANTed the table or Postgres
-- denies before RLS is consulted (this project grants explicitly — see
-- rework_phase2_grants.sql). Row access stays gated by the policies below.

grant select, insert, update, delete on public.students                   to authenticated;
grant select, insert, update, delete on public.assignments                to authenticated;
grant         insert, update, delete on public.sessions                   to authenticated;  -- select already granted
grant select, insert, update, delete on public.handouts                   to authenticated;
grant         insert, update, delete on public.progress_reports           to authenticated;  -- select already granted
grant select, insert, update, delete on public.student_accessible_sources to authenticated;
grant                         delete on public.invites                    to authenticated;  -- select already granted

-- invoices: grant_invoices.sql granted ALL to anon (and authenticated). anon has
-- no business touching invoices — RLS already blocks it, but drop the grant too.
revoke all on public.invoices from anon;

-- ── 2. Admin write policies (is_admin() → full CRUD via the admin's session) ──
-- FOR ALL covers SELECT/INSERT/UPDATE/DELETE in one permissive policy per table.
-- Combined (OR'd) with the existing student/parent policies, this only ever adds
-- access for the admin.

drop policy if exists "students: admin all" on public.students;
create policy "students: admin all" on public.students for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "assignments: admin all" on public.assignments;
create policy "assignments: admin all" on public.assignments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "sessions: admin all" on public.sessions;
create policy "sessions: admin all" on public.sessions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "handouts: admin all" on public.handouts;
create policy "handouts: admin all" on public.handouts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "invoices: admin all" on public.invoices;
create policy "invoices: admin all" on public.invoices for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "progress_reports: admin all" on public.progress_reports;
create policy "progress_reports: admin all" on public.progress_reports for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "accessible_sources: admin all" on public.student_accessible_sources;
create policy "accessible_sources: admin all" on public.student_accessible_sources for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "invites: admin all" on public.invites;
create policy "invites: admin all" on public.invites for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── 3. Close the legacy billing-read leak ───────────────────────────────────
-- billing.sql added "invoices: student read" keyed on students.user_id. Permissive
-- policies are OR'd, so while it lived a *student* account could read its own
-- invoices — contradicting the model (only parent/adult/admin see billing, via
-- my_billing_student_ids()). Drop it; the "invoices: billing read" policy stands.

drop policy if exists "invoices: student read" on public.invoices;

-- ── 4. Link-based student policies (decouple from legacy students.user_id) ───
-- The legacy student write/read policies match on students.user_id, which the
-- new invite/link flow does NOT populate. Add my_student_ids()-scoped equivalents
-- so problem-bank completion and source browsing keep working for link-based
-- students. Additive and scoped per-student — no cross-family exposure.

drop policy if exists "assignments: linked insert completed" on public.assignments;
create policy "assignments: linked insert completed" on public.assignments for insert to authenticated
  with check (student_id in (select public.my_student_ids()) and status = 'completed');

drop policy if exists "assignments: linked update completed" on public.assignments;
create policy "assignments: linked update completed" on public.assignments for update to authenticated
  using (student_id in (select public.my_student_ids()))
  with check (student_id in (select public.my_student_ids()) and status = 'completed');

drop policy if exists "accessible_sources: linked read" on public.student_accessible_sources;
create policy "accessible_sources: linked read" on public.student_accessible_sources for select to authenticated
  using (student_id in (select public.my_student_ids()));

-- ── 5. Secure storage uploads (admin only; reads stay public) ───────────────
-- handout-pdfs and progress-reports are public buckets (reads served by URL),
-- but writes were done with the service key. Gate object writes on is_admin() so
-- the authenticated admin can upload/replace/delete and nobody else can.

drop policy if exists "handout-pdfs: admin write" on storage.objects;
create policy "handout-pdfs: admin write" on storage.objects for all to authenticated
  using (bucket_id = 'handout-pdfs' and public.is_admin())
  with check (bucket_id = 'handout-pdfs' and public.is_admin());

drop policy if exists "progress-reports: admin write" on storage.objects;
create policy "progress-reports: admin write" on storage.objects for all to authenticated
  using (bucket_id = 'progress-reports' and public.is_admin())
  with check (bucket_id = 'progress-reports' and public.is_admin());
