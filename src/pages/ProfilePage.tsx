import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, User, MapPin, Clock, CheckCircle2, XCircle, Loader2,
  Home as HomeIcon, Plus, Trash2, Navigation, Lock, LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { getCategoryName } from "@/config/categories";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user profile from DB
  const { data: profile } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Fetch all provider profiles for this user (max 5)
  const { data: providerProfiles = [], isLoading } = useQuery({
    queryKey: ["my-provider-profiles", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const { error } = await supabase
        .from("service_providers")
        .delete()
        .eq("id", providerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-provider-profiles"] });
      toast.success(language === "hi" ? "प्रोफ़ाइल हटा दी गई" : "Profile deleted");
    },
    onError: () => {
      toast.error(language === "hi" ? "प्रोफ़ाइल हटाने में त्रुटि" : "Error deleting profile");
    },
  });

  const handleDeleteProfile = (providerId: string) => {
    const confirmed = window.confirm(
      language === "hi"
        ? "क्या आप वाकई यह सेवा प्रदाता प्रोफ़ाइल हटाना चाहते हैं?"
        : "Are you sure you want to delete this service provider profile?"
    );
    if (confirmed) deleteMutation.mutate(providerId);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/home", { replace: true });
  };

  const statusConfig = {
    pending: {
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      label: language === "hi" ? "लंबित" : "Pending",
      color: "bg-amber-50 border-amber-200 text-amber-800",
    },
    approved: {
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      label: language === "hi" ? "अनुमोदित ✓" : "Approved ✓",
      color: "bg-green-50 border-green-200 text-green-800",
    },
    rejected: {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      label: language === "hi" ? "अस्वीकृत" : "Rejected",
      color: "bg-red-50 border-red-200 text-red-800",
    },
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-primary px-4 pt-4 pb-6 safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/home")}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold text-primary-foreground">
              {language === "hi" ? "प्रोफ़ाइल" : "Profile"}
            </h1>
          </div>
          <Button variant="ghost" size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" />
            {language === "hi" ? "लॉगआउट" : "Logout"}
          </Button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* User Info Card */}
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {profile?.photo_url ? (
                <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{profile?.name || user?.user_metadata?.full_name || ""}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {profile?.village && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{profile.village}{profile.city ? `, ${profile.city}` : ""}</span>
                </div>
              )}
            </div>
          </div>

          {profile && (profile.district || profile.state || profile.pincode) && (
            <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs">
              {profile.district && (
                <div>
                  <span className="text-muted-foreground">{language === "hi" ? "जिला:" : "District:"}</span>
                  <p className="font-medium">{profile.district}</p>
                </div>
              )}
              {profile.state && (
                <div>
                  <span className="text-muted-foreground">{language === "hi" ? "राज्य:" : "State:"}</span>
                  <p className="font-medium">{profile.state}</p>
                </div>
              )}
              {profile.pincode && (
                <div>
                  <span className="text-muted-foreground">{language === "hi" ? "पिनकोड:" : "Pincode:"}</span>
                  <p className="font-medium">{profile.pincode}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Service Provider Profiles */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">
              {language === "hi" ? "सेवा प्रदाता प्रोफ़ाइल" : "Service Provider Profiles"}
            </h3>
            <span className="text-xs text-muted-foreground">
              {providerProfiles.length}/5
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : providerProfiles.length > 0 ? (
            <div className="space-y-3">
              {providerProfiles.map((provider) => (
                <Card key={provider.id} className="p-4 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {statusConfig[provider.status as keyof typeof statusConfig]?.icon}
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig[provider.status as keyof typeof statusConfig]?.color}`}>
                        {statusConfig[provider.status as keyof typeof statusConfig]?.label}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{language === "hi" ? "सेवा" : "Service"}</span>
                      <span className="font-medium">{getCategoryName(provider.category, language)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{language === "hi" ? "अनुभव" : "Experience"}</span>
                      <span className="font-medium">{provider.experience} {language === "hi" ? "वर्ष" : "years"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{language === "hi" ? "शहर" : "City"}</span>
                      <span className="font-medium">{provider.city}</span>
                    </div>
                  </div>
                  <Button
                    variant="destructive" size="sm" className="w-full mt-3"
                    onClick={() => handleDeleteProfile(provider.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    {language === "hi" ? "हटाएं" : "Delete"}
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center shadow-card">
              <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                {language === "hi"
                  ? "आपने अभी तक कोई सेवा प्रदाता प्रोफ़ाइल नहीं बनाई है"
                  : "You haven't created any service provider profile yet"}
              </p>
              <Button onClick={() => navigate("/register-provider")} className="gradient-primary">
                {language === "hi" ? "अभी बनाएं" : "Create Now"}
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom">
        <div className="flex items-center justify-around py-2">
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-muted-foreground"
            onClick={() => navigate("/home")}>
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs">{language === "hi" ? "होम" : "Home"}</span>
          </Button>
          <Button variant="ghost" size="icon"
            className="w-12 h-12 rounded-full gradient-primary text-primary-foreground shadow-elevated"
            onClick={() => navigate("/register-provider")}>
            <Plus className="w-6 h-6" />
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-primary">
            <User className="w-5 h-5" />
            <span className="text-xs">{language === "hi" ? "प्रोफ़ाइल" : "Profile"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
