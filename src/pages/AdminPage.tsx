import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePendingProviders, useAdminStats } from "@/hooks/useProviders";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Search,
  Shield,
  Eye,
  Phone,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { getCategoryName } from "@/config/categories";

const AdminPage = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { user, isAdmin, loading: authLoading, signInWithEmail, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { data: pendingProviders = [], refetch: refetchPending } = usePendingProviders();
  const { data: stats, refetch: refetchStats } = useAdminStats();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const { error } = await signInWithEmail(email, password);
      if (error) throw error;
      toast.success(language === "hi" ? "लॉगिन सफल!" : "Login successful!");
    } catch (error: any) {
      toast.error(error.message || (language === "hi" ? "गलत क्रेडेंशियल्स" : "Invalid credentials"));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleApprove = async (providerId: string) => {
    const { error } = await supabase
      .from("service_providers")
      .update({ status: "approved" })
      .eq("id", providerId);

    if (error) {
      toast.error(language === "hi" ? "त्रुटि हुई" : "Error occurred");
      return;
    }

    toast.success(language === "hi" ? "सेवा प्रदाता अनुमोदित!" : "Provider approved!");
    refetchPending();
    refetchStats();
  };

  const handleReject = async (providerId: string) => {
    const { error } = await supabase
      .from("service_providers")
      .update({ status: "rejected" })
      .eq("id", providerId);

    if (error) {
      toast.error(language === "hi" ? "त्रुटि हुई" : "Error occurred");
      return;
    }

    toast.info(language === "hi" ? "सेवा प्रदाता अस्वीकृत" : "Provider rejected");
    refetchPending();
    refetchStats();
  };

  const filteredProviders = pendingProviders.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Show login if not authenticated or not admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="gradient-primary px-4 pt-4 pb-6 safe-top">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/home")}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">
                {t("admin.login")}
              </h1>
              <p className="text-sm text-primary-foreground/80">
                {language === "hi" ? "एडमिन पैनल में लॉगिन करें" : "Login to admin panel"}
              </p>
            </div>
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
                {language === "hi" 
                  ? "आपके पास एडमिन अधिकार नहीं हैं।"
                  : "You don't have admin privileges."}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-11 gradient-primary" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  t("auth.login")
                )}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground mt-4">
              {language === "hi" ? "एडमिन खाते से लॉगिन करें" : "Login with admin account"}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="gradient-primary px-4 pt-4 pb-6 safe-top">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/home")}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">
                {t("admin.title")}
              </h1>
              <p className="text-sm text-primary-foreground/80">
                {language === "hi" ? "हरिवंत एडमिन" : "Harivant Admin"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={signOut}
          >
            {t("auth.logout")}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalProviders || 0}</p>
                <p className="text-xs text-muted-foreground">{t("admin.totalProviders")}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.pendingApprovals || 0}</p>
                <p className="text-xs text-muted-foreground">{t("admin.pending")}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-6">
        <Tabs defaultValue="pending">
          <TabsList className="w-full">
            <TabsTrigger value="pending" className="flex-1">
              <Clock className="w-4 h-4 mr-2" />
              {t("admin.pending")} ({pendingProviders.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex-1">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {t("admin.approved")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={language === "hi" ? "नाम से खोजें..." : "Search by name..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Pending Providers List */}
            <div className="space-y-3">
              {filteredProviders.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === "hi" ? "कोई लंबित अनुमोदन नहीं" : "No pending approvals"}
                  </p>
                </div>
              ) : (
                filteredProviders.map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4 shadow-card">
                      <div className="flex gap-3">
                        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                          👤
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{provider.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {getCategoryName(provider.category, language)}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(provider.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {provider.phone}
                            </div>
                            {provider.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {provider.location}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              className="flex-1 h-9 bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(provider.id)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              {t("admin.approve")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-9 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleReject(provider.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              {t("admin.reject")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-4">
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === "hi" 
                  ? `${stats?.totalProviders || 0} अनुमोदित सेवा प्रदाता`
                  : `${stats?.totalProviders || 0} approved service providers`}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
