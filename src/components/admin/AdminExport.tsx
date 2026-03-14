import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Users, MapPin, Grid3X3, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  language: "hi" | "en";
}

const downloadCSV = (data: any[], filename: string) => {
  if (!data.length) { toast.error("No data to export"); return; }
  const headers = Object.keys(data[0]);
  const csv = [headers.join(","), ...data.map((row) => headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename}.csv downloaded!`);
};

const AdminExport = ({ language }: Props) => {
  const [loading, setLoading] = useState<string | null>(null);

  const exportProviders = async () => {
    setLoading("providers");
    const { data } = await supabase.from("service_providers").select("name, phone, email, category, city, area, status, rating, experience, created_at");
    downloadCSV(data || [], "providers_list");
    setLoading(null);
  };

  const exportAreas = async () => {
    setLoading("areas");
    const { data } = await supabase.from("areas").select("name, district, state, enabled, created_at");
    downloadCSV(data || [], "area_report");
    setLoading(null);
  };

  const exportCategories = async () => {
    setLoading("categories");
    const { data } = await supabase.from("service_providers").select("category, status");
    const counts: Record<string, { total: number; approved: number; pending: number; rejected: number }> = {};
    (data || []).forEach((p: any) => {
      if (!counts[p.category]) counts[p.category] = { total: 0, approved: 0, pending: 0, rejected: 0 };
      counts[p.category].total++;
      if (p.status === "approved") counts[p.category].approved++;
      if (p.status === "pending") counts[p.category].pending++;
      if (p.status === "rejected") counts[p.category].rejected++;
    });
    const exportData = Object.entries(counts).map(([cat, c]) => ({ category: cat, ...c }));
    downloadCSV(exportData, "category_report");
    setLoading(null);
  };

  const exports = [
    { key: "providers", label: language === "hi" ? "प्रदाता सूची CSV" : "Providers List CSV", icon: Users, action: exportProviders },
    { key: "areas", label: language === "hi" ? "क्षेत्र रिपोर्ट" : "Area Report", icon: MapPin, action: exportAreas },
    { key: "categories", label: language === "hi" ? "श्रेणी रिपोर्ट" : "Category Report", icon: Grid3X3, action: exportCategories },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{language === "hi" ? "डेटा CSV फ़ाइल में डाउनलोड करें" : "Download data as CSV files"}</p>
      {exports.map((exp) => (
        <Card key={exp.key} className="p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <exp.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium">{exp.label}</p>
            </div>
            <Button size="sm" variant="outline" onClick={exp.action} disabled={loading === exp.key}>
              {loading === exp.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
              CSV
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AdminExport;
