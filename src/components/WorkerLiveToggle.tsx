import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Radio, Loader2, MapPin } from "lucide-react";
import { useWorkerHeartbeat } from "@/hooks/useWorkerHeartbeat";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  providerId: string;
  initialOnline: boolean;
}

const WorkerLiveToggle = ({ providerId, initialOnline }: Props) => {
  const { language } = useLanguage();
  const [enabled, setEnabled] = useState(initialOnline);
  const { error, lastFix } = useWorkerHeartbeat({ providerId, enabled });

  return (
    <Card className="p-3 mt-3 border-dashed">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Radio className={`w-4 h-4 ${enabled ? "text-green-600 animate-pulse" : "text-muted-foreground"}`} />
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {language === "hi" ? "लाइव लोकेशन शेयरिंग" : "Live location sharing"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {enabled
                ? lastFix
                  ? `${language === "hi" ? "सटीकता" : "Accuracy"}: ±${Math.round(lastFix.acc)}m`
                  : language === "hi" ? "GPS की प्रतीक्षा..." : "Waiting for GPS..."
                : language === "hi" ? "ग्राहकों को आप दिखाई नहीं देंगे" : "You are not visible to customers"}
            </p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      {enabled && lastFix && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {lastFix.lat.toFixed(5)}, {lastFix.lng.toFixed(5)}
        </div>
      )}
    </Card>
  );
};

export default WorkerLiveToggle;
