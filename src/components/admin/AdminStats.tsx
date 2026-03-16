import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Users, UserCheck, Clock, XCircle, Ban, Grid3X3, MapPin,
  TrendingUp, Calendar, CalendarDays, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

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
      const yesterdayStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

      const [total, pending, approved, rejected, disabled, categories, areas, daily, weekly, monthly, yesterday] = await Promise.all([
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
        supabase.from("service_providers").select("id", { count: "exact", head: true }).gte("created_at", yesterdayStart).lt("created_at", todayStart),
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
        yesterday: yesterday.count || 0,
      };
    },
  });

  const dailyTrend = stats ? stats.daily - stats.yesterday : 0;

  const cards = [
    { label: language === "hi" ? "कुल सेवा प्रदाता" : "Total Providers", value: stats?.total || 0, icon: Users, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10" },
    { label: language === "hi" ? "लंबित अनुमोदन" : "Pending Approvals", value: stats?.pending || 0, icon: Clock, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-500/10", pulse: (stats?.pending || 0) > 0 },
    { label: language === "hi" ? "अनुमोदित प्रदाता" : "Approved", value: stats?.approved || 0, icon: UserCheck, gradient: "from-emerald-500 to-green-500", bg: "bg-emerald-500/10" },
    { label: language === "hi" ? "अस्वीकृत प्रदाता" : "Rejected", value: stats?.rejected || 0, icon: XCircle, gradient: "from-red-500 to-rose-500", bg: "bg-red-500/10" },
    { label: language === "hi" ? "अक्षम प्रदाता" : "Disabled", value: stats?.disabled || 0, icon: Ban, gradient: "from-orange-500 to-amber-600", bg: "bg-orange-500/10" },
    { label: language === "hi" ? "कुल श्रेणियाँ" : "Categories", value: stats?.categories || 0, icon: Grid3X3, gradient: "from-purple-500 to-violet-500", bg: "bg-purple-500/10" },
    { label: language === "hi" ? "कुल क्षेत्र" : "Areas", value: stats?.areas || 0, icon: MapPin, gradient: "from-cyan-500 to-teal-500", bg: "bg-cyan-500/10" },
    { label: language === "hi" ? "आज के रजिस्ट्रेशन" : "Today", value: stats?.daily || 0, icon: Calendar, gradient: "from-indigo-500 to-blue-500", bg: "bg-indigo-500/10", trend: dailyTrend },
    { label: language === "hi" ? "साप्ताहिक" : "This Week", value: stats?.weekly || 0, icon: CalendarDays, gradient: "from-teal-500 to-emerald-500", bg: "bg-teal-500/10" },
    { label: language === "hi" ? "मासिक" : "This Month", value: stats?.monthly || 0, icon: TrendingUp, gradient: "from-rose-500 to-pink-500", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="space-y-4">
      {/* Hero Stats - Top 3 */}
      <div className="grid grid-cols-3 gap-2">
        {cards.slice(0, 3).map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`p-3 shadow-card relative overflow-hidden ${card.pulse ? "ring-2 ring-amber-400 ring-offset-1" : ""}`}>
              <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-gradient-to-br ${card.gradient} opacity-10`} />
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                <card.icon className={`w-4 h-4 bg-gradient-to-r ${card.gradient} bg-clip-text`} style={{ color: `var(--tw-gradient-from)` }} />
              </div>
              <p className="text-2xl font-black leading-none">{card.value}</p>
              <p className="text-[9px] text-muted-foreground leading-tight mt-1 font-medium">{card.label}</p>
              {card.pulse && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Regular Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {cards.slice(3).map((card, i) => (
          <motion.div
            key={i + 3}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 3) * 0.03 }}
          >
            <Card className="p-3 shadow-card">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                  <card.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-xl font-bold leading-tight">{card.value}</p>
                    {card.trend !== undefined && card.trend !== 0 && (
                      <span className={`flex items-center text-[10px] font-semibold ${card.trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {card.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(card.trend)}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight truncate font-medium">{card.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminStats;
