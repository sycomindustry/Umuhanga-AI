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
import { Plus, Trash2, Loader2, Edit2 } from "lucide-react";
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
  description: string | null;
  icon: string | null;
  level: "primary" | "secondary" | "tvet";
  created_at: string;
}

const SUBJECT_ICONS = [
  { value: "📚", label: "Book" },
  { value: "🔬", label: "Science" },
  { value: "🧮", label: "Math" },
  { value: "🌍", label: "Geography" },
  { value: "📜", label: "History" },
  { value: "💻", label: "Computer" },
  { value: "🎨", label: "Art" },
  { value: "🎵", label: "Music" },
  { value: "⚽", label: "Sports" },
  { value: "🔧", label: "Technical" },
  { value: "💼", label: "Business" },
  { value: "🌱", label: "Agriculture" },
];

export const SubjectManagement = () => {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "📚",
    level: "secondary" as "primary" | "secondary" | "tvet",
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("level", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      });
    } else {
      setSubjects(data as Subject[]);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Subject name is required",
        variant: "destructive",
      });
      return;
    }

    if (editingSubject) {
      const { error } = await supabase
        .from("subjects")
        .update({
          name: formData.name,
          description: formData.description || null,
          icon: formData.icon,
          level: formData.level,
        })
        .eq("id", editingSubject.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update subject",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Subject updated successfully",
        });
        loadSubjects();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("subjects").insert({
        name: formData.name,
        description: formData.description || null,
        icon: formData.icon,
        level: formData.level,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create subject",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Subject created successfully",
        });
        loadSubjects();
        resetForm();
      }
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || "",
      icon: subject.icon || "📚",
      level: subject.level,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("subjects").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject. It may have associated content.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
      loadSubjects();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "📚",
      level: "secondary",
    });
    setEditingSubject(null);
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
        <h3 className="text-lg font-semibold">Subject Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </DialogTitle>
              <DialogDescription>
                {editingSubject 
                  ? "Update the subject details below"
                  : "Create a new subject for students to study"
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the subject"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger id="icon">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECT_ICONS.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.value} {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingSubject ? "Update" : "Create"} Subject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="text-2xl">{subject.icon || "📚"}</TableCell>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {subject.description || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getLevelColor(subject.level)}>
                    {subject.level}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(subject)}
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
                          <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{subject.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(subject.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {subjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No subjects found. Create your first subject!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
