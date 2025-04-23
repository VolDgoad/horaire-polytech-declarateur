
-- Create safer SQL functions to fetch data without RLS recursion

-- Function to get all departments
CREATE OR REPLACE FUNCTION public.get_all_departments()
RETURNS SETOF departements
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT * FROM public.departements;
$$;

-- Function to get all ECs (courses)
CREATE OR REPLACE FUNCTION public.get_all_ecs()
RETURNS SETOF ec
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT * FROM public.ec;
$$;

-- Function to get all fiches (declarations)
CREATE OR REPLACE FUNCTION public.get_all_fiches()
RETURNS SETOF fiches
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT * FROM public.fiches;
$$;
