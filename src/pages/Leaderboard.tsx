import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  total_score: number;
  quizzes_completed: number;
  full_name: string;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);

    // Get quiz attempts aggregated by user
    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("user_id, score");

    if (attempts) {
      // Aggregate scores by user
      const userScores: Record<string, { total: number; count: number }> = {};
      attempts.forEach((a) => {
        if (!userScores[a.user_id]) {
          userScores[a.user_id] = { total: 0, count: 0 };
        }
        userScores[a.user_id].total += a.score;
        userScores[a.user_id].count += 1;
      });

      // Get display names only (emails are never exposed)
      const userIds = Object.keys(userScores);
      const { data: profiles } = await supabase.rpc("get_display_names", {
        _ids: userIds,
      });

      const leaderboard: LeaderboardEntry[] = userIds.map((userId) => ({
        user_id: userId,
        total_score: userScores[userId].total,
        quizzes_completed: userScores[userId].count,
        full_name: profiles?.find((p) => p.id === userId)?.full_name || "Unknown"
      }));

      leaderboard.sort((a, b) => b.total_score - a.total_score);
      setEntries(leaderboard.slice(0, 50));
    }
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-amber-400" />;
      case 2: return <Medal className="h-6 w-6 text-slate-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <span className="w-6 text-center text-muted-foreground">{rank}</span>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-8 w-8 text-amber-400" />
              Leaderboard
            </h1>
            <p className="text-muted-foreground">Top performers this month</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading leaderboard...</div>
        ) : entries.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No quiz attempts yet. Be the first!</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Top Students</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {entries.map((entry, idx) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                    entry.user_id === currentUserId
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="w-8 flex justify-center">
                    {getRankIcon(idx + 1)}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={idx < 3 ? "bg-primary/20" : ""}>
                      {getInitials(entry.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {entry.full_name}
                      {entry.user_id === currentUserId && (
                        <span className="text-xs text-primary ml-2">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {entry.quizzes_completed} quizzes completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{entry.total_score}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
