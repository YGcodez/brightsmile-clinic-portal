ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE SEQUENCE IF NOT EXISTS public.patient_id_seq START 100001;

CREATE OR REPLACE FUNCTION public.gen_patient_id()
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT 'CLN-' || lpad(nextval('public.patient_id_seq')::text, 6, '0');
$$;

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS patient_id text NOT NULL DEFAULT public.gen_patient_id();

UPDATE public.patients
SET first_name = COALESCE(first_name, split_part(name, ' ', 1)),
    last_name = COALESCE(last_name, NULLIF(substring(name from position(' ' in name) + 1), name))
WHERE first_name IS NULL OR last_name IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS patients_patient_id_key ON public.patients (patient_id);
CREATE UNIQUE INDEX IF NOT EXISTS patients_user_id_key ON public.patients (user_id) WHERE user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_patient_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL THEN
    NEW.name = btrim(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS patients_sync_name ON public.patients;
CREATE TRIGGER patients_sync_name
BEFORE INSERT OR UPDATE OF first_name, last_name ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.sync_patient_name();

DROP TRIGGER IF EXISTS patients_set_updated_at ON public.patients;
CREATE TRIGGER patients_set_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
GRANT USAGE ON SEQUENCE public.patient_id_seq TO service_role;

DROP POLICY IF EXISTS "Patients can view own record" ON public.patients;
CREATE POLICY "Patients can view own record"
ON public.patients FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can update own record" ON public.patients;
CREATE POLICY "Patients can update own record"
ON public.patients FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);