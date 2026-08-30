-- Akshatha's last name was recorded as her dad's ("Eli", from the trial
-- session booking) instead of her own ("Arunkumar"), per parent report.
-- name is kept in sync from first_name/last_name by the
-- students_sync_full_name trigger (20260605200000_add_last_name.sql).
UPDATE public.students
   SET last_name = 'Arunkumar'
 WHERE first_name = 'Akshatha';
