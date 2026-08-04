import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_my_progress",
  title: "Get my learning progress",
  description: "Get the signed-in student's progress per subject, including quizzes taken and total score.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("student_progress")
      .select("subject_id, topics_completed, quizzes_taken, total_score, last_activity, subjects(name, level)")
      .eq("user_id", ctx.getUserId())
      .order("last_activity", { ascending: false });
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data ?? []) }],
          structuredContent: { progress: data ?? [] },
        };
  },
});
