import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, BookOpen, FileText, LogOut, Shield, TrendingUp, Beaker, 
  Home, Calendar, MessageSquare, Trophy, FlaskConical, Package
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { ContentManagement } from "@/components/admin/ContentManagement";
import { ReportsAnalytics } from "@/components/admin/ReportsAnalytics";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { SubjectManagement } from "@/components/admin/SubjectManagement";
import { ExperimentManagement } from "@/components/admin/ExperimentManagement";
import { QuizManagement } from "@/components/admin/QuizManagement";
import { EquipmentManagement } from "@/components/admin/EquipmentManagement";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSubjects: 0,
    totalExperiments: 0,
    totalAssignments: 0,
    totalQuizzes: 0,
    totalMessages: 0,
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasAdminRole = roles?.some(r => r.role === "admin");
    
    if (!hasAdminRole) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);
    loadStats();
  };

  const loadStats = async () => {
    try {
      const [users, subjects, experiments, assignments, quizzes, messages] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("subjects").select("id", { count: "exact", head: true }),
        supabase.from("experiments").select("id", { count: "exact", head: true }),
        supabase.from("assignments").select("id", { count: "exact", head: true }),
        supabase.from("quizzes").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: users.count || 0,
        totalSubjects: subjects.count || 0,
        totalExperiments: experiments.count || 0,
        totalAssignments: assignments.count || 0,
        totalQuizzes: quizzes.count || 0,
        totalMessages: messages.count || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-primary text-primary-foreground shadow-strong">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-foreground/20 p-2 rounded-lg">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="text-primary-foreground/90">Full System Access & Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <Home className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => navigate("/quizzes")}
              >
                <FileText className="w-4 h-4 mr-1" />
                Quizzes
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => navigate("/virtual-lab")}
              >
                <Beaker className="w-4 h-4 mr-1" />
                Lab
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => navigate("/calendar")}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Calendar
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => navigate("/messages")}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Messages
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => navigate("/leaderboard")}
              >
                <Trophy className="w-4 h-4 mr-1" />
                Leaderboard
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => navigate("/admin")}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Users</CardTitle>
                <Users className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20 hover:border-secondary/40 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Subjects</CardTitle>
                <BookOpen className="w-5 h-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalSubjects}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Experiments</CardTitle>
                <FlaskConical className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalExperiments}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Assignments</CardTitle>
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalAssignments}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20 hover:border-secondary/40 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Quizzes</CardTitle>
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalQuizzes}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Messages</CardTitle>
                <MessageSquare className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalMessages}</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>System Management</CardTitle>
            <CardDescription>Full administrative control over all platform features</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
                <TabsTrigger value="experiments">Experiments</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4 mt-6">
                <UserManagement />
              </TabsContent>

              <TabsContent value="subjects" className="space-y-4 mt-6">
                <SubjectManagement />
              </TabsContent>

              <TabsContent value="experiments" className="space-y-4 mt-6">
                <ExperimentManagement />
              </TabsContent>

              <TabsContent value="equipment" className="space-y-4 mt-6">
                <EquipmentManagement />
              </TabsContent>

              <TabsContent value="quizzes" className="space-y-4 mt-6">
                <QuizManagement />
              </TabsContent>

              <TabsContent value="content" className="space-y-4 mt-6">
                <ContentManagement />
              </TabsContent>

              <TabsContent value="reports" className="space-y-4 mt-6">
                <ReportsAnalytics />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-6">
                <SystemSettings />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPanel;
