import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const registerSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(60),
  last_name: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  phone: z.string().trim().min(6, "Please enter a valid phone number").max(30),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date of birth"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export type RegisterPatientInput = z.infer<typeof registerSchema>;

export type PatientRecord = {
  id: string;
  user_id: string | null;
  patient_id: string;
  first_name: string | null;
  last_name: string | null;
  name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  created_at: string;
};

const FIELDS = "id, user_id, patient_id, first_name, last_name, name, email, phone, date_of_birth, created_at";

export const registerPatient = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => registerSchema.parse(data))
  .handler(async ({ data }): Promise<{ patient_id: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();

    const { data: created, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { first_name: data.first_name, last_name: data.last_name },
    });

    if (signUpError || !created?.user) {
      const message = (signUpError?.message ?? "").toLowerCase();
      if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
        throw new Error("That email is already registered. Please sign in instead.");
      }
      if (message.includes("password")) {
        throw new Error("Please choose a stronger password.");
      }
      console.error("[registerPatient] createUser failed", signUpError);
      throw new Error("We couldn't create your account. Please try again.");
    }

    const userId = created.user.id;

    const { data: existing } = await supabaseAdmin
      .from("patients")
      .select("id, user_id")
      .eq("email", email)
      .maybeSingle();

    const patientFields = {
      user_id: userId,
      first_name: data.first_name,
      last_name: data.last_name,
      email,
      phone: data.phone,
      date_of_birth: data.date_of_birth,
    };

    let row: { patient_id: string } | null = null;
    let error: { message: string } | null = null;

    if (existing && !existing.user_id) {
      const res = await supabaseAdmin
        .from("patients")
        .update(patientFields)
        .eq("id", existing.id)
        .select("patient_id")
        .single();
      row = res.data;
      error = res.error;
    } else {
      const res = await supabaseAdmin
        .from("patients")
        .insert({ ...patientFields, name: `${data.first_name} ${data.last_name}` })
        .select("patient_id")
        .single();
      row = res.data;
      error = res.error;
    }

    if (error || !row) {
      console.error("[registerPatient] patient record failed", error);
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
      throw new Error("We couldn't finish setting up your patient record. Please try again.");
    }

    return { patient_id: row.patient_id };
  });

/**
 * Returns the signed-in user's own patient record, creating one if the auth
 * account somehow has no record yet. Scoped to the authenticated user only.
 */
export const getMyPatientRecord = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PatientRecord> => {
    const { supabase, userId, claims } = context;

    const { data, error } = await supabase.from("patients").select(FIELDS).eq("user_id", userId).maybeSingle();

    if (error) {
      console.error("[getMyPatientRecord] read failed", error);
      throw new Error("We couldn't load your patient details. Please try again.");
    }

    if (data) return data as PatientRecord;

    // Self-healing: authenticated user without a patient record.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = String(claims?.["email"] ?? "").toLowerCase();
    const meta = (claims?.["user_metadata"] ?? {}) as Record<string, unknown>;
    const first = typeof meta["first_name"] === "string" ? meta["first_name"] : (email.split("@")[0] ?? "Patient");
    const last = typeof meta["last_name"] === "string" ? meta["last_name"] : "";

    const { data: linked } = await supabaseAdmin
      .from("patients")
      .select("id")
      .eq("email", email)
      .is("user_id", null)
      .maybeSingle();

    if (linked) {
      const { data: updated, error: linkError } = await supabaseAdmin
        .from("patients")
        .update({ user_id: userId })
        .eq("id", linked.id)
        .select(FIELDS)
        .single();
      if (!linkError && updated) return updated as PatientRecord;
    }

    const { data: createdRow, error: createError } = await supabaseAdmin
      .from("patients")
      .insert({
        user_id: userId,
        email,
        first_name: first,
        last_name: last,
        name: `${first} ${last}`.trim(),
      })
      .select(FIELDS)
      .single();

    if (createError || !createdRow) {
      console.error("[getMyPatientRecord] create failed", createError);
      throw new Error("We couldn't load your patient details. Please try again.");
    }

    return createdRow as PatientRecord;
  });
