import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Dynamically updates the browser favicon from app_assets table.
 * Admin can change "app_icon" asset and it reflects in real-time.
 */
export const useDynamicFavicon = () => {
  const { data: iconUrl } = useQuery({
    queryKey: ["app-icon"],
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
    if (!iconUrl) return;

    // Update all favicon link elements
    const selectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
    ];

    selectors.forEach((selector) => {
      const links = document.querySelectorAll<HTMLLinkElement>(selector);
      links.forEach((link) => {
        link.href = iconUrl;
      });
    });

    // If no favicon link exists, create one
    if (!document.querySelector('link[rel="icon"]')) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = iconUrl;
      document.head.appendChild(link);
    }
  }, [iconUrl]);
};
