# Bright Smile Dental — clinic site + booking system

A modern private dental clinic site with a real booking database, a staff admin area, and secured API endpoints so n8n can read and update appointments.

## Pages

**Home (`/`)**
- Hero with clinic promise and a prominent "Book Appointment" CTA
- Services grid: General Check-ups, Teeth Whitening, Dental Implants, Root Canal Therapy, Orthodontics/Invisalign, Emergency Dentistry
- Meet the Team: 3 fictional dentists (name, specialty, short bio, generated portrait)
- Testimonials: 5 fictional 5-star patient reviews
- Footer with fictional address, phone, hours, map-style location block

**About (`/about`)** — clinic story, values, opening hours table, location and directions.

**Book (`/book`)** — real appointment form: full name, email, phone, service dropdown, preferred date (date picker, no past dates), preferred time (Morning / Afternoon / Evening), optional notes. Validated on the client and again on the server, then written to the database with a confirmation screen.

**Admin (`/admin`)** — staff-only, behind email + password login. Table of all appointments (patient name, service, date, time, status), sortable by date, with status filter and inline status change (requested / confirmed / reminded / completed / no_show / cancelled).

## Database (Lovable Cloud)

`patients` — id, name, email (unique), phone, created_at
`appointments` — id, patient_id → patients, patient_name, email, phone, service, preferred_date, preferred_time, notes, status (default `requested`), created_at, updated_at

Booking submission runs server-side: look up the patient by email, create one if missing, update phone/name if changed, then insert the appointment linked to that patient.

Security: row-level security on both tables. The public cannot read appointments; only signed-in staff can. Booking inserts happen through a server function, not direct public writes. Staff roles live in a separate `user_roles` table (`admin` / `staff`) checked server-side, never client-side.

## n8n integration

Secured endpoints under `/api/public/appointments`, all requiring a shared secret header (`x-api-key`) that I will generate and store as a secret you can copy:

- `GET /api/public/appointments` — list appointments, filterable by `status` and `since` (new-rows polling)
- `GET /api/public/appointments/:id` — single appointment
- `PATCH /api/public/appointments/:id` — update `status` (validated against the allowed set) and optionally staff notes

Outbound webhook on new appointment: I'll add a `webhook_url` setting stored server-side. When set, each new appointment POSTs its payload to that URL. Since you don't have the n8n URL yet, it stays unset and I'll expose a field in the admin page to paste it later — no redeploy needed. Until then, polling `GET ...?since=` works immediately.

You'll also be able to view the raw tables and connection details from the Cloud backend panel if you'd rather connect n8n directly to Postgres.

## Style

Soft blue / white clinical palette with a warm accent (muted teal-coral), generous whitespace, clean geometric sans typography, rounded cards, subtle depth. Fully responsive. Generated hero and dentist portrait imagery so it reads as a real practice.

## Technical notes

- TanStack Start routes; server functions for booking and admin reads.
- Admin lives under the authenticated route layout; staff accounts created by you via the auth page (sign-up can be restricted afterwards on request).
- Zod validation on every server entry point; rate-limit-friendly minimal error responses on the public API.
- SEO metadata per page (title, description, OG tags), semantic HTML, LocalBusiness/Dentist JSON-LD on the home page.
