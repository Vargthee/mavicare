import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

interface UploadRecordDialogProps {
  open: boolean;
  onClose: () => void;
}

const UploadRecordDialog = ({ open, onClose }: UploadRecordDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    diagnosis: "",
    prescription: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPatients();
    }
  }, [open]);

  const fetchPatients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get patients from appointments
    const { data } = await supabase
      .from("appointments")
      .select("patient_id")
      .eq("doctor_id", user.id);

    if (data) {
      const patientIds = [...new Set(data.map(item => item.patient_id))];
      
      const { data: patientData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", patientIds);
      
      setPatients(patientData || []);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast({
        title: "Missing information",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let fileUrl = null;

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("medical-files")
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        fileUrl = fileName;
      }

      // Create medical record
      const { error } = await supabase.from("medical_records").insert({
        patient_id: selectedPatient,
        doctor_id: user.id,
        title: formData.title,
        description: formData.description,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        file_url: fileUrl,
        file_type: file?.type || null,
      });

      if (error) throw error;

      toast({
        title: "Record uploaded!",
        description: "Medical record has been saved successfully.",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Medical Record</DialogTitle>
          <DialogDescription>Add a new medical record for a patient</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Select Patient *</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Record Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Annual Checkup Report"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="General notes about the record..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              placeholder="Medical diagnosis..."
              rows={3}
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prescription">Prescription</Label>
            <Textarea
              id="prescription"
              placeholder="Prescribed medications and instructions..."
              rows={3}
              value={formData.prescription}
              onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Attach File (Optional)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {file && (
                <span className="text-sm text-muted-foreground">{file.name}</span>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Record
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadRecordDialog;
