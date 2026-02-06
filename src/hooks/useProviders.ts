import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation as useAppLocation } from "@/contexts/LocationContext";
import { Database } from "@/integrations/supabase/types";

type ServiceCategory = Database["public"]["Enums"]["service_category"];

export interface ServiceProvider {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  photo_url: string | null;
  category: ServiceCategory;
  skills: string[];
  experience: number;
  location: string | null;
  city: string;
  price_per_hour: number;
  rating: number;
  review_count: number;
  available: boolean;
  verified: boolean;
  status: string;
  about: string | null;
  created_at: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ProviderWithDistance extends ServiceProvider {
  distance: number | null;
}

export const useProviders = (category?: string) => {
  const { city, calculateDistance, coordinates } = useAppLocation();

  return useQuery({
    queryKey: ["providers", category, city, coordinates?.latitude, coordinates?.longitude],
    queryFn: async () => {
      let query = supabase
        .from("service_providers")
        .select("*")
        .eq("status", "approved");

      if (category) {
        query = query.eq("category", category as ServiceCategory);
      }

      // Only filter by city if GPS is not available
      if (city && !coordinates) {
        query = query.eq("city", city);
      }

      const { data, error } = await query.order("rating", { ascending: false });

      if (error) throw error;

      // Calculate distance for each provider
      const providersWithDistance: ProviderWithDistance[] = ((data || []) as ServiceProvider[]).map((provider) => {
        let distance: number | null = null;
        if (provider.latitude && provider.longitude) {
          distance = calculateDistance(
            Number(provider.latitude),
            Number(provider.longitude)
          );
        }
        return { ...provider, distance };
      });

      // Sort: providers with distance first (nearest), then providers without distance (by rating)
      providersWithDistance.sort((a, b) => {
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        if (a.distance !== null && b.distance === null) return -1;
        if (a.distance === null && b.distance !== null) return 1;
        return Number(b.rating) - Number(a.rating);
      });

      return providersWithDistance;
    },
  });
};

export const useProvider = (id: string) => {
  return useQuery({
    queryKey: ["provider", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ServiceProvider;
    },
    enabled: !!id,
  });
};

export const useProviderReviews = (providerId: string) => {
  return useQuery({
    queryKey: ["reviews", providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles:user_id (name)
        `)
        .eq("provider_id", providerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });
};

export const usePendingProviders = () => {
  return useQuery({
    queryKey: ["pending-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ServiceProvider[];
    },
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [providers, pending] = await Promise.all([
        supabase.from("service_providers").select("id", { count: "exact" }).eq("status", "approved"),
        supabase.from("service_providers").select("id", { count: "exact" }).eq("status", "pending"),
      ]);

      return {
        totalProviders: providers.count || 0,
        pendingApprovals: pending.count || 0,
      };
    },
  });
};
