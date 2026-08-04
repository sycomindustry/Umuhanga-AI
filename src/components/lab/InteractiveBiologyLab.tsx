import { useState, useCallback, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Microscope, Plus, RotateCcw, BookOpen, Eye, 
  Droplets, ZoomIn, ZoomOut, Pipette
} from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";
import { LabNotebook } from "./LabNotebook";

// Specimen slide
interface Specimen {
  id: string;
  name: string;
  category: 'cell' | 'tissue' | 'microorganism' | 'plant';
  color: string;
  description: string;
  structures: { name: string; color: string; position: [number, number, number]; size: number }[];
}

const SPECIMENS: Specimen[] = [
  {
    id: 'red-blood', name: 'Red Blood Cells', category: 'cell', color: '#dc2626',
    description: 'Biconcave disc-shaped cells carrying oxygen via hemoglobin.',
    structures: [
      { name: 'Cell', color: '#dc2626', position: [0, 0, 0], size: 0.3 },
      { name: 'Cell', color: '#b91c1c', position: [0.5, 0.1, 0.2], size: 0.28 },
      { name: 'Cell', color: '#ef4444', position: [-0.4, -0.1, 0.3], size: 0.32 },
      { name: 'Cell', color: '#dc2626', position: [0.2, -0.3, -0.2], size: 0.26 },
      { name: 'Cell', color: '#f87171', position: [-0.3, 0.3, -0.1], size: 0.3 },
    ]
  },
  {
    id: 'white-blood', name: 'White Blood Cells', category: 'cell', color: '#a855f7',
    description: 'Immune cells with visible nucleus. Larger than red blood cells.',
    structures: [
      { name: 'Cell membrane', color: '#e9d5ff', position: [0, 0, 0], size: 0.5 },
      { name: 'Nucleus', color: '#7c3aed', position: [0.05, 0.05, 0], size: 0.2 },
      { name: 'Granules', color: '#a855f7', position: [-0.1, -0.1, 0.05], size: 0.06 },
      { name: 'Granules', color: '#a855f7', position: [0.15, -0.05, 0.03], size: 0.05 },
    ]
  },
  {
    id: 'bacteria', name: 'E. Coli Bacteria', category: 'microorganism', color: '#22c55e',
    description: 'Rod-shaped gram-negative bacteria with flagella.',
    structures: [
      { name: 'Cell body', color: '#22c55e', position: [0, 0, 0], size: 0.2 },
      { name: 'Cell body', color: '#16a34a', position: [0.5, 0.1, 0], size: 0.18 },
      { name: 'Cell body', color: '#4ade80', position: [-0.4, -0.15, 0.1], size: 0.22 },
      { name: 'Flagellum', color: '#86efac', position: [0.3, 0, 0.05], size: 0.03 },
    ]
  },
  {
    id: 'onion-cell', name: 'Onion Epidermal Cells', category: 'plant', color: '#84cc16',
    description: 'Rectangular plant cells with visible cell wall and nucleus.',
    structures: [
      { name: 'Cell wall', color: '#65a30d', position: [0, 0, 0], size: 0.6 },
      { name: 'Nucleus', color: '#4d7c0f', position: [0.1, 0.05, 0], size: 0.12 },
      { name: 'Vacuole', color: '#bef264', position: [-0.05, -0.05, 0], size: 0.3 },
    ]
  },
  {
    id: 'algae', name: 'Green Algae (Chlorella)', category: 'microorganism', color: '#059669',
    description: 'Single-celled green algae with chloroplasts for photosynthesis.',
    structures: [
      { name: 'Cell', color: '#059669', position: [0, 0, 0], size: 0.25 },
      { name: 'Chloroplast', color: '#047857', position: [0.05, 0, 0], size: 0.15 },
      { name: 'Cell', color: '#10b981', position: [0.6, 0.2, 0], size: 0.2 },
      { name: 'Cell', color: '#34d399', position: [-0.5, -0.1, 0.15], size: 0.22 },
    ]
  },
  {
    id: 'cheek-cell', name: 'Human Cheek Cells', category: 'cell', color: '#f472b6',
    description: 'Flat epithelial cells with clearly visible nucleus.',
    structures: [
      { name: 'Cell membrane', color: '#fda4af', position: [0, 0, 0], size: 0.5 },
      { name: 'Nucleus', color: '#be185d', position: [0, 0.05, 0], size: 0.15 },
      { name: 'Cytoplasm', color: '#f9a8d4', position: [0, -0.02, 0], size: 0.4 },
    ]
  },
];

