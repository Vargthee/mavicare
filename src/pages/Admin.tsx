import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getUserRole } from "@/lib/auth";
import {
  Building2, Users, MessageSquare, TrendingUp,
  CheckCircle, XCircle, Clock, Loader2, RefreshCw
} from "lucide-react";

const planBadge: Record<string, string> = {
  basic: "bg-blue-100 text-blue-700 border-blue-200",
  professional: "bg-violet-100 text-violet-700 border-violet-200",
  enterprise: "bg-amber-100 text-amber-700 border-amber-200",
};

const statusBadge: Record<string, string> = {
  trial: "bg-yellow-100 text-yellow-700 border-yellow-200",
  active: "bg-green-100 text-green-700 border-green-200",
  suspended: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [stats, setStats] = useState({ hospitals: 0, consultations: 0, users: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { navigate("/auth"); return; }

    const role = await getUserRole(u);
    if (role !== "admin") {
      toast({ title: "Access denied", description: "Admin access only.", variant: "destructive" });
      navigate("/");
      return;
    }
    setUser(u);
    await fetchData();
    setLoading(false);
  };

  const fetchData = async () => {
    const [hospRes, consultRes] = await Promise.all([
      supabase.from("hospitals").select("*, hospital_doctors(count)").order("created_at", { ascending: false }),
      supabase.from("consultations").select("id, status", { count: "exact" }),
    ]);

    const hospData = hospRes.data || [];
    setHospitals(hospData);
    setStats({
      hospitals: hospData.length,
      consultations: consultRes.count || 0,
      users: 0,
      active: hospData.filter((h) => h.subscription_status === "active").length,
    });
  };

  const updateSubscription = async (hospitalId: string, status: string) => {
    setUpdating(hospitalId);
    try {
      const { error } = await supabase
        .from("hospitals")
        .update({ subscription_status: status })
        .eq("id", hospitalId);

      if (error) {
        if (error.code === "42501") {
          toast({
            title: "Permission required",
            description: "Run the admin migration SQL to enable admin permissions.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({ title: "Subscription updated" });
        setHospitals((prev) =>
          prev.map((h) => h.id === hospitalId ? { ...h, subscription_status: status } : h)
        );
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const updatePlan = async (hospitalId: string, plan: string) => {
    setUpdating(hospitalId);
    try {
      const { error } = await supabase
        .from("hospitals")
        .update({ subscription_plan: plan })
        .eq("id", hospitalId);

      if (error) throw error;
      toast({ title: "Plan updated" });
      setHospitals((prev) =>
        prev.map((h) => h.id === hospitalId ? { ...h, subscription_plan: plan } : h)
      );
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNav
        userName={user?.user_metadata?.full_name || user?.email}
        role="admin"
      />

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Platform Admin</h1>
            <p className="text-muted-foreground text-sm">Manage hospitals, subscriptions, and platform health</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Hospitals", value: stats.hospitals, icon: Building2, color: "text-blue-600" },
            { label: "Active Hospitals", value: stats.active, icon: CheckCircle, color: "text-green-600" },
            { label: "Total Consultations", value: stats.consultations, icon: MessageSquare, color: "text-violet-600" },
            { label: "On Trial", value: hospitals.filter((h) => h.subscription_status === "trial").length, icon: Clock, color: "text-yellow-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <div className="text-3xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Hospitals table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Registered Hospitals
            </CardTitle>
            <CardDescription>
              Manage hospital subscriptions and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hospitals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No hospitals registered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hospitals.map((h) => (
                  <div
                    key={h.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{h.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {h.email || h.phone || "No contact info"}
                          {h.address && ` · ${h.address}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Registered {new Date(h.created_at).toLocaleDateString()}
                          {h.subscription_expires_at && ` · Trial ends ${new Date(h.subscription_expires_at).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                      {/* Plan selector */}
                      <Select
                        value={h.subscription_plan}
                        onValueChange={(val) => updatePlan(h.id, val)}
                        disabled={updating === h.id}
                      >
                        <SelectTrigger className={`h-7 text-xs border px-2 rounded-full w-32 ${planBadge[h.subscription_plan] || ""}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Status selector */}
                      <Select
                        value={h.subscription_status}
                        onValueChange={(val) => updateSubscription(h.id, val)}
                        disabled={updating === h.id}
                      >
                        <SelectTrigger className={`h-7 text-xs border px-2 rounded-full w-28 ${statusBadge[h.subscription_status] || ""}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trial">Trial</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>

                      {updating === h.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info card */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800 font-medium">⚠️ Admin Permissions Note</p>
            <p className="text-xs text-amber-700 mt-1">
              To enable full admin write access (subscription status changes), apply the SQL migration file
              <code className="mx-1 bg-amber-200 px-1 rounded">supabase/migrations/20260402000000_hospital_subscription_model.sql</code>
              in your Supabase dashboard, then add admin RLS policies.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
