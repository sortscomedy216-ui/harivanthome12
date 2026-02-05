import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Download,
  CheckCircle2,
  Smartphone,
  Wifi,
  Zap,
  Bell,
  Share,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

const InstallPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { canInstall, isInstalled, install } = usePWA();

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const features = [
    {
      icon: Zap,
      titleHi: "तेज़ लोडिंग",
      titleEn: "Fast Loading",
      descHi: "App instantly open होगी",
      descEn: "App opens instantly",
    },
    {
      icon: Wifi,
      titleHi: "ऑफ़लाइन सपोर्ट",
      titleEn: "Offline Support",
      descHi: "बिना internet भी use करें",
      descEn: "Use without internet",
    },
    {
      icon: Bell,
      titleHi: "नोटिफिकेशन",
      titleEn: "Notifications",
      descHi: "नई सेवाओं की जानकारी पाएं",
      descEn: "Get updates on new services",
    },
    {
      icon: Smartphone,
      titleHi: "Native Feel",
      titleEn: "Native Feel",
      descHi: "App जैसा अनुभव",
      descEn: "Experience like a native app",
    },
  ];

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary px-4 pt-4 pb-8 safe-top">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-primary-foreground">
            {language === "hi" ? "App Install करें" : "Install App"}
          </h1>
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-primary-foreground/20 flex items-center justify-center mb-4">
            <span className="text-5xl">🏠</span>
          </div>
          <h2 className="text-2xl font-bold text-primary-foreground">Harivant</h2>
          <p className="text-primary-foreground/80 text-center mt-1">
            {language === "hi" ? "घर की सेवाएं एक क्लिक पर" : "Home Services at a Click"}
          </p>
        </motion.div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Status Card */}
        {isInstalled ? (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">
                  {language === "hi" ? "App Installed है!" : "App is Installed!"}
                </p>
                <p className="text-sm text-green-600">
                  {language === "hi"
                    ? "Home screen से open करें"
                    : "Open from home screen"}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-4 shadow-card">
            {isIOS ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  {language === "hi" ? "iOS पर Install करें" : "Install on iOS"}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">
                        {language === "hi" ? "Share बटन दबाएं" : "Tap Share button"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <Share className="w-4 h-4 inline mr-1" />
                        Safari के bottom में
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">
                        {language === "hi"
                          ? "'Add to Home Screen' चुनें"
                          : "Select 'Add to Home Screen'"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Scroll down करके find करें
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">
                        {language === "hi" ? "'Add' दबाएं" : "Tap 'Add'"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {language === "hi" ? "App install हो जाएगी" : "App will be installed"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : canInstall ? (
              <div className="text-center space-y-4">
                <Download className="w-12 h-12 mx-auto text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">
                    {language === "hi" ? "App Install के लिए तैयार!" : "Ready to Install!"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "hi"
                      ? "एक क्लिक में home screen पर add करें"
                      : "Add to home screen with one click"}
                  </p>
                </div>
                <Button onClick={handleInstall} className="w-full gradient-primary" size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  {language === "hi" ? "Install करें" : "Install Now"}
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <ExternalLink className="w-10 h-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  {language === "hi"
                    ? "Chrome browser में open करें install के लिए"
                    : "Open in Chrome browser to install"}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Features */}
        <Card className="p-4 shadow-card">
          <h3 className="font-semibold text-lg mb-4">
            {language === "hi" ? "App के फायदे" : "App Benefits"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/50"
              >
                <feature.icon className="w-8 h-8 text-primary mb-2" />
                <p className="font-medium text-sm">
                  {language === "hi" ? feature.titleHi : feature.titleEn}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === "hi" ? feature.descHi : feature.descEn}
                </p>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* TWA Info */}
        <Card className="p-4 shadow-card bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2">
            {language === "hi" ? "Play Store पर भी उपलब्ध होगा" : "Coming to Play Store"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === "hi"
              ? "जल्द ही Google Play Store से download कर सकेंगे!"
              : "Download from Google Play Store soon!"}
          </p>
        </Card>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/home")}
        >
          {language === "hi" ? "बाद में करूंगा" : "Maybe Later"}
        </Button>
      </div>
    </div>
  );
};

export default InstallPage;
