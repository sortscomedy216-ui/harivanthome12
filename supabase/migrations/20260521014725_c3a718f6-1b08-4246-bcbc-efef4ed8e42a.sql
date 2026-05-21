
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_location_update timestamptz;

CREATE INDEX IF NOT EXISTS idx_providers_online_cat
  ON public.service_providers (category, is_online)
  WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_providers_geo
  ON public.service_providers (latitude, longitude);

ALTER TABLE public.service_providers REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'service_providers'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.service_providers';
  END IF;
END $$;

-- Allow a provider (by phone or user_id) to update their own live location fields via existing policy.
-- The existing "Users can update their own provider profile" policy already covers user_id matches.
