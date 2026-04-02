-- Add hospital_admin to app_role enum
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE 'hospital_admin';
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN others THEN null;
END $$;

-- Hospitals table
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link doctors to hospitals
CREATE TABLE IF NOT EXISTS public.hospital_doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hospital_id, doctor_id)
);

-- Consultations (real-time care sessions)
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending')),
  chief_complaint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages within consultations
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'voice_note', 'system')),
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Hospital policies
CREATE POLICY "Anyone can view hospitals" ON public.hospitals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Hospital admins can insert hospital" ON public.hospitals
  FOR INSERT TO authenticated WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Hospital admins can update their hospital" ON public.hospitals
  FOR UPDATE TO authenticated USING (admin_id = auth.uid());

-- Hospital doctors policies
CREATE POLICY "Anyone can view hospital doctors" ON public.hospital_doctors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Hospital admin can add doctors" ON public.hospital_doctors
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.hospitals WHERE id = hospital_id AND admin_id = auth.uid()));

CREATE POLICY "Hospital admin can remove doctors" ON public.hospital_doctors
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hospitals WHERE id = hospital_id AND admin_id = auth.uid()));

-- Consultations policies
CREATE POLICY "Participants can view consultations" ON public.consultations
  FOR SELECT TO authenticated
  USING (patient_id = auth.uid() OR doctor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.hospitals WHERE id = hospital_id AND admin_id = auth.uid()));

CREATE POLICY "Patients can create consultations" ON public.consultations
  FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Participants can update consultations" ON public.consultations
  FOR UPDATE TO authenticated
  USING (patient_id = auth.uid() OR doctor_id = auth.uid());

-- Messages policies
CREATE POLICY "Participants can view messages" ON public.messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.consultations c
    WHERE c.id = consultation_id AND (c.patient_id = auth.uid() OR c.doctor_id = auth.uid())
  ));

CREATE POLICY "Participants can send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.consultations c
    WHERE c.id = consultation_id AND (c.patient_id = auth.uid() OR c.doctor_id = auth.uid())
  ));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;
