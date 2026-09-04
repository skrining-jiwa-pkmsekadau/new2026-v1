-- ================================================================
-- 10_notifikasi_telegram.sql
-- Dedup dan status pengiriman notifikasi Telegram tanpa menyimpan PHI.
-- Jalankan sebelum membuat Database Webhook.
-- ================================================================

BEGIN;

DO $preflight$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'screenings'
      AND column_name = 'submission_id' AND data_type = 'uuid'
  ) THEN
    RAISE EXCEPTION 'Jalankan db/08 dan db/09 sebelum db/10';
  END IF;
END;
$preflight$;

ALTER TABLE public.screenings
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
ALTER TABLE public.screenings
  ALTER COLUMN submitted_at SET DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.telegram_notification_outbox (
  submission_id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.telegram_notification_log (
  submission_id UUID PRIMARY KEY,
  status TEXT NOT NULL
    CHECK (status IN ('processing', 'sent', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attempt INTEGER NOT NULL DEFAULT 1,
  sent_at TIMESTAMPTZ
);

ALTER TABLE public.telegram_notification_log
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS attempt INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

ALTER TABLE public.telegram_notification_log
  DROP CONSTRAINT IF EXISTS telegram_notification_log_attempt_check;
ALTER TABLE public.telegram_notification_log
  ADD CONSTRAINT telegram_notification_log_attempt_check
  CHECK (attempt BETWEEN 1 AND 10);

CREATE OR REPLACE FUNCTION public.enqueue_telegram_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.telegram_notification_outbox (submission_id)
  VALUES (NEW.submission_id)
  ON CONFLICT (submission_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS enqueue_telegram_notification_on_screening
  ON public.screenings;
CREATE TRIGGER enqueue_telegram_notification_on_screening
AFTER INSERT ON public.screenings
FOR EACH ROW
WHEN (NEW.submission_id IS NOT NULL)
EXECUTE FUNCTION public.enqueue_telegram_notification();

ALTER TABLE public.telegram_notification_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_notification_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.telegram_notification_outbox FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.telegram_notification_log FROM PUBLIC, anon, authenticated;


CREATE OR REPLACE FUNCTION public.claim_telegram_notification(p_submission_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_claim UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.telegram_notification_outbox
    WHERE submission_id = p_submission_id
  ) THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.telegram_notification_log (submission_id, status, attempt)
  VALUES (p_submission_id, 'processing', 1)
  ON CONFLICT (submission_id) DO UPDATE
    SET status = 'processing', updated_at = NOW(), sent_at = NULL,
        attempt = telegram_notification_log.attempt + 1
    WHERE telegram_notification_log.attempt < 10
      AND (
        telegram_notification_log.status = 'failed'
        OR (telegram_notification_log.status = 'processing'
            AND telegram_notification_log.updated_at < NOW() - INTERVAL '5 minutes')
      )
  RETURNING submission_id INTO v_claim;

  RETURN v_claim IS NOT NULL;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.claim_telegram_notification(UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_telegram_notification(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.next_telegram_notification()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT o.submission_id
  FROM public.telegram_notification_outbox o
  LEFT JOIN public.telegram_notification_log l USING (submission_id)
  WHERE l.submission_id IS NULL
     OR (l.status = 'failed' AND l.attempt < 10)
     OR (l.status = 'processing' AND l.attempt < 10
         AND l.updated_at < NOW() - INTERVAL '5 minutes')
  ORDER BY o.created_at
  LIMIT 1;
$function$;

REVOKE EXECUTE ON FUNCTION public.next_telegram_notification()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_telegram_notification() TO service_role;

GRANT SELECT ON TABLE public.screenings TO service_role;
GRANT SELECT ON TABLE public.telegram_notification_outbox TO service_role;
GRANT SELECT, UPDATE ON TABLE public.telegram_notification_log TO service_role;
COMMENT ON TABLE public.telegram_notification_log IS
  'Status teknis notifikasi Telegram. Tidak boleh menyimpan nama, NIK, jawaban, atau PHI lain.';
COMMENT ON TABLE public.telegram_notification_outbox IS
  'Webhook source minimal: hanya submission_id, tanpa PHI.';

COMMENT ON COLUMN public.screenings.submitted_at IS
  'Waktu server menerima skrining. NULL pada baris sebelum migrasi 10.';

COMMIT;

SELECT CASE WHEN
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'telegram_notification_log'
      AND column_name = 'status'
      AND is_nullable = 'NO'
  )
  AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'telegram_notification_outbox'
      AND column_name = 'submission_id'
      AND data_type = 'uuid'
  )
  AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'screenings'
      AND column_name = 'submitted_at'
      AND data_type = 'timestamp with time zone'
  )
  AND EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ('telegram_notification_log', 'telegram_notification_outbox')
      AND c.relrowsecurity
    GROUP BY n.nspname
    HAVING COUNT(*) = 2
  )
  AND EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'enqueue_telegram_notification_on_screening'
      AND tgrelid = 'public.screenings'::regclass
      AND tgenabled <> 'D'
      AND NOT tgisinternal
  )
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants
    WHERE table_schema = 'public'
      AND table_name IN ('telegram_notification_log', 'telegram_notification_outbox')
      AND grantee IN ('PUBLIC', 'anon', 'authenticated')
  )
  AND has_function_privilege('service_role', 'public.claim_telegram_notification(uuid)', 'EXECUTE')
  AND has_function_privilege('service_role', 'public.next_telegram_notification()', 'EXECUTE')
  AND has_table_privilege('service_role', 'public.screenings', 'SELECT')
  AND has_table_privilege('service_role', 'public.telegram_notification_log', 'UPDATE')
  AND NOT has_function_privilege('anon', 'public.claim_telegram_notification(uuid)', 'EXECUTE')
THEN 'SIAP konfigurasi Telegram'
ELSE 'BELUM — jangan buat webhook'
END AS status_telegram;
