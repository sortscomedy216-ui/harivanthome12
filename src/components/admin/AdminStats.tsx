import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCheck, Clock, XCircle, Ban, Grid3X3, MapPin, TrendingUp, Calendar, CalendarDays } from "lucide-react";

interface AdminStatsProps {
  language: "hi" | "en";
}

const AdminStats = ({ language }: AdminStatsProps) => {
  const { data: stats } = useQuery({
    queryKey: ["admin-full-stats"],
    queryFn: async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [total, pending, approved, rejected, disabled, categories, areas, daily, weekly, monthly] = await Promise.all([
        supabase.from("service_providers").select("id", { count: "exact", head: true }),
        supabase.from("service_providers").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("service_providers").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("service_providers").select("id", { count: "exact", head: true }).eq("status", "rejected"),
        supabase.from("service_providers").select("id", { count: "exact", head: true }).eq("disabled", true),
        supabase.from("service_providers").select("category").eq("status", "approved"),
        supabase.from("areas").select("id", { count: "exact", head: true }),
        supabase.from("service_providers").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("service_providers").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
        supabase.from("service_providers").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
      ]);

      const uniqueCategories = new Set((categories.data || []).map((p: any) => p.category));

      return {
        total: total.count || 0,
        pending: pending.count || 0,
        approved: approved.count || 0,
        rejected: rejected.count || 0,
        disabled: disabled.count || 0,
        categories: uniqueCategories.size,
        areas: areas.count || 0,
        daily: daily.count || 0,
        weekly: weekly.count || 0,
        monthly: monthly.count || 0,
      };
    },
  });

  const cards = [
    { label: language === "hi" ? "कुल सेवा प्रदाता" : "Total Providers", value: stats?.total || 0, icon: Users, color: "bg-primary/10 text-primary" },
    { label: language === "hi" ? "लंबित अनुमोदन" : "Pending Approvals", value: stats?.pending || 0, icon: Clock, color: "bg-amber-100 text-amber-600" },
    { label: language === "hi" ? "अनुमोदित प्रदाता" : "Approved Providers", value: stats?.approved || 0, icon: UserCheck, color: "bg-green-100 text-green-600" },
    { label: language === "hi" ? "अस्वीकृत प्रदाता" : "Rejected Providers", value: stats?.rejected || 0, icon: XCircle, color: "bg-destructive/10 text-destructive" },
    { label: language === "hi" ? "अक्षम प्रदाता" : "Disabled Providers", value: stats?.disabled || 0, icon: Ban, color: "bg-orange-100 text-orange-600" },
    { label: language === "hi" ? "कुल सेवा श्रेणियाँ" : "Total Categories", value: stats?.categories || 0, icon: Grid3X3, color: "bg-purple-100 text-purple-600" },
    { label: language === "hi" ? "कुल क्षेत्र" : "Total Areas", value: stats?.areas || 0, icon: MapPin, color: "bg-cyan-100 text-cyan-600" },
    { label: language === "hi" ? "आज के रजिस्ट्रेशन" : "Daily Registrations", value: stats?.daily || 0, icon: Calendar, color: "bg-indigo-100 text-indigo-600" },
    { label: language === "hi" ? "साप्ताहिक रजिस्ट्रेशन" : "Weekly Registrations", value: stats?.weekly || 0, icon: CalendarDays, color: "bg-teal-100 text-teal-600" },
    { label: language === "hi" ? "मासिक रजिस्ट्रेशन" : "Monthly Registrations", value: stats?.monthly || 0, icon: TrendingUp, color: "bg-rose-100 text-rose-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <Card key={i} className="p-3 shadow-card">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}>
              <card.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold leading-tight">{card.value}</p>
              <p className="text-[10px] text-muted-foreground leading-tight truncate">{card.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;
