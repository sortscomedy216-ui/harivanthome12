import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, PieChart as PieIcon, BarChart3 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";

interface Props {
  language: "hi" | "en";
}

const COLORS = ["hsl(199,89%,48%)", "hsl(152,69%,40%)", "hsl(38,92%,50%)", "hsl(0,84%,60%)", "hsl(262,83%,58%)", "hsl(24,95%,53%)", "hsl(173,58%,39%)", "hsl(340,82%,52%)"];

const AdminReports = ({ language }: Props) => {
  const { data: reportData, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      const [allProviders, todayRegistered, todayApproved, todayRejected, areas] = await Promise.all([
        supabase.from("service_providers").select("category, city, area, created_at, status"),
        supabase.from("service_providers").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("service_providers").select("id", { count: "exact", head: true }).gte("created_at", todayStart).eq("status", "approved"),
        supabase.from("service_providers").select("id", { count: "exact", head: true }).gte("created_at", todayStart).eq("status", "rejected"),
        supabase.from("areas").select("name"),
      ]);

      const providers = allProviders.data || [];

      // Category distribution
      const catCounts: Record<string, number> = {};
      providers.forEach((p: any) => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
      const categoryData = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name: name.substring(0, 10), value }));

      // Area distribution
      const areaCounts: Record<string, number> = {};
      providers.forEach((p: any) => { const a = p.area || p.city || "Unknown"; areaCounts[a] = (areaCounts[a] || 0) + 1; });
      const areaData = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name: name.substring(0, 10), value }));

      // Registration trend (last 7 days)
      const trendData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStr = date.toLocaleDateString("hi-IN", { day: "numeric", month: "short" });
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        const count = providers.filter((p: any) => {
          const d = new Date(p.created_at);
          return d >= dayStart && d < dayEnd;
        }).length;
        trendData.push({ name: dayStr, registrations: count });
      }

      return {
        todayRegistered: todayRegistered.count || 0,
        todayApproved: todayApproved.count || 0,
        todayRejected: todayRejected.count || 0,
        categoryData,
        areaData,
        trendData,
      };
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!reportData) return null;

  const chartConfig = { value: { label: "Count", color: "hsl(var(--primary))" }, registrations: { label: "Registrations", color: "hsl(var(--primary))" } };

  return (
    <div className="space-y-4">
      {/* Daily Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center shadow-card">
          <p className="text-xl font-bold text-primary">{reportData.todayRegistered}</p>
          <p className="text-[10px] text-muted-foreground">{language === "hi" ? "आज रजिस्ट्रेशन" : "Today Registered"}</p>
        </Card>
        <Card className="p-3 text-center shadow-card">
          <p className="text-xl font-bold text-green-600">{reportData.todayApproved}</p>
          <p className="text-[10px] text-muted-foreground">{language === "hi" ? "आज अनुमोदित" : "Today Approved"}</p>
        </Card>
        <Card className="p-3 text-center shadow-card">
          <p className="text-xl font-bold text-destructive">{reportData.todayRejected}</p>
          <p className="text-[10px] text-muted-foreground">{language === "hi" ? "आज अस्वीकृत" : "Today Rejected"}</p>
        </Card>
      </div>

      {/* Registration Trend */}
      <Card className="p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold">{language === "hi" ? "रजिस्ट्रेशन ट्रेंड (7 दिन)" : "Registration Trend (7 days)"}</h4>
        </div>
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          <LineChart data={reportData.trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="registrations" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ChartContainer>
      </Card>

      {/* Category Distribution */}
      <Card className="p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <PieIcon className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold">{language === "hi" ? "श्रेणी वितरण" : "Category Distribution"}</h4>
        </div>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <PieChart>
            <Pie data={reportData.categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
              {reportData.categoryData.map((_: any, i: number) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </Card>

      {/* Area Distribution */}
      <Card className="p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold">{language === "hi" ? "क्षेत्र वितरण" : "Area Distribution"}</h4>
        </div>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={reportData.areaData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </Card>
    </div>
  );
};

export default AdminReports;
