import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Upload, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { allCategories } from "@/config/categories";

interface Props {
  language: "hi" | "en";
  userId: string;
}

const CategoryManagement = ({ language, userId }: Props) => {
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: appAssets = [] } = useQuery({
    queryKey: ["app-assets"],
    queryFn: async () => {
      const { data } = await supabase.from("app_assets").select("*");
      return data || [];
    },
  });

  const { data: providerCounts = {} } = useQuery({
    queryKey: ["provider-category-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("service_providers").select("category").eq("status", "approved");
      const counts: Record<string, number> = {};
      (data || []).forEach((p: any) => { counts[p.category] = (counts[p.category] || 0) + 1; });
      return counts;
    },
  });

  const handleAssetUpload = async (assetKey: string, file: File) => {
    setUploadingAsset(assetKey);
    try {
      const path = `categories/${assetKey}.${file.name.split(".").pop()}`;
      await supabase.storage.from("app-assets").upload(path, file, { upsert: true });
      const { data: urlData } = supabase.storage.from("app-assets").getPublicUrl(path);
      await supabase.from("app_assets").upsert({ asset_key: assetKey, asset_url: urlData.publicUrl, updated_at: new Date().toISOString(), updated_by: userId }, { onConflict: "asset_key" });
      await supabase.from("admin_logs").insert({ admin_id: userId, action: "Category Icon Updated", target_type: "category", target_id: assetKey, target_name: assetKey });
      queryClient.invalidateQueries({ queryKey: ["app-assets"] });
      queryClient.invalidateQueries({ queryKey: ["category-assets"] });
      toast.success(language === "hi" ? "आइकन अपडेट किया!" : "Icon updated!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadingAsset(null);
    }
  };

  const toggleCategory = async (catId: string, enabled: boolean) => {
    const assetKey = `cat_disabled_${catId}`;
    if (enabled) {
      await supabase.from("app_assets").delete().eq("asset_key", assetKey);
    } else {
      await supabase.from("app_assets").upsert({ asset_key: assetKey, asset_value: "true", updated_by: userId }, { onConflict: "asset_key" });
    }
    await supabase.from("admin_logs").insert({ admin_id: userId, action: enabled ? "Category Enabled" : "Category Disabled", target_type: "category", target_id: catId, target_name: catId });
    queryClient.invalidateQueries({ queryKey: ["app-assets"] });
    toast.success(language === "hi" ? (enabled ? "श्रेणी सक्रिय" : "श्रेणी अक्षम") : (enabled ? "Category enabled" : "Category disabled"));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{language === "hi" ? "श्रेणी आइकन बदलें, सक्रिय/अक्षम करें" : "Change category icons, enable/disable"}</p>
      {allCategories.map((cat) => {
        const asset = appAssets.find((a: any) => a.asset_key === `cat_${cat.id}`);
        const isDisabled = appAssets.some((a: any) => a.asset_key === `cat_disabled_${cat.id}`);
        const count = providerCounts[cat.id] || 0;
        return (
          <Card key={cat.id} className={`p-3 shadow-card ${isDisabled ? "opacity-50" : ""}`}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {asset?.asset_url ? <img src={asset.asset_url} alt={cat.en} className="w-full h-full object-cover" /> : <span className="text-xl">{cat.icon}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{language === "hi" ? cat.hi : cat.en}</p>
                <p className="text-xs text-muted-foreground">{count} {language === "hi" ? "प्रदाता" : "providers"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={!isDisabled} onCheckedChange={(checked) => toggleCategory(cat.id, checked)} />
                <label className="cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    {uploadingAsset === `cat_${cat.id}` ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Upload className="w-4 h-4 text-primary" />}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAssetUpload(`cat_${cat.id}`, f); }} />
                </label>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryManagement;
