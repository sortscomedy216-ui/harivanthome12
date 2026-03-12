import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, User, Phone, MapPin, Briefcase, Clock, CheckCircle2, Camera,
  Navigation, Loader2, Mail, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { allCategories } from "@/config/categories";
import { useQuery } from "@tanstack/react-query";

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

interface PincodeResult { district: string; taluka: string; area: string; }

const ProviderRegistrationPage = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { user } = useAuth();

  // Check existing provider count
  const { data: existingCount = 0 } = useQuery({
    queryKey: ["provider-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from("service_providers")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      return count || 0;
    },
    enabled: !!user,
  });

  // Get user profile for pre-fill
  const { data: profile } = useQuery({
    queryKey: ["user-profile-fill", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", category: "", experience: "", village: "", about: "",
    latitude: null as number | null, longitude: null as number | null,
  });

  const [selectedState, setSelectedState] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeDistrict, setPincodeDistrict] = useState("");
  const [pincodeTaluka, setPincodeTaluka] = useState("");
  const [pincodeCity, setPincodeCity] = useState("");
  const [isPincodeLooking, setIsPincodeLooking] = useState(false);
  const [pincodeResults, setPincodeResults] = useState<PincodeResult[]>([]);
  const [selectedPincodeResult, setSelectedPincodeResult] = useState<PincodeResult | null>(null);
  const [gpsDetected, setGpsDetected] = useState(false);
  const [gpsAddress, setGpsAddress] = useState("");
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Pre-fill from profile
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name,
        phone: profile.phone || prev.phone,
        village: profile.village || prev.village,
        latitude: profile.latitude ? Number(profile.latitude) : prev.latitude,
        longitude: profile.longitude ? Number(profile.longitude) : prev.longitude,
      }));
      if (profile.pincode) setPincode(profile.pincode);
      if (profile.district) setPincodeDistrict(profile.district);
      if (profile.taluka) setPincodeTaluka(profile.taluka);
      if (profile.city) setPincodeCity(profile.city);
      if (profile.state) setSelectedState(profile.state);
      if (profile.latitude && profile.longitude) {
        setGpsDetected(true);
      }
      if (profile.photo_url) setPhotoPreview(profile.photo_url);
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) { setPhoneError(""); return true; }
    if (cleaned.length === 12 && /^91[6-9]\d{9}$/.test(cleaned)) { setPhoneError(""); return true; }
    setPhoneError(language === "hi" ? "सही मोबाइल नंबर डालें (10 अंक)" : "Enter valid mobile number");
    return false;
  };

  const validateEmail = (email: string): boolean => {
    if (!email) { setEmailError(""); return true; }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError(""); return true; }
    setEmailError(language === "hi" ? "सही ईमेल डालें" : "Enter valid email");
    return false;
  };

  const lookupPincode = useCallback(async (code: string) => {
    if (code.length !== 6) { setPincodeResults([]); return; }
    setIsPincodeLooking(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${code}`);
      const data = await res.json();
      if (data?.[0]?.Status === "Success" && data[0].PostOffice) {
        const offices = data[0].PostOffice;
        const results: PincodeResult[] = offices.slice(0, 5).map((po: any) => ({
          district: po.District || "", taluka: po.Block || po.Division || "", area: po.Name || "",
        }));
        const unique = results.filter((v, i, a) => a.findIndex((t) => t.district === v.district && t.taluka === v.taluka && t.area === v.area) === i);
        setPincodeResults(unique);
        if (unique.length > 0) {
          setPincodeDistrict(unique[0].district);
          setPincodeTaluka(unique[0].taluka);
          setPincodeCity(unique[0].area);
          setSelectedPincodeResult(unique[0]);
        }
      } else { setPincodeResults([]); }
    } catch { setPincodeResults([]); }
    finally { setIsPincodeLooking(false); }
  }, []);

  const handlePincodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setPincode(cleaned);
    setSelectedPincodeResult(null);
    if (cleaned.length === 6) lookupPincode(cleaned);
    else { setPincodeResults([]); setPincodeDistrict(""); setPincodeTaluka(""); setPincodeCity(""); }
  };

  const handleSelectPincodeResult = (result: PincodeResult) => {
    setSelectedPincodeResult(result);
    setPincodeDistrict(result.district);
    setPincodeTaluka(result.taluka);
    setPincodeCity(result.area);
  };

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) { toast.error("GPS not supported"); return; }
    setIsDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }));
        setGpsDetected(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`, { headers: { "Accept-Language": "hi,en" } });
          const data = await res.json();
          if (data.address) {
            const addr = data.address;
            setGpsAddress([addr.road, addr.village || addr.hamlet || addr.suburb, addr.town || addr.city].filter(Boolean).join(", ") || "");
          }
        } catch {}
        setIsDetectingGPS(false);
        toast.success(language === "hi" ? "लोकेशन प्राप्त!" : "Location captured!");
      },
      () => { setIsDetectingGPS(false); toast.error(language === "hi" ? "लोकेशन त्रुटि" : "Location error"); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (existingCount >= 5) {
      toast.error(language === "hi" ? "अधिकतम 5 सेवा प्रोफ़ाइल बना सकते हैं" : "Maximum 5 service profiles allowed");
      return;
    }
    if (!validatePhone(formData.phone) || !validateEmail(formData.email)) return;
    if (!formData.name.trim()) { toast.error(language === "hi" ? "नाम भरें" : "Enter name"); return; }
    if (!formData.category) { toast.error(language === "hi" ? "सेवा चुनें" : "Select service"); return; }
    if (!formData.experience) { toast.error(language === "hi" ? "अनुभव भरें" : "Enter experience"); return; }
    if (!pincodeCity && !pincodeDistrict) { toast.error(language === "hi" ? "पिनकोड डालें" : "Enter pincode"); return; }
    if (!formData.latitude || !formData.longitude) { toast.error(language === "hi" ? "GPS लोकेशन दें" : "Share GPS"); return; }

    setIsSubmitting(true);
    try {
      const cityValue = pincodeCity || pincodeDistrict;
      const locationParts = [formData.village, pincodeTaluka, pincodeDistrict, selectedState].filter(Boolean);

      const { error } = await supabase.from("service_providers").insert({
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
      toast.error(error.message || (language === "hi" ? "त्रुटि" : "Error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingCount >= 5 && !isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 select-none">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-xl font-bold text-center mb-2">
          {language === "hi" ? "अधिकतम सीमा पूरी" : "Maximum Limit Reached"}
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          {language === "hi" ? "आप अधिकतम 5 सेवा प्रोफ़ाइल बना सकते हैं" : "You can create up to 5 service profiles"}
        </p>
        <Button onClick={() => navigate("/profile")} className="gradient-primary">
          {language === "hi" ? "प्रोफ़ाइल देखें" : "View Profiles"}
        </Button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 select-none">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.5 }}
          className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-secondary" />
        </motion.div>
        <h1 className="text-2xl font-bold text-center mb-2">
          {language === "hi" ? "रजिस्ट्रेशन सफल!" : "Registration Successful!"}
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          {language === "hi" ? "एडमिन जल्द ही आपकी प्रोफ़ाइल की समीक्षा करेगा" : "Admin will review your profile soon"}
        </p>
        <Button onClick={() => navigate("/home")} className="gradient-primary">
          {language === "hi" ? "होम पर जाएं" : "Go to Home"}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8 select-none">
      <div className="gradient-primary px-4 pt-4 pb-6 safe-top">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">{t("register.title")}</h1>
            <p className="text-sm text-primary-foreground/80">
              {language === "hi" ? `प्रोफ़ाइल ${existingCount}/5` : `Profile ${existingCount}/5`}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        {/* Photo */}
        <Card className="p-4 shadow-card">
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
            <p className="text-sm text-muted-foreground">
              {language === "hi" ? "फ़ोटो अपलोड करें" : "Upload photo"}
            </p>
          </div>
        </Card>

        {/* Personal Info */}
        <Card className="p-4 shadow-card space-y-4">
          <div>
            <Label>{t("register.name")} *</Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder={language === "hi" ? "पूरा नाम" : "Full name"} className="pl-10" required />
            </div>
          </div>
          <div>
            <Label>{t("register.phone")} *</Label>
            <div className="relative mt-1.5">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input type="tel" inputMode="numeric" value={formData.phone}
                onChange={(e) => { handleInputChange("phone", e.target.value); if (phoneError) validatePhone(e.target.value); }}
                onBlur={() => formData.phone && validatePhone(formData.phone)}
                placeholder="98765 43210" className={`pl-10 ${phoneError ? "border-destructive" : ""}`} required />
            </div>
            {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
          </div>
          <div>
            <Label><Mail className="w-4 h-4 inline mr-1" />{t("auth.email")} ({language === "hi" ? "वैकल्पिक" : "optional"})</Label>
            <Input type="email" value={formData.email}
              onChange={(e) => { handleInputChange("email", e.target.value); if (emailError) validateEmail(e.target.value); }}
              onBlur={() => formData.email && validateEmail(formData.email)}
              placeholder="email@example.com" className={`mt-1.5 ${emailError ? "border-destructive" : ""}`} />
            {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
          </div>
        </Card>

        {/* Professional Info */}
        <Card className="p-4 shadow-card space-y-4">
          <div>
            <Label>{t("register.skill")} *</Label>
            <Select value={formData.category} onValueChange={(v) => handleInputChange("category", v)}>
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
            <Label>{t("register.experience")} *</Label>
            <div className="relative mt-1.5">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input type="number" min="0" max="50" value={formData.experience}
                onChange={(e) => handleInputChange("experience", e.target.value)} className="pl-10" required />
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-4 shadow-card space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {language === "hi" ? "लोकेशन" : "Location"}
          </h3>
          <div>
            <Label>{language === "hi" ? "पिनकोड" : "Pincode"} *</Label>
            <Input value={pincode} onChange={(e) => handlePincodeChange(e.target.value)}
              type="tel" inputMode="numeric" maxLength={6} className="mt-1.5"
              placeholder={language === "hi" ? "6 अंक का पिनकोड" : "6-digit pincode"} />
            {isPincodeLooking && <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />{language === "hi" ? "खोज..." : "Looking..."}</div>}
            {pincodeResults.length > 1 && (
              <div className="mt-2 space-y-1">
                {pincodeResults.map((result, idx) => (
                  <button key={idx} type="button" onClick={() => handleSelectPincodeResult(result)}
                    className={`w-full text-left p-2 rounded-lg border text-sm ${selectedPincodeResult === result ? "border-primary bg-primary/5" : "border-border"}`}>
                    {result.area} • {result.taluka} • {result.district}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label>{language === "hi" ? "शहर" : "City"}</Label>
            <Input value={pincodeCity} onChange={(e) => setPincodeCity(e.target.value)} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{language === "hi" ? "तालुका" : "Taluka"}</Label>
              <Input value={pincodeTaluka} onChange={(e) => setPincodeTaluka(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>{language === "hi" ? "जिला" : "District"}</Label>
              <Input value={pincodeDistrict} onChange={(e) => setPincodeDistrict(e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label>{language === "hi" ? "राज्य" : "State"}</Label>
            <div className="relative mt-1.5">
              <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base appearance-none pr-10">
                <option value="">{language === "hi" ? "-- राज्य --" : "-- State --"}</option>
                {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <Label>{language === "hi" ? "गांव / मोहल्ला" : "Village"}</Label>
            <Input value={formData.village} onChange={(e) => handleInputChange("village", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>{language === "hi" ? "GPS लोकेशन" : "GPS"} *</Label>
            <Button type="button" variant={gpsDetected ? "outline" : "default"} className="w-full mt-1.5"
              onClick={handleCaptureLocation} disabled={isDetectingGPS}>
              {isDetectingGPS ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Navigation className="w-4 h-4 mr-2" />}
              {gpsDetected ? "📍 ✓" : (language === "hi" ? "📍 लोकेशन पाएं" : "📍 Get Location")}
            </Button>
            {gpsAddress && <p className="text-xs text-primary mt-2 font-medium">{gpsAddress}</p>}
          </div>
        </Card>

        {/* About */}
        <Card className="p-4 shadow-card">
          <Label>{language === "hi" ? "अपने बारे में" : "About"}</Label>
          <Textarea value={formData.about} onChange={(e) => handleInputChange("about", e.target.value)}
            placeholder={language === "hi" ? "अनुभव और कौशल..." : "Experience and skills..."} className="mt-1.5 min-h-[80px]" />
        </Card>

        <Button type="submit" className="w-full h-12 text-lg gradient-primary" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t("register.submit")}
        </Button>
      </form>
    </div>
  );
};

export default ProviderRegistrationPage;
