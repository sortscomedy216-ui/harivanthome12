import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "Harivant - Home Services",
        short_name: "Harivant",
        description: "Professional home services marketplace - घर की सेवाएं एक क्लिक पर। Find plumbers, electricians, carpenters near you.",
        theme_color: "#0ea5e9",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/?source=pwa",
        id: "harivant-home-services",
        dir: "ltr",
        lang: "hi-IN",
        categories: ["lifestyle", "utilities", "business"],
        iarc_rating_id: "",
        prefer_related_applications: false,
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/home.png",
            sizes: "1080x1920",
            type: "image/png",
            form_factor: "narrow",
            label: "Home screen showing service categories",
          },
          {
            src: "/screenshots/providers.png",
            sizes: "1080x1920",
            type: "image/png",
            form_factor: "narrow",
            label: "Service providers list with distance",
          },
        ],
        shortcuts: [
          {
            name: "Find Plumber",
            short_name: "Plumber",
            description: "Find nearby plumbers",
            url: "/providers/plumber?source=shortcut",
            icons: [{ src: "/icons/plumber.png", sizes: "192x192" }],
          },
          {
            name: "Find Electrician",
            short_name: "Electrician",
            description: "Find nearby electricians",
            url: "/providers/electrician?source=shortcut",
            icons: [{ src: "/icons/electrician.png", sizes: "192x192" }],
          },
        ],
        related_applications: [],
        handle_links: "preferred",
        launch_handler: {
          client_mode: ["navigate-existing", "auto"],
        },
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webp}"],
        cleanupOutdatedCaches: true,
        sourcemap: false,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
