import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LocationResult {
  display_name: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  lat: string;
  lon: string;
}

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string, details?: { lat?: number; lon?: number; district?: string; state?: string; pincode?: string }) => void;
  placeholder?: string;
  required?: boolean;
}

const LocationSearchInput = ({ value, onChange, placeholder, required }: LocationSearchInputProps) => {
  const { language } = useLanguage();
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchLocations = useCallback(async (searchText: string) => {
    if (searchText.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Use Nominatim to search Indian locations
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&addressdetails=1&limit=10&q=${encodeURIComponent(searchText)}`,
        { headers: { "Accept-Language": "hi,en" } }
      );
      const data = await res.json();

      const parsed: LocationResult[] = data
        .filter((item: any) => item.address)
        .map((item: any) => {
          const addr = item.address;
          const city = addr.city || addr.town || addr.village || addr.hamlet || addr.suburb || "";
          const district = addr.county || addr.state_district || "";
          const state = addr.state || "";
          const pincode = addr.postcode || "";

          return {
            display_name: [city, district, state, pincode].filter(Boolean).join(", "),
            city: city || district,
            district,
            state,
            pincode,
            lat: item.lat,
            lon: item.lon,
          };
        })
        .filter((r: LocationResult) => r.city || r.district);

      // Deduplicate by display_name
      const unique = parsed.filter(
        (v: LocationResult, i: number, a: LocationResult[]) => a.findIndex((t) => t.display_name === v.display_name) === i
      );

      setResults(unique);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (text: string) => {
    setQuery(text);
    setShowDropdown(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchLocations(text);
    }, 400);
  };

  const handleSelect = (result: LocationResult) => {
    const cityValue = result.city || result.district;
    setQuery(result.display_name);
    setShowDropdown(false);
    onChange(cityValue, {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      district: result.district,
      state: result.state,
      pincode: result.pincode,
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder || (language === "hi" ? "शहर, जिला, तालुका या पिनकोड खोजें..." : "Search city, district, taluka or pincode...")}
          className="pl-10 pr-10"
          required={required}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-elevated max-h-60 overflow-y-auto">
          {results.map((result, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full text-left px-3 py-2.5 hover:bg-accent/50 flex items-start gap-2 border-b border-border/50 last:border-0 transition-colors"
              onClick={() => handleSelect(result)}
            >
              <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{result.city || result.district}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {[result.district, result.state, result.pincode].filter(Boolean).join(" • ")}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && query.length >= 2 && !isSearching && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-elevated p-3 text-center text-sm text-muted-foreground">
          {language === "hi" ? "कोई परिणाम नहीं मिला" : "No results found"}
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;
