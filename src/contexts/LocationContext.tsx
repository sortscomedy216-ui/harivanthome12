import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  city: string;
  setCity: (city: string) => void;
  isLocationSet: boolean;
  coordinates: Coordinates | null;
  isLoadingLocation: boolean;
  locationError: string | null;
  requestLocation: () => void;
  calculateDistance: (providerLat: number, providerLng: number) => number | null;
}

export const cities = [
  { id: "delhi", name: "दिल्ली", nameEn: "Delhi" },
  { id: "mumbai", name: "मुंबई", nameEn: "Mumbai" },
  { id: "bangalore", name: "बैंगलोर", nameEn: "Bangalore" },
  { id: "chennai", name: "चेन्नई", nameEn: "Chennai" },
  { id: "kolkata", name: "कोलकाता", nameEn: "Kolkata" },
  { id: "hyderabad", name: "हैदराबाद", nameEn: "Hyderabad" },
  { id: "pune", name: "पुणे", nameEn: "Pune" },
  { id: "jaipur", name: "जयपुर", nameEn: "Jaipur" },
  { id: "lucknow", name: "लखनऊ", nameEn: "Lucknow" },
  { id: "ahmedabad", name: "अहमदाबाद", nameEn: "Ahmedabad" },
];

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Haversine formula to calculate distance between two points in km
const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [city, setCityState] = useState<string>(() => {
    return localStorage.getItem("harivant-city") || "";
  });
  const [coordinates, setCoordinates] = useState<Coordinates | null>(() => {
    const stored = localStorage.getItem("harivant-coordinates");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const setCity = (newCity: string) => {
    setCityState(newCity);
    localStorage.setItem("harivant-city", newCity);
  };

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("आपके ब्राउज़र में लोकेशन सपोर्ट नहीं है");
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoordinates(coords);
        localStorage.setItem("harivant-coordinates", JSON.stringify(coords));
        setIsLoadingLocation(false);
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("लोकेशन परमिशन देनी होगी");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("लोकेशन उपलब्ध नहीं है");
            break;
          case error.TIMEOUT:
            setLocationError("लोकेशन टाइमआउट");
            break;
          default:
            setLocationError("लोकेशन प्राप्त करने में त्रुटि");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  }, []);

  const calculateDistance = useCallback(
    (providerLat: number, providerLng: number): number | null => {
      if (!coordinates) return null;
      return haversineDistance(
        coordinates.latitude,
        coordinates.longitude,
        providerLat,
        providerLng
      );
    },
    [coordinates]
  );

  // Continuous high-accuracy live tracking via watchPosition.
  useEffect(() => {
    if (!navigator.geolocation) return;
    const wid = navigator.geolocation.watchPosition(
      (position) => {
        if (position.coords.accuracy > 150) return; // reject low-accuracy fixes
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoordinates(coords);
        localStorage.setItem("harivant-coordinates", JSON.stringify(coords));
        setLocationError(null);
      },
      () => {
        // silent — initial requestLocation surfaces errors
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
    if (!coordinates) requestLocation();
    return () => navigator.geolocation.clearWatch(wid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLocationSet = !!city;

  return (
    <LocationContext.Provider
      value={{
        city,
        setCity,
        isLocationSet,
        coordinates,
        isLoadingLocation,
        locationError,
        requestLocation,
        calculateDistance,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
