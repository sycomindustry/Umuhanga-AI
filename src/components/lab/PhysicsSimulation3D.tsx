import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, Environment } from "@react-three/drei";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Battery, 
  Lightbulb, 
  Cable, 
  MousePointer, 
  Package,
  Play,
  Pause,
  RotateCcw,
  Circle,
  ArrowRight,
  Gauge,
  Target,
  GraduationCap,
  Trophy
} from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";
import { useLabObjectSelection, PHYSICS_OBJECTS } from "@/hooks/useLabObjectSelection";
import { ObjectInfoPanel } from "./ObjectInfoPanel";
import { ToolPalette } from "./ToolPalette";
import { useLabTools } from "@/hooks/useLabTools";
import { LabTutorial } from "./LabTutorial";
import { AchievementBadge, AchievementUnlockPopup, AchievementsPanel } from "./AchievementDisplay";
import { useAchievements } from "@/hooks/useAchievements";

// ============ PENDULUM SIMULATION ============
interface PendulumProps {
  length: number;
  angle: number;
  isRunning: boolean;
  damping: number;
  gravity: number;
}

function Pendulum3D({ length, angle, isRunning, damping, gravity }: PendulumProps) {
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(angle * Math.PI / 180);
  const velocityRef = useRef(0);
  
  useEffect(() => {
    angleRef.current = angle * Math.PI / 180;
    velocityRef.current = 0;
  }, [angle]);
  
  useFrame((_, delta) => {
    if (groupRef.current && isRunning) {
      const acceleration = -(gravity / length) * Math.sin(angleRef.current) - damping * velocityRef.current;
      velocityRef.current += acceleration * delta;
      angleRef.current += velocityRef.current * delta;
      groupRef.current.rotation.z = angleRef.current;
    }
  });
  
  return (
    <group position={[0, 2, 0]}>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
      </mesh>
      
      <group ref={groupRef}>
        <mesh position={[0, -length / 2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, length, 8]} />
          <meshStandardMaterial color="#718096" metalness={0.6} />
        </mesh>
        
        <mesh position={[0, -length, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial 
            color="#e53e3e" 
            metalness={0.7} 
            roughness={0.3}
            emissive="#e53e3e"
            emissiveIntensity={0.1}
          />
        </mesh>
      </group>
      
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 0.1, 0.3]} />
        <meshStandardMaterial color="#2d3748" metalness={0.5} />
      </mesh>
      <mesh position={[-0.7, 0.25, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.2]} />
        <meshStandardMaterial color="#2d3748" metalness={0.5} />
      </mesh>
      <mesh position={[0.7, 0.25, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.2]} />
        <meshStandardMaterial color="#2d3748" metalness={0.5} />
      </mesh>
    </group>
  );
}

// ============ PROJECTILE MOTION ============
interface ProjectileProps {
  launchAngle: number;
  initialVelocity: number;
  isLaunched: boolean;
  onLand: (distance: number, maxHeight: number) => void;
}

