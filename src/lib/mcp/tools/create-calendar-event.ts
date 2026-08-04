import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_calendar_event",
  title: "Create a study calendar event",
  description: "Create a calendar event (study session, exam, reminder) for the signed-in user.",
  inputSchema: {
    title: z.string().trim().min(1).describe("Event title."),
    start_time: z.string().describe("Start time as an ISO 8601 timestamp."),
    end_time: z.string().optional().describe("End time as an ISO 8601 timestamp."),
    description: z.string().optional().describe("Optional details about the event."),
    event_type: z.string().optional().describe("Event type, e.g. study, exam, assignment, reminder."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, start_time, end_time, description, event_type }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        user_id: ctx.getUserId(),
        title,
        start_time,
        end_time: end_time ?? null,
        description: description ?? null,
        event_type: event_type ?? "study",
      })
      .select()
      .single();
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { event: data } };
  },
});
