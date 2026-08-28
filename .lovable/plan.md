# Patient accounts for Bright Smile Dental

Add a patient sign-in / registration portal on top of the existing site. Nothing currently on the site changes: home, about, booking, the staff `/admin` dashboard, the n8n API and the automation fields all stay exactly as they are.

## Patient entry screen (`/patient`)

One clean page in the existing blue/white style with two clear choices: "I'm a new patient" and "I'm an existing patient". Responsive on desktop, tablet and mobile, with loading states and buttons that disable while submitting.

- New patient form: first name, last name, email, phone, date of birth, password, confirm password.
- Existing patient form: email + password.
- Already signed in? The page sends them straight to the dashboard.

Email confirmation will be switched off so a new patient is signed in immediately after registering.

## Patient ID

Every patient record gets a permanent, human-readable ID in the form `CLN-XXXXXX`, created by the database itself from a counter — never by the browser, never regenerated on login. The column carries a uniqueness constraint, so two patients can never share an ID.

## Database changes (extending the existing `patients` table)

Add to the existing table rather than making a second patient system:

- `user_id` — links to the login account (unique)
- `patient_id` — `CLN-XXXXXX`, unique, auto-filled by the database
- `first_name`, `last_name`, `date_of_birth`, `updated_at`

The existing `name`, `email`, `phone`, `created_at` columns are reused; `name` keeps being filled automatically from first + last name so the booking flow, `/admin` table and the n8n API keep working unchanged. Existing rows created by public bookings get a patient ID too, and stay linked to their appointments.

Access rules: a signed-in patient can read and update only their own record; staff keep full access as today. There is no way to read another patient's row by changing an ID or URL.

## Patient dashboard (`/patient/dashboard`)

Protected — signed-out visitors are redirected to `/patient`, and the session survives a page refresh. Shows:

- "Welcome, [First name]" and the Patient ID in a prominent card
- Basic details: full name, email, phone, date of birth, member since
- Placeholder cards for the future scheduling work: Book appointment, Upcoming appointments, Past appointments, Reschedule, Cancel, Profile — labelled "coming soon", no functionality built yet
- Sign out, which fully clears the session

A "Patient portal" link is added to the site header/footer next to the existing navigation.

## Error handling

Friendly messages only, no raw database errors: email already registered, wrong email or password, missing fields, invalid email, passwords don't match, something went wrong saving, and a recovery path if an account somehow has no patient record (the record is created on the spot).

## Ready for n8n

Patient ID, name, email, phone and the auth user ID all live on one row, so future automation can look a patient up by `CLN-XXXXXX` and tie them to appointments.

## Technical notes

- Migration: `alter table public.patients` with the new columns, a `patient_id_seq` sequence + `gen_patient_id()` default (`'CLN-' || lpad(nextval::text, 6, '0')`), unique indexes on `patient_id` and `user_id`, backfill for existing rows, `set_updated_at` trigger, a name-sync trigger, and patient-scoped RLS policies (`auth.uid() = user_id`) alongside the existing staff policies. Grants for `authenticated`.
- `supabase--configure_auth` with `auto_confirm_email: true`.
- New: `src/lib/patient.functions.ts` (`registerPatient` via admin client after validation; `getMyPatientRecord` behind `requireSupabaseAuth`), `src/routes/patient.tsx` (public entry), `src/routes/_authenticated/route.tsx` + `src/routes/_authenticated/patient.dashboard.tsx` — or an equivalent gated route so the dashboard is client-gated and redirects to `/patient`.
- Zod validation on both client and server; sign-in uses `supabase.auth.signInWithPassword`.

## Verification

Register a patient, check the ID, sign out, sign back in and confirm the same ID; register a second patient and confirm a different ID; confirm one patient cannot read the other's record.
