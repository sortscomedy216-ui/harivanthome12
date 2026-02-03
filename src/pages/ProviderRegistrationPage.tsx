import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation as useAppLocation, cities } from "@/contexts/LocationContext";
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
import {
  ArrowLeft,
  Upload,
  User,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  CheckCircle2,
  Camera,
} from "lucide-react";
import { ServiceCategory } from "@/types";
import { toast } from "sonner";

const categories: { id: ServiceCategory; hi: string; en: string }[] = [
  { id: "plumber", hi: "प्लंबर", en: "Plumber" },
  { id: "electrician", hi: "इलेक्ट्रीशियन", en: "Electrician" },
  { id: "carpenter", hi: "कारपेंटर", en: "Carpenter" },
  { id: "painter", hi: "पेंटर", en: "Painter" },
  { id: "cleaner", hi: "सफाई कर्मचारी", en: "Cleaner" },
  { id: "acRepair", hi: "AC रिपेयर", en: "AC Repair" },
  { id: "pestControl", hi: "पेस्ट कंट्रोल", en: "Pest Control" },
  { id: "appliance", hi: "अप्लायंस रिपेयर", en: "Appliance Repair" },
];

const ProviderRegistrationPage = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { city } = useAppLocation();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    category: "",
    experience: "",
    location: "",
    city: city || "",
    about: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    
    if (!formData.name || !formData.phone || !formData.category || !formData.experience) {
      toast.error(language === "hi" ? "कृपया सभी आवश्यक फ़ील्ड भरें" : "Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast.success(language === "hi" ? "रजिस्ट्रेशन सफल!" : "Registration successful!");
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-green-600" />
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

        <Card className="p-4 bg-amber-50 border-amber-200 mb-6 w-full max-w-sm">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">{t("register.pending")}</p>
              <p className="text-sm text-amber-600">
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
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {language === "hi" ? cat.hi : cat.en}
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
        </Card>

        {/* Location Info */}
        <Card className="p-4 shadow-card space-y-4">
          <div>
            <Label htmlFor="city">{language === "hi" ? "शहर" : "City"} *</Label>
            <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
              <SelectTrigger className="mt-1.5">
                <MapPin className="w-5 h-5 mr-2 text-muted-foreground" />
                <SelectValue placeholder={language === "hi" ? "शहर चुनें" : "Select city"} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {language === "hi" ? c.name : c.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        {/* Submit Button */}
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
