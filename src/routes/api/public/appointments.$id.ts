import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const patchSchema = z.object({
  status: z
    .enum(["requested", "confirmed", "reminded", "completed", "no_show", "cancelled"])
    .optional(),
  notes: z.string().max(2000).nullable().optional(),
  confirmed_datetime: z.string().datetime({ offset: true }).nullable().optional(),
  confirmation_sent: z.boolean().optional(),
  reminder_24h_sent: z.boolean().optional(),
  reminder_2h_sent: z.boolean().optional(),
  reminder_30m_sent: z.boolean().optional(),
});

async function authorize(request: Request) {
  const key = request.headers.get("x-api-key");
  if (!key) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("clinic_settings")
    .select("api_key")
    .eq("id", true)
    .maybeSingle();
  if (!data?.api_key || data.api_key !== key) return null;
  return supabaseAdmin;
}

const SELECT =
  "id, patient_id, patient_name, email, phone, service, preferred_date, preferred_time, notes, status, created_at, updated_at";

export const Route = createFileRoute("/api/public/appointments/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const client = await authorize(request);
        if (!client) return new Response("Unauthorized", { status: 401 });
        if (!z.string().uuid().safeParse(params.id).success) {
          return Response.json({ error: "Invalid id" }, { status: 400 });
        }
        const { data, error } = await client
          .from("appointments")
          .select(SELECT)
          .eq("id", params.id)
          .maybeSingle();
        if (error) return Response.json({ error: "Query failed" }, { status: 500 });
        if (!data) return Response.json({ error: "Not found" }, { status: 404 });
        return Response.json({ appointment: data });
      },
      PATCH: async ({ request, params }) => {
        const client = await authorize(request);
        if (!client) return new Response("Unauthorized", { status: 401 });
        if (!z.string().uuid().safeParse(params.id).success) {
          return Response.json({ error: "Invalid id" }, { status: 400 });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const parsed = patchSchema.safeParse(body);
        if (!parsed.success || Object.keys(parsed.data).length === 0) {
          return Response.json({ error: "Invalid update payload" }, { status: 400 });
        }

        const update: { status?: string; notes?: string | null } = {};
        if (parsed.data.status !== undefined) update.status = parsed.data.status;
        if (parsed.data.notes !== undefined) update.notes = parsed.data.notes;

        const { data, error } = await client
          .from("appointments")
          .update(update)
          .eq("id", params.id)
          .select(SELECT)
          .maybeSingle();

        if (error) return Response.json({ error: "Update failed" }, { status: 500 });
        if (!data) return Response.json({ error: "Not found" }, { status: 404 });
        return Response.json({ appointment: data });
      },
    },
  },
});
