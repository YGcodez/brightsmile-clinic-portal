import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, ShieldCheck, UserPlus, LogIn } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { registerPatient } from "@/lib/patient.functions";

const TITLE = "Patient Portal — Bright Smile Dental";
const DESCRIPTION =
  "Sign in to your Bright Smile Dental patient portal or register as a new patient to get your personal clinic ID and manage your care online.";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PatientPortalPage,
});

const inputClass =
  "mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40";
const labelClass = "block text-sm font-medium text-foreground";

type Mode = "choose" | "new" | "existing";

function friendlySignInError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match our records.";
  if (m.includes("email not confirmed")) return "Please confirm your email address before signing in.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Please wait a moment and try again.";
  return "We couldn't sign you in. Please try again.";
}

function PatientPortalPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("choose");
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const register = useServerFn(registerPatient);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        navigate({ to: "/dashboard", replace: true });
        return;
      }
      setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError(null);
    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setBusy(false);
      setError(friendlySignInError(signInError.message));
      return;
    }
    toast.success("Welcome back");
    navigate({ to: "/dashboard", replace: true });
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const first_name = String(form.get("first_name") ?? "").trim();
    const last_name = String(form.get("last_name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const date_of_birth = String(form.get("date_of_birth") ?? "");
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm_password") ?? "");

    if (!first_name || !last_name || !email || !phone || !date_of_birth || !password) {
      setError("Please fill in every field.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      await register({ data: { first_name, last_name, email, phone, date_of_birth, password } });
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setBusy(false);
        setMode("existing");
        setError("Your account is ready — please sign in to continue.");
        return;
      }
      toast.success("Your patient account is ready");
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setBusy(false);
      const message = err instanceof Error ? err.message : "";
      setError(message && message.length < 160 ? message : "We couldn't create your account. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-5 py-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure patient portal
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Your Bright Smile account
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Register as a new patient to receive your personal clinic ID, or sign in to view your details and
              upcoming care.
            </p>
          </div>

          {checking ? (
            <div className="mt-12 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : mode === "choose" ? (
            <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("new");
                }}
                className="group rounded-2xl border border-border/70 bg-card p-6 text-left shadow-sm transition hover:border-primary hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <UserPlus className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-foreground">I'm a new patient</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Create your account in a minute and get your clinic ID straight away.
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-primary">Register →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("existing");
                }}
                className="group rounded-2xl border border-border/70 bg-card p-6 text-left shadow-sm transition hover:border-primary hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <LogIn className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-foreground">I'm an existing patient</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Sign in with the email and password you registered with.
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-primary">Sign in →</span>
              </button>
            </div>
          ) : (
            <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-foreground">
                  {mode === "new" ? "New patient registration" : "Patient sign in"}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode("choose");
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-primary"
                  disabled={busy}
                >
                  Back
                </button>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              {mode === "new" ? (
                <form className="mt-6 space-y-4" onSubmit={handleRegister} noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="first_name">First name</label>
                      <input id="first_name" name="first_name" autoComplete="given-name" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="last_name">Last name</label>
                      <input id="last_name" name="last_name" autoComplete="family-name" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" autoComplete="email" className={inputClass} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="phone">Phone number</label>
                      <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="date_of_birth">Date of birth</label>
                      <input id="date_of_birth" name="date_of_birth" type="date" className={inputClass} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="password">Password</label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="confirm_password">Confirm password</label>
                      <input
                        id="confirm_password"
                        name="confirm_password"
                        type="password"
                        autoComplete="new-password"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:brightness-95 disabled:opacity-60"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    {busy ? "Creating your account…" : "Create my account"}
                  </button>
                </form>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={handleSignIn} noValidate>
                  <div>
                    <label className={labelClass} htmlFor="signin_email">Email</label>
                    <input
                      id="signin_email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="signin_password">Password</label>
                    <input
                      id="signin_password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:brightness-95 disabled:opacity-60"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    {busy ? "Signing you in…" : "Sign in"}
                  </button>
                </form>
              )}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
