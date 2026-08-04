import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, LogOut, TrendingUp, BookOpen, Award, Clock } from "lucide-react";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isParent, setIsParent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);

  useEffect(() => {
    checkParentAccess();
  }, []);

  const checkParentAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasParentRole = roles?.some(r => r.role === "parent");
    
    if (!hasParentRole) {
      toast({
        title: "Access Denied",
        description: "You don't have parent access privileges",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setIsParent(true);
    loadStudentProgress();
  };

  const loadStudentProgress = async () => {
    try {
      const { data, error } = await supabase
        .from("student_progress")
        .select(`
          *,
          profiles:user_id (full_name, email),
          subjects (name, icon)
        `)
        .order("last_activity", { ascending: false });

      if (error) throw error;
      setStudentProgress(data || []);
    } catch (error) {
      console.error("Error loading student progress:", error);
      toast({
        title: "Error",
        description: "Failed to load student progress",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!isParent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-primary text-white shadow-strong">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Parent Dashboard</h1>
                <p className="text-white/90">Monitor your child's learning progress</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
              <Button 
                variant="secondary" 
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Student Progress Overview
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Track performance, attendance, and achievements
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading progress data...</p>
          </div>
        ) : studentProgress.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-20 h-20 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground text-lg">No progress data available yet</p>
            <p className="text-sm text-muted-foreground">Progress will appear as students use the platform</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {studentProgress.map((progress) => (
              <Card key={progress.id} className="border-2 hover:border-primary transition-smooth">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {progress.subjects?.icon && <span>{progress.subjects.icon}</span>}
                        {progress.subjects?.name || "Subject"}
                      </CardTitle>
                      <CardDescription>
                        Student: {progress.profiles?.full_name || "Unknown"}
                      </CardDescription>
                    </div>
                    <div className="bg-gradient-primary p-3 rounded-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-2xl font-bold">{progress.topics_completed?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Topics</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="w-5 h-5 text-secondary" />
                      </div>
                      <p className="text-2xl font-bold">{progress.quizzes_taken || 0}</p>
                      <p className="text-xs text-muted-foreground">Quizzes</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Award className="w-5 h-5 text-accent" />
                      </div>
                      <p className="text-2xl font-bold">{progress.total_score || 0}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>
                  
                  {progress.last_activity && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                      <Clock className="w-4 h-4" />
                      <span>Last active: {new Date(progress.last_activity).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ParentDashboard;
