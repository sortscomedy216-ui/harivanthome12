import { useState, useCallback } from "react";
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
  Mail,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { allCategories } from "@/config/categories";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
  "Chandigarh", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep"
];

interface PincodeResult {
  district: string;
  taluka: string;
  area: string;
}

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
    village: "",
    about: "",
    latitude: coordinates?.latitude || null as number | null,
    longitude: coordinates?.longitude || null as number | null,
  });

  // Location fields
  const [selectedState, setSelectedState] = useState(localStorage.getItem("harivant-state") || "");
  const [pincode, setPincode] = useState("");
  const [pincodeDistrict, setPincodeDistrict] = useState("");
  const [pincodeTaluka, setPincodeTaluka] = useState("");
  const [pincodeCity, setPincodeCity] = useState("");
  const [isPincodeLooking, setIsPincodeLooking] = useState(false);
  const [pincodeResults, setPincodeResults] = useState<PincodeResult[]>([]);
  const [selectedPincodeResult, setSelectedPincodeResult] = useState<PincodeResult | null>(null);

  // GPS
  const [gpsDetected, setGpsDetected] = useState(false);
  const [gpsAddress, setGpsAddress] = useState("");
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Phone validation
  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, "");
    // Indian mobile: 10 digits starting with 6-9
    if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
      setPhoneError("");
      return true;
    }
    // With +91
    if (cleaned.length === 12 && /^91[6-9]\d{9}$/.test(cleaned)) {
      setPhoneError("");
      return true;
    }
    setPhoneError(language === "hi" ? "सही मोबाइल नंबर डालें (10 अंक)" : "Enter valid mobile number (10 digits)");
    return false;
  };

  // Email validation
  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError("");
      return true; // optional
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      setEmailError("");
      return true;
    }
    setEmailError(language === "hi" ? "सही ईमेल एड्रेस डालें" : "Enter valid email address");
    return false;
  };

  // Pincode lookup
  const lookupPincode = useCallback(async (code: string) => {
    if (code.length !== 6) {
      setPincodeResults([]);
      setPincodeDistrict("");
      setPincodeTaluka("");
      setPincodeCity("");
      return;
    }
    setIsPincodeLooking(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${code}`);
      const data = await res.json();
      
      if (data?.[0]?.Status === "Success" && data[0].PostOffice) {
        const offices = data[0].PostOffice;
        const results: PincodeResult[] = offices.slice(0, 5).map((po: any) => ({
          district: po.District || "",
          taluka: po.Block || po.Division || "",
          area: po.Name || "",
        }));
        const unique = results.filter(
          (v, i, a) => a.findIndex((t) => t.district === v.district && t.taluka === v.taluka && t.area === v.area) === i
        );
        setPincodeResults(unique);
        
        // Auto-fill first result
        if (unique.length > 0) {
          setPincodeDistrict(unique[0].district);
          setPincodeTaluka(unique[0].taluka);
          setPincodeCity(unique[0].area);
          setSelectedPincodeResult(unique[0]);
        }
      } else {
        setPincodeResults([]);
        setPincodeDistrict("");
        setPincodeTaluka("");
        setPincodeCity("");
      }
    } catch {
      setPincodeResults([]);
    } finally {
      setIsPincodeLooking(false);
    }
  }, []);

  const handlePincodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setPincode(cleaned);
    setSelectedPincodeResult(null);
    if (cleaned.length === 6) {
      lookupPincode(cleaned);
    } else {
      setPincodeResults([]);
      setPincodeDistrict("");
      setPincodeTaluka("");
      setPincodeCity("");
    }
  };

  const handleSelectPincodeResult = (result: PincodeResult) => {
    setSelectedPincodeResult(result);
    setPincodeDistrict(result.district);
    setPincodeTaluka(result.taluka);
    setPincodeCity(result.area);
  };

  // GPS detection
  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      toast.error(language === "hi" ? "GPS सपोर्ट नहीं है" : "GPS not supported");
      return;
    }
    setIsDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }));
        setGpsDetected(true);
        
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`,
            { headers: { "Accept-Language": "hi,en" } }
          );
          const data = await res.json();
          if (data.address) {
            const addr = data.address;
            const village = addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || "";
            const town = addr.town || addr.city || "";
            const road = addr.road || "";
            setGpsAddress([road, village, town].filter(Boolean).join(", ") || data.display_name?.split(",").slice(0, 3).join(", ") || "");
          }
        } catch {}
        
        setIsDetectingGPS(false);
        toast.success(language === "hi" ? "लोकेशन प्राप्त हुआ!" : "Location captured!");
      },
      () => {
        setIsDetectingGPS(false);
        toast.error(language === "hi" ? "लोकेशन प्राप्त करने में त्रुटि" : "Error getting location");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
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

    // Validate fields
    const isPhoneValid = validatePhone(formData.phone);
    const isEmailValid = validateEmail(formData.email);

    if (!formData.name.trim()) {
      toast.error(language === "hi" ? "नाम भरें" : "Enter name");
      return;
    }
    if (!isPhoneValid) {
      toast.error(language === "hi" ? "सही मोबाइल नंबर डालें" : "Enter valid phone number");
      return;
    }
    if (!isEmailValid) return;
    if (!formData.category) {
      toast.error(language === "hi" ? "सेवा श्रेणी चुनें" : "Select service category");
      return;
    }
    if (!formData.experience) {
      toast.error(language === "hi" ? "अनुभव भरें" : "Enter experience");
      return;
    }
    if (!pincodeCity && !pincodeDistrict) {
      toast.error(language === "hi" ? "पिनकोड डालकर शहर चुनें" : "Enter pincode to select city");
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      toast.error(language === "hi" ? "GPS लोकेशन दें" : "Share GPS location");
      return;
    }

    setIsSubmitting(true);

    try {
      const cityValue = pincodeCity || pincodeDistrict;
      const locationParts = [formData.village, pincodeTaluka, pincodeDistrict, selectedState].filter(Boolean);
      
      const { error } = await supabase
        .from("service_providers")
        .insert({
          user_id: user?.id || null,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          category: formData.category as any,
          experience: parseInt(formData.experience) || 0,
          location: locationParts.join(", ") || null,
          city: cityValue,
          about: formData.about.trim() || null,
          price_per_hour: 0,
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 select-none">
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
            ? "आपका अनुरोध अनुमोदन के लिए भेज दिया गया है।"
            : "Your request has been sent for approval."}
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
    <div className="min-h-screen bg-background pb-8 select-none">
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
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {language === "hi" ? "अपनी एक साफ़ फ़ोटो अपलोड करें" : "Upload a clear photo of yourself"}
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
                inputMode="numeric"
                placeholder="98765 43210"
                value={formData.phone}
                onChange={(e) => {
                  handleInputChange("phone", e.target.value);
                  if (phoneError) validatePhone(e.target.value);
                }}
                onBlur={() => formData.phone && validatePhone(formData.phone)}
                className={`pl-10 ${phoneError ? "border-destructive" : ""}`}
                required
              />
            </div>
            {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
          </div>

          <div>
            <Label htmlFor="email">
              <Mail className="w-4 h-4 inline mr-1" />
              {t("auth.email")} ({language === "hi" ? "वैकल्पिक" : "optional"})
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => {
                handleInputChange("email", e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={() => formData.email && validateEmail(formData.email)}
              className={`mt-1.5 ${emailError ? "border-destructive" : ""}`}
            />
            {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
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
        </Card>

        {/* Location Info - Separate fields */}
        <Card className="p-4 shadow-card space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {language === "hi" ? "लोकेशन जानकारी" : "Location Details"}
          </h3>

          {/* Pincode */}
          <div>
            <Label>{language === "hi" ? "पिनकोड" : "Pincode"} *</Label>
            <Input
              value={pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              placeholder={language === "hi" ? "6 अंक का पिनकोड" : "6-digit pincode"}
              type="tel"
              inputMode="numeric"
              maxLength={6}
              className="mt-1.5"
            />
            {isPincodeLooking && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                {language === "hi" ? "खोज रहे हैं..." : "Looking up..."}
              </div>
            )}

            {pincodeResults.length > 1 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">{language === "hi" ? "चुनें:" : "Select:"}</p>
                {pincodeResults.map((result, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPincodeResult(result)}
                    className={`w-full text-left p-2 rounded-lg border text-sm transition-all ${
                      selectedPincodeResult === result
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {result.area} • {result.taluka} • {result.district}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* City (auto-filled) */}
          <div>
            <Label>{language === "hi" ? "शहर" : "City"}</Label>
            <Input
              value={pincodeCity}
              onChange={(e) => setPincodeCity(e.target.value)}
              placeholder={language === "hi" ? "पिनकोड से अपने आप भरेगा" : "Auto-fills from pincode"}
              className="mt-1.5"
            />
          </div>

          {/* Taluka (auto-filled) */}
          <div>
            <Label>{language === "hi" ? "तालुका" : "Taluka"}</Label>
            <Input
              value={pincodeTaluka}
              onChange={(e) => setPincodeTaluka(e.target.value)}
              placeholder={language === "hi" ? "पिनकोड से अपने आप भरेगा" : "Auto-fills from pincode"}
              className="mt-1.5"
            />
          </div>

          {/* District (auto-filled) */}
          <div>
            <Label>{language === "hi" ? "जिला" : "District"}</Label>
            <Input
              value={pincodeDistrict}
              onChange={(e) => setPincodeDistrict(e.target.value)}
              placeholder={language === "hi" ? "पिनकोड से अपने आप भरेगा" : "Auto-fills from pincode"}
              className="mt-1.5"
            />
          </div>

          {/* State */}
          <div>
            <Label>{language === "hi" ? "राज्य" : "State"}</Label>
            <div className="relative mt-1.5">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none pr-10"
              >
                <option value="">{language === "hi" ? "-- राज्य चुनें --" : "-- Select State --"}</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Village/Area */}
          <div>
            <Label>{language === "hi" ? "गांव / मोहल्ला" : "Village / Area"}</Label>
            <Input
              value={formData.village}
              onChange={(e) => handleInputChange("village", e.target.value)}
              placeholder={language === "hi" ? "अपना गांव या मोहल्ला लिखें" : "Enter your village or area"}
              className="mt-1.5"
            />
          </div>

          {/* GPS Location */}
          <div>
            <Label>{language === "hi" ? "GPS लोकेशन" : "GPS Location"} *</Label>
            <div className="mt-1.5">
              <Button
                type="button"
                variant={gpsDetected ? "outline" : "default"}
                className="w-full"
                onClick={handleCaptureLocation}
                disabled={isDetectingGPS}
              >
                {isDetectingGPS ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4 mr-2" />
                )}
                {gpsDetected
                  ? (language === "hi" ? "📍 लोकेशन प्राप्त ✓" : "📍 Location Captured ✓")
                  : (language === "hi" ? "📍 अपनी लोकेशन पाएं" : "📍 Get My Location")}
              </Button>
              {gpsAddress && (
                <p className="text-xs text-primary mt-2 text-center font-medium">{gpsAddress}</p>
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
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            t("register.submit")
          )}
        </Button>
      </form>
    </div>
  );
};

export default ProviderRegistrationPage;
