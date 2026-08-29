import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarPlus,
  CalendarClock,
  History,
  RefreshCcw,
  CalendarX,
  UserRound,
  Loader2,
  LogOut,
  BadgeCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { getMyPatientRecord } from "@/lib/patient.functions";

const TITLE = "Patient Dashboard — Bright Smile Dental";
const DESCRIPTION =
  "View your Bright Smile Dental patient ID, personal details and upcoming care in your secure patient dashboard.";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
  errorComponent: () => (
    <DashboardShell>
      <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
        We couldn't load your patient details right now. Please refresh the page or call the practice.
      </p>
    </DashboardShell>
  ),
  notFoundComponent: () => (
    <DashboardShell>
      <p className="text-sm text-muted-foreground">We couldn't find that page.</p>
    </DashboardShell>
  ),
});

function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-5 py-12">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

const UPCOMING = [
  { icon: CalendarPlus, title: "Book appointment", copy: "Request a new visit online." },
  { icon: CalendarClock, title: "Upcoming appointments", copy: "See what's scheduled next." },
  { icon: History, title: "Past appointments", copy: "Review your treatment history." },
  { icon: RefreshCcw, title: "Reschedule", copy: "Move a visit to a better time." },
  { icon: CalendarX, title: "Cancel appointment", copy: "Let us know if plans change." },
  { icon: UserRound, title: "Profile", copy: "Keep your contact details current." },
] as const;

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchRecord = useServerFn(getMyPatientRecord);

  const { data, isPending, isError } = useQuery({
    queryKey: ["my-patient-record"],
    queryFn: () => fetchRecord(),
    retry: 1,
  });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/patient", replace: true });
  }

  if (isPending) {
    return (
      <DashboardShell>
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DashboardShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardShell>
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          We couldn't load your patient details right now. Please refresh the page or call the practice.
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </DashboardShell>
    );
  }

  const firstName = data.first_name || data.name.split(" ")[0] || "there";

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Welcome, {firstName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This is your secure patient area at Bright Smile Dental.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 self-start rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-primary/20 bg-secondary/60 p-6 shadow-sm">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <BadgeCheck className="h-4 w-4" /> Patient ID
          </span>
          <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-foreground">{data.patient_id}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Quote this ID whenever you contact the practice. It never changes.
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground">Your details</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Detail label="Full name" value={data.name || "—"} />
            <Detail label="Email" value={data.email} />
            <Detail label="Phone" value={data.phone || "—"} />
            <Detail label="Date of birth" value={formatDate(data.date_of_birth)} />
            <Detail label="Patient since" value={formatDate(data.created_at)} />
          </dl>
        </div>
      </div>

      <h2 className="mt-12 text-lg font-semibold text-foreground">Your care, coming soon</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        We're adding online scheduling to your portal shortly. In the meantime, use the booking page or call us.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {UPCOMING.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-dashed border-border/80 bg-card/60 p-5"
            aria-disabled="true"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <item.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-3.5 text-sm font-semibold text-foreground">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.copy}</p>
            <span className="mt-3 inline-block rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Coming soon
            </span>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}
