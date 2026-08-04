import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxPoints: number;
  learningObjectives: string[];
}

interface RubricBuilderProps {
  rubric: RubricCriterion[];
  onChange: (rubric: RubricCriterion[]) => void;
}

export const RubricBuilder = ({ rubric, onChange }: RubricBuilderProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addCriterion = () => {
    const newCriterion: RubricCriterion = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      weight: 1,
      maxPoints: 10,
      learningObjectives: [""]
    };
    onChange([...rubric, newCriterion]);
    setEditingId(newCriterion.id);
  };

  const updateCriterion = (id: string, updates: Partial<RubricCriterion>) => {
    onChange(rubric.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCriterion = (id: string) => {
    onChange(rubric.filter(c => c.id !== id));
    toast.success("Criterion removed");
  };

  const addLearningObjective = (criterionId: string) => {
    const criterion = rubric.find(c => c.id === criterionId);
    if (criterion) {
      updateCriterion(criterionId, {
        learningObjectives: [...criterion.learningObjectives, ""]
      });
    }
  };

  const updateLearningObjective = (criterionId: string, index: number, value: string) => {
    const criterion = rubric.find(c => c.id === criterionId);
    if (criterion) {
      const newObjectives = [...criterion.learningObjectives];
      newObjectives[index] = value;
      updateCriterion(criterionId, { learningObjectives: newObjectives });
    }
  };

  const removeLearningObjective = (criterionId: string, index: number) => {
    const criterion = rubric.find(c => c.id === criterionId);
    if (criterion && criterion.learningObjectives.length > 1) {
      updateCriterion(criterionId, {
        learningObjectives: criterion.learningObjectives.filter((_, i) => i !== index)
      });
    }
  };

  const totalWeight = rubric.reduce((sum, c) => sum + c.weight, 0);
  const totalPoints = rubric.reduce((sum, c) => sum + c.maxPoints, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Grading Rubric</h3>
          <p className="text-sm text-muted-foreground">
            Total Weight: {totalWeight.toFixed(1)} | Total Points: {totalPoints}
          </p>
        </div>
        <Button onClick={addCriterion} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Criterion
        </Button>
      </div>

      {rubric.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No criteria added yet. Click "Add Criterion" to create your rubric.
          </CardContent>
        </Card>
      )}

      {rubric.map((criterion, index) => (
        <Card key={criterion.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">
                  Criterion {index + 1}
                </CardTitle>
                <CardDescription>
                  Weight: {((criterion.weight / totalWeight) * 100).toFixed(0)}% of grade
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCriterion(criterion.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`name-${criterion.id}`}>Criterion Name *</Label>
                <Input
                  id={`name-${criterion.id}`}
                  value={criterion.name}
                  onChange={(e) => updateCriterion(criterion.id, { name: e.target.value })}
                  placeholder="e.g., Content Understanding"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor={`weight-${criterion.id}`}>Weight *</Label>
                  <Input
                    id={`weight-${criterion.id}`}
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={criterion.weight}
                    onChange={(e) => updateCriterion(criterion.id, { weight: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`points-${criterion.id}`}>Max Points *</Label>
                  <Input
                    id={`points-${criterion.id}`}
                    type="number"
                    min="1"
                    value={criterion.maxPoints}
                    onChange={(e) => updateCriterion(criterion.id, { maxPoints: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`desc-${criterion.id}`}>Description</Label>
              <Textarea
                id={`desc-${criterion.id}`}
                value={criterion.description}
                onChange={(e) => updateCriterion(criterion.id, { description: e.target.value })}
                placeholder="Describe what this criterion evaluates..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Learning Objectives</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addLearningObjective(criterion.id)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
              {criterion.learningObjectives.map((obj, objIndex) => (
                <div key={objIndex} className="flex gap-2">
                  <Input
                    value={obj}
                    onChange={(e) => updateLearningObjective(criterion.id, objIndex, e.target.value)}
                    placeholder="e.g., Student can explain the water cycle"
                  />
                  {criterion.learningObjectives.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLearningObjective(criterion.id, objIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
