-- Add lab_tech to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'lab_tech';

-- Add education_level to profiles for students
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_level public.education_level DEFAULT NULL;

-- Create a function to get user's education level
CREATE OR REPLACE FUNCTION public.get_user_education_level(_user_id uuid)
RETURNS public.education_level
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT education_level FROM public.profiles WHERE id = _user_id
$$;