import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_experiments",
  title: "List virtual lab experiments",
  description: "List virtual lab experiments, optionally filtered by subject, category, or education level.",
  inputSchema: {
    subject_id: z.string().uuid().optional().describe("Subject id to filter by."),
    category: z.string().optional().describe("Category such as physics, chemistry, or biology."),
    level: z.enum(["primary", "secondary", "tvet"]).optional().describe("Education level filter."),
    limit: z.number().int().optional().describe("Maximum experiments to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ subject_id, category, level, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("experiments")
      .select("id, title, description, category, level, subject_id, safety_notes, learning_objectives")
      .order("title")
      .limit(Math.min(Math.max(limit ?? 20, 1), 100));
    if (subject_id) query = query.eq("subject_id", subject_id);
    if (category) query = query.eq("category", category);
    if (level) query = query.eq("level", level);
    const { data, error } = await query;
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data ?? []) }],
          structuredContent: { experiments: data ?? [] },
        };
  },
});
