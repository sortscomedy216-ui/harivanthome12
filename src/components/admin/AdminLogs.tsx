import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, User, Shield, MapPin, Grid3X3, Search, Settings, Clock } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  language: "hi" | "en";
}

const AdminLogs = ({ language }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const getIcon = (targetType: string | null) => {
    switch (targetType) {
      case "provider": return <User className="w-4 h-4" />;
      case "category": return <Grid3X3 className="w-4 h-4" />;
      case "area": return <MapPin className="w-4 h-4" />;
      case "settings": return <Settings className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getColor = (action: string) => {
    if (action.includes("Approved") || action.includes("Enabled") || action.includes("Added")) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (action.includes("Rejected") || action.includes("Deleted") || action.includes("Blacklisted")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (action.includes("Disabled")) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    if (action.includes("Updated")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-primary/10 text-primary";
  };

  const getBadgeVariant = (action: string) => {
    if (action.includes("Approved") || action.includes("Enabled")) return "default";
    if (action.includes("Rejected") || action.includes("Deleted")) return "destructive";
    return "secondary";
  };

  const filtered = logs.filter((log: any) => {
    const matchSearch = !searchQuery ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === "all" || log.target_type === typeFilter;
    return matchSearch && matchType;
  });

  // Group by date
  const grouped: Record<string, any[]> = {};
  filtered.forEach((log: any) => {
    const date = new Date(log.created_at).toLocaleDateString("hi-IN", { day: "numeric", month: "long", year: "numeric" });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(log);
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3">
      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder={language === "hi" ? "लॉग खोजें..." : "Search logs..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === "hi" ? "सभी" : "All"}</SelectItem>
            <SelectItem value="provider">{language === "hi" ? "प्रदाता" : "Provider"}</SelectItem>
            <SelectItem value="category">{language === "hi" ? "श्रेणी" : "Category"}</SelectItem>
            <SelectItem value="area">{language === "hi" ? "क्षेत्र" : "Area"}</SelectItem>
            <SelectItem value="settings">{language === "hi" ? "सेटिंग" : "Settings"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px]">{filtered.length} {language === "hi" ? "लॉग" : "logs"}</Badge>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">{language === "hi" ? "कोई लॉग नहीं मिला" : "No logs found"}</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, dateLogs]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-2 mt-3">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground">{date}</p>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-1.5">
              {dateLogs.map((log: any, i: number) => (
                <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
                  <Card className="p-2.5 shadow-sm hover:shadow-card transition-shadow">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${getColor(log.action)}`}>
                        {getIcon(log.target_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold truncate">{log.action}</p>
                          <Badge variant={getBadgeVariant(log.action) as any} className="text-[8px] px-1 py-0 h-4 shrink-0">
                            {log.target_type || "system"}
                          </Badge>
                        </div>
                        {log.target_name && <p className="text-[10px] text-muted-foreground truncate">{log.target_name}</p>}
                        {log.details && <p className="text-[10px] text-muted-foreground italic truncate">{log.details}</p>}
                        <p className="text-[9px] text-muted-foreground/70 mt-0.5">
                          {new Date(log.created_at).toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminLogs;
