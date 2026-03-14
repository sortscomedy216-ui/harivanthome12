import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2, FileText, User, Shield, MapPin, Grid3X3 } from "lucide-react";

interface Props {
  language: "hi" | "en";
}

const AdminLogs = ({ language }: Props) => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
  });

  const getIcon = (targetType: string | null) => {
    switch (targetType) {
      case "provider": return <User className="w-4 h-4" />;
      case "category": return <Grid3X3 className="w-4 h-4" />;
      case "area": return <MapPin className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getColor = (action: string) => {
    if (action.includes("Approved") || action.includes("Enabled") || action.includes("Added")) return "bg-green-100 text-green-600";
    if (action.includes("Rejected") || action.includes("Deleted") || action.includes("Blacklisted")) return "bg-destructive/10 text-destructive";
    if (action.includes("Disabled")) return "bg-orange-100 text-orange-600";
    return "bg-primary/10 text-primary";
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{language === "hi" ? "सभी एडमिन गतिविधियाँ" : "All admin activities"}</p>
      {logs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground"><FileText className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>{language === "hi" ? "कोई लॉग नहीं" : "No logs yet"}</p></div>
      ) : (
        logs.map((log: any) => (
          <Card key={log.id} className="p-3 shadow-card">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getColor(log.action)}`}>
                {getIcon(log.target_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{log.action}</p>
                {log.target_name && <p className="text-xs text-muted-foreground">{log.target_name}</p>}
                {log.details && <p className="text-xs text-muted-foreground italic">{log.details}</p>}
                <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(log.created_at).toLocaleString("hi-IN")}</p>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default AdminLogs;
