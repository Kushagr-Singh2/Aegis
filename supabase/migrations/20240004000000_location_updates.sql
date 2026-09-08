-- ============================================================
-- Migration: 004 — location_updates
-- High-frequency GPS pings recorded during a journey.
-- Supabase Realtime is enabled so subscribers receive live
-- location updates as they are inserted.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.location_updates (
    id          uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id  uuid            NOT NULL REFERENCES public.journeys (id) ON DELETE CASCADE,
    latitude    double precision NOT NULL,
    longitude   double precision NOT NULL,
    accuracy    double precision,           -- metres
    speed       double precision,           -- metres/second
    heading     double precision,           -- degrees (0–360)
    created_at  timestamptz     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS location_updates_journey_id_idx
    ON public.location_updates (journey_id);

CREATE INDEX IF NOT EXISTS location_updates_created_at_idx
    ON public.location_updates (created_at DESC);

-- ── Enable Supabase Realtime ──────────────────────────────────
-- Adds the table to the realtime publication so subscribers
-- receive INSERT/UPDATE/DELETE events in real-time.
ALTER PUBLICATION supabase_realtime ADD TABLE public.location_updates;

-- ── RLS ───────────────────────────────────────────────────────
-- location_updates has no user_id column; ownership is derived
-- through the parent journey.

ALTER TABLE public.location_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "location_updates: select own"
    ON public.location_updates
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.journeys j
            WHERE j.id = journey_id
              AND j.user_id = auth.uid()
        )
    );

CREATE POLICY "location_updates: insert own"
    ON public.location_updates
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.journeys j
            WHERE j.id = journey_id
              AND j.user_id = auth.uid()
        )
    );

-- Location pings are immutable once recorded; no UPDATE/DELETE policies.
