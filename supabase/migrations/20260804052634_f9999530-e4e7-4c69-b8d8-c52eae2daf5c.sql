CREATE OR REPLACE FUNCTION public.list_directory()
RETURNS TABLE (id uuid, full_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name FROM public.profiles p ORDER BY p.full_name
$$;

REVOKE EXECUTE ON FUNCTION public.list_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_directory() TO authenticated, service_role;