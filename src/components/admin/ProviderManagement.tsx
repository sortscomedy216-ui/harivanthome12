import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, Phone, MapPin, Trash2, CheckCircle2, XCircle, Ban, Eye, Power, PhoneCall,
  ArrowLeft, Loader2, User, Calendar, Shield
} from "lucide-react";
import { toast } from "sonner";
import { getCategoryName, allCategories } from "@/config/categories";
import { motion } from "framer-motion";

interface Props {
  language: "hi" | "en";
  userId: string;
  defaultStatus?: string;
}

const ProviderManagement = ({ language, userId, defaultStatus = "all" }: Props) => {
  const [statusFilter, setStatusFilter] = useState(defaultStatus);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [disableReason, setDisableReason] = useState("");
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [disableTargetId, setDisableTargetId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["admin-all-providers", statusFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase.from("service_providers").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") {
        if (statusFilter === "disabled") {
          query = query.eq("disabled", true);
        } else {
          query = query.eq("status", statusFilter as any);
        }
      }
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter as any);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["areas-list"],
    queryFn: async () => {
      const { data } = await supabase.from("areas").select("*").eq("enabled", true);
      return data || [];
    },
  });

  const filtered = providers.filter((p: any) => {
    const matchSearch = !searchQuery || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchArea = areaFilter === "all" || p.area === areaFilter || p.city === areaFilter;
    return matchSearch && matchArea;
  });

  const logAction = async (action: string, targetType: string, targetId: string, targetName: string, details?: string) => {
    await supabase.from("admin_logs").insert({ admin_id: userId, action, target_type: targetType, target_id: targetId, target_name: targetName, details });
    await supabase.from("admin_notifications").insert({ title: action, message: `${action}: ${targetName}`, type: action.includes("reject") || action.includes("delete") ? "warning" : "success" });
  };

  const handleApprove = async (id: string, name: string) => {
    await supabase.from("service_providers").update({ status: "approved" }).eq("id", id);
    await logAction("Provider Approved", "provider", id, name);
    toast.success(language === "hi" ? "अनुमोदित!" : "Approved!");
    queryClient.invalidateQueries({ queryKey: ["admin-all-providers"] });
  };

  const handleReject = async (id: string, name: string) => {
    await supabase.from("service_providers").update({ status: "rejected" }).eq("id", id);
    await logAction("Provider Rejected", "provider", id, name);
    toast.info(language === "hi" ? "अस्वीकृत" : "Rejected");
    queryClient.invalidateQueries({ queryKey: ["admin-all-providers"] });
  };

  const handleDisable = async () => {
    if (!disableTargetId) return;
    const provider = providers.find((p: any) => p.id === disableTargetId);
    await supabase.from("service_providers").update({ disabled: true, disable_reason: disableReason }).eq("id", disableTargetId);
    await logAction("Provider Disabled", "provider", disableTargetId, provider?.name || "", disableReason);
    toast.success(language === "hi" ? "प्रदाता अक्षम किया गया" : "Provider disabled");
    setShowDisableDialog(false);
    setDisableReason("");
    setDisableTargetId(null);
    queryClient.invalidateQueries({ queryKey: ["admin-all-providers"] });
  };

  const handleEnable = async (id: string, name: string) => {
    await supabase.from("service_providers").update({ disabled: false, disable_reason: null }).eq("id", id);
    await logAction("Provider Enabled", "provider", id, name);
    toast.success(language === "hi" ? "प्रदाता सक्रिय किया गया" : "Provider enabled");
    queryClient.invalidateQueries({ queryKey: ["admin-all-providers"] });
  };

  const handleBlacklist = async (id: string, name: string) => {
    if (!window.confirm(language === "hi" ? `"${name}" को ब्लैकलिस्ट करें?` : `Blacklist "${name}"?`)) return;
    await supabase.from("service_providers").update({ blacklisted: true, disabled: true }).eq("id", id);
    await logAction("Provider Blacklisted", "provider", id, name);
    toast.success(language === "hi" ? "ब्लैकलिस्ट किया गया" : "Blacklisted");
    queryClient.invalidateQueries({ queryKey: ["admin-all-providers"] });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(language === "hi" ? `"${name}" को स्थायी रूप से हटाएं?` : `Permanently delete "${name}"?`)) return;
    await supabase.from("service_providers").delete().eq("id", id);
    await logAction("Provider Deleted", "provider", id, name);
    toast.success(language === "hi" ? "हटा दिया गया" : "Deleted");
    queryClient.invalidateQueries({ queryKey: ["admin-all-providers"] });
  };

  const getStatusBadge = (provider: any) => {
    if (provider.blacklisted) return <Badge variant="destructive">Blacklisted</Badge>;
    if (provider.disabled) return <Badge className="bg-orange-500">Disabled</Badge>;
    if (provider.status === "approved") return <Badge className="bg-green-600">Approved</Badge>;
    if (provider.status === "pending") return <Badge className="bg-amber-500">Pending</Badge>;
    if (provider.status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary">{provider.status}</Badge>;
  };

  if (selectedProvider) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedProvider(null)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> {language === "hi" ? "वापस" : "Back"}
        </Button>
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
              {selectedProvider.photo_url ? (
                <img src={selectedProvider.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold">{selectedProvider.name}</h3>
              {getStatusBadge(selectedProvider)}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>{selectedProvider.phone}</span></div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground" /><span>{getCategoryName(selectedProvider.category, language)}</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{selectedProvider.city}{selectedProvider.area ? ` • ${selectedProvider.area}` : ""}</span></div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span>{new Date(selectedProvider.created_at).toLocaleDateString("hi-IN")}</span></div>
            {selectedProvider.about && <p className="text-muted-foreground mt-2">{selectedProvider.about}</p>}
            {selectedProvider.email && <p className="text-muted-foreground">{selectedProvider.email}</p>}
            {selectedProvider.disable_reason && <p className="text-destructive text-xs mt-1">Reason: {selectedProvider.disable_reason}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {selectedProvider.status === "pending" && (
              <>
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { handleApprove(selectedProvider.id, selectedProvider.name); setSelectedProvider(null); }}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> {language === "hi" ? "अनुमोदित" : "Approve"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { handleReject(selectedProvider.id, selectedProvider.name); setSelectedProvider(null); }}>
                  <XCircle className="w-4 h-4 mr-1" /> {language === "hi" ? "अस्वीकृत" : "Reject"}
                </Button>
              </>
            )}
            {!selectedProvider.disabled ? (
              <Button size="sm" variant="outline" className="text-orange-600 border-orange-300" onClick={() => { setDisableTargetId(selectedProvider.id); setShowDisableDialog(true); }}>
                <Ban className="w-4 h-4 mr-1" /> {language === "hi" ? "अक्षम करें" : "Disable"}
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="text-green-600 border-green-300" onClick={() => { handleEnable(selectedProvider.id, selectedProvider.name); setSelectedProvider(null); }}>
                <Power className="w-4 h-4 mr-1" /> {language === "hi" ? "सक्रिय करें" : "Enable"}
              </Button>
            )}
            <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => { handleBlacklist(selectedProvider.id, selectedProvider.name); setSelectedProvider(null); }}>
              <Shield className="w-4 h-4 mr-1" /> Blacklist
            </Button>
            <Button size="sm" variant="destructive" onClick={() => { handleDelete(selectedProvider.id, selectedProvider.name); setSelectedProvider(null); }}>
              <Trash2 className="w-4 h-4 mr-1" /> {language === "hi" ? "हटाएं" : "Delete"}
            </Button>
            <a href={`tel:${selectedProvider.phone}`}>
              <Button size="sm" variant="outline" className="w-full text-primary">
                <PhoneCall className="w-4 h-4 mr-1" /> {language === "hi" ? "कॉल करें" : "Call"}
              </Button>
            </a>
          </div>
        </Card>

        <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{language === "hi" ? "अक्षम करने का कारण" : "Disable Reason"}</DialogTitle>
            </DialogHeader>
            <Textarea value={disableReason} onChange={(e) => setDisableReason(e.target.value)} placeholder={language === "hi" ? "कारण लिखें..." : "Enter reason..."} />
            <Button onClick={handleDisable} className="bg-orange-600 hover:bg-orange-700">{language === "hi" ? "अक्षम करें" : "Disable"}</Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={language === "hi" ? "नाम, फ़ोन, शहर खोजें..." : "Search name, phone, city..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === "hi" ? "सभी स्थिति" : "All Status"}</SelectItem>
            <SelectItem value="pending">{language === "hi" ? "लंबित" : "Pending"}</SelectItem>
            <SelectItem value="approved">{language === "hi" ? "अनुमोदित" : "Approved"}</SelectItem>
            <SelectItem value="rejected">{language === "hi" ? "अस्वीकृत" : "Rejected"}</SelectItem>
            <SelectItem value="disabled">{language === "hi" ? "अक्षम" : "Disabled"}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === "hi" ? "सभी श्रेणी" : "All Category"}</SelectItem>
            {allCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.icon} {language === "hi" ? cat.hi : cat.en}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={areaFilter} onValueChange={setAreaFilter}>
          <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === "hi" ? "सभी क्षेत्र" : "All Areas"}</SelectItem>
            {areas.map((area: any) => (
              <SelectItem key={area.id} value={area.name}>{area.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Provider List */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">{language === "hi" ? "कोई प्रदाता नहीं मिला" : "No providers found"}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((provider: any, i: number) => (
            <motion.div key={provider.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Card className={`p-3 shadow-card cursor-pointer active:scale-[0.98] transition-transform ${provider.blacklisted ? "border-destructive/50 bg-destructive/5" : provider.disabled ? "border-orange-300/50 bg-orange-50/50" : ""}`}
                onClick={() => setSelectedProvider(provider)}>
                <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                     {provider.photo_url ? <img src={provider.photo_url} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-muted-foreground" />}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between">
                       <h4 className="text-sm font-semibold truncate">{provider.name}</h4>
                       {getStatusBadge(provider)}
                     </div>
                     <p className="text-[10px] text-muted-foreground font-mono">ID: {provider.id.substring(0, 8)}</p>
                     <p className="text-xs text-muted-foreground">{getCategoryName(provider.category, language)} • {provider.phone}</p>
                     <p className="text-xs text-muted-foreground">{provider.city}{provider.area ? ` • ${provider.area}` : ""} • {new Date(provider.created_at).toLocaleDateString("hi-IN")}</p>
                  </div>
                  <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "hi" ? "अक्षम करने का कारण" : "Disable Reason"}</DialogTitle>
          </DialogHeader>
          <Textarea value={disableReason} onChange={(e) => setDisableReason(e.target.value)} placeholder={language === "hi" ? "कारण लिखें..." : "Enter reason..."} />
          <Button onClick={handleDisable} className="bg-orange-600 hover:bg-orange-700">{language === "hi" ? "अक्षम करें" : "Disable"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderManagement;
