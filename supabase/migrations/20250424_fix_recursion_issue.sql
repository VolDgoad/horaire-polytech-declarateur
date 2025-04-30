
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

-- Function to get all filieres
CREATE OR REPLACE FUNCTION public.get_all_filieres()
RETURNS SETOF filieres
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT * FROM public.filieres;
$$;

-- Function to get all niveaux
CREATE OR REPLACE FUNCTION public.get_all_niveaux()
RETURNS SETOF niveaux
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT * FROM public.niveaux;
$$;

-- Function to get all semestres
CREATE OR REPLACE FUNCTION public.get_all_semestres()
RETURNS SETOF semestres
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT * FROM public.semestres;
$$;

-- Function to get all UEs
CREATE OR REPLACE FUNCTION public.get_all_ues()
RETURNS SETOF ue
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT * FROM public.ue;
$$;
