import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  language: "hi" | "en";
  userId: string;
}

const AreaManagement = ({ language, userId }: Props) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editArea, setEditArea] = useState<any>(null);
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const queryClient = useQueryClient();

  const { data: areas = [], isLoading } = useQuery({
    queryKey: ["admin-areas"],
    queryFn: async () => {
      const { data } = await supabase.from("areas").select("*").order("name");
      return data || [];
    },
  });

  const handleSave = async () => {
    if (!name.trim()) { toast.error(language === "hi" ? "नाम आवश्यक है" : "Name required"); return; }
    if (editArea) {
      await supabase.from("areas").update({ name: name.trim(), state, district }).eq("id", editArea.id);
      await supabase.from("admin_logs").insert({ admin_id: userId, action: "Area Updated", target_type: "area", target_id: editArea.id, target_name: name.trim() });
      toast.success(language === "hi" ? "क्षेत्र अपडेट किया" : "Area updated");
    } else {
      await supabase.from("areas").insert({ name: name.trim(), state, district, created_by: userId });
      await supabase.from("admin_logs").insert({ admin_id: userId, action: "Area Added", target_type: "area", target_id: name.trim(), target_name: name.trim() });
      await supabase.from("admin_notifications").insert({ title: "New Area Added", message: `Area "${name.trim()}" was added`, type: "info" });
      toast.success(language === "hi" ? "क्षेत्र जोड़ा गया" : "Area added");
    }
    setName(""); setState(""); setDistrict("");
    setShowAdd(false); setEditArea(null);
    queryClient.invalidateQueries({ queryKey: ["admin-areas"] });
  };

  const handleDelete = async (area: any) => {
    if (!window.confirm(language === "hi" ? `"${area.name}" हटाएं?` : `Delete "${area.name}"?`)) return;
    await supabase.from("areas").delete().eq("id", area.id);
    await supabase.from("admin_logs").insert({ admin_id: userId, action: "Area Deleted", target_type: "area", target_id: area.id, target_name: area.name });
    toast.success(language === "hi" ? "हटा दिया" : "Deleted");
    queryClient.invalidateQueries({ queryKey: ["admin-areas"] });
  };

  const handleToggle = async (area: any, enabled: boolean) => {
    await supabase.from("areas").update({ enabled }).eq("id", area.id);
    await supabase.from("admin_logs").insert({ admin_id: userId, action: enabled ? "Area Enabled" : "Area Disabled", target_type: "area", target_id: area.id, target_name: area.name });
    queryClient.invalidateQueries({ queryKey: ["admin-areas"] });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{language === "hi" ? "क्षेत्र प्रबंधित करें" : "Manage areas"}</p>
        <Button size="sm" className="h-8" onClick={() => { setShowAdd(true); setEditArea(null); setName(""); setState(""); setDistrict(""); }}>
          <Plus className="w-4 h-4 mr-1" /> {language === "hi" ? "जोड़ें" : "Add"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : areas.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground"><MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>{language === "hi" ? "कोई क्षेत्र नहीं" : "No areas yet"}</p></div>
      ) : (
        areas.map((area: any) => (
          <Card key={area.id} className={`p-3 shadow-card ${!area.enabled ? "opacity-50" : ""}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{area.name}</p>
                {(area.district || area.state) && <p className="text-xs text-muted-foreground">{[area.district, area.state].filter(Boolean).join(", ")}</p>}
              </div>
              <Switch checked={area.enabled} onCheckedChange={(checked) => handleToggle(area, checked)} />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditArea(area); setName(area.name); setState(area.state || ""); setDistrict(area.district || ""); setShowAdd(true); }}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(area)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editArea ? (language === "hi" ? "क्षेत्र संपादित करें" : "Edit Area") : (language === "hi" ? "नया क्षेत्र जोड़ें" : "Add New Area")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>{language === "hi" ? "नाम" : "Name"}</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
            <div><Label>{language === "hi" ? "जिला" : "District"}</Label><Input value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1" /></div>
            <div><Label>{language === "hi" ? "राज्य" : "State"}</Label><Input value={state} onChange={(e) => setState(e.target.value)} className="mt-1" /></div>
            <Button onClick={handleSave} className="w-full">{editArea ? (language === "hi" ? "अपडेट करें" : "Update") : (language === "hi" ? "जोड़ें" : "Add")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AreaManagement;
