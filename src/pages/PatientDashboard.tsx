import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, LogOut, User, Building2, Search,
  Stethoscope, ChevronRight, Plus, Activity
} from "lucide-react";
import { ProfileSettingsDialog } from "@/components/ProfileSettingsDialog";

const PatientDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [hospitalDoctors, setHospitalDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [complaint, setComplaint] = useState("");
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
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
    if (roleData?.role === "doctor") { navigate("/doctor-dashboard"); return; }
    if (roleData?.role === "hospital_admin") { navigate("/hospital-dashboard"); return; }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", u.id).single();
    setUser(profile || { id: u.id, full_name: u.email });

    await fetchConsultations(u.id);
    await fetchHospitals();
    setLoading(false);
  };

  const fetchConsultations = async (userId: string) => {
    const { data } = await supabase
      .from("consultations")
      .select("*, doctor:doctor_id(id, full_name, doctor_profiles(specialization)), hospital:hospital_id(name)")
      .eq("patient_id", userId)
      .order("created_at", { ascending: false });
    setConsultations(data || []);
  };

  const fetchHospitals = async () => {
    const { data } = await supabase
      .from("hospitals")
      .select("*")
      .eq("subscription_status", "trial")
      .order("name");
    const { data: active } = await supabase
      .from("hospitals")
      .select("*")
      .eq("subscription_status", "active")
      .order("name");
    setHospitals([...(data || []), ...(active || [])]);
  };

  const openBooking = async (hospital: any) => {
    setSelectedHospital(hospital);
    setSelectedDoctor(null);
    setComplaint("");
    const { data } = await supabase
      .from("hospital_doctors")
      .select("*, doctor:doctor_id(id, full_name, doctor_profiles(specialization, bio))")
      .eq("hospital_id", hospital.id);
    setHospitalDoctors(data || []);
    setBookingOpen(true);
  };

  const startConsultation = async () => {
    if (!selectedDoctor) {
      toast({ title: "Please select a doctor", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) throw new Error("Not authenticated");

      const { data, error } = await supabase.from("consultations").insert({
        patient_id: u.id,
        doctor_id: selectedDoctor.doctor.id,
        hospital_id: selectedHospital.id,
        status: "active",
        chief_complaint: complaint.trim() || null,
      }).select().single();

      if (error) throw error;

      toast({ title: "Consultation started!" });
      setBookingOpen(false);
      navigate(`/consultation/${data.id}`);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeConsultations = consultations.filter(c => c.status === "active");

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background mesh-bg">
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-border/30">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center shadow-soft">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm text-gradient">Medweb Care</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileDialogOpen(true)}
              className="text-muted-foreground hover:text-foreground gap-1.5"
            >
              <div className="w-6 h-6 bg-gradient-hero rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.full_name?.[0] || "U"}
              </div>
              <span className="hidden sm:inline">{user?.full_name?.split(" ")[0] || "Profile"}</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-8 max-w-5xl">
        {/* Welcome + stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Hello, {user?.full_name?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">How are you feeling today?</p>
          </div>
          <div className="flex gap-3">
            <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{activeConsultations.length}</p>
                <p className="text-[11px] text-muted-foreground">Active</p>
              </div>
            </div>
            <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{consultations.length}</p>
                <p className="text-[11px] text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active consultations */}
        <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> My Consultations
            </h2>
          </div>
          {consultations.length === 0 ? (
            <Card className="border-dashed border-2 border-border/50 bg-muted/20">
              <CardContent className="text-center py-12 text-muted-foreground">
                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="font-medium">No consultations yet</p>
                <p className="text-sm mt-1">Find a hospital below to start your first consultation</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {consultations.map((c, i) => (
                <Card
                  key={c.id}
                  className="cursor-pointer glass-card hover-lift border-border/50 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${150 + i * 50}ms` }}
                  onClick={() => navigate(`/consultation/${c.id}`)}
                  data-testid={`consultation-${c.id}`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-soft">
                        {c.doctor?.full_name?.[0] || "D"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">Dr. {c.doctor?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.doctor?.doctor_profiles?.[0]?.specialization || "General Practice"}
                          {c.hospital?.name && ` · ${c.hospital.name}`}
                        </p>
                        {c.chief_complaint && (
                          <p className="text-xs text-muted-foreground/70 mt-0.5 italic">"{c.chief_complaint}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={c.status === "active" ? "default" : "secondary"}
                        className={`text-xs ${c.status === "active" ? "bg-secondary/15 text-secondary border-secondary/20" : ""}`}
                      >
                        {c.status}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Find a hospital */}
        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Find a Hospital
            </h2>
          </div>
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hospitals..."
              className="pl-10 h-11 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-hospitals"
            />
          </div>
          {filteredHospitals.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Building2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm">No hospitals found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHospitals.map((h, i) => (
                <Card
                  key={h.id}
                  className="cursor-pointer glass-card hover-lift border-border/50 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${250 + i * 50}ms` }}
                  onClick={() => openBooking(h)}
                  data-testid={`hospital-${h.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="w-11 h-11 bg-gradient-hero rounded-xl flex items-center justify-center mb-2 shadow-soft">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-base">{h.name}</CardTitle>
                    {h.address && <CardDescription className="text-xs">{h.address}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-hero hover:opacity-90 shadow-soft transition-all duration-300 gap-1.5"
                      onClick={(e) => { e.stopPropagation(); openBooking(h); }}
                    >
                      <Plus className="h-3.5 w-3.5" /> Start Consultation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Start consultation dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-md glass-strong">
          <DialogHeader>
            <DialogTitle className="text-lg">Start a Consultation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-medium">{selectedHospital?.name}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Select a Doctor</Label>
              {hospitalDoctors.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-xl">
                  <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No doctors available yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {hospitalDoctors.map((hd) => (
                    <button
                      key={hd.id}
                      type="button"
                      onClick={() => setSelectedDoctor(hd)}
                      data-testid={`select-doctor-${hd.doctor?.id}`}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                        selectedDoctor?.id === hd.id
                          ? "border-primary bg-primary/5 shadow-soft"
                          : "border-border hover:border-primary/30 bg-background"
                      }`}
                    >
                      <div className="w-9 h-9 bg-gradient-hero rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-soft">
                        {hd.doctor?.full_name?.[0] || "D"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">Dr. {hd.doctor?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {hd.doctor?.doctor_profiles?.[0]?.specialization || "General Practice"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaint" className="text-sm font-medium">Chief Complaint (optional)</Label>
              <Textarea
                id="complaint"
                placeholder="Briefly describe your symptoms..."
                rows={3}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                className="bg-background resize-none"
                data-testid="input-complaint"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1 h-10" onClick={() => setBookingOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 h-10 bg-gradient-hero hover:opacity-90 shadow-soft transition-all duration-300"
                onClick={startConsultation}
                disabled={creating || !selectedDoctor}
                data-testid="button-start-consultation"
              >
                {creating ? "Starting..." : "Start Consultation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ProfileSettingsDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        onProfileUpdated={init}
      />
    </div>
  );
};

export default PatientDashboard;
