import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface LoginPromptProps {
  open: boolean;
  onClose: () => void;
}

const LoginPrompt = ({ open, onClose }: LoginPromptProps) => {
  const { language } = useLanguage();
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message || (language === "hi" ? "लॉगिन त्रुटि" : "Login error"));
      }
    } catch {
      toast.error(language === "hi" ? "लॉगिन त्रुटि" : "Login error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 z-50 safe-bottom"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {language === "hi" ? "लॉगिन करें" : "Login"}
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-muted-foreground mb-6">
              {language === "hi"
                ? "सेवाओं का उपयोग करने के लिए लॉगिन करें"
                : "Login to use services"}
            </p>

            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 text-base bg-card border-2 border-border text-foreground hover:bg-muted"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {language === "hi" ? "Google से लॉगिन करें" : "Login with Google"}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              {language === "hi"
                ? "लॉगिन करके आप हमारी नियम और शर्तों से सहमत हैं"
                : "By logging in you agree to our Terms & Conditions"}
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginPrompt;
