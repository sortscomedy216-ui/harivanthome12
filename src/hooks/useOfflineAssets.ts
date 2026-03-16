import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "harivant-offline-assets";
const CACHE_EXPIRY_KEY = "harivant-offline-assets-expiry";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedAssets {
  splash_logo?: string;
  app_icon?: string;
  app_name?: string;
  [key: string]: string | undefined;
}

const getCachedAssets = (): CachedAssets => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

const setCachedAssets = (assets: CachedAssets) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(assets));
    localStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_DURATION));
  } catch {
    // Storage full - ignore
  }
};

// Convert image URL to base64 data URI for true offline support
const urlToBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const useOfflineAssets = () => {
  const [assets, setAssets] = useState<CachedAssets>(getCachedAssets);

  const { data: serverAssets } = useQuery({
    queryKey: ["offline-app-assets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_assets")
        .select("asset_key, asset_url, asset_value")
        .in("asset_key", ["splash_logo", "app_icon", "app_name"]);
      return data || [];
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // When server data arrives, cache images as base64 locally
  useEffect(() => {
    if (!serverAssets || serverAssets.length === 0) return;

    const cacheAssets = async () => {
      const newAssets: CachedAssets = { ...getCachedAssets() };
      let changed = false;

      for (const item of serverAssets) {
        if (item.asset_key === "app_name" && item.asset_value) {
          if (newAssets.app_name !== item.asset_value) {
            newAssets.app_name = item.asset_value;
            changed = true;
          }
          continue;
        }

        if (item.asset_url && item.asset_url !== "default") {
          // Check if URL changed (need to re-cache)
          const urlCacheKey = `${item.asset_key}_url`;
          if ((newAssets as any)[urlCacheKey] !== item.asset_url) {
            const base64 = await urlToBase64(item.asset_url);
            if (base64) {
              newAssets[item.asset_key] = base64;
              (newAssets as any)[urlCacheKey] = item.asset_url;
              changed = true;
            }
          }
        }
      }

      if (changed) {
        setCachedAssets(newAssets);
        setAssets(newAssets);
      }
    };

    cacheAssets();
  }, [serverAssets]);

  return {
    splashLogo: assets.splash_logo || null,
    appIcon: assets.app_icon || null,
    appName: assets.app_name || "हरिवंत",
    categoryIcon: (catId: string) => assets[`cat_${catId}`] || null,
  };
};

// Separate hook for category assets with offline caching
export const useOfflineCategoryAssets = () => {
  const [catAssets, setCatAssets] = useState<Record<string, string>>(() => {
    try {
      const cached = localStorage.getItem("harivant-cat-assets");
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const { data: serverCatAssets } = useQuery({
    queryKey: ["category-assets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_assets")
        .select("asset_key, asset_url")
        .like("asset_key", "cat_%")
        .not("asset_key", "like", "cat_disabled_%");
      const map: Record<string, string> = {};
      data?.forEach((item) => {
        if (item.asset_url) {
          const catId = item.asset_key.replace("cat_", "");
          map[catId] = item.asset_url;
        }
      });
      return map;
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!serverCatAssets) return;

    const cacheAll = async () => {
      const cached = { ...catAssets };
      let changed = false;

      for (const [catId, url] of Object.entries(serverCatAssets)) {
        const urlKey = `_url_${catId}`;
        if ((cached as any)[urlKey] !== url) {
          const base64 = await urlToBase64(url);
          if (base64) {
            cached[catId] = base64;
            (cached as any)[urlKey] = url;
            changed = true;
          }
        }
      }

      if (changed) {
        try {
          localStorage.setItem("harivant-cat-assets", JSON.stringify(cached));
        } catch { /* ignore */ }
        setCatAssets(cached);
      }
    };

    cacheAll();
  }, [serverCatAssets]);

  return catAssets;
};
