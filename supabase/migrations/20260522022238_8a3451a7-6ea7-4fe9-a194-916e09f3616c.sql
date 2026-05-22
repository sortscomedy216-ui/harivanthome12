CREATE TABLE IF NOT EXISTS public.app_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  link_url TEXT,
  title TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.app_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Banners viewable by everyone"
ON public.app_banners FOR SELECT
USING (true);

CREATE POLICY "Admins manage banners insert"
ON public.app_banners FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage banners update"
ON public.app_banners FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage banners delete"
ON public.app_banners FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_app_banners_updated_at
BEFORE UPDATE ON public.app_banners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_app_banners_active_order ON public.app_banners (is_active, sort_order);