import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, Environment } from "@react-three/drei";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Thermometer, AlertTriangle, Flame, Eye, ShieldAlert, MousePointer, Package, Volume2, VolumeX, GraduationCap, Trophy } from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";
import { useLabObjectSelection, CHEMISTRY_OBJECTS } from "@/hooks/useLabObjectSelection";
import { ObjectInfoPanel } from "./ObjectInfoPanel";
import { ToolPalette } from "./ToolPalette";
import { useLabTools } from "@/hooks/useLabTools";
import { useLabSounds } from "@/hooks/useLabSounds";
import { SafetyTrainingMode } from "./SafetyTrainingMode";
import { LabTutorial } from "./LabTutorial";
import { AchievementBadge, AchievementUnlockPopup, AchievementsPanel } from "./AchievementDisplay";
import { useAchievements } from "@/hooks/useAchievements";
import {
  RealisticBeaker3D,
  RealisticFlask3D,
  RealisticTestTube3D,
  RealisticBunsenBurner3D,
  RealisticTripod3D,
  RealisticThermometer3D,
  RealisticChemicalBottle3D,
  RealisticPHMeter3D
} from "./RealisticEquipment3D";
import { FumeHood3D } from "./FumeHood3D";

// Chemical definitions with realistic properties
const CHEMICALS = {
  water: { name: "Water (H₂O)", color: 0x87ceeb, pH: 7, hazard: "none", state: "liquid", reactivity: "low" },
  hcl: { name: "Hydrochloric Acid (HCl)", color: 0xffeb3b, pH: 1, hazard: "corrosive", state: "liquid", reactivity: "high" },
  h2so4: { name: "Sulfuric Acid (H₂SO₄)", color: 0xffc107, pH: 0.5, hazard: "corrosive", state: "liquid", reactivity: "very_high" },
  naoh: { name: "Sodium Hydroxide (NaOH)", color: 0x03a9f4, pH: 14, hazard: "corrosive", state: "liquid", reactivity: "high" },
  koh: { name: "Potassium Hydroxide (KOH)", color: 0x0288d1, pH: 13.5, hazard: "corrosive", state: "liquid", reactivity: "high" },
  nacl: { name: "Sodium Chloride (NaCl)", color: 0xffffff, pH: 7, hazard: "none", state: "solid", reactivity: "low" },
  phenolphthalein: { name: "Phenolphthalein Indicator", color: 0xffffff, pH: 7, hazard: "irritant", state: "liquid", reactivity: "low" },
  methyl_orange: { name: "Methyl Orange Indicator", color: 0xff9800, pH: 7, hazard: "irritant", state: "liquid", reactivity: "low" },
  bromothymol_blue: { name: "Bromothymol Blue Indicator", color: 0x008000, pH: 7, hazard: "irritant", state: "liquid", reactivity: "low" },
  universal_indicator: { name: "Universal Indicator", color: 0x00ff00, pH: 7, hazard: "irritant", state: "liquid", reactivity: "low" },
  copper_sulfate: { name: "Copper Sulfate (CuSO₄)", color: 0x2196f3, pH: 4, hazard: "harmful", state: "solid", reactivity: "medium" },
  silver_nitrate: { name: "Silver Nitrate (AgNO₃)", color: 0xffffff, pH: 5, hazard: "corrosive", state: "solid", reactivity: "high" },
  lead_nitrate: { name: "Lead(II) Nitrate (Pb(NO₃)₂)", color: 0xffffff, pH: 4, hazard: "toxic", state: "solid", reactivity: "medium" },
  potassium_iodide: { name: "Potassium Iodide (KI)", color: 0xffffff, pH: 7, hazard: "none", state: "solid", reactivity: "medium" },
  sodium_carbonate: { name: "Sodium Carbonate (Na₂CO₃)", color: 0xffffff, pH: 11, hazard: "irritant", state: "solid", reactivity: "medium" },
  baking_soda: { name: "Sodium Bicarbonate (NaHCO₃)", color: 0xffffff, pH: 8.3, hazard: "none", state: "solid", reactivity: "medium" },
  vinegar: { name: "Acetic Acid (Vinegar)", color: 0xffefd5, pH: 2.4, hazard: "irritant", state: "liquid", reactivity: "medium" },
  sodium: { name: "Sodium Metal (Na)", color: 0xc0c0c0, pH: 14, hazard: "explosive", state: "solid", reactivity: "explosive" },
  potassium: { name: "Potassium Metal (K)", color: 0xa9a9a9, pH: 14, hazard: "explosive", state: "solid", reactivity: "explosive" },
  lithium: { name: "Lithium Metal (Li)", color: 0xd3d3d3, pH: 14, hazard: "explosive", state: "solid", reactivity: "explosive" },
  calcium: { name: "Calcium Metal (Ca)", color: 0xe0e0e0, pH: 13, hazard: "flammable", state: "solid", reactivity: "high" },
  magnesium: { name: "Magnesium Metal (Mg)", color: 0xc0c0c0, pH: 12, hazard: "flammable", state: "solid", reactivity: "high" },
  ammonia: { name: "Ammonia (NH₃)", color: 0xe0ffff, pH: 11, hazard: "toxic", state: "liquid", reactivity: "medium" },
  nitric_acid: { name: "Nitric Acid (HNO₃)", color: 0xffff00, pH: 1, hazard: "corrosive", state: "liquid", reactivity: "very_high" },
  bleach: { name: "Sodium Hypochlorite (Bleach)", color: 0xfffacd, pH: 12, hazard: "toxic", state: "liquid", reactivity: "high" },
  hydrogen_peroxide: { name: "Hydrogen Peroxide (H₂O₂)", color: 0xf0f8ff, pH: 6, hazard: "oxidizer", state: "liquid", reactivity: "high" },
};

