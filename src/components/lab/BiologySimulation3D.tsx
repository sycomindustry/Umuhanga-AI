import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Microscope, ZoomIn, ZoomOut, Sun, Droplets, AlertTriangle, MousePointer, Package, GraduationCap, Trophy } from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";
import { useLabObjectSelection, BIOLOGY_OBJECTS, LabObject } from "@/hooks/useLabObjectSelection";
import { ObjectInfoPanel } from "./ObjectInfoPanel";
import { ToolPalette } from "./ToolPalette";
import { useLabTools } from "@/hooks/useLabTools";
import { LabTutorial } from "./LabTutorial";
import { AchievementBadge, AchievementUnlockPopup, AchievementsPanel } from "./AchievementDisplay";
import { useAchievements } from "@/hooks/useAchievements";
import { SPECIMEN_CATALOG } from "@/lib/specimens";
interface CellProps {
  position: [number, number, number];
  scale: number;
  showDetails: boolean;
  cellType: "plant" | "animal";
}

function Cell3D({ position, scale, showDetails, cellType }: CellProps) {
  const cellRef = useRef<THREE.Group>(null);
  const nucleusRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (cellRef.current) {
      cellRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
    if (nucleusRef.current) {
      nucleusRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      nucleusRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });

  const isPlant = cellType === "plant";

  return (
    <group ref={cellRef} position={position} scale={scale}>
      {/* Cell Wall (plant only) */}
      {isPlant && (
        <mesh>
          <boxGeometry args={[2.2, 2.2, 2.2]} />
          <meshStandardMaterial
            color={0x90ee90}
            transparent
            opacity={0.3}
            wireframe={!showDetails}
          />
        </mesh>
      )}

      {/* Cell Membrane */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={isPlant ? 0x98fb98 : 0xffb6c1}
          transparent
          opacity={0.4}
          roughness={0.5}
        />
      </mesh>

      {/* Nucleus */}
      <mesh ref={nucleusRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={0x4a148c}
          emissive={0x4a148c}
          emissiveIntensity={0.3}
        />
      </mesh>

      {showDetails && (
        <>
          {/* Mitochondria */}
          {[...Array(3)].map((_, i) => (
            <mesh
              key={`mito-${i}`}
              position={[
                Math.cos(i * 2) * 0.6,
                Math.sin(i * 3) * 0.5,
                Math.sin(i * 2) * 0.6,
              ]}
            >
              <capsuleGeometry args={[0.08, 0.2, 8, 16]} />
              <meshStandardMaterial
                color={0xff6b6b}
                emissive={0xff3333}
                emissiveIntensity={0.2}
              />
            </mesh>
          ))}

          {/* Chloroplasts (plant only) */}
          {isPlant &&
            [...Array(4)].map((_, i) => (
              <mesh
                key={`chloro-${i}`}
                position={[
                  Math.cos(i * 1.5) * 0.7,
                  Math.sin(i * 2) * 0.6,
                  Math.cos(i * 2.5) * 0.7,
                ]}
              >
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial
                  color={0x00ff00}
                  emissive={0x00aa00}
                  emissiveIntensity={0.3}
                />
              </mesh>
            ))}

          {/* Vacuole (plant only) */}
          {isPlant && (
            <mesh position={[0.4, 0, 0]}>
              <sphereGeometry args={[0.25, 32, 32]} />
              <meshStandardMaterial
                color={0xb3e5fc}
                transparent
                opacity={0.6}
              />
            </mesh>
          )}
        </>
      )}

      {/* Labels */}
      {showDetails && (
        <>
          <Html position={[0, 0, 0]} center>
            <div className="bg-background/90 px-2 py-1 rounded text-xs pointer-events-none">
              Nucleus
            </div>
          </Html>
          {isPlant && (
            <Html position={[0.4, 0, 0]} center>
              <div className="bg-background/90 px-2 py-1 rounded text-xs pointer-events-none">
                Vacuole
              </div>
            </Html>
          )}
        </>
      )}
    </group>
  );
}

function Microscope3D({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.1, 32]} />
        <meshStandardMaterial color={0x2c3e50} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Arm */}
      <mesh position={[0, 0.5, -0.2]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
        <meshStandardMaterial color={0x34495e} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Stage */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.6, 0.05, 0.4]} />
        <meshStandardMaterial color={0x7f8c8d} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Objective lenses */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 16]} />
        <meshStandardMaterial color={0x95a5a6} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function PetriDish({ 
  position, 
  hasSample,
  contaminated 
}: { 
  position: [number, number, number];
  hasSample: boolean;
  contaminated: boolean;
}) {
  return (
    <group position={position}>
      {/* Dish bottom */}
      <mesh>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
        <meshPhysicalMaterial
          color={0xffffff}
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}
        />
      </mesh>

      {/* Sample */}
      {hasSample && (
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.02, 32]} />
          <meshStandardMaterial 
            color={contaminated ? 0x00aa00 : 0xffd700} 
            transparent 
            opacity={0.7}
            emissive={contaminated ? 0x00ff00 : 0x000000}
            emissiveIntensity={contaminated ? 0.3 : 0}
          />
        </mesh>
      )}
      
      {/* Contamination colonies */}
      {contaminated && hasSample && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh 
              key={i} 
              position={[
                Math.cos(i * 1.2) * 0.4, 
                0.08, 
                Math.sin(i * 1.2) * 0.4
              ]}
            >
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial 
                color={0x00ff00}
                emissive={0x00aa00}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

function ToxicSpill({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });
  
  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i) * 0.3, i * 0.15, Math.cos(i) * 0.3]}>
          <sphereGeometry args={[0.15 + i * 0.03, 16, 16]} />
          <meshStandardMaterial 
            color={0xff00ff}
            transparent
            opacity={0.4 - i * 0.08}
            emissive={0xff00ff}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

