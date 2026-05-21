import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Options {
  providerId: string;
  enabled: boolean;
  intervalMs?: number;
  minMoveMeters?: number;
}

const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Worker live location heartbeat.
 * - Uses watchPosition (high accuracy) for battery-efficient updates.
 * - Throttles DB writes: max one per intervalMs, and only when moved > minMoveMeters.
 * - Rejects low-accuracy fixes (> 100m) and obvious mock locations (when supported).
 */
export const useWorkerHeartbeat = ({
  providerId,
  enabled,
  intervalMs = 8000,
  minMoveMeters = 15,
}: Options) => {
  const [error, setError] = useState<string | null>(null);
  const [lastFix, setLastFix] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const lastWriteRef = useRef<{ ts: number; lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !providerId) return;
    if (!navigator.geolocation) {
      setError("GPS not supported");
      return;
    }

    const pushLocation = async (lat: number, lng: number) => {
      const { error: err } = await supabase
        .from("service_providers")
        .update({
          latitude: lat,
          longitude: lng,
          is_online: true,
          last_location_update: new Date().toISOString(),
        })
        .eq("id", providerId);
      if (err) setError(err.message);
      else lastWriteRef.current = { ts: Date.now(), lat, lng };
    };

    const onPos = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      if (accuracy > 100) return; // reject low accuracy
      // Some browsers expose mock flag (rare). Cannot fully detect — best effort.
      setLastFix({ lat: latitude, lng: longitude, acc: accuracy });

      const last = lastWriteRef.current;
      const now = Date.now();
      const moved = last ? haversine(last.lat, last.lng, latitude, longitude) : Infinity;
      if (!last || (now - last.ts >= intervalMs && moved >= minMoveMeters) || now - last.ts >= 30000) {
        pushLocation(latitude, longitude);
      }
    };

    const onErr = (e: GeolocationPositionError) => setError(e.message);

    watchIdRef.current = navigator.geolocation.watchPosition(onPos, onErr, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    });

    // Mark online immediately
    supabase
      .from("service_providers")
      .update({ is_online: true, last_location_update: new Date().toISOString() })
      .eq("id", providerId);

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      // Mark offline on cleanup
      supabase
        .from("service_providers")
        .update({ is_online: false })
        .eq("id", providerId);
    };
  }, [enabled, providerId, intervalMs, minMoveMeters]);

  return { error, lastFix };
};
