-- Fix Security Issue #1: Remove role column from profiles table
-- The role column in profiles is redundant with user_roles table and creates privilege escalation risk

-- Drop the dependent view first
DROP VIEW IF EXISTS public.appointment_profiles CASCADE;

-- Update the handle_new_user trigger to not insert role into profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Insert into profiles WITHOUT role column
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  
  -- Insert role into user_roles table (separate table for security)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient')
  );
  
  RETURN NEW;
END;
$function$;

-- Now drop the role column from profiles table
ALTER TABLE public.profiles DROP COLUMN role;

-- Recreate appointment_profiles view without the role column
CREATE OR REPLACE VIEW public.appointment_profiles AS
SELECT 
  p.id,
  p.full_name,
  p.avatar_url,
  p.created_at
FROM public.profiles p;

-- Grant access to the view
GRANT SELECT ON public.appointment_profiles TO authenticated;

-- Fix Security Issue #2: Restrict doctor profile visibility
-- Drop the overly permissive policy that exposes all profile data
DROP POLICY IF EXISTS "Users can view verified doctor profiles" ON public.profiles;

-- Create a restricted view for public doctor information (only safe fields)
CREATE OR REPLACE VIEW public.doctor_public_info AS
SELECT 
  p.id,
  p.full_name,
  p.avatar_url,
  dp.specialization,
  dp.bio,
  dp.years_of_experience,
  dp.consultation_fee,
  dp.available_days,
  dp.available_hours,
  dp.verified
FROM public.profiles p
INNER JOIN public.doctor_profiles dp ON p.id = dp.id
WHERE dp.verified = true;

-- Allow authenticated users to view the limited doctor info view
GRANT SELECT ON public.doctor_public_info TO authenticated;

-- Add a more restrictive policy for viewing doctor profiles via appointments
-- This ensures users can only see necessary contact info for their own appointments
CREATE POLICY "Users can view doctor contact info for their appointments" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT doctor_id 
    FROM appointments 
    WHERE patient_id = auth.uid()
  )
);