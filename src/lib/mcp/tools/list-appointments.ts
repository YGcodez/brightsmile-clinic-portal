import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

const FIELDS =
  "id, patient_name, email, phone, service, preferred_date, preferred_time, notes, status, created_at";

export default defineTool({
  name: "list_appointments",
  title: "List appointments",
  description:
    "List Bright Smile Dental appointment requests, optionally filtered by status, date range, or creation time.",
  inputSchema: {
    status: z
      .enum(["requested", "confirmed", "reminded", "completed", "no_show", "cancelled"])
      .optional()
      .describe("Only return appointments with this status."),
    from_date: z.string().optional().describe("Earliest preferred_date, YYYY-MM-DD."),
    to_date: z.string().optional().describe("Latest preferred_date, YYYY-MM-DD."),
    since: z.string().optional().describe("Only appointments created after this ISO timestamp."),
    limit: z.number().int().optional().describe("Maximum rows to return (default 50, max 200)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);
    let query = supabaseForUser(ctx)
      .from("appointments")
      .select(FIELDS)
      .order("preferred_date", { ascending: true })
      .limit(limit);

    if (input.status) query = query.eq("status", input.status);
    if (input.from_date) query = query.gte("preferred_date", input.from_date);
    if (input.to_date) query = query.lte("preferred_date", input.to_date);
    if (input.since) query = query.gt("created_at", input.since);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { appointments: data ?? [] },
    };
  },
});
