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
  Stethoscope, ChevronRight, Plus
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
    // Also fetch active ones
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm bg-gradient-hero bg-clip-text text-transparent">Medweb Care</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setProfileDialogOpen(true)}>
              <User className="h-4 w-4 mr-1" />
              {user?.full_name?.split(" ")[0] || "Profile"}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Active consultations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> My Consultations
            </h2>
          </div>
          {consultations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-10 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No consultations yet</p>
                <p className="text-sm">Find a hospital below to start your first consultation</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {consultations.map((c) => (
                <Card
                  key={c.id}
                  className="cursor-pointer hover:shadow-medium transition-shadow"
                  onClick={() => navigate(`/consultation/${c.id}`)}
                  data-testid={`consultation-${c.id}`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {c.doctor?.full_name?.[0] || "D"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">Dr. {c.doctor?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.doctor?.doctor_profiles?.[0]?.specialization || "General Practice"}
                          {c.hospital?.name && ` · ${c.hospital.name}`}
                        </p>
                        {c.chief_complaint && (
                          <p className="text-xs text-muted-foreground mt-0.5">"{c.chief_complaint}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-xs">
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
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Find a Hospital
            </h2>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hospitals..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-hospitals"
            />
          </div>
          {filteredHospitals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No hospitals found</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHospitals.map((h) => (
                <Card
                  key={h.id}
                  className="cursor-pointer hover:shadow-medium transition-shadow hover-lift"
                  onClick={() => openBooking(h)}
                  data-testid={`hospital-${h.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center mb-2">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-base">{h.name}</CardTitle>
                    {h.address && <CardDescription className="text-xs">{h.address}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); openBooking(h); }}>
                      <Plus className="h-3 w-3 mr-1" /> Start Consultation
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start a Consultation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground font-medium">{selectedHospital?.name}</p>

            <div className="space-y-2">
              <Label>Select a Doctor</Label>
              {hospitalDoctors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No doctors available at this hospital yet.</p>
              ) : (
                <div className="space-y-2">
                  {hospitalDoctors.map((hd) => (
                    <button
                      key={hd.id}
                      type="button"
                      onClick={() => setSelectedDoctor(hd)}
                      data-testid={`select-doctor-${hd.doctor?.id}`}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                        selectedDoctor?.id === hd.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="w-9 h-9 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
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
              <Label htmlFor="complaint">Chief Complaint (optional)</Label>
              <Textarea
                id="complaint"
                placeholder="Briefly describe your symptoms or reason for consultation..."
                rows={3}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                data-testid="input-complaint"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setBookingOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
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
