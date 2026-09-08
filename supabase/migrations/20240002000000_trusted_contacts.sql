-- ============================================================
-- Migration: 002 — trusted_contacts
-- Stores emergency contacts that a user designates to be
-- notified or alerted during a journey.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.trusted_contacts (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    name            text        NOT NULL,
    phone           text        NOT NULL,
    relationship    text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trusted_contacts_user_id_idx
    ON public.trusted_contacts (user_id);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trusted_contacts: select own"
    ON public.trusted_contacts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "trusted_contacts: insert own"
    ON public.trusted_contacts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trusted_contacts: update own"
    ON public.trusted_contacts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trusted_contacts: delete own"
    ON public.trusted_contacts
    FOR DELETE
    USING (auth.uid() = user_id);
