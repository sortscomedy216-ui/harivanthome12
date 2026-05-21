// Road distance + ETA via OSRM public demo server (free, no key).
// Falls back to straight-line if OSRM unavailable.

export interface RouteInfo {
  distanceMeters: number;
  durationSeconds: number;
  geometry: [number, number][]; // [lat, lng] pairs
  source: "osrm" | "haversine";
}

const cache = new Map<string, { ts: number; data: RouteInfo }>();
const CACHE_TTL = 60_000; // 1 min

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

export const computeRoute = async (
  userLat: number,
  userLng: number,
  destLat: number,
  destLng: number,
  withGeometry = false
): Promise<RouteInfo> => {
  const key = `${userLat.toFixed(5)},${userLng.toFixed(5)}|${destLat.toFixed(5)},${destLng.toFixed(5)}|${withGeometry ? 1 : 0}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data;

  const fallback = (): RouteInfo => {
    const d = haversine(userLat, userLng, destLat, destLng);
    return {
      distanceMeters: d,
      durationSeconds: (d / 1000 / 25) * 3600, // assume 25 km/h urban avg
      geometry: [[userLat, userLng], [destLat, destLng]],
      source: "haversine",
    };
  };

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${destLng},${destLat}?overview=${withGeometry ? "full" : "false"}&geometries=geojson`;
    const ctl = new AbortController();
    const tid = setTimeout(() => ctl.abort(), 4000);
    const res = await fetch(url, { signal: ctl.signal });
    clearTimeout(tid);
    if (!res.ok) throw new Error("osrm");
    const json = await res.json();
    const route = json?.routes?.[0];
    if (!route) throw new Error("no route");
    const info: RouteInfo = {
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      geometry: withGeometry
        ? (route.geometry.coordinates as [number, number][]).map(
            ([lng, lat]) => [lat, lng] as [number, number]
          )
        : [[userLat, userLng], [destLat, destLng]],
      source: "osrm",
    };
    cache.set(key, { ts: Date.now(), data: info });
    return info;
  } catch {
    const fb = fallback();
    cache.set(key, { ts: Date.now(), data: fb });
    return fb;
  }
};

export const formatDistance = (m: number): string =>
  m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;

export const formatEta = (sec: number): string => {
  const min = Math.max(1, Math.round(sec / 60));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return `${h}h ${min % 60}m`;
};
