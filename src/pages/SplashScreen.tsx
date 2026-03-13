import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Home, Wrench, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch admin-set splash logo
    supabase
      .from("app_assets")
      .select("asset_url")
      .eq("asset_key", "splash_logo")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.asset_url && data.asset_url !== "default") {
          setLogoUrl(data.asset_url);
        }
      });

    const timer = setTimeout(() => navigate("/home", { replace: true }), 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 select-none flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        <div className="w-32 h-32 rounded-3xl gradient-primary flex items-center justify-center shadow-elevated overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt="Harivant" className="w-full h-full object-cover" />
          ) : (
            <Home className="w-16 h-16 text-primary-foreground" />
          )}
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="absolute -right-2 -top-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center"
        >
          <Wrench className="w-5 h-5 text-accent-foreground" />
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="absolute -left-2 -bottom-2 w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <Zap className="w-5 h-5 text-secondary-foreground" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-4xl font-bold text-gradient"
      >
        हरिवंत
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-2 text-lg text-muted-foreground text-center font-medium"
      >
        Harivant Home Services
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-8 flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default SplashScreen;
