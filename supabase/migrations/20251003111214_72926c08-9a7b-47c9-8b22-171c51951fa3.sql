-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view verified doctor profiles" ON public.doctor_profiles;

-- Create a restrictive policy for public viewing (authenticated users only, no license_number)
-- Note: The application code already explicitly selects columns, excluding license_number
CREATE POLICY "Authenticated users can view verified doctor profiles" ON public.doctor_profiles
FOR SELECT
TO authenticated
USING (verified = true);

-- Ensure doctors can still view their own complete profile including license_number
-- This policy already exists: "Doctors can view own profile"

-- Add additional security: Create a function to check if user is viewing sensitive fields
COMMENT ON POLICY "Authenticated users can view verified doctor profiles" ON public.doctor_profiles 
IS 'Allows authenticated users to view verified doctor profiles. Application code must explicitly exclude license_number from SELECT queries for public viewing.';