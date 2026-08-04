import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_assignments",
  title: "List assignments",
  description: "List assignments visible to the signed-in user, with due dates and point values.",
  inputSchema: {
    subject_id: z.string().uuid().optional().describe("Subject id to filter by."),
    upcoming_only: z.boolean().optional().describe("Only return assignments due in the future."),
    limit: z.number().int().optional().describe("Maximum assignments to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ subject_id, upcoming_only, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("assignments")
      .select("id, title, description, type, subject_id, due_date, total_points, instructions")
      .order("due_date", { ascending: true })
      .limit(Math.min(Math.max(limit ?? 20, 1), 100));
    if (subject_id) query = query.eq("subject_id", subject_id);
    if (upcoming_only) query = query.gte("due_date", new Date().toISOString());
    const { data, error } = await query;
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data ?? []) }],
          structuredContent: { assignments: data ?? [] },
        };
  },
});
