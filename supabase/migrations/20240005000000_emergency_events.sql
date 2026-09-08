-- ============================================================
-- Migration: 005 — emergency_events
-- Records every safety alert triggered during or outside a
-- journey. Supabase Realtime is enabled for live alert push.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.emergency_events (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    journey_id      uuid        REFERENCES public.journeys (id) ON DELETE SET NULL,

    -- How the alert was triggered
    trigger_type    text        NOT NULL
                    CHECK (trigger_type IN ('manual', 'auto', 'check_in_miss', 'geofence')),

    -- Risk assessment (populated by AI layer later)
    risk_score      double precision,
    risk_level      text        CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),

    -- Location at time of trigger
    latitude        double precision,
    longitude       double precision,

    -- Lifecycle
    status          text        NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'resolved', 'false_alarm')),

    created_at      timestamptz NOT NULL DEFAULT now(),
    resolved_at     timestamptz
);

CREATE INDEX IF NOT EXISTS emergency_events_user_id_idx
    ON public.emergency_events (user_id);

CREATE INDEX IF NOT EXISTS emergency_events_journey_id_idx
    ON public.emergency_events (journey_id);

CREATE INDEX IF NOT EXISTS emergency_events_status_idx
    ON public.emergency_events (status);

-- ── Enable Supabase Realtime ──────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_events;

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "emergency_events: select own"
    ON public.emergency_events
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "emergency_events: insert own"
    ON public.emergency_events
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "emergency_events: update own"
    ON public.emergency_events
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
