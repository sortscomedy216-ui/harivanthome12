import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, Eye, EyeOff, Home } from "lucide-react";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const AuthPage = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { signInWithEmail, signUpWithEmail, signInWithPhone, verifyOtp, user } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate("/home");
    return null;
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        toast.success(language === "hi" ? "लॉगिन सफल!" : "Login successful!");
        navigate("/home");
      } else {
        if (!name.trim()) {
          toast.error(language === "hi" ? "नाम भरें" : "Please enter your name");
          return;
        }
        const { error } = await signUpWithEmail(email, password, name);
        if (error) throw error;
        toast.success(
          language === "hi"
            ? "खाता बनाया गया! कृपया ईमेल सत्यापित करें।"
            : "Account created! Please verify your email."
        );
      }
    } catch (error: any) {
      toast.error(error.message || (language === "hi" ? "त्रुटि हुई" : "An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error(language === "hi" ? "वैध फ़ोन नंबर दर्ज करें" : "Enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const { error } = await signInWithPhone(formattedPhone);
      if (error) throw error;
      setOtpSent(true);
      toast.success(language === "hi" ? "OTP भेजा गया!" : "OTP sent!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error(language === "hi" ? "6 अंकों का OTP दर्ज करें" : "Enter 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const { error } = await verifyOtp(formattedPhone, otp);
      if (error) throw error;
      toast.success(language === "hi" ? "लॉगिन सफल!" : "Login successful!");
      navigate("/home");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">
                {t("app.name")}
              </h1>
              <p className="text-sm text-primary-foreground/80">
                {isLogin ? t("auth.login") : t("auth.signup")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-4">
        <Card className="p-6 shadow-elevated">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="email" className="flex-1">
                <Mail className="w-4 h-4 mr-2" />
                {t("auth.email")}
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                {t("auth.phone")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {!isLogin && (
                  <div>
                    <Label htmlFor="name">{language === "hi" ? "नाम" : "Name"}</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={language === "hi" ? "अपना नाम" : "Your name"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 gradient-primary" disabled={isLoading}>
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                  ) : isLogin ? (
                    t("auth.login")
                  ) : (
                    t("auth.signup")
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {isLogin
                    ? language === "hi"
                      ? "खाता नहीं है?"
                      : "Don't have an account?"
                    : language === "hi"
                    ? "पहले से खाता है?"
                    : "Already have an account?"}
                  <Button
                    type="button"
                    variant="link"
                    className="text-primary p-1"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? t("auth.signup") : t("auth.login")}
                  </Button>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="phone">
              <div className="space-y-4">
                {!otpSent ? (
                  <>
                    <div>
                      <Label htmlFor="phone">{t("auth.phone")}</Label>
                      <div className="flex gap-2 mt-1.5">
                        <div className="flex items-center px-3 bg-muted rounded-md text-sm">
                          +91
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          maxLength={10}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSendOtp}
                      className="w-full h-11 gradient-primary"
                      disabled={isLoading || phone.length < 10}
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                        />
                      ) : (
                        t("auth.sendOtp")
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>{t("auth.otp")}</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        {language === "hi"
                          ? `+91 ${phone} पर भेजा गया`
                          : `Sent to +91 ${phone}`}
                      </p>
                      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup className="gap-2 justify-center w-full">
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button
                      onClick={handleVerifyOtp}
                      className="w-full h-11 gradient-primary"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                        />
                      ) : (
                        t("auth.verifyOtp")
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                      }}
                    >
                      {language === "hi" ? "नंबर बदलें" : "Change number"}
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
