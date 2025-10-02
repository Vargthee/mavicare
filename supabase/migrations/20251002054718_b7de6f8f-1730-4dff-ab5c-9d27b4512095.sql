-- Ensure user_role type exists
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('patient', 'doctor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Ensure appointment_status type exists
DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;