import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Beaker, AlertTriangle, BookOpen, Wifi, FlaskConical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InteractiveLab } from "@/components/lab/InteractiveLab";
import { useRealtimeLab } from "@/hooks/useRealtimeLab";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LabType } from "@/types/lab";

interface Experiment {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  safety_notes: string;
  materials: any;
  procedure: any;
  learning_objectives: any;
}

const ExperimentLab = () => {
  const { experimentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [observations, setObservations] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationData, setSimulationData] = useState<any>(null);

  const { connected, guidance, requestAIGuidance, logAction } = useRealtimeLab({
    experimentId: experimentId || "",
    onAIGuidance: (g) => {
      if (g.message) {
        setChatHistory(prev => [...prev, { role: "assistant", content: g.message }]);
      }
    }
  });

  useEffect(() => {
    loadExperiment();
  }, [experimentId]);

  const loadExperiment = async () => {
    if (!experimentId) return;

    const { data, error } = await supabase
      .from("experiments")
      .select("*")
      .eq("id", experimentId)
      .single();

    if (error) {
      console.error("Error loading experiment:", error);
      toast({
        title: "Error",
        description: "Failed to load experiment",
        variant: "destructive",
      });
      navigate("/virtual-lab");
    } else {
      setExperiment(data);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !experiment) return;

    setLoading(true);
    const userMessage = { role: "user", content: question };
    setChatHistory(prev => [...prev, userMessage]);
    setQuestion("");

    try {
      const { data, error } = await supabase.functions.invoke("lab-assistant", {
        body: {
          question,
          experimentContext: `${experiment.title} - ${experiment.description}`,
          language: "en"
        }
      });

      if (error) throw error;

      const assistantMessage = { role: "assistant", content: data.response };
      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error asking question:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!experimentId || !observations || !conclusion) {
      toast({
        title: "Missing Information",
        description: "Please fill in observations and conclusion",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("lab_reports").insert({
        user_id: user.id,
        experiment_id: experimentId,
        observations,
        conclusion,
        data: { 
          chat_history: chatHistory,
          simulation_data: simulationData
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lab report saved successfully",
      });
      navigate("/virtual-lab");
    } catch (error) {
      console.error("Error saving report:", error);
      toast({
        title: "Error",
        description: "Failed to save lab report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulationDataChange = (data: any) => {
    setSimulationData(data);
    logAction({ type: "simulation_update", data, timestamp: Date.now() });
  };

  const handleAIRequest = (state: any, action: string) => {
    requestAIGuidance(state, action);
  };

  if (!experiment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading experiment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-primary text-white shadow-strong">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => navigate("/virtual-lab")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{experiment.title}</h1>
                <p className="text-white/90 capitalize">{experiment.category} Experiment</p>
              </div>
            </div>
            <Badge variant={connected ? "default" : "secondary"} className="gap-2">
              <Wifi className="w-3 h-3" />
              {connected ? "Live" : "Offline"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {guidance && (
          <Alert className="mb-6 bg-primary/10 border-primary">
            <AlertDescription className="text-sm">
              <strong>AI Guidance:</strong> {guidance}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="interactive" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="interactive" className="gap-2">
              <FlaskConical className="w-4 h-4" />
              Interactive Lab
            </TabsTrigger>
            <TabsTrigger value="info" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Experiment Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interactive" className="mt-0">
            <Card className="overflow-hidden">
              <CardContent className="p-0 h-[600px]">
                <InteractiveLab
                  labType={experiment.category.toLowerCase() as LabType}
                  experimentTitle={experiment.title}
                  onDataChange={handleSimulationDataChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      About This Experiment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{experiment.description}</p>
                  </CardContent>
                </Card>

                {experiment.safety_notes && (
                  <Card className="border-destructive/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        Safety Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{experiment.safety_notes}</p>
                    </CardContent>
                  </Card>
                )}

                {experiment.materials && experiment.materials.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Materials Needed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1">
                        {experiment.materials.map((material: string, idx: number) => (
                          <li key={idx} className="text-sm">{material}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {experiment.procedure && experiment.procedure.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Procedure</CardTitle>
                      <CardDescription>Follow these steps carefully</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {experiment.procedure.map((step: string, idx: number) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-lg border-2 transition-smooth ${
                              currentStep === idx 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border'
                            }`}
                          >
                            <div className="flex gap-3">
                              <span className="font-bold text-primary">{idx + 1}.</span>
                              <p className="text-sm flex-1">{step}</p>
                            </div>
                            {currentStep === idx && (
                              <Button
                                size="sm"
                                className="mt-2 w-full"
                                onClick={() => setCurrentStep(idx + 1)}
                              >
                                Complete Step
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Beaker className="w-5 h-5" />
                      Lab Assistant Chat
                    </CardTitle>
                    <CardDescription>Ask questions about the experiment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] mb-4 p-4 border rounded-lg">
                      {chatHistory.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Ask a question to get started!
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {chatHistory.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg ${
                                msg.role === "user"
                                  ? "bg-primary text-primary-foreground ml-8"
                                  : "bg-muted mr-8"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask about the experiment..."
                        onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
                        disabled={loading}
                      />
                      <Button
                        onClick={handleAskQuestion}
                        disabled={loading || !question.trim()}
                        size="icon"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Your Lab Report</CardTitle>
                    <CardDescription>Record your observations and conclusions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="observations">Observations</Label>
                      <Textarea
                        id="observations"
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="What did you observe during the experiment?"
                        rows={5}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="conclusion">Conclusion</Label>
                      <Textarea
                        id="conclusion"
                        value={conclusion}
                        onChange={(e) => setConclusion(e.target.value)}
                        placeholder="What did you learn? What were the results?"
                        rows={5}
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={handleSaveReport}
                      disabled={loading || !observations || !conclusion}
                      className="w-full bg-gradient-primary hover:opacity-90"
                    >
                      Save Lab Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ExperimentLab;
