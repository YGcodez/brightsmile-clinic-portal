# Finish agent integrations (MCP)

The MCP server for Bright Smile Dental is partly in place: the SDK is installed, three staff tools exist (list appointments, get one appointment, update status), the server definition uses OAuth against the app's own auth, the OAuth consent screen is added, and the build plugin is wired. One typecheck error remains from the last edit, so the work needs a short finishing pass.

## Remaining work

1. Fix the type error in the MCP server definition — the tool definitions need to satisfy the SDK's tool type under the project's strict optional-property setting (add an explicit tool-definition type annotation or list the tools through a typed array).
2. Re-run typecheck and the build until clean.
3. Regenerate the agent-integrations manifest so the tools appear in the connectors panel with their titles, descriptions, and read-only / write badges.
4. Verify the consent page loads and the staff sign-in fallback works.

## How access works

Assistants like Claude or ChatGPT connect through OAuth: the person connecting signs in with their staff account and approves the connection. The tools then act as that user, so only staff with appointment access can read or change bookings. No shared key, no public access.

## Tools exposed

- `list_appointments` — filter by status, date range, or newly created
- `get_appointment` — single appointment by id
- `update_appointment_status` — set requested / confirmed / reminded / completed / no_show / cancelled
