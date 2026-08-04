import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database, Shield, Bell, Loader2, Sparkles } from "lucide-react";

const SAMPLE_SUBJECTS = [
  { name: "Mathematics", description: "Numbers, algebra, geometry and more", icon: "🧮", level: "secondary" as const },
  { name: "Physics", description: "Study of matter, energy and forces", icon: "⚡", level: "secondary" as const },
  { name: "Chemistry", description: "Study of substances and reactions", icon: "🧪", level: "secondary" as const },
  { name: "Biology", description: "Study of living organisms", icon: "🧬", level: "secondary" as const },
  { name: "Geography", description: "Study of Earth and its features", icon: "🌍", level: "secondary" as const },
  { name: "History", description: "Study of past events", icon: "📜", level: "secondary" as const },
  { name: "English", description: "English language and literature", icon: "📚", level: "secondary" as const },
  { name: "Computer Science", description: "Study of computers and technology", icon: "💻", level: "secondary" as const },
  { name: "Basic Math", description: "Counting, addition and subtraction", icon: "➕", level: "primary" as const },
  { name: "Science", description: "Introduction to science", icon: "🔬", level: "primary" as const },
  { name: "Electronics", description: "Study of electronic systems", icon: "🔧", level: "tvet" as const },
  { name: "Agriculture", description: "Farming and crop production", icon: "🌱", level: "tvet" as const },
];

const SAMPLE_QUIZZES = [
  { title: "Physics Fundamentals", description: "Test your knowledge of basic physics concepts", level: "secondary" },
  { title: "Chemistry Basics", description: "Introduction to chemistry principles", level: "secondary" },
  { title: "Biology Essentials", description: "Core biology concepts and terminology", level: "secondary" },
  { title: "Mathematics Challenge", description: "Test your math problem-solving skills", level: "secondary" },
  { title: "Primary Science Quiz", description: "Fun science questions for young learners", level: "primary" },
];

export const SystemSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowSignups: true,
    requireEmailVerification: false,
    enableNotifications: true,
    maxUploadSize: 10,
    sessionTimeout: 60,
  });

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully",
    });
  };

  const handleLoadSampleData = async () => {
    setLoading(true);
    try {
      // Check if subjects already exist
      const { data: existingSubjects } = await supabase
        .from("subjects")
        .select("id")
        .limit(1);

      if (existingSubjects && existingSubjects.length > 0) {
        toast({
          title: "Data Already Exists",
          description: "Sample subjects have already been loaded",
        });
        setLoading(false);
        return;
      }

      // Insert sample subjects
      const { error: subjectsError } = await supabase
        .from("subjects")
        .insert(SAMPLE_SUBJECTS);

      if (subjectsError) throw subjectsError;

      // Get inserted subjects
      const { data: subjects } = await supabase
        .from("subjects")
        .select("id, name")
        .in("name", ["Physics", "Chemistry", "Biology"]);

      if (subjects && subjects.length > 0) {
        // Insert sample experiments
        const experiments = subjects.flatMap((subject) => [
          {
            title: `Introduction to ${subject.name}`,
            description: `Basic concepts and fundamentals of ${subject.name}`,
            category: subject.name,
            level: "secondary" as const,
            subject_id: subject.id,
            safety_notes: "Follow all lab safety guidelines",
          },
          {
            title: `Advanced ${subject.name} Lab`,
            description: `Advanced experiments in ${subject.name}`,
            category: subject.name,
            level: "tvet" as const,
            subject_id: subject.id,
            safety_notes: "Requires supervision",
          },
        ]);

        await supabase.from("experiments").insert(experiments);
      }

      // Get current user for quiz creation
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if quizzes already exist
        const { data: existingQuizzes } = await supabase
          .from("quizzes")
          .select("id")
          .limit(1);

        if (!existingQuizzes || existingQuizzes.length === 0) {
          // Get a subject for each quiz
          const { data: allSubjects } = await supabase
            .from("subjects")
            .select("id, name");

          const quizzesToInsert = SAMPLE_QUIZZES.map((quiz, idx) => {
            const subject = allSubjects?.find(s => 
              quiz.title.toLowerCase().includes(s.name.toLowerCase().split(' ')[0])
            );
            return {
              ...quiz,
              created_by: user.id,
              subject_id: subject?.id || allSubjects?.[idx % (allSubjects?.length || 1)]?.id || null,
            };
          });

          const { data: insertedQuizzes } = await supabase
            .from("quizzes")
            .insert(quizzesToInsert)
            .select("id, title");

          // Add sample questions to each quiz
          if (insertedQuizzes) {
            const questions = insertedQuizzes.flatMap((quiz) => [
              {
                quiz_id: quiz.id,
                question: `Sample question 1 for ${quiz.title}`,
                options: JSON.stringify(["Option A", "Option B", "Option C", "Option D"]),
                correct_answer: 0,
                points: 10,
                explanation: "This is the correct answer explanation"
              },
              {
                quiz_id: quiz.id,
                question: `Sample question 2 for ${quiz.title}`,
                options: JSON.stringify(["Choice 1", "Choice 2", "Choice 3", "Choice 4"]),
                correct_answer: 1,
                points: 10,
                explanation: "Explanation for the correct answer"
              },
              {
                quiz_id: quiz.id,
                question: `Sample question 3 for ${quiz.title}`,
                options: JSON.stringify(["Answer A", "Answer B", "Answer C", "Answer D"]),
                correct_answer: 2,
                points: 10,
                explanation: "Why this is correct"
              },
            ]);

            await supabase.from("quiz_questions").insert(questions);
          }
        }
      }

      toast({
        title: "Sample Data Loaded",
        description: "Subjects, experiments, and quizzes have been created successfully",
      });
    } catch (error) {
      console.error("Error loading sample data:", error);
      toast({
        title: "Error",
        description: "Failed to load sample data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>Initialize the platform with sample data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Load Sample Data</Label>
              <p className="text-sm text-muted-foreground">
                Create sample subjects and experiments to get started quickly
              </p>
            </div>
            <Button onClick={handleLoadSampleData} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Load Sample Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Manage authentication and security preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow New Signups</Label>
              <p className="text-sm text-muted-foreground">Enable or disable new user registrations</p>
            </div>
            <Switch
              checked={settings.allowSignups}
              onCheckedChange={(checked) => setSettings({ ...settings, allowSignups: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">Users must verify email before accessing platform</p>
            </div>
            <Switch
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Session Timeout (minutes)</Label>
            <Input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            System Configuration
          </CardTitle>
          <CardDescription>General system settings and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Block access to platform for non-admin users</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Max Upload Size (MB)</Label>
            <Input
              type="number"
              value={settings.maxUploadSize}
              onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure system notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable System Notifications</Label>
              <p className="text-sm text-muted-foreground">Send notifications for system events</p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button onClick={handleSaveSettings}>Save Changes</Button>
      </div>
    </div>
  );
};
