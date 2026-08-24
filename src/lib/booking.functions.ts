import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const bookingSchema = z.object({
  patient_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(30),
  service: z.string().trim().min(2).max(80),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferred_time: z.enum(["Morning", "Afternoon", "Evening"]),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const submitBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bookingSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();

    const { data: existing } = await supabaseAdmin
      .from("patients")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    let patientId = existing?.id ?? null;

    if (patientId) {
      await supabaseAdmin
        .from("patients")
        .update({ name: data.patient_name, phone: data.phone })
        .eq("id", patientId);
    } else {
      const { data: created, error: patientError } = await supabaseAdmin
        .from("patients")
        .insert({ name: data.patient_name, email, phone: data.phone })
        .select("id")
        .single();
      if (patientError) throw new Error("Could not save your details. Please try again.");
      patientId = created.id;
    }

    const { data: appointment, error } = await supabaseAdmin
      .from("appointments")
      .insert({
        patient_id: patientId,
        patient_name: data.patient_name,
        email,
        phone: data.phone,
        service: data.service,
        preferred_date: data.preferred_date,
        preferred_time: data.preferred_time,
        notes: data.notes ? data.notes : null,
      })
      .select("id, patient_name, email, phone, service, preferred_date, preferred_time, notes, status, created_at")
      .single();

    if (error) throw new Error("Could not save your appointment request. Please try again.");

    const { data: settings } = await supabaseAdmin
      .from("clinic_settings")
      .select("webhook_url")
      .eq("id", true)
      .maybeSingle();

    const webhookUrl = settings?.webhook_url;
    if (webhookUrl && /^https:\/\//i.test(webhookUrl)) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ event: "appointment.created", appointment }),
        });
      } catch (webhookError) {
        console.error("Appointment webhook failed", webhookError);
      }
    }

    return { id: appointment.id as string };
  });
