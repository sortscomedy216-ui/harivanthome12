import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User, Camera, MapPin, Navigation, Loader2, ChevronDown, Check,
} from "lucide-react";
import { toast } from "sonner";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
  "Chandigarh", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep"
];

interface PincodeResult {
  district: string;
  taluka: string;
  area: string;
}

const UserProfileSetup = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, setProfileComplete } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    user?.user_metadata?.avatar_url || null
  );
  const [firstName, setFirstName] = useState(
    user?.user_metadata?.full_name?.split(" ")[0] || ""
  );
  const [surname, setSurname] = useState(
    user?.user_metadata?.full_name?.split(" ").slice(1).join(" ") || ""
  );
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [village, setVillage] = useState("");
  const [pincodeResults, setPincodeResults] = useState<PincodeResult[]>([]);
  const [isPincodeLooking, setIsPincodeLooking] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsAddress, setGpsAddress] = useState("");
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const lookupPincode = useCallback(async (code: string) => {
    if (code.length !== 6) {
      setPincodeResults([]);
      return;
    }
    setIsPincodeLooking(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${code}`);
      const data = await res.json();
      if (data?.[0]?.Status === "Success" && data[0].PostOffice) {
        const offices = data[0].PostOffice;
        const results: PincodeResult[] = offices.slice(0, 8).map((po: any) => ({
          district: po.District || "",
          taluka: po.Block || po.Division || "",
          area: po.Name || "",
        }));
        const unique = results.filter(
          (v, i, a) => a.findIndex((t) => t.district === v.district && t.taluka === v.taluka && t.area === v.area) === i
        );
        setPincodeResults(unique);
        if (unique.length > 0) {
          setDistrict(unique[0].district);
          setTaluka(unique[0].taluka);
          setCity(unique[0].area);
          // Try to find state
          if (offices[0]?.State) {
            const matchedState = indianStates.find(s =>
              s.toLowerCase() === offices[0].State.toLowerCase()
            );
            if (matchedState) setSelectedState(matchedState);
          }
        }
      } else {
        setPincodeResults([]);
        toast.error(language === "hi" ? "पिनकोड नहीं मिला" : "Pincode not found");
      }
    } catch {
      setPincodeResults([]);
    } finally {
      setIsPincodeLooking(false);
    }
  }, [language]);

  const handlePincodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setPincode(cleaned);
    if (cleaned.length === 6) {
      lookupPincode(cleaned);
    } else {
      setPincodeResults([]);
      setCity("");
      setDistrict("");
      setTaluka("");
    }
  };

  const selectPincodeResult = (result: PincodeResult) => {
    setCity(result.area);
    setDistrict(result.district);
    setTaluka(result.taluka);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const detectGPS = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error(language === "hi" ? "GPS सपोर्ट नहीं है" : "GPS not supported");
      return;
    }
    setIsDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setGpsCoords({ lat, lon });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`,
            { headers: { "Accept-Language": "hi,en" } }
          );
          const data = await res.json();
          if (data.address) {
            const addr = data.address;
            const v = addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || "";
            const town = addr.town || addr.city || "";
            const road = addr.road || "";
            setGpsAddress([road, v, town].filter(Boolean).join(", ") || data.display_name?.split(",").slice(0, 3).join(", ") || "");
            if (v) setVillage(v);
          }
        } catch {}
        setIsDetectingGPS(false);
        toast.success(language === "hi" ? "लोकेशन प्राप्त!" : "Location captured!");
      },
      () => {
        setIsDetectingGPS(false);
        toast.error(language === "hi" ? "लोकेशन प्राप्त नहीं हुई" : "Could not get location");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [language]);

  const handleSave = async () => {
    if (!firstName.trim()) {
      toast.error(language === "hi" ? "नाम भरें" : "Enter name");
      return;
    }
    if (pincode.length !== 6) {
      toast.error(language === "hi" ? "6 अंक का पिनकोड भरें" : "Enter 6-digit pincode");
      return;
    }
    if (!user) return;

    setIsSaving(true);
    try {
      let photoUrl = photoPreview;

      // Upload photo if new file selected
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${user.id}/profile.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(path, photoFile, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("profile-photos")
            .getPublicUrl(path);
          photoUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name: `${firstName.trim()} ${surname.trim()}`.trim(),
          surname: surname.trim() || null,
          photo_url: photoUrl,
          pincode,
          city: city || null,
          district: district || null,
          taluka: taluka || null,
          state: selectedState || null,
          village: village || null,
          latitude: gpsCoords?.lat || null,
          longitude: gpsCoords?.lon || null,
          profile_complete: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Save to localStorage for quick access
      localStorage.setItem("harivant-username", `${firstName.trim()} ${surname.trim()}`.trim());
      localStorage.setItem("harivant-pincode", pincode);
      localStorage.setItem("harivant-state", selectedState);
      localStorage.setItem("harivant-district", district);
      localStorage.setItem("harivant-area", city);
      localStorage.setItem("harivant-gps-village", village);
      if (gpsCoords) {
        localStorage.setItem("harivant-coordinates", JSON.stringify({
          latitude: gpsCoords.lat,
          longitude: gpsCoords.lon,
        }));
      }

      setProfileComplete(true);
      toast.success(language === "hi" ? "प्रोफ़ाइल सेव हो गई!" : "Profile saved!");
      navigate("/home", { replace: true });
    } catch (error: any) {
      toast.error(error.message || (language === "hi" ? "त्रुटि हुई" : "Error occurred"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background select-none">
      <div className="gradient-primary px-4 pt-4 pb-6 safe-top">
        <h1 className="text-xl font-bold text-primary-foreground">
          {language === "hi" ? "अपनी प्रोफ़ाइल बनाएं" : "Create Your Profile"}
        </h1>
        <p className="text-sm text-primary-foreground/80">
          {language === "hi" ? "अपनी जानकारी भरें" : "Fill in your details"}
        </p>
      </div>

      <div className="px-4 pt-4 pb-8 space-y-4 -mt-2">
        {/* Photo */}
        <Card className="p-4 shadow-card">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-primary/20">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-elevated"
              >
                <Camera className="w-5 h-5 text-primary-foreground" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <p className="text-sm text-primary mt-2">
              {language === "hi" ? "फ़ोटो अपलोड करें" : "Upload Photo"}
            </p>
          </div>
        </Card>

        {/* Name */}
        <Card className="p-4 shadow-card space-y-3">
          <div>
            <Label>{language === "hi" ? "पहला नाम" : "First Name"} *</Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={language === "hi" ? "अपना नाम" : "Your first name"}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label>{language === "hi" ? "उपनाम (सरनेम)" : "Surname"}</Label>
            <Input
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder={language === "hi" ? "सरनेम" : "Surname"}
              className="mt-1.5"
            />
          </div>
        </Card>

        {/* Location */}
        <Card className="p-4 shadow-card space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {language === "hi" ? "लोकेशन" : "Location"}
          </h3>

          {/* Pincode */}
          <div>
            <Label>{language === "hi" ? "पिनकोड" : "Pincode"} *</Label>
            <Input
              value={pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              placeholder={language === "hi" ? "6 अंक का पिनकोड" : "6-digit pincode"}
              type="tel"
              inputMode="numeric"
              maxLength={6}
              className="mt-1.5"
            />
            {isPincodeLooking && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                {language === "hi" ? "खोज रहे हैं..." : "Looking up..."}
              </div>
            )}
            {pincodeResults.length > 1 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">{language === "hi" ? "अपना एरिया चुनें:" : "Select your area:"}</p>
                {pincodeResults.map((result, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectPincodeResult(result)}
                    className={`w-full text-left p-2 rounded-lg border text-sm transition-all ${
                      city === result.area && district === result.district
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {result.area} • {result.taluka} • {result.district}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* City */}
          <div>
            <Label>{language === "hi" ? "शहर / इलाका" : "City / Area"}</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)}
              placeholder={language === "hi" ? "पिनकोड से भरेगा" : "Auto-fills"} className="mt-1.5" />
          </div>

          {/* District & Taluka */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{language === "hi" ? "जिला" : "District"}</Label>
              <Input value={district} onChange={(e) => setDistrict(e.target.value)}
                placeholder={language === "hi" ? "जिला" : "District"} className="mt-1.5" />
            </div>
            <div>
              <Label>{language === "hi" ? "तालुका" : "Taluka"}</Label>
              <Input value={taluka} onChange={(e) => setTaluka(e.target.value)}
                placeholder={language === "hi" ? "तालुका" : "Taluka"} className="mt-1.5" />
            </div>
          </div>

          {/* State */}
          <div>
            <Label>{language === "hi" ? "राज्य" : "State"}</Label>
            <div className="relative mt-1.5">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none pr-10"
              >
                <option value="">{language === "hi" ? "-- राज्य --" : "-- State --"}</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Village */}
          <div>
            <Label>{language === "hi" ? "गांव / मोहल्ला" : "Village / Area"}</Label>
            <Input value={village} onChange={(e) => setVillage(e.target.value)}
              placeholder={language === "hi" ? "गांव या मोहल्ला" : "Village or area"} className="mt-1.5" />
          </div>

          {/* GPS */}
          <div>
            <Label>{language === "hi" ? "GPS लोकेशन" : "GPS Location"}</Label>
            <Button
              type="button"
              variant={gpsCoords ? "outline" : "default"}
              className="w-full mt-1.5"
              onClick={detectGPS}
              disabled={isDetectingGPS}
            >
              {isDetectingGPS ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : gpsCoords ? (
                <Check className="w-4 h-4 mr-2 text-secondary" />
              ) : (
                <Navigation className="w-4 h-4 mr-2" />
              )}
              {gpsCoords
                ? (language === "hi" ? "📍 लोकेशन प्राप्त ✓" : "📍 Location Captured ✓")
                : (language === "hi" ? "📍 अपनी लोकेशन पाएं" : "📍 Get My Location")}
            </Button>
            {gpsAddress && (
              <p className="text-xs text-primary mt-2 font-medium">{gpsAddress}</p>
            )}
          </div>
        </Card>

        {/* Save */}
        <Button
          onClick={handleSave}
          className="w-full h-12 text-lg gradient-primary"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            language === "hi" ? "प्रोफ़ाइल सेव करें ✓" : "Save Profile ✓"
          )}
        </Button>
      </div>
    </div>
  );
};

export default UserProfileSetup;
