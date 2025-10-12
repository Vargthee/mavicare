-- Update doctor_public_info view to include bank details
DROP VIEW IF EXISTS public.doctor_public_info;

CREATE VIEW public.doctor_public_info AS
SELECT 
  dp.id,
  dp.specialization,
  dp.bio,
  dp.years_of_experience,
  dp.consultation_fee,
  dp.available_days,
  dp.available_hours,
  dp.verified,
  dp.bank_name,
  dp.account_number,
  p.full_name,
  p.avatar_url
FROM public.doctor_profiles dp
LEFT JOIN public.profiles p ON dp.id = p.id
WHERE dp.verified = true;

-- Grant access to authenticated users
GRANT SELECT ON public.doctor_public_info TO authenticated;