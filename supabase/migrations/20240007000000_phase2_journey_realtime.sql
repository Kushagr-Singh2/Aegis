-- ============================================================
-- Migration: 007 — Phase 2 enhancements
--
-- 1. Adds `planned` to the journeys.status CHECK constraint.
--    Journey lifecycle is now:
--      planned → active → completed | cancelled | emergency
--
-- 2. Changes the journeys default status from `active` to `planned`
--    so journeys can be created before they begin.
--
-- 3. Enables Supabase Realtime on `journeys` and `check_ins`
--    (location_updates and emergency_events were added in Phase 1).
-- ============================================================

-- ── 1. Alter journeys.status constraint ──────────────────────
-- Drop the old CHECK constraint by name, then re-add it with
-- `planned` included. The constraint was created inline without
-- an explicit name, so Postgres assigns one (journeys_status_check).

ALTER TABLE public.journeys
    DROP CONSTRAINT IF EXISTS journeys_status_check;

ALTER TABLE public.journeys
    ADD CONSTRAINT journeys_status_check
    CHECK (status IN ('planned', 'active', 'completed', 'cancelled', 'emergency'));

-- ── 2. Change default status from active → planned ────────────
ALTER TABLE public.journeys
    ALTER COLUMN status SET DEFAULT 'planned';

-- ── 3. Enable Realtime on journeys and check_ins ──────────────
-- Subscribers (e.g. responder dashboards) can now receive live
-- updates when a journey's status changes or a check-in is
-- created/updated.

ALTER PUBLICATION supabase_realtime ADD TABLE public.journeys;
ALTER PUBLICATION supabase_realtime ADD TABLE public.check_ins;
