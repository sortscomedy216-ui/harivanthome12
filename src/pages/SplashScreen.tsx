import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation as useAppLocation, cities } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Wrench, Zap, MapPin } from "lucide-react";

type OnboardingStep = "splash" | "language" | "location";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { city, setCity, isLocationSet } = useAppLocation();
  const [step, setStep] = useState<OnboardingStep>("splash");

  useEffect(() => {
    // Check if onboarding is completed
    const onboardingDone = localStorage.getItem("harivant-onboarding");
    if (onboardingDone && isLocationSet) {
      navigate("/home");
      return;
    }

    // Auto-advance from splash after 2 seconds
    const timer = setTimeout(() => {
      setStep("language");
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLocationSet, navigate]);

  const handleLanguageSelect = (lang: "hi" | "en") => {
    setLanguage(lang);
    setStep("location");
  };

  const handleLocationSelect = (selectedCity: string) => {
    setCity(selectedCity);
  };

  const handleContinue = () => {
    if (city) {
      localStorage.setItem("harivant-onboarding", "true");
      navigate("/home");
    }
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
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8 text-4xl font-bold text-gradient"
            >
              हरिवंत
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
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
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
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

            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t("onboarding.welcome")}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t("onboarding.selectLanguage")}
            </p>

            <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
              <Card
                className={`p-6 cursor-pointer transition-all hover:shadow-elevated ${
                  language === "hi" ? "ring-2 ring-primary shadow-card" : ""
                }`}
                onClick={() => handleLanguageSelect("hi")}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-2xl">
                    🇮🇳
                  </div>
                  <div>
                    <p className="font-semibold text-lg">हिंदी</p>
                    <p className="text-sm text-muted-foreground">Hindi</p>
                  </div>
                </div>
              </Card>

              <Card
                className={`p-6 cursor-pointer transition-all hover:shadow-elevated ${
                  language === "en" ? "ring-2 ring-primary shadow-card" : ""
                }`}
                onClick={() => handleLanguageSelect("en")}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                    🌐
                  </div>
                  <div>
                    <p className="font-semibold text-lg">English</p>
                    <p className="text-sm text-muted-foreground">अंग्रेज़ी</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {step === "location" && (
          <motion.div
            key="location"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="min-h-screen flex flex-col p-6 safe-top"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {t("onboarding.selectLocation")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {language === "hi" ? "सेवाएं आपके शहर में" : "Services in your city"}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-2 gap-3">
                {cities.map((c) => (
                  <Card
                    key={c.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-card ${
                      city === c.id ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    onClick={() => handleLocationSelect(c.id)}
                  >
                    <p className="font-medium">
                      {language === "hi" ? c.name : c.nameEn}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === "hi" ? c.nameEn : c.name}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="pt-4 safe-bottom">
              <Button
                className="w-full h-12 text-lg gradient-primary"
                disabled={!city}
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
