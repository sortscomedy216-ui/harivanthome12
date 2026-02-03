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
}

export const useProviders = (category?: string) => {
  const { city } = useAppLocation();

  return useQuery({
    queryKey: ["providers", category, city],
    queryFn: async () => {
      let query = supabase
        .from("service_providers")
        .select("*")
        .eq("status", "approved");

      if (category) {
        query = query.eq("category", category as ServiceCategory);
      }

      if (city) {
        query = query.eq("city", city);
      }

      const { data, error } = await query.order("rating", { ascending: false });

      if (error) throw error;
      return data as ServiceProvider[];
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
