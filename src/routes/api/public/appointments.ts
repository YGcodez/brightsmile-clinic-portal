import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const querySchema = z.object({
  status: z
    .enum(["requested", "confirmed", "reminded", "completed", "no_show", "cancelled"])
    .optional(),
  since: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
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

export const Route = createFileRoute("/api/public/appointments")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const client = await authorize(request);
        if (!client) return new Response("Unauthorized", { status: 401 });

        const url = new URL(request.url);
        const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
        if (!parsed.success) {
          return Response.json({ error: "Invalid query parameters" }, { status: 400 });
        }

        let query = client
          .from("appointments")
          .select(
            "id, patient_id, patient_name, email, phone, service, preferred_date, preferred_time, notes, status, created_at, updated_at",
          )
          .order("created_at", { ascending: false })
          .limit(parsed.data.limit ?? 100);

        if (parsed.data.status) query = query.eq("status", parsed.data.status);
        if (parsed.data.since) query = query.gt("created_at", parsed.data.since);

        const { data, error } = await query;
        if (error) return Response.json({ error: "Query failed" }, { status: 500 });

        return Response.json({ appointments: data ?? [] });
      },
    },
  },
});
