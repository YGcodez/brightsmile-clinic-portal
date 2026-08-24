CREATE EXTENSION IF NOT EXISTS pgcrypto;
ALTER TABLE public.clinic_settings ADD COLUMN api_key text NOT NULL DEFAULT encode(gen_random_bytes(24),'hex');
UPDATE public.clinic_settings SET api_key = encode(gen_random_bytes(24),'hex') WHERE api_key IS NULL;