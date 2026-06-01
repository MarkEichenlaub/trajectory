-- Add solution_url and year columns to support exam-type resources.
-- Run in Supabase SQL Editor before running scripts/seed_fma_exams.mjs

ALTER TABLE public.handouts ADD COLUMN IF NOT EXISTS solution_url TEXT DEFAULT '';
ALTER TABLE public.handouts ADD COLUMN IF NOT EXISTS year INT DEFAULT 0;
