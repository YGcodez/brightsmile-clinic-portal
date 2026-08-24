import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const STATUSES = [
  "requested",
  "confirmed",
  "reminded",
  "completed",
  "no_show",
  "cancelled",
] as const;

export type Appointment = {
  id: string;
  patient_name: string;
  email: string;
  phone: string;
  service: string;
  preferred_date: string;
  preferred_time: string;
  notes: string | null;
  status: string;
  created_at: string;
};

export const getStaffAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isStaff } = await context.supabase.rpc("is_staff", {
      _user_id: context.userId,
    });
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isStaff: Boolean(isStaff), isAdmin: Boolean(isAdmin) };
  });

export const listAppointments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("appointments")
      .select(
        "id, patient_name, email, phone, service, preferred_date, preferred_time, notes, status, created_at",
      )
      .order("preferred_date", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Appointment[];
  });

export const updateAppointmentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(STATUSES) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("appointments")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getIntegrationSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("clinic_settings")
      .select("webhook_url, api_key")
      .eq("id", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      webhookUrl: data?.webhook_url ?? "",
      apiKey: data?.api_key ?? "",
    };
  });

export const updateWebhookUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        webhookUrl: z
          .string()
          .trim()
          .max(500)
          .refine((v) => v === "" || /^https:\/\/\S+$/i.test(v), {
            message: "Enter a valid https URL or leave empty",
          }),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("clinic_settings")
      .update({ webhook_url: data.webhookUrl === "" ? null : data.webhookUrl })
      .eq("id", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
