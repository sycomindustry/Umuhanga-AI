import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listSubjects from "./tools/list-subjects";
import listExperiments from "./tools/list-experiments";
import getMyProgress from "./tools/get-my-progress";
import listAssignments from "./tools/list-assignments";
import listMyLabReports from "./tools/list-my-lab-reports";
import createCalendarEvent from "./tools/create-calendar-event";
import listMyCalendarEvents from "./tools/list-my-calendar-events";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "umuhanga-ai",
  title: "Umuhanga AI",
  version: "0.1.0",
  instructions:
    "Tools for Umuhanga AI. Browse subjects, virtual lab experiments, and assignments; read the signed-in student's progress and lab reports; and manage their study calendar. All data is scoped to the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listSubjects,
    listExperiments,
    getMyProgress,
    listAssignments,
    listMyLabReports,
    listMyCalendarEvents,
    createCalendarEvent,
  ],
});
