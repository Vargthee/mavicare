import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Users, LogOut, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DoctorProfileSetup from "@/components/DoctorProfileSetup";

const DoctorDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchAppointments();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "doctor") {
      navigate("/patient-dashboard");
      return;
    }

    const { data: docProfile } = await supabase
      .from("doctor_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setUser(profile);
    setDoctorProfile(docProfile);
    
    if (!docProfile) {
      setShowProfileSetup(true);
    }
    
    setLoading(false);
  };

  const fetchAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("appointments")
      .select(`
        *,
        patient:patient_id (
          full_name,
          email
        )
      `)
      .eq("doctor_id", user.id)
      .order("appointment_date", { ascending: true });

    setAppointments(data || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleProfileComplete = () => {
    setShowProfileSetup(false);
    checkUser();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (showProfileSetup) {
    return <DoctorProfileSetup onComplete={handleProfileComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex flex-wrap justify-between items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            MaviCare
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm sm:text-base text-muted-foreground truncate max-w-[150px] sm:max-w-none">
              Dr. {user?.full_name}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {appointments.filter(a => 
                  new Date(a.appointment_date).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {new Set(appointments.map(a => a.patient_id)).size}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {appointments.filter(a => 
                  new Date(a.appointment_date) > new Date()
                ).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">
                {appointments.filter(a => a.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.filter(a => 
              new Date(a.appointment_date).toDateString() === new Date().toDateString()
            ).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments
                  .filter(a => 
                    new Date(a.appointment_date).toDateString() === new Date().toDateString()
                  )
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{appointment.patient.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.appointment_date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">Start Consultation</Button>
                        <Button size="sm" variant="outline" onClick={() => navigate("/medical-records")}>
                          View Records
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-medium transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Manage Schedule
              </CardTitle>
              <CardDescription>Update your availability</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-medium transition-shadow cursor-pointer" onClick={() => navigate("/medical-records")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Patient Records
              </CardTitle>
              <CardDescription>Access medical histories</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-medium transition-shadow cursor-pointer" onClick={() => setShowProfileSetup(true)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Profile Settings
              </CardTitle>
              <CardDescription>Update your information</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
