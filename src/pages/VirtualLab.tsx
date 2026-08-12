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
      <div className="h-screen flex flex-col bg-slate-100">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2 shadow-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowInteractiveLab(false)}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to laboratory directory
          </Button>
          <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-700">
            <Sparkles className="w-3 h-3 mr-1" />
            {labLabel} Lab
          </Badge>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowInteractiveLab(false)}
            className="text-slate-500 hover:text-slate-900"
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbfd_0%,#eef5f7_100%)]">
      <header className="border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f1f7fb_55%,#e3f0f9_100%)] text-slate-900 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-sky-100 p-2 text-sky-700">
                <Beaker className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Virtual Science Laboratory</h1>
                <p className="text-slate-600">
                  A bright, familiar digital laboratory for experiments, demonstrations, practice, and guided exploration
                </p>
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
        <Card className="mb-6 border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f6fbff_55%,#edf5f8_100%)] shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl bg-sky-100 p-3 text-sky-700 shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg text-slate-900">Umuhanga AI Virtual Laboratory</CardTitle>
                <CardDescription className="text-slate-600">
                  Real-world chemistry room styling, practical bench work, guided experiments, and multilingual scientific support for everyone
                </CardDescription>
              </div>
              <Button
                onClick={() => navigate("/umuhanga-lab")}
                className="bg-sky-600 text-white hover:bg-sky-700"
              >
                Enter Laboratory
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Interactive Labs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Chemistry Lab */}
          <Card className="border border-slate-200 bg-white/90 shadow-sm transition-all hover:border-sky-300 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-sky-100 p-3 text-sky-700 shadow-sm">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Chemistry Lab</CardTitle>
                  <CardDescription className="text-sm">Prepare materials, run reactions, and observe evidence</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowInteractiveLab('chemistry')} className="w-full bg-sky-600 text-white hover:bg-sky-700">
                <Beaker className="w-4 h-4 mr-2" />
                Open lab
              </Button>
            </CardContent>
          </Card>

          {/* Physics Lab */}
          <Card className="border border-slate-200 bg-white/90 shadow-sm transition-all hover:border-violet-300 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-100 p-3 text-violet-700 shadow-sm">
                  <Atom className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Physics Lab</CardTitle>
                  <CardDescription className="text-sm">Test motion, forces, energy, and measurement setups</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowInteractiveLab('physics')} className="w-full bg-violet-600 text-white hover:bg-violet-700">
                <Atom className="w-4 h-4 mr-2" />
                Open lab
              </Button>
            </CardContent>
          </Card>

          {/* Biology Lab */}
          <Card className="border border-slate-200 bg-white/90 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700 shadow-sm">
                  <Microscope className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Biology Lab</CardTitle>
                  <CardDescription className="text-sm">Microscopy, specimens, staining, and close observation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowInteractiveLab('biology')} className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                <Microscope className="w-4 h-4 mr-2" />
                Open lab
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-3xl font-bold text-slate-900">Available Experiments</h2>
          <p className="text-muted-foreground text-lg">
            Choose a guided activity to begin a realistic digital laboratory session
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
                  className="cursor-pointer border border-slate-200 bg-white/90 transition-smooth hover:border-sky-300 hover:shadow-medium"
                  onClick={() => navigate(`/virtual-lab/${experiment.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-sky-100 p-3 text-sky-700">
                        <Icon className="w-6 h-6" />
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
                    <Button className="w-full bg-sky-600 text-white hover:bg-sky-700">
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
