import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation as useAppLocation } from "@/contexts/LocationContext";
import { useLiveProviders, isProviderLive } from "@/hooks/useLiveProviders";
import { formatDistance, formatEta } from "@/lib/routing";
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
  Radio,
} from "lucide-react";
import { getCategoryById } from "@/config/categories";
import ProviderMiniMap from "@/components/ProviderMiniMap";
import { useOfflineCategoryAssets } from "@/hooks/useOfflineAssets";

const ProvidersListPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { coordinates, isLoadingLocation, requestLocation, locationError } = useAppLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [onlineOnly, setOnlineOnly] = useState(false);

  const { providers: allProviders, isLoading } = useLiveProviders(category);
  const categoryInfo = category ? getCategoryById(category) : null;
  const categoryAssets = useOfflineCategoryAssets();
  const categoryIconUrl = category ? categoryAssets[category] : null;

  const filteredProviders = allProviders
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((p) => !onlineOnly || isProviderLive(p))
    .sort((a, b) => {
      if (sortBy === "rating") return Number(b.rating) - Number(a.rating);
      if (sortBy === "experience") return b.experience - a.experience;
      // default: keep hook's sort (live + nearest first)
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background px-4 pt-4 pb-4 safe-top border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-muted"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
              {categoryIconUrl && (
                <img src={categoryIconUrl} alt={categoryInfo?.en || ""} className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {categoryInfo ? (language === "hi" ? categoryInfo.hi : categoryInfo.en) : category}
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredProviders.length} {language === "hi" ? "सेवा प्रदाता" : "providers"}
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
            <SelectItem value="distance">{language === "hi" ? "नजदीकी पहले" : "Nearest first"}</SelectItem>
            <SelectItem value="rating">{language === "hi" ? "रेटिंग" : "Rating"}</SelectItem>
            <SelectItem value="experience">{language === "hi" ? "अनुभव" : "Experience"}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={onlineOnly ? "default" : "outline"}
          size="sm"
          className="whitespace-nowrap"
          onClick={() => setOnlineOnly(!onlineOnly)}
        >
          <Radio className="w-4 h-4 mr-1" />
          {language === "hi" ? "लाइव" : "Live"}
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
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            {categoryIconUrl ? (
              <img src={categoryIconUrl} alt="" className="w-16 h-16 rounded-2xl mx-auto mb-4 object-cover" />
            ) : (
              <div className="text-4xl mb-4">{categoryInfo?.icon || "🔍"}</div>
            )}
            <p className="text-muted-foreground">
              {language === "hi" ? "कोई सेवा प्रदाता नहीं मिला" : "No providers found"}
            </p>
          </div>
        ) : (
          filteredProviders.map((provider, index) => {
            const live = isProviderLive(provider);
            return (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.4) }}
              >
                <Card
                  className="p-4 shadow-card cursor-pointer hover:shadow-elevated transition-all"
                  onClick={() => navigate(`/provider/${provider.id}`)}
                >
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-xl bg-muted flex items-center justify-center text-4xl shrink-0">
                      {provider.photo_url ? (
                        <img src={provider.photo_url} alt={provider.name} className="w-full h-full object-cover rounded-xl" />
                      ) : "👤"}
                      {live && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg truncate">{provider.name}</h3>
                            {live && (
                              <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">LIVE</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                            {provider.distanceMeters != null ? (
                              <span className="flex items-center gap-1 text-primary font-medium">
                                <Navigation className="w-3 h-3" />
                                {formatDistance(provider.distanceMeters)}
                                {provider.etaSeconds != null && (
                                  <span className="text-muted-foreground font-normal">
                                    • {formatEta(provider.etaSeconds)}
                                  </span>
                                )}
                              </span>
                            ) : provider.location ? (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {provider.location}
                              </span>
                            ) : null}
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

                      <div className="flex items-center justify-end mt-3 gap-2">
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
                        {coordinates && provider.latitude && provider.longitude && (
                          <Button size="sm" className="h-8 gradient-primary" onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/track/${provider.id}`);
                          }}>
                            <Radio className="w-4 h-4 mr-1" />
                            {language === "hi" ? "लाइव ट्रैक" : "Track Live"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {coordinates && provider.latitude && provider.longitude && (
                    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                      <ProviderMiniMap
                        userLat={coordinates.latitude}
                        userLng={coordinates.longitude}
                        providerLat={Number(provider.latitude)}
                        providerLng={Number(provider.longitude)}
                        providerName={provider.name}
                      />
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProvidersListPage;
