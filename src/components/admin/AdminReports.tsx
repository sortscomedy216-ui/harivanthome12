import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, PieChart as PieIcon, BarChart3, Calendar, UserCheck, XCircle } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Area, AreaChart } from "recharts";
import { motion } from "framer-motion";

interface Props {
  language: "hi" | "en";
}

const COLORS = [
  "hsl(199,89%,48%)", "hsl(152,69%,40%)", "hsl(38,92%,50%)", "hsl(0,84%,60%)",
  "hsl(262,83%,58%)", "hsl(24,95%,53%)", "hsl(173,58%,39%)", "hsl(340,82%,52%)",
  "hsl(210,80%,55%)", "hsl(120,60%,45%)",
];

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
      const categoryData = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name: name.substring(0, 12), value, fullName: name }));

      // Area distribution
      const areaCounts: Record<string, number> = {};
      providers.forEach((p: any) => { const a = p.area || p.city || "Unknown"; areaCounts[a] = (areaCounts[a] || 0) + 1; });
      const areaData = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name: name.substring(0, 12), value }));

      // Registration trend (last 14 days)
      const trendData = [];
      for (let i = 13; i >= 0; i--) {
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

      // Status breakdown
      const statusCounts = { approved: 0, pending: 0, rejected: 0 };
      providers.forEach((p: any) => {
        if (p.status in statusCounts) statusCounts[p.status as keyof typeof statusCounts]++;
      });
      const statusData = [
        { name: language === "hi" ? "अनुमोदित" : "Approved", value: statusCounts.approved },
        { name: language === "hi" ? "लंबित" : "Pending", value: statusCounts.pending },
        { name: language === "hi" ? "अस्वीकृत" : "Rejected", value: statusCounts.rejected },
      ];

      return {
        todayRegistered: todayRegistered.count || 0,
        todayApproved: todayApproved.count || 0,
        todayRejected: todayRejected.count || 0,
        totalProviders: providers.length,
        categoryData,
        areaData,
        trendData,
        statusData,
      };
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!reportData) return null;

  const chartConfig = {
    value: { label: "Count", color: "hsl(var(--primary))" },
    registrations: { label: language === "hi" ? "रजिस्ट्रेशन" : "Registrations", color: "hsl(var(--primary))" },
  };

  return (
    <div className="space-y-4">
      {/* Today's Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: reportData.todayRegistered, label: language === "hi" ? "आज रजिस्ट्रेशन" : "Today Registered", icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
          { value: reportData.todayApproved, label: language === "hi" ? "आज अनुमोदित" : "Today Approved", icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { value: reportData.todayRejected, label: language === "hi" ? "आज अस्वीकृत" : "Today Rejected", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-3 text-center shadow-card">
              <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mx-auto mb-1.5`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
              <p className="text-[9px] text-muted-foreground font-medium">{item.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="trend" className="w-full">
        <TabsList className="w-full grid grid-cols-4 h-9">
          <TabsTrigger value="trend" className="text-[10px] px-1"><TrendingUp className="w-3 h-3 mr-0.5" />{language === "hi" ? "ट्रेंड" : "Trend"}</TabsTrigger>
          <TabsTrigger value="category" className="text-[10px] px-1"><PieIcon className="w-3 h-3 mr-0.5" />{language === "hi" ? "श्रेणी" : "Category"}</TabsTrigger>
          <TabsTrigger value="area" className="text-[10px] px-1"><BarChart3 className="w-3 h-3 mr-0.5" />{language === "hi" ? "क्षेत्र" : "Area"}</TabsTrigger>
          <TabsTrigger value="status" className="text-[10px] px-1"><UserCheck className="w-3 h-3 mr-0.5" />{language === "hi" ? "स्थिति" : "Status"}</TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <Card className="p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                {language === "hi" ? "रजिस्ट्रेशन ट्रेंड (14 दिन)" : "Registration Trend (14 days)"}
              </h4>
              <Badge variant="secondary" className="text-[10px]">{reportData.totalProviders} {language === "hi" ? "कुल" : "total"}</Badge>
            </div>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart data={reportData.trendData}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={1} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="registrations" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#colorReg)" dot={{ r: 3, fill: "hsl(var(--primary))" }} />
              </AreaChart>
            </ChartContainer>
          </Card>
        </TabsContent>

        <TabsContent value="category">
          <Card className="p-4 shadow-card">
            <h4 className="text-sm font-bold flex items-center gap-1.5 mb-3">
              <PieIcon className="w-4 h-4 text-primary" />
              {language === "hi" ? "श्रेणी वितरण" : "Category Distribution"}
            </h4>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <PieChart>
                <Pie data={reportData.categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35} paddingAngle={2} label={({ name, value }) => `${name}: ${value}`}>
                  {reportData.categoryData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            {/* Legend */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {reportData.categoryData.slice(0, 6).map((item: any, i: number) => (
                <Badge key={i} variant="outline" className="text-[9px] gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {item.fullName || item.name} ({item.value})
                </Badge>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="area">
          <Card className="p-4 shadow-card">
            <h4 className="text-sm font-bold flex items-center gap-1.5 mb-3">
              <BarChart3 className="w-4 h-4 text-primary" />
              {language === "hi" ? "क्षेत्र वितरण" : "Area Distribution"}
            </h4>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={reportData.areaData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={70} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ChartContainer>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card className="p-4 shadow-card">
            <h4 className="text-sm font-bold flex items-center gap-1.5 mb-3">
              <UserCheck className="w-4 h-4 text-primary" />
              {language === "hi" ? "स्थिति वितरण" : "Status Breakdown"}
            </h4>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <PieChart>
                <Pie data={reportData.statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                  <Cell fill="hsl(152,69%,40%)" />
                  <Cell fill="hsl(38,92%,50%)" />
                  <Cell fill="hsl(0,84%,60%)" />
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-3">
              {reportData.statusData.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ["hsl(152,69%,40%)", "hsl(38,92%,50%)", "hsl(0,84%,60%)"][i] }} />
                  <span className="font-medium">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;
