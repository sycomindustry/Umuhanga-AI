import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_lab_reports",
  title: "List my lab reports",
  description: "List the signed-in user's virtual lab reports, including observations, grades, and AI feedback.",
  inputSchema: {
    experiment_id: z.string().uuid().optional().describe("Only reports for this experiment."),
    limit: z.number().int().optional().describe("Maximum reports to return (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ experiment_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("lab_reports")
      .select("id, experiment_id, observations, conclusion, grade, ai_feedback, created_at, experiments(title)")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 10, 1), 50));
    if (experiment_id) query = query.eq("experiment_id", experiment_id);
    const { data, error } = await query;
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data ?? []) }],
          structuredContent: { reports: data ?? [] },
        };
  },
});
