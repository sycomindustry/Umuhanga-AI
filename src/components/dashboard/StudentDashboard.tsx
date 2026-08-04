import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare, FileQuestion, Trophy, Calendar, Mail, Library, TrendingUp } from "lucide-react";
import { ProgressOverview } from "./ProgressOverview";

interface Subject {
  id: string;
  name: string;
  level: string;
  description: string;
  icon: string;
}

interface StudentDashboardProps {
  subjects: Subject[];
  educationLevel: string | null;
  loading: boolean;
}

export const StudentDashboard = ({ subjects, educationLevel, loading }: StudentDashboardProps) => {
  const navigate = useNavigate();

  // Filter subjects by student's education level
  const filteredSubjects = educationLevel 
    ? subjects.filter(s => s.level === educationLevel)
    : subjects;

  const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
    if (!acc[subject.level]) {
      acc[subject.level] = [];
    }
    acc[subject.level].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  return (
    <>
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-primary/20 hover:border-primary"
          onClick={() => navigate("/virtual-lab")}
        >
          <CardHeader className="p-4">
            <div className="bg-gradient-primary p-3 rounded-lg w-fit mx-auto">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Virtual Lab</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-secondary/20 hover:border-secondary"
          onClick={() => navigate("/tutor")}
        >
          <CardHeader className="p-4">
            <div className="bg-gradient-secondary p-3 rounded-lg w-fit mx-auto">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">AI Tutor</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-accent/20 hover:border-accent"
          onClick={() => navigate("/quizzes")}
        >
          <CardHeader className="p-4">
            <div className="bg-accent p-3 rounded-lg w-fit mx-auto">
              <FileQuestion className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Quizzes</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-amber-500/20 hover:border-amber-500"
          onClick={() => navigate("/leaderboard")}
        >
          <CardHeader className="p-4">
            <div className="bg-amber-500 p-3 rounded-lg w-fit mx-auto">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Leaderboard</CardTitle>
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

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-primary/20 hover:border-primary"
          onClick={() => navigate("/content-library")}
        >
          <CardHeader className="p-4">
            <div className="bg-gradient-primary p-3 rounded-lg w-fit mx-auto">
              <Library className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Library</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-purple-500/20 hover:border-purple-500">
          <CardHeader className="p-4">
            <div className="bg-purple-500 p-3 rounded-lg w-fit mx-auto">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Progress</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Education Level Badge */}
      {educationLevel && (
        <div className="mb-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-medium capitalize">
            📚 {educationLevel} Level Student
          </span>
        </div>
      )}

      {/* Progress Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Your Progress
          </span>
        </h2>
        <ProgressOverview />
      </div>

      {/* Subjects */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading subjects...</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No subjects available for your education level.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSubjects).map(([level, levelSubjects]) => (
            <div key={level}>
              <h2 className="text-2xl font-bold mb-4 capitalize flex items-center gap-2">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  {level} Level
                </span>
                <span className="text-sm text-muted-foreground">
                  ({levelSubjects.length} subjects)
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {levelSubjects.map((subject) => (
                  <Card 
                    key={subject.id}
                    className="hover:shadow-medium transition-smooth cursor-pointer border-2 hover:border-primary"
                    onClick={() => navigate(`/tutor/${subject.id}`, { state: { subject } })}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{subject.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{subject.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {subject.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-gradient-primary hover:opacity-90">
                        Start Learning
                      </Button>
                    </CardContent>
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
