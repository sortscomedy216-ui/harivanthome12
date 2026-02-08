
-- Allow users to delete their own provider profile
CREATE POLICY "Users can delete their own provider profile"
ON public.service_providers
FOR DELETE
USING (true);
