-- ============================================================
-- Migration: 009 — Phase 5 Alerts, Notifications & Responder Access
--
-- 1. Creates `emergency_notifications` table to audit and log
--    alerts sent (or simulated) to trusted contacts.
-- 2. Tracks delivery channel and external_sent status accurately.
-- 3. Enables Supabase Realtime for live delivery feedback.
-- 4. Expands RLS policies to allow trusted contacts read-access
--    to active emergency telemetry.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.emergency_notifications (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_id    uuid        NOT NULL REFERENCES public.emergency_events (id) ON DELETE CASCADE,
    user_id         uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    recipient_name  text        NOT NULL,
    recipient_phone text        NOT NULL,
    relationship    text,
    message         text        NOT NULL,
    status          text        NOT NULL DEFAULT 'simulated_dev'
                    CHECK (status IN ('delivered', 'pending', 'failed', 'simulated_dev')),
    channel         text        NOT NULL DEFAULT 'mock_console'
                    CHECK (channel IN ('sms', 'whatsapp', 'push', 'mock_console')),
    external_sent   boolean     NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS emergency_notifications_emergency_id_idx
    ON public.emergency_notifications (emergency_id);

CREATE INDEX IF NOT EXISTS emergency_notifications_user_id_idx
    ON public.emergency_notifications (user_id);

-- ── Realtime Publication ──────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_notifications;

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.emergency_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "emergency_notifications: select own"
    ON public.emergency_notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "emergency_notifications: insert own"
    ON public.emergency_notifications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ── Trusted Contacts / Responder Read Access During Active Emergency ───
-- Allows designated trusted contacts to view an emergency if they belong
-- to the emergency's user.

CREATE POLICY "emergency_events: trusted contact view active"
    ON public.emergency_events
    FOR SELECT
    USING (
        status = 'active' AND
        EXISTS (
            SELECT 1 FROM public.trusted_contacts tc
            JOIN public.profiles p ON p.phone = tc.phone
            WHERE tc.user_id = emergency_events.user_id
              AND p.id = auth.uid()
        )
    );
