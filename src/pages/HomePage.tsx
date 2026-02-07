import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation as useAppLocation, cities } from "@/contexts/LocationContext";
import { useProviders } from "@/hooks/useProviders";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  Wrench,
  Star,
  ChevronRight,
  Home as HomeIcon,
  User,
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type ServiceCategory = Database["public"]["Enums"]["service_category"];

interface CategoryInfo {
  id: ServiceCategory;
  nameKey: string;
  icon: string;
  color: string;
  bgColor: string;
}

const categories: CategoryInfo[] = [
  { id: "plumber", nameKey: "category.plumber", icon: "🔧", color: "text-blue-600", bgColor: "bg-blue-100" },
  { id: "electrician", nameKey: "category.electrician", icon: "⚡", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  { id: "carpenter", nameKey: "category.carpenter", icon: "🪚", color: "text-amber-700", bgColor: "bg-amber-100" },
  { id: "painter", nameKey: "category.painter", icon: "🎨", color: "text-pink-600", bgColor: "bg-pink-100" },
  { id: "cleaner", nameKey: "category.cleaner", icon: "✨", color: "text-green-600", bgColor: "bg-green-100" },
  { id: "acRepair", nameKey: "category.acRepair", icon: "❄️", color: "text-cyan-600", bgColor: "bg-cyan-100" },
  { id: "pestControl", nameKey: "category.pestControl", icon: "🐛", color: "text-red-600", bgColor: "bg-red-100" },
  { id: "appliance", nameKey: "category.appliance", icon: "📺", color: "text-purple-600", bgColor: "bg-purple-100" },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { city } = useAppLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

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

  const { data: providers = [], isLoading } = useProviders();

  const currentCity = cities.find((c) => c.id === city);

  const handleCategoryClick = (categoryId: ServiceCategory) => {
    navigate(`/providers/${categoryId}`);
  };

  const handleProviderClick = (providerId: string) => {
    navigate(`/provider/${providerId}`);
  };

  const filteredCategories = categories.filter((cat) =>
    t(cat.nameKey).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topProviders = providers.slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-primary px-4 pt-6 pb-8 safe-top">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 
              className="text-2xl font-bold text-primary-foreground select-none cursor-default"
              onClick={handleTitleTap}
            >
              {t("app.name")}
            </h1>
            <div className="flex items-center gap-1 text-primary-foreground/80 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{currentCity ? (language === "hi" ? currentCity.name : currentCity.nameEn) : "Select City"}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate("/register-provider")}
          >
            <User className="w-6 h-6" />
          </Button>
        </div>

        {/* Search Bar */}
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
          </div>

          <div className="grid grid-cols-4 gap-3">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${category.bgColor} flex items-center justify-center text-2xl mb-2 transition-transform hover:scale-110`}
                >
                  {category.icon}
                </div>
                <span className="text-xs text-center font-medium text-foreground line-clamp-1">
                  {t(category.nameKey)}
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
            {providers.length > 5 && (
              <Button variant="ghost" size="sm" className="text-primary">
                {t("home.viewAll")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
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
                <p className="text-sm text-muted-foreground mt-1">
                  {language === "hi" ? "जल्द ही उपलब्ध होंगे!" : "Coming soon!"}
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
                        {categories.find((c) => c.id === provider.category)?.icon || "👤"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{provider.name}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              provider.available
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {provider.available ? t("provider.available") : t("provider.unavailable")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {t(`category.${provider.category}`)}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-medium">{Number(provider.rating).toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">
                              ({provider.review_count})
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {provider.experience} {t("provider.years")} {t("provider.experience")}
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

        {/* Become Provider CTA */}
        <Card className="p-4 gradient-primary shadow-elevated">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Wrench className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary-foreground">
                {t("register.title")}
              </h3>
              <p className="text-sm text-primary-foreground/80">
                {language === "hi" ? "अपनी सेवाएं देकर कमाई करें" : "Earn by providing your services"}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/register-provider")}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom">
        <div className="flex items-center justify-around py-2">
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-primary">
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs">{t("nav.home")}</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center gap-1 h-auto py-2 text-muted-foreground" 
            onClick={() => navigate(user ? "/register-provider" : "/auth")}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">{t("nav.profile")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
