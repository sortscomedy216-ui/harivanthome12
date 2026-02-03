import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "hi" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  hi: {
    // App
    "app.name": "हरिवंत",
    "app.tagline": "घर की सेवाएं एक क्लिक पर",
    
    // Onboarding
    "onboarding.welcome": "स्वागत है",
    "onboarding.selectLanguage": "अपनी भाषा चुनें",
    "onboarding.selectLocation": "अपना शहर चुनें",
    "onboarding.continue": "आगे बढ़ें",
    
    // Categories
    "category.plumber": "प्लंबर",
    "category.electrician": "इलेक्ट्रीशियन",
    "category.carpenter": "कारपेंटर",
    "category.painter": "पेंटर",
    "category.cleaner": "सफाई कर्मचारी",
    "category.acRepair": "AC रिपेयर",
    "category.pestControl": "पेस्ट कंट्रोल",
    "category.appliance": "अप्लायंस रिपेयर",
    
    // Home
    "home.searchPlaceholder": "सेवा खोजें...",
    "home.categories": "सेवा श्रेणियां",
    "home.topProviders": "टॉप सेवा प्रदाता",
    "home.viewAll": "सभी देखें",
    "home.nearYou": "आपके पास",
    
    // Provider
    "provider.available": "उपलब्ध",
    "provider.unavailable": "अनुपलब्ध",
    "provider.rating": "रेटिंग",
    "provider.experience": "अनुभव",
    "provider.years": "वर्ष",
    "provider.call": "कॉल करें",
    "provider.book": "बुक करें",
    
    // Registration
    "register.title": "सेवा प्रदाता बनें",
    "register.name": "पूरा नाम",
    "register.phone": "फ़ोन नंबर",
    "register.skill": "कौशल/सेवा",
    "register.location": "क्षेत्र/लोकेशन",
    "register.experience": "अनुभव (वर्षों में)",
    "register.photo": "फ़ोटो अपलोड करें",
    "register.submit": "रजिस्टर करें",
    "register.pending": "अनुमोदन के लिए लंबित",
    
    // Admin
    "admin.title": "एडमिन डैशबोर्ड",
    "admin.login": "एडमिन लॉगिन",
    "admin.pending": "लंबित अनुमोदन",
    "admin.approved": "अनुमोदित",
    "admin.rejected": "अस्वीकृत",
    "admin.approve": "अनुमोदित करें",
    "admin.reject": "अस्वीकार करें",
    "admin.totalUsers": "कुल उपयोगकर्ता",
    "admin.totalProviders": "कुल सेवा प्रदाता",
    
    // Auth
    "auth.login": "लॉगिन",
    "auth.signup": "साइन अप",
    "auth.logout": "लॉगआउट",
    "auth.phone": "फ़ोन नंबर",
    "auth.email": "ईमेल",
    "auth.password": "पासवर्ड",
    "auth.otp": "OTP दर्ज करें",
    "auth.sendOtp": "OTP भेजें",
    "auth.verifyOtp": "OTP सत्यापित करें",
    
    // Navigation
    "nav.home": "होम",
    "nav.search": "खोज",
    "nav.bookings": "बुकिंग्स",
    "nav.profile": "प्रोफ़ाइल",
  },
  en: {
    // App
    "app.name": "Harivant",
    "app.tagline": "Home Services at Your Fingertips",
    
    // Onboarding
    "onboarding.welcome": "Welcome",
    "onboarding.selectLanguage": "Select Your Language",
    "onboarding.selectLocation": "Select Your City",
    "onboarding.continue": "Continue",
    
    // Categories
    "category.plumber": "Plumber",
    "category.electrician": "Electrician",
    "category.carpenter": "Carpenter",
    "category.painter": "Painter",
    "category.cleaner": "Cleaner",
    "category.acRepair": "AC Repair",
    "category.pestControl": "Pest Control",
    "category.appliance": "Appliance Repair",
    
    // Home
    "home.searchPlaceholder": "Search services...",
    "home.categories": "Service Categories",
    "home.topProviders": "Top Service Providers",
    "home.viewAll": "View All",
    "home.nearYou": "Near You",
    
    // Provider
    "provider.available": "Available",
    "provider.unavailable": "Unavailable",
    "provider.rating": "Rating",
    "provider.experience": "Experience",
    "provider.years": "years",
    "provider.call": "Call",
    "provider.book": "Book Now",
    
    // Registration
    "register.title": "Become a Service Provider",
    "register.name": "Full Name",
    "register.phone": "Phone Number",
    "register.skill": "Skill/Service",
    "register.location": "Area/Location",
    "register.experience": "Experience (in years)",
    "register.photo": "Upload Photo",
    "register.submit": "Register",
    "register.pending": "Pending Approval",
    
    // Admin
    "admin.title": "Admin Dashboard",
    "admin.login": "Admin Login",
    "admin.pending": "Pending Approvals",
    "admin.approved": "Approved",
    "admin.rejected": "Rejected",
    "admin.approve": "Approve",
    "admin.reject": "Reject",
    "admin.totalUsers": "Total Users",
    "admin.totalProviders": "Total Providers",
    
    // Auth
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.logout": "Logout",
    "auth.phone": "Phone Number",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.otp": "Enter OTP",
    "auth.sendOtp": "Send OTP",
    "auth.verifyOtp": "Verify OTP",
    
    // Navigation
    "nav.home": "Home",
    "nav.search": "Search",
    "nav.bookings": "Bookings",
    "nav.profile": "Profile",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("harivant-language");
    return (saved as Language) || "hi";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("harivant-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
