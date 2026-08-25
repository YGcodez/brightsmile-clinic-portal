import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SERVICE_NAMES, TIME_SLOTS, CLINIC } from "@/lib/clinic";
import { submitBooking, type BookingInput } from "@/lib/booking.functions";

const TITLE = "Book an Appointment — Bright Smile Dental";
const DESCRIPTION =
  "Request a dental appointment online. Choose your treatment, date and preferred time and our reception team will confirm within one working day.";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: BookPage,
});

const inputClass =
  "mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40";

function BookPage() {
  const book = useServerFn(submitBooking);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: BookingInput) => book({ data }),
    onSuccess: () => {
      setDone(true);
      toast.success("Appointment request sent");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong. Please call us instead.");
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    mutation.mutate({
      patient_name: String(form.get("patient_name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      service: String(form.get("service") ?? ""),
      preferred_date: String(form.get("preferred_date") ?? ""),
      preferred_time: String(form.get("preferred_time") ?? "Morning") as
        | "Morning"
        | "Afternoon"
        | "Evening",
      notes: String(form.get("notes") ?? ""),
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Book an appointment
        </h1>
        <p className="mt-4 text-muted-foreground">
          Tell us what you need and when suits you. We confirm every request by phone or email
          within one working day. For dental pain today, call {CLINIC.phone}.
        </p>

        {done ? (
          <div className="mt-10 rounded-2xl border border-border/70 bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">Request received</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Thank you. Our reception team will be in touch shortly to confirm your appointment
              time.
            </p>
            <button
              type="button"
              onClick={() => setDone(false)}
              className="mt-6 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Book another appointment
            </button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-10 space-y-5 rounded-2xl border border-border/70 bg-card p-7"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-foreground">
                Full name
                <input name="patient_name" required minLength={2} className={inputClass} />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Email
                <input name="email" type="email" required className={inputClass} />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Phone
                <input name="phone" type="tel" required minLength={6} className={inputClass} />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Service
                <select name="service" required defaultValue="" className={inputClass}>
                  <option value="" disabled>
                    Choose a treatment
                  </option>
                  {SERVICE_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-foreground">
                Preferred date
                <input name="preferred_date" type="date" required className={inputClass} />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Preferred time
                <select name="preferred_time" defaultValue="Morning" className={inputClass}>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-foreground">
              Notes (optional)
              <textarea
                name="notes"
                rows={4}
                maxLength={1000}
                placeholder="Anything we should know — anxiety, symptoms, access needs."
                className={inputClass}
              />
            </label>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-95 disabled:opacity-60"
            >
              {mutation.isPending ? "Sending…" : "Request appointment"}
            </button>
          </form>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
