import { useState, useCallback, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Text } from "@react-three/drei";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Atom, Play, Pause, RotateCcw, Plus, Zap, 
  ArrowDown, Gauge, Thermometer, BookOpen
} from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";
import { LabNotebook } from "./LabNotebook";

// Physics equipment types
interface PhysicsObject {
  id: string;
  type: 'ramp' | 'ball' | 'spring' | 'pendulum' | 'pulley' | 'weight' | 'magnet' | 'lens';
  position: [number, number, number];
  velocity: [number, number, number];
  mass: number;
  color: string;
  label: string;
  properties: Record<string, number>;
}

// 3D Ball with physics
function PhysicsBall({ position, color, radius = 0.15, isSelected, onClick, velocity }: {
  position: [number, number, number];
  color: string;
  radius?: number;
  isSelected?: boolean;
  onClick?: () => void;
  velocity?: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
    }
  });

  return (
    <mesh ref={meshRef} position={position} onClick={onClick} castShadow>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.3} 
        roughness={0.4}
        emissive={isSelected ? color : '#000000'}
        emissiveIntensity={isSelected ? 0.3 : 0}
      />
      {isSelected && (
        <mesh scale={[1.2, 1.2, 1.2]}>
          <sphereGeometry args={[radius, 16, 16]} />
          <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.3} />
        </mesh>
      )}
    </mesh>
  );
}