const STAINS = [
  { id: 'none', name: 'No Stain', color: 'transparent' },
  { id: 'methylene-blue', name: 'Methylene Blue', color: '#1e40af' },
  { id: 'iodine', name: 'Iodine Solution', color: '#92400e' },
  { id: 'safranin', name: 'Safranin', color: '#dc2626' },
  { id: 'crystal-violet', name: 'Crystal Violet', color: '#7c3aed' },
];

// 3D Cell structure renderer
function CellStructure3D({ structure, zoom, stainColor }: {
  structure: Specimen['structures'][0];
  zoom: number;
  stainColor?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const displayColor = stainColor && stainColor !== 'transparent' 
    ? new THREE.Color(structure.color).lerp(new THREE.Color(stainColor), 0.4).getStyle()
    : structure.color;
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={structure.position} scale={zoom}>
      <sphereGeometry args={[structure.size, 32, 32]} />
      <meshPhysicalMaterial
        color={displayColor}
        transparent
        opacity={0.85}
        roughness={0.2}
        transmission={0.1}
        thickness={0.5}
      />
    </mesh>
  );
}

// Microscope body
function MicroscopeBody3D() {
  return (
    <group position={[2.5, 0, 0]}>
      {/* Base */}
      <mesh position={[0, -0.4, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.15, 32]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Arm */}
      <mesh position={[0, 0.5, -0.2]}>
        <boxGeometry args={[0.12, 1.8, 0.15]} />
        <meshStandardMaterial color="#2d2d44" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Eyepiece */}
      <mesh position={[0, 1.4, 0]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.3, 16]} />
        <meshStandardMaterial color="#111" metalness={0.9} />
      </mesh>
      {/* Objective lenses */}
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[Math.sin(i * 1.2) * 0.12, -0.15, Math.cos(i * 1.2) * 0.12 - 0.05]} rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.03, 0.12, 8]} />
          <meshStandardMaterial color="#333" metalness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Slide on stage
