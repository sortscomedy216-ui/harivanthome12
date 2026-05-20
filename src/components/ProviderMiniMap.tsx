import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface ProviderMiniMapProps {
  userLat: number;
  userLng: number;
  providerLat: number;
  providerLng: number;
  providerName?: string;
}

// Fix default icon paths (Leaflet expects assets in /public; we use CDN)
const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 2px #3b82f6,0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const providerIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;background:#16a34a;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);color:white;font-size:14px;font-weight:bold;">📍</div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const ProviderMiniMap = ({
  userLat,
  userLng,
  providerLat,
  providerLng,
  providerName,
}: ProviderMiniMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
    });
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
    userMarker.bindTooltip("आप यहां", { permanent: false, direction: "top" });

    const providerMarker = L.marker([providerLat, providerLng], { icon: providerIcon }).addTo(map);
    if (providerName) providerMarker.bindTooltip(providerName, { permanent: false, direction: "top" });

    L.polyline(
      [
        [userLat, userLng],
        [providerLat, providerLng],
      ],
      { color: "#16a34a", weight: 2, dashArray: "6,6", opacity: 0.8 }
    ).addTo(map);

    const bounds = L.latLngBounds([
      [userLat, userLng],
      [providerLat, providerLng],
    ]);
    map.fitBounds(bounds, { padding: [25, 25], maxZoom: 15 });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [userLat, userLng, providerLat, providerLng, providerName]);

  const handleOpenMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${providerLat},${providerLng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-border" style={{ height: 140 }}>
      <div ref={mapRef} className="w-full h-full z-0" />
      <button
        onClick={handleOpenMaps}
        className="absolute bottom-2 right-2 bg-background/95 backdrop-blur text-foreground text-xs font-medium px-2.5 py-1 rounded-md shadow-md border border-border z-[1000]"
      >
        Directions ↗
      </button>
    </div>
  );
};

export default ProviderMiniMap;
