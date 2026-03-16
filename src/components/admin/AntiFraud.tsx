import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Phone, Loader2, ShieldAlert, ShieldCheck, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  language: "hi" | "en";
}

const AntiFraud = ({ language }: Props) => {
  const { data: fraudData, isLoading } = useQuery({
    queryKey: ["anti-fraud"],
    queryFn: async () => {
      const { data: providers } = await supabase.from("service_providers").select("phone, name, created_at, status, id, blacklisted");
      const all = providers || [];

      // Duplicate phone numbers
      const phoneCounts: Record<string, { count: number; names: string[] }> = {};
      all.forEach((p: any) => {
        if (!phoneCounts[p.phone]) phoneCounts[p.phone] = { count: 0, names: [] };
        phoneCounts[p.phone].count++;
        phoneCounts[p.phone].names.push(p.name);
      });
      const duplicatePhones = Object.entries(phoneCounts).filter(([_, v]) => v.count > 1).map(([phone, v]) => ({ phone, count: v.count, names: v.names }));

      const suspiciousPhones = duplicatePhones.filter((d) => d.count > 5);

      // Recent burst registrations (same phone in last 24h)
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentByPhone: Record<string, number> = {};
      all.filter((p: any) => new Date(p.created_at) > dayAgo).forEach((p: any) => { recentByPhone[p.phone] = (recentByPhone[p.phone] || 0) + 1; });
      const burstPhones = Object.entries(recentByPhone).filter(([_, c]) => c > 3).map(([phone, count]) => ({ phone, count }));

      // Blacklisted count
      const blacklisted = all.filter((p: any) => p.blacklisted).length;

      return { duplicatePhones, suspiciousPhones, burstPhones, blacklisted, totalChecked: all.length };
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!fraudData) return null;

  const hasIssues = fraudData.duplicatePhones.length > 0 || fraudData.suspiciousPhones.length > 0 || fraudData.burstPhones.length > 0;
  const riskScore = fraudData.suspiciousPhones.length * 30 + fraudData.burstPhones.length * 20 + fraudData.duplicatePhones.length * 5;
  const riskLevel = riskScore === 0 ? "safe" : riskScore < 50 ? "low" : riskScore < 100 ? "medium" : "high";

  return (
    <div className="space-y-4">
      {/* Risk Overview */}
      <Card className={`p-4 shadow-card ${riskLevel === "safe" ? "border-emerald-200 bg-emerald-50/50" : riskLevel === "high" ? "border-red-200 bg-red-50/50" : "border-amber-200 bg-amber-50/50"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${riskLevel === "safe" ? "bg-emerald-100" : riskLevel === "high" ? "bg-red-100" : "bg-amber-100"}`}>
            {riskLevel === "safe" ? <ShieldCheck className="w-6 h-6 text-emerald-600" /> : <ShieldAlert className="w-6 h-6 text-red-600" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold">{language === "hi" ? "सुरक्षा स्थिति" : "Security Status"}</p>
              <Badge className={`text-[10px] ${riskLevel === "safe" ? "bg-emerald-500" : riskLevel === "high" ? "bg-red-500" : "bg-amber-500"}`}>
                {riskLevel === "safe" ? (language === "hi" ? "सुरक्षित" : "Safe") : riskLevel === "high" ? (language === "hi" ? "उच्च जोखिम" : "High Risk") : (language === "hi" ? "मध्यम" : "Medium")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {fraudData.totalChecked} {language === "hi" ? "प्रदाता स्कैन किए" : "providers scanned"} • {fraudData.blacklisted} {language === "hi" ? "ब्लैकलिस्ट" : "blacklisted"}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center shadow-card">
          <p className="text-lg font-black text-red-600">{fraudData.suspiciousPhones.length}</p>
          <p className="text-[9px] text-muted-foreground font-medium">{language === "hi" ? "संदिग्ध" : "Suspicious"}</p>
        </Card>
        <Card className="p-3 text-center shadow-card">
          <p className="text-lg font-black text-amber-600">{fraudData.burstPhones.length}</p>
          <p className="text-[9px] text-muted-foreground font-medium">{language === "hi" ? "बर्स्ट" : "Burst"}</p>
        </Card>
        <Card className="p-3 text-center shadow-card">
          <p className="text-lg font-black text-blue-600">{fraudData.duplicatePhones.length}</p>
          <p className="text-[9px] text-muted-foreground font-medium">{language === "hi" ? "डुप्लिकेट" : "Duplicate"}</p>
        </Card>
      </div>

      {!hasIssues ? (
        <div className="text-center py-8">
          <ShieldCheck className="w-16 h-16 mx-auto mb-3 text-emerald-500 opacity-60" />
          <p className="text-sm font-semibold text-emerald-600">{language === "hi" ? "कोई संदिग्ध गतिविधि नहीं!" : "No suspicious activity detected!"}</p>
          <p className="text-xs text-muted-foreground mt-1">{language === "hi" ? "सभी रजिस्ट्रेशन सामान्य हैं" : "All registrations are normal"}</p>
        </div>
      ) : (
        <>
          {fraudData.suspiciousPhones.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-red-600 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                {language === "hi" ? "संदिग्ध फ़ोन (5+ रजिस्ट्रेशन)" : "Suspicious Phones (5+ registrations)"}
              </h4>
              {fraudData.suspiciousPhones.map((s, i) => (
                <motion.div key={s.phone} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-3 shadow-card border-red-200 bg-red-50/30 mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-bold font-mono">{s.phone}</span>
                      <Badge variant="destructive" className="text-[10px]">{s.count}x</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{s.names.join(", ")}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {fraudData.burstPhones.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-amber-600 flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5" />
                {language === "hi" ? "24 घंटे में 3+ रजिस्ट्रेशन" : "3+ registrations in 24h"}
              </h4>
              {fraudData.burstPhones.map((b, i) => (
                <motion.div key={b.phone} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-3 shadow-card border-amber-200 bg-amber-50/30 mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-bold font-mono">{b.phone}</span>
                      <Badge className="bg-amber-500 text-[10px]">{b.count} in 24h</Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {fraudData.duplicatePhones.length > 0 && (
            <div>
              <h4 className="text-xs font-bold flex items-center gap-1.5 mb-2">
                <Phone className="w-3.5 h-3.5" />
                {language === "hi" ? "डुप्लिकेट फ़ोन नंबर" : "Duplicate Phone Numbers"}
              </h4>
              {fraudData.duplicatePhones.map((d, i) => (
                <motion.div key={d.phone} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="p-3 shadow-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-mono font-medium">{d.phone}</span>
                      <Badge variant="secondary" className="text-[9px]">{d.count}x</Badge>
                      <span className="text-[9px] text-muted-foreground truncate flex-1">{d.names.slice(0, 3).join(", ")}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AntiFraud;
