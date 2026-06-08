-- Add per-student timezone for portal display
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/New_York';

-- Set student-specific timezones
UPDATE public.students SET timezone = 'America/New_York'    WHERE first_name = 'India';
UPDATE public.students SET timezone = 'America/Los_Angeles' WHERE first_name = 'Lael';
UPDATE public.students SET timezone = 'Europe/Zagreb'       WHERE first_name = 'Borna';
