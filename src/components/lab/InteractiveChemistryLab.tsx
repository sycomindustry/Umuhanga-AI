import { useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  FlaskConical, Beaker, TestTube2, Thermometer, Flame, 
  Plus, Minus, Trash2, Volume2, VolumeX, AlertTriangle,
  ArrowRight, Droplets, Sparkles, RotateCcw, BookOpen
} from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";
import { 
  InteractiveBeaker3D, 
  InteractiveFlask3D, 
  InteractiveTestTube3D,
  InteractiveCylinder3D,
  type ChemicalContent 
} from "./InteractiveContainer3D";
import { ChemicalShelf3D, SHELF_CHEMICALS } from "./ChemicalShelf3D";
import { RealisticBunsenBurner3D, RealisticTripod3D } from "./RealisticEquipment3D";
import { useLabSounds } from "@/hooks/useLabSounds";
import { LabNotebook } from "./LabNotebook";

interface LabContainer {
  id: string;
  type: 'beaker' | 'flask' | 'testTube' | 'cylinder';
  position: [number, number, number];
  capacity: number;
  contents: ChemicalContent[];
  isHeating: boolean;
  temperature: number;
  label: string;
}

// Reaction types and their effects
interface ReactionEffect {
  type: 'explosion' | 'bubbles' | 'precipitate' | 'colorChange' | 'gas' | 'heat';
  intensity: number;
  resultColor?: string;
  message: string;
}

function checkForReaction(contents: ChemicalContent[]): ReactionEffect | null {
  if (contents.length < 2) return null;

  const hasWater = contents.some(c => c.id === 'water');
  const hasSodium = contents.some(c => c.id === 'sodium');
  const hasAcid = contents.some(c => c.pH < 4);
  const hasBase = contents.some(c => c.pH > 10);
  const hasVinegar = contents.some(c => c.id === 'vinegar');
  const hasBakingSoda = contents.some(c => c.id === 'baking_soda');
  const hasPhenolphthalein = contents.some(c => c.id === 'phenolphthalein');
  const hasSilverNitrate = contents.some(c => c.id === 'silver_nitrate');
  const hasPotassiumIodide = contents.some(c => c.id === 'potassium_iodide');
  const hasCopperSulfate = contents.some(c => c.id === 'copper_sulfate');
  const hasIronNail = contents.some(c => c.id === 'iron_nail');
  const hasZincMetal = contents.some(c => c.id === 'zinc_metal');
  const hasMagnesium = contents.some(c => c.id === 'magnesium_ribbon');
  const hasHydrogenPeroxide = contents.some(c => c.id === 'hydrogen_peroxide');
  const hasPotassiumPermanganate = contents.some(c => c.id === 'potassium_permanganate');
  const hasHCl = contents.some(c => c.id === 'hcl');

  // Sodium + Water = EXPLOSION!
  if (hasSodium && hasWater) {
    return {
      type: 'explosion',
      intensity: 1,
      message: '💥 VIOLENT EXPLOSION! 2Na + 2H₂O → 2NaOH + H₂↑ (ignites!)'
    };
  }

  // COPPER SULFATE + IRON NAIL = Displacement reaction!
  if (hasCopperSulfate && hasIronNail) {
    return {
      type: 'precipitate',
      intensity: 0.9,
      resultColor: '#b87333',
      message: '🔄 DISPLACEMENT! CuSO₄ + Fe → FeSO₄ + Cu↓ (Copper deposits on iron nail, solution turns green!)'
    };
  }

  // Zinc + HCl = Hydrogen gas
  if (hasZincMetal && hasHCl) {
    return {
      type: 'bubbles',
      intensity: 0.9,
      resultColor: '#c0c0c0',
      message: '🫧 GAS EVOLUTION! Zn + 2HCl → ZnCl₂ + H₂↑ (Hydrogen gas bubbles vigorously!)'
    };
  }

  // Magnesium + HCl = Vigorous hydrogen evolution
  if (hasMagnesium && hasHCl) {
    return {
      type: 'bubbles',
      intensity: 1,
      resultColor: '#ffffff',
      message: '🫧💨 VIGOROUS REACTION! Mg + 2HCl → MgCl₂ + H₂↑ (Rapid hydrogen evolution with heat!)'
    };
  }

  // Magnesium + Water = Slow reaction
  if (hasMagnesium && hasWater) {
    return {
      type: 'bubbles',
      intensity: 0.3,
      message: '🫧 Slow reaction: Mg + 2H₂O → Mg(OH)₂ + H₂↑ (Forms magnesium hydroxide)'
    };
  }

  // Hydrogen Peroxide + Potassium Permanganate = Elephant toothpaste style
  if (hasHydrogenPeroxide && hasPotassiumPermanganate) {
    return {
      type: 'bubbles',
      intensity: 1,
      resultColor: '#8b4513',
      message: '🧪 OXIDATION! 5H₂O₂ + 2KMnO₄ → 2MnO₂ + 2KOH + 4H₂O + 3O₂↑ (Oxygen gas released, brown MnO₂ forms!)'
    };
  }

  // Acid + Base = Neutralization with heat
  if (hasAcid && hasBase) {
    return {
      type: 'heat',
      intensity: 0.8,
      resultColor: '#87ceeb',
      message: '🔥 Exothermic neutralization! H⁺ + OH⁻ → H₂O + heat'
    };
  }

  // Vinegar + Baking Soda = Bubbles!
  if (hasVinegar && hasBakingSoda) {
    return {
      type: 'bubbles',
      intensity: 1,
      message: '🫧 Vigorous bubbling! NaHCO₃ + CH₃COOH → CO₂↑ + H₂O + CH₃COONa'
    };
  }

  // Phenolphthalein + Base = Pink color
  if (hasPhenolphthalein && hasBase) {
    return {
      type: 'colorChange',
      intensity: 0.8,
      resultColor: '#ff69b4',
      message: '🩷 Color change! Phenolphthalein turns PINK in basic solution (pH > 8.2)'
    };
  }

  // Silver Nitrate + Potassium Iodide = Yellow precipitate
  if (hasSilverNitrate && hasPotassiumIodide) {
    return {
      type: 'precipitate',
      intensity: 0.9,
      resultColor: '#ffd700',
      message: '⬇️ Yellow precipitate! AgNO₃ + KI → AgI↓ + KNO₃'
    };
  }

  return null;
}

