import { useState, useRef } from "react";
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
  ArrowLeft, Users, UserCheck, Clock, CheckCircle2, XCircle, Search, Shield,
  Phone, MapPin, Trash2, Loader2, Image, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { getCategoryName, allCategories } from "@/config/categories";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

const AdminPage = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { user, isAdmin, loading: authLoading, signInWithEmail, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<string | null>(null);
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: pendingProviders = [], refetch: refetchPending } = usePendingProviders();
  const { data: stats, refetch: refetchStats } = useAdminStats();

  const { data: allApproved = [] } = useQuery({
    queryKey: ["all-approved-providers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_providers").select("*").eq("status", "approved").order("category");
      if (error) throw error;
      return data || [];
    },
    enabled: !!isAdmin,
  });

  // Fetch app assets
  const { data: appAssets = [] } = useQuery({
    queryKey: ["app-assets"],
    queryFn: async () => {
      const { data } = await supabase.from("app_assets").select("*");
      return data || [];
    },
    enabled: !!isAdmin,
  });

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

  const handleApprove = async (providerId: string) => {
    const { error } = await supabase.from("service_providers").update({ status: "approved" }).eq("id", providerId);
    if (error) { toast.error("Error"); return; }
    toast.success(language === "hi" ? "अनुमोदित!" : "Approved!");
    refetchPending(); refetchStats();
    queryClient.invalidateQueries({ queryKey: ["all-approved-providers"] });
  };

  const handleReject = async (providerId: string) => {
    const { error } = await supabase.from("service_providers").update({ status: "rejected" }).eq("id", providerId);
    if (error) { toast.error("Error"); return; }
    toast.info(language === "hi" ? "अस्वीकृत" : "Rejected");
    refetchPending(); refetchStats();
  };

  const handleDeleteProvider = async (providerId: string, providerName: string) => {
    if (!window.confirm(`Delete "${providerName}"?`)) return;
    const { error } = await supabase.from("service_providers").delete().eq("id", providerId);
    if (error) { toast.error("Error"); return; }
    toast.success(language === "hi" ? "हटा दी" : "Deleted");
    queryClient.invalidateQueries({ queryKey: ["all-approved-providers"] });
    refetchStats();
  };

  // Upload category image
  const handleAssetUpload = async (assetKey: string, file: File) => {
    setUploadingAsset(assetKey);
    try {
      const path = `categories/${assetKey}.${file.name.split('.').pop()}`;
      const { error: uploadErr } = await supabase.storage.from("app-assets").upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      
      const { data: urlData } = supabase.storage.from("app-assets").getPublicUrl(path);
      
      // Upsert app_assets record
      const { error: dbErr } = await supabase.from("app_assets").upsert({
        asset_key: assetKey,
        asset_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
      }, { onConflict: "asset_key" });
      
      if (dbErr) throw dbErr;
      queryClient.invalidateQueries({ queryKey: ["app-assets"] });
      toast.success(language === "hi" ? "अपलोड सफल!" : "Upload successful!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadingAsset(null);
    }
  };

  const filteredProviders = pendingProviders.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const categoryProviders = deleteCategory ? allApproved.filter((p) => p.category === deleteCategory) : [];
  const categoriesWithProviders: string[] = [...new Set(allApproved.map((p) => p.category as string))];

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
              <div>
                <Label>{t("auth.email")}</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" required />
              </div>
              <div>
                <Label>{t("auth.password")}</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" required />
              </div>
              <Button type="submit" className="w-full h-11 gradient-primary" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : t("auth.login")}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6 select-none">
      <div className="gradient-primary px-4 pt-4 pb-6 safe-top">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/home")}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold text-primary-foreground">{t("admin.title")}</h1>
          </div>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={signOut}>
            {t("auth.logout")}
          </Button>
        </div>
      </div>

      <div className="px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
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

      <div className="px-4">
        <Tabs defaultValue="pending">
          <TabsList className="w-full">
            <TabsTrigger value="pending" className="flex-1">
              <Clock className="w-4 h-4 mr-1" /> {t("admin.pending")} ({pendingProviders.length})
            </TabsTrigger>
            <TabsTrigger value="delete" className="flex-1">
              <Trash2 className="w-4 h-4 mr-1" /> {language === "hi" ? "हटाएं" : "Delete"}
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex-1">
              <Image className="w-4 h-4 mr-1" /> {language === "hi" ? "एसेट" : "Assets"}
            </TabsTrigger>
          </TabsList>

          {/* Pending */}
          <TabsContent value="pending" className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder={language === "hi" ? "खोजें..." : "Search..."} value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="space-y-3">
              {filteredProviders.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">{language === "hi" ? "कोई लंबित नहीं" : "No pending"}</p>
                </div>
              ) : filteredProviders.map((provider, index) => (
                <motion.div key={provider.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="p-4 shadow-card">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">👤</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">{getCategoryName(provider.category, language)}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{provider.phone}</span>
                          {provider.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{provider.location}</span>}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="flex-1 h-9 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(provider.id)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" /> {t("admin.approve")}
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 h-9 text-destructive border-destructive" onClick={() => handleReject(provider.id)}>
                            <XCircle className="w-4 h-4 mr-1" /> {t("admin.reject")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Delete */}
          <TabsContent value="delete" className="mt-4">
            {!deleteCategory ? (
              <div className="grid grid-cols-2 gap-2">
                {allCategories
                  .filter((cat) => categoriesWithProviders.includes(cat.id))
                  .map((cat) => {
                    const count = allApproved.filter((p) => p.category === cat.id).length;
                    return (
                      <Card key={cat.id} className="p-3 shadow-card cursor-pointer hover:shadow-elevated border-destructive/20"
                        onClick={() => setDeleteCategory(cat.id)}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{cat.icon}</span>
                          <div>
                            <p className="text-sm font-medium">{language === "hi" ? cat.hi : cat.en}</p>
                            <p className="text-xs text-muted-foreground">{count}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                {categoriesWithProviders.length === 0 && (
                  <p className="col-span-2 text-center py-8 text-muted-foreground">{language === "hi" ? "कोई प्रोफ़ाइल नहीं" : "No profiles"}</p>
                )}
              </div>
            ) : (
              <div>
                <Button variant="ghost" size="sm" onClick={() => setDeleteCategory(null)} className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-1" /> {language === "hi" ? "वापस" : "Back"}
                </Button>
                <div className="space-y-3">
                  {categoryProviders.map((provider) => (
                    <Card key={provider.id} className="p-4 shadow-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{provider.name}</h4>
                          <p className="text-xs text-muted-foreground">{provider.phone} • {provider.city}</p>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteProvider(provider.id, provider.name)}>
                          <Trash2 className="w-4 h-4 mr-1" /> {language === "hi" ? "हटाएं" : "Delete"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Assets Management */}
          <TabsContent value="assets" className="mt-4">
            <div className="space-y-4">
              <h3 className="font-semibold">{language === "hi" ? "केटेगरी फ़ोटो बदलें" : "Change Category Photos"}</h3>
              <div className="grid grid-cols-2 gap-3">
                {allCategories.slice(0, 12).map((cat) => {
                  const asset = appAssets.find(a => a.asset_key === `cat_${cat.id}`);
                  return (
                    <Card key={cat.id} className="p-3 shadow-card">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                          {asset?.asset_url ? (
                            <img src={asset.asset_url} alt={cat.en} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">{cat.icon}</span>
                          )}
                        </div>
                        <p className="text-xs text-center font-medium">{language === "hi" ? cat.hi : cat.en}</p>
                        <label className="cursor-pointer">
                          <div className="flex items-center gap-1 text-xs text-primary">
                            {uploadingAsset === `cat_${cat.id}` ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Upload className="w-3 h-3" />
                            )}
                            {language === "hi" ? "बदलें" : "Change"}
                          </div>
                          <input type="file" accept="image/*" className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleAssetUpload(`cat_${cat.id}`, file);
                            }} />
                        </label>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Splash Logo */}
              <h3 className="font-semibold mt-6">{language === "hi" ? "स्प्लैश लोगो बदलें" : "Change Splash Logo"}</h3>
              <Card className="p-4 shadow-card">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center overflow-hidden">
                    {appAssets.find(a => a.asset_key === "splash_logo")?.asset_url &&
                    appAssets.find(a => a.asset_key === "splash_logo")?.asset_url !== "default" ? (
                      <img src={appAssets.find(a => a.asset_key === "splash_logo")!.asset_url!} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🏠</span>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        {uploadingAsset === "splash_logo" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                        {language === "hi" ? "लोगो बदलें" : "Change Logo"}
                      </span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAssetUpload("splash_logo", file);
                      }} />
                  </label>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
