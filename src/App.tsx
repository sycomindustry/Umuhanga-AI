import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AITutor from "./pages/AITutor";
import VirtualLab from "./pages/VirtualLab";
import UmuhangaLab from "./pages/UmuhangaLab";
import ExperimentLab from "./pages/ExperimentLab";
import AdminPanel from "./pages/AdminPanel";
import ParentDashboard from "./pages/ParentDashboard";
import CreateAssignment from "./pages/CreateAssignment";
import ContentLibrary from "./pages/ContentLibrary";
import Quizzes from "./pages/Quizzes";
import QuizTaking from "./pages/QuizTaking";
import Leaderboard from "./pages/Leaderboard";
import Calendar from "./pages/Calendar";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tutor" element={<AITutor />} />
          <Route path="/tutor/:subjectId" element={<AITutor />} />
          <Route path="/virtual-lab" element={<VirtualLab />} />
          <Route path="/umuhanga-lab" element={<UmuhangaLab />} />
          <Route path="/virtual-lab/:experimentId" element={<ExperimentLab />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/assignments/create" element={<CreateAssignment />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/content-library" element={<ContentLibrary />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/quiz/:quizId" element={<QuizTaking />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/help" element={<Help />} />
          <Route path="/install" element={<Install />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
