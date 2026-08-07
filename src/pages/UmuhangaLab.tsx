import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PeriodicTableLab } from "@/components/lab/PeriodicTableLab";
import { MoleculeViewer3D } from "@/components/lab/MoleculeViewer3D";
import { AIScientistAssistant } from "@/components/lab/AIScientistAssistant";
import { InteractiveChemistryLab } from "@/components/lab/InteractiveChemistryLab";
import { ImmersiveChemistryExperience } from "@/components/lab/ImmersiveChemistryExperience";
import {
  ArrowLeft,
  Atom,
  Beaker,
  Bot,
  Compass,
  FlaskConical,
  Languages,
  Microscope,
  Orbit,
  Sparkles,
  Table2,
  Trophy,
  Waves,
} from "lucide-react";

const LAB_ROADMAP = [
  {
    id: "chemistry",
    title: "Chemistry Laboratory",
    icon: FlaskConical,
    status: "Now building",
    description:
      "Immersive 3D room, real equipment handling, visible reactions, periodic table exploration, molecules, and the AI scientist assistant.",
    accent:
      "border-cyan-500/30 bg-gradient-to-br from-cyan-500/12 via-slate-900 to-indigo-500/12 text-cyan-100",
  },
  {
    id: "biology",
    title: "Biology Laboratory",
    icon: Microscope,
    status: "Next phase",
    description:
      "Virtual microscopy, cells, tissues, DNA zoom journeys, and organism exploration will inherit the same immersive pattern.",
    accent:
      "border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-green-500/10 text-emerald-100",
  },
  {
    id: "physics",
    title: "Physics Laboratory",
    icon: Orbit,
    status: "After chemistry",
    description:
      "Circuits, forces, gravity, motion, sound, and light with variable-driven simulations will follow after the chemistry flagship.",
    accent:
      "border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-slate-900 to-fuchsia-500/10 text-violet-100",
  },
];

const EXPERIENCE_PILLARS = [
  "Realistic 3D laboratory environment",
  "Natural equipment handling and liquid transfer",
  "Reaction evidence, notebooking, and scientific explanation",
  "AI scientist guidance in English, Kinyarwanda, and French",
];

