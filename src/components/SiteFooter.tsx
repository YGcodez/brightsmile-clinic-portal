import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { CLINIC, SERVICES } from "@/lib/clinic";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <h2 className="text-base font-semibold text-foreground">{CLINIC.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {CLINIC.tagline}. Private dental care in {CLINIC.address.city} since 2011.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Treatments</h3>
          <ul className="mt-4 space-y-2">
            {SERVICES.map((s) => (
              <li key={s.name} className="text-sm text-muted-foreground">
                {s.name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Find us</h3>
          <address className="mt-4 space-y-3 text-sm not-italic text-muted-foreground">
            <p className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                {CLINIC.address.line1}
                <br />
                {CLINIC.address.line2}
                <br />
                {CLINIC.address.city} {CLINIC.address.postcode}
              </span>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-accent" />
              <a href={`tel:${CLINIC.phone.replace(/\s/g, "")}`}>{CLINIC.phone}</a>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-accent" />
              <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a>
            </p>
          </address>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Opening hours</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {CLINIC.hours.map((h) => (
              <li key={h.day} className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  <span className="block text-foreground">{h.day}</span>
                  {h.time}
                </span>
              </li>
            ))}
          </ul>
          <Link
            to="/book"
            className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            Book Appointment
          </Link>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {CLINIC.name}. A fictional practice.</p>
          <span className="flex items-center gap-4">
            <Link to="/patient" className="hover:text-foreground">
              Patient portal
            </Link>
            <Link to="/admin" className="hover:text-foreground">
              Staff login
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
