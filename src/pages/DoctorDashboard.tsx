import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, LogOut, Settings, Building2,
  Stethoscope, ChevronRight, Clock, CheckCircle
} from "lucide-react";
import DoctorProfileSetup from "@/components/DoctorProfileSetup";

const DoctorDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [hospital, setHospital] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { navigate("/auth"); return; }

    const { data: roleData } = await supabase
      .from("user_roles").select("role").eq("user_id", u.id).single();
    if (roleData?.role !== "doctor") { navigate("/patient-dashboard"); return; }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", u.id).single();
    const { data: docProfile } = await supabase.from("doctor_profiles").select("*").eq("id", u.id).single();

    setUser(profile || { id: u.id, full_name: u.email });
    setDoctorProfile(docProfile);

    if (!docProfile) {
      setShowProfileSetup(true);
      setLoading(false);
      return;
    }

    // Find their hospital
    const { data: hospLink } = await supabase
      .from("hospital_doctors")
      .select("*")
      .eq("doctor_id", u.id)
      .single();
    
    if (hospLink) {
      const { data: hospData } = await supabase
        .from("hospitals")
        .select("id, name, subscription_plan, subscription_status")
        .eq("id", hospLink.hospital_id)
        .single();
      setHospital(hospData || null);
    }

    // Fetch consultations
    const { data: consults } = await supabase
      .from("consultations")
      .select("*")
      .eq("doctor_id", u.id)
      .order("created_at", { ascending: false });
    
    // Enrich with patient/hospital info
    const enriched: any[] = [];
    if (consults) {
      for (const c of consults) {
        const { data: patient } = await supabase.from("profiles").select("id, full_name, phone").eq("id", c.patient_id).single();
        let hospName = null;
        if (c.hospital_id) {
          const { data: h } = await supabase.from("hospitals").select("name").eq("id", c.hospital_id).single();
          hospName = h;
        }
        enriched.push({ ...c, patient, hospital: hospName });
      }
    }
    setConsultations(enriched);

    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleProfileComplete = () => {
    setShowProfileSetup(false);
    init();
  };

  const activeConsultations = consultations.filter((c) => c.status === "active");
  const closedConsultations = consultations.filter((c) => c.status !== "active");

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>;
  if (showProfileSetup) return <DoctorProfileSetup onComplete={handleProfileComplete} />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Dr. {user?.full_name}</p>
              <p className="text-xs text-muted-foreground">{doctorProfile?.specialization || "Doctor"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowProfileSetup(true)} title="Profile settings">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Hospital info */}
        {hospital ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{hospital.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {hospital.subscription_plan} plan · {hospital.subscription_status}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-orange-200 bg-orange-50">
            <CardContent className="p-4 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-orange-700">Not assigned to a hospital yet</p>
                <p className="text-xs text-orange-600">A hospital admin needs to add you to their hospital.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active", value: activeConsultations.length, icon: Clock, color: "text-blue-600" },
            { label: "Total", value: consultations.length, icon: MessageSquare, color: "text-primary" },
            { label: "Closed", value: closedConsultations.length, icon: CheckCircle, color: "text-green-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-3 text-center">
                <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active consultations */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Active Consultations
          </h2>
          {activeConsultations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No active consultations right now</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {activeConsultations.map((c) => (
                <Card
                  key={c.id}
                  className="cursor-pointer hover:shadow-medium transition-shadow border-l-4 border-l-primary"
                  onClick={() => navigate(`/consultation/${c.id}`)}
                  data-testid={`consultation-${c.id}`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {c.patient?.full_name?.[0] || "P"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{c.patient?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.chief_complaint || "General consultation"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs">Active</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Closed consultations */}
        {closedConsultations.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" /> Past Consultations
            </h2>
            <div className="space-y-2">
              {closedConsultations.slice(0, 5).map((c) => (
                <Card
                  key={c.id}
                  className="cursor-pointer hover:shadow-medium transition-shadow opacity-70 hover:opacity-100"
                  onClick={() => navigate(`/consultation/${c.id}`)}
                  data-testid={`closed-consultation-${c.id}`}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{c.patient?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
                        {c.chief_complaint && ` · ${c.chief_complaint}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{c.status}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
