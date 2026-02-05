import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Download, X, Share, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if dismissed recently
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return; // Don't show for 7 days after dismiss
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 30 seconds of usage
      setTimeout(() => setShowPrompt(true), 30000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS, show after some interaction
    if (ios && !standalone) {
      setTimeout(() => setShowPrompt(true), 60000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 left-4 right-4 z-50"
      >
        <Card className="p-4 shadow-elevated bg-card border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                {language === "hi" ? "App Install करें" : "Install App"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isIOS
                  ? language === "hi"
                    ? "Safari में Share बटन दबाएं → 'Add to Home Screen' चुनें"
                    : "Tap Share in Safari → Select 'Add to Home Screen'"
                  : language === "hi"
                  ? "Harivant को home screen पर add करें - faster access, offline support!"
                  : "Add Harivant to home screen - faster access, offline support!"}
              </p>
              
              <div className="flex gap-2 mt-3">
                {isIOS ? (
                  <Button size="sm" className="gap-2">
                    <Share className="w-4 h-4" />
                    {language === "hi" ? "Share बटन दबाएं" : "Tap Share"}
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleInstall} className="gap-2 gradient-primary">
                    <Download className="w-4 h-4" />
                    {language === "hi" ? "Install करें" : "Install"}
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  {language === "hi" ? "बाद में" : "Later"}
                </Button>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
