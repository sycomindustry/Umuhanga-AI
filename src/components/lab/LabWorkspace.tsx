import { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Package, Trash2, RotateCcw, Save, FileText, Beaker } from "lucide-react";
import { useLabEquipment, LabEquipment } from "@/hooks/useLabEquipment";
import { EnhancedToolPalette } from "./EnhancedToolPalette";
import { DraggableEquipment3D } from "./DraggableEquipment3D";
import { LabReportGenerator } from "./LabReportGenerator";
import { ObjectInfoPanel } from "./ObjectInfoPanel";

interface LabWorkspaceProps {
  labType: "physics" | "chemistry" | "biology";
  experimentId: string;
  experimentTitle: string;
  onDataChange?: (data: any) => void;
}

interface PlacedEquipment {
  equipment: LabEquipment;
  position: [number, number, number];
}

export function LabWorkspace({
  labType,
  experimentId,
  experimentTitle,
  onDataChange,
}: LabWorkspaceProps) {
  const {
    equipment,
    selectedEquipment,
    loading,
    toggleEquipment,
    clearSelection,
    getSelectedEquipmentDetails,
  } = useLabEquipment(labType);

  const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>([]);
  const [selectedItem, setSelectedItem] = useState<LabEquipment | null>(null);
  const [showPalette, setShowPalette] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [observations, setObservations] = useState<string[]>([]);
  const [simulationData, setSimulationData] = useState<Record<string, any>>({});

  // Add equipment to workspace
  const handleEquipmentSelect = useCallback((equipmentId: string) => {
    toggleEquipment(equipmentId);
    
    const eq = equipment.find(e => e.id === equipmentId);
    if (!eq) return;

    // Check if already placed
    const isPlaced = placedEquipment.some(p => p.equipment.id === equipmentId);
    
    if (isPlaced) {
      // Remove from workspace
      setPlacedEquipment(prev => prev.filter(p => p.equipment.id !== equipmentId));
      toast.info(`Removed ${eq.name} from workspace`);
    } else {
      // Add to workspace at random position
      const newPosition: [number, number, number] = [
        (Math.random() - 0.5) * 4,
        0,
        (Math.random() - 0.5) * 4,
      ];
      setPlacedEquipment(prev => [...prev, { equipment: eq, position: newPosition }]);
      toast.success(`Added ${eq.name} to workspace`);
      
      // Record observation
      addObservation(`Added ${eq.name} to the workspace`);
    }
  }, [equipment, toggleEquipment, placedEquipment]);

  const handlePositionChange = useCallback((id: string, position: [number, number, number]) => {
    setPlacedEquipment(prev =>
      prev.map(p =>
        p.equipment.id === id ? { ...p, position } : p
      )
    );
  }, []);

  const handleEquipmentClick = useCallback((eq: LabEquipment) => {
    setSelectedItem(eq);
    addObservation(`Examined ${eq.name}: ${eq.description}`);
  }, []);

  const addObservation = (obs: string) => {
    setObservations(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${obs}`]);
  };

  const clearWorkspace = () => {
    setPlacedEquipment([]);
    clearSelection();
    setObservations([]);
    setSimulationData({});
    toast.info("Workspace cleared");
  };

  const saveSession = async () => {
    const sessionData = {
      placedEquipment: placedEquipment.map(p => ({
        equipmentId: p.equipment.id,
        position: p.position,
      })),
      observations,
      simulationData,
      timestamp: new Date().toISOString(),
    };

    // This would save to the database
    onDataChange?.(sessionData);
    toast.success("Session saved!");
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="capitalize">
            <Beaker className="w-3 h-3 mr-1" />
            {labType} Lab
          </Badge>
          <Badge variant="secondary">
            {placedEquipment.length} items in workspace
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showPalette ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPalette(!showPalette)}
          >
            <Package className="w-4 h-4 mr-2" />
            Equipment
          </Button>
          <Button
            variant={showReport ? "default" : "outline"}
            size="sm"
            onClick={() => setShowReport(!showReport)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Report
          </Button>
          <Button variant="outline" size="sm" onClick={clearWorkspace}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={saveSession}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-4">
        {/* Equipment Palette */}
        {showPalette && (
          <div className="col-span-3">
            <EnhancedToolPalette
              equipment={equipment}
              selectedEquipment={selectedEquipment}
              onToggleEquipment={handleEquipmentSelect}
              onClearAll={clearSelection}
              loading={loading}
            />
          </div>
        )}

        {/* 3D Workspace */}
        <div className={showPalette ? "col-span-6" : "col-span-9"}>
          <Card>
            <CardContent className="p-0">
              <div className="relative h-[500px] rounded-lg overflow-hidden">
                {/* Selected item info */}
                {selectedItem && (
                  <div className="absolute top-4 left-4 z-10">
                    <ObjectInfoPanel
                      object={{
                        id: selectedItem.id,
                        name: selectedItem.name,
                        description: selectedItem.description,
                        category: selectedItem.category as any,
                        properties: selectedItem.properties,
                      }}
                      onClose={() => setSelectedItem(null)}
                    />
                  </div>
                )}

                <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
                  <ambientLight intensity={0.5} />
                  <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                  />
                  <pointLight position={[-5, 5, -5]} intensity={0.5} />

                  {/* Lab bench surface */}
                  <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, -0.5, 0]}
                    receiveShadow
                  >
                    <planeGeometry args={[10, 10]} />
                    <meshStandardMaterial color={0x8B4513} roughness={0.8} />
                  </mesh>

                  {/* Grid helper */}
                  <Grid
                    args={[10, 10]}
                    position={[0, -0.49, 0]}
                    cellSize={0.5}
                    cellThickness={0.5}
                    cellColor="#6b7280"
                    sectionSize={2}
                    sectionThickness={1}
                    sectionColor="#9ca3af"
                    fadeDistance={20}
                    fadeStrength={1}
                  />

                  {/* Placed equipment */}
                  {placedEquipment.map((item) => (
                    <DraggableEquipment3D
                      key={item.equipment.id}
                      equipment={item.equipment}
                      initialPosition={item.position}
                      onPositionChange={handlePositionChange}
                      onSelect={handleEquipmentClick}
                      isSelected={selectedItem?.id === item.equipment.id}
                    />
                  ))}

                  <OrbitControls
                    enablePan
                    enableZoom
                    enableRotate
                    maxPolarAngle={Math.PI / 2.1}
                    minDistance={2}
                    maxDistance={15}
                  />
                  <Environment preset="studio" />
                </Canvas>

                {/* Instructions overlay */}
                {placedEquipment.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-background/80 backdrop-blur-sm px-6 py-4 rounded-lg text-center">
                      <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Select equipment from the palette to add to your workspace
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Drag items to position them • Click to inspect
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Observations Log */}
          <Card className="mt-4">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Observations Log</span>
                <Badge variant="outline">{observations.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              {observations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No observations yet. Interact with equipment to record observations.
                </p>
              ) : (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {observations.slice(-5).map((obs, i) => (
                    <p key={i} className="text-xs text-muted-foreground font-mono">
                      {obs}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Panel */}
        {showReport && (
          <div className="col-span-3">
            <LabReportGenerator
              experimentId={experimentId}
              experimentTitle={experimentTitle}
              experimentCategory={labType}
              selectedEquipment={getSelectedEquipmentDetails()}
              simulationData={simulationData}
              observations={observations}
            />
          </div>
        )}
      </div>
    </div>
  );
}