function SlideOnStage3D({ specimen, zoom, stainColor }: {
  specimen: Specimen;
  zoom: number;
  stainColor?: string;
}) {
  return (
    <group position={[0, 0, 0]}>
      {/* Glass slide */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <boxGeometry args={[2.5, 2, 0.03]} />
        <meshPhysicalMaterial color="#e8e8e8" transparent opacity={0.3} roughness={0} transmission={0.8} />
      </mesh>
      {/* Coverslip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <boxGeometry args={[1.5, 1.5, 0.01]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.15} roughness={0} transmission={0.9} />
      </mesh>
      {/* Specimen structures */}
      <group position={[0, 0.05, 0]}>
        {specimen.structures.map((s, i) => (
          <CellStructure3D key={i} structure={s} zoom={zoom} stainColor={stainColor} />
        ))}
      </group>
      {/* Label */}
      <Html position={[0, 0.5, 0]} center>
        <div className="bg-black/70 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
          {specimen.name} ({zoom.toFixed(0)}x)
        </div>
      </Html>
    </group>
  );
}

export function InteractiveBiologyLab() {
  const [selectedSpecimenId, setSelectedSpecimenId] = useState('red-blood');
  const [selectedStainId, setSelectedStainId] = useState('none');
  const [zoom, setZoom] = useState(1);
  const [observations, setObservations] = useState<string[]>([]);
  const [showNotebook, setShowNotebook] = useState(false);

  const specimen = SPECIMENS.find(s => s.id === selectedSpecimenId)!;
  const stain = STAINS.find(s => s.id === selectedStainId)!;

  const addObservation = (obs: string) => {
    setObservations(prev => [`[${new Date().toLocaleTimeString()}] ${obs}`, ...prev.slice(0, 19)]);
  };

  const handleSpecimenChange = useCallback((id: string) => {
    setSelectedSpecimenId(id);
    const sp = SPECIMENS.find(s => s.id === id);
    if (sp) {
      addObservation(`Loaded specimen: ${sp.name} - ${sp.description}`);
      toast.success(`Viewing: ${sp.name}`);
    }
  }, []);

  const handleStainChange = useCallback((id: string) => {
    setSelectedStainId(id);
    const st = STAINS.find(s => s.id === id);
    if (st && st.id !== 'none') {
      addObservation(`Applied stain: ${st.name} to ${specimen.name}`);
      toast.success(`Applied ${st.name}`);
    }
  }, [specimen]);

  const handleZoomChange = useCallback((val: number[]) => {
    setZoom(val[0]);
    if (val[0] > 3) addObservation(`High magnification (${val[0].toFixed(0)}x): Fine structures visible`);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-emerald-900/50 border-b border-emerald-700">
        <div className="flex items-center gap-3">
          <Microscope className="w-6 h-6 text-emerald-400" />
          <h1 className="text-lg font-bold text-white">Interactive Biology Lab</h1>
          <Badge variant="outline" className="text-emerald-400 border-emerald-400/50">
            Microscopy
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedSpecimenId('red-blood'); setSelectedStainId('none'); setZoom(1); setObservations([]); toast.info("Reset"); }} className="text-slate-300">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowNotebook(!showNotebook)} className={showNotebook ? 'text-amber-400' : 'text-slate-300'}>
            <BookOpen className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-72 bg-emerald-900/30 border-r border-emerald-800 p-4 overflow-y-auto space-y-4">
          {/* Specimen Selector */}
          <Card className="bg-emerald-800/30 border-emerald-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-emerald-200 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Specimen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedSpecimenId} onValueChange={handleSpecimenChange}>
                <SelectTrigger className="bg-emerald-900 border-emerald-700 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPECIMENS.map(sp => (
                    <SelectItem key={sp.id} value={sp.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sp.color }} />
                        {sp.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-emerald-400 mt-2 leading-relaxed">{specimen.description}</p>
            </CardContent>
          </Card>

          {/* Stain Selector */}
          <Card className="bg-emerald-800/30 border-emerald-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-emerald-200 flex items-center gap-2">
                <Pipette className="w-4 h-4" />
                Stain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedStainId} onValueChange={handleStainChange}>
                <SelectTrigger className="bg-emerald-900 border-emerald-700 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAINS.map(st => (
                    <SelectItem key={st.id} value={st.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full border" style={{ backgroundColor: st.color === 'transparent' ? '#666' : st.color }} />
                        {st.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Zoom / Magnification */}
          <Card className="bg-emerald-800/30 border-emerald-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-emerald-200 flex items-center gap-2">
                <ZoomIn className="w-4 h-4" />
                Magnification: {zoom.toFixed(0)}x
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Slider value={[zoom]} onValueChange={handleZoomChange} min={0.5} max={5} step={0.1} />
              <div className="flex justify-between text-[10px] text-emerald-400 mt-1">
                <span>0.5x</span>
                <span>5x</span>
              </div>
            </CardContent>
          </Card>

          {/* Structures Legend */}
          <Card className="bg-emerald-800/30 border-emerald-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-emerald-200">Visible Structures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[...new Set(specimen.structures.map(s => s.name))].map((name, i) => {
                const s = specimen.structures.find(st => st.name === name)!;
                return (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-emerald-300">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    {name}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Observations */}
          <Card className="bg-emerald-800/30 border-emerald-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-emerald-200">Observations</CardTitle>
            </CardHeader>
            <CardContent>
              {observations.length === 0 ? (
                <p className="text-[10px] text-emerald-500 italic">Select specimens and stains...</p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {observations.slice(0, 10).map((obs, i) => (
                    <p key={i} className="text-[10px] text-emerald-300 leading-tight">{obs}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 3D View */}
        <div className="flex-1 relative">
          <Canvas camera={{ position: [0, 3, 4], fov: 45 }} shadows>
            <Environment preset="studio" background={false} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
            <pointLight position={[0, 2, 0]} intensity={0.8} color="#10b981" />

            {/* Microscope stage / table */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
              <planeGeometry args={[10, 10]} />
              <meshStandardMaterial color="#0f291e" roughness={0.9} />
            </mesh>

            {/* Microscope model */}
            <MicroscopeBody3D />

            {/* Slide with specimen */}
            <SlideOnStage3D specimen={specimen} zoom={zoom} stainColor={stain.color} />

            <OrbitControls enableZoom enablePan minDistance={2} maxDistance={10} maxPolarAngle={Math.PI / 2.1} />
          </Canvas>

          <div className="absolute bottom-4 left-4 bg-emerald-950/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-emerald-700">
            <p className="text-xs text-emerald-300">
              🔬 Select specimens • Apply stains • Adjust magnification
            </p>
          </div>
        </div>

        {/* Notebook Panel */}
        {showNotebook && (
          <div className="w-72 bg-slate-800/50 border-l border-slate-700 p-3 overflow-y-auto">
            <LabNotebook labType="biology" experimentTitle="Biology Microscopy" autoObservations={observations} />
          </div>
        )}
      </div>
    </div>
  );
}