// Animated components
function AnimatedBubble({ delay }: { delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime - delay;
      meshRef.current.position.y = -0.5 + ((time * 0.5) % 1.5);
      meshRef.current.position.x = Math.sin(time * 2) * 0.2;
      meshRef.current.scale.setScalar(0.1 + Math.sin(time * 3) * 0.05);
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color={0xffffff} transparent opacity={0.6} />
    </mesh>
  );
}

function AnimatedFlame() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.2;
      meshRef.current.scale.x = 0.8 + Math.sin(state.clock.elapsedTime * 8) * 0.15;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <coneGeometry args={[0.2, 0.6, 8]} />
      <meshStandardMaterial 
        color={0xff6600}
        emissive={0xff3300}
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function AnimatedStirrer() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 3;
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 0.8, 0]}>
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 16]} />
        <meshStandardMaterial color={0xc0c0c0} metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 16]} />
        <meshStandardMaterial color={0xc0c0c0} metalness={0.9} />
      </mesh>
    </group>
  );
}

function ExplosionEffect({ onComplete }: { onComplete: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [particles] = useState(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        Math.random() * 5 + 2,
        (Math.random() - 0.5) * 5
      ),
      position: new THREE.Vector3(0, 0, 0),
    }))
  );
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      particles.forEach((p) => {
        p.position.add(p.velocity.clone().multiplyScalar(delta));
        p.velocity.y -= 9.8 * delta;
      });
      
      if (state.clock.elapsedTime > 2) {
        onComplete();
      }
    }
  });
  
  return (
    <group ref={groupRef}>
      {particles.map((p) => (
        <mesh key={p.id} position={p.position}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial 
            color={0xff4400}
            emissive={0xff2200}
            emissiveIntensity={3}
          />
        </mesh>
      ))}
      <pointLight position={[0, 0, 0]} intensity={5} color={0xff4400} distance={5} />
    </group>
  );
}

