import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Video, LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PatientDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

    if (profile?.role !== "patient") {
      navigate("/doctor-dashboard");
      return;
    }

    setUser(profile);
    setLoading(false);
  };

  const fetchAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("appointments")
      .select(`
        *,
        doctor:doctor_id (
          full_name,
          doctor_profiles (
            specialization
          )
        )
      `)
      .eq("patient_id", user.id)
      .order("appointment_date", { ascending: true });

    setAppointments(data || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
              Welcome, {user?.full_name}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-medium transition-shadow cursor-pointer" onClick={() => navigate("/doctors")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Book Appointment
              </CardTitle>
              <CardDescription>Find and book with verified doctors</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-medium transition-shadow cursor-pointer" onClick={() => navigate("/medical-records")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Medical Records
              </CardTitle>
              <CardDescription>View your medical history</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-medium transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Settings
              </CardTitle>
              <CardDescription>Update your information</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled consultations</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No appointments scheduled yet</p>
                <Button className="mt-4" onClick={() => navigate("/doctors")}>
                  Book Your First Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">{appointment.doctor.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.doctor.doctor_profiles?.[0]?.specialization}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.appointment_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4 mr-2" />
                        Join Call
                      </Button>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;
