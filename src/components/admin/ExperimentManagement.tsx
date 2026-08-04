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
import { Plus, Trash2, Loader2, Edit2, Beaker } from "lucide-react";
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

interface Experiment {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: "primary" | "secondary" | "tvet";
  subject_id: string;
  safety_notes: string | null;
  subjects?: { name: string } | null;
}

const CATEGORIES = [
  "Chemistry",
  "Physics",
  "Biology",
  "Environmental Science",
  "Electronics",
  "Mechanics",
  "General Science",
];

export const ExperimentManagement = () => {
  const { toast } = useToast();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Chemistry",
    level: "secondary" as "primary" | "secondary" | "tvet",
    subject_id: "",
    safety_notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [experimentsRes, subjectsRes] = await Promise.all([
      supabase
        .from("experiments")
        .select("*, subjects(name)")
        .order("created_at", { ascending: false }),
      supabase.from("subjects").select("id, name").order("name"),
    ]);

    if (experimentsRes.error) {
      toast({
        title: "Error",
        description: "Failed to load experiments",
        variant: "destructive",
      });
    } else {
      setExperiments(experimentsRes.data as Experiment[]);
    }

    if (subjectsRes.data) {
      setSubjects(subjectsRes.data);
      if (subjectsRes.data.length > 0 && !formData.subject_id) {
        setFormData((prev) => ({ ...prev, subject_id: subjectsRes.data[0].id }));
      }
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.subject_id) {
      toast({
        title: "Error",
        description: "Title and subject are required",
        variant: "destructive",
      });
      return;
    }

    const experimentData = {
      title: formData.title,
      description: formData.description || null,
      category: formData.category,
      level: formData.level,
      subject_id: formData.subject_id,
      safety_notes: formData.safety_notes || null,
    };

    if (editingExperiment) {
      const { error } = await supabase
        .from("experiments")
        .update(experimentData)
        .eq("id", editingExperiment.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update experiment",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Experiment updated successfully",
        });
        loadData();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("experiments").insert(experimentData);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create experiment",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Experiment created successfully",
        });
        loadData();
        resetForm();
      }
    }
  };

  const handleEdit = (experiment: Experiment) => {
    setEditingExperiment(experiment);
    setFormData({
      title: experiment.title,
      description: experiment.description || "",
      category: experiment.category,
      level: experiment.level,
      subject_id: experiment.subject_id,
      safety_notes: experiment.safety_notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("experiments").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete experiment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Experiment deleted successfully",
      });
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "Chemistry",
      level: "secondary",
      subject_id: subjects[0]?.id || "",
      safety_notes: "",
    });
    setEditingExperiment(null);
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
        <h3 className="text-lg font-semibold">Experiment Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Experiment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingExperiment ? "Edit Experiment" : "Add New Experiment"}
              </DialogTitle>
              <DialogDescription>
                {editingExperiment 
                  ? "Update the experiment details below"
                  : "Create a new virtual lab experiment"
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Experiment Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Acid-Base Titration"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the experiment"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={formData.subject_id}
                    onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Education Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value as typeof formData.level })}
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
              <div className="space-y-2">
                <Label htmlFor="safety">Safety Notes</Label>
                <Textarea
                  id="safety"
                  value={formData.safety_notes}
                  onChange={(e) => setFormData({ ...formData, safety_notes: e.target.value })}
                  placeholder="Important safety guidelines"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingExperiment ? "Update" : "Create"} Experiment
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
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiments.map((experiment) => (
              <TableRow key={experiment.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Beaker className="w-4 h-4 text-primary" />
                    <span className="font-medium">{experiment.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {experiment.subjects?.name || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{experiment.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getLevelColor(experiment.level)}>
                    {experiment.level}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(experiment)}
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
                          <AlertDialogTitle>Delete Experiment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{experiment.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(experiment.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {experiments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No experiments found. Create your first experiment!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
