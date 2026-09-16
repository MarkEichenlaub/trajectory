-- students.timezone has existed since the scheduling work, but it was only ever
-- read by the booking/reminder path -- every student was left on the default
-- America/New_York, including the two who aren't in it. Fluency practice then
-- grouped attempts by whichever day it was in the *viewer's* timezone, so Leo
-- practicing at 9pm Pacific showed up on Mark's screen as the next day.
--
-- Correcting the rows here (the portal now formats fluency days in the
-- student's timezone) also fixes the session times in their reminder emails and
-- on their scheduling screen, which were an hour-count off for the same reason.

UPDATE public.students SET timezone = 'America/Los_Angeles' WHERE id IN ('leo', 'akshatha');
UPDATE public.students SET timezone = 'America/New_York'    WHERE id = 'india';
