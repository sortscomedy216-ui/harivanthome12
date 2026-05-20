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
  const { user, profileComplete, profileChecked, loading } = useAuth();
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

  // Redirect to profile setup only after DB has been checked AND profile is incomplete
  useEffect(() => {
    if (!loading && user && profileChecked && !profileComplete) {
      navigate("/setup-profile", { replace: true });
    }
  }, [loading, user, profileChecked, profileComplete, navigate]);

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

        {/* Top Providers - hidden when none found */}
        {(isLoading || topProviders.length > 0) && (
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
        )}



        {/* Contact Support Section */}
        <Card className="p-4 shadow-card mb-4 border border-border/60">
          <p className="text-sm text-center text-foreground font-medium leading-relaxed mb-4">
            {language === "hi"
              ? "अगर आपको ऐप में कोई परेशानी है तो कृपया इस ईमेल पर संदेश भेजें या हमें WhatsApp पर संदेश करें"
              : "If you have any issue with the app, please send a message to this email or message us on WhatsApp"}
          </p>
          <div className="flex items-center justify-center gap-6">
            <a
              href="mailto:vedoohelp01@gmail.com"
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Email</span>
            </a>
            <a
              href="https://wa.me/918469199175"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-green-600"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.434-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <span className="text-xs text-muted-foreground font-medium">WhatsApp</span>
            </a>
          </div>
        </Card>

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
