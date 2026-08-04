import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, BookOpen, FileText, Shield, TrendingUp, Beaker, 
  Calendar, MessageSquare, Trophy, FlaskConical, Settings, GraduationCap
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Subject {
  id: string;
  name: string;
  level: string;
  description: string;
  icon: string;
}

interface AdminDashboardProps {
  subjects: Subject[];
  loading: boolean;
}

export const AdminDashboard = ({ subjects, loading }: AdminDashboardProps) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSubjects: 0,
    totalExperiments: 0,
    totalQuizzes: 0,
    totalAssignments: 0,
    totalMessages: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [users, subjectsRes, experiments, quizzes, assignments, messages] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("subjects").select("id", { count: "exact", head: true }),
        supabase.from("experiments").select("id", { count: "exact", head: true }),
        supabase.from("quizzes").select("id", { count: "exact", head: true }),
        supabase.from("assignments").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: users.count || 0,
        totalSubjects: subjectsRes.count || 0,
        totalExperiments: experiments.count || 0,
        totalQuizzes: quizzes.count || 0,
        totalAssignments: assignments.count || 0,
        totalMessages: messages.count || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return (
    <>
      {/* Admin Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-primary/20 hover:border-primary"
          onClick={() => navigate("/admin")}
        >
          <CardHeader className="p-4">
            <div className="bg-gradient-primary p-3 rounded-lg w-fit mx-auto">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Admin Panel</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-secondary/20 hover:border-secondary"
          onClick={() => navigate("/quizzes")}
        >
          <CardHeader className="p-4">
            <div className="bg-gradient-secondary p-3 rounded-lg w-fit mx-auto">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Quizzes</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-emerald-500/20 hover:border-emerald-500"
          onClick={() => navigate("/virtual-lab")}
        >
          <CardHeader className="p-4">
            <div className="bg-emerald-500 p-3 rounded-lg w-fit mx-auto">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Virtual Lab</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-blue-500/20 hover:border-blue-500"
          onClick={() => navigate("/content-library")}
        >
          <CardHeader className="p-4">
            <div className="bg-blue-500 p-3 rounded-lg w-fit mx-auto">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Content</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-amber-500/20 hover:border-amber-500"
          onClick={() => navigate("/calendar")}
        >
          <CardHeader className="p-4">
            <div className="bg-amber-500 p-3 rounded-lg w-fit mx-auto">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Calendar</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-purple-500/20 hover:border-purple-500"
          onClick={() => navigate("/messages")}
        >
          <CardHeader className="p-4">
            <div className="bg-purple-500 p-3 rounded-lg w-fit mx-auto">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Messages</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Platform Stats */}
      <h2 className="text-2xl font-bold mb-4">
        <span className="bg-gradient-primary bg-clip-text text-transparent">
          Platform Overview
        </span>
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Users</CardDescription>
              <Users className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Subjects</CardDescription>
              <BookOpen className="w-4 h-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalSubjects}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Experiments</CardDescription>
              <FlaskConical className="w-4 h-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalExperiments}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Quizzes</CardDescription>
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Assignments</CardDescription>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalAssignments}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Messages</CardDescription>
              <MessageSquare className="w-4 h-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalMessages}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access to Subjects */}
      <h2 className="text-2xl font-bold mb-4">
        <span className="bg-gradient-primary bg-clip-text text-transparent">
          Learning Subjects
        </span>
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.slice(0, 6).map((subject) => (
            <Card 
              key={subject.id} 
              className="hover:shadow-medium transition-smooth cursor-pointer"
              onClick={() => navigate(`/tutor/${subject.id}`)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-primary p-3 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                    <CardDescription className="capitalize">{subject.level} Level</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {subject.description || "Explore this subject with AI-powered tutoring."}
                </p>
                <Button className="w-full mt-4 bg-gradient-primary hover:opacity-90">
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Admin Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>System Management</CardTitle>
                <CardDescription>Access full admin controls</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/admin")} className="w-full bg-gradient-primary hover:opacity-90">
              Open Admin Panel
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>View top performing students</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/leaderboard")} variant="outline" className="w-full border-amber-500 text-amber-600 hover:bg-amber-50">
              View Leaderboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
