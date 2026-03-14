import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, Loader2, Trash2 } from "lucide-react";

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return "bg-green-100 text-green-700";
      case "warning": return "bg-amber-100 text-amber-700";
      case "error": return "bg-destructive/10 text-destructive";
      default: return "bg-primary/10 text-primary";
    }
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <Badge className="bg-primary">{unreadCount} {language === "hi" ? "अपठित" : "unread"}</Badge>
          <Button size="sm" variant="ghost" onClick={markAllRead}><CheckCheck className="w-4 h-4 mr-1" /> {language === "hi" ? "सभी पढ़ें" : "Mark all read"}</Button>
        </div>
      )}
      {notifications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground"><Bell className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>{language === "hi" ? "कोई सूचना नहीं" : "No notifications"}</p></div>
      ) : (
        notifications.map((n: any) => (
          <Card key={n.id} className={`p-3 shadow-card ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${getTypeColor(n.type)}`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString("hi-IN")}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!n.read && (
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => markRead(n.id)}>
                    <Check className="w-3 h-3" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteNotification(n.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default AdminNotifications;
