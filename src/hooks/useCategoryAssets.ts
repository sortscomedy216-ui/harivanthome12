import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCategoryAssets = () => {
  return useQuery({
    queryKey: ["category-assets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_assets")
        .select("asset_key, asset_url")
        .like("asset_key", "cat_%");
      const map: Record<string, string> = {};
      data?.forEach((item) => {
        if (item.asset_url) {
          // asset_key is like "cat_plumber" → extract "plumber"
          const catId = item.asset_key.replace("cat_", "");
          map[catId] = item.asset_url;
        }
      });
      return map;
    },
    staleTime: 30000, // refresh every 30s for real-time feel
    refetchInterval: 30000,
  });
};