function ProjectileMotion3D({ launchAngle, initialVelocity, isLaunched, onLand }: ProjectileProps) {
  const ballRef = useRef<THREE.Mesh>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ vx: 0, vy: 0 });
  const timeRef = useRef(0);
  const maxHeightRef = useRef(0);
  const hasLanded = useRef(false);
  const trailRef = useRef<THREE.Vector3[]>([]);
  
  const g = 9.81;
  
  useEffect(() => {
    if (isLaunched) {
      const angleRad = launchAngle * Math.PI / 180;
      velRef.current = {
        vx: initialVelocity * Math.cos(angleRad),
        vy: initialVelocity * Math.sin(angleRad)
      };
      posRef.current = { x: 0, y: 0.2 };
      timeRef.current = 0;
      maxHeightRef.current = 0;
      trailRef.current = [];
      hasLanded.current = false;
    }
  }, [isLaunched, launchAngle, initialVelocity]);
  
  useFrame((_, delta) => {
    if (ballRef.current && isLaunched && !hasLanded.current) {
      velRef.current.vy -= g * delta;
      posRef.current.x += velRef.current.vx * delta;
      posRef.current.y += velRef.current.vy * delta;
      
      if (posRef.current.y > maxHeightRef.current) {
        maxHeightRef.current = posRef.current.y;
      }
      
      ballRef.current.position.set(posRef.current.x, posRef.current.y, 0);
      trailRef.current.push(new THREE.Vector3(posRef.current.x, posRef.current.y, 0));
      
      if (posRef.current.y <= 0 && timeRef.current > 0.1) {
        hasLanded.current = true;
        onLand(posRef.current.x, maxHeightRef.current);
      }
      
      timeRef.current += delta;
    }
  });
  
  return (
    <group position={[-3, 0, 0]}>
      <mesh position={[5, -0.05, 0]} receiveShadow>
        <boxGeometry args={[12, 0.1, 3]} />
        <meshStandardMaterial color="#4a7c59" />
      </mesh>
      
      {[0, 2, 4, 6, 8, 10].map((d) => (
        <group key={d} position={[d, 0, 1.5]}>
          <mesh>
            <boxGeometry args={[0.05, 0.2, 0.05]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <Html position={[0, 0.3, 0]} center>
            <div className="text-xs bg-background/80 px-1 rounded">{d}m</div>
          </Html>
        </group>
      ))}
      
      <group rotation={[0, 0, launchAngle * Math.PI / 180]}>
        <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.2, 0.8, 16]} />
          <meshStandardMaterial color="#4a5568" metalness={0.7} />
        </mesh>
      </group>
      
      <mesh ref={ballRef} position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial 
          color="#e53e3e" 
          metalness={0.5}
          emissive="#e53e3e"
          emissiveIntensity={isLaunched ? 0.3 : 0}
        />
      </mesh>
      
      <Html position={[0.8, 0.5, 0]} center>
        <div className="bg-background/90 px-2 py-1 rounded text-xs font-bold">
          {launchAngle}°
        </div>
      </Html>
    </group>
  );
}

// ============ CIRCUIT COMPONENTS ============
interface SelectableProps {
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}

interface BatteryProps extends SelectableProps {
  position: [number, number, number];
  voltage: number;
}

function Battery3D({ position, voltage, isSelected, isHovered, onSelect, onHover }: BatteryProps) {
  return (
    <group 
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); onHover(false); document.body.style.cursor = "auto"; }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {(isSelected || isHovered) && (
        <mesh scale={1.3}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshBasicMaterial color={isSelected ? 0x00ff00 : 0xffff00} transparent opacity={0.2} />
        </mesh>
      )}
      
      <mesh>
        <boxGeometry args={[0.4, 0.8, 0.4]} />
        <meshStandardMaterial color={0x1a1a1a} metalness={0.3} roughness={0.7} />
      </mesh>
      
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
        <meshStandardMaterial color={0xd4af37} metalness={0.9} roughness={0.1} />
      </mesh>
      
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color={0x888888} metalness={0.8} roughness={0.2} />
      </mesh>
      
      <Html position={[0, 0, 0.3]} center>
        <div className="bg-background/90 px-2 py-1 rounded text-xs font-mono font-bold">{voltage}V</div>
      </Html>
    </group>
  );
}

interface BulbProps extends SelectableProps {
  position: [number, number, number];
  brightness: number;
  isOn: boolean;
}

function Bulb3D({ position, brightness, isOn, isSelected, isHovered, onSelect, onHover }: BulbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && isOn) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.02);
    }
  });
  
  return (
    <group 
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); onHover(false); document.body.style.cursor = "auto"; }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {(isSelected || isHovered) && (
        <mesh scale={1.5}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshBasicMaterial color={isSelected ? 0x00ff00 : 0xffff00} transparent opacity={0.2} />
        </mesh>
      )}
      
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshPhysicalMaterial
          color={isOn ? 0xffff00 : 0xcccccc}
          transparent
          opacity={0.8}
          emissive={isOn ? 0xffff00 : 0x000000}
          emissiveIntensity={brightness / 100}
        />
      </mesh>
      
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.3, 16]} />
        <meshStandardMaterial color={0x888888} metalness={0.8} roughness={0.3} />
      </mesh>
      
      {isOn && <pointLight color={0xffff88} intensity={brightness / 20} distance={5} />}
    </group>
  );
}

