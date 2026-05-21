import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation as useAppLocation } from "@/contexts/LocationContext";
import { computeRoute } from "@/lib/routing";

export interface LiveProvider {
  id: string;
  name: string;
  phone: string;
  photo_url: string | null;
  category: string;
  experience: number;
  rating: number;
  review_count: number;
  available: boolean;
  verified: boolean;
  location: string | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
  is_online: boolean;
  last_location_update: string | null;
  distanceMeters: number | null;
  etaSeconds: number | null;
  routeSource: "osrm" | "haversine" | null;
}

const STALE_MS = 2 * 60_000; // worker considered offline after 2 min no update

export const useLiveProviders = (category?: string) => {
  const { coordinates } = useAppLocation();
  const [providers, setProviders] = useState<LiveProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial fetch + realtime subscribe
  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const load = async () => {
      let q = supabase
        .from("service_providers")
        .select(
          "id,name,phone,photo_url,category,experience,rating,review_count,available,verified,location,city,latitude,longitude,is_online,last_location_update"
        )
        .eq("status", "approved");
      if (category) q = q.eq("category", category as any);
      const { data } = await q;
      if (!active) return;
      const mapped: LiveProvider[] = (data || []).map((p: any) => ({
        ...p,
        latitude: p.latitude != null ? Number(p.latitude) : null,
        longitude: p.longitude != null ? Number(p.longitude) : null,
        distanceMeters: null,
        etaSeconds: null,
        routeSource: null,
      }));
      setProviders(mapped);
      setIsLoading(false);
    };

    load();

    channel = supabase
      .channel(`providers-live-${category || "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_providers" },
        (payload) => {
          setProviders((prev) => {
            const row: any = payload.new || payload.old;
            if (!row) return prev;
            if (category && row.category !== category) return prev;
            if (payload.eventType === "DELETE") {
              return prev.filter((p) => p.id !== row.id);
            }
            if (row.status !== "approved") {
              return prev.filter((p) => p.id !== row.id);
            }
            const incoming: LiveProvider = {
              ...row,
              latitude: row.latitude != null ? Number(row.latitude) : null,
              longitude: row.longitude != null ? Number(row.longitude) : null,
              distanceMeters: null,
              etaSeconds: null,
              routeSource: null,
            };
            const idx = prev.findIndex((p) => p.id === row.id);
            if (idx === -1) return [...prev, incoming];
            const next = [...prev];
            // keep previously computed distance to avoid flicker; will recompute on coord change
            next[idx] = { ...incoming, distanceMeters: prev[idx].distanceMeters, etaSeconds: prev[idx].etaSeconds, routeSource: prev[idx].routeSource };
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [category]);

  // Compute road distance + ETA when user coords change or providers list updates
  useEffect(() => {
    if (!coordinates) return;
    let cancelled = false;
    const list = providers.filter(
      (p) => p.latitude != null && p.longitude != null && p.distanceMeters == null
    );
    if (list.length === 0) return;
    (async () => {
      // limit concurrency to be nice to OSRM
      for (const p of list.slice(0, 15)) {
        if (cancelled) return;
        const r = await computeRoute(
          coordinates.latitude,
          coordinates.longitude,
          p.latitude!,
          p.longitude!,
          false
        );
        if (cancelled) return;
        setProviders((prev) =>
          prev.map((x) =>
            x.id === p.id
              ? { ...x, distanceMeters: r.distanceMeters, etaSeconds: r.durationSeconds, routeSource: r.source }
              : x
          )
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [coordinates?.latitude, coordinates?.longitude, providers.length]);

  // Sorted: online + fresh first, then by distance, then rating
  const now = Date.now();
  const sorted = [...providers].sort((a, b) => {
    const aLive =
      a.is_online &&
      a.last_location_update &&
      now - new Date(a.last_location_update).getTime() < STALE_MS;
    const bLive =
      b.is_online &&
      b.last_location_update &&
      now - new Date(b.last_location_update).getTime() < STALE_MS;
    if (aLive !== bLive) return aLive ? -1 : 1;
    if (a.distanceMeters != null && b.distanceMeters != null)
      return a.distanceMeters - b.distanceMeters;
    if (a.distanceMeters != null) return -1;
    if (b.distanceMeters != null) return 1;
    return Number(b.rating) - Number(a.rating);
  });

  return { providers: sorted, isLoading };
};

export const isProviderLive = (p: Pick<LiveProvider, "is_online" | "last_location_update">) =>
  p.is_online &&
  !!p.last_location_update &&
  Date.now() - new Date(p.last_location_update).getTime() < STALE_MS;
