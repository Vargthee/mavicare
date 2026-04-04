import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, Users, MessageSquare, LogOut, Plus, Trash2,
  Stethoscope, CreditCard, Search, CheckCircle
} from "lucide-react";

const HospitalDashboard = () => {
  const [hospital, setHospital] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDoctorOpen, setAddDoctorOpen] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState("");
  const [addingDoctor, setAddingDoctor] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    const { data: roleData } = await supabase
      .from("user_roles").select("role").eq("user_id", user.id).single();
    if (roleData?.role !== "hospital_admin" as any) { navigate("/"); return; }

    const { data: hosp } = await supabase
      .from("hospitals").select("*").eq("admin_id", user.id).single();

    if (!hosp) { navigate("/hospital-setup"); return; }
    setHospital(hosp);

    const { data: hospDoctors } = await supabase
      .from("hospital_doctors")
      .select("*")
      .eq("hospital_id", hosp.id);
    
    // Fetch doctor profiles separately
    const enrichedDoctors: any[] = [];
    if (hospDoctors) {
      for (const hd of hospDoctors) {
        const [profileRes, docProfileRes] = await Promise.all([
          supabase.from("profiles").select("id, full_name, email").eq("id", hd.doctor_id).single(),
          supabase.from("doctor_profiles").select("specialization").eq("id", hd.doctor_id).single(),
        ]);
        enrichedDoctors.push({
          ...hd,
          doctor: { ...profileRes.data, doctor_profiles: docProfileRes.data ? [docProfileRes.data] : [] },
        });
      }
    }
    setDoctors(enrichedDoctors);

    const { data: consults } = await supabase
      .from("consultations")
      .select("*, patient:patient_id(full_name), doctor:doctor_id(full_name)")
      .eq("hospital_id", hosp.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setConsultations(consults || []);

    setLoading(false);
  };

  const handleAddDoctor = async () => {
    if (!doctorEmail.trim()) return;
    setAddingDoctor(true);
    try {
      const { data: profile } = await supabase
        .from("profiles").select("id, full_name").eq("email", doctorEmail.trim()).single();
      if (!profile) throw new Error("No user found with that email. Make sure the doctor has created an account.");

      const { data: roleData } = await supabase
        .from("user_roles").select("role").eq("user_id", profile.id).single();
      if (roleData?.role !== "doctor") throw new Error("That user is not registered as a doctor.");

      const { error } = await supabase.from("hospital_doctors").insert({
        hospital_id: hospital.id,
        doctor_id: profile.id,
      });
      if (error) {
        if (error.code === "23505") throw new Error("This doctor is already in your hospital.");
        throw error;
      }

      toast({ title: "Doctor added!", description: `${profile.full_name} has been added to your hospital.` });
      setDoctorEmail("");
      setAddDoctorOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setAddingDoctor(false);
    }
  };

  const handleRemoveDoctor = async (hospitalDoctorId: string, doctorName: string) => {
    if (!confirm(`Remove ${doctorName} from your hospital?`)) return;
    await supabase.from("hospital_doctors").delete().eq("id", hospitalDoctorId);
    toast({ title: "Doctor removed" });
    fetchData();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const planColors: Record<string, string> = {
    basic: "bg-blue-100 text-blue-700",
    professional: "bg-violet-100 text-violet-700",
    enterprise: "bg-amber-100 text-amber-700",
  };

  const statusColors: Record<string, string> = {
    trial: "bg-yellow-100 text-yellow-700",
    active: "bg-green-100 text-green-700",
    suspended: "bg-red-100 text-red-700",
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm">{hospital?.name}</h1>
              <p className="text-xs text-muted-foreground">Hospital Dashboard</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Subscription banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize">{hospital?.subscription_plan} Plan</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[hospital?.subscription_status] || "bg-muted text-muted-foreground"}`}>
                    {hospital?.subscription_status}
                  </span>
                </div>
                {hospital?.subscription_expires_at && (
                  <p className="text-xs text-muted-foreground">
                    Trial ends {new Date(hospital.subscription_expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <Button size="sm" variant="outline">Upgrade Plan</Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Doctors", value: doctors.length, icon: Stethoscope },
            { label: "Total Consultations", value: consultations.length, icon: MessageSquare },
            { label: "Active Today", value: consultations.filter(c => new Date(c.created_at).toDateString() === new Date().toDateString()).length, icon: CheckCircle },
            { label: "Hospital Status", value: hospital?.subscription_status === "trial" ? "Trial" : "Active", icon: Building2 },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Doctors */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Your Doctors
                </CardTitle>
                <CardDescription>Manage the medical staff at your hospital</CardDescription>
              </div>
              <Button onClick={() => setAddDoctorOpen(true)} size="sm" data-testid="button-add-doctor">
                <Plus className="h-4 w-4 mr-2" /> Add Doctor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {doctors.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Stethoscope className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No doctors yet</p>
                <p className="text-sm">Add your first doctor to start receiving consultations</p>
                <Button className="mt-4" onClick={() => setAddDoctorOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Doctor
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {doctors.map((hd) => (
                  <div key={hd.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {hd.doctor?.full_name?.[0] || "D"}
                      </div>
                      <div>
                        <p className="font-medium">{hd.doctor?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {hd.doctor?.doctor_profiles?.[0]?.specialization || "General Practice"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveDoctor(hd.id, hd.doctor?.full_name)}
                      data-testid={`button-remove-doctor-${hd.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent consultations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Recent Consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {consultations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No consultations yet</p>
            ) : (
              <div className="space-y-3">
                {consultations.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => navigate(`/consultation/${c.id}`)}
                    data-testid={`consultation-${c.id}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{c.patient?.full_name} → Dr. {c.doctor?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{c.chief_complaint || "General consultation"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-xs">
                        {c.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Doctor Dialog */}
      <Dialog open={addDoctorOpen} onOpenChange={setAddDoctorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Doctor to Your Hospital</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              The doctor must already have a Medweb Care account registered with the "Doctor" role.
            </p>
            <div className="space-y-2">
              <Label htmlFor="doctor-email">Doctor's Email Address</Label>
              <Input
                id="doctor-email"
                type="email"
                placeholder="doctor@email.com"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddDoctor()}
                data-testid="input-doctor-email"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setAddDoctorOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleAddDoctor} disabled={addingDoctor || !doctorEmail.trim()}>
                {addingDoctor ? "Adding..." : "Add Doctor"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HospitalDashboard;
