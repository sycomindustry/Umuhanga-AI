import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Users, FileQuestion, Calendar, Mail, Library, ClipboardList, TrendingUp, PlusCircle } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  level: string;
  description: string;
  icon: string;
}

interface TeacherDashboardProps {
  subjects: Subject[];
  loading: boolean;
}

export const TeacherDashboard = ({ subjects, loading }: TeacherDashboardProps) => {
  const navigate = useNavigate();

  const groupedSubjects = subjects.reduce((acc, subject) => {
    if (!acc[subject.level]) {
      acc[subject.level] = [];
    }
    acc[subject.level].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  return (
    <>
      {/* Teacher Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-primary/20 hover:border-primary"
          onClick={() => navigate("/admin/assignments/create")}
        >
          <CardHeader className="p-4">
            <div className="bg-gradient-primary p-3 rounded-lg w-fit mx-auto">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Create Assignment</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-secondary/20 hover:border-secondary"
          onClick={() => navigate("/quizzes")}
        >
          <CardHeader className="p-4">
            <div className="bg-gradient-secondary p-3 rounded-lg w-fit mx-auto">
              <FileQuestion className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Manage Quizzes</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-accent/20 hover:border-accent"
          onClick={() => navigate("/content-library")}
        >
          <CardHeader className="p-4">
            <div className="bg-accent p-3 rounded-lg w-fit mx-auto">
              <Library className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Content Library</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-amber-500/20 hover:border-amber-500"
          onClick={() => navigate("/leaderboard")}
        >
          <CardHeader className="p-4">
            <div className="bg-amber-500 p-3 rounded-lg w-fit mx-auto">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Student Progress</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-blue-500/20 hover:border-blue-500"
          onClick={() => navigate("/calendar")}
        >
          <CardHeader className="p-4">
            <div className="bg-blue-500 p-3 rounded-lg w-fit mx-auto">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Calendar</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-emerald-500/20 hover:border-emerald-500"
          onClick={() => navigate("/messages")}
        >
          <CardHeader className="p-4">
            <div className="bg-emerald-500 p-3 rounded-lg w-fit mx-auto">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Messages</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Subjects</CardDescription>
            <CardTitle className="text-3xl">{subjects.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Primary Level</CardDescription>
            <CardTitle className="text-3xl">{groupedSubjects['primary']?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Secondary Level</CardDescription>
            <CardTitle className="text-3xl">{groupedSubjects['secondary']?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>TVET Level</CardDescription>
            <CardTitle className="text-3xl">{groupedSubjects['tvet']?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Teacher Tools */}
      <h2 className="text-2xl font-bold mb-4">
        <span className="bg-gradient-primary bg-clip-text text-transparent">
          Teacher Tools
        </span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-medium transition-smooth cursor-pointer" onClick={() => navigate("/virtual-lab")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Virtual Lab</CardTitle>
                <CardDescription>Manage lab experiments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Open Lab</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-medium transition-smooth cursor-pointer" onClick={() => navigate("/tutor/general")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-secondary p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>AI Tutor</CardTitle>
                <CardDescription>View student conversations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Tutor</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-medium transition-smooth cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-accent p-3 rounded-lg">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Submissions</CardTitle>
                <CardDescription>Review student work</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Submissions</Button>
          </CardContent>
        </Card>
      </div>

      {/* All Subjects Overview */}
      <h2 className="text-2xl font-bold mb-4">
        <span className="bg-gradient-primary bg-clip-text text-transparent">
          All Subjects
        </span>
      </h2>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading subjects...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSubjects).map(([level, levelSubjects]) => (
            <div key={level}>
              <h3 className="text-lg font-semibold mb-3 capitalize">{level} Level ({levelSubjects.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {levelSubjects.map((subject) => (
                  <Card 
                    key={subject.id}
                    className="hover:shadow-sm transition-smooth cursor-pointer"
                    onClick={() => navigate(`/tutor/${subject.id}`, { state: { subject } })}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{subject.icon}</span>
                        <CardTitle className="text-sm">{subject.name}</CardTitle>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
