-- ============================================================
-- Migration: 003 — journeys
-- Represents a single trip taken by a user from origin to
-- destination. Tracks GPS bounds, timing, and lifecycle status.
-- ============================================================

-- ── Enum-style constraint for status ─────────────────────────
-- We use a text column + CHECK rather than a Postgres ENUM so
-- the list can be altered without a full type drop/recreate.

CREATE TABLE IF NOT EXISTS public.journeys (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

    -- Origin
    origin_lat          double precision,
    origin_lng          double precision,

    -- Destination
    destination_lat     double precision,
    destination_lng     double precision,
    destination_name    text,

    -- Route
    route_data          jsonb,

    -- Timing
    started_at          timestamptz,
    expected_arrival    timestamptz,
    ended_at            timestamptz,

    -- Lifecycle
    status              text        NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'completed', 'cancelled', 'emergency')),

    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS journeys_user_id_idx
    ON public.journeys (user_id);

CREATE INDEX IF NOT EXISTS journeys_status_idx
    ON public.journeys (status);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journeys: select own"
    ON public.journeys
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "journeys: insert own"
    ON public.journeys
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journeys: update own"
    ON public.journeys
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journeys: delete own"
    ON public.journeys
    FOR DELETE
    USING (auth.uid() = user_id);
