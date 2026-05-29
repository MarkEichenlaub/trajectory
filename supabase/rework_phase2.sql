-- ============================================================================
-- Portal rework — Phase 2: contact write policies keyed on student_links.
--
-- Legacy "contacts: self {insert,update,delete}" policies key off
-- students.user_id, which grandfathered students (linked via student_links, no
-- user_id) don't satisfy. These additive policies let any linked account
-- (student self-link or parent link) manage contacts for their students, and
-- admin manage all. OR-combined with the legacy policies.
--
-- Label-level restrictions (a student must not flip a parent contact's flags)
-- and the verification / cap / bounce invariants are enforced in Phase 3; this
-- phase wires the read path and the role-based UI hiding.
-- ============================================================================

drop policy if exists "contacts: linked insert" on public.student_contacts;
create policy "contacts: linked insert" on public.student_contacts for insert
  with check (student_id in (select public.my_student_ids()) or public.is_admin());

drop policy if exists "contacts: linked update" on public.student_contacts;
create policy "contacts: linked update" on public.student_contacts for update
  using (student_id in (select public.my_student_ids()) or public.is_admin())
  with check (student_id in (select public.my_student_ids()) or public.is_admin());

drop policy if exists "contacts: linked delete" on public.student_contacts;
create policy "contacts: linked delete" on public.student_contacts for delete
  using (student_id in (select public.my_student_ids()) or public.is_admin());
