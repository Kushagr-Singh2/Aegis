-- ============================================================
-- Migration: 008 — Phase 3 safety engine
--
-- 1. Extends emergency_events.trigger_type CHECK constraint to
--    include 'MANUAL_SOS', 'manual_sos', 'VOICE_SOS', 'voice_sos'
--    as first-class trigger types.
--
-- 2. Extends emergency_events.risk_level CHECK constraint to
--    include 'LOW', 'low', 'MODERATE', 'moderate', 'medium', 'MEDIUM',
--    'HIGH', 'high', 'CRITICAL', 'critical'.
--
-- 3. Adds partial index for fast retrieval of active emergencies.
-- ============================================================

-- ── 1. Extend trigger_type CHECK ─────────────────────────────
ALTER TABLE public.emergency_events
    DROP CONSTRAINT IF EXISTS emergency_events_trigger_type_check;

ALTER TABLE public.emergency_events
    ADD CONSTRAINT emergency_events_trigger_type_check
    CHECK (
        trigger_type IN (
            'manual',
            'manual_sos',
            'MANUAL_SOS',
            'voice_sos',
            'VOICE_SOS',
            'auto',
            'AUTO',
            'check_in_miss',
            'CHECK_IN_MISS',
            'geofence',
            'GEOFENCE'
        )
    );

-- ── 2. Extend risk_level CHECK ───────────────────────────────
ALTER TABLE public.emergency_events
    DROP CONSTRAINT IF EXISTS emergency_events_risk_level_check;

ALTER TABLE public.emergency_events
    ADD CONSTRAINT emergency_events_risk_level_check
    CHECK (
        risk_level IS NULL OR
        risk_level IN (
            'low', 'LOW',
            'moderate', 'MODERATE',
            'medium', 'MEDIUM',
            'high', 'HIGH',
            'critical', 'CRITICAL'
        )
    );

-- ── 3. Index for active emergency fast-path ───────────────────
CREATE INDEX IF NOT EXISTS emergency_events_active_idx
    ON public.emergency_events (user_id, created_at DESC)
    WHERE status = 'active';
