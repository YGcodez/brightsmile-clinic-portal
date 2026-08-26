import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowUpDown, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { APPOINTMENT_STATUSES } from "@/lib/clinic";
import {
  listAppointments,
  updateAppointmentStatus,
  confirmAppointment,
  getStaffAccess,
  getIntegrationSettings,
  updateWebhookUrl,
  type Appointment,
} from "@/lib/admin.functions";

const TITLE = "Staff Login — Bright Smile Dental";
const DESCRIPTION = "Private staff area for managing Bright Smile Dental appointment requests.";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: AdminPage,
});

const inputClass =
  "mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40";

function AdminPage() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session));
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return <div className="p-10 text-sm text-muted-foreground">Loading…</div>;
  }

  return signedIn ? <Dashboard /> : <LoginForm />;
}

function LoginForm() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    setLoading(false);
    if (error) toast.error(error.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/60 px-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-border/70 bg-card p-8"
      >
        <h1 className="text-xl font-semibold text-foreground">Staff login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bright Smile Dental management is restricted to practice staff.
        </p>
        <label className="mt-6 block text-sm font-medium text-foreground">
          Email
          <input name="email" type="email" required className={inputClass} />
        </label>
        <label className="mt-4 block text-sm font-medium text-foreground">
          Password
          <input name="password" type="password" required className={inputClass} />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function Dashboard() {
  const queryClient = useQueryClient();
  const fetchAccess = useServerFn(getStaffAccess);
  const fetchAppointments = useServerFn(listAppointments);
  const setStatus = useServerFn(updateAppointmentStatus);
  const confirmSlot = useServerFn(confirmAppointment);
  const fetchSettings = useServerFn(getIntegrationSettings);
  const saveWebhook = useServerFn(updateWebhookUrl);

  const [asc, setAsc] = useState(true);

  const access = useQuery({ queryKey: ["staff-access"], queryFn: () => fetchAccess({}) });
  const appointments = useQuery({
    queryKey: ["appointments"],
    queryFn: () => fetchAppointments({}),
    enabled: access.data?.isStaff === true,
  });
  const settings = useQuery({
    queryKey: ["clinic-settings"],
    queryFn: () => fetchSettings({}),
    enabled: access.data?.isStaff === true,
  });

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: (typeof APPOINTMENT_STATUSES)[number] }) =>
      setStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const webhookMutation = useMutation({
    mutationFn: (webhookUrl: string) => saveWebhook({ data: { webhookUrl } }),
    onSuccess: () => {
      toast.success("Webhook URL saved");
      queryClient.invalidateQueries({ queryKey: ["clinic-settings"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = useMemo(() => {
    const list = [...(appointments.data ?? [])];
    list.sort((a, b) =>
      asc
        ? a.preferred_date.localeCompare(b.preferred_date)
        : b.preferred_date.localeCompare(a.preferred_date),
    );
    return list;
  }, [appointments.data, asc]);

  if (access.isLoading) {
    return <div className="p-10 text-sm text-muted-foreground">Checking access…</div>;
  }

  if (!access.data?.isStaff) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <h1 className="text-xl font-semibold text-foreground">No staff access</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          This account is signed in but has no staff role assigned. Ask a practice administrator to
          grant access.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <h1 className="text-lg font-semibold text-foreground">Appointments</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-5 py-8">
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">
                  <button
                    onClick={() => setAsc((v) => !v)}
                    className="flex items-center gap-1.5 uppercase"
                  >
                    Date <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Loading appointments…
                  </td>
                </tr>
              )}
              {!appointments.isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No appointment requests yet.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.patient_name}
                    {row.notes ? (
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        {row.notes}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.email}
                    <span className="block">{row.phone}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.service}</td>
                  <td className="px-4 py-3 text-foreground">{row.preferred_date}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.preferred_time}</td>
                  <td className="px-4 py-3">
                    <select
                      value={row.status}
                      onChange={(e) =>
                        statusMutation.mutate({
                          id: row.id,
                          status: e.target.value as (typeof APPOINTMENT_STATUSES)[number],
                        })
                      }
                      className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
                    >
                      {APPOINTMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">Automation (n8n)</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Send new bookings to a webhook, and read or update appointments through the secured API
            using the <code>x-api-key</code> header.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              webhookMutation.mutate(String(form.get("webhookUrl") ?? ""));
            }}
            className="mt-5"
          >
            <label className="block text-sm font-medium text-foreground">
              Webhook URL (https)
              <input
                name="webhookUrl"
                defaultValue={settings.data?.webhookUrl ?? ""}
                key={settings.data?.webhookUrl ?? "empty"}
                placeholder="https://your-n8n-host/webhook/bright-smile"
                className={inputClass}
              />
            </label>
            <button
              type="submit"
              disabled={webhookMutation.isPending}
              className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              Save webhook
            </button>
          </form>

          <div className="mt-6 space-y-2 text-sm">
            <p className="font-medium text-foreground">API key</p>
            <code className="block break-all rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">
              {settings.data?.apiKey ?? "…"}
            </code>
            <p className="text-xs text-muted-foreground">
              GET /api/public/appointments · GET &amp; PATCH /api/public/appointments/&#123;id&#125;
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