export function InteractiveChemistryLab() {
  const [containers, setContainers] = useState<LabContainer[]>([
    { 
      id: 'beaker-1', 
      type: 'beaker', 
      position: [0, 0, 0], 
      capacity: 500, 
      contents: [],
      isHeating: false,
      temperature: 25,
      label: 'Main Beaker'
    },
    { 
      id: 'flask-1', 
      type: 'flask', 
      position: [-1.5, -0.1, 0.5], 
      capacity: 250, 
      contents: [],
      isHeating: false,
      temperature: 25,
      label: 'Flask A'
    },
    { 
      id: 'tube-1', 
      type: 'testTube', 
      position: [1.5, 0.2, 0.3], 
      capacity: 25, 
      contents: [],
      isHeating: false,
      temperature: 25,
      label: 'Test Tube 1'
    },
    { 
      id: 'tube-2', 
      type: 'testTube', 
      position: [1.8, 0.2, 0.3], 
      capacity: 25, 
      contents: [],
      isHeating: false,
      temperature: 25,
      label: 'Test Tube 2'
    },
    { 
      id: 'cylinder-1', 
      type: 'cylinder', 
      position: [-1.8, 0.1, -0.3], 
      capacity: 100, 
      contents: [],
      isHeating: false,
      temperature: 25,
      label: 'Graduated Cylinder'
    },
  ]);

  const [selectedContainerId, setSelectedContainerId] = useState<string | null>('beaker-1');
  const [selectedChemical, setSelectedChemical] = useState<ChemicalContent | null>(null);
  const [draggingChemical, setDraggingChemical] = useState<ChemicalContent | null>(null);
  const [pourAmount, setPourAmount] = useState(25);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [observations, setObservations] = useState<string[]>([]);
  const [isHeatingActive, setIsHeatingActive] = useState(false);
  const [reactionEffects, setReactionEffects] = useState<{containerId: string, effect: ReactionEffect}[]>([]);
  const [showNotebook, setShowNotebook] = useState(false);

  const { playSound, playExplosion, playBubbling, playPour, playSizzle, playGlassBreak } = useLabSounds();

  // Get selected container
  const selectedContainer = containers.find(c => c.id === selectedContainerId);

  // Handle drag start from chemical shelf
  const handleDragStart = useCallback((chemical: ChemicalContent) => {
    setDraggingChemical(chemical);
    setSelectedChemical(chemical);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    // If we're dragging over a container, add the chemical
    if (draggingChemical && selectedContainerId) {
      addChemicalToContainerInternal(selectedContainerId, draggingChemical);
    }
    setDraggingChemical(null);
  }, [draggingChemical, selectedContainerId]);

  // Internal function to add chemical to container
  const addChemicalToContainerInternal = useCallback((containerId: string, chemical: ChemicalContent) => {
    setContainers(prev => {
      return prev.map(container => {
        if (container.id !== containerId) return container;

        const totalVolume = container.contents.reduce((sum, c) => sum + c.amount, 0);
        const spaceLeft = container.capacity - totalVolume;
        const amountToAdd = Math.min(pourAmount, spaceLeft);

        if (amountToAdd <= 0) {
          toast.error(`${container.label} is full!`);
          return container;
        }

        // Check if this chemical already exists
        const existingChemIndex = container.contents.findIndex(c => c.id === chemical.id);
        let newContents: ChemicalContent[];

        if (existingChemIndex >= 0) {
          newContents = container.contents.map((c, i) => 
            i === existingChemIndex 
              ? { ...c, amount: c.amount + amountToAdd }
              : c
          );
        } else {
          newContents = [...container.contents, { ...chemical, amount: amountToAdd }];
        }

        // Check for reactions
        const reaction = checkForReaction(newContents);
        if (reaction) {
          setObservations(prev => [reaction.message, ...prev.slice(0, 9)]);
          setReactionEffects(prev => [...prev.filter(e => e.containerId !== containerId), { containerId, effect: reaction }]);
          
          // Clear reaction effect after some time
          setTimeout(() => {
            setReactionEffects(prev => prev.filter(e => e.containerId !== containerId));
          }, reaction.type === 'explosion' ? 3000 : 5000);
          
          if (soundEnabled) {
            if (reaction.type === 'explosion') {
              playExplosion();
              setTimeout(() => playGlassBreak(), 200);
              toast.error(reaction.message);
            } else if (reaction.type === 'bubbles') {
              playBubbling(2);
              toast.success(reaction.message);
            } else if (reaction.type === 'heat') {
              playSizzle(1);
              toast.info(reaction.message);
            } else if (reaction.type === 'precipitate') {
              toast.success(reaction.message);
            } else if (reaction.type === 'colorChange') {
              toast.success(reaction.message);
            } else {
              toast.success(reaction.message);
            }
          }

          // Apply reaction effects
          if (reaction.resultColor) {
            newContents = newContents.map(c => ({ ...c, color: reaction.resultColor! }));
          }
          if (reaction.type === 'heat') {
            return { ...container, contents: newContents, temperature: container.temperature + 20 };
          }
        }

        if (soundEnabled) playPour();
        toast.success(`Added ${amountToAdd}mL of ${chemical.name} to ${container.label}`);
        return { ...container, contents: newContents };
      });
    });
  }, [pourAmount, soundEnabled, playExplosion, playBubbling, playPour, playSizzle, playGlassBreak]);

  // Add chemical to selected container (button click version)
  const addChemicalToContainer = useCallback(() => {
    if (!selectedContainerId || !selectedChemical) {
      toast.error("Select a container and a chemical first!");
      return;
    }
    addChemicalToContainerInternal(selectedContainerId, selectedChemical);
  }, [selectedContainerId, selectedChemical, addChemicalToContainerInternal]);

  // Clear container
  const clearContainer = useCallback((containerId: string) => {
    setContainers(prev => prev.map(c => 
      c.id === containerId 
        ? { ...c, contents: [], temperature: 25 }
        : c
    ));
    toast.info("Container cleared");
  }, []);

  // Toggle heating
  const toggleHeating = useCallback((containerId: string) => {
    setContainers(prev => prev.map(c => 
      c.id === containerId 
        ? { ...c, isHeating: !c.isHeating }
        : c
    ));
  }, []);

  // Heat effect
  useEffect(() => {
    const heatingContainers = containers.filter(c => c.isHeating && c.temperature < 100);
    if (heatingContainers.length === 0) return;

    const timer = setInterval(() => {
      setContainers(prev => prev.map(c => 
        c.isHeating && c.temperature < 100
          ? { ...c, temperature: Math.min(100, c.temperature + 2) }
          : c
      ));
    }, 500);

    return () => clearInterval(timer);
  }, [containers]);

  // Handle chemical selection from shelf
  const handleChemicalSelect = useCallback((chemical: ChemicalContent) => {
    setSelectedChemical(chemical);
    toast.info(`Selected: ${chemical.name}`);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-6 h-6 text-cyan-400" />
          <h1 className="text-lg font-bold text-white">Interactive Chemistry Lab</h1>
          <Badge variant="outline" className="text-cyan-400 border-cyan-400/50">
            Real Reactions
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowNotebook(!showNotebook)} className={showNotebook ? 'text-amber-400' : 'text-slate-400'}>
            <BookOpen className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)} className="text-slate-400 hover:text-white">
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chemical Controls */}
        <div className="w-80 bg-slate-800/50 border-r border-slate-700 p-4 overflow-y-auto space-y-4">
          {/* Selected Chemical Display */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Selected Chemical
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedChemical ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white/20" 
                      style={{ backgroundColor: selectedChemical.color }}
                    />
                    <span className="text-white font-semibold">{selectedChemical.name}</span>
                  </div>
                  <p className="text-xs text-slate-400">pH: {selectedChemical.pH}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Click a bottle on the shelf</p>
              )}
            </CardContent>
          </Card>

          {/* Pour Amount */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-200">Pour Amount: {pourAmount}mL</CardTitle>
            </CardHeader>
            <CardContent>
              <Slider
                value={[pourAmount]}
                onValueChange={([val]) => setPourAmount(val)}
                min={5}
                max={100}
                step={5}
                className="my-2"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>5mL</span>
                <span>100mL</span>
              </div>
            </CardContent>
          </Card>

          {/* Target Container */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                <Beaker className="w-4 h-4 text-emerald-400" />
                Target Container
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedContainerId || ''} onValueChange={setSelectedContainerId}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select container" />
                </SelectTrigger>
                <SelectContent>
                  {containers.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label} ({c.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={addChemicalToContainer}
              disabled={!selectedChemical || !selectedContainerId}
              className="w-full bg-cyan-600 hover:bg-cyan-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Container
            </Button>
            
            {selectedContainer && (
              <>
                <Button 
                  onClick={() => toggleHeating(selectedContainerId!)}
                  variant={selectedContainer.isHeating ? "destructive" : "outline"}
                  className="w-full"
                >
                  <Flame className="w-4 h-4 mr-2" />
                  {selectedContainer.isHeating ? 'Stop Heating' : 'Start Heating'}
                </Button>
                <Button 
                  onClick={() => clearContainer(selectedContainerId!)}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Container
                </Button>
              </>
            )}
          </div>

          {/* Container Info */}
          {selectedContainer && (
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-200">{selectedContainer.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Capacity</span>
                  <span className="text-white">{selectedContainer.capacity}mL</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Volume</span>
                  <span className="text-white">
                    {selectedContainer.contents.reduce((s, c) => s + c.amount, 0).toFixed(0)}mL
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Temperature</span>
                  <span className={selectedContainer.temperature > 60 ? 'text-orange-400' : 'text-white'}>
                    {selectedContainer.temperature}°C
                  </span>
                </div>
                {selectedContainer.contents.length > 0 && (
                  <div className="pt-2 border-t border-slate-600">
                    <p className="text-xs text-slate-400 mb-1">Contents:</p>
                    {selectedContainer.contents.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-slate-300">{c.name}: {c.amount}mL</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Experiments */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Try These Reactions!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1.5 text-slate-300">
              <p>• <span className="text-red-400 font-semibold">Na + H₂O</span> → 💥 Explosion!</p>
              <p>• <span className="text-orange-400 font-semibold">CuSO₄ + Fe nail</span> → 🔄 Copper displacement</p>
              <p>• <span className="text-pink-400 font-semibold">NaOH + Phenolphthalein</span> → 🩷 Pink color</p>
              <p>• <span className="text-cyan-400 font-semibold">Vinegar + Baking Soda</span> → 🫧 Bubbles</p>
              <p>• <span className="text-yellow-400 font-semibold">AgNO₃ + KI</span> → ⬇️ Yellow precipitate</p>
              <p>• <span className="text-green-400 font-semibold">Zn + HCl</span> → 🫧 Hydrogen gas</p>
              <p>• <span className="text-purple-400 font-semibold">H₂O₂ + KMnO₄</span> → 🧪 Oxidation</p>
            </CardContent>
          </Card>
        </div>

        {/* Center - 3D Lab View */}
        <div className="flex-1 relative">
          <Canvas 
            camera={{ position: [0, 3, 6], fov: 50 }} 
            shadows
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          >
            <Environment preset="studio" background={false} />
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[5, 10, 5]} 
              intensity={1.5} 
              castShadow 
              shadow-mapSize={[2048, 2048]}
            />
            <pointLight position={[-3, 3, 3]} intensity={0.5} color="#6495ed" />

            {/* Lab Bench */}
            <group position={[0, -0.7, 0]}>
              <mesh receiveShadow castShadow>
                <boxGeometry args={[6, 0.15, 3.5]} />
                <meshStandardMaterial color="#5d4037" roughness={0.8} />
              </mesh>
              {/* Legs */}
              {[[-2.7, -0.5, 1.5], [2.7, -0.5, 1.5], [-2.7, -0.5, -1.5], [2.7, -0.5, -1.5]].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]}>
                  <boxGeometry args={[0.12, 1, 0.12]} />
                  <meshStandardMaterial color="#3e2723" />
                </mesh>
              ))}
            </group>

            {/* Chemical Shelf */}
            <ChemicalShelf3D 
              position={[0, 0.3, -1.5]} 
              onSelectChemical={handleChemicalSelect}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              selectedChemicalId={selectedChemical?.id}
              draggingChemicalId={draggingChemical?.id}
            />

            {/* Containers */}
            {containers.map(container => {
              const isSelected = container.id === selectedContainerId;
              const activeReaction = reactionEffects.find(r => r.containerId === container.id);
              const props = {
                type: container.type,
                position: container.position,
                capacity: container.capacity,
                contents: container.contents,
                isSelected,
                isHeating: container.isHeating,
                temperature: container.temperature,
                label: container.label,
                reactionEffect: activeReaction?.effect?.type || null,
                onSelect: () => setSelectedContainerId(container.id),
              };

              switch (container.type) {
                case 'beaker':
                  return <InteractiveBeaker3D key={container.id} {...props} />;
                case 'flask':
                  return <InteractiveFlask3D key={container.id} {...props} />;
                case 'testTube':
                  return <InteractiveTestTube3D key={container.id} {...props} />;
                case 'cylinder':
                  return <InteractiveCylinder3D key={container.id} {...props} />;
                default:
                  return null;
              }
            })}

            {/* Bunsen Burner under main beaker when heating */}
            {containers.find(c => c.id === 'beaker-1')?.isHeating && (
              <group position={[0, -0.65, 0]}>
                <RealisticTripod3D position={[0, 0.1, 0]} />
                <RealisticBunsenBurner3D
                  position={[0, -0.35, 0]}
                  isActive={true}
                  flameIntensity={0.8}
                  flameType="blue"
                />
              </group>
            )}

            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
            </mesh>

            <OrbitControls 
              enableZoom={true} 
              enablePan={true}
              minDistance={3}
              maxDistance={12}
              maxPolarAngle={Math.PI / 2.1}
            />
          </Canvas>

          {/* Instructions Overlay */}
          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700">
            <p className="text-xs text-slate-400">
              🖱️ Click bottles to select • Click containers to target • Drag to rotate view
            </p>
          </div>
        </div>

        {/* Right Panel - Observations */}
        <div className="w-72 bg-slate-800/50 border-l border-slate-700 p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Lab Observations
          </h3>
          
          {observations.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              Mix chemicals to observe reactions...
            </p>
          ) : (
            <div className="space-y-2">
              {observations.map((obs, i) => (
                <div 
                  key={i} 
                  className={`text-xs p-2 rounded-lg ${
                    obs.includes('EXPLOSION') ? 'bg-red-500/20 text-red-200 border border-red-500/30' :
                    obs.includes('Exothermic') ? 'bg-orange-500/20 text-orange-200 border border-orange-500/30' :
                    obs.includes('Color') ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30' :
                    obs.includes('precipitate') ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30' :
                    'bg-slate-700/50 text-slate-300 border border-slate-600'
                  }`}
                >
                  {obs}
                </div>
              ))}
            </div>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setObservations([])}
            className="w-full mt-4 text-slate-400"
          >
            <RotateCcw className="w-3 h-3 mr-2" />
            Clear Observations
          </Button>
        </div>

        {/* Notebook Panel */}
        {showNotebook && (
          <div className="w-72 bg-slate-800/50 border-l border-slate-700 p-3 overflow-y-auto">
            <LabNotebook labType="chemistry" experimentTitle="Chemistry Experiment" autoObservations={observations} />
          </div>
        )}
      </div>
    </div>
  );
}
