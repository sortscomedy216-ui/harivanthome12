import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { useLocation as useAppLocation } from "@/contexts/LocationContext";
import { computeRoute, formatDistance, formatEta, RouteInfo } from "@/lib/routing";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Navigation, Phone, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,0.25),0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const providerIcon = L.divIcon({
  className: "",
  html: `<div style="width:34px;height:34px;background:#16a34a;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:16px;">🛠️</div></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

interface ProviderRow {
  id: string;
  name: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  is_online: boolean;
  last_location_update: string | null;
}

const LiveTrackPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { coordinates, requestLocation } = useAppLocation();
  const [provider, setProvider] = useState<ProviderRow | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const userMarker = useRef<L.Marker | null>(null);
  const provMarker = useRef<L.Marker | null>(null);
  const routeLine = useRef<L.Polyline | null>(null);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false });
    mapInstance.current = map;
    map.setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Watch user position continuously
  useEffect(() => {
    if (!navigator.geolocation) return;
    const wid = navigator.geolocation.watchPosition(
      () => {},
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );
    requestLocation();
    return () => navigator.geolocation.clearWatch(wid);
  }, [requestLocation]);

  // Fetch + subscribe to provider
  useEffect(() => {
    if (!id) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data } = await supabase
        .from("service_providers")
        .select("id,name,phone,latitude,longitude,is_online,last_location_update")
        .eq("id", id)
        .maybeSingle();
      if (data) {
        setProvider({
          ...data,
          latitude: data.latitude != null ? Number(data.latitude) : null,
          longitude: data.longitude != null ? Number(data.longitude) : null,
        });
      }
    })();

    channel = supabase
      .channel(`track-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "service_providers", filter: `id=eq.${id}` },
        (payload) => {
          const row: any = payload.new;
          setProvider({
            id: row.id,
            name: row.name,
            phone: row.phone,
            latitude: row.latitude != null ? Number(row.latitude) : null,
            longitude: row.longitude != null ? Number(row.longitude) : null,
            is_online: row.is_online,
            last_location_update: row.last_location_update,
          });
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [id]);

  // Update markers + route
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (coordinates) {
      const pos: L.LatLngExpression = [coordinates.latitude, coordinates.longitude];
      if (!userMarker.current) userMarker.current = L.marker(pos, { icon: userIcon }).addTo(map);
      else userMarker.current.setLatLng(pos);
    }

    if (provider?.latitude && provider?.longitude) {
      const pos: L.LatLngExpression = [provider.latitude, provider.longitude];
      if (!provMarker.current)
        provMarker.current = L.marker(pos, { icon: providerIcon }).addTo(map).bindTooltip(provider.name);
      else provMarker.current.setLatLng(pos);
    }

    if (coordinates && provider?.latitude && provider?.longitude) {
      const bounds = L.latLngBounds([
        [coordinates.latitude, coordinates.longitude],
        [provider.latitude, provider.longitude],
      ]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [coordinates?.latitude, coordinates?.longitude, provider?.latitude, provider?.longitude]);

  // Recompute route when either side moves
  useEffect(() => {
    if (!coordinates || !provider?.latitude || !provider?.longitude) return;
    let cancelled = false;
    (async () => {
      const r = await computeRoute(
        coordinates.latitude,
        coordinates.longitude,
        provider.latitude!,
        provider.longitude!,
        true
      );
      if (cancelled) return;
      setRoute(r);
      const map = mapInstance.current;
      if (!map) return;
      if (routeLine.current) routeLine.current.remove();
      routeLine.current = L.polyline(r.geometry, {
        color: "#16a34a",
        weight: 5,
        opacity: 0.85,
      }).addTo(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [coordinates?.latitude, coordinates?.longitude, provider?.latitude, provider?.longitude]);

  const isLive =
    provider?.is_online &&
    provider.last_location_update &&
    Date.now() - new Date(provider.last_location_update).getTime() < 2 * 60_000;

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="px-3 py-2 flex items-center gap-2 border-b border-border bg-card z-10 safe-top">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold truncate">{provider?.name || (language === "hi" ? "लाइव ट्रैकिंग" : "Live tracking")}</h1>
            {isLive && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          {route && (
            <p className="text-xs text-muted-foreground">
              {formatDistance(route.distanceMeters)} • {formatEta(route.durationSeconds)}
              {route.source === "haversine" && " (approx)"}
            </p>
          )}
        </div>
        {provider?.phone && (
          <Button size="icon" variant="outline" onClick={() => (window.location.href = `tel:${provider.phone}`)}>
            <Phone className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div ref={mapRef} className="flex-1 z-0" />

      {!coordinates && (
        <div className="absolute inset-x-4 top-20 bg-card border border-border rounded-xl p-4 shadow-elevated z-20">
          <p className="text-sm mb-3">
            {language === "hi"
              ? "लाइव ट्रैकिंग के लिए लोकेशन परमिशन ज़रूरी है"
              : "Location permission required for live tracking"}
          </p>
          <Button onClick={requestLocation} className="w-full">
            <Navigation className="w-4 h-4 mr-2" />
            {language === "hi" ? "लोकेशन चालू करें" : "Enable Location"}
          </Button>
        </div>
      )}

      {!provider && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default LiveTrackPage;
