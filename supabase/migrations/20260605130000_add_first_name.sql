ALTER TABLE public.students ADD COLUMN IF NOT EXISTS first_name text;

-- Backfill from existing names (first word before the space)
UPDATE public.students
SET first_name = SPLIT_PART(name, ' ', 1)
WHERE first_name IS NULL OR first_name = '';

-- Fix the three students who were missing last names, and set their first names
UPDATE public.students SET name = 'India Ewald',      first_name = 'India' WHERE LOWER(id) LIKE '%india%';
UPDATE public.students SET name = 'Leo Li-Savarese',  first_name = 'Leo'   WHERE LOWER(id) LIKE '%leo%';
UPDATE public.students SET name = 'Borna Curic',       first_name = 'Borna' WHERE LOWER(id) LIKE '%borna%';
