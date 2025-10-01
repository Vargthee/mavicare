import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Upload, Download, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UploadRecordDialog from "@/components/UploadRecordDialog";

const MedicalRecords = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchRecords();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setUserRole(profile?.role || "");
  };

  const fetchRecords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("medical_records")
        .select(`
          *,
          patient:patient_id (
            full_name,
            email
          ),
          doctor:doctor_id (
            full_name,
            doctor_profiles (
              specialization
            )
          )
        `)
        .order("created_at", { ascending: false });

      // Filter based on user role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "patient") {
        query = query.eq("patient_id", user.id);
      } else if (profile?.role === "doctor") {
        query = query.eq("doctor_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load medical records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileUrl: string, title: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("medical-files")
        .download(fileUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = title;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading records...</div>;
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
              Medical Records
            </h1>
          </div>
          <div className="flex gap-2">
            {userRole === "doctor" && (
              <Button onClick={() => setShowUpload(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Record
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(userRole === "doctor" ? "/doctor-dashboard" : "/patient-dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {records.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">No medical records yet</p>
              {userRole === "doctor" && (
                <Button onClick={() => setShowUpload(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload First Record
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id} className="hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {record.title}
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4" />
                          <span>Patient: {record.patient.full_name}</span>
                        </div>
                        {record.doctor && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4" />
                            <span>Doctor: Dr. {record.doctor.full_name}</span>
                            {record.doctor.doctor_profiles?.[0] && (
                              <Badge variant="secondary" className="ml-2">
                                {record.doctor.doctor_profiles[0].specialization}
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(record.created_at).toLocaleDateString()}</span>
                        </div>
                      </CardDescription>
                    </div>
                    {record.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(record.file_url, record.title)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {record.description && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Description</p>
                      <p className="text-sm text-muted-foreground">{record.description}</p>
                    </div>
                  )}
                  {record.diagnosis && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Diagnosis</p>
                      <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                    </div>
                  )}
                  {record.prescription && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Prescription</p>
                      <p className="text-sm text-muted-foreground">{record.prescription}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showUpload && (
        <UploadRecordDialog
          open={showUpload}
          onClose={() => {
            setShowUpload(false);
            fetchRecords();
          }}
        />
      )}
    </div>
  );
};

export default MedicalRecords;
