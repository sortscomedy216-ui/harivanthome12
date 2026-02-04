-- Add latitude and longitude columns to service_providers for location-based sorting
ALTER TABLE public.service_providers 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Create index for faster location queries
CREATE INDEX idx_service_providers_location ON public.service_providers (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;