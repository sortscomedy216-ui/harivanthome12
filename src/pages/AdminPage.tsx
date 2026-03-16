import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Shield, Loader2,
  LayoutDashboard, Users, Grid3X3, MapPin, Clock, Bell,
  BarChart3, FileText, Download, ShieldAlert, Settings, UserCog,
} from "lucide-react";
import { toast } from "sonner";

import AdminStats from "@/components/admin/AdminStats";
import ProviderManagement from "@/components/admin/ProviderManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import AreaManagement from "@/components/admin/AreaManagement";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminReports from "@/components/admin/AdminReports";
import AdminLogs from "@/components/admin/AdminLogs";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminExport from "@/components/admin/AdminExport";
import AntiFraud from "@/components/admin/AntiFraud";

type AdminSection = "dashboard" | "providers" | "categories" | "areas" | "pending" | "notifications" | "reports" | "logs" | "settings" | "export" | "fraud" | "roles";

const AdminPage = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { user, isAdmin, loading: authLoading, signInWithEmail, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const { error } = await signInWithEmail(email, password);
      if (error) throw error;
      toast.success(language === "hi" ? "लॉगिन सफल!" : "Login successful!");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col select-none">
        <div className="gradient-primary px-4 pt-4 pb-6 safe-top">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/home")}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold text-primary-foreground">{t("admin.login")}</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-sm p-6 shadow-elevated">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            {user && !isAdmin && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                {language === "hi" ? "एडमिन अधिकार नहीं हैं" : "No admin privileges"}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div><Label>{t("auth.email")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" required /></div>
              <div><Label>{t("auth.password")}</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" required /></div>
              <Button type="submit" className="w-full h-11 gradient-primary" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : t("auth.login")}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  const sections: { id: AdminSection; label: string; icon: any }[] = [
    { id: "dashboard", label: language === "hi" ? "डैशबोर्ड" : "Dashboard", icon: LayoutDashboard },
    { id: "providers", label: language === "hi" ? "प्रदाता" : "Providers", icon: Users },
    { id: "pending", label: language === "hi" ? "लंबित" : "Pending", icon: Clock },
    { id: "categories", label: language === "hi" ? "श्रेणी" : "Categories", icon: Grid3X3 },
    { id: "areas", label: language === "hi" ? "क्षेत्र" : "Areas", icon: MapPin },
    { id: "notifications", label: language === "hi" ? "सूचनाएं" : "Alerts", icon: Bell },
    { id: "reports", label: language === "hi" ? "रिपोर्ट" : "Reports", icon: BarChart3 },
    { id: "logs", label: language === "hi" ? "लॉग" : "Logs", icon: FileText },
    { id: "export", label: language === "hi" ? "एक्सपोर्ट" : "Export", icon: Download },
    { id: "fraud", label: language === "hi" ? "धोखाधड़ी" : "Fraud", icon: ShieldAlert },
    { id: "settings", label: language === "hi" ? "सेटिंग्स" : "Settings", icon: Settings },
    { id: "roles", label: language === "hi" ? "रोल्स" : "Roles", icon: UserCog },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard": return <AdminStats language={language} />;
      case "providers": return <ProviderManagement language={language} userId={user.id} />;
      case "pending": return <ProviderManagement language={language} userId={user.id} defaultStatus="pending" />;
      case "categories": return <CategoryManagement language={language} userId={user.id} />;
      case "areas": return <AreaManagement language={language} userId={user.id} />;
      case "notifications": return <AdminNotifications language={language} />;
      case "reports": return <AdminReports language={language} />;
      case "logs": return <AdminLogs language={language} />;
      case "export": return <AdminExport language={language} />;
      case "fraud": return <AntiFraud language={language} />;
      case "settings": return <AdminSettings language={language} userId={user.id} />;
      case "roles": return (
        <div className="space-y-4">
          <Card className="p-4 shadow-card">
            <h4 className="text-sm font-semibold mb-3">{language === "hi" ? "एडमिन रोल्स" : "Admin Roles"}</h4>
            <div className="space-y-3">
              {[
                { role: "Super Admin", desc: language === "hi" ? "पूर्ण एक्सेस - सभी अनुमतियाँ" : "Full access - all permissions", color: "bg-primary/10 text-primary" },
                { role: "Moderator", desc: language === "hi" ? "प्रदाता प्रबंधन और अनुमोदन" : "Provider management & approvals", color: "bg-amber-100 text-amber-700" },
                { role: "Support Admin", desc: language === "hi" ? "केवल देखें और रिपोर्ट" : "View only & reports", color: "bg-green-100 text-green-700" },
              ].map((r) => (
                <div key={r.role} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.color}`}>
                    <UserCog className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.role}</p>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 p-2 bg-muted rounded">{language === "hi" ? "🔮 भविष्य में विस्तार के लिए तैयार। अभी Super Admin के रूप में काम कर रहे हैं।" : "🔮 Future-ready. Currently operating as Super Admin."}</p>
          </Card>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6 select-none">
      {/* Header */}
      <div className="gradient-primary px-4 pt-4 pb-3 safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/home")}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-lg font-bold text-primary-foreground">{t("admin.title")}</h1>
          </div>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 text-xs" onClick={signOut}>
            {t("auth.logout")}
          </Button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="px-4 -mt-1 mb-3">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 py-2">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all shrink-0 ${
                  activeSection === s.id
                    ? "gradient-primary text-primary-foreground shadow-card"
                    : "bg-card text-muted-foreground border shadow-sm hover:bg-muted"
                }`}
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Content */}
      <div className="px-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPage;
