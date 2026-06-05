-- Add last_name column
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS last_name text NOT NULL DEFAULT '';

-- Backfill: everything after the first space in name becomes last_name
UPDATE public.students
SET last_name = CASE
  WHEN position(' ' IN name) > 0
    THEN trim(substring(name FROM position(' ' IN name) + 1))
  ELSE ''
END
WHERE last_name = '';

-- Keep name in sync whenever first_name or last_name changes
CREATE OR REPLACE FUNCTION public.sync_student_full_name()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.name :=
    trim(
      coalesce(NEW.first_name, '') ||
      CASE WHEN coalesce(NEW.last_name, '') <> '' THEN ' ' || NEW.last_name ELSE '' END
    );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS students_sync_full_name ON public.students;
CREATE TRIGGER students_sync_full_name
  BEFORE INSERT OR UPDATE
  ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.sync_student_full_name();
