import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_subjects",
  title: "List subjects",
  description: "List the subjects available on the learning platform, optionally filtered by education level.",
  inputSchema: {
    level: z.enum(["primary", "secondary", "tvet"]).optional().describe("Education level filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ level }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase.from("subjects").select("id, name, level, description, icon").order("name");
    if (level) query = query.eq("level", level);
    const { data, error } = await query;
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data ?? []) }],
          structuredContent: { subjects: data ?? [] },
        };
  },
});
