ALTER TABLE public.appointments
  ADD COLUMN confirmed_datetime timestamp with time zone,
  ADD COLUMN confirmation_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN reminder_24h_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN reminder_2h_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN reminder_30m_sent boolean NOT NULL DEFAULT false;