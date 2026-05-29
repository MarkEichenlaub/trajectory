-- Remove the study-plans feature entirely. Progress reports are unaffected.
-- cascade drops the table's RLS policies and grants along with the data.
drop table if exists public.study_plans cascade;
