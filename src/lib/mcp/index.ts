import { auth, defineMcp, type ToolDefinition } from "@lovable.dev/mcp-js";
import listAppointments from "./tools/list-appointments";
import getAppointment from "./tools/get-appointment";
import updateAppointmentStatus from "./tools/update-appointment-status";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

// The SDK's tool type marks `outputSchema` optional; under
// exactOptionalPropertyTypes the inferred `undefined` needs widening here.
const tools = [listAppointments, getAppointment, updateAppointmentStatus] as unknown as readonly ToolDefinition[];

export default defineMcp({
  name: "bright-smile-clinic",
  title: "Bright Smile Clinic",
  version: "0.1.0",
  instructions:
    "Tools for the Bright Smile Dental practice. Staff can list appointment requests, read a single appointment, and change appointment status.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listAppointments, getAppointment, updateAppointmentStatus],
});
