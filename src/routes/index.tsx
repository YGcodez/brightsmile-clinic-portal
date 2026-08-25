import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Stethoscope,
  Sparkles,
  Anchor,
  Shield,
  AlignHorizontalDistributeCenter,
  Siren,
  Quote,
  Star,
  CheckCircle2,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CLINIC, SERVICES, TEAM, TESTIMONIALS } from "@/lib/clinic";
import hero from "@/assets/hero-clinic.jpg";

const ICONS = {
  stethoscope: Stethoscope,
  sparkles: Sparkles,
  anchor: Anchor,
  shield: Shield,
  align: AlignHorizontalDistributeCenter,
  siren: Siren,
} as const;

const TITLE = "Bright Smile Dental — Private Dentist in London";
const DESCRIPTION =
  "Gentle private dental care in Kensington: check-ups, whitening, implants, root canals, Invisalign and same-day emergency appointments.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-secondary/60">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-background px-3.5 py-1.5 text-xs font-medium text-primary shadow-sm">
                Accepting new private patients
              </span>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
                Private dentistry with a gentle touch
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                Bright Smile Dental has cared for {CLINIC.address.city} families since 2011.
                Unhurried appointments, clear pricing and clinicians who explain everything
                before they begin.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/book"
                  className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:brightness-95"
                >
                  Book Appointment
                </Link>
                <a
                  href={`tel:${CLINIC.phone.replace(/\s/g, "")}`}
                  className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
                >
                  Call {CLINIC.phone}
                </a>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {["Same-day emergencies", "0% finance available", "Nervous patients welcome"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="overflow-hidden rounded-3xl shadow-xl">
              <img
                src={hero}
                alt="Bright Smile Dental reception area with soft blue and white interior"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Our treatments</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Everything from routine hygiene to full implant restoration, delivered in one calm
            practice.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => {
              const Icon = ICONS[service.icon];
              return (
                <article
                  key={service.name}
                  className="rounded-2xl border border-border/70 bg-card p-6 transition hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{service.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="bg-secondary/60 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Meet the team</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Three clinicians, one standard of care.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {TEAM.map((member) => (
                <article
                  key={member.name}
                  className="overflow-hidden rounded-2xl border border-border/70 bg-card"
                >
                  <img
                    src={member.photo}
                    alt={`Portrait of ${member.name}`}
                    className="h-64 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-primary">{member.role}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                      {member.specialty}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {member.bio}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-accent text-accent" />
            ))}
            <span className="text-sm text-muted-foreground">Rated 4.9 from 380+ reviews</span>
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            What our patients say
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.author}
                className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
              >
                <Quote className="h-6 w-6 text-accent" />
                <blockquote className="mt-4 text-sm leading-relaxed text-foreground">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{t.author}</span> · {t.treatment}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-8">
          <div className="rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground">
            <h2 className="text-3xl font-semibold tracking-tight">Ready when you are</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80">
              Request an appointment online and our reception team will confirm your slot within one
              working day.
            </p>
            <Link
              to="/book"
              className="mt-8 inline-flex rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground"
            >
              Book Appointment
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
