import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Trophy, BookOpen } from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string;
  level: string;
  time_limit: number;
  subjects?: { name: string } | null;
}

const Quizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoadQuizzes();
  }, []);

  const checkAuthAndLoadQuizzes = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    loadQuizzes();
  };

  const loadQuizzes = async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*, subjects(name)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setQuizzes(data);
    }
    setLoading(false);
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "primary": return "bg-emerald-500/20 text-emerald-400";
      case "olevel": return "bg-blue-500/20 text-blue-400";
      case "alevel": return "bg-purple-500/20 text-purple-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quizzes</h1>
            <p className="text-muted-foreground">Test your knowledge and earn points</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No quizzes available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/quiz/${quiz.id}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <Badge className={getLevelColor(quiz.level)}>{quiz.level}</Badge>
                  </div>
                  <CardDescription>{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {quiz.time_limit} min
                    </span>
                    {quiz.subjects && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {quiz.subjects.name}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;
