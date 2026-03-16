import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, Loader2, Trash2, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  language: "hi" | "en";
}

const AdminNotifications = ({ language }: Props) => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_notifications").select("*").order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const markRead = async (id: string) => {
    await supabase.from("admin_notifications").update({ read: true }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
  };

  const markAllRead = async () => {
    await supabase.from("admin_notifications").update({ read: true }).eq("read", false);
    queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("admin_notifications").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
  };

  const clearAll = async () => {
    if (!window.confirm(language === "hi" ? "सभी सूचनाएं हटाएं?" : "Clear all notifications?")) return;
    await supabase.from("admin_notifications").delete().neq("id", "none");
    queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-4 h-4" />;
      case "warning": return <AlertTriangle className="w-4 h-4" />;
      case "error": return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "warning": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "error": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground animate-pulse">{unreadCount} {language === "hi" ? "नई" : "new"}</Badge>
          )}
          <Badge variant="outline" className="text-[10px]">{notifications.length} {language === "hi" ? "कुल" : "total"}</Badge>
        </div>
        <div className="flex gap-1">
          {unreadCount > 0 && (
            <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={markAllRead}>
              <CheckCheck className="w-3 h-3 mr-1" /> {language === "hi" ? "सब पढ़ें" : "Read All"}
            </Button>
          )}
          {notifications.length > 0 && (
            <Button size="sm" variant="ghost" className="h-7 text-[10px] text-destructive" onClick={clearAll}>
              <Trash2 className="w-3 h-3 mr-1" /> {language === "hi" ? "सब हटाएं" : "Clear"}
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">{language === "hi" ? "कोई सूचना नहीं" : "No notifications"}</p>
          <p className="text-xs mt-1">{language === "hi" ? "सभी अपडेट यहाँ दिखेंगे" : "All updates will appear here"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any, i: number) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Card className={`p-3 shadow-sm transition-all ${!n.read ? "border-l-4 border-l-primary bg-primary/5 shadow-card" : "hover:shadow-card"}`}>
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getTypeColor(n.type)}`}>
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {!n.read && (
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => markRead(n.id)}>
                            <Check className="w-3 h-3 text-primary" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => deleteNotification(n.id)}>
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground/60 mt-1">
                      {new Date(n.created_at).toLocaleString("hi-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
