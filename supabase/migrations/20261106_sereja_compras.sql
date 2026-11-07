-- Idempotency and retry state for Sereja paid-sale processing.
-- Run this in the Supabase SQL Editor before enabling the Sereja webhook.

ALTER TABLE public.compras
  ADD COLUMN IF NOT EXISTS sereja_event_id text;

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS convite_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS convite_tentativas integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS convite_lease_ate timestamptz,
  ADD COLUMN IF NOT EXISTS convite_ultimo_erro text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_attribute a
      ON a.attrelid = i.indrelid
     AND a.attnum = i.indkey[0]
    WHERE i.indrelid = 'public.compras'::regclass
      AND i.indisunique
      AND i.indnkeyatts = 1
      AND a.attname = 'sereja_venda_id'
  ) THEN
    CREATE UNIQUE INDEX compras_sereja_venda_id_uidx
      ON public.compras (sereja_venda_id);
  END IF;

END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.usuarios'::regclass
      AND conname = 'usuarios_convite_status_check'
  ) THEN
    ALTER TABLE public.usuarios
      ADD CONSTRAINT usuarios_convite_status_check
      CHECK (convite_status IN ('none', 'pending', 'sending', 'sent', 'failed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS compras_usuario_status_idx
  ON public.compras (usuario_id, status);

CREATE INDEX IF NOT EXISTS usuarios_convite_retry_idx
  ON public.usuarios (convite_status, convite_lease_ate)
  WHERE convite_status IN ('pending', 'failed', 'sending');
