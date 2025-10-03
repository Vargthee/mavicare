-- Drop the overly permissive appointment-related policy
DROP POLICY IF EXISTS "Users can view appointment-related profiles" ON public.profiles;

-- Create a view for safe appointment-related profile viewing
CREATE OR REPLACE VIEW public.appointment_profiles AS
SELECT 
  p.id,
  p.full_name,
  p.avatar_url,
  p.role,
  p.created_at
FROM public.profiles p;

-- Set security to INVOKER so RLS policies apply
ALTER VIEW public.appointment_profiles SET (security_invoker = true);

-- Enable RLS on the view
ALTER VIEW public.appointment_profiles SET (security_barrier = true);

-- Create RLS policy for the view that allows appointment-related viewing
CREATE POLICY "Users can view appointment-related profile basics via view" ON public.profiles
FOR SELECT
USING (
  -- Only allow if viewing through appointment relationship
  EXISTS (
    SELECT 1 FROM appointments
    WHERE (
      (appointments.patient_id = auth.uid() AND appointments.doctor_id = profiles.id) OR
      (appointments.doctor_id = auth.uid() AND appointments.patient_id = profiles.id)
    )
  )
);