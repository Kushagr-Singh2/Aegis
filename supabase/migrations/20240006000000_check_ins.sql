-- ============================================================
-- Migration: 006 — check_ins
-- Scheduled safety check-ins during a journey. A missed
-- check-in can automatically escalate to an emergency event.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.check_ins (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id      uuid        NOT NULL REFERENCES public.journeys (id) ON DELETE CASCADE,
    scheduled_at    timestamptz NOT NULL,
    responded_at    timestamptz,
    status          text        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'responded', 'missed')),
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS check_ins_journey_id_idx
    ON public.check_ins (journey_id);

CREATE INDEX IF NOT EXISTS check_ins_status_idx
    ON public.check_ins (status);

CREATE INDEX IF NOT EXISTS check_ins_scheduled_at_idx
    ON public.check_ins (scheduled_at);

-- ── RLS ───────────────────────────────────────────────────────
-- Ownership is derived through the parent journey.

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "check_ins: select own"
    ON public.check_ins
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.journeys j
            WHERE j.id = journey_id
              AND j.user_id = auth.uid()
        )
    );

CREATE POLICY "check_ins: insert own"
    ON public.check_ins
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.journeys j
            WHERE j.id = journey_id
              AND j.user_id = auth.uid()
        )
    );

CREATE POLICY "check_ins: update own"
    ON public.check_ins
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.journeys j
            WHERE j.id = journey_id
              AND j.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.journeys j
            WHERE j.id = journey_id
              AND j.user_id = auth.uid()
        )
    );
