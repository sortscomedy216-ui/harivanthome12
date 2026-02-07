import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation as useAppLocation } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LocationSearchInput from "@/components/LocationSearchInput";
import { Home, Wrench, Zap, MapPin, Navigation, Loader2, User } from "lucide-react";

type OnboardingStep = "splash" | "language" | "userinfo";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { setCity, isLocationSet, coordinates, requestLocation, isLoadingLocation } = useAppLocation();
  const [step, setStep] = useState<OnboardingStep>("splash");

  const [userName, setUserName] = useState(() => localStorage.getItem("harivant-username") || "");
  const [locationText, setLocationText] = useState(() => localStorage.getItem("harivant-location-text") || "");
  const [locationDetails, setLocationDetails] = useState<{ lat?: number; lon?: number; district?: string; state?: string; pincode?: string } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState("");

  useEffect(() => {
    const onboardingDone = localStorage.getItem("harivant-onboarding");
    if (onboardingDone && isLocationSet) {
      navigate("/home");
      return;
    }
    const timer = setTimeout(() => setStep("language"), 2500);
    return () => clearTimeout(timer);
  }, [isLocationSet, navigate]);

  // Auto-detect location via GPS reverse geocoding
  const detectFromGPS = async () => {
    if (!coordinates) {
      requestLocation();
      return;
    }
    setIsDetecting(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&addressdetails=1`,
        { headers: { "Accept-Language": "hi,en" } }
      );
      const data = await res.json();
      if (data.address) {
        const addr = data.address;
        const city = addr.city || addr.town || addr.village || addr.hamlet || addr.suburb || "";
        const district = addr.county || addr.state_district || "";
        const state = addr.state || "";
        const pincode = addr.postcode || "";
        const fullAddress = [city, district, state, pincode].filter(Boolean).join(", ");
        
        setDetectedAddress(fullAddress);
        setLocationText(city || district);
        setLocationDetails({
          lat: coordinates.latitude,
          lon: coordinates.longitude,
          district,
          state,
          pincode,
        });
      }
    } catch (error) {
      console.error("GPS detection error:", error);
    } finally {
      setIsDetecting(false);
    }
  };

  useEffect(() => {
    if (coordinates && step === "userinfo" && !detectedAddress) {
      detectFromGPS();
    }
  }, [coordinates, step]);

  const handleLanguageSelect = (lang: "hi" | "en") => {
    setLanguage(lang);
    setStep("userinfo");
    if (!coordinates) requestLocation();
  };

  const handleContinue = () => {
    if (!userName.trim() || !locationText.trim()) return;
    
    localStorage.setItem("harivant-username", userName.trim());
    localStorage.setItem("harivant-location-text", locationText.trim());
    localStorage.setItem("harivant-onboarding", "true");
    
    // Store city in location context
    setCity(locationText.trim());
    
    if (locationDetails) {
      localStorage.setItem("harivant-coordinates", JSON.stringify({
        latitude: locationDetails.lat,
        longitude: locationDetails.lon,
      }));
      if (locationDetails.district) localStorage.setItem("harivant-district", locationDetails.district);
      if (locationDetails.state) localStorage.setItem("harivant-state", locationDetails.state);
      if (locationDetails.pincode) localStorage.setItem("harivant-pincode", locationDetails.pincode);
    }
    
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

            {/* Name Input */}
            <Card className="p-4 shadow-card mb-4">
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

            {/* GPS Auto-Detect */}
            <Card
              className={`p-4 mb-4 cursor-pointer transition-all border-2 ${
                detectedAddress ? "border-primary bg-primary/5" : "border-dashed border-muted-foreground/30"
              }`}
              onClick={detectFromGPS}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  detectedAddress ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  {isDetecting || isLoadingLocation ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Navigation className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {language === "hi" ? "📍 GPS से लोकेशन पाएं" : "📍 Detect via GPS"}
                  </p>
                  {detectedAddress ? (
                    <p className="text-xs text-primary font-medium">{detectedAddress}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {isDetecting || isLoadingLocation
                        ? (language === "hi" ? "लोकेशन खोज रहे हैं..." : "Detecting location...")
                        : (language === "hi" ? "अपना गांव/शहर/जिला ऑटो पाएं" : "Auto-detect your village/city/district")}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <p className="text-xs text-muted-foreground mb-3 text-center">
              {language === "hi" ? "या नीचे मैन्युअल खोजें" : "Or search manually below"}
            </p>

            {/* Location Search */}
            <Card className="p-4 shadow-card mb-4">
              <Label className="mb-2 block font-medium">
                <MapPin className="w-4 h-4 inline mr-1" />
                {language === "hi" ? "शहर / जिला / तालुका / पिनकोड" : "City / District / Taluka / Pincode"} *
              </Label>
              <LocationSearchInput
                value={locationText}
                onChange={(cityValue, details) => {
                  setLocationText(cityValue);
                  if (details) setLocationDetails(details);
                }}
                required
              />
            </Card>

            <div className="flex-1" />

            <div className="pt-4 safe-bottom">
              <Button
                className="w-full h-12 text-lg gradient-primary"
                disabled={!userName.trim() || !locationText.trim()}
                onClick={handleContinue}
              >
                {t("onboarding.continue")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SplashScreen;