// Ramp
function PhysicsRamp({ position, angle = 30, length = 2, isSelected, onClick }: {
  position: [number, number, number];
  angle?: number;
  length?: number;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const rampAngle = (angle * Math.PI) / 180;
  return (
    <group position={position} onClick={onClick}>
      <mesh rotation={[0, 0, -rampAngle]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.08, 0.8]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.7}
          emissive={isSelected ? '#8B4513' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
      {/* Support */}
      <mesh position={[-length/2 * Math.cos(rampAngle), -0.3, 0]}>
        <boxGeometry args={[0.08, 0.6, 0.6]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
    </group>
  );
}

// Pendulum
function PhysicsPendulum({ position, angle, length = 1.5, isSelected, onClick }: {
  position: [number, number, number];
  angle: number;
  length?: number;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const pendRef = useRef<THREE.Group>(null);
  const angleRef = useRef(angle);
  const velocityRef = useRef(0);
  
  useFrame((_, delta) => {
    const g = 9.81;
    const damping = 0.995;
    const accel = -(g / length) * Math.sin(angleRef.current);
    velocityRef.current += accel * delta;
    velocityRef.current *= damping;
    angleRef.current += velocityRef.current * delta;
    
    if (pendRef.current) {
      pendRef.current.rotation.z = angleRef.current;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      {/* Support bar */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1, 0.1, 0.1]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
      {/* Pendulum arm + bob */}
      <group ref={pendRef}>
        <mesh position={[0, -length / 2, 0]}>
          <cylinderGeometry args={[0.01, 0.01, length, 8]} />
          <meshStandardMaterial color="#888" />
        </mesh>
        <mesh position={[0, -length, 0]} castShadow>
          <sphereGeometry args={[0.12, 32, 32]} />
          <meshStandardMaterial 
            color="#c0392b" 
            metalness={0.6} 
            roughness={0.3}
            emissive={isSelected ? '#c0392b' : '#000'}
            emissiveIntensity={isSelected ? 0.4 : 0}
          />
        </mesh>
      </group>
    </group>
  );
}

// Spring with weight
function PhysicsSpring({ position, stretch = 0, mass = 1, isSelected, onClick }: {
  position: [number, number, number];
  stretch?: number;
  mass?: number;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const stretchRef = useRef(stretch);
  const velRef = useRef(0);
  const k = 20; // spring constant

  useFrame((_, delta) => {
    const g = 9.81;
    const equilibrium = (mass * g) / k;
    const accel = -k * (stretchRef.current - equilibrium) / mass - 0.3 * velRef.current;
    velRef.current += accel * delta;
    stretchRef.current += velRef.current * delta;
    
    if (groupRef.current) {
      groupRef.current.position.y = -stretchRef.current;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      {/* Support */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.6, 0.08, 0.3]} />
        <meshStandardMaterial color="#444" metalness={0.8} />
      </mesh>
      <group ref={groupRef}>
        {/* Spring coils */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[Math.sin(i * 0.8) * 0.06, 0.4 - i * 0.08, Math.cos(i * 0.8) * 0.06]}>
            <torusGeometry args={[0.06, 0.01, 8, 16]} />
            <meshStandardMaterial color="#aaa" metalness={0.9} />
          </mesh>
        ))}
        {/* Weight */}
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial 
            color="#2980b9" 
            metalness={0.5}
            emissive={isSelected ? '#2980b9' : '#000'}
            emissiveIntensity={isSelected ? 0.3 : 0}
          />
          <Html position={[0, -0.2, 0]} center>
            <span className="text-[8px] text-white bg-black/60 px-1 rounded">{mass}kg</span>
          </Html>
        </mesh>
      </group>
    </group>
  );
}

const EQUIPMENT_CATALOG = [
  { id: 'ball', label: 'Ball', icon: '⚽', type: 'ball' as const, color: '#e74c3c' },
  { id: 'ramp', label: 'Ramp', icon: '📐', type: 'ramp' as const, color: '#8B4513' },
  { id: 'pendulum', label: 'Pendulum', icon: '🔔', type: 'pendulum' as const, color: '#c0392b' },
  { id: 'spring', label: 'Spring + Weight', icon: '🔩', type: 'spring' as const, color: '#2980b9' },
];

export function InteractivePhysicsLab() {
  const [objects, setObjects] = useState<PhysicsObject[]>([
    { id: 'pendulum-1', type: 'pendulum', position: [0, 2, 0], velocity: [0,0,0], mass: 0.5, color: '#c0392b', label: 'Pendulum', properties: { angle: 0.8, length: 1.5 } },
    { id: 'spring-1', type: 'spring', position: [2, 2, 0], velocity: [0,0,0], mass: 1, color: '#2980b9', label: 'Spring', properties: { stretch: 0.3, k: 20 } },
    { id: 'ramp-1', type: 'ramp', position: [-2, 0, 0], velocity: [0,0,0], mass: 0, color: '#8B4513', label: 'Ramp', properties: { angle: 30, length: 2 } },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>('pendulum-1');
  const [observations, setObservations] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(true);
  const [showNotebook, setShowNotebook] = useState(false);
  const [gravity, setGravity] = useState(9.81);

  const selectedObject = objects.find(o => o.id === selectedId);

  const addEquipment = useCallback((catalogId: string) => {
    const item = EQUIPMENT_CATALOG.find(e => e.id === catalogId);
    if (!item) return;
    const newObj: PhysicsObject = {
      id: `${item.type}-${Date.now()}`,
      type: item.type,
      position: [(Math.random() - 0.5) * 3, item.type === 'pendulum' || item.type === 'spring' ? 2 : 0.2, (Math.random() - 0.5) * 2],
      velocity: [0, 0, 0],
      mass: 1,
      color: item.color,
      label: item.label,
      properties: item.type === 'pendulum' ? { angle: 0.5, length: 1.5 } : item.type === 'spring' ? { stretch: 0.2, k: 20 } : item.type === 'ramp' ? { angle: 30, length: 2 } : {},
    };
    setObjects(prev => [...prev, newObj]);
    setSelectedId(newObj.id);
    addObservation(`Added ${item.label} to workspace`);
    toast.success(`Added ${item.label}`);
  }, []);

  const addObservation = (obs: string) => {
    setObservations(prev => [`[${new Date().toLocaleTimeString()}] ${obs}`, ...prev.slice(0, 19)]);
  };

  const resetSimulation = () => {
    setObjects([
      { id: 'pendulum-1', type: 'pendulum', position: [0, 2, 0], velocity: [0,0,0], mass: 0.5, color: '#c0392b', label: 'Pendulum', properties: { angle: 0.8, length: 1.5 } },
      { id: 'spring-1', type: 'spring', position: [2, 2, 0], velocity: [0,0,0], mass: 1, color: '#2980b9', label: 'Spring', properties: { stretch: 0.3, k: 20 } },
      { id: 'ramp-1', type: 'ramp', position: [-2, 0, 0], velocity: [0,0,0], mass: 0, color: '#8B4513', label: 'Ramp', properties: { angle: 30, length: 2 } },
    ]);
    setObservations([]);
    toast.info("Simulation reset");
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-indigo-900/50 border-b border-indigo-700">
        <div className="flex items-center gap-3">
          <Atom className="w-6 h-6 text-indigo-400" />
          <h1 className="text-lg font-bold text-white">Interactive Physics Lab</h1>
          <Badge variant="outline" className="text-indigo-400 border-indigo-400/50">
            Mechanics
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsSimulating(!isSimulating)} className="text-slate-300">
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={resetSimulation} className="text-slate-300">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowNotebook(!showNotebook)} className={showNotebook ? 'text-amber-400' : 'text-slate-300'}>
            <BookOpen className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Equipment */}
        <div className="w-72 bg-indigo-900/30 border-r border-indigo-800 p-4 overflow-y-auto space-y-4">
          {/* Add Equipment */}
          <Card className="bg-indigo-800/30 border-indigo-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-indigo-200">Add Equipment</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {EQUIPMENT_CATALOG.map(item => (
                <Button
                  key={item.id}
                  variant="outline"
                  size="sm"
                  onClick={() => addEquipment(item.id)}
                  className="border-indigo-600 text-indigo-200 hover:bg-indigo-700/50 text-xs"
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Gravity Control */}
          <Card className="bg-indigo-800/30 border-indigo-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-indigo-200 flex items-center gap-2">
                <ArrowDown className="w-4 h-4" />
                Gravity: {gravity.toFixed(1)} m/s²
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Slider value={[gravity]} onValueChange={([v]) => setGravity(v)} min={0} max={25} step={0.1} />
              <div className="flex justify-between text-[10px] text-indigo-400 mt-1">
                <span>Moon (1.6)</span>
                <span>Earth (9.8)</span>
                <span>Jupiter (25)</span>
              </div>
            </CardContent>
          </Card>

          {/* Selected Object Properties */}
          {selectedObject && (
            <Card className="bg-indigo-800/30 border-indigo-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-indigo-200">{selectedObject.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between text-indigo-300">
                  <span>Type</span>
                  <span className="capitalize">{selectedObject.type}</span>
                </div>
                <div className="flex justify-between text-indigo-300">
                  <span>Mass</span>
                  <span>{selectedObject.mass} kg</span>
                </div>
                {Object.entries(selectedObject.properties).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-indigo-300">
                    <span className="capitalize">{key}</span>
                    <span>{typeof val === 'number' ? val.toFixed(1) : val}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Observations */}
          <Card className="bg-indigo-800/30 border-indigo-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-indigo-200">Observations</CardTitle>
            </CardHeader>
            <CardContent>
              {observations.length === 0 ? (
                <p className="text-[10px] text-indigo-500 italic">Interact with equipment...</p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {observations.slice(0, 10).map((obs, i) => (
                    <p key={i} className="text-[10px] text-indigo-300 leading-tight">{obs}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 3D View */}
        <div className="flex-1 relative">
          <Canvas camera={{ position: [0, 3, 6], fov: 50 }} shadows>
            <Environment preset="night" background={false} />
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
            <pointLight position={[-3, 3, 3]} intensity={0.4} color="#6366f1" />

            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
              <planeGeometry args={[12, 12]} />
              <meshStandardMaterial color="#1e1b4b" roughness={0.9} />
            </mesh>

            {/* Grid */}
            <gridHelper args={[12, 12, '#4338ca', '#312e81']} position={[0, -0.49, 0]} />

            {/* Render objects */}
            {objects.map(obj => {
              const isSelected = obj.id === selectedId;
              switch (obj.type) {
                case 'pendulum':
                  return <PhysicsPendulum key={obj.id} position={obj.position} angle={obj.properties.angle} length={obj.properties.length} isSelected={isSelected} onClick={() => setSelectedId(obj.id)} />;
                case 'spring':
                  return <PhysicsSpring key={obj.id} position={obj.position} stretch={obj.properties.stretch} mass={obj.mass} isSelected={isSelected} onClick={() => setSelectedId(obj.id)} />;
                case 'ramp':
                  return <PhysicsRamp key={obj.id} position={obj.position} angle={obj.properties.angle} length={obj.properties.length} isSelected={isSelected} onClick={() => setSelectedId(obj.id)} />;
                case 'ball':
                  return <PhysicsBall key={obj.id} position={obj.position} color={obj.color} isSelected={isSelected} onClick={() => setSelectedId(obj.id)} />;
                default:
                  return null;
              }
            })}

            <OrbitControls enableZoom enablePan minDistance={3} maxDistance={15} maxPolarAngle={Math.PI / 2.1} />
          </Canvas>

          <div className="absolute bottom-4 left-4 bg-indigo-950/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-indigo-700">
            <p className="text-xs text-indigo-300">
              🖱️ Click objects to select • Add equipment from panel • Adjust gravity
            </p>
          </div>
        </div>

        {/* Notebook Panel */}
        {showNotebook && (
          <div className="w-72 bg-slate-800/50 border-l border-slate-700 p-3 overflow-y-auto">
            <LabNotebook labType="physics" experimentTitle="Physics Experiment" autoObservations={observations} />
          </div>
        )}
      </div>
    </div>
  );
}
