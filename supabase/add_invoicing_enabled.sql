-- Add per-student invoicing toggle.
-- invoicing_enabled = false → skip Stripe invoice auto-creation; mark sessions paid/unpaid manually instead.
-- Default false so all existing (and new) students start with invoicing off.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS invoicing_enabled boolean NOT NULL DEFAULT false;

-- Add manual paid/unpaid tracking per session (admin-only; not exposed to student portal).
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS paid boolean DEFAULT NULL;
