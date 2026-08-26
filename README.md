# Bright Smile Clinic

Build a website for a fictional private dental clinic called "Bright Smile Dental" — modern, trustworthy, professional tone, similar in structure to established UK/US private dental practice sites (clean hero section, services grid, doctor bios, patient testimonials, contact/location footer).

PAGES / SECTIONS:

1. Homepage: hero with a "Book Appointment" CTA, a services section (General Check-ups, Teeth Whitening, Dental Implants, Root Canal Therapy, Orthodontics/Invisalign, Emergency Dentistry), a "Meet the Team" section with 3 fictional dentist bios (name, specialty, short bio, placeholder photo), and a testimonials section with 4-5 fictional 5-star patient reviews.

2. About page: clinic story, opening hours, location (fictional address).

3. Booking page: a real appointment booking form (not just a "contact us" message form) with these fields:

   - Full name

   - Email address

   - Phone number

   - Service requested (dropdown matching the services list above)

   - Preferred date

   - Preferred time (dropdown: Morning / Afternoon / Evening)

   - Optional notes

   On submit, save this to a real database table called "appointments" with fields: id, patient_name, email, phone, service, preferred_date, preferred_time, notes, status (default "requested"), created_at.

4. Also create a "patients" table: id, name, email, phone, created_at — and link each appointment to a patient record (create the patient record if one doesn't already exist for that email).

DATABASE:

Use Supabase (or your default database integration) so this is a real, queryable database — not just a form that sends an email. I need to be able to connect an external automation tool (n8n) to this database afterward, so:

- Please set up the schema cleanly with the fields above.

- Enable a way for me to get the database connection details (or a webhook/API) so an external tool can read new rows from the "appointments" table and write updates back to them (e.g., changing "status" to "confirmed", "reminded", "completed", "no_show", or "cancelled").

- If your platform supports database webhooks (trigger an HTTP call on insert), please enable one on the "appointments" table so I can point it at an external URL I'll provide.

ADMIN VIEW:

Add a simple, password-protected "/admin" page that lists all appointments in a table (patient name, service, date, time, status), sortable by date — this represents what clinic staff would see.

STYLE:

Calm, clinical-but-warm color palette (soft blues/whites, one accent color), clean sans-serif typography, mobile-responsive. Should feel like a real private clinic, not a generic template.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://brightsmile-clinic-portal.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/673d1a36-cb11-4309-8f3b-13f3b2a39dae).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
