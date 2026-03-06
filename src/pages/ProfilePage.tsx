import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation as useAppLocation } from "@/contexts/LocationContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, MapPin, Clock, CheckCircle2, XCircle, Loader2, Home as HomeIcon, Plus, Trash2, Navigation } from "lucide-react";
import { toast } from "sonner";
import { getCategoryName } from "@/config/categories";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { city } = useAppLocation();
  const queryClient = useQueryClient();
  const userName = localStorage.getItem("harivant-username") || "";
  const userPhone = localStorage.getItem("harivant-phone") || "";
  const gpsVillage = localStorage.getItem("harivant-gps-village") || "";
  const gpsAddress = localStorage.getItem("harivant-gps-address") || "";
  const district = localStorage.getItem("harivant-district") || "";
  const state = localStorage.getItem("harivant-state") || "";
  const pincode = localStorage.getItem("harivant-pincode") || "";

  // Check if user has a provider profile by phone or name
  const { data: providerProfile, isLoading } = useQuery({
    queryKey: ["my-provider-profile", userName, userPhone],
    queryFn: async () => {
      if (!userName && !userPhone) return null;
      
      let query = supabase.from("service_providers").select("*");
      
      if (userPhone) {
        query = query.eq("phone", userPhone);
      } else {
        query = query.eq("name", userName);
      }
      
      const { data, error } = await query.limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!(userName || userPhone),
  });

  // Delete provider profile
  const deleteMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const { error } = await supabase
        .from("service_providers")
        .delete()
        .eq("id", providerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-provider-profile"] });
      toast.success(language === "hi" ? "प्रोफ़ाइल हटा दी गई" : "Profile deleted");
    },
    onError: () => {
      toast.error(language === "hi" ? "प्रोफ़ाइल हटाने में त्रुटि" : "Error deleting profile");
    },
  });

  const handleDeleteProfile = () => {
    if (!providerProfile) return;
    const confirmed = window.confirm(
      language === "hi" 
        ? "क्या आप वाकई अपनी सेवा प्रदाता प्रोफ़ाइल हटाना चाहते हैं?" 
        : "Are you sure you want to delete your service provider profile?"
    );
    if (confirmed) {
      deleteMutation.mutate(providerProfile.id);
    }
  };

  const statusConfig = {
    pending: {
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      label: language === "hi" ? "अनुमोदन के लिए लंबित" : "Pending Approval",
      color: "bg-amber-50 border-amber-200 text-amber-800",
    },
    approved: {
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
      label: language === "hi" ? "अनुमोदित ✓" : "Approved ✓",
      color: "bg-green-50 border-green-200 text-green-800",
    },
    rejected: {
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      label: language === "hi" ? "अस्वीकृत" : "Rejected",
      color: "bg-red-50 border-red-200 text-red-800",
    },
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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
          <h1 className="text-xl font-bold text-primary-foreground">
            {language === "hi" ? "प्रोफ़ाइल" : "Profile"}
          </h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* User Info */}
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{userName || (language === "hi" ? "उपयोगकर्ता" : "User")}</h2>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{city || (language === "hi" ? "लोकेशन सेट नहीं" : "Location not set")}</span>
              </div>
              {gpsVillage && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Navigation className="w-3 h-3" />
                  <span>{gpsVillage}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Location details */}
          {(district || state || pincode) && (
            <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs">
              {district && (
                <div>
                  <span className="text-muted-foreground">{language === "hi" ? "जिला:" : "District:"}</span>
                  <p className="font-medium">{district}</p>
                </div>
              )}
              {state && (
                <div>
                  <span className="text-muted-foreground">{language === "hi" ? "राज्य:" : "State:"}</span>
                  <p className="font-medium">{state}</p>
                </div>
              )}
              {pincode && (
                <div>
                  <span className="text-muted-foreground">{language === "hi" ? "पिनकोड:" : "Pincode:"}</span>
                  <p className="font-medium">{pincode}</p>
                </div>
              )}
              {gpsAddress && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">{language === "hi" ? "GPS:" : "GPS:"}</span>
                  <p className="font-medium">{gpsAddress}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Provider Profile Status */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : providerProfile ? (
          <Card className="p-4 shadow-card">
            <h3 className="font-semibold mb-3">
              {language === "hi" ? "सेवा प्रदाता प्रोफ़ाइल" : "Service Provider Profile"}
            </h3>
            
            <div className={`p-3 rounded-lg border ${statusConfig[providerProfile.status as keyof typeof statusConfig]?.color || statusConfig.pending.color}`}>
              <div className="flex items-center gap-3">
                {statusConfig[providerProfile.status as keyof typeof statusConfig]?.icon || statusConfig.pending.icon}
                <div>
                  <p className="font-medium">
                    {statusConfig[providerProfile.status as keyof typeof statusConfig]?.label || statusConfig.pending.label}
                  </p>
                  {providerProfile.status === "pending" && (
                    <p className="text-xs mt-1">
                      {language === "hi" ? "एडमिन जल्द ही आपकी प्रोफ़ाइल की समीक्षा करेगा" : "Admin will review your profile soon"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{language === "hi" ? "सेवा" : "Service"}</span>
                <span className="font-medium capitalize">{getCategoryName(providerProfile.category, language)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{language === "hi" ? "अनुभव" : "Experience"}</span>
                <span className="font-medium">{providerProfile.experience} {language === "hi" ? "वर्ष" : "years"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{language === "hi" ? "फ़ोन" : "Phone"}</span>
                <span className="font-medium">{providerProfile.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{language === "hi" ? "शहर" : "City"}</span>
                <span className="font-medium">{providerProfile.city}</span>
              </div>
            </div>

            {/* Delete Profile Button */}
            <Button
              variant="destructive"
              size="sm"
              className="w-full mt-4"
              onClick={handleDeleteProfile}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {language === "hi" ? "प्रोफ़ाइल हटाएं" : "Delete Profile"}
            </Button>
          </Card>
        ) : (
          <Card className="p-6 text-center shadow-card">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              {language === "hi" 
                ? "आपने अभी तक सेवा प्रदाता प्रोफ़ाइल नहीं बनाई है"
                : "You haven't created a service provider profile yet"}
            </p>
            <Button onClick={() => navigate("/register-provider")} className="gradient-primary">
              {language === "hi" ? "अभी प्रोफ़ाइल बनाएं" : "Create Profile Now"}
            </Button>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom">
        <div className="flex items-center justify-around py-2">
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2 text-muted-foreground"
            onClick={() => navigate("/home")}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs">{language === "hi" ? "होम" : "Home"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full gradient-primary text-primary-foreground shadow-elevated"
            onClick={() => navigate("/register-provider")}
          >
            <Plus className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2 text-primary"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">{language === "hi" ? "प्रोफ़ाइल" : "Profile"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
