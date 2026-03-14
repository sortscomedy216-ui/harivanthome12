import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Phone, Loader2, ShieldAlert } from "lucide-react";

interface Props {
  language: "hi" | "en";
}

const AntiFraud = ({ language }: Props) => {
  const { data: fraudData, isLoading } = useQuery({
    queryKey: ["anti-fraud"],
    queryFn: async () => {
      const { data: providers } = await supabase.from("service_providers").select("phone, name, created_at, status, id");
      const all = providers || [];

      // Duplicate phone numbers
      const phoneCounts: Record<string, { count: number; names: string[] }> = {};
      all.forEach((p: any) => {
        if (!phoneCounts[p.phone]) phoneCounts[p.phone] = { count: 0, names: [] };
        phoneCounts[p.phone].count++;
        phoneCounts[p.phone].names.push(p.name);
      });
      const duplicatePhones = Object.entries(phoneCounts).filter(([_, v]) => v.count > 1).map(([phone, v]) => ({ phone, count: v.count, names: v.names }));

      // Too many registrations (>5 from same phone)
      const suspiciousPhones = duplicatePhones.filter((d) => d.count > 5);

      // Recent burst registrations (same phone in last 24h)
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentByPhone: Record<string, number> = {};
      all.filter((p: any) => new Date(p.created_at) > dayAgo).forEach((p: any) => { recentByPhone[p.phone] = (recentByPhone[p.phone] || 0) + 1; });
      const burstPhones = Object.entries(recentByPhone).filter(([_, c]) => c > 3).map(([phone, count]) => ({ phone, count }));

      return { duplicatePhones, suspiciousPhones, burstPhones };
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!fraudData) return null;

  const hasIssues = fraudData.duplicatePhones.length > 0 || fraudData.suspiciousPhones.length > 0 || fraudData.burstPhones.length > 0;

  return (
    <div className="space-y-4">
      {!hasIssues ? (
        <div className="text-center py-8">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <p className="text-sm font-medium text-green-600">{language === "hi" ? "कोई संदिग्ध गतिविधि नहीं" : "No suspicious activity detected"}</p>
        </div>
      ) : (
        <>
          {fraudData.suspiciousPhones.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-destructive flex items-center gap-1 mb-2"><AlertTriangle className="w-4 h-4" /> {language === "hi" ? "संदिग्ध फ़ोन (5+ रजिस्ट्रेशन)" : "Suspicious Phones (5+ registrations)"}</h4>
              {fraudData.suspiciousPhones.map((s) => (
                <Card key={s.phone} className="p-3 shadow-card border-destructive/30 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-medium">{s.phone}</span>
                    <Badge variant="destructive">{s.count} registrations</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{s.names.join(", ")}</p>
                </Card>
              ))}
            </div>
          )}

          {fraudData.burstPhones.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-orange-600 flex items-center gap-1 mb-2"><AlertTriangle className="w-4 h-4" /> {language === "hi" ? "24 घंटे में 3+ रजिस्ट्रेशन" : "3+ registrations in 24h"}</h4>
              {fraudData.burstPhones.map((b) => (
                <Card key={b.phone} className="p-3 shadow-card border-orange-300/50 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">{b.phone}</span>
                    <Badge className="bg-orange-500">{b.count} in 24h</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {fraudData.duplicatePhones.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-1 mb-2"><Phone className="w-4 h-4" /> {language === "hi" ? "डुप्लिकेट फ़ोन नंबर" : "Duplicate Phone Numbers"}</h4>
              {fraudData.duplicatePhones.map((d) => (
                <Card key={d.phone} className="p-3 shadow-card mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{d.phone}</span>
                    <Badge variant="secondary">{d.count}x</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{d.names.join(", ")}</p>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AntiFraud;
