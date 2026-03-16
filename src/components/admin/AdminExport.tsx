import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Users, MapPin, Grid3X3, Loader2, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
  const [downloaded, setDownloaded] = useState<string[]>([]);

  const exportProviders = async () => {
    setLoading("providers");
    const { data } = await supabase.from("service_providers").select("name, phone, email, category, city, area, status, rating, experience, created_at");
    downloadCSV(data || [], "providers_list");
    setDownloaded((prev) => [...prev, "providers"]);
    setLoading(null);
  };

  const exportAreas = async () => {
    setLoading("areas");
    const { data } = await supabase.from("areas").select("name, district, state, enabled, created_at");
    downloadCSV(data || [], "area_report");
    setDownloaded((prev) => [...prev, "areas"]);
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
    setDownloaded((prev) => [...prev, "categories"]);
    setLoading(null);
  };

  const exportLogs = async () => {
    setLoading("logs");
    const { data } = await supabase.from("admin_logs").select("action, target_type, target_name, details, created_at").order("created_at", { ascending: false });
    downloadCSV(data || [], "admin_logs");
    setDownloaded((prev) => [...prev, "logs"]);
    setLoading(null);
  };

  const exports = [
    { key: "providers", label: language === "hi" ? "प्रदाता सूची CSV" : "Providers List CSV", desc: language === "hi" ? "सभी प्रदाताओं की पूरी सूची" : "Complete list of all providers", icon: Users, action: exportProviders, color: "bg-blue-500/10 text-blue-600" },
    { key: "areas", label: language === "hi" ? "क्षेत्र रिपोर्ट" : "Area Report", desc: language === "hi" ? "सभी क्षेत्रों की जानकारी" : "All areas information", icon: MapPin, action: exportAreas, color: "bg-cyan-500/10 text-cyan-600" },
    { key: "categories", label: language === "hi" ? "श्रेणी रिपोर्ट" : "Category Report", desc: language === "hi" ? "श्रेणी-वार प्रदाता गणना" : "Category-wise provider counts", icon: Grid3X3, action: exportCategories, color: "bg-purple-500/10 text-purple-600" },
    { key: "logs", label: language === "hi" ? "एडमिन लॉग" : "Admin Activity Logs", desc: language === "hi" ? "सभी एडमिन गतिविधियाँ" : "All admin activities", icon: FileSpreadsheet, action: exportLogs, color: "bg-amber-500/10 text-amber-600" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{language === "hi" ? "डेटा CSV फ़ाइल में डाउनलोड करें" : "Download data as CSV files"}</p>
        {downloaded.length > 0 && (
          <Badge variant="secondary" className="text-[10px]">{downloaded.length} {language === "hi" ? "डाउनलोड" : "downloaded"}</Badge>
        )}
      </div>
      {exports.map((exp, i) => (
        <motion.div key={exp.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="p-4 shadow-card hover:shadow-elevated transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${exp.color} flex items-center justify-center shrink-0`}>
                <exp.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold">{exp.label}</p>
                  {downloaded.includes(exp.key) && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <p className="text-[10px] text-muted-foreground">{exp.desc}</p>
              </div>
              <Button size="sm" variant="outline" onClick={exp.action} disabled={loading === exp.key} className="shrink-0">
                {loading === exp.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
                CSV
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminExport;
