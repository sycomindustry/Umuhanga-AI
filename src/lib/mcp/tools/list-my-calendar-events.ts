import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_calendar_events",
  title: "List my calendar events",
  description: "List the signed-in user's upcoming study calendar events.",
  inputSchema: {
    upcoming_only: z.boolean().optional().describe("Only events starting from now (default true)."),
    limit: z.number().int().optional().describe("Maximum events to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ upcoming_only, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("calendar_events")
      .select("id, title, description, event_type, start_time, end_time")
      .eq("user_id", ctx.getUserId())
      .order("start_time", { ascending: true })
      .limit(Math.min(Math.max(limit ?? 20, 1), 100));
    if (upcoming_only !== false) query = query.gte("start_time", new Date().toISOString());
    const { data, error } = await query;
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data ?? []) }],
          structuredContent: { events: data ?? [] },
        };
  },
});
