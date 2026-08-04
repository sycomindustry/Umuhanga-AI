import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, BookOpen, Award, Target } from "lucide-react";

interface ProgressData {
  id: string;
  topics_completed: unknown[];
  quizzes_taken: number;
  total_score: number;
  last_activity: string;
  subjects: { name: string; icon: string } | null;
}

export const ProgressOverview = () => {
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("student_progress")
      .select(`
        *,
        subjects (name, icon)
      `)
      .eq("user_id", user.id)
      .order("last_activity", { ascending: false });

    if (data) {
      setProgress(data.map(p => ({
        ...p,
        topics_completed: Array.isArray(p.topics_completed) ? p.topics_completed : [],
        subjects: p.subjects as { name: string; icon: string } | null
      })));
    }
    setLoading(false);
  };

  const totalTopics = progress.reduce((acc, p) => acc + (p.topics_completed?.length || 0), 0);
  const totalQuizzes = progress.reduce((acc, p) => acc + (p.quizzes_taken || 0), 0);
  const totalScore = progress.reduce((acc, p) => acc + (p.total_score || 0), 0);
  const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading progress...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTopics}</p>
                <p className="text-xs text-muted-foreground">Topics Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-secondary/20 p-2 rounded-lg">
                <Target className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalQuizzes}</p>
                <p className="text-xs text-muted-foreground">Quizzes Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 p-2 rounded-lg">
                <Award className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageScore}%</p>
                <p className="text-xs text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progress.length}</p>
                <p className="text-xs text-muted-foreground">Active Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Progress */}
      {progress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subject Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {progress.map((p) => (
              <div key={p.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.subjects?.icon || "📚"}</span>
                    <span className="font-medium">{p.subjects?.name || "Subject"}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {p.topics_completed?.length || 0} topics
                  </span>
                </div>
                <Progress 
                  value={Math.min(((p.topics_completed?.length || 0) / 10) * 100, 100)} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {progress.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No progress data yet</p>
            <p className="text-sm text-muted-foreground">Start learning to track your progress!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
