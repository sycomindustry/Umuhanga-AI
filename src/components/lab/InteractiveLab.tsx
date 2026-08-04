import { useState, useCallback } from 'react';
import { LabType, EQUIPMENT_CATALOG, PlacedEquipment } from '@/types/lab';
import { useExperimentSession } from '@/hooks/useExperimentSession';
import { EquipmentPanel } from './EquipmentPanel';
import { LabBench } from './LabBench';
import { ExperimentControls } from './ExperimentControls';
import { ResultsPanel } from './ResultsPanel';
import { EquipmentInteractionPanel } from './EquipmentInteractionPanel';
import { ChemistryReactionPanel } from './ChemistryReactionPanel';
import { GuidedExperimentPanel } from './GuidedExperimentPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Glasses, Hand, Shirt, Volume2, VolumeX, HelpCircle, FlaskConical, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InteractiveLabProps {
  labType: LabType;
  experimentTitle?: string;
  onDataChange?: (data: any) => void;
}

export function InteractiveLab({ labType, experimentTitle, onDataChange }: InteractiveLabProps) {
  const {
    session,
    safetyEquipped,
    addEquipment,
    removeEquipment,
    moveEquipment,
    connectEquipment,
    updateEquipmentState,
    heatEquipment,
    calculateCircuit,
    setMicroscopeZoom,
    toggleSafetyEquipment,
    startExperiment,
    pauseExperiment,
    resumeExperiment,
    resetExperiment,
    undo,
    dismissWarning,
  } = useExperimentSession(labType);

  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [selectedPlacedId, setSelectedPlacedId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const selectedPlaced = session.placedEquipment.find(e => e.id === selectedPlacedId) || null;

  const handleEquipmentSelect = useCallback((equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
    const equipment = EQUIPMENT_CATALOG[equipmentId];
    if (voiceEnabled && equipment) {
      speak(`${equipment.name}. ${equipment.usageInstructions}`);
    }
  }, [voiceEnabled]);

  const handleDropEquipment = useCallback((equipmentId: string, position: { x: number; y: number }) => {
    const placed = addEquipment(equipmentId, position);
    if (placed) {
      onDataChange?.({ action: 'add', equipment: equipmentId, position });
    }
  }, [addEquipment, onDataChange]);

  const handleEquipmentClick = useCallback((placed: PlacedEquipment) => {
    setSelectedPlacedId(placed.id);
    const equipment = EQUIPMENT_CATALOG[placed.equipmentId];
    if (voiceEnabled && equipment) {
      speak(`Selected ${equipment.name}. ${equipment.description}`);
    }
  }, [voiceEnabled]);

  const handleConnect = useCallback(() => {
    if (selectedPlacedId) {
      setConnectingFrom(selectedPlacedId);
      toast.info('Click another item to connect');
    }
  }, [selectedPlacedId]);

  const handleDelete = useCallback(() => {
    if (selectedPlacedId) {
      removeEquipment(selectedPlacedId);
      setSelectedPlacedId(null);
    }
  }, [selectedPlacedId, removeEquipment]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with safety equipment */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm capitalize">
              {labType} Lab
            </Badge>
            {experimentTitle && (
              <h2 className="text-lg font-semibold">{experimentTitle}</h2>
            )}
          </div>

          {/* Safety Equipment */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">
              <Shield className="w-4 h-4 inline mr-1" />
              Safety:
            </span>
            <Button
              size="sm"
              variant={safetyEquipped.goggles ? "default" : "outline"}
              onClick={() => toggleSafetyEquipment('goggles')}
              className={cn(safetyEquipped.goggles && "bg-green-600 hover:bg-green-700")}
            >
              <Glasses className="w-4 h-4 mr-1" />
              Goggles
            </Button>
            <Button
              size="sm"
              variant={safetyEquipped.gloves ? "default" : "outline"}
              onClick={() => toggleSafetyEquipment('gloves')}
              className={cn(safetyEquipped.gloves && "bg-green-600 hover:bg-green-700")}
            >
              <Hand className="w-4 h-4 mr-1" />
              Gloves
            </Button>
            <Button
              size="sm"
              variant={safetyEquipped.labCoat ? "default" : "outline"}
              onClick={() => toggleSafetyEquipment('labCoat')}
              className={cn(safetyEquipped.labCoat && "bg-green-600 hover:bg-green-700")}
            >
              <Shirt className="w-4 h-4 mr-1" />
              Coat
            </Button>

            <div className="h-6 w-px bg-border mx-2" />

            <Button
              size="sm"
              variant={voiceEnabled ? "default" : "outline"}
              onClick={() => setVoiceEnabled(!voiceEnabled)}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4">
          <ExperimentControls
            isRunning={session.isRunning}
            isPaused={session.isPaused}
            onStart={startExperiment}
            onPause={pauseExperiment}
            onResume={resumeExperiment}
            onReset={resetExperiment}
            onUndo={undo}
            onConnect={handleConnect}
            onDelete={handleDelete}
            selectedItem={!!selectedPlacedId}
            isConnecting={!!connectingFrom}
            historyLength={session.history.length}
          />
        </div>
      </div>

      {/* Help panel */}
      {showHelp && (
        <div className="p-4 bg-muted/50 border-b border-border">
          <h3 className="font-semibold mb-2">How to Use</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Drag</strong> equipment from the panel to the lab bench</li>
            <li>• <strong>Click</strong> placed items to select and see controls</li>
            <li>• <strong>Connect</strong> equipment to enable interactions (heat, circuits, microscope)</li>
            <li>• <strong>Start</strong> the experiment to activate equipment controls</li>
            <li>• Always wear <strong>safety gear</strong> before handling dangerous materials</li>
          </ul>
        </div>
      )}

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        <EquipmentPanel
          labType={labType}
          onEquipmentSelect={handleEquipmentSelect}
          selectedEquipment={selectedEquipmentId}
        />

        <div className="flex-1 p-4 overflow-auto">
          <LabBench
            labType={labType}
            placedEquipment={session.placedEquipment}
            onDropEquipment={handleDropEquipment}
            onMoveEquipment={moveEquipment}
            onRemoveEquipment={removeEquipment}
            onConnectEquipment={connectEquipment}
            onEquipmentClick={handleEquipmentClick}
            selectedPlacedId={selectedPlacedId}
            connectingFrom={connectingFrom}
            setConnectingFrom={setConnectingFrom}
          />
        </div>

        <div className="w-80 border-l border-border flex flex-col">
          <Tabs defaultValue="controls" className="flex-1 flex flex-col">
            <TabsList className="w-full grid grid-cols-3 m-1">
              <TabsTrigger value="controls" className="text-xs">Controls</TabsTrigger>
              <TabsTrigger value="guided" className="text-xs">
                <BookOpen className="w-3 h-3 mr-1" />
                Guide
              </TabsTrigger>
              {labType === 'chemistry' && (
                <TabsTrigger value="reactions" className="text-xs">
                  <FlaskConical className="w-3 h-3 mr-1" />
                  Reactions
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="controls" className="flex-1 p-2 overflow-auto m-0">
              <EquipmentInteractionPanel
                selectedEquipment={selectedPlaced}
                allEquipment={session.placedEquipment}
                onHeat={heatEquipment}
                onCalculateCircuit={calculateCircuit}
                onSetZoom={setMicroscopeZoom}
                onUpdateState={updateEquipmentState}
                isRunning={session.isRunning}
              />
            </TabsContent>
            <TabsContent value="guided" className="flex-1 p-2 overflow-auto m-0">
              <GuidedExperimentPanel
                labType={labType}
                placedEquipment={session.placedEquipment.map(e => e.equipmentId)}
                currentState={{
                  safetyEquipped: safetyEquipped,
                  connections: session.placedEquipment.flatMap(e => e.connections),
                }}
                isRunning={session.isRunning}
              />
            </TabsContent>
            {labType === 'chemistry' && (
              <TabsContent value="reactions" className="flex-1 p-2 overflow-auto m-0">
                <ChemistryReactionPanel
                  isRunning={session.isRunning}
                  onReactionResult={(result) => {
                    toast.success(`Reaction: ${result.equation}`);
                  }}
                />
              </TabsContent>
            )}
          </Tabs>
          <div className="border-t border-border">
            <ResultsPanel
              results={session.results}
              safetyWarnings={session.safetyWarnings}
              onDismissWarning={dismissWarning}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
