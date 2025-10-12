import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface BookingDialogProps {
  doctor: any;
  open: boolean;
  onClose: () => void;
}

const BookingDialog = ({ doctor, open, onClose }: BookingDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select a date and time",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":");
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase.from("appointments").insert({
        patient_id: user.id,
        doctor_id: doctor.id,
        appointment_date: appointmentDateTime.toISOString(),
        notes: notes,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Appointment booked!",
        description: "Your appointment has been scheduled successfully.",
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
          <DialogTitle>Book Appointment with Dr. {doctor.profile.full_name}</DialogTitle>
          <DialogDescription>{doctor.specialization}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Select Date</Label>
            <div className="border rounded-lg p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md"
              />
            </div>
          </div>

          {selectedDate && (
            <div className="space-y-2">
              <Label>Select Time</Label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Describe your symptoms or reason for consultation..."
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {doctor.consultation_fee && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Consultation Fee</p>
                <p className="text-2xl font-bold text-primary">₦{Number(doctor.consultation_fee).toLocaleString()}</p>
              </div>
              {doctor.bank_name && doctor.account_number && (
                <div className="text-sm border-t pt-2 mt-2">
                  <p className="font-medium">Payment Details:</p>
                  <p className="text-muted-foreground">{doctor.bank_name}</p>
                  <p className="text-muted-foreground">{doctor.account_number}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleBooking} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
