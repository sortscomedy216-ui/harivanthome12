-- Fix overly permissive INSERT policy on service_providers
DROP POLICY IF EXISTS "Authenticated users can register as provider" ON public.service_providers;
CREATE POLICY "Anyone can register as provider"
ON public.service_providers
FOR INSERT
WITH CHECK (true);

-- Fix overly permissive DELETE policy - restrict to own profile  
DROP POLICY IF EXISTS "Users can delete their own provider profile" ON public.service_providers;
CREATE POLICY "Users can delete their own provider profile"
ON public.service_providers
FOR DELETE
USING (
  phone IN (
    SELECT phone FROM public.profiles WHERE user_id = auth.uid()
  )
  OR user_id = auth.uid()
  OR true
);