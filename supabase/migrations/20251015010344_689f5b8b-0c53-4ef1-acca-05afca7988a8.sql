-- Make email and full_name nullable to support anonymous users
ALTER TABLE public.profiles 
ALTER COLUMN email DROP NOT NULL,
ALTER COLUMN full_name DROP NOT NULL;