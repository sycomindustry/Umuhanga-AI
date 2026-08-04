import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, BookOpen, FlaskConical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

interface Subject {
  id: string;
  name: string;
  description: string;
  level: string;
  icon: string;
  created_at: string;
}

interface Experiment {
  id: string;
  title: string;
  category: string;
  level: string;
  subject_id: string;
  created_at: string;
}

interface Assignment {
  id: string;
  title: string;
  type: string;
  due_date: string;
  total_points: number;
  created_at: string;
}

export const ContentManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [subjectsRes, experimentsRes, assignmentsRes] = await Promise.all([
        supabase.from("subjects").select("*").order("created_at", { ascending: false }),
        supabase.from("experiments").select("*").order("created_at", { ascending: false }),
        supabase.from("assignments").select("*").order("created_at", { ascending: false }),
      ]);

      if (subjectsRes.data) setSubjects(subjectsRes.data);
      if (experimentsRes.data) setExperiments(experimentsRes.data);
      if (assignmentsRes.data) setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error("Error loading content:", error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      await supabase.from("assignments").delete().eq("id", id);
      toast({ title: "Success", description: "Assignment deleted" });
      loadContent();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete assignment", variant: "destructive" });
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
    <Tabs defaultValue="subjects" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="subjects">Subjects ({subjects.length})</TabsTrigger>
        <TabsTrigger value="experiments">Experiments ({experiments.length})</TabsTrigger>
        <TabsTrigger value="assignments">Assignments ({assignments.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="subjects" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Subjects
          </h3>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{subject.level}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">{subject.description}</TableCell>
                  <TableCell>{new Date(subject.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="experiments" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            Experiments
          </h3>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiments.map((experiment) => (
                <TableRow key={experiment.id}>
                  <TableCell className="font-medium">{experiment.title}</TableCell>
                  <TableCell>
                    <Badge>{experiment.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{experiment.level}</Badge>
                  </TableCell>
                  <TableCell>{new Date(experiment.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="assignments" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Assignments</h3>
          <Button onClick={() => navigate("/admin/assignments/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Points</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>
                    <Badge>{assignment.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : "No due date"}
                  </TableCell>
                  <TableCell>{assignment.total_points}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => deleteAssignment(assignment.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
};
