-- Phase 4: Scheduling
-- Cal.com reschedule/cancel links require the booking's string UID, not the
-- numeric bookingId stored in cal_booking_id. Track it separately.

alter table public.sessions
  add column if not exists cal_uid text;