interface BiologySimulation3DProps {
  experimentType: string;
  onDataChange?: (data: any) => void;
  onAIRequest?: (state: any, action: string) => void;
}

export function BiologySimulation3D({
  experimentType,
  onDataChange,
  onAIRequest,
}: BiologySimulation3DProps) {
  // Object selection
  const { selectedObject, hoveredObject, selectObject, hoverObject, clearSelection } = useLabObjectSelection();
  
  // Tool selection  
  const { selectedTools, toggleTool, hasTool } = useLabTools(["microscope", "petriDish", "slide", "cell"]);
  const [showToolPalette, setShowToolPalette] = useState(false);
  
  // Handle ESC key to close selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") clearSelection();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearSelection]);

  const [magnification, setMagnification] = useState(10);
  const [cellType, setCellType] = useState<"plant" | "animal">("plant");
  const [showDetails, setShowDetails] = useState(true);
  const [lightIntensity, setLightIntensity] = useState(50);
  const [hasNutrients, setHasNutrients] = useState(false);
  const [stainType, setStainType] = useState<"none" | "iodine" | "methylene">("none");
  const [slidePreparation, setSlidePreparation] = useState({
    cleaned: false,
    specimen: false,
    coverSlip: false
  });
  const [observation, setObservation] = useState("");
  const [selectedSpecimen, setSelectedSpecimen] = useState<string>("onion_epidermis");
  
  // Tutorial & Achievement states
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [tutorialAction, setTutorialAction] = useState<string | undefined>();
  const { achievements, recentUnlock, unlockAchievement, incrementProgress, clearRecentUnlock } = useAchievements();
  
  // Danger states
  const [contaminated, setContaminated] = useState(false);
  const [toxicSpill, setToxicSpill] = useState(false);
  const [bacterialOvergrowth, setBacterialOvergrowth] = useState(false);
  const [biohazard, setBiohazard] = useState(false);
  const [unsafeHandling, setUnsafeHandling] = useState(false);

  const cellScale = magnification / 20;
  
  // Specimen categories for selector
  const specimenCategories = {
    plant: Object.entries(SPECIMEN_CATALOG).filter(([_, s]) => s.category === 'plant'),
    animal: Object.entries(SPECIMEN_CATALOG).filter(([_, s]) => s.category === 'animal'),
    blood: Object.entries(SPECIMEN_CATALOG).filter(([_, s]) => s.category === 'blood'),
    bacterial: Object.entries(SPECIMEN_CATALOG).filter(([_, s]) => s.category === 'bacterial'),
    protist: Object.entries(SPECIMEN_CATALOG).filter(([_, s]) => s.category === 'protist'),
  };
  
  const currentSpecimen = SPECIMEN_CATALOG[selectedSpecimen];

  // Update observations based on conditions with DANGER checks
  const updateObservation = () => {
    // Check for dangerous scenarios
    if (!slidePreparation.cleaned && slidePreparation.specimen) {
      setContaminated(true);
      setBiohazard(true);
      setUnsafeHandling(true);
      setObservation("⚠️ CONTAMINATION! Specimen placed on dirty slide - bacterial contamination risk!");
      toast.error("☠️ BIOHAZARD! Dirty slide contaminated the specimen!");
      return;
    }
    
    if (stainType !== "none" && !slidePreparation.coverSlip) {
      setToxicSpill(true);
      setObservation("⚠️ TOXIC CHEMICAL SPILL! Stain exposed without cover slip!");
      toast.error("☠️ Chemical spill hazard! Always use cover slip with stains!");
      return;
    }
    
    if (hasNutrients && contaminated) {
      setBacterialOvergrowth(true);
      setBiohazard(true);
      setObservation("⚠️ DANGEROUS! Contaminated sample with nutrients = rapid bacterial overgrowth!");
      toast.error("🦠 BIOHAZARD! Uncontrolled bacterial growth!");
      return;
    }
    
    if (magnification > 80 && lightIntensity < 30) {
      setObservation("⚠️ WARNING: High magnification with low light can damage microscope optics!");
      toast.error("⚠️ Microscope damage risk! Increase light or reduce magnification!");
      return;
    }
    
    if (!slidePreparation.specimen) {
      setObservation("No specimen on slide");
      return;
    }
    if (!slidePreparation.coverSlip) {
      setObservation("⚠️ Add cover slip for proper viewing");
      return;
    }
    
    let obs = `Viewing ${cellType} cell at ${magnification}x magnification. `;
    
    if (stainType !== "none") {
      obs += `${stainType === "iodine" ? "Iodine staining" : "Methylene blue staining"} applied - cellular structures more visible. `;
    }
    
    if (cellType === "plant") {
      obs += "Cell wall and chloroplasts visible. ";
      if (hasNutrients) {
        obs += "Active photosynthesis occurring in chloroplasts.";
      }
    } else {
      obs += "Cell membrane flexible, nucleus prominent. ";
    }
    
    setObservation(obs);
  };
  
  const cleanupLab = () => {
    setContaminated(false);
    setToxicSpill(false);
    setBacterialOvergrowth(false);
    setBiohazard(false);
    setUnsafeHandling(false);
    setSlidePreparation({
      cleaned: false,
      specimen: false,
      coverSlip: false
    });
    setStainType("none");
    setHasNutrients(false);
    setObservation("");
    toast.info("Lab cleaned and sterilized - equipment restored");
  };

  const handleMagnificationChange = (value: number[]) => {
    setMagnification(value[0]);
    updateObservation();
    onDataChange?.({ magnification: value[0], cellType, showDetails });
  };

  const handleLightChange = (value: number[]) => {
    setLightIntensity(value[0]);
  };

  const toggleCellType = () => {
    const newType = cellType === "plant" ? "animal" : "plant";
    setCellType(newType);
    updateObservation();
    onAIRequest?.(
      { magnification, cellType: newType },
      `Switched to ${newType} cell`
    );
  };

  // Update observation when relevant state changes
  useState(() => {
    updateObservation();
  });

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    unlockAchievement("biology_tutorial");
    toast.success("🎓 Biology tutorial completed!");
  };
  
  const handleSpecimenChange = (specimenId: string) => {
    setSelectedSpecimen(specimenId);
    incrementProgress("cell_explorer");
    incrementProgress("biology_master");
    const specimen = SPECIMEN_CATALOG[specimenId];
    if (specimen) {
      setCellType(specimen.category === 'plant' ? 'plant' : 'animal');
      toast.info(`🔬 Viewing: ${specimen.name}`);
    }
  };

  return (
    <div className="w-full h-full min-h-[700px] flex flex-col bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 rounded-xl overflow-hidden border border-teal-800 shadow-2xl">
      {/* Tutorial */}
      {showTutorial && (
        <LabTutorial
          labType="biology"
          onClose={handleTutorialComplete}
          onStepComplete={(stepId) => setTutorialAction(stepId)}
          currentAction={tutorialAction}
        />
      )}
      
      {/* Achievement Unlock Popup */}
      {recentUnlock && (
        <AchievementUnlockPopup achievement={recentUnlock} onClose={clearRecentUnlock} />
      )}
      
      {/* Achievements Panel */}
      {showAchievements && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <AchievementsPanel onClose={() => setShowAchievements(false)} />
        </div>
      )}
      
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-teal-900/80 border-b border-teal-700 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
            <Microscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Biology Laboratory</h2>
            <p className="text-xs text-teal-300">Cell observation & microscopy</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTutorial(true)}
            className="gap-2 border-teal-600 text-teal-300 hover:bg-teal-800"
          >
            <GraduationCap className="w-4 h-4" />
            Tutorial
          </Button>
          <AchievementBadge onClick={() => setShowAchievements(true)} />
          {biohazard && (
            <Badge variant="destructive" className="animate-pulse">
              ☠️ BIOHAZARD
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-80 bg-teal-900/30 border-r border-teal-700 p-4 overflow-y-auto space-y-4">
          {/* Slide Preparation */}
          <div className="bg-teal-800/30 rounded-xl p-4 border border-teal-600">
            <h3 className="text-sm font-semibold text-teal-200 mb-3 flex items-center gap-2">
              📋 Slide Preparation
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSlidePreparation(prev => ({ ...prev, cleaned: !prev.cleaned }));
                  updateObservation();
                }}
                className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${
                  slidePreparation.cleaned 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                    : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                {slidePreparation.cleaned ? "✓" : "1."} Clean glass slide
              </button>
              <button
                onClick={() => {
                  setSlidePreparation(prev => ({ ...prev, specimen: !prev.specimen }));
                  updateObservation();
                }}
                disabled={!slidePreparation.cleaned}
                className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${
                  slidePreparation.specimen 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                    : slidePreparation.cleaned 
                      ? 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500' 
                      : 'bg-slate-800/50 border-slate-700 text-slate-600 cursor-not-allowed'
                }`}
              >
                {slidePreparation.specimen ? "✓" : "2."} Place specimen
              </button>
              <button
                onClick={() => {
                  setSlidePreparation(prev => ({ ...prev, coverSlip: !prev.coverSlip }));
                  updateObservation();
                }}
                disabled={!slidePreparation.specimen}
                className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${
                  slidePreparation.coverSlip 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                    : slidePreparation.specimen 
                      ? 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500' 
                      : 'bg-slate-800/50 border-slate-700 text-slate-600 cursor-not-allowed'
                }`}
              >
                {slidePreparation.coverSlip ? "✓" : "3."} Add cover slip
              </button>
            </div>
          </div>

          {/* Staining Options */}
          <div className="bg-teal-800/30 rounded-xl p-4 border border-teal-600">
            <h3 className="text-sm font-semibold text-teal-200 mb-3">🧪 Staining</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "none", label: "None" },
                { value: "iodine", label: "Iodine" },
                { value: "methylene", label: "Methylene" }
              ].map(stain => (
                <button
                  key={stain.value}
                  onClick={() => {
                    setStainType(stain.value as "none" | "iodine" | "methylene");
                    updateObservation();
                  }}
                  className={`p-2 rounded-lg border text-xs transition-all ${
                    stainType === stain.value 
                      ? 'bg-purple-500/20 border-purple-500 text-purple-400' 
                      : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {stain.label}
                </button>
              ))}
            </div>
          </div>

          {/* Microscope Controls */}
          <div className="bg-teal-800/30 rounded-xl p-4 border border-teal-600">
            <h3 className="text-sm font-semibold text-teal-200 mb-3 flex items-center gap-2">
              <ZoomIn className="w-4 h-4" />
              Microscope
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-teal-300">Magnification</span>
                  <span className="text-xs font-bold text-white">{magnification}x</span>
                </div>
                <Slider
                  value={[magnification]}
                  onValueChange={handleMagnificationChange}
                  min={4}
                  max={100}
                  step={2}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-teal-300">Light</span>
                  <span className="text-xs font-bold text-white">{lightIntensity}%</span>
                </div>
                <Slider
                  value={[lightIntensity]}
                  onValueChange={handleLightChange}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Specimen Selector */}
          <div className="bg-teal-800/30 rounded-xl p-4 border border-teal-600">
            <h3 className="text-sm font-semibold text-teal-200 mb-3">🔬 Specimen</h3>
            <Select value={selectedSpecimen} onValueChange={handleSpecimenChange}>
              <SelectTrigger className="w-full bg-slate-800/50 border-teal-600 text-teal-200">
                <SelectValue placeholder="Select specimen" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-teal-600 max-h-[300px]">
                <div className="px-2 py-1 text-xs font-semibold text-green-400">🌱 Plant Cells</div>
                {specimenCategories.plant.map(([id, specimen]) => (
                  <SelectItem key={id} value={id} className="text-teal-200 focus:bg-teal-700">
                    {specimen.name}
                  </SelectItem>
                ))}
                <div className="px-2 py-1 text-xs font-semibold text-pink-400 mt-2">🐾 Animal Cells</div>
                {specimenCategories.animal.map(([id, specimen]) => (
                  <SelectItem key={id} value={id} className="text-teal-200 focus:bg-teal-700">
                    {specimen.name}
                  </SelectItem>
                ))}
                <div className="px-2 py-1 text-xs font-semibold text-red-400 mt-2">🩸 Blood Cells</div>
                {specimenCategories.blood.map(([id, specimen]) => (
                  <SelectItem key={id} value={id} className="text-teal-200 focus:bg-teal-700">
                    {specimen.name}
                  </SelectItem>
                ))}
                <div className="px-2 py-1 text-xs font-semibold text-purple-400 mt-2">🦠 Bacteria</div>
                {specimenCategories.bacterial.map(([id, specimen]) => (
                  <SelectItem key={id} value={id} className="text-teal-200 focus:bg-teal-700">
                    {specimen.name}
                  </SelectItem>
                ))}
                <div className="px-2 py-1 text-xs font-semibold text-cyan-400 mt-2">🧬 Protists</div>
                {specimenCategories.protist.map(([id, specimen]) => (
                  <SelectItem key={id} value={id} className="text-teal-200 focus:bg-teal-700">
                    {specimen.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentSpecimen && (
              <p className="text-xs text-teal-400 mt-2">{currentSpecimen.description}</p>
            )}
          </div>

          {/* Cell Type */}
          <div className="bg-teal-800/30 rounded-xl p-4 border border-teal-600">
            <h3 className="text-sm font-semibold text-teal-200 mb-3">View Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCellType("plant")}
                className={`p-3 rounded-lg border text-sm transition-all ${
                  cellType === "plant" 
                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                    : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                🌱 Plant
              </button>
              <button
                onClick={() => setCellType("animal")}
                className={`p-3 rounded-lg border text-sm transition-all ${
                  cellType === "animal" 
                    ? 'bg-pink-500/20 border-pink-500 text-pink-400' 
                    : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                🐾 Animal
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full mt-2 border-teal-600 text-teal-300 hover:bg-teal-800"
            >
              {showDetails ? "Hide" : "Show"} Organelles
            </Button>
          </div>

          {/* Nutrients */}
          <Button
            variant={hasNutrients ? "destructive" : "outline"}
            size="sm"
            onClick={() => setHasNutrients(!hasNutrients)}
            className={`w-full ${!hasNutrients && 'border-teal-600 text-teal-300 hover:bg-teal-800'}`}
          >
            <Droplets className="w-4 h-4 mr-2" />
            {hasNutrients ? "Remove" : "Add"} Nutrients
          </Button>

          {biohazard && (
            <Button onClick={cleanupLab} variant="destructive" className="w-full">
              🧹 Sterilize Lab
            </Button>
          )}
        </div>

        {/* Center - 3D Canvas */}
        <div className="flex-1 relative">
          <Canvas camera={{ position: [0, 2, 5], fov: 50 }} shadows>
            <ambientLight intensity={0.4 + lightIntensity / 200} />
            <directionalLight position={[5, 5, 5]} intensity={0.8 + lightIntensity / 100} castShadow />
            <pointLight position={[0, 3, 0]} intensity={lightIntensity / 50} color={0xffffaa} />

            {/* Microscope slide */}
            {hasTool("slide") && (
              <mesh 
                position={[0, -1, 0]} 
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={(e) => { e.stopPropagation(); selectObject(BIOLOGY_OBJECTS.slide); }}
                onPointerOver={(e) => { e.stopPropagation(); hoverObject("slide"); document.body.style.cursor = "pointer"; }}
                onPointerOut={(e) => { e.stopPropagation(); hoverObject(null); document.body.style.cursor = "auto"; }}
              >
                <planeGeometry args={[3, 3]} />
                <meshStandardMaterial color={0xeeeeee} transparent opacity={0.5} />
              </mesh>
            )}

            {/* Cell specimen */}
            {hasTool("cell") && (
              <group
                onClick={(e) => { e.stopPropagation(); selectObject(BIOLOGY_OBJECTS.cell); }}
                onPointerOver={(e) => { e.stopPropagation(); hoverObject("cell"); document.body.style.cursor = "pointer"; }}
                onPointerOut={(e) => { e.stopPropagation(); hoverObject(null); document.body.style.cursor = "auto"; }}
              >
                <Cell3D position={[0, 0, 0]} scale={cellScale} showDetails={showDetails} cellType={cellType} />
              </group>
            )}

            {/* Petri dish */}
            {hasTool("petriDish") && (
              <group
                onClick={(e) => { e.stopPropagation(); selectObject(BIOLOGY_OBJECTS.petriDish); }}
                onPointerOver={(e) => { e.stopPropagation(); hoverObject("petriDish"); document.body.style.cursor = "pointer"; }}
                onPointerOut={(e) => { e.stopPropagation(); hoverObject(null); document.body.style.cursor = "auto"; }}
              >
                <PetriDish position={[-2.5, -0.9, 0]} hasSample={hasNutrients} contaminated={contaminated} />
              </group>
            )}

            {/* Microscope */}
            {hasTool("microscope") && (
              <group
                onClick={(e) => { e.stopPropagation(); selectObject(BIOLOGY_OBJECTS.microscope); }}
                onPointerOver={(e) => { e.stopPropagation(); hoverObject("microscope"); document.body.style.cursor = "pointer"; }}
                onPointerOut={(e) => { e.stopPropagation(); hoverObject(null); document.body.style.cursor = "auto"; }}
              >
                <Microscope3D position={[2.5, -1, 0]} />
              </group>
            )}
            
            {toxicSpill && <ToxicSpill position={[-2.5, 0, 0]} />}

            <OrbitControls enableZoom={true} enablePan={true} minDistance={2} maxDistance={10} target={[0, 0, 0]} />
          </Canvas>

          {/* Overlay Info */}
          <div className="absolute bottom-4 left-4 bg-teal-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-teal-700">
            <p className="text-xs text-teal-300 flex items-center gap-2">
              <MousePointer className="w-3 h-3" />
              Drag to rotate • Scroll to zoom
            </p>
          </div>

          {/* Object Info Panel */}
          {selectedObject && (
            <ObjectInfoPanel object={selectedObject} onClose={clearSelection} />
          )}

          {/* Danger Alert Overlay */}
          {biohazard && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-900/90 border-2 border-red-500 rounded-xl px-6 py-3 animate-bounce">
                <p className="text-red-200 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {contaminated && "🦠 CONTAMINATION!"}
                  {bacterialOvergrowth && "🦠 BACTERIAL OVERGROWTH!"}
                  {toxicSpill && "☠️ TOXIC SPILL!"}
                  {unsafeHandling && !contaminated && "⚠️ UNSAFE PRACTICE!"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Info */}
        <div className="w-72 bg-teal-900/30 border-l border-teal-700 p-4 overflow-y-auto space-y-4">
          {/* Observations */}
          {observation && (
            <div className={`rounded-xl p-4 border ${
              biohazard 
                ? 'bg-red-500/10 border-red-500' 
                : 'bg-teal-800/30 border-teal-600'
            }`}>
              <h3 className="text-sm font-semibold text-teal-200 mb-2">🔍 Observations</h3>
              <p className={`text-sm ${biohazard ? 'text-red-300' : 'text-teal-100'}`}>{observation}</p>
            </div>
          )}

          {/* Cell Structure Info */}
          <div className="bg-teal-800/30 rounded-xl p-4 border border-teal-600">
            <h3 className="text-sm font-semibold text-teal-200 mb-3">
              {cellType === "plant" ? "🌱 Plant" : "🐾 Animal"} Cell
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="border-teal-500 text-teal-300">Nucleus</Badge>
                <span className="text-teal-400">DNA storage</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="border-teal-500 text-teal-300">Mitochondria</Badge>
                <span className="text-teal-400">Energy (ATP)</span>
              </div>
              {cellType === "plant" && (
                <>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="border-green-500 text-green-300">Cell Wall</Badge>
                    <span className="text-teal-400">Rigid structure</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="border-green-500 text-green-300">Chloroplasts</Badge>
                    <span className="text-teal-400">Photosynthesis</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="border-green-500 text-green-300">Vacuole</Badge>
                    <span className="text-teal-400">Storage</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Safety Info */}
          <div className="bg-teal-800/30 rounded-xl p-4 border border-teal-600">
            <h3 className="text-xs font-semibold text-teal-400 mb-2">Lab Safety</h3>
            <div className="text-[10px] text-teal-500 space-y-1">
              <p>✓ Always clean slides first</p>
              <p>✓ Use cover slip with stains</p>
              <p>✓ Don't add nutrients to contaminated samples</p>
              <p>✓ Proper magnification + light levels</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
