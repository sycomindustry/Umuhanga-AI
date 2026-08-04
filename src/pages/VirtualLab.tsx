import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Beaker, FlaskConical, Microscope, Sparkles, ArrowLeft, X, Atom } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { User } from "@supabase/supabase-js";
import { InteractiveChemistryLab } from "@/components/lab/InteractiveChemistryLab";
import { InteractivePhysicsLab } from "@/components/lab/InteractivePhysicsLab";
import { InteractiveBiologyLab } from "@/components/lab/InteractiveBiologyLab";

interface Experiment {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  safety_notes: string;
}

const VirtualLab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showInteractiveLab, setShowInteractiveLab] = useState<'chemistry' | 'physics' | 'biology' | false>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadExperiments();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadExperiments = async () => {
    const { data, error } = await supabase
      .from("experiments")
      .select("*")
      .order("level", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      console.error("Error loading experiments:", error);
      toast({
        title: "Error",
        description: "Failed to load experiments",
        variant: "destructive",
      });
    } else {
      setExperiments(data || []);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'physics':
        return FlaskConical;
      case 'chemistry':
        return Beaker;
      case 'biology':
        return Microscope;
      default:
        return Beaker;
    }
  };

  const categories = ["all", "physics", "chemistry", "biology"];
  const filteredExperiments = activeCategory === "all" 
    ? experiments 
    : experiments.filter(exp => exp.category.toLowerCase() === activeCategory);

  // If showing interactive lab, render full screen
  if (showInteractiveLab) {
    const labComponent = showInteractiveLab === 'chemistry' ? <InteractiveChemistryLab /> 
      : showInteractiveLab === 'physics' ? <InteractivePhysicsLab /> 
      : <InteractiveBiologyLab />;
    const labLabel = showInteractiveLab.charAt(0).toUpperCase() + showInteractiveLab.slice(1);
    
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-slate-900 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowInteractiveLab(false)}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Experiments
          </Button>
          <Badge variant="outline" className="text-cyan-400 border-cyan-400/50">
            <Sparkles className="w-3 h-3 mr-1" />
            {labLabel} Lab
          </Badge>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowInteractiveLab(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1">
          {labComponent}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-primary text-white shadow-strong">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Beaker className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Virtual Science Laboratory</h1>
                <p className="text-white/90">Explore experiments safely online</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Umuhanga AI Virtual Laboratory */}
        <Card className="mb-6 border-2 border-cyan-500/40 bg-gradient-to-r from-slate-900 to-indigo-950">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg text-slate-50">Umuhanga AI Virtual Laboratory</CardTitle>
                <CardDescription className="text-slate-400">
                  3D chemistry bench, interactive periodic table, molecular visualisation and a multilingual AI scientist
                </CardDescription>
              </div>
              <Button
                onClick={() => navigate("/umuhanga-lab")}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white"
              >
                Enter Laboratory
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Interactive Labs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Chemistry Lab */}
          <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 hover:border-cyan-400/50 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Chemistry Lab</CardTitle>
                  <CardDescription className="text-sm">Mix chemicals, watch reactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowInteractiveLab('chemistry')} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white">
                <Beaker className="w-4 h-4 mr-2" />
                Launch
              </Button>
            </CardContent>
          </Card>

          {/* Physics Lab */}
          <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/30 hover:border-indigo-400/50 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
                  <Atom className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Physics Lab</CardTitle>
                  <CardDescription className="text-sm">Pendulums, springs, mechanics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowInteractiveLab('physics')} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white">
                <Atom className="w-4 h-4 mr-2" />
                Launch
              </Button>
            </CardContent>
          </Card>

          {/* Biology Lab */}
          <Card className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-2 border-emerald-500/30 hover:border-emerald-400/50 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl shadow-lg">
                  <Microscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Biology Lab</CardTitle>
                  <CardDescription className="text-sm">Microscopy, specimens, stains</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowInteractiveLab('biology')} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white">
                <Microscope className="w-4 h-4 mr-2" />
                Launch
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Available Experiments
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose an experiment to begin your virtual lab experience
          </p>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading experiments...</p>
          </div>
        ) : filteredExperiments.length === 0 ? (
          <div className="text-center py-12">
            <Beaker className="w-20 h-20 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground text-lg">No experiments available yet</p>
            <p className="text-sm text-muted-foreground">Check back soon for new experiments!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiments.map((experiment) => {
              const Icon = getCategoryIcon(experiment.category);
              return (
                <Card 
                  key={experiment.id}
                  className="hover:shadow-medium transition-smooth cursor-pointer border-2 hover:border-primary"
                  onClick={() => navigate(`/virtual-lab/${experiment.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-primary p-3 rounded-lg">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{experiment.title}</CardTitle>
                        <div className="flex gap-2 mb-2">
                          <span className="text-xs bg-secondary px-2 py-1 rounded capitalize">
                            {experiment.category}
                          </span>
                          <span className="text-xs bg-accent px-2 py-1 rounded capitalize">
                            {experiment.level}
                          </span>
                        </div>
                        <CardDescription className="text-sm">
                          {experiment.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-primary hover:opacity-90">
                      Start Experiment
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default VirtualLab;