function Wire({ start, end, isActive }: { start: [number, number, number]; end: [number, number, number]; isActive: boolean }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ 
      color: isActive ? 0xff0000 : 0x666666,
      linewidth: 3
    }))} />
  );
}

function Resistor({ position, isSelected, isHovered, onSelect, onHover }: SelectableProps & { position: [number, number, number] }) {
  return (
    <group 
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); onHover(false); document.body.style.cursor = "auto"; }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {(isSelected || isHovered) && (
        <mesh scale={1.5}>
          <cylinderGeometry args={[0.12, 0.12, 0.5, 16]} />
          <meshBasicMaterial color={isSelected ? 0x00ff00 : 0xffff00} transparent opacity={0.2} />
        </mesh>
      )}
      
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
        <meshStandardMaterial color={0xd2691e} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.05, 16]} />
        <meshStandardMaterial color={0xffff00} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.05, 16]} />
        <meshStandardMaterial color={0xff0000} />
      </mesh>
    </group>
  );
}

function CircuitBoard({ burned }: { burned: boolean }) {
  return (
    <mesh position={[0, -1, 0]} receiveShadow>
      <boxGeometry args={[5, 0.1, 3]} />
      <meshStandardMaterial 
        color={burned ? 0x1a0d00 : 0x2e7d32} 
        roughness={0.9}
        emissive={burned ? 0x331100 : 0x000000}
        emissiveIntensity={burned ? 0.3 : 0}
      />
    </mesh>
  );
}

function Sparks({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.z = state.clock.elapsedTime * 5;
  });
  
  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[Math.cos(i) * 0.2, Math.sin(i) * 0.2, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={0xffff00} emissive={0xffaa00} emissiveIntensity={3} />
        </mesh>
      ))}
      <pointLight color={0xffff00} intensity={3} distance={2} />
    </group>
  );
}

function Fire({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 15) * 0.3;
      meshRef.current.scale.x = 0.8 + Math.sin(state.clock.elapsedTime * 12) * 0.2;
    }
  });
  
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <coneGeometry args={[0.3, 0.8, 8]} />
        <meshStandardMaterial color={0xff4400} emissive={0xff2200} emissiveIntensity={3} transparent opacity={0.8} />
      </mesh>
      <pointLight color={0xff4400} intensity={4} distance={3} />
    </group>
  );
}

function Smoke({ position, intensity }: { position: [number, number, number]; intensity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.3;
  });
  
  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: Math.floor(intensity * 5) }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i * 0.5) * 0.2, i * 0.3, Math.cos(i * 0.5) * 0.2]}>
          <sphereGeometry args={[0.2 + i * 0.05, 16, 16]} />
          <meshStandardMaterial color={0x444444} transparent opacity={0.4 - i * 0.06} />
        </mesh>
      ))}
    </group>
  );
}

// ============ MAIN COMPONENT ============
interface PhysicsSimulation3DProps {
  experimentType: string;
  onDataChange?: (data: any) => void;
  onAIRequest?: (state: any, action: string) => void;
}

export function PhysicsSimulation3D({
  experimentType,
  onDataChange,
  onAIRequest,
}: PhysicsSimulation3DProps) {
  const [activeExperiment, setActiveExperiment] = useState<"pendulum" | "circuit" | "projectile">("pendulum");
  const [isRunning, setIsRunning] = useState(false);
  
  // Pendulum state
  const [pendulumLength, setPendulumLength] = useState(1.5);
  const [pendulumAngle, setPendulumAngle] = useState(45);
  const [damping, setDamping] = useState(0.1);
  const [gravity, setGravity] = useState(9.81);
  
  // Circuit state
  const [voltage, setVoltage] = useState(9);
  const [resistance, setResistance] = useState(10);
  const [circuitClosed, setCircuitClosed] = useState(false);
  const [multimeterMode, setMultimeterMode] = useState<"voltage" | "current" | "resistance">("voltage");
  
  // Circuit danger states
  const [shortCircuit, setShortCircuit] = useState(false);
  const [componentBurned, setComponentBurned] = useState(false);
  const [wireMelted, setWireMelted] = useState(false);
  const [fire, setFire] = useState(false);
  const [smoking, setSmoking] = useState(false);
  const [sparking, setSparking] = useState(false);
  const [circuitDamaged, setCircuitDamaged] = useState(false);
  const [safetyWarning, setSafetyWarning] = useState("");
  
  // Projectile state
  const [launchAngle, setLaunchAngle] = useState(45);
  const [initialVelocity, setInitialVelocity] = useState(10);
  const [isLaunched, setIsLaunched] = useState(false);
  const [projectileResults, setProjectileResults] = useState<{distance: number, maxHeight: number} | null>(null);
  
  // Tutorial & Achievement states
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [tutorialAction, setTutorialAction] = useState<string | undefined>();
  const { achievements, recentUnlock, unlockAchievement, incrementProgress, clearRecentUnlock } = useAchievements();
  
  // Object selection
  const { selectedObject, hoveredObject, selectObject, hoverObject, clearSelection } = useLabObjectSelection();
  const { selectedTools, toggleTool, hasTool } = useLabTools(["battery", "bulb", "resistor", "wire", "circuitBoard"]);
  const [showToolPalette, setShowToolPalette] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") clearSelection(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearSelection]);
  
  // Calculations
  const pendulumPeriod = 2 * Math.PI * Math.sqrt(pendulumLength / gravity);
  const current = circuitClosed ? voltage / resistance : 0;
  const power = voltage * current;
  const brightness = Math.min(100, (power / 10) * 100);
  
  const angleRad = launchAngle * Math.PI / 180;
  const theoreticalRange = (initialVelocity ** 2 * Math.sin(2 * angleRad)) / 9.81;
  const theoreticalMaxHeight = (initialVelocity ** 2 * Math.sin(angleRad) ** 2) / (2 * 9.81);
  const flightTime = (2 * initialVelocity * Math.sin(angleRad)) / 9.81;
  
  const checkSafety = useCallback((v: number, r: number, closed: boolean) => {
    if (!closed) return;
    const i = r > 0 ? v / r : 0;
    const p = v * i;
    
    if (r < 2 && v > 6) {
      setShortCircuit(true);
      setSparking(true);
      setFire(true);
      setCircuitDamaged(true);
      setSafetyWarning("⚠️ SHORT CIRCUIT!");
      toast.error("💥 SHORT CIRCUIT!");
      setTimeout(() => { setSparking(false); setFire(false); }, 3000);
    } else if (i > 8) {
      setWireMelted(true);
      setSmoking(true);
      setFire(true);
      setCircuitDamaged(true);
      setSafetyWarning("🔥 WIRE MELTING!");
      toast.error("🔥 FIRE HAZARD!");
      setTimeout(() => setFire(false), 3000);
    } else if (p > 80) {
      setComponentBurned(true);
      setSparking(true);
      setSmoking(true);
      setCircuitDamaged(true);
      setSafetyWarning("💥 COMPONENT DESTROYED!");
      toast.error("💥 COMPONENT EXPLODED!");
      setTimeout(() => setSparking(false), 2000);
    } else if (i > 5) {
      setSmoking(true);
      setSafetyWarning("⚠️ WARNING: Current exceeds 5A!");
    } else if (v > 12) {
      setSafetyWarning("⚠️ CAUTION: High voltage!");
    } else {
      setSafetyWarning("");
      setSmoking(false);
    }
  }, []);
  
  const handleProjectileLand = useCallback((distance: number, maxHeight: number) => {
    setProjectileResults({ distance, maxHeight });
    setIsLaunched(false);
    toast.success(`Landed at ${distance.toFixed(2)}m!`);
  }, []);
  
  const resetExperiment = () => {
    setIsRunning(false);
    setIsLaunched(false);
    setProjectileResults(null);
    setCircuitClosed(false);
    setShortCircuit(false);
    setComponentBurned(false);
    setWireMelted(false);
    setFire(false);
    setSmoking(false);
    setSparking(false);
    setCircuitDamaged(false);
    setSafetyWarning("");
    toast.info("Experiment reset");
  };
  
  const handleTutorialComplete = useCallback(() => {
    setShowTutorial(false);
    unlockAchievement("physics_tutorial");
    toast.success("🎓 Physics tutorial completed!");
  }, [unlockAchievement]);
  
  return (
    <div className="w-full h-full min-h-[700px] flex flex-col bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 rounded-xl overflow-hidden border border-indigo-800 shadow-2xl">
      {/* Tutorial */}
      {showTutorial && (
        <LabTutorial
          labType="physics"
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
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-900/80 border-b border-indigo-700 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Physics Laboratory</h2>
            <p className="text-xs text-indigo-300">Motion, circuits & mechanics</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTutorial(true)}
            className="gap-2 border-indigo-600 text-indigo-300 hover:bg-indigo-800"
          >
            <GraduationCap className="w-4 h-4" />
            Tutorial
          </Button>
          <AchievementBadge onClick={() => setShowAchievements(true)} />
          {circuitDamaged && activeExperiment === "circuit" && (
            <Badge variant="destructive" className="animate-pulse">
              ⚡ CIRCUIT DAMAGED
            </Badge>
          )}
        </div>
      </div>

      {/* Experiment Tabs */}
      <div className="flex bg-indigo-900/50 border-b border-indigo-700">
        {[
          { id: "pendulum", icon: Circle, label: "Pendulum" },
          { id: "circuit", icon: Zap, label: "Circuit" },
          { id: "projectile", icon: Target, label: "Projectile" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveExperiment(tab.id as typeof activeExperiment); resetExperiment(); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all ${
              activeExperiment === tab.id 
                ? 'bg-indigo-600 text-white border-b-2 border-yellow-400' 
                : 'text-indigo-300 hover:bg-indigo-800/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-80 bg-indigo-900/30 border-r border-indigo-700 p-4 overflow-y-auto space-y-4">
          {/* PENDULUM CONTROLS */}
          {activeExperiment === "pendulum" && (
            <>
              <div className="bg-indigo-800/30 rounded-xl p-4 border border-indigo-600">
                <h3 className="text-sm font-semibold text-indigo-200 mb-3">⚙️ Settings</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-indigo-300">Length</span>
                      <span className="text-xs font-bold text-white">{pendulumLength.toFixed(1)}m</span>
                    </div>
                    <Slider value={[pendulumLength]} onValueChange={([v]) => setPendulumLength(v)} min={0.5} max={3} step={0.1} disabled={isRunning} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-indigo-300">Initial Angle</span>
                      <span className="text-xs font-bold text-white">{pendulumAngle}°</span>
                    </div>
                    <Slider value={[pendulumAngle]} onValueChange={([v]) => setPendulumAngle(v)} min={5} max={90} step={5} disabled={isRunning} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-indigo-300">Damping</span>
                      <span className="text-xs font-bold text-white">{damping.toFixed(2)}</span>
                    </div>
                    <Slider value={[damping]} onValueChange={([v]) => setDamping(v)} min={0} max={0.5} step={0.01} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-indigo-300">Gravity</span>
                      <span className="text-xs font-bold text-white">{gravity.toFixed(1)} m/s²</span>
                    </div>
                    <Slider value={[gravity]} onValueChange={([v]) => setGravity(v)} min={1} max={20} step={0.1} />
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => setIsRunning(!isRunning)} 
                className={`w-full ${isRunning ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isRunning ? "Pause" : "Start"}
              </Button>
              <Button variant="outline" onClick={resetExperiment} className="w-full border-indigo-600 text-indigo-300 hover:bg-indigo-800">
                <RotateCcw className="w-4 h-4 mr-2" />Reset
              </Button>
            </>
          )}

          {/* CIRCUIT CONTROLS */}
          {activeExperiment === "circuit" && (
            <>
              {safetyWarning && (
                <div className="p-3 bg-red-500/20 rounded-xl border-2 border-red-500 animate-pulse">
                  <p className="text-sm font-semibold text-red-400">{safetyWarning}</p>
                </div>
              )}
              
              <Button 
                onClick={() => { if (!circuitDamaged) { setCircuitClosed(!circuitClosed); checkSafety(voltage, resistance, !circuitClosed); } }}
                className={`w-full ${circuitClosed ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                disabled={circuitDamaged}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {circuitClosed ? "Open Circuit" : "Close Circuit"}
              </Button>
              
              <div className="bg-indigo-800/30 rounded-xl p-4 border border-indigo-600">
                <h3 className="text-sm font-semibold text-indigo-200 mb-3 flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Power Source
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-indigo-300">Voltage</span>
                      <span className="text-xs font-bold text-yellow-400">{voltage}V</span>
                    </div>
                    <Slider value={[voltage]} onValueChange={([v]) => { if (!circuitDamaged) { setVoltage(v); checkSafety(v, resistance, circuitClosed); } }} min={1} max={15} step={1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-indigo-300">Resistance</span>
                      <span className="text-xs font-bold text-cyan-400">{resistance}Ω</span>
                    </div>
                    <Slider value={[resistance]} onValueChange={([v]) => { if (!circuitDamaged) { setResistance(v); checkSafety(voltage, v, circuitClosed); } }} min={1} max={50} step={1} />
                  </div>
                </div>
              </div>
              
              {/* Multimeter */}
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-600">
                <h3 className="text-xs text-slate-400 mb-2">Digital Multimeter</h3>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {["voltage", "current", "resistance"].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setMultimeterMode(mode as typeof multimeterMode)}
                      className={`py-1 rounded text-xs font-bold ${
                        multimeterMode === mode 
                          ? 'bg-yellow-500 text-black' 
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {mode === "voltage" ? "V" : mode === "current" ? "A" : "Ω"}
                    </button>
                  ))}
                </div>
                <div className="bg-black rounded p-3 text-center font-mono text-xl text-green-400 border border-green-500/30">
                  {multimeterMode === "voltage" && `${voltage.toFixed(2)} V`}
                  {multimeterMode === "current" && `${current.toFixed(3)} A`}
                  {multimeterMode === "resistance" && `${resistance.toFixed(1)} Ω`}
                </div>
              </div>

              {circuitDamaged && (
                <Button onClick={resetExperiment} variant="destructive" className="w-full">
                  🔧 Repair Circuit
                </Button>
              )}
            </>
          )}

          {/* PROJECTILE CONTROLS */}
          {activeExperiment === "projectile" && (
            <>
              <div className="bg-indigo-800/30 rounded-xl p-4 border border-indigo-600">
                <h3 className="text-sm font-semibold text-indigo-200 mb-3">🎯 Launch Settings</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-indigo-300">Launch Angle</span>
                      <span className="text-xs font-bold text-white">{launchAngle}°</span>
                    </div>
                    <Slider value={[launchAngle]} onValueChange={([v]) => setLaunchAngle(v)} min={5} max={85} step={5} disabled={isLaunched} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-indigo-300">Initial Velocity</span>
                      <span className="text-xs font-bold text-white">{initialVelocity} m/s</span>
                    </div>
                    <Slider value={[initialVelocity]} onValueChange={([v]) => setInitialVelocity(v)} min={5} max={25} step={1} disabled={isLaunched} />
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => { setProjectileResults(null); setIsLaunched(true); }} 
                disabled={isLaunched}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Launch!
              </Button>
              <Button variant="outline" onClick={resetExperiment} className="w-full border-indigo-600 text-indigo-300 hover:bg-indigo-800">
                <RotateCcw className="w-4 h-4 mr-2" />Reset
              </Button>
            </>
          )}
        </div>

        {/* Center - 3D Canvas */}
        <div className="flex-1 relative">
          <Canvas camera={{ position: activeExperiment === "projectile" ? [2, 3, 8] : [0, 2, 6], fov: 50 }} shadows>
            <Environment preset="studio" background={false} />
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
            
            {activeExperiment === "pendulum" && (
              <Pendulum3D length={pendulumLength} angle={pendulumAngle} isRunning={isRunning} damping={damping} gravity={gravity} />
            )}
            
            {activeExperiment === "circuit" && (
              <>
                {hasTool("circuitBoard") && <CircuitBoard burned={circuitDamaged} />}
                {hasTool("battery") && (
                  <Battery3D position={[-1.5, 0, 0]} voltage={voltage} isSelected={selectedObject?.id === "battery"} isHovered={hoveredObject === "battery"} onSelect={() => selectObject(PHYSICS_OBJECTS.battery)} onHover={(h) => hoverObject(h ? "battery" : null)} />
                )}
                {hasTool("bulb") && (
                  <Bulb3D position={[1.5, 0, 0]} brightness={componentBurned ? 0 : brightness} isOn={circuitClosed && !componentBurned} isSelected={selectedObject?.id === "bulb"} isHovered={hoveredObject === "bulb"} onSelect={() => selectObject(PHYSICS_OBJECTS.bulb)} onHover={(h) => hoverObject(h ? "bulb" : null)} />
                )}
                {hasTool("resistor") && (
                  <Resistor position={[0, 0, -0.8]} isSelected={selectedObject?.id === "resistor"} isHovered={hoveredObject === "resistor"} onSelect={() => selectObject(PHYSICS_OBJECTS.resistor)} onHover={(h) => hoverObject(h ? "resistor" : null)} />
                )}
                {hasTool("wire") && (
                  <>
                    <Wire start={[-1.5, 0.5, 0]} end={[0, 0.2, -0.8]} isActive={circuitClosed && !wireMelted} />
                    <Wire start={[0, -0.2, -0.8]} end={[1.5, 0.5, 0]} isActive={circuitClosed && !wireMelted} />
                    <Wire start={[1.5, -0.5, 0]} end={[-1.5, -0.5, 0]} isActive={circuitClosed && !wireMelted} />
                  </>
                )}
                {sparking && <Sparks position={[0, 0, -0.8]} />}
                {fire && <Fire position={[0, 0.3, -0.8]} />}
                {smoking && <Smoke position={[0, 0.5, -0.8]} intensity={0.8} />}
              </>
            )}
            
            {activeExperiment === "projectile" && (
              <ProjectileMotion3D launchAngle={launchAngle} initialVelocity={initialVelocity} isLaunched={isLaunched} onLand={handleProjectileLand} />
            )}
            
            <OrbitControls enableZoom enablePan minDistance={3} maxDistance={15} />
          </Canvas>

          {/* Overlay Info */}
          <div className="absolute bottom-4 left-4 bg-indigo-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-indigo-700">
            <p className="text-xs text-indigo-300 flex items-center gap-2">
              <MousePointer className="w-3 h-3" />
              Drag to rotate • Scroll to zoom
            </p>
          </div>

          {/* Object Info Panel */}
          {selectedObject && (
            <ObjectInfoPanel object={selectedObject} onClose={clearSelection} />
          )}

          {/* Danger Alert Overlay */}
          {circuitDamaged && activeExperiment === "circuit" && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-900/90 border-2 border-red-500 rounded-xl px-6 py-3 animate-bounce">
                <p className="text-red-200 font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {shortCircuit && "⚡ SHORT CIRCUIT!"}
                  {wireMelted && "🔥 WIRE MELTED!"}
                  {componentBurned && "💥 COMPONENT DESTROYED!"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Results */}
        <div className="w-72 bg-indigo-900/30 border-l border-indigo-700 p-4 overflow-y-auto space-y-4">
          {/* PENDULUM RESULTS */}
          {activeExperiment === "pendulum" && (
            <>
              <div className="bg-indigo-800/30 rounded-xl p-4 border border-indigo-600">
                <h3 className="text-sm font-semibold text-indigo-200 mb-3 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  Measurements
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-indigo-400 uppercase">Period</p>
                    <p className="text-lg font-bold text-white">{pendulumPeriod.toFixed(2)}<span className="text-xs text-indigo-400">s</span></p>
                  </div>
                  <div className="bg-indigo-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-indigo-400 uppercase">Frequency</p>
                    <p className="text-lg font-bold text-white">{(1 / pendulumPeriod).toFixed(2)}<span className="text-xs text-indigo-400">Hz</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-800/30 rounded-xl p-4 border border-indigo-600">
                <h3 className="text-xs font-semibold text-indigo-400 mb-2">Formula</h3>
                <div className="bg-black rounded p-2 font-mono text-green-400 text-sm text-center">
                  T = 2π√(L/g)
                </div>
                <p className="text-[10px] text-indigo-500 mt-2">Period depends only on length and gravity!</p>
              </div>
            </>
          )}

          {/* CIRCUIT RESULTS */}
          {activeExperiment === "circuit" && (
            <>
              <div className="bg-indigo-800/30 rounded-xl p-4 border border-indigo-600">
                <h3 className="text-sm font-semibold text-indigo-200 mb-3">📊 Circuit Analysis</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-indigo-400 uppercase">Power</p>
                    <p className={`text-lg font-bold ${power > 50 ? 'text-red-400' : 'text-white'}`}>{power.toFixed(2)}<span className="text-xs text-indigo-400">W</span></p>
                  </div>
                  <div className="bg-indigo-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-indigo-400 uppercase">Current</p>
                    <p className={`text-lg font-bold ${current > 5 ? 'text-red-400' : 'text-white'}`}>{current.toFixed(3)}<span className="text-xs text-indigo-400">A</span></p>
                  </div>
                  <div className="bg-indigo-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-indigo-400 uppercase">Brightness</p>
                    <p className="text-lg font-bold text-yellow-400">{brightness.toFixed(0)}<span className="text-xs text-indigo-400">%</span></p>
                  </div>
                  <div className="bg-indigo-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-indigo-400 uppercase">Status</p>
                    <p className="text-sm font-bold text-white">{circuitClosed ? "ON" : "OFF"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-800/30 rounded-xl p-4 border border-indigo-600">
                <h3 className="text-xs font-semibold text-indigo-400 mb-2">Ohm's Law</h3>
                <div className="bg-black rounded p-2 font-mono text-green-400 text-sm text-center">
                  V = I × R
                </div>
                <p className="text-[10px] text-indigo-500 mt-2">Power (P) = Voltage × Current</p>
              </div>
            </>
          )}

          {/* PROJECTILE RESULTS */}
          {activeExperiment === "projectile" && (
            <>
              <div className="bg-indigo-800/30 rounded-xl p-4 border border-indigo-600">
                <h3 className="text-sm font-semibold text-indigo-200 mb-3">📐 Theoretical</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-indigo-400 uppercase">Range</p>
                    <p className="text-lg font-bold text-white">{theoreticalRange.toFixed(2)}<span className="text-xs text-indigo-400">m</span></p>
                  </div>
                  <div className="bg-indigo-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-indigo-400 uppercase">Max Height</p>
                    <p className="text-lg font-bold text-white">{theoreticalMaxHeight.toFixed(2)}<span className="text-xs text-indigo-400">m</span></p>
                  </div>
                  <div className="bg-indigo-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-indigo-400 uppercase">Flight Time</p>
                    <p className="text-lg font-bold text-white">{flightTime.toFixed(2)}<span className="text-xs text-indigo-400">s</span></p>
                  </div>
                  <div className="bg-indigo-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-indigo-400 uppercase">Optimal</p>
                    <p className="text-lg font-bold text-yellow-400">45°</p>
                  </div>
                </div>
              </div>

              {projectileResults && (
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500">
                  <h3 className="text-sm font-semibold text-green-400 mb-3">🎯 Results</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-green-300">Distance</p>
                      <p className="text-xl font-bold text-white">{projectileResults.distance.toFixed(2)}m</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-green-300">Max Height</p>
                      <p className="text-xl font-bold text-white">{projectileResults.maxHeight.toFixed(2)}m</p>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <Badge variant={Math.abs(projectileResults.distance - theoreticalRange) < 0.5 ? "default" : "secondary"}>
                      {((projectileResults.distance / theoreticalRange) * 100).toFixed(0)}% accuracy
                    </Badge>
                  </div>
                </div>
              )}

              <div className="bg-indigo-800/30 rounded-xl p-4 border border-indigo-600">
                <h3 className="text-xs font-semibold text-indigo-400 mb-2">Formula</h3>
                <div className="bg-black rounded p-2 font-mono text-green-400 text-sm text-center">
                  R = v²sin(2θ)/g
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
