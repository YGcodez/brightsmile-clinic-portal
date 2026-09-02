import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { CLINIC } from "@/lib/clinic";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/book", label: "Book" },
  { to: "/patient", label: "Patient Portal" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M12 3c-1.6 0-2.4.7-4 .7S5.4 3 4.4 4.2C3.2 5.6 3 7.8 3.4 10c.5 2.6 1.4 4.6 2.2 6.6.6 1.5 1 3.4 2.2 3.4 1.3 0 1.3-2.3 1.8-4 .3-1 .8-1.9 2.4-1.9s2.1.9 2.4 1.9c.5 1.7.5 4 1.8 4 1.2 0 1.6-1.9 2.2-3.4.8-2 1.7-4 2.2-6.6.4-2.2.2-4.4-1-5.8C19.6 3 18.2 3.7 16 3.7 14.4 3.7 13.6 3 12 3Z" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Bright Smile <span className="text-primary">Dental</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`tel:${CLINIC.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <Phone className="h-4 w-4 text-accent" />
            {CLINIC.phone}
          </a>
          <Link
            to="/book"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:brightness-95"
          >
            Book Appointment
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="rounded-lg p-2 text-foreground md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/book"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-accent px-5 py-2.5 text-center text-sm font-semibold text-accent-foreground"
            >
              Book Appointment
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
