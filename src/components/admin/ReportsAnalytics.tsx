import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, TrendingUp, TrendingDown, Activity, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActivityLog {
  user_name: string;
  subject_name: string;
  last_activity: string;
  total_score: number;
}

export const ReportsAnalytics = () => {
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [topPerformers, setTopPerformers] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeStudents: 0,
    completedAssignments: 0,
    avgScore: 0,
    labReports: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [progressRes, submissionsRes, reportsRes] = await Promise.all([
        supabase
          .from("student_progress")
          .select(`
            *,
            profiles:user_id(full_name),
            subjects:subject_id(name)
          `)
          .order("last_activity", { ascending: false }),
        supabase.from("submissions").select("*"),
        supabase.from("lab_reports").select("*"),
      ]);

      if (progressRes.data) {
        const activities = progressRes.data
          .filter((p: any) => p.profiles && p.subjects)
          .map((p: any) => ({
            user_name: p.profiles.full_name,
            subject_name: p.subjects.name,
            last_activity: p.last_activity,
            total_score: p.total_score || 0,
          }));

        setRecentActivity(activities.slice(0, 10));
        
        const sorted = [...activities].sort((a, b) => b.total_score - a.total_score);
        setTopPerformers(sorted.slice(0, 5));

        const uniqueUsers = new Set(progressRes.data.map((p: any) => p.user_id));
        const avgScore = activities.reduce((sum, a) => sum + a.total_score, 0) / activities.length || 0;

        setStats({
          activeStudents: uniqueUsers.size,
          completedAssignments: submissionsRes.data?.filter((s: any) => s.graded_at).length || 0,
          avgScore: Math.round(avgScore),
          labReports: reportsRes.data?.length || 0,
        });
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Active Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-secondary" />
              Completed Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Lab Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.labReports}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest student learning activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((activity, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{activity.user_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{activity.subject_name}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(activity.last_activity).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Students with highest scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformers.map((performer, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{performer.user_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{performer.subject_name}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="default">{performer.total_score} pts</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
