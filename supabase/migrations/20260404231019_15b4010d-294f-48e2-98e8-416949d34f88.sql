
-- Add hospital_admin to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hospital_admin';

-- Create hospitals table
CREATE TABLE public.hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  email text,
  admin_id uuid NOT NULL,
  subscription_plan text NOT NULL DEFAULT 'basic',
  subscription_status text NOT NULL DEFAULT 'trial',
  subscription_expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create hospital_doctors junction table
CREATE TABLE public.hospital_doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(hospital_id, doctor_id)
);

-- Create consultations table
CREATE TABLE public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  hospital_id uuid REFERENCES public.hospitals(id),
  status text NOT NULL DEFAULT 'active',
  chief_complaint text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text,
  message_type text NOT NULL DEFAULT 'text',
  media_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Hospitals RLS
CREATE POLICY "Hospital admins can manage own hospital" ON public.hospitals
  FOR ALL TO authenticated
  USING (auth.uid() = admin_id)
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can view all hospitals" ON public.hospitals
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all hospitals" ON public.hospitals
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Hospital doctors RLS
CREATE POLICY "Hospital admins can manage doctors" ON public.hospital_doctors
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hospitals WHERE id = hospital_id AND admin_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.hospitals WHERE id = hospital_id AND admin_id = auth.uid()));

CREATE POLICY "Doctors can view own hospital link" ON public.hospital_doctors
  FOR SELECT TO authenticated
  USING (auth.uid() = doctor_id);

-- Consultations RLS
CREATE POLICY "Participants can view consultations" ON public.consultations
  FOR SELECT TO authenticated
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Patients can create consultations" ON public.consultations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Participants can update consultations" ON public.consultations
  FOR UPDATE TO authenticated
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Hospital admins can view hospital consultations" ON public.consultations
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hospitals WHERE id = hospital_id AND admin_id = auth.uid()));

-- Messages RLS
CREATE POLICY "Consultation participants can view messages" ON public.messages
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.consultations WHERE id = consultation_id AND (patient_id = auth.uid() OR doctor_id = auth.uid())));

CREATE POLICY "Consultation participants can send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.consultations WHERE id = consultation_id AND (patient_id = auth.uid() OR doctor_id = auth.uid())));

-- Update handle_new_user to support hospital_admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient')
  );
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update has_role to work with new roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
