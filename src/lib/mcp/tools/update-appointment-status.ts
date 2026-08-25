import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_appointment_status",
  title: "Update appointment status",
  description:
    "Change the status of a Bright Smile Dental appointment (requested, confirmed, reminded, completed, no_show, cancelled).",
  inputSchema: {
    id: z.string().describe("Appointment UUID."),
    status: z
      .enum(["requested", "confirmed", "reminded", "completed", "no_show", "cancelled"])
      .describe("New status."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ id, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("appointments")
      .update({ status })
      .eq("id", id)
      .select("id, patient_name, preferred_date, preferred_time, status")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return {
        content: [{ type: "text", text: "No appointment updated — check the id and your staff access." }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { appointment: data },
    };
  },
});
