import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProvider, useProviderReviews } from "@/hooks/useProviders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Star,
  Phone,
  MapPin,
  CheckCircle2,
  Share2,
  Heart,
} from "lucide-react";
import { useState } from "react";
import { getCategoryName } from "@/config/categories";

const ProviderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: provider, isLoading } = useProvider(id || "");
  const { data: reviews = [] } = useProviderReviews(id || "");

  const handleCall = () => {
    if (provider?.phone) {
      window.location.href = `tel:${provider.phone}`;
    }
  };

  if (isLoading) {
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

  if (!provider) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground">
          {language === "hi" ? "सेवा प्रदाता नहीं मिला" : "Provider not found"}
        </p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          {language === "hi" ? "वापस जाएं" : "Go Back"}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-4 pt-4 pb-20 safe-top relative">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`hover:bg-primary-foreground/10 ${isFavorite ? "text-red-400" : "text-primary-foreground"}`}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-4 -mt-16 relative z-10">
        <Card className="p-5 shadow-elevated">
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center text-5xl shrink-0 overflow-hidden">
              {provider.photo_url ? (
                <img src={provider.photo_url} alt={provider.name} className="w-full h-full object-cover" />
              ) : (
                "👤"
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">{provider.name}</h1>
                    {provider.verified && (
                      <CheckCircle2 className="w-5 h-5 text-primary fill-primary/20" />
                    )}
                  </div>
                  <p className="text-muted-foreground capitalize">
                    {getCategoryName(provider.category, language)}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    provider.available
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {provider.available ? t("provider.available") : t("provider.unavailable")}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="font-semibold">{Number(provider.rating).toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({provider.review_count} {language === "hi" ? "रिव्यू" : "reviews"})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{provider.experience}</div>
              <div className="text-xs text-muted-foreground">{t("provider.years")} {t("provider.experience")}</div>
            </div>
            <div className="text-center border-l border-border">
              <div className="text-2xl font-bold text-primary">{provider.review_count}</div>
              <div className="text-xs text-muted-foreground">{language === "hi" ? "रिव्यू" : "Reviews"}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Location & Contact */}
      <div className="px-4 mt-4">
        <Card className="p-4 shadow-card">
          {provider.location && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{language === "hi" ? "लोकेशन" : "Location"}</p>
                <p className="font-medium">{provider.location}, {provider.city}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === "hi" ? "फ़ोन" : "Phone"}</p>
              <p className="font-medium">{provider.phone}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* About */}
      {provider.about && (
        <div className="px-4 mt-4">
          <Card className="p-4 shadow-card">
            <h3 className="font-semibold mb-2">{language === "hi" ? "परिचय" : "About"}</h3>
            <p className="text-muted-foreground text-sm">{provider.about}</p>
          </Card>
        </div>
      )}

      {/* Skills */}
      {provider.skills && provider.skills.length > 0 && (
        <div className="px-4 mt-4">
          <Card className="p-4 shadow-card">
            <h3 className="font-semibold mb-3">{language === "hi" ? "कौशल" : "Skills"}</h3>
            <div className="flex flex-wrap gap-2">
              {provider.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="px-4 mt-4">
          <Card className="p-4 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{language === "hi" ? "रिव्यू" : "Reviews"}</h3>
            </div>
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review: any) => (
                <div key={review.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{review.profiles?.name || "User"}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={handleCall}
          >
            <Phone className="w-5 h-5 mr-2" />
            {t("provider.call")}
          </Button>
          <Button className="flex-1 h-12 gradient-primary">
            {t("provider.book")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailPage;
