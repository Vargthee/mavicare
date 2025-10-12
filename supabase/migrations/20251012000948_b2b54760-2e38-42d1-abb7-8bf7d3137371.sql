-- Add Nigerian bank account number field to doctor_profiles
ALTER TABLE public.doctor_profiles
ADD COLUMN account_number text,
ADD COLUMN bank_name text;