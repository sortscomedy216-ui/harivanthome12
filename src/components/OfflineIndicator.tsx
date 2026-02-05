import { useLanguage } from "@/contexts/LanguageContext";
import { usePWA } from "@/hooks/usePWA";
import { WifiOff } from "lucide-react";

const OfflineIndicator = () => {
  const { language } = useLanguage();
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      {language === "hi" ? "आप ऑफ़लाइन हैं" : "You are offline"}
    </div>
  );
};

export default OfflineIndicator;
