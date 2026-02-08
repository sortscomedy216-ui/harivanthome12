import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation as useAppLocation } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Wrench, Zap, MapPin, Navigation, Loader2, User, ChevronDown } from "lucide-react";

type OnboardingStep = "splash" | "language" | "userinfo";

// Indian states list
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

const SplashScreen = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { setCity, isLocationSet, coordinates, requestLocation, isLoadingLocation } = useAppLocation();
  const [step, setStep] = useState<OnboardingStep>("splash");

  const [userName, setUserName] = useState(() => localStorage.getItem("harivant-username") || "");
  
  // Location fields
  const [selectedState, setSelectedState] = useState(() => localStorage.getItem("harivant-state") || "");
  const [pincode, setPincode] = useState(() => localStorage.getItem("harivant-pincode") || "");
  const [pincodeResults, setPincodeResults] = useState<PincodeResult[]>([]);
  const [selectedPincodeResult, setSelectedPincodeResult] = useState<PincodeResult | null>(null);
  const [isPincodeLooking, setIsPincodeLooking] = useState(false);
  
  // GPS
  const [gpsAddress, setGpsAddress] = useState("");
  const [gpsVillage, setGpsVillage] = useState("");
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(() => {
    const stored = localStorage.getItem("harivant-coordinates");
    if (stored) {
      const parsed = JSON.parse(stored);
      return { lat: parsed.latitude, lon: parsed.longitude };
    }
    return null;
  });

  useEffect(() => {
    const onboardingDone = localStorage.getItem("harivant-onboarding");
    if (onboardingDone && isLocationSet) {
      navigate("/home");
      return;
    }
    const timer = setTimeout(() => setStep("language"), 2500);
    return () => clearTimeout(timer);
  }, [isLocationSet, navigate]);

  // Lookup pincode via India Post API / Nominatim
  const lookupPincode = useCallback(async (code: string) => {
    if (code.length !== 6) {
      setPincodeResults([]);
      return;
    }
    setIsPincodeLooking(true);
    try {
      // Use India Post API
      const res = await fetch(`https://api.postalpincode.in/pincode/${code}`);
      const data = await res.json();
      
      if (data?.[0]?.Status === "Success" && data[0].PostOffice) {
        const offices = data[0].PostOffice;
        const results: PincodeResult[] = offices.slice(0, 3).map((po: any) => ({
          district: po.District || "",
          taluka: po.Block || po.Division || "",
          area: po.Name || "",
        }));
        
        // Deduplicate
        const unique = results.filter(
          (v, i, a) => a.findIndex((t) => t.district === v.district && t.taluka === v.taluka && t.area === v.area) === i
        );
        setPincodeResults(unique);
      } else {
        // Fallback to Nominatim
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&addressdetails=1&limit=3&postalcode=${code}`,
          { headers: { "Accept-Language": "hi,en" } }
        );
        const nomData = await nomRes.json();
        if (nomData.length > 0) {
          const results: PincodeResult[] = nomData.map((item: any) => {
            const addr = item.address || {};
            return {
              district: addr.county || addr.state_district || "",
              taluka: addr.suburb || addr.town || addr.village || "",
              area: addr.city || addr.town || addr.village || addr.hamlet || "",
            };
          }).filter((r: PincodeResult) => r.district || r.area);
          setPincodeResults(results);
        } else {
          setPincodeResults([]);
        }
      }
    } catch {
      setPincodeResults([]);
    } finally {
      setIsPincodeLooking(false);
    }
  }, []);

  // Auto-detect GPS location
  const detectGPS = useCallback(async () => {
    setIsDetectingGPS(true);
    
    // Request permission and get position
    if (!navigator.geolocation) {
      setIsDetectingGPS(false);
      return;
    }

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
            const village = addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || "";
            const town = addr.town || addr.city || "";
            const road = addr.road || "";
            
            setGpsVillage(village || town);
            
            const parts = [road, village, town].filter(Boolean);
            setGpsAddress(parts.join(", ") || data.display_name?.split(",").slice(0, 3).join(", ") || "");
            
            // Auto-fill state and pincode if not set
            if (!selectedState && addr.state) {
              const matchedState = indianStates.find(s => 
                s.toLowerCase() === addr.state.toLowerCase() || 
                addr.state.toLowerCase().includes(s.toLowerCase())
              );
              if (matchedState) setSelectedState(matchedState);
            }
            if (!pincode && addr.postcode) {
              setPincode(addr.postcode);
              lookupPincode(addr.postcode);
            }
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
        } finally {
          setIsDetectingGPS(false);
        }
      },
      (error) => {
        console.error("GPS error:", error);
        setIsDetectingGPS(false);
        // Request location through context as fallback
        requestLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [selectedState, pincode, requestLocation, lookupPincode]);

  // When coordinates come from context (fallback)
  useEffect(() => {
    if (coordinates && step === "userinfo" && !gpsCoords) {
      setGpsCoords({ lat: coordinates.latitude, lon: coordinates.longitude });
      // Reverse geocode
      (async () => {
        setIsDetectingGPS(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&addressdetails=1&zoom=18`,
            { headers: { "Accept-Language": "hi,en" } }
          );
          const data = await res.json();
          if (data.address) {
            const addr = data.address;
            const village = addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || "";
            const town = addr.town || addr.city || "";
            const road = addr.road || "";
            setGpsVillage(village || town);
            setGpsAddress([road, village, town].filter(Boolean).join(", ") || "");
          }
        } catch {} finally {
          setIsDetectingGPS(false);
        }
      })();
    }
  }, [coordinates, step, gpsCoords]);

  const handleLanguageSelect = (lang: "hi" | "en") => {
    setLanguage(lang);
    setStep("userinfo");
  };

  const handlePincodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setPincode(cleaned);
    setSelectedPincodeResult(null);
    if (cleaned.length === 6) {
      lookupPincode(cleaned);
    } else {
      setPincodeResults([]);
    }
  };

  const handleSelectPincodeResult = (result: PincodeResult) => {
    setSelectedPincodeResult(result);
  };

  const canContinue = userName.trim() && selectedState && pincode.length === 6 && selectedPincodeResult && gpsCoords;

  const handleContinue = () => {
    if (!canContinue) return;
    
    const cityValue = selectedPincodeResult.area || selectedPincodeResult.district;
    
    localStorage.setItem("harivant-username", userName.trim());
    localStorage.setItem("harivant-state", selectedState);
    localStorage.setItem("harivant-pincode", pincode);
    localStorage.setItem("harivant-district", selectedPincodeResult.district);
    localStorage.setItem("harivant-taluka", selectedPincodeResult.taluka);
    localStorage.setItem("harivant-area", selectedPincodeResult.area);
    localStorage.setItem("harivant-location-text", cityValue);
    localStorage.setItem("harivant-onboarding", "true");
    localStorage.setItem("harivant-gps-village", gpsVillage);
    localStorage.setItem("harivant-gps-address", gpsAddress);
    
    if (gpsCoords) {
      localStorage.setItem("harivant-coordinates", JSON.stringify({
        latitude: gpsCoords.lat,
        longitude: gpsCoords.lon,
      }));
    }
    
    setCity(cityValue);
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <AnimatePresence mode="wait">
        {step === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative"
            >
              <div className="w-32 h-32 rounded-3xl gradient-primary flex items-center justify-center shadow-elevated">
                <Home className="w-16 h-16 text-primary-foreground" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="absolute -right-2 -top-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center"
              >
                <Wrench className="w-5 h-5 text-accent-foreground" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="absolute -left-2 -bottom-2 w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                <Zap className="w-5 h-5 text-secondary-foreground" />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-4xl font-bold text-gradient"
            >
              हरिवंत
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-2 text-lg text-muted-foreground text-center"
            >
              घर की सेवाएं एक क्लिक पर
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8 flex gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {step === "language" && (
          <motion.div
            key="language"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="min-h-screen flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6"
            >
              <Home className="w-10 h-10 text-primary-foreground" />
            </motion.div>

            <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.welcome")}</h2>
            <p className="text-muted-foreground mb-8">{t("onboarding.selectLanguage")}</p>

            <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
              <Card
                className={`p-6 cursor-pointer transition-all hover:shadow-elevated ${language === "hi" ? "ring-2 ring-primary shadow-card" : ""}`}
                onClick={() => handleLanguageSelect("hi")}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-2xl">🇮🇳</div>
                  <div>
                    <p className="font-semibold text-lg">हिंदी</p>
                    <p className="text-sm text-muted-foreground">Hindi</p>
                  </div>
                </div>
              </Card>
              <Card
                className={`p-6 cursor-pointer transition-all hover:shadow-elevated ${language === "en" ? "ring-2 ring-primary shadow-card" : ""}`}
                onClick={() => handleLanguageSelect("en")}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">🌐</div>
                  <div>
                    <p className="font-semibold text-lg">English</p>
                    <p className="text-sm text-muted-foreground">अंग्रेज़ी</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {step === "userinfo" && (
          <motion.div
            key="userinfo"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="min-h-screen flex flex-col p-6 safe-top"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {language === "hi" ? "अपनी जानकारी भरें" : "Enter Your Details"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {language === "hi" ? "ताकि हम आपके पास सेवाएं दिखा सकें" : "So we can show services near you"}
                </p>
              </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pb-24">
              {/* Name Input */}
              <Card className="p-4 shadow-card">
                <Label className="mb-2 block font-medium">
                  {language === "hi" ? "आपका नाम" : "Your Name"} *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder={language === "hi" ? "अपना नाम लिखें" : "Enter your name"}
                    className="pl-10"
                    required
                  />
                </div>
              </Card>

              {/* State Selection */}
              <Card className="p-4 shadow-card">
                <Label className="mb-2 block font-medium">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {language === "hi" ? "राज्य चुनें" : "Select State"} *
                </Label>
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none pr-10"
                  >
                    <option value="">{language === "hi" ? "-- राज्य चुनें --" : "-- Select State --"}</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </Card>

              {/* Pincode */}
              <Card className="p-4 shadow-card">
                <Label className="mb-2 block font-medium">
                  {language === "hi" ? "पिनकोड" : "Pincode"} *
                </Label>
                <Input
                  value={pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder={language === "hi" ? "6 अंक का पिनकोड डालें" : "Enter 6-digit pincode"}
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                />
                
                {isPincodeLooking && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {language === "hi" ? "जानकारी खोज रहे हैं..." : "Looking up..."}
                  </div>
                )}

                {/* Pincode results - auto fill options */}
                {pincodeResults.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {language === "hi" ? "नीचे से चुनें:" : "Select below:"}
                    </p>
                    {pincodeResults.map((result, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPincodeResult(result)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedPincodeResult === result
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50 hover:bg-accent/30"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{result.area}</p>
                            <p className="text-xs text-muted-foreground">
                              {[result.taluka, result.district].filter(Boolean).join(" • ")}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Show selected info */}
                {selectedPincodeResult && (
                  <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">{language === "hi" ? "जिला:" : "District:"}</span>
                        <p className="font-medium">{selectedPincodeResult.district}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{language === "hi" ? "तालुका:" : "Taluka:"}</span>
                        <p className="font-medium">{selectedPincodeResult.taluka || "-"}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">{language === "hi" ? "क्षेत्र:" : "Area:"}</span>
                        <p className="font-medium">{selectedPincodeResult.area}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* GPS Location - Phone ki location */}
              <Card className={`p-4 shadow-card border-2 ${
                gpsAddress ? "border-primary bg-primary/5" : "border-dashed border-muted-foreground/30"
              }`}>
                <Label className="mb-3 block font-medium">
                  <Navigation className="w-4 h-4 inline mr-1" />
                  {language === "hi" ? "आपकी GPS लोकेशन" : "Your GPS Location"} *
                </Label>
                
                <Button
                  type="button"
                  variant={gpsAddress ? "outline" : "default"}
                  className="w-full"
                  onClick={detectGPS}
                  disabled={isDetectingGPS || isLoadingLocation}
                >
                  {isDetectingGPS || isLoadingLocation ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4 mr-2" />
                  )}
                  {gpsAddress
                    ? (language === "hi" ? "फिर से लोकेशन लें" : "Re-detect Location")
                    : isDetectingGPS || isLoadingLocation
                      ? (language === "hi" ? "लोकेशन खोज रहे हैं..." : "Detecting...")
                      : (language === "hi" ? "📍 अपनी लोकेशन दें" : "📍 Share Your Location")}
                </Button>

                {gpsAddress && (
                  <div className="mt-3 p-3 rounded-lg bg-background border border-border">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <div>
                        {gpsVillage && (
                          <p className="text-sm font-semibold text-primary">{gpsVillage}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{gpsAddress}</p>
                        {gpsCoords && (
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {gpsCoords.lat.toFixed(6)}, {gpsCoords.lon.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!gpsAddress && !isDetectingGPS && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {language === "hi" 
                      ? "लोकेशन परमिशन देने पर आपका गांव/मोहल्ला दिखेगा" 
                      : "Grant location permission to detect your village/area"}
                  </p>
                )}
              </Card>
            </div>

            {/* Continue Button - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border safe-bottom">
              <Button
                className="w-full h-12 text-lg gradient-primary"
                disabled={!canContinue}
                onClick={handleContinue}
              >
                {t("onboarding.continue")}
              </Button>
              {!canContinue && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {language === "hi" ? "सभी जानकारी भरें और GPS लोकेशन दें" : "Fill all fields and share GPS location"}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SplashScreen;
