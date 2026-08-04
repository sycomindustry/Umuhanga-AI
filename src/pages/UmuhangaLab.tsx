import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PeriodicTableLab } from "@/components/lab/PeriodicTableLab";
import { MoleculeViewer3D } from "@/components/lab/MoleculeViewer3D";
import { AIScientistAssistant } from "@/components/lab/AIScientistAssistant";
import { InteractiveChemistryLab } from "@/components/lab/InteractiveChemistryLab";
import { ArrowLeft, Atom, Beaker, Bot, Sparkles, Table2 } from "lucide-react";

const UmuhangaLab = () => {
  const navigate = useNavigate();
  const [seed, setSeed] = useState<string | null>(null);
  const [tab, setTab] = useState("bench");

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950">
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
            Chemistry release
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-5 grid w-full max-w-2xl grid-cols-4 bg-slate-900">
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

          <TabsContent value="bench">
            <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
              <div className="h-[620px] overflow-hidden rounded-xl border border-slate-800">
                <InteractiveChemistryLab />
              </div>
              <div className="h-[620px]">
                <AIScientistAssistant
                  experimentContext="Open-ended 3D chemistry bench: student is choosing glassware, pouring chemicals, heating and observing reactions."
                  seedQuestion={seed}
                  onSeedConsumed={() => setSeed(null)}
                />
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
                experimentContext="Umuhanga AI chemistry laboratory: elements, molecular structure, acids and bases, reactions and lab safety."
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
