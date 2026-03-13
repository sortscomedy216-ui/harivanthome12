import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDynamicFavicon = () => {
  const { data: faviconUrl } = useQuery({
    queryKey: ["app-favicon"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_assets")
        .select("asset_url")
        .eq("asset_key", "app_icon")
        .maybeSingle();
      return data?.asset_url || null;
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!faviconUrl) return;
    
    // Update all favicon links
    const selectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
    ];
    
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        (el as HTMLLinkElement).href = faviconUrl;
      });
    });

    // Ensure at least one favicon link exists
    if (!document.querySelector('link[rel="icon"]')) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = faviconUrl;
      document.head.appendChild(link);
    }
  }, [faviconUrl]);
};
