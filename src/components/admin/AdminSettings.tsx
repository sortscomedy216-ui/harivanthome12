import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Save, Image, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface Props {
  language: "hi" | "en";
  userId: string;
}

const AdminSettings = ({ language, userId }: Props) => {
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null);
  const [appName, setAppName] = useState("");
  const queryClient = useQueryClient();

  const { data: appAssets = [] } = useQuery({
    queryKey: ["app-assets"],
    queryFn: async () => {
      const { data } = await supabase.from("app_assets").select("*");
      const items = data || [];
      const nameAsset = items.find((a) => a.asset_key === "app_name");
      if (nameAsset?.asset_value) setAppName(nameAsset.asset_value);
      return items;
    },
  });

  const handleUpload = async (assetKey: string, file: File) => {
    setUploadingAsset(assetKey);
    try {
      const path = `settings/${assetKey}.${file.name.split(".").pop()}`;
      await supabase.storage.from("app-assets").upload(path, file, { upsert: true });
      const { data: urlData } = supabase.storage.from("app-assets").getPublicUrl(path);
      await supabase.from("app_assets").upsert({ asset_key: assetKey, asset_url: urlData.publicUrl, updated_at: new Date().toISOString(), updated_by: userId }, { onConflict: "asset_key" });
      await supabase.from("admin_logs").insert({ admin_id: userId, action: `${assetKey} Updated`, target_type: "settings", target_id: assetKey, target_name: assetKey });
      queryClient.invalidateQueries({ queryKey: ["app-assets"] });
      queryClient.invalidateQueries({ queryKey: ["app-favicon"] });
      toast.success(language === "hi" ? "अपलोड सफल!" : "Upload successful!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadingAsset(null);
    }
  };

  const saveAppName = async () => {
    await supabase.from("app_assets").upsert({ asset_key: "app_name", asset_value: appName, updated_at: new Date().toISOString(), updated_by: userId }, { onConflict: "asset_key" });
    await supabase.from("admin_logs").insert({ admin_id: userId, action: "App Name Updated", target_type: "settings", target_id: "app_name", target_name: appName });
    queryClient.invalidateQueries({ queryKey: ["app-assets"] });
    toast.success(language === "hi" ? "नाम अपडेट किया!" : "Name updated!");
  };

  const splashLogo = appAssets.find((a: any) => a.asset_key === "splash_logo");
  const appIcon = appAssets.find((a: any) => a.asset_key === "app_icon");

  return (
    <div className="space-y-4">
      {/* App Name */}
      <Card className="p-4 shadow-card">
        <Label className="text-sm font-semibold">{language === "hi" ? "ऐप का नाम" : "App Name"}</Label>
        <div className="flex gap-2 mt-2">
          <Input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="Harivant" />
          <Button size="icon" onClick={saveAppName}><Save className="w-4 h-4" /></Button>
        </div>
      </Card>

      {/* Splash Logo */}
      <Card className="p-4 shadow-card">
        <Label className="text-sm font-semibold">{language === "hi" ? "स्प्लैश लोगो" : "Splash Logo"}</Label>
        <div className="flex items-center gap-4 mt-3">
          <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center overflow-hidden">
            {splashLogo?.asset_url ? <img src={splashLogo.asset_url} alt="Logo" className="w-full h-full object-cover" /> : <Image className="w-8 h-8 text-primary-foreground" />}
          </div>
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>{uploadingAsset === "splash_logo" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}{language === "hi" ? "लोगो बदलें" : "Change Logo"}</span>
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload("splash_logo", f); }} />
          </label>
        </div>
      </Card>

      {/* App Icon */}
      <Card className="p-4 shadow-card">
        <Label className="text-sm font-semibold">{language === "hi" ? "ऐप आइकन" : "App Icon"}</Label>
        <p className="text-xs text-muted-foreground">{language === "hi" ? "ब्राउज़र टैब favicon हर 30 सेकंड auto-refresh" : "Browser tab favicon auto-refreshes every 30s"}</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
            {appIcon?.asset_url ? <img src={appIcon.asset_url} alt="Icon" className="w-full h-full object-cover" /> : <Smartphone className="w-8 h-8 text-muted-foreground" />}
          </div>
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>{uploadingAsset === "app_icon" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}{language === "hi" ? "आइकन बदलें" : "Change Icon"}</span>
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload("app_icon", f); }} />
          </label>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettings;
