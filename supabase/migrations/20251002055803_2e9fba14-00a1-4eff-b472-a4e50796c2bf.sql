-- Fix the SECURITY DEFINER warning on the view
-- Recreate the view with SECURITY INVOKER (the default, but we'll be explicit)
DROP VIEW IF EXISTS public.public_doctor_profiles;

CREATE VIEW public.public_doctor_profiles
WITH (security_invoker = true)
AS
SELECT 
  id,
  bio,
  specialization,
  years_of_experience,
  consultation_fee,
  verified,
  available_days,
  available_hours
FROM public.doctor_profiles
WHERE verified = true;

-- Grant access to the view
GRANT SELECT ON public.public_doctor_profiles TO authenticated;
GRANT SELECT ON public.public_doctor_profiles TO anon;