import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Shield, FileText, Scale, Eye, X, ExternalLink } from "lucide-react";

const APP_VERSION = "1.0.0";

interface LinkItem {
  id: string;
  titleHi: string;
  titleEn: string;
  icon: React.ReactNode;
  url: string;
}

const links: LinkItem[] = [
  {
    id: "data-safety",
    titleHi: "डेटा सुरक्षा",
    titleEn: "Data Safety",
    icon: <Shield className="w-5 h-5 text-green-600" />,
    url: "https://vector-pinboard.vercel.app/data-safety",
  },
  {
    id: "moderation",
    titleHi: "मॉडरेशन",
    titleEn: "Moderation",
    icon: <Eye className="w-5 h-5 text-blue-600" />,
    url: "https://vector-pinboard.vercel.app/moderation",
  },
  {
    id: "privacy",
    titleHi: "प्राइवेसी पॉलिसी",
    titleEn: "Privacy Policy",
    icon: <FileText className="w-5 h-5 text-purple-600" />,
    url: "https://vector-pinboard.vercel.app/privacy",
  },
  {
    id: "terms",
    titleHi: "नियम और शर्तें",
    titleEn: "Terms & Conditions",
    icon: <Scale className="w-5 h-5 text-amber-600" />,
    url: "https://vector-pinboard.vercel.app/terms",
  },
];

const AboutPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState("");

  const handleOpenLink = (link: LinkItem) => {
    setActiveUrl(link.url);
    setActiveTitle(language === "hi" ? link.titleHi : link.titleEn);
  };

  if (activeUrl) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Webview Header */}
        <div className="gradient-primary px-4 pt-4 pb-3 safe-top flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setActiveUrl(null)}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-semibold text-primary-foreground flex-1 truncate">
            {activeTitle}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => window.open(activeUrl, "_blank")}
          >
            <ExternalLink className="w-5 h-5" />
          </Button>
        </div>
        <iframe
          src={activeUrl}
          className="flex-1 w-full border-0"
          title={activeTitle}
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-primary-foreground">
            {language === "hi" ? "हमारे बारे में" : "About"}
          </h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* App Info Card */}
        <Card className="p-6 shadow-card text-center">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🏠</span>
          </div>
          <h2 className="text-xl font-bold">
            {language === "hi" ? "हरिवंत" : "Harivant"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {language === "hi" ? "घर की सेवाएं एक क्लिक पर" : "Home Services at Your Fingertips"}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {language === "hi" ? "वर्जन" : "Version"} {APP_VERSION}
          </p>
        </Card>

        {/* Links */}
        <div className="space-y-3">
          {links.map((link) => (
            <Card
              key={link.id}
              className="p-4 shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
              onClick={() => handleOpenLink(link)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {link.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {language === "hi" ? link.titleHi : link.titleEn}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs text-muted-foreground">
            © 2024 Harivant. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
