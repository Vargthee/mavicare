-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'patient');

-- Create user_roles table with proper structure
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::text::app_role 
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Update handle_new_user trigger to use user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles without role
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  
  -- Insert role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient')
  );
  
  RETURN NEW;
END;
$$;

-- RLS Policies for user_roles table
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Update profiles RLS policies to remove role-based access
DROP POLICY IF EXISTS "Users can view doctor profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view appointment-related profile basics via view" ON public.profiles;

-- Recreate profiles policies using has_role function
CREATE POLICY "Users can view verified doctor profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT id FROM public.doctor_profiles WHERE verified = true
  )
);

CREATE POLICY "Users can view profiles in their appointments"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM appointments
    WHERE (patient_id = auth.uid() AND doctor_id = profiles.id)
       OR (doctor_id = auth.uid() AND patient_id = profiles.id)
  )
);

-- Update medical_records policies to use has_role
DROP POLICY IF EXISTS "Doctors can create medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Doctors can update medical records they created" ON public.medical_records;

CREATE POLICY "Doctors can create medical records"
ON public.medical_records
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'doctor') AND auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own medical records"
ON public.medical_records
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'doctor') AND auth.uid() = doctor_id);

-- Add policy for patients to view their records
CREATE POLICY "Users can view their medical records"
ON public.medical_records
FOR SELECT
TO authenticated
USING (auth.uid() = patient_id OR (public.has_role(auth.uid(), 'doctor') AND auth.uid() = doctor_id));