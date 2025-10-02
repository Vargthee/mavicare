-- Fix security issue: Restrict profile visibility
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create more restrictive policies for profiles table
-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 2. Users can view doctor profiles (needed for appointment booking)
CREATE POLICY "Users can view doctor profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_profiles
    WHERE doctor_profiles.id = profiles.id
    AND doctor_profiles.verified = true
  )
);

-- 3. Users can view profiles of people they have appointments with
CREATE POLICY "Users can view appointment-related profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.appointments
    WHERE (appointments.patient_id = auth.uid() AND appointments.doctor_id = profiles.id)
       OR (appointments.doctor_id = auth.uid() AND appointments.patient_id = profiles.id)
  )
);

-- Fix security issue: Protect doctor license numbers
-- Create a view for public doctor information that excludes sensitive data
CREATE OR REPLACE VIEW public.public_doctor_profiles AS
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