
-- Areas table for locality management
CREATE TABLE public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT,
  district TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled areas" ON public.areas FOR SELECT USING (true);
CREATE POLICY "Admins can manage areas" ON public.areas FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Admin logs table for activity tracking
CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  target_name TEXT,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view logs" ON public.admin_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert logs" ON public.admin_logs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admin notifications table
CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notifications" ON public.admin_notifications FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage notifications" ON public.admin_notifications FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert notifications" ON public.admin_notifications FOR INSERT WITH CHECK (true);

-- Add area column to service_providers if not exists
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS area TEXT;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS disabled BOOLEAN DEFAULT false;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS disable_reason TEXT;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS blacklisted BOOLEAN DEFAULT false;
