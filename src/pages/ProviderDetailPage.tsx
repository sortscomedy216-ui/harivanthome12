import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Star,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  MessageSquare,
  Share2,
  Heart,
  Shield,
} from "lucide-react";

// Mock provider data
const mockProviderDetails = {
  "1": {
    id: "1",
    name: "राजेश कुमार",
    category: "plumber",
    rating: 4.8,
    reviews: 156,
    experience: 8,
    available: true,
    location: "राजौरी गार्डन, दिल्ली",
    phone: "+91 98765 43210",
    price: "₹300/hr",
    verified: true,
    skills: ["पाइप फिटिंग", "लीकेज रिपेयर", "बाथरूम फिटिंग", "वॉटर हीटर"],
    about: "8 साल के अनुभव के साथ प्रोफेशनल प्लंबर। सभी प्रकार की प्लंबिंग सेवाएं उपलब्ध।",
    recentReviews: [
      { id: "r1", name: "अंकित शर्मा", rating: 5, comment: "बहुत अच्छा काम किया। समय पर आए और जल्दी काम पूरा किया।", date: "2 दिन पहले" },
      { id: "r2", name: "प्रिया गुप्ता", rating: 4, comment: "अच्छी सर्विस। थोड़ा महंगा लेकिन काम quality का था।", date: "1 हफ्ता पहले" },
    ],
  },
};

const ProviderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [isFavorite, setIsFavorite] = useState(false);

  const provider = mockProviderDetails["1"]; // Using mock data

  const handleCall = () => {
    window.location.href = `tel:${provider.phone}`;
  };

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
            <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center text-5xl shrink-0">
              👤
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
                    {t(`category.${provider.category}`)}
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
                  <span className="font-semibold">{provider.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({provider.reviews} {language === "hi" ? "रिव्यू" : "reviews"})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{provider.experience}</div>
              <div className="text-xs text-muted-foreground">{t("provider.years")} {t("provider.experience")}</div>
            </div>
            <div className="text-center border-x border-border">
              <div className="text-2xl font-bold text-primary">{provider.reviews}</div>
              <div className="text-xs text-muted-foreground">{language === "hi" ? "रिव्यू" : "Reviews"}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{provider.price}</div>
              <div className="text-xs text-muted-foreground">{language === "hi" ? "प्रति घंटा" : "per hour"}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Location & Contact */}
      <div className="px-4 mt-4">
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === "hi" ? "लोकेशन" : "Location"}</p>
              <p className="font-medium">{provider.location}</p>
            </div>
          </div>
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
      <div className="px-4 mt-4">
        <Card className="p-4 shadow-card">
          <h3 className="font-semibold mb-2">{language === "hi" ? "परिचय" : "About"}</h3>
          <p className="text-muted-foreground text-sm">{provider.about}</p>
        </Card>
      </div>

      {/* Skills */}
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

      {/* Reviews */}
      <div className="px-4 mt-4">
        <Card className="p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{language === "hi" ? "हाल के रिव्यू" : "Recent Reviews"}</h3>
            <Button variant="ghost" size="sm" className="text-primary">
              {t("home.viewAll")}
            </Button>
          </div>
          <div className="space-y-4">
            {provider.recentReviews.map((review) => (
              <div key={review.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{review.name}</span>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
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
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

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
