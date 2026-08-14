import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Edit2, FileText, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Subject {
  id: string;
  name: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  level: string;
  time_limit: number | null;
  subject_id: string | null;
  created_at: string;
  subjects?: { name: string } | null;
  _count?: { questions: number };
}

const NO_SUBJECT_VALUE = "__no_subject__";

export const QuizManagement = () => {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "secondary",
    time_limit: 30,
    subject_id: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [quizzesRes, subjectsRes] = await Promise.all([
      supabase
        .from("quizzes")
        .select("*, subjects(name)")
        .order("created_at", { ascending: false }),
      supabase.from("subjects").select("id, name").order("name"),
    ]);

    if (quizzesRes.error) {
      toast({
        title: "Error",
        description: "Failed to load quizzes",
        variant: "destructive",
      });
    } else {
      setQuizzes(quizzesRes.data as Quiz[]);
    }

    if (subjectsRes.data) {
      setSubjects(subjectsRes.data);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Quiz title is required",
        variant: "destructive",
      });
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const quizData = {
      title: formData.title,
      description: formData.description || null,
      level: formData.level,
      time_limit: formData.time_limit,
      subject_id: formData.subject_id || null,
      created_by: userData.user.id,
    };

    if (editingQuiz) {
      const { error } = await supabase
        .from("quizzes")
        .update({
          title: formData.title,
          description: formData.description || null,
          level: formData.level,
          time_limit: formData.time_limit,
          subject_id: formData.subject_id || null,
        })
        .eq("id", editingQuiz.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update quiz",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Quiz updated successfully",
        });
        loadData();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("quizzes").insert(quizData);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create quiz",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Quiz created successfully",
        });
        loadData();
        resetForm();
      }
    }
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || "",
      level: quiz.level,
      time_limit: quiz.time_limit || 30,
      subject_id: quiz.subject_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    // First delete quiz questions
    await supabase.from("quiz_questions").delete().eq("quiz_id", id);
    // Then delete quiz attempts
    await supabase.from("quiz_attempts").delete().eq("quiz_id", id);
    // Finally delete the quiz
    const { error } = await supabase.from("quizzes").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      level: "secondary",
      time_limit: 30,
      subject_id: "",
    });
    setEditingQuiz(null);
    setIsDialogOpen(false);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "primary":
        return "bg-secondary/20 text-secondary";
      case "secondary":
        return "bg-primary/20 text-primary";
      case "tvet":
        return "bg-accent/20 text-accent";
      default:
        return "bg-muted text-muted-foreground";
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quiz Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingQuiz ? "Edit Quiz" : "Create New Quiz"}
              </DialogTitle>
              <DialogDescription>
                {editingQuiz 
                  ? "Update the quiz details below"
                  : "Create a new quiz for students"
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Chapter 1 Review"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the quiz"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Select
                    value={formData.subject_id || NO_SUBJECT_VALUE}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        subject_id: value === NO_SUBJECT_VALUE ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_SUBJECT_VALUE}>No subject</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger id="level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="tvet">TVET</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time Limit (minutes)</Label>
                <Input
                  id="time"
                  type="number"
                  min={5}
                  max={180}
                  value={formData.time_limit}
                  onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingQuiz ? "Update" : "Create"} Quiz
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Time Limit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-medium">{quiz.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {quiz.subjects?.name || "General"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getLevelColor(quiz.level)}>
                    {quiz.level}
                  </Badge>
                </TableCell>
                <TableCell>{quiz.time_limit} min</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(quiz)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{quiz.title}"? This will also delete all questions and attempts.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(quiz.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {quizzes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No quizzes found. Create your first quiz!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
