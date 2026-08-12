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
    status: "Open now",
    description:
      "A familiar chemistry room with bright finishes, bench equipment, visible reactions, periodic reference tools, molecule views, and guided scientific assistance.",
    accent:
      "border-sky-200 bg-[linear-gradient(135deg,#ffffff_0%,#f4fbff_100%)] text-slate-800",
  },
  {
    id: "biology",
    title: "Biology Laboratory",
    icon: Microscope,
    status: "Next phase",
    description:
      "Microscopy, tissue and cell work, specimen handling, and guided biological observation will adopt the same grounded real-lab presentation.",
    accent:
      "border-emerald-200 bg-[linear-gradient(135deg,#ffffff_0%,#f4fff8_100%)] text-slate-800",
  },
  {
    id: "physics",
    title: "Physics Laboratory",
    icon: Orbit,
    status: "After chemistry",
    description:
      "Circuits, forces, motion, sound, and optics will follow with realistic stations, measurements, and experiment control panels.",
    accent:
      "border-violet-200 bg-[linear-gradient(135deg,#ffffff_0%,#faf7ff_100%)] text-slate-800",
  },
];

const EXPERIENCE_PILLARS = [
  "Bright real-world laboratory environment",
  "Natural equipment handling and liquid transfer",
  "Reaction evidence, notebooking, and practical scientific explanation",
  "Guidance in English, Kinyarwanda, and French for every kind of visitor",
];

const NEXT_IMMERSION_UPGRADES = [
  {
    title: "First-person navigation polish",
    description:
      "Smoother walk speed, softer camera settling, doorway alignment, station approach cues, and cleaner desktop or touch transitions so movement feels like a normal lab visit.",
  },
  {
    title: "VR-ready interaction layer",
    description:
      "Shared interaction rules for controller pointing, grab zones, reach targets, and safety boundaries so the same room can extend naturally into headsets later.",
  },
  {
    title: "Reaction engine + guided experiments",
    description:
      "Higher-fidelity chemistry state, clearer product evidence, step-linked experiment guidance, and deeper integration between the live bench, notebook, and guided experiment flows.",
  },
];

const UmuhangaLab = () => {
  const navigate = useNavigate();
  const [seed, setSeed] = useState<string | null>(null);
  const [tab, setTab] = useState("immersive");
  const [chemistryContext, setChemistryContext] = useState(
    "Umuhanga AI chemistry laboratory: bright room navigation, experiment bench work, periodic table reference, molecular structure exploration, reactions, guided procedures, and laboratory safety.",
  );
  const chemistryProgress = useMemo(() => 58, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbfd_0%,#eef4f7_100%)]">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container mx-auto flex flex-wrap items-center gap-4 px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600"
            onClick={() => navigate("/virtual-lab")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Labs
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-100 p-2 text-sky-700 shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Umuhanga AI Virtual Laboratory
              </h1>
              <p className="text-xs text-slate-600">
                A familiar laboratory space for experiments, demonstrations, orientation, and guided practice
              </p>
            </div>
          </div>
          <Badge variant="outline" className="ml-auto border-sky-300 bg-sky-50 text-sky-700">
            Chemistry environment live
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f6fbff_55%,#edf4f8_100%)] shadow-sm">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-700">
                  Umuhanga AI Virtual Laboratory
                </Badge>
                <Badge variant="outline" className="border-slate-300 text-slate-600">
                  Real-world chemistry suite
                </Badge>
              </div>

              <div className="space-y-3">
                <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Step into a bright, familiar laboratory that feels grounded in the real world.
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  This release turns Umuhanga AI into a believable chemistry environment with clear
                  lighting, familiar surfaces, practical equipment handling, visible reactions, and
                  guided support that works for anyone entering the laboratory.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {EXPERIENCE_PILLARS.map((pillar) => (
                  <div
                    key={pillar}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                  >
                    {pillar}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setTab("immersive")}
                  className="bg-sky-600 text-white hover:bg-sky-700"
                >
                  Enter chemistry lab
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() =>
                    setSeed(
                      "Give me a short orientation to this chemistry laboratory and explain how someone should begin the first guided experiment.",
                    )
                  }
                >
                  Ask for orientation
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white/95 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Trophy className="h-5 w-5 text-sky-600" />
                Experience focus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Chemistry laboratory build focus</span>
                  <span>{chemistryProgress}%</span>
                </div>
                <Progress value={chemistryProgress} className="h-2 bg-slate-200" />
              </div>

              <div className="space-y-3 text-sm text-slate-700">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Current working experience</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Enter the laboratory, pick equipment, select chemicals, run a reaction, watch
                    visible scientific changes, and ask the AI scientist what happened.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Languages className="h-4 w-4 text-emerald-600" />
                    Multilingual support
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
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
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{lab.title}</h3>
                        <Badge variant="outline" className="border-current/30 text-current">
                          {lab.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{lab.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {NEXT_IMMERSION_UPGRADES.map((upgrade) => (
            <Card key={upgrade.title} className="border border-slate-200 bg-white/95 shadow-sm">
              <CardContent className="p-5">
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900">{upgrade.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{upgrade.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-5 mt-6 grid w-full max-w-4xl grid-cols-5 border border-slate-200 bg-white">
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
                  <Card className="border border-slate-200 bg-white/95">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sky-700">
                        <FlaskConical className="h-4 w-4" />
                        Chemistry focus
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        Reactions, pH, indicators, heating, displacement, gas evolution, and
                        molecular reasoning.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border border-slate-200 bg-white/95">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <Languages className="h-4 w-4" />
                        AI scientist
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        Ask what happened, what to do next, which rule applies, and why the
                        experiment behaved the way it did.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border border-slate-200 bg-white/95">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-violet-700">
                        <Waves className="h-4 w-4" />
                        Future-ready
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        The room is being prepared for polished first-person navigation, VR-ready
                        controls, and deeper guided experiment integration.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="h-[760px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <InteractiveChemistryLab
                    onAskAI={(question) => {
                      setSeed(question);
                      setTab("ai");
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Card className="border border-slate-200 bg-white/95 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-slate-900">Chemistry release scope</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-700">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">What people can do now</p>
                      <ul className="mt-2 space-y-2 text-sm text-slate-600">
                        <li>Enter a staged 3D chemistry room</li>
                        <li>Select reagents and target vessels</li>
                        <li>Transfer liquids between containers</li>
                        <li>Observe reaction evidence and record notes</li>
                        <li>Ask the AI scientist for guidance</li>
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">What comes next</p>
                      <p className="mt-2 text-slate-600">
                        First-person navigation will feel smoother, the interaction layer will be
                        prepared for VR use, and the reaction engine will connect more deeply to
                        guided experiments and step-by-step lab support.
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
