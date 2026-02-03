-- Fix function search path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix function search path for update_provider_rating
CREATE OR REPLACE FUNCTION public.update_provider_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.service_providers
  SET 
    rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE provider_id = NEW.provider_id),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE provider_id = NEW.provider_id)
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$;

-- Fix function search path for handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.phone
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Fix overly permissive INSERT policy for service_providers
DROP POLICY IF EXISTS "Users can insert their provider application" ON public.service_providers;

CREATE POLICY "Authenticated users can register as provider"
  ON public.service_providers FOR INSERT
  TO authenticated
  WITH CHECK (true);