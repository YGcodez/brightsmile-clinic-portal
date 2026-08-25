import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CLINIC } from "@/lib/clinic";
import hero from "@/assets/hero-clinic.jpg";

const TITLE = "About Bright Smile Dental — Our Practice in Kensington";
const DESCRIPTION =
  "Our story, opening hours and location. Bright Smile Dental has provided private dental care in Kensington, London since 2011.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground">
          A calm practice built around nervous patients
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Dr. Eleanor Hartley opened Bright Smile Dental in 2011 with a simple idea: appointments
          long enough to explain things properly. Fifteen years later we are a three-clinician
          practice serving over 4,000 patients across {CLINIC.address.city}, with an on-site
          hygiene team, digital scanning, and a same-day emergency slot held open every weekday.
        </p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          We are entirely private, which means no rushed slots and no treatment you did not agree
          to. Every plan is quoted in writing before work begins, and 0% finance is available on
          treatments over £500.
        </p>

        <div className="mt-12 overflow-hidden rounded-3xl">
          <img
            src={hero}
            alt="Interior of Bright Smile Dental in Kensington"
            className="h-80 w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-border/70 bg-card p-7">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Clock className="h-5 w-5 text-accent" /> Opening hours
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              {CLINIC.hours.map((h) => (
                <li
                  key={h.day}
                  className="flex justify-between gap-4 border-b border-border/60 pb-3 last:border-0"
                >
                  <span className="text-foreground">{h.day}</span>
                  <span className="text-muted-foreground">{h.time}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card p-7">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <MapPin className="h-5 w-5 text-accent" /> Find us
            </h2>
            <address className="mt-5 space-y-3 text-sm not-italic text-muted-foreground">
              <p>
                {CLINIC.address.line1}
                <br />
                {CLINIC.address.line2}
                <br />
                {CLINIC.address.city} {CLINIC.address.postcode}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" />
                <a href={`tel:${CLINIC.phone.replace(/\s/g, "")}`}>{CLINIC.phone}</a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a>
              </p>
            </address>
            <p className="mt-5 text-sm text-muted-foreground">
              Three minutes' walk from High Street Kensington station. Step-free access throughout.
            </p>
            <Link
              to="/book"
              className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
            >
              Book Appointment
            </Link>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
