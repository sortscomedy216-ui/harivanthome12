import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation as useAppLocation } from "@/contexts/LocationContext";
import { useProviders } from "@/hooks/useProviders";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search, MapPin, Star, ChevronRight, Home as HomeIcon, User, Plus, Settings, Navigation,
  Mail,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { allCategories, getCategoryIcon, getCategoryName } from "@/config/categories";
import LoginPrompt from "@/components/LoginPrompt";
import { useOfflineCategoryAssets } from "@/hooks/useOfflineAssets";

const APP_VERSION = "1.0.0";

const HomePage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { city } = useAppLocation();
  const { user, profileComplete, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginShownOnce, setLoginShownOnce] = useState(false);

  // Show login popup on first load if not logged in
  useEffect(() => {
    if (!loading && !user && !loginShownOnce) {
      const timer = setTimeout(() => {
        setShowLogin(true);
        setLoginShownOnce(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, user, loginShownOnce]);

  // Redirect to profile setup ONLY once if logged in but profile not complete
  useEffect(() => {
    if (!loading && user && !profileComplete) {
      const alreadyRedirected = sessionStorage.getItem("profile-setup-redirected");
      if (!alreadyRedirected) {
        sessionStorage.setItem("profile-setup-redirected", "true");
        navigate("/setup-profile", { replace: true });
      }
    }
    if (profileComplete) {
      sessionStorage.removeItem("profile-setup-redirected");
    }
  }, [loading, user, profileComplete, navigate]);

  const handleTitleTap = () => {
    const now = Date.now();
    if (now - lastTapTime > 3000) {
      setTapCount(1);
    } else {
      setTapCount((prev) => prev + 1);
    }
    setLastTapTime(now);
    if (tapCount + 1 >= 11) {
      setTapCount(0);
      navigate("/auth");
    }
  };

  const requireAuth = (action: () => void) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    action();
  };

  const { data: providers = [], isLoading } = useProviders();
  const categoryAssets = useOfflineCategoryAssets();

  const userName = localStorage.getItem("harivant-username") || user?.user_metadata?.full_name || "";
  const gpsVillage = localStorage.getItem("harivant-gps-village") || "";

  const handleCategoryClick = (categoryId: string) => {
    requireAuth(() => navigate(`/providers/${categoryId}`));
  };

  const handleProviderClick = (providerId: string) => {
    navigate(`/provider/${providerId}`);
  };

  const filteredCategories = allCategories.filter((cat) => {
    const name = language === "hi" ? cat.hi : cat.en;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const displayCategories = showAllCategories ? filteredCategories : filteredCategories.slice(0, 12);
  const topProviders = providers.slice(0, 5);

  const formatDistance = (distance: number | null): string => {
    if (distance === null) return "";
    if (distance < 1) return `${Math.round(distance * 1000)} m`;
    return `${distance.toFixed(1)} km`;
  };

  return (
    <div className="min-h-screen bg-background pb-20 select-none">
      {/* Header */}
      <div className="gradient-primary px-4 pt-6 pb-8 safe-top">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              className="text-2xl font-bold text-primary-foreground cursor-default"
              onClick={handleTitleTap}
            >
              {t("app.name")}
            </h1>
            <div className="flex items-center gap-1 text-primary-foreground/80 text-sm">
              <MapPin className="w-4 h-4" />
              <span>
                {userName ? `${userName}` : ""}
                {gpsVillage ? ` • ${gpsVillage}` : city ? ` • ${city}` : ""}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Settings className="w-6 h-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/about")}>
                {language === "hi" ? "हमारे बारे में" : "About"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={t("home.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-background border-0 rounded-xl shadow-card"
          />
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Categories Grid */}
        <Card className="p-4 shadow-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">{t("home.categories")}</h2>
            <Button
              variant="ghost" size="sm" className="text-primary text-xs"
              onClick={() => setShowAllCategories(!showAllCategories)}
            >
              {showAllCategories
                ? (language === "hi" ? "कम दिखाएं" : "Show Less")
                : (language === "hi" ? "सभी देखें" : "View All")}
              <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showAllCategories ? "rotate-90" : ""}`} />
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {displayCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-2 transition-transform hover:scale-110 overflow-hidden">
                  {categoryAssets[category.id] ? (
                    <img src={categoryAssets[category.id]} alt={category.en} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{category.icon}</span>
                  )}
                </div>
                <span className="text-xs text-center font-medium text-foreground line-clamp-2 leading-tight">
                  {language === "hi" ? category.hi : category.en}
                </span>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Top Providers */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-lg">{t("home.topProviders")}</h2>
              <p className="text-sm text-muted-foreground">{t("home.nearYou")}</p>
            </div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                />
              </div>
            ) : topProviders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {language === "hi" ? "कोई सेवा प्रदाता नहीं मिला" : "No service providers found"}
                </p>
              </div>
            ) : (
              topProviders.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="p-4 shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
                    onClick={() => handleProviderClick(provider.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl">
                        {getCategoryIcon(provider.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{provider.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            provider.available
                              ? "bg-secondary/10 text-secondary"
                              : "bg-destructive/10 text-destructive"
                          }`}>
                            {provider.available ? t("provider.available") : t("provider.unavailable")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {getCategoryName(provider.category, language)}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-accent fill-accent" />
                            <span className="text-sm font-medium">{Number(provider.rating).toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({provider.review_count})</span>
                          </div>
                          {provider.distance !== null && (
                            <span className="flex items-center gap-1 text-xs text-primary font-medium">
                              <Navigation className="w-3 h-3" />
                              {formatDistance(provider.distance)}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {provider.experience} {t("provider.years")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? "हरिवंत" : "Harivant"} v{APP_VERSION}
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom">
        <div className="flex items-center justify-around py-2">
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-primary">
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs">{t("nav.home")}</span>
          </Button>
          <Button
            variant="ghost" size="icon"
            className="w-12 h-12 rounded-full gradient-primary text-primary-foreground shadow-elevated"
            onClick={() => requireAuth(() => navigate("/register-provider"))}
          >
            <Plus className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2 text-muted-foreground"
            onClick={() => requireAuth(() => navigate("/profile"))}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">{t("nav.profile")}</span>
          </Button>
        </div>
      </div>

      <LoginPrompt open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
};

export default HomePage;
