-- Remove the homework_sets feature entirely. It was a separate "compile a
-- packet" data model parallel to the normal handout-as-assignment flow; compiled
-- PDFs are now delivered as ordinary handout assignments instead.
--
-- The PDF *compiler* (EigenNode/scripts/build_homework_set.py) is unaffected — it
-- now just writes a local PDF from a list of problem IDs and no longer touches
-- Supabase.
--
-- cascade drops the table's RLS policies and grants along with the data.
drop table if exists public.homework_sets cascade;

-- Remove the storage bucket that held the compiled PDFs, its objects, and policy.
drop policy if exists "homework-sets: admin write" on storage.objects;
delete from storage.objects where bucket_id = 'homework-sets';
delete from storage.buckets where id = 'homework-sets';
