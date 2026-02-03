import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
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

// Mock data
const mockPendingProviders = [
  { id: "p1", name: "विकास सिंह", phone: "+91 98765 12345", category: "electrician", experience: 5, location: "रोहिणी, दिल्ली", createdAt: "2 घंटे पहले" },
  { id: "p2", name: "संजय कुमार", phone: "+91 87654 32109", category: "plumber", experience: 8, location: "द्वारका, दिल्ली", createdAt: "5 घंटे पहले" },
  { id: "p3", name: "मनोज यादव", phone: "+91 76543 21098", category: "carpenter", experience: 3, location: "करोल बाग, दिल्ली", createdAt: "1 दिन पहले" },
];

const mockStats = {
  totalUsers: 1250,
  totalProviders: 85,
  pendingApprovals: 12,
  activeToday: 45,
};

const categoryNames: Record<string, { hi: string; en: string }> = {
  plumber: { hi: "प्लंबर", en: "Plumber" },
  electrician: { hi: "इलेक्ट्रीशियन", en: "Electrician" },
  carpenter: { hi: "कारपेंटर", en: "Carpenter" },
  painter: { hi: "पेंटर", en: "Painter" },
  cleaner: { hi: "सफाई कर्मचारी", en: "Cleaner" },
  acRepair: { hi: "AC रिपेयर", en: "AC Repair" },
  pestControl: { hi: "पेस्ट कंट्रोल", en: "Pest Control" },
  appliance: { hi: "अप्लायंस रिपेयर", en: "Appliance Repair" },
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingProviders, setPendingProviders] = useState(mockPendingProviders);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in production, this would verify with Firebase
    if (email === "admin@harivant.com" && password === "admin123") {
      setIsLoggedIn(true);
      toast.success(language === "hi" ? "लॉगिन सफल!" : "Login successful!");
    } else {
      toast.error(language === "hi" ? "गलत क्रेडेंशियल्स" : "Invalid credentials");
    }
  };

  const handleApprove = (providerId: string) => {
    setPendingProviders((prev) => prev.filter((p) => p.id !== providerId));
    toast.success(language === "hi" ? "सेवा प्रदाता अनुमोदित!" : "Provider approved!");
  };

  const handleReject = (providerId: string) => {
    setPendingProviders((prev) => prev.filter((p) => p.id !== providerId));
    toast.info(language === "hi" ? "सेवा प्रदाता अस्वीकृत" : "Provider rejected");
  };

  const filteredProviders = pendingProviders.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn) {
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

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@harivant.com"
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

              <Button type="submit" className="w-full h-11 gradient-primary">
                {t("auth.login")}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Demo: admin@harivant.com / admin123
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
            onClick={() => setIsLoggedIn(false)}
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
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">{t("admin.totalUsers")}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.totalProviders}</p>
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
                <p className="text-2xl font-bold">{mockStats.pendingApprovals}</p>
                <p className="text-xs text-muted-foreground">{t("admin.pending")}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.activeToday}</p>
                <p className="text-xs text-muted-foreground">{language === "hi" ? "आज एक्टिव" : "Active Today"}</p>
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
              {t("admin.pending")}
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
                                {categoryNames[provider.category]?.[language] || provider.category}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">{provider.createdAt}</span>
                          </div>

                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {provider.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {provider.location}
                            </div>
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
                            <Button size="sm" variant="ghost" className="h-9 px-3">
                              <Eye className="w-4 h-4" />
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
                {language === "hi" ? "85 अनुमोदित सेवा प्रदाता" : "85 approved service providers"}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
