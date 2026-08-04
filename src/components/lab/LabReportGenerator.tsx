import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
import { 
  FileText, 
  Save, 
  Download, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Sparkles,
  ClipboardList,
  Beaker,
  Target,
  FlaskConical,
  FileCheck
} from "lucide-react";
import { LabEquipment } from "@/hooks/useLabEquipment";

interface LabReportGeneratorProps {
  experimentId: string;
  experimentTitle: string;
  experimentCategory: string;
  selectedEquipment: LabEquipment[];
  simulationData?: Record<string, any>;
  observations?: string[];
  onSave?: (reportId: string) => void;
}

interface ReportData {
  title: string;
  objective: string;
  hypothesis: string;
  materials: string;
  procedure: string;
  observations: string;
  data: string;
  analysis: string;
  conclusion: string;
  errors: string;
  improvements: string;
}

export function LabReportGenerator({
  experimentId,
  experimentTitle,
  experimentCategory,
  selectedEquipment,
  simulationData = {},
  observations = [],
  onSave,
}: LabReportGeneratorProps) {
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({
    title: experimentTitle,
    objective: "",
    hypothesis: "",
    materials: selectedEquipment.map(e => `• ${e.name}`).join("\n"),
    procedure: "",
    observations: observations.join("\n"),
    data: JSON.stringify(simulationData, null, 2),
    analysis: "",
    conclusion: "",
    errors: "",
    improvements: "",
  });

  const updateField = (field: keyof ReportData, value: string) => {
    setReportData(prev => ({ ...prev, [field]: value }));
  };

  const generateAIAnalysis = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("lab-assistant", {
        body: {
          action: "analyze_report",
          experimentId,
          reportData: {
            ...reportData,
            equipment: selectedEquipment.map(e => e.name),
            simulationData,
          },
        },
      });

      if (error) throw error;

      if (data?.analysis) {
        updateField("analysis", data.analysis);
        toast.success("AI analysis generated!");
      }
      if (data?.suggestedConclusion) {
        updateField("conclusion", data.suggestedConclusion);
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Failed to generate AI analysis");
    } finally {
      setGenerating(false);
    }
  };

  const saveReport = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save your report");
        return;
      }

      const reportPayload = {
        user_id: user.id,
        experiment_id: experimentId,
        observations: reportData.observations,
        conclusion: reportData.conclusion,
        data: JSON.parse(JSON.stringify({
          ...simulationData,
          reportData,
          equipment: selectedEquipment.map(e => ({ id: e.id, name: e.name })),
        })) as Json,
      };

      const { data, error } = await supabase
        .from("lab_reports")
        .insert([reportPayload])
        .select()
        .single();

      if (error) throw error;

      toast.success("Lab report saved successfully!");
      onSave?.(data.id);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save report");
    } finally {
      setSaving(false);
    }
  };

  const downloadReport = () => {
    const content = `
LAB REPORT
==========

Title: ${reportData.title}
Category: ${experimentCategory}
Date: ${new Date().toLocaleDateString()}

OBJECTIVE
---------
${reportData.objective || "Not specified"}

HYPOTHESIS
----------
${reportData.hypothesis || "Not specified"}

MATERIALS & EQUIPMENT
--------------------
${reportData.materials}

PROCEDURE
---------
${reportData.procedure || "Not specified"}

OBSERVATIONS
------------
${reportData.observations}

DATA & MEASUREMENTS
------------------
${reportData.data}

ANALYSIS
--------
${reportData.analysis || "Not specified"}

CONCLUSION
----------
${reportData.conclusion || "Not specified"}

SOURCES OF ERROR
----------------
${reportData.errors || "Not specified"}

SUGGESTIONS FOR IMPROVEMENT
---------------------------
${reportData.improvements || "Not specified"}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lab-report-${experimentTitle.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  const completionPercentage = () => {
    const fields = Object.values(reportData);
    const filledFields = fields.filter(f => f.trim().length > 0).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-primary/60 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Lab Report Generator</CardTitle>
              <CardDescription>Document your experiment findings</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={completionPercentage() === 100 ? "default" : "secondary"}>
              {completionPercentage()}% Complete
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                Experiment Title
              </Label>
              <Input
                value={reportData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Enter experiment title..."
              />
            </div>

            {/* Objective */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Objective
              </Label>
              <Textarea
                value={reportData.objective}
                onChange={(e) => updateField("objective", e.target.value)}
                placeholder="What is the purpose of this experiment?"
                rows={2}
              />
            </div>

            {/* Hypothesis */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" />
                Hypothesis
              </Label>
              <Textarea
                value={reportData.hypothesis}
                onChange={(e) => updateField("hypothesis", e.target.value)}
                placeholder="What do you predict will happen?"
                rows={2}
              />
            </div>

            <Separator />

            {/* Materials */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Beaker className="w-4 h-4 text-primary" />
                Materials & Equipment ({selectedEquipment.length} items)
              </Label>
              <Textarea
                value={reportData.materials}
                onChange={(e) => updateField("materials", e.target.value)}
                placeholder="List all materials used..."
                rows={3}
              />
              {selectedEquipment.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedEquipment.slice(0, 5).map((eq) => (
                    <Badge key={eq.id} variant="outline" className="text-xs">
                      {eq.name}
                    </Badge>
                  ))}
                  {selectedEquipment.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedEquipment.length - 5} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Procedure */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                Procedure
              </Label>
              <Textarea
                value={reportData.procedure}
                onChange={(e) => updateField("procedure", e.target.value)}
                placeholder="Describe the steps you followed..."
                rows={4}
              />
            </div>

            <Separator />

            {/* Observations */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Observations
              </Label>
              <Textarea
                value={reportData.observations}
                onChange={(e) => updateField("observations", e.target.value)}
                placeholder="What did you observe during the experiment?"
                rows={4}
              />
              {observations.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {observations.length} automatic observations recorded
                </p>
              )}
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label>Data & Measurements</Label>
              <Textarea
                value={reportData.data}
                onChange={(e) => updateField("data", e.target.value)}
                placeholder="Record your measurements and data..."
                rows={4}
                className="font-mono text-xs"
              />
            </div>

            <Separator />

            {/* Analysis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Analysis
                </Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateAIAnalysis}
                  disabled={generating}
                  className="h-7"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Assist
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={reportData.analysis}
                onChange={(e) => updateField("analysis", e.target.value)}
                placeholder="Analyze your results..."
                rows={4}
              />
            </div>

            {/* Conclusion */}
            <div className="space-y-2">
              <Label>Conclusion</Label>
              <Textarea
                value={reportData.conclusion}
                onChange={(e) => updateField("conclusion", e.target.value)}
                placeholder="What conclusions can you draw from this experiment?"
                rows={3}
              />
            </div>

            <Separator />

            {/* Sources of Error */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Sources of Error
              </Label>
              <Textarea
                value={reportData.errors}
                onChange={(e) => updateField("errors", e.target.value)}
                placeholder="What could have affected your results?"
                rows={2}
              />
            </div>

            {/* Improvements */}
            <div className="space-y-2">
              <Label>Suggestions for Improvement</Label>
              <Textarea
                value={reportData.improvements}
                onChange={(e) => updateField("improvements", e.target.value)}
                placeholder="How could this experiment be improved?"
                rows={2}
              />
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex gap-2 mt-6 pt-4 border-t">
          <Button onClick={saveReport} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Report
              </>
            )}
          </Button>
          <Button variant="outline" onClick={downloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