function ToxicSmoke({ intensity }: { intensity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });
  
  return (
    <group ref={groupRef}>
      {Array.from({ length: Math.floor(intensity * 5) }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i) * 0.3, i * 0.2, Math.cos(i) * 0.3]}>
          <sphereGeometry args={[0.2 + i * 0.05, 16, 16]} />
          <meshStandardMaterial 
            color={0x88ff88}
            transparent
            opacity={0.3 - i * 0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

interface ChemistrySimulation3DProps {
  experimentType: string;
  onDataChange?: (data: any) => void;
  onAIRequest?: (state: any, action: string) => void;
}

export function ChemistrySimulation3D({
  experimentType,
  onDataChange,
  onAIRequest,
}: ChemistrySimulation3DProps) {
  // Safety training state
  const [showSafetyTraining, setShowSafetyTraining] = useState(true);
  const [safetyCompleted, setSafetyCompleted] = useState(() => {
    // Check if user has completed safety training before
    return localStorage.getItem('labSafetyCompleted') === 'true';
  });

  // Sound effects
  const { playSound, playExplosion, playGlassBreak, playBubbling, playSizzle, playGasRelease, playWarningAlarm, playPour } = useLabSounds();
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Object selection
  const { selectedObject, hoveredObject, selectObject, hoverObject, clearSelection } = useLabObjectSelection();
  
  // Tool selection
  const { selectedTools, toggleTool, hasTool } = useLabTools(["beaker", "bunsenBurner", "stirrer", "thermometer", "labBench"]);
  const [showToolPalette, setShowToolPalette] = useState(false);
  
  // Handle ESC key to close selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") clearSelection();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearSelection]);

  // Safety equipment
  const [safetyGear, setSafetyGear] = useState({
    goggles: false,
    gloves: false,
    labCoat: false,
  });

  // Lab equipment and chemicals
  const [selectedChemical1, setSelectedChemical1] = useState<keyof typeof CHEMICALS>("water");
  const [selectedChemical2, setSelectedChemical2] = useState<keyof typeof CHEMICALS | "">("");
  const [chemical1Amount, setChemical1Amount] = useState(0);
  const [chemical2Amount, setChemical2Amount] = useState(0);
  const [temperature, setTemperature] = useState(25);
  const [heating, setHeating] = useState(false);
  const [stirring, setStirring] = useState(false);
  
  // Reaction state
  const [reactionOccurring, setReactionOccurring] = useState(false);
  const [reactionColor, setReactionColor] = useState(0x87ceeb);
  const [gasProduced, setGasProduced] = useState(false);
  const [precipitate, setPrecipitate] = useState(false);
  const [currentPH, setCurrentPH] = useState(7);
  const [observations, setObservations] = useState<string[]>([]);
  
  // Danger states
  const [explosion, setExplosion] = useState(false);
  const [toxicFumes, setToxicFumes] = useState(false);
  const [fumeIntensity, setFumeIntensity] = useState(0);
  const [beakerDamaged, setBeakerDamaged] = useState(false);
  const [violentReaction, setViolentReaction] = useState(false);
  
  // Tutorial & Achievement states
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [tutorialAction, setTutorialAction] = useState<string | undefined>();
  const { achievements, recentUnlock, unlockAchievement, incrementProgress, clearRecentUnlock } = useAchievements();

  // Handle safety training completion
  const handleSafetyComplete = useCallback(() => {
    setSafetyCompleted(true);
    setShowSafetyTraining(false);
    localStorage.setItem('labSafetyCompleted', 'true');
    unlockAchievement("safety_first");
    toast.success("🎓 Safety certification complete! You may now use the laboratory.");
  }, [unlockAchievement]);

  const handleSafetySkip = useCallback(() => {
    setShowSafetyTraining(false);
    toast.warning("⚠️ Safety training skipped. Be extremely careful!");
  }, []);
  
  const handleTutorialComplete = useCallback(() => {
    setShowTutorial(false);
    unlockAchievement("chemistry_tutorial");
    toast.success("🎓 Chemistry tutorial completed!");
  }, [unlockAchievement]);

  // Show safety training if not completed and user hasn't seen it this session
  if (showSafetyTraining && !safetyCompleted) {
    return <SafetyTrainingMode onComplete={handleSafetyComplete} onSkip={handleSafetySkip} />;
  }

  // Real-time reaction engine
  useEffect(() => {
    if (chemical1Amount > 0 && chemical2Amount > 0 && selectedChemical2) {
      performReaction();
    }
  }, [chemical1Amount, chemical2Amount, temperature, selectedChemical1, selectedChemical2]);

  // Heating effect
  useEffect(() => {
    if (heating && temperature < 100) {
      const timer = setTimeout(() => {
        setTemperature(prev => Math.min(100, prev + 1));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [heating, temperature]);

  const performReaction = () => {
    const chem1 = CHEMICALS[selectedChemical1];
    const chem2 = selectedChemical2 ? CHEMICALS[selectedChemical2] : null;
    
    console.log("performReaction called:", {
      chem1: chem1.name,
      chem2: chem2?.name,
      selectedChemical1,
      selectedChemical2,
      chemical1Amount,
      chemical2Amount
    });
    
    if (!chem2) return;

    // Check safety equipment for hazardous reactions - show warning but allow reaction
    const hazardous = chem1.hazard !== "none" || chem2.hazard !== "none";
    const hasSafetyGear = safetyGear.goggles && safetyGear.gloves && safetyGear.labCoat;
    
    if (hazardous && !hasSafetyGear) {
      toast.warning("⚠️ Safety Warning: Wear all safety equipment! Proceeding anyway for demonstration...");
    }

    setReactionOccurring(true);
    const newObservations: string[] = [];

    // DANGEROUS REACTIONS - Check for explosive/violent reactions first!
    const reactiveMetals = ["sodium", "potassium", "lithium", "calcium", "magnesium"];
    const isReactiveMetal1 = reactiveMetals.includes(selectedChemical1);
    const isReactiveMetal2 = reactiveMetals.includes(selectedChemical2);
    
    // Reactive metal + Water = EXPLOSION!
    if ((isReactiveMetal1 && selectedChemical2 === "water") ||
        (isReactiveMetal2 && selectedChemical1 === "water")) {
      const metalUsed = isReactiveMetal1 ? selectedChemical1 : selectedChemical2;
      const explosionIntensity = metalUsed === "potassium" ? 1.5 : metalUsed === "sodium" ? 1.2 : metalUsed === "lithium" ? 1.0 : 0.8;
      
      console.log("🔥 EXPLOSION TRIGGERED! Metal:", metalUsed);
      setExplosion(true);
      setBeakerDamaged(true);
      setReactionColor(0xff4400);
      
      // Play explosion and glass break sounds
      if (soundEnabled) {
        playExplosion();
        setTimeout(() => playGlassBreak(), 200);
        playWarningAlarm();
      }
      
      newObservations.push(`⚠️ VIOLENT EXPLOSION! ${CHEMICALS[metalUsed as keyof typeof CHEMICALS].name} reacts explosively with water!`);
      newObservations.push("2Na + 2H₂O → 2NaOH + H₂↑ (ignites!)");
      newObservations.push("Hydrogen gas produced and IGNITED by heat of reaction!");
      newObservations.push("⚠️ BEAKER CRACKED! Lab equipment destroyed!");
      newObservations.push(`Temperature spike > ${150 + explosionIntensity * 100}°C`);
      setTemperature(150 + explosionIntensity * 100);
      toast.error(`💥 MASSIVE EXPLOSION! ${CHEMICALS[metalUsed as keyof typeof CHEMICALS].name} + Water is EXTREMELY dangerous!`);
      setTimeout(() => setExplosion(false), 3000);
    }
    // Reactive metal + Acid = EVEN MORE VIOLENT!
    else if ((isReactiveMetal1 && chem2.pH < 4) || 
             (isReactiveMetal2 && chem1.pH < 4)) {
      setExplosion(true);
      setViolentReaction(true);
      setGasProduced(true);
      setReactionColor(0xff3300);
      setBeakerDamaged(true);
      
      // Play explosion and glass break sounds
      if (soundEnabled) {
        playExplosion();
        setTimeout(() => playGlassBreak(), 150);
        setTimeout(() => playExplosion(), 300);
        playWarningAlarm();
      }
      
      newObservations.push("⚠️ EXTREMELY VIOLENT EXPLOSION!");
      newObservations.push("Metal + Acid = Rapid H₂ production!");
      newObservations.push("Hydrogen gas ignited from reaction heat!");
      newObservations.push("FIREBALL observed! Beaker SHATTERED!");
      newObservations.push("Temperature exceeded 300°C!");
      setTemperature(300);
      toast.error("💥💥 CATASTROPHIC! Never mix reactive metals with acids!");
      setTimeout(() => {
        setExplosion(false);
        setViolentReaction(false);
      }, 3500);
    }
    // Bleach + Ammonia = DEADLY CHLORINE GAS!
    else if ((selectedChemical1 === "bleach" && selectedChemical2 === "ammonia") ||
             (selectedChemical1 === "ammonia" && selectedChemical2 === "bleach")) {
      setToxicFumes(true);
      setFumeIntensity(1.0);
      setReactionColor(0x90ee90);
      
      // Play gas release and warning sounds
      if (soundEnabled) {
        playGasRelease(3);
        playWarningAlarm();
      }
      
      newObservations.push("☠️ DEADLY CHLORAMINE GAS PRODUCED!");
      newObservations.push("NaOCl + 2NH₃ → NaCl + H₂O + NH₂Cl↑");
      newObservations.push("Yellow-green toxic gas filling the area!");
      newObservations.push("IMMEDIATELY EVACUATE! This is LETHAL!");
      newObservations.push("Causes severe respiratory damage!");
      toast.error("☠️ CHLORINE GAS! THIS IS LETHAL! EVACUATE!");
    }
    // Bleach + Acid = CHLORINE GAS!
    else if ((selectedChemical1 === "bleach" && chem2.pH < 4) ||
             (chem1.pH < 4 && selectedChemical2 === "bleach")) {
      setToxicFumes(true);
      setFumeIntensity(0.9);
      setReactionColor(0xccff00);
      setGasProduced(true);
      newObservations.push("☠️ CHLORINE GAS PRODUCED!");
      newObservations.push("NaOCl + 2HCl → Cl₂↑ + NaCl + H₂O");
      newObservations.push("Yellow-green poisonous gas!");
      newObservations.push("Used as chemical weapon in WWI!");
      newObservations.push("EVACUATE IMMEDIATELY!");
      toast.error("☠️ CHLORINE GAS RELEASED! Extremely dangerous!");
    }
    // Hydrogen Peroxide + Acids = Violent decomposition
    else if ((selectedChemical1 === "hydrogen_peroxide" && chem2.pH < 3) ||
             (chem1.pH < 3 && selectedChemical2 === "hydrogen_peroxide")) {
      setViolentReaction(true);
      setGasProduced(true);
      setReactionColor(0xffffff);
      newObservations.push("⚠️ VIOLENT DECOMPOSITION!");
      newObservations.push("2H₂O₂ → 2H₂O + O₂↑");
      newObservations.push("Rapid oxygen gas evolution!");
      newObservations.push("Solution boiling violently!");
      newObservations.push("Fire hazard - oxygen accelerates combustion!");
      setTemperature(prev => prev + 40);
      toast.error("⚠️ Violent reaction! Oxygen released rapidly!");
      setTimeout(() => setViolentReaction(false), 2500);
    }
    // Concentrated acids + Ammonia = Toxic fumes
    else if ((chem1.pH < 2 && selectedChemical2 === "ammonia") || 
             (chem2.pH < 2 && selectedChemical1 === "ammonia")) {
      setToxicFumes(true);
      setFumeIntensity(0.8);
      setReactionColor(0xccffcc);
      newObservations.push("⚠️ TOXIC FUMES! Ammonium chloride gas produced!");
      newObservations.push("HCl + NH₃ → NH₄Cl↑ (white smoke)");
      newObservations.push("White dense smoke observed");
      newObservations.push("Irritating to eyes and respiratory system");
      newObservations.push("Evacuate area immediately!");
      toast.error("☠️ TOXIC FUMES! Dangerous gases released!");
    }
    // Strong acid + Strong base (too fast) = Dangerous heat
    else if ((chem1.pH < 2 && chem2.pH > 13) || (chem1.pH > 13 && chem2.pH < 2)) {
      if (chemical1Amount > 50 && chemical2Amount > 50) {
        setViolentReaction(true);
        setReactionColor(0xff8800);
        newObservations.push("⚠️ VIOLENT EXOTHERMIC REACTION!");
        newObservations.push("Large amounts of strong acid + base = dangerous heat!");
        newObservations.push("Solution boiling rapidly! Splashing hazard!");
        newObservations.push("Temperature > 100°C - mixture splashing!");
        newObservations.push("Add acid SLOWLY to base, never quickly!");
        setTemperature(120);
        toast.error("⚠️ DANGER! Too much heat - use smaller quantities!");
        setTimeout(() => setViolentReaction(false), 3000);
      } else {
        // Normal neutralization with small amounts
        setReactionColor(0x90ee90);
        setGasProduced(false);
        setPrecipitate(false);
        setCurrentPH(7);
        newObservations.push("✓ Neutralization reaction observed");
        newObservations.push("Acid + Base → Salt + Water");
        newObservations.push("Solution becomes neutral (pH ≈ 7)");
        newObservations.push("Exothermic reaction - temperature increased slightly");
        setTemperature(prev => prev + 10);
      }
    }
    // Nitric acid + metals or organics = Dangerous!
    else if (selectedChemical1 === "nitric_acid" || selectedChemical2 === "nitric_acid") {
      setToxicFumes(true);
      setFumeIntensity(0.7);
      setReactionColor(0xffaa00);
      setGasProduced(true);
      newObservations.push("⚠️ Nitrogen dioxide (NO₂) gas produced!");
      newObservations.push("Brown/reddish toxic fumes visible");
      newObservations.push("HNO₃ is a strong oxidizer!");
      newObservations.push("Highly corrosive and poisonous");
      newObservations.push("Work in fume hood ONLY!");
      toast.error("☠️ Toxic NO₂ gas! Use fume hood!");
    }
    // Lead Nitrate + Potassium Iodide = Beautiful yellow precipitate
    else if ((selectedChemical1 === "lead_nitrate" && selectedChemical2 === "potassium_iodide") ||
             (selectedChemical1 === "potassium_iodide" && selectedChemical2 === "lead_nitrate")) {
      setReactionColor(0xffd700);
      setPrecipitate(true);
      setCurrentPH(6);
      newObservations.push("✓ Beautiful GOLDEN YELLOW precipitate!");
      newObservations.push("Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃");
      newObservations.push("Lead(II) Iodide - 'Golden Rain' reaction");
      newObservations.push("⚠️ Lead compounds are toxic - handle carefully!");
    }
    // Silver Nitrate + Chloride = White precipitate
    else if ((selectedChemical1 === "silver_nitrate" && selectedChemical2 === "nacl") ||
             (selectedChemical1 === "nacl" && selectedChemical2 === "silver_nitrate")) {
      setReactionColor(0xffffff);
      setPrecipitate(true);
      setCurrentPH(6);
      newObservations.push("✓ White curdy precipitate formed!");
      newObservations.push("AgNO₃ + NaCl → AgCl↓ + NaNO₃");
      newObservations.push("Silver Chloride - photosensitive!");
      newObservations.push("Precipitate darkens in light");
    }
    // Acid + Carbonate/Bicarbonate = CO2 gas (safe fizzing)
    else if ((chem1.pH < 4 && (selectedChemical2 === "sodium_carbonate" || selectedChemical2 === "baking_soda")) || 
             ((selectedChemical1 === "sodium_carbonate" || selectedChemical1 === "baking_soda") && chem2.pH < 4)) {
      setReactionColor(0xffffcc);
      setGasProduced(true);
      setPrecipitate(false);
      setCurrentPH(5);
      newObservations.push("✓ Effervescence! Bubbles of CO₂ gas produced");
      newObservations.push("Acid + Carbonate → Salt + H₂O + CO₂↑");
      newObservations.push("The 'volcano experiment' reaction!");
      newObservations.push("Carbon dioxide is non-toxic in small amounts");
    }
    // Vinegar + Baking Soda (classic safe reaction)
    else if ((selectedChemical1 === "vinegar" && selectedChemical2 === "baking_soda") ||
             (selectedChemical1 === "baking_soda" && selectedChemical2 === "vinegar")) {
      setReactionColor(0xffffee);
      setGasProduced(true);
      setCurrentPH(6);
      newObservations.push("✓ Classic volcano reaction!");
      newObservations.push("CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂↑");
      newObservations.push("Vigorous bubbling - carbon dioxide released");
      newObservations.push("Safe for classroom demonstrations");
    }
    // Copper sulfate + base = blue precipitate
    else if ((selectedChemical1 === "copper_sulfate" && chem2.pH > 10) ||
             (chem1.pH > 10 && selectedChemical2 === "copper_sulfate")) {
      setReactionColor(0x87ceeb);
      setPrecipitate(true);
      setCurrentPH(8);
      newObservations.push("✓ Sky blue precipitate formed!");
      newObservations.push("CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄");
      newObservations.push("Copper(II) Hydroxide - gelatinous blue");
    }
    // pH Indicators
    else if (selectedChemical1 === "phenolphthalein" || selectedChemical2 === "phenolphthalein") {
      const otherChemPH = selectedChemical1 === "phenolphthalein" ? chem2.pH : chem1.pH;
      if (otherChemPH > 8.2) {
        setReactionColor(0xff69b4);
        newObservations.push("✓ Phenolphthalein turned PINK!");
        newObservations.push("Indicates basic solution (pH > 8.2)");
      } else {
        setReactionColor(0xf8f8f8);
        newObservations.push("Phenolphthalein remains COLORLESS");
        newObservations.push("Indicates acidic/neutral solution (pH < 8.2)");
      }
      setCurrentPH(otherChemPH);
    }
    else if (selectedChemical1 === "methyl_orange" || selectedChemical2 === "methyl_orange") {
      const otherChemPH = selectedChemical1 === "methyl_orange" ? chem2.pH : chem1.pH;
      if (otherChemPH < 3.1) {
        setReactionColor(0xff0000);
        newObservations.push("✓ Methyl Orange turned RED!");
        newObservations.push("Indicates strong acid (pH < 3.1)");
      } else if (otherChemPH < 4.4) {
        setReactionColor(0xffa500);
        newObservations.push("✓ Methyl Orange is ORANGE");
        newObservations.push("Indicates weak acid (pH 3.1-4.4)");
      } else {
        setReactionColor(0xffff00);
        newObservations.push("✓ Methyl Orange turned YELLOW");
        newObservations.push("Indicates neutral/basic solution (pH > 4.4)");
      }
      setCurrentPH(otherChemPH);
    }
    else if (selectedChemical1 === "bromothymol_blue" || selectedChemical2 === "bromothymol_blue") {
      const otherChemPH = selectedChemical1 === "bromothymol_blue" ? chem2.pH : chem1.pH;
      if (otherChemPH < 6.0) {
        setReactionColor(0xffff00);
        newObservations.push("✓ Bromothymol Blue turned YELLOW");
        newObservations.push("Indicates acidic solution (pH < 6.0)");
      } else if (otherChemPH < 7.6) {
        setReactionColor(0x00ff00);
        newObservations.push("✓ Bromothymol Blue is GREEN");
        newObservations.push("Indicates neutral solution (pH 6.0-7.6)");
      } else {
        setReactionColor(0x0000ff);
        newObservations.push("✓ Bromothymol Blue turned BLUE");
        newObservations.push("Indicates basic solution (pH > 7.6)");
      }
      setCurrentPH(otherChemPH);
    }
    else if (selectedChemical1 === "universal_indicator" || selectedChemical2 === "universal_indicator") {
      const otherChemPH = selectedChemical1 === "universal_indicator" ? chem2.pH : chem1.pH;
      // Universal indicator shows full pH spectrum
      if (otherChemPH < 3) {
        setReactionColor(0xff0000);
        newObservations.push("✓ Universal Indicator: DEEP RED");
      } else if (otherChemPH < 5) {
        setReactionColor(0xffa500);
        newObservations.push("✓ Universal Indicator: ORANGE");
      } else if (otherChemPH < 6) {
        setReactionColor(0xffff00);
        newObservations.push("✓ Universal Indicator: YELLOW");
      } else if (otherChemPH < 8) {
        setReactionColor(0x00ff00);
        newObservations.push("✓ Universal Indicator: GREEN (neutral)");
      } else if (otherChemPH < 10) {
        setReactionColor(0x0000ff);
        newObservations.push("✓ Universal Indicator: BLUE");
      } else {
        setReactionColor(0x800080);
        newObservations.push("✓ Universal Indicator: PURPLE/VIOLET");
      }
      newObservations.push(`pH reading: ${otherChemPH.toFixed(1)}`);
      setCurrentPH(otherChemPH);
    }
    // Default mixing
    else {
      const mixedColor = Math.floor((chem1.color + chem2.color) / 2);
      setReactionColor(mixedColor);
      const avgPH = (chem1.pH + chem2.pH) / 2;
      setCurrentPH(avgPH);
      newObservations.push("Chemicals mixed - observe any changes");
      newObservations.push(`Approximate pH: ${avgPH.toFixed(1)}`);
    }

    // Temperature effects
    if (temperature > 50 && !explosion && !violentReaction) {
      newObservations.push(`Reaction rate increased at ${temperature}°C`);
    }

    setObservations(newObservations);
    onDataChange?.({ 
      chemical1: chem1.name, 
      chemical2: chem2.name, 
      temperature, 
      pH: currentPH,
      observations: newObservations,
      dangerous: explosion || toxicFumes || beakerDamaged
    });
  };

  const addChemical = (chemicalSlot: 1 | 2) => {
    if (soundEnabled) playPour(0.5);
    
    if (chemicalSlot === 1) {
      setChemical1Amount(prev => Math.min(100, prev + 10));
      console.log("Added chemical 1:", selectedChemical1, CHEMICALS[selectedChemical1].name);
      toast.success(`Added ${CHEMICALS[selectedChemical1].name}`);
    } else if (selectedChemical2) {
      setChemical2Amount(prev => Math.min(100, prev + 10));
      console.log("Added chemical 2:", selectedChemical2, CHEMICALS[selectedChemical2 as keyof typeof CHEMICALS].name);
      toast.success(`Added ${CHEMICALS[selectedChemical2 as keyof typeof CHEMICALS].name}`);
    }
  };

  const clearBeaker = () => {
    setChemical1Amount(0);
    setChemical2Amount(0);
    setTemperature(25);
    setReactionOccurring(false);
    setGasProduced(false);
    setPrecipitate(false);
    setCurrentPH(7);
    setObservations([]);
    setHeating(false);
    setStirring(false);
    setExplosion(false);
    setToxicFumes(false);
    setFumeIntensity(0);
    setBeakerDamaged(false);
    setViolentReaction(false);
    toast.info("Beaker cleaned and equipment restored");
  };

  return (
    <div className="w-full h-full min-h-[700px] flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* Tutorial */}
      {showTutorial && (
        <LabTutorial
          labType="chemistry"
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
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-primary-glow rounded-lg">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Chemistry Laboratory</h2>
            <p className="text-xs text-slate-400">Interactive chemical reactions & experiments</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Tutorial Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTutorial(true)}
            className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <GraduationCap className="w-4 h-4" />
            Tutorial
          </Button>
          
          {/* Achievements Button */}
          <AchievementBadge onClick={() => setShowAchievements(true)} />
          
          {/* Sound Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          
          {/* Safety Review */}
          {safetyCompleted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSafetyTraining(true)}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <ShieldAlert className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-80 bg-slate-800/50 border-r border-slate-700 p-4 overflow-y-auto space-y-4">
          {/* Safety Equipment Card */}
          <div className={`p-4 rounded-xl border-2 transition-all ${
            safetyGear.goggles && safetyGear.gloves && safetyGear.labCoat 
              ? 'bg-green-500/10 border-green-500/50' 
              : 'bg-red-500/10 border-red-500/50'
          }`}>
            <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
              safetyGear.goggles && safetyGear.gloves && safetyGear.labCoat 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              <ShieldAlert className="w-4 h-4" />
              {safetyGear.goggles && safetyGear.gloves && safetyGear.labCoat 
                ? '✓ Safety Ready' 
                : 'Put On Safety Gear'}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSafetyGear({ ...safetyGear, goggles: !safetyGear.goggles })}
                className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                  safetyGear.goggles 
                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                    : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                <Eye className="w-5 h-5" />
                <span className="text-[10px]">Goggles</span>
              </button>
              <button
                onClick={() => setSafetyGear({ ...safetyGear, gloves: !safetyGear.gloves })}
                className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                  safetyGear.gloves 
                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                    : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span className="text-lg">🧤</span>
                <span className="text-[10px]">Gloves</span>
              </button>
              <button
                onClick={() => setSafetyGear({ ...safetyGear, labCoat: !safetyGear.labCoat })}
                className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                  safetyGear.labCoat 
                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                    : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span className="text-lg">🥼</span>
                <span className="text-[10px]">Lab Coat</span>
              </button>
            </div>
          </div>

          {/* Chemical Selection */}
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary" />
              Mix Chemicals
            </h3>
            
            {/* Chemical 1 */}
            <div className="mb-3">
              <label className="text-xs text-slate-400 mb-1 block">
                Chemical 1 {chemical1Amount > 0 && <span className="text-primary">({chemical1Amount}mL)</span>}
              </label>
              <Select value={selectedChemical1} onValueChange={(value) => setSelectedChemical1(value as keyof typeof CHEMICALS)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {Object.entries(CHEMICALS).map(([key, chem]) => (
                    <SelectItem key={key} value={key} className="text-slate-200 hover:bg-slate-700">
                      {chem.hazard !== "none" && "⚠️ "}{chem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => addChemical(1)} 
                className="w-full mt-2 bg-primary/80 hover:bg-primary text-white" 
                size="sm"
              >
                + Add 10mL
              </Button>
            </div>

            {/* Chemical 2 */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Chemical 2 {chemical2Amount > 0 && <span className="text-secondary">({chemical2Amount}mL)</span>}
              </label>
              <Select value={selectedChemical2} onValueChange={(value) => setSelectedChemical2(value as keyof typeof CHEMICALS)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                  <SelectValue placeholder="Select to mix..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {Object.entries(CHEMICALS).map(([key, chem]) => (
                    <SelectItem key={key} value={key} className="text-slate-200 hover:bg-slate-700">
                      {chem.hazard !== "none" && "⚠️ "}{chem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => addChemical(2)} 
                className="w-full mt-2 bg-secondary/80 hover:bg-secondary text-white" 
                size="sm"
                disabled={!selectedChemical2}
              >
                + Add 10mL
              </Button>
            </div>
          </div>

          {/* Lab Equipment Controls */}
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Equipment
            </h3>
            <div className="space-y-2">
              <Button
                onClick={() => setHeating(!heating)}
                variant={heating ? "destructive" : "outline"}
                className={`w-full justify-start ${!heating && 'border-slate-600 text-slate-300 hover:bg-slate-700'}`}
                size="sm"
              >
                <Flame className="w-4 h-4 mr-2" />
                {heating ? "🔥 Heating..." : "Bunsen Burner"}
              </Button>
              <Button
                onClick={() => setStirring(!stirring)}
                variant={stirring ? "default" : "outline"}
                className={`w-full justify-start ${!stirring && 'border-slate-600 text-slate-300 hover:bg-slate-700'}`}
                size="sm"
              >
                {stirring ? "↻ Stirring..." : "Magnetic Stirrer"}
              </Button>
              <Button 
                onClick={clearBeaker} 
                variant="outline" 
                className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                size="sm"
              >
                🧹 Clean Beaker
              </Button>
            </div>
          </div>

          {/* Quick Reactions */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/30">
            <h3 className="text-sm font-semibold text-orange-300 mb-2">💡 Try These</h3>
            <div className="text-xs text-slate-300 space-y-1">
              <p>• <span className="text-red-400">Explosion:</span> Na + H₂O</p>
              <p>• <span className="text-purple-400">Neutralization:</span> HCl + NaOH</p>
              <p>• <span className="text-green-400">Toxic Gas:</span> Bleach + NH₃</p>
              <p>• <span className="text-pink-400">Color Change:</span> Acid + Indicator</p>
            </div>
          </div>
        </div>

        {/* Center - 3D Canvas */}
        <div className="flex-1 relative">
          <Canvas 
            camera={{ position: [0, 2.5, 5], fov: 50 }} 
            shadows 
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
          >
            <Environment preset="studio" background={false} />
            <ambientLight intensity={0.3} />
            <directionalLight 
              position={[8, 12, 6]} 
              intensity={1.5} 
              castShadow 
              shadow-mapSize={[2048, 2048]}
              shadow-bias={-0.0001}
            >
              <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 0.1, 50]} />
            </directionalLight>
            <directionalLight position={[-5, 8, -5]} intensity={0.4} color="#e0f0ff" />
            <pointLight position={[-4, 4, -4]} intensity={0.3} color="#6495ed" />
            <pointLight position={[4, 3, 4]} intensity={0.25} color="#ffd700" />
            <pointLight position={[0, -2, 0]} intensity={0.15} color="#ffffff" />
            
            {/* Lab bench */}
            {hasTool("labBench") && (
              <group position={[0, -0.6, 0]}>
                <mesh receiveShadow castShadow>
                  <boxGeometry args={[6, 0.12, 3]} />
                  <meshStandardMaterial color="#5d4037" roughness={0.8} />
                </mesh>
                <mesh position={[0, 0, 1.45]}>
                  <boxGeometry args={[6.1, 0.14, 0.08]} />
                  <meshStandardMaterial color="#4e342e" roughness={0.7} />
                </mesh>
                {[[-2.5, -0.55, 1.2], [2.5, -0.55, 1.2], [-2.5, -0.55, -1.2], [2.5, -0.55, -1.2]].map((pos, i) => (
                  <mesh key={i} position={pos as [number, number, number]}>
                    <boxGeometry args={[0.15, 1, 0.15]} />
                    <meshStandardMaterial color="#3e2723" roughness={0.9} />
                  </mesh>
                ))}
              </group>
            )}

            {/* Main Beaker */}
            {hasTool("beaker") && (
              <group position={[0, 0, 0]}>
                <RealisticBeaker3D
                  position={[0, -0.04, 0]}
                  liquidLevel={(chemical1Amount + chemical2Amount) / 150}
                  liquidColor={`#${reactionColor.toString(16).padStart(6, '0')}`}
                  isDamaged={beakerDamaged}
                  isBoiling={heating && temperature > 80}
                  capacity={1000}
                  onSelect={() => selectObject(CHEMISTRY_OBJECTS.beaker)}
                />
                
                {gasProduced && Array.from({ length: 8 }).map((_, i) => (
                  <AnimatedBubble key={i} delay={i * 0.15} />
                ))}

                {precipitate && (
                  <mesh position={[0, -0.45, 0]}>
                    <cylinderGeometry args={[0.35, 0.38, 0.08, 32]} />
                    <meshStandardMaterial color={reactionColor} roughness={0.9} />
                  </mesh>
                )}

                {toxicFumes && <ToxicSmoke intensity={fumeIntensity} />}
                {explosion && <ExplosionEffect onComplete={() => setExplosion(false)} />}
                {violentReaction && (
                  <pointLight position={[0, 0.3, 0]} intensity={3} color="#ff4400" distance={2} />
                )}
              </group>
            )}

            {/* Bunsen Burner */}
            {hasTool("bunsenBurner") && (
              <group position={[0, -0.55, 0]}>
                <RealisticTripod3D position={[0, 0.1, 0]} />
                <RealisticBunsenBurner3D
                  position={[0, -0.4, 0]}
                  isActive={heating}
                  flameIntensity={0.9}
                  flameType={temperature > 60 ? "blue" : "safety"}
                />
              </group>
            )}

            {/* Test Tube Rack */}
            <group position={[-2.2, -0.35, 0]}>
              <mesh>
                <boxGeometry args={[1.2, 0.08, 0.4]} />
                <meshStandardMaterial color="#5d4037" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.25, 0.12]}>
                <boxGeometry args={[1.2, 0.06, 0.08]} />
                <meshStandardMaterial color="#4e342e" roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.25, -0.12]}>
                <boxGeometry args={[1.2, 0.06, 0.08]} />
                <meshStandardMaterial color="#4e342e" roughness={0.7} />
              </mesh>
              <RealisticTestTube3D position={[-0.4, 0.35, 0]} liquidLevel={0.6} liquidColor="#ff6b6b" />
              <RealisticTestTube3D position={[-0.13, 0.35, 0]} liquidLevel={0.4} liquidColor="#4ecdc4" />
              <RealisticTestTube3D position={[0.13, 0.35, 0]} liquidLevel={0.8} liquidColor="#ffe66d" />
              <RealisticTestTube3D position={[0.4, 0.35, 0]} liquidLevel={0.3} liquidColor="#95e1d3" />
            </group>

            {/* Chemical Bottles */}
            <group position={[2, -0.25, -0.5]}>
              <RealisticChemicalBottle3D
                position={[-0.5, 0, 0]}
                chemicalName="HCl"
                chemicalColor="#ffeb3b"
                hazardLevel="extreme"
                fillLevel={0.7}
              />
              <RealisticChemicalBottle3D
                position={[0, 0, 0]}
                chemicalName="NaOH"
                chemicalColor="#03a9f4"
                hazardLevel="high"
                fillLevel={0.8}
              />
              <RealisticChemicalBottle3D
                position={[0.5, 0, 0]}
                chemicalName="H₂O"
                chemicalColor="#87ceeb"
                hazardLevel="low"
                fillLevel={0.9}
              />
            </group>

            {/* pH Meter */}
            <RealisticPHMeter3D
              position={[2.5, 0.1, 0.5]}
              currentPH={currentPH}
              isActive={true}
            />

            {/* Thermometer */}
            <RealisticThermometer3D
              position={[1.5, 0.2, 0.8]}
              rotation={[0, 0, 0.2]}
              temperature={temperature}
            />

            {/* Flask */}
            <RealisticFlask3D
              position={[-1.2, -0.25, 0.8]}
              liquidLevel={0.4}
              liquidColor="#90ee90"
              hasVapor={heating}
            />

            <OrbitControls
              enableZoom={true}
              enablePan={true}
              minDistance={2}
              maxDistance={10}
              maxPolarAngle={Math.PI / 2.1}
            />
          </Canvas>

          {/* Overlay Info */}
          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700">
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <MousePointer className="w-3 h-3" />
              Drag to rotate • Scroll to zoom
            </p>
          </div>

          {/* Danger Alert Overlay */}
          {(beakerDamaged || toxicFumes || explosion || violentReaction) && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-900/90 border-2 border-red-500 rounded-xl px-6 py-3 animate-bounce">
                <p className="text-red-200 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {explosion && "💥 EXPLOSION!"}
                  {toxicFumes && "☠️ TOXIC FUMES!"}
                  {beakerDamaged && !explosion && "⚠️ EQUIPMENT DAMAGED!"}
                  {violentReaction && !explosion && "⚡ VIOLENT REACTION!"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Results */}
        <div className="w-72 bg-slate-800/50 border-l border-slate-700 p-4 overflow-y-auto space-y-4">
          {/* Measurements */}
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              Measurements
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase">Volume</p>
                <p className="text-lg font-bold text-white">{chemical1Amount + chemical2Amount}<span className="text-xs text-slate-400">mL</span></p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase">Temp</p>
                <p className={`text-lg font-bold ${temperature > 50 ? 'text-orange-400' : 'text-white'}`}>{temperature}<span className="text-xs text-slate-400">°C</span></p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase">pH Level</p>
                <p className={`text-lg font-bold ${
                  currentPH < 4 ? 'text-red-400' : 
                  currentPH > 10 ? 'text-purple-400' : 
                  'text-green-400'
                }`}>{currentPH.toFixed(1)}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase">State</p>
                <p className="text-lg font-bold text-white">
                  {gasProduced ? "↑" : precipitate ? "↓" : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Observations */}
          {observations.length > 0 && (
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Observations
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {observations.map((obs, idx) => (
                  <div key={idx} className="text-xs text-slate-300 bg-slate-800/50 rounded-lg p-2">
                    {obs}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Info */}
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
            <h3 className="text-xs font-semibold text-slate-400 mb-2">Safety Legend</h3>
            <div className="text-[10px] text-slate-500 space-y-1">
              <p>⚠️ Corrosive - Burns skin/eyes</p>
              <p>☠️ Toxic - Poisonous if inhaled</p>
              <p>💥 Explosive - Violent reaction</p>
              <p>🔥 Flammable - Fire hazard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