const UmuhangaLab = () => {
  const navigate = useNavigate();
  const [seed, setSeed] = useState<string | null>(null);
  const [tab, setTab] = useState("immersive");
  const [chemistryContext, setChemistryContext] = useState(
    "Umuhanga AI chemistry laboratory: immersive room navigation, experiment bench work, periodic table learning, molecular structure exploration, acids and bases, reactions, and lab safety.",
  );
  const chemistryProgress = useMemo(() => 58, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_28%),linear-gradient(180deg,#020617_0%,#020617_45%,#0f172a_100%)]">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto flex flex-wrap items-center gap-4 px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300"
            onClick={() => navigate("/virtual-lab")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Labs
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-2 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-50">
                Umuhanga AI Virtual Laboratory
              </h1>
              <p className="text-xs text-slate-400">
                Every student can experience real science digitally
              </p>
            </div>
          </div>
          <Badge variant="outline" className="ml-auto border-cyan-400/40 text-cyan-300">
            Chemistry flagship release
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-cyan-400/40 text-cyan-200">
                  Umuhanga AI Virtual Laboratory
                </Badge>
                <Badge variant="outline" className="border-slate-700 text-slate-300">
                  Chemistry first
                </Badge>
              </div>

              <div className="space-y-3">
                <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
                  Build the laboratory innovation first, then expand into the full education ecosystem.
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                  This release turns Umuhanga AI into a believable virtual chemistry space: a
                  room you can enter, equipment you can manipulate, reactions you can observe, and
                  an AI scientist that guides the learning process.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {EXPERIENCE_PILLARS.map((pillar) => (
                  <div
                    key={pillar}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300"
                  >
                    {pillar}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setTab("immersive")}
                  className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white"
                >
                  Enter chemistry lab
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-200 hover:bg-slate-900"
                  onClick={() =>
                    setSeed(
                      "Give me a short orientation to this chemistry laboratory and explain how a student should begin the first experiment.",
                    )
                  }
                >
                  Ask for orientation
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Trophy className="h-5 w-5 text-cyan-300" />
                Demonstration goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Chemistry laboratory build focus</span>
                  <span>{chemistryProgress}%</span>
                </div>
                <Progress value={chemistryProgress} className="h-2 bg-slate-800" />
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="font-semibold text-slate-100">First working demo</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Enter the laboratory, pick equipment, select chemicals, run a reaction, watch
                    visible scientific changes, and ask the AI scientist what happened.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-2 text-slate-100">
                    <Languages className="h-4 w-4 text-emerald-300" />
                    Multilingual support
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    Text and voice guidance are available in English, Kinyarwanda, and French
                    through the AI scientist panel.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {LAB_ROADMAP.map((lab) => {
            const Icon = lab.icon;
            return (
              <Card key={lab.id} className={`border ${lab.accent}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-slate-950/70 p-3">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{lab.title}</h3>
                        <Badge variant="outline" className="border-current/30 text-current">
                          {lab.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300">{lab.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-5 mt-6 grid w-full max-w-4xl grid-cols-5 bg-slate-900">
            <TabsTrigger value="immersive">
              <Compass className="mr-2 h-4 w-4" /> Immersive
            </TabsTrigger>
            <TabsTrigger value="bench">
              <Beaker className="mr-2 h-4 w-4" /> Bench
            </TabsTrigger>
            <TabsTrigger value="periodic">
              <Table2 className="mr-2 h-4 w-4" /> Elements
            </TabsTrigger>
            <TabsTrigger value="molecules">
              <Atom className="mr-2 h-4 w-4" /> Molecules
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Bot className="mr-2 h-4 w-4" /> AI Scientist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="immersive">
            <ImmersiveChemistryExperience
              onContextChange={setChemistryContext}
              onAskAI={setSeed}
            />
          </TabsContent>

          <TabsContent value="bench">
            <div className="grid gap-4 2xl:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-slate-800 bg-slate-900/70">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-cyan-200">
                        <FlaskConical className="h-4 w-4" />
                        Chemistry focus
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        Reactions, pH, indicators, heating, displacement, gas evolution, and
                        molecular reasoning.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-800 bg-slate-900/70">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-emerald-200">
                        <Languages className="h-4 w-4" />
                        AI scientist
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        Ask what happened, what to do next, which rule applies, and why the
                        experiment behaved the way it did.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-800 bg-slate-900/70">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-violet-200">
                        <Waves className="h-4 w-4" />
                        Future-ready
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        The interaction model is being shaped for later VR, AR, and mobile lab
                        extensions.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="h-[760px] overflow-hidden rounded-2xl border border-slate-800">
                  <InteractiveChemistryLab
                    onAskAI={(question) => {
                      setSeed(question);
                      setTab("ai");
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Card className="border-cyan-500/20 bg-slate-900/70">
                  <CardHeader>
                    <CardTitle className="text-slate-100">Chemistry release scope</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-300">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="font-semibold text-slate-100">What students can do now</p>
                      <ul className="mt-2 space-y-2 text-sm text-slate-400">
                        <li>Enter a staged 3D chemistry room</li>
                        <li>Select reagents and target vessels</li>
                        <li>Transfer liquids between containers</li>
                        <li>Observe reaction evidence and record notes</li>
                        <li>Ask the AI scientist for guidance</li>
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="font-semibold text-slate-100">What comes next</p>
                      <p className="mt-2 text-slate-400">
                        Biology will inherit the same immersive pattern through microscopes, cells,
                        organs, and DNA zoom journeys. Physics will follow with circuits, forces,
                        and variable-driven laboratory tasks.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="h-[760px]">
                  <AIScientistAssistant
                    experimentContext={chemistryContext}
                    seedQuestion={seed}
                    onSeedConsumed={() => setSeed(null)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="periodic">
            <PeriodicTableLab
              onAskAI={(question) => {
                setSeed(question);
                setTab("ai");
              }}
            />
          </TabsContent>

          <TabsContent value="molecules">
            <MoleculeViewer3D />
          </TabsContent>

          <TabsContent value="ai">
            <div className="mx-auto max-w-3xl">
              <AIScientistAssistant
                experimentContext={chemistryContext}
                seedQuestion={seed}
                onSeedConsumed={() => setSeed(null)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UmuhangaLab;
