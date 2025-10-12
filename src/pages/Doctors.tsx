import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, DollarSign, Clock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BookingDialog from "@/components/BookingDialog";

const Doctors = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, doctors]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const fetchDoctors = async () => {
    try {
      // Use the secure doctor_public_info view that only exposes safe fields
      const { data, error } = await supabase
        .from("doctor_public_info")
        .select("*");

      if (error) throw error;
      
      // Transform data to match expected structure
      const formattedDoctors = (data || []).map((doc: any) => ({
        id: doc.id,
        bio: doc.bio,
        specialization: doc.specialization,
        years_of_experience: doc.years_of_experience,
        consultation_fee: doc.consultation_fee,
        verified: doc.verified,
        available_days: doc.available_days,
        available_hours: doc.available_hours,
        profile: {
          id: doc.id,
          full_name: doc.full_name,
          avatar_url: doc.avatar_url
        }
      }));
      
      setDoctors(formattedDoctors);
      setFilteredDoctors(formattedDoctors);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    if (!searchQuery) {
      setFilteredDoctors(doctors);
      return;
    }

    const filtered = doctors.filter(
      (doctor) =>
        doctor.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDoctors(filtered);
  };

  const handleBookAppointment = (doctor: any) => {
    setSelectedDoctor(doctor);
    setShowBooking(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-14 max-w-2xl mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-10 w-full mt-4" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Find Doctors
            </h1>
          </div>
          <Button onClick={() => navigate("/patient-dashboard")}>Dashboard</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or specialization..."
              className="pl-12 h-14 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-base sm:text-lg">No doctors found matching your search</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground">
                        {doctor.profile.full_name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-xl">Dr. {doctor.profile.full_name}</CardTitle>
                        <CardDescription className="mt-1">
                          <Badge variant="secondary" className="mt-1">
                            {doctor.specialization}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{doctor.bio}</p>
                  )}
                  
                  <div className="space-y-2 pt-2 border-t">
                    {doctor.years_of_experience && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{doctor.years_of_experience} years experience</span>
                      </div>
                    )}
                    
                    {doctor.consultation_fee && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span>₦{Number(doctor.consultation_fee).toLocaleString()} per consultation</span>
                      </div>
                    )}
                    
                    {doctor.available_days && doctor.available_days.length > 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {doctor.available_days.map((day: string) => (
                            <Badge key={day} variant="outline" className="text-xs">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full mt-4"
                    onClick={() => handleBookAppointment(doctor)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showBooking && selectedDoctor && (
        <BookingDialog
          doctor={selectedDoctor}
          open={showBooking}
          onClose={() => {
            setShowBooking(false);
            setSelectedDoctor(null);
          }}
        />
      )}
    </div>
  );
};

export default Doctors;
