import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation as useAppLocation } from "@/contexts/LocationContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LocationSearchInput from "@/components/LocationSearchInput";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  CheckCircle2,
  Camera,
  LogIn,
  Navigation,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { allCategories } from "@/config/categories";

const ProviderRegistrationPage = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { city, coordinates, requestLocation, isLoadingLocation } = useAppLocation();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    category: "",
    experience: "",
    location: "",
    city: city || "",
    about: "",
    price_per_hour: "",
    latitude: coordinates?.latitude || null as number | null,
    longitude: coordinates?.longitude || null as number | null,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCaptureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          toast.success(language === "hi" ? "लोकेशन प्राप्त हुआ!" : "Location captured!");
        },
        () => {
          toast.error(language === "hi" ? "लोकेशन प्राप्त करने में त्रुटि" : "Error getting location");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.category || !formData.experience || !formData.city) {
      toast.error(language === "hi" ? "कृपया सभी आवश्यक फ़ील्ड भरें" : "Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("service_providers")
        .insert({
          user_id: user?.id || null,
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          category: formData.category as any,
          experience: parseInt(formData.experience) || 0,
          location: formData.location || null,
          city: formData.city,
          about: formData.about || null,
          price_per_hour: parseInt(formData.price_per_hour) || 0,
          status: "pending",
          latitude: formData.latitude,
          longitude: formData.longitude,
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success(language === "hi" ? "रजिस्ट्रेशन सफल!" : "Registration successful!");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || (language === "hi" ? "त्रुटि हुई" : "An error occurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-secondary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-center mb-2"
        >
          {language === "hi" ? "रजिस्ट्रेशन सफल!" : "Registration Successful!"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center mb-8"
        >
          {language === "hi"
            ? "आपका अनुरोध अनुमोदन के लिए भेज दिया गया है। कृपया प्रतीक्षा करें।"
            : "Your request has been sent for approval. Please wait."}
        </motion.p>

        <Card className="p-4 bg-accent/10 border-accent/20 mb-6 w-full max-w-sm">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-accent" />
            <div>
              <p className="font-medium text-accent">{t("register.pending")}</p>
              <p className="text-sm text-muted-foreground">
                {language === "hi" ? "24-48 घंटे में अपडेट मिलेगा" : "Update within 24-48 hours"}
              </p>
            </div>
          </div>
        </Card>

        <Button onClick={() => navigate("/home")} className="gradient-primary">
          {language === "hi" ? "होम पर जाएं" : "Go to Home"}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="gradient-primary px-4 pt-4 pb-6 safe-top">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">
              {t("register.title")}
            </h1>
            <p className="text-sm text-primary-foreground/80">
              {language === "hi" ? "अपनी जानकारी भरें" : "Fill your details"}
            </p>
          </div>
        </div>
      </div>

      {/* Login prompt */}
      {!user && (
        <div className="px-4 pt-4">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <LogIn className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm">
                  {language === "hi"
                    ? "लॉगिन करें अपने अनुरोध को ट्रैक करने के लिए"
                    : "Login to track your application"}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate("/auth")}>
                {t("auth.login")}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        {/* Photo Upload */}
        <Card className="p-4 shadow-card">
          <Label className="block mb-3">{t("register.photo")}</Label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer">
                <Camera className="w-4 h-4 text-primary-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {language === "hi"
                  ? "अपनी एक साफ़ फ़ोटो अपलोड करें"
                  : "Upload a clear photo of yourself"}
              </p>
            </div>
          </div>
        </Card>

        {/* Personal Info */}
        <Card className="p-4 shadow-card space-y-4">
          <div>
            <Label htmlFor="name">{t("register.name")} *</Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="name"
                placeholder={language === "hi" ? "अपना पूरा नाम लिखें" : "Enter your full name"}
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">{t("register.phone")} *</Label>
            <div className="relative mt-1.5">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="mt-1.5"
            />
          </div>
        </Card>

        {/* Professional Info */}
        <Card className="p-4 shadow-card space-y-4">
          <div>
            <Label htmlFor="category">{t("register.skill")} *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger className="mt-1.5">
                <Briefcase className="w-5 h-5 mr-2 text-muted-foreground" />
                <SelectValue placeholder={language === "hi" ? "सेवा चुनें" : "Select service"} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {allCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {language === "hi" ? cat.hi : cat.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="experience">{t("register.experience")} *</Label>
            <div className="relative mt-1.5">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="5"
                value={formData.experience}
                onChange={(e) => handleInputChange("experience", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="price">{language === "hi" ? "प्रति घंटा शुल्क (₹)" : "Hourly Rate (₹)"}</Label>
            <Input
              id="price"
              type="number"
              min="0"
              placeholder="300"
              value={formData.price_per_hour}
              onChange={(e) => handleInputChange("price_per_hour", e.target.value)}
              className="mt-1.5"
            />
          </div>
        </Card>

        {/* Location Info */}
        <Card className="p-4 shadow-card space-y-4">
          <div>
            <Label htmlFor="city">{language === "hi" ? "शहर / जिला / तालुका" : "City / District / Taluka"} *</Label>
            <div className="mt-1.5">
              <LocationSearchInput
                value={formData.city}
                onChange={(cityValue, details) => {
                  setFormData((prev) => ({
                    ...prev,
                    city: cityValue,
                    latitude: details?.lat ?? prev.latitude,
                    longitude: details?.lon ?? prev.longitude,
                  }));
                }}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">{t("register.location")}</Label>
            <div className="relative mt-1.5">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="location"
                placeholder={language === "hi" ? "जैसे: राजौरी गार्डन, सेक्टर 12" : "e.g., Rajouri Garden, Sector 12"}
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* GPS Location */}
          <div>
            <Label>{language === "hi" ? "GPS लोकेशन" : "GPS Location"}</Label>
            <div className="mt-1.5">
              <Button
                type="button"
                variant={formData.latitude ? "outline" : "default"}
                className="w-full"
                onClick={handleCaptureLocation}
              >
                {isLoadingLocation ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4 mr-2" />
                )}
                {formData.latitude
                  ? (language === "hi" ? "लोकेशन प्राप्त ✓" : "Location Captured ✓")
                  : (language === "hi" ? "मेरी लोकेशन लें" : "Get My Location")}
              </Button>
              {formData.latitude && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {language === "hi"
                    ? "आपकी लोकेशन सेव हो गई है।"
                    : "Your location is saved."}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* About */}
        <Card className="p-4 shadow-card">
          <Label htmlFor="about">{language === "hi" ? "अपने बारे में" : "About yourself"}</Label>
          <Textarea
            id="about"
            placeholder={language === "hi"
              ? "अपने अनुभव और कौशल के बारे में लिखें..."
              : "Write about your experience and skills..."}
            value={formData.about}
            onChange={(e) => handleInputChange("about", e.target.value)}
            className="mt-1.5 min-h-[100px]"
          />
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-12 text-lg gradient-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
            />
          ) : (
            t("register.submit")
          )}
        </Button>
      </form>
    </div>
  );
};

export default ProviderRegistrationPage;
