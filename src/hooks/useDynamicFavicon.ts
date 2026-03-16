import { useEffect } from "react";
import { useOfflineAssets } from "./useOfflineAssets";

export const useDynamicFavicon = () => {
  const { appIcon } = useOfflineAssets();

  useEffect(() => {
    if (!appIcon) return;

    // Update all favicon links with cached base64 data
    const selectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
    ];

    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        (el as HTMLLinkElement).href = appIcon;
      });
    });

    // Ensure at least one favicon link exists
    if (!document.querySelector('link[rel="icon"]')) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = appIcon;
      document.head.appendChild(link);
    }
  }, [appIcon]);
};
