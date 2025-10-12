-- Add medical vitals and history columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN blood_type text,
ADD COLUMN height_cm numeric,
ADD COLUMN weight_kg numeric,
ADD COLUMN allergies text,
ADD COLUMN chronic_conditions text,
ADD COLUMN current_medications text,
ADD COLUMN medical_history text;