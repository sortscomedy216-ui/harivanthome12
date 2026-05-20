import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation as useAppLocation } from "@/contexts/LocationContext";
import { useProviders, ProviderWithDistance } from "@/hooks/useProviders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Star,
  Phone,
  MapPin,
  SlidersHorizontal,
  Navigation,
  Loader2,
} from "lucide-react";
import { getCategoryById, getCategoryName, getCategoryIcon } from "@/config/categories";
import ProviderMiniMap from "@/components/ProviderMiniMap";

const ProvidersListPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { coordinates, isLoadingLocation, requestLocation, locationError } = useAppLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const { data: allProviders = [], isLoading } = useProviders(category);

  const categoryInfo = category ? getCategoryById(category) : null;

  // Filter and sort providers
  const filteredProviders = allProviders
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((p) => !showAvailableOnly || p.available)
    .sort((a, b) => {
      if (sortBy === "distance") {
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;
        return Number(b.rating) - Number(a.rating);
      }
      if (sortBy === "rating") return Number(b.rating) - Number(a.rating);
      if (sortBy === "experience") return b.experience - a.experience;
      if (sortBy === "reviews") return b.review_count - a.review_count;
      return 0;
    });

  const formatDistance = (distance: number | null): string => {
    if (distance === null) return "";
    if (distance < 1) return `${Math.round(distance * 1000)} m`;
    return `${distance.toFixed(1)} km`;
  };

  const handleProviderClick = (providerId: string) => {
    navigate(`/provider/${providerId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary px-4 pt-4 pb-6 safe-top">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center text-xl">
              {categoryInfo?.icon || "🔍"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">
                {categoryInfo ? (language === "hi" ? categoryInfo.hi : categoryInfo.en) : category}
              </h1>
              <p className="text-sm text-primary-foreground/80">
                {filteredProviders.length} {language === "hi" ? "सेवा प्रदाता" : "providers"} {t("home.nearYou").toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={language === "hi" ? "नाम से खोजें..." : "Search by name..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-background border-0 rounded-xl"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-border overflow-x-auto">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-auto min-w-[120px] h-9">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">{language === "hi" ? "दूरी" : "Distance"}</SelectItem>
            <SelectItem value="rating">{language === "hi" ? "रेटिंग" : "Rating"}</SelectItem>
            <SelectItem value="experience">{language === "hi" ? "अनुभव" : "Experience"}</SelectItem>
            <SelectItem value="reviews">{language === "hi" ? "रिव्यू" : "Reviews"}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showAvailableOnly ? "default" : "outline"}
          size="sm"
          className="whitespace-nowrap"
          onClick={() => setShowAvailableOnly(!showAvailableOnly)}
        >
          {language === "hi" ? "उपलब्ध" : "Available"}
        </Button>

        <Button
          variant={coordinates ? "outline" : "default"}
          size="sm"
          className="whitespace-nowrap"
          onClick={requestLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 mr-1" />
          )}
          {coordinates
            ? (language === "hi" ? "लोकेशन ✓" : "Location ✓")
            : (language === "hi" ? "लोकेशन" : "Location")}
        </Button>
      </div>

      {/* Location Error */}
      {locationError && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm">
          {locationError}
        </div>
      )}

      {/* Providers List */}
      <div className="px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">{categoryInfo?.icon || "🔍"}</div>
            <p className="text-muted-foreground">
              {language === "hi" ? "कोई सेवा प्रदाता नहीं मिला" : "No providers found"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "hi" ? "जल्द ही उपलब्ध होंगे!" : "Coming soon!"}
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
              <Card
                className="p-4 shadow-card cursor-pointer hover:shadow-elevated transition-all"
                onClick={() => handleProviderClick(provider.id)}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center text-4xl shrink-0">
                    {provider.photo_url ? (
                      <img src={provider.photo_url} alt={provider.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{provider.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {provider.distance !== null && (
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <Navigation className="w-3 h-3" />
                              {formatDistance(provider.distance)}
                            </span>
                          )}
                          {provider.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {provider.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                          provider.available
                            ? "bg-secondary/10 text-secondary"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {provider.available ? t("provider.available") : t("provider.unavailable")}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="text-sm font-medium">{Number(provider.rating).toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">
                          ({provider.review_count})
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {provider.experience} {t("provider.years")}
                      </span>
                    </div>

                    <div className="flex items-center justify-end mt-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${provider.phone}`;
                          }}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          {t("provider.call")}
                        </Button>
                        <Button size="sm" className="h-8">
                          {t("provider.book")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProvidersListPage;
