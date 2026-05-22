import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, Loader2, Trash2, Image as ImageIcon, ArrowUp, ArrowDown, Link2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  language: "hi" | "en";
  userId: string;
}

interface Banner {
  id: string;
  image_url: string;
  link_url: string | null;
  title: string | null;
  sort_order: number;
  is_active: boolean;
}

const BannerManagement = ({ language, userId }: Props) => {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [editingLink, setEditingLink] = useState<Record<string, string>>({});

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_banners")
        .select("*")
        .order("sort_order", { ascending: true });
      return (data || []) as Banner[];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
    qc.invalidateQueries({ queryKey: ["app-banners-active"] });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("app-assets").upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("app-assets").getPublicUrl(path);
      const nextOrder = (banners[banners.length - 1]?.sort_order ?? -1) + 1;
      const { error: insErr } = await supabase.from("app_banners").insert({
        image_url: urlData.publicUrl,
        sort_order: nextOrder,
        is_active: true,
        created_by: userId,
      });
      if (insErr) throw insErr;
      refresh();
      toast.success(language === "hi" ? "बैनर अपलोड हुआ!" : "Banner uploaded!");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (b: Banner) => {
    await supabase.from("app_banners").update({ is_active: !b.is_active }).eq("id", b.id);
    refresh();
  };

  const remove = async (b: Banner) => {
    if (!confirm(language === "hi" ? "बैनर हटाएं?" : "Delete banner?")) return;
    await supabase.from("app_banners").delete().eq("id", b.id);
    refresh();
    toast.success(language === "hi" ? "हटा दिया" : "Deleted");
  };

  const move = async (b: Banner, dir: -1 | 1) => {
    const idx = banners.findIndex((x) => x.id === b.id);
    const swap = banners[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("app_banners").update({ sort_order: swap.sort_order }).eq("id", b.id),
      supabase.from("app_banners").update({ sort_order: b.sort_order }).eq("id", swap.id),
    ]);
    refresh();
  };

  const saveLink = async (b: Banner) => {
    const link = editingLink[b.id] ?? b.link_url ?? "";
    await supabase.from("app_banners").update({ link_url: link || null }).eq("id", b.id);
    refresh();
    toast.success(language === "hi" ? "लिंक सेव हुआ" : "Link saved");
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold">{language === "hi" ? "होम बैनर" : "Home Banners"}</h4>
            <p className="text-xs text-muted-foreground">
              {language === "hi" ? "होम स्क्रीन पर ऑटो-स्लाइडर बैनर" : "Auto-sliding banners on home screen"}
            </p>
          </div>
          <label className="cursor-pointer">
            <Button size="sm" asChild disabled={uploading}>
              <span>
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-1" />
                )}
                {language === "hi" ? "अपलोड" : "Upload"}
              </span>
            </Button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <p className="text-[10px] text-muted-foreground bg-muted p-2 rounded-md">
          {language === "hi"
            ? "टिप: 16:8 अनुपात की चौड़ी इमेज सबसे अच्छी दिखती है (जैसे 1600x800)।"
            : "Tip: 16:8 aspect images look best (e.g. 1600x800)."}
        </p>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : banners.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
          {language === "hi" ? "कोई बैनर नहीं" : "No banners yet"}
        </Card>
      ) : (
        <div className="space-y-3">
          {banners.map((b, i) => (
            <Card key={b.id} className="p-3 shadow-card">
              <div className="flex gap-3">
                <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Switch checked={b.is_active} onCheckedChange={() => toggleActive(b)} />
                    <span className="text-xs font-medium">
                      {b.is_active
                        ? language === "hi" ? "सक्रिय" : "Active"
                        : language === "hi" ? "बंद" : "Hidden"}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">#{i + 1}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-7 w-7" disabled={i === 0} onClick={() => move(b, -1)}>
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7" disabled={i === banners.length - 1} onClick={() => move(b, 1)}>
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 text-destructive ml-auto" onClick={() => remove(b)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  {language === "hi" ? "क्लिक पर खुलने वाला लिंक (वैकल्पिक)" : "Click-through URL (optional)"}
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="https://..."
                    defaultValue={b.link_url ?? ""}
                    onChange={(e) => setEditingLink({ ...editingLink, [b.id]: e.target.value })}
                    className="h-8 text-xs"
                  />
                  <Button size="sm" variant="outline" className="h-8" onClick={() => saveLink(b)}>
                    {language === "hi" ? "सेव" : "Save"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
