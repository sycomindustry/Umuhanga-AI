import { useRef, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { LabEquipment } from "@/hooks/useLabEquipment";

interface DraggableEquipment3DProps {
  equipment: LabEquipment;
  initialPosition: [number, number, number];
  onPositionChange?: (id: string, position: [number, number, number]) => void;
  onSelect?: (equipment: LabEquipment) => void;
  isSelected?: boolean;
}

// Equipment 3D mesh components
function BeakerMesh() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.4, 0.35, 0.8, 32, 1, true]} />
        <meshPhysicalMaterial
          color={0xffffff}
          transparent
          opacity={0.3}
          roughness={0.1}
          transmission={0.9}
        />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.02, 32]} />
        <meshPhysicalMaterial color={0xffffff} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function TestTubeMesh() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
        <meshPhysicalMaterial
          color={0xffffff}
          transparent
          opacity={0.3}
          roughness={0.1}
          transmission={0.9}
        />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshPhysicalMaterial color={0xffffff} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function BunsenBurnerMesh({ isActive }: { isActive: boolean }) {
  const flameRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (flameRef.current && isActive) {
      flameRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 15) * 0.2;
    }
  });
  
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.4, 16]} />
        <meshStandardMaterial color={0x2c3e50} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.1, 16]} />
        <meshStandardMaterial color={0x34495e} metalness={0.7} />
      </mesh>
      {isActive && (
        <mesh ref={flameRef} position={[0, 0.5, 0]}>
          <coneGeometry args={[0.1, 0.4, 8]} />
          <meshStandardMaterial
            color={0x3498db}
            emissive={0x2980b9}
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

function MicroscopeMesh() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.1, 32]} />
        <meshStandardMaterial color={0x2c3e50} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.4, -0.15]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
        <meshStandardMaterial color={0x34495e} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.4, 0.03, 0.3]} />
        <meshStandardMaterial color={0x7f8c8d} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.2, 16]} />
        <meshStandardMaterial color={0x95a5a6} metalness={0.9} />
      </mesh>
    </group>
  );
}

function PetriDishMesh() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.08, 32]} />
        <meshPhysicalMaterial
          color={0xffffff}
          transparent
          opacity={0.3}
          roughness={0.1}
          transmission={0.9}
        />
      </mesh>
    </group>
  );
}

function ThermometerMesh() {
  return (
    <group rotation={[0, 0, Math.PI / 6]}>
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
        <meshPhysicalMaterial color={0xffffff} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={0xff0000} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.02, 0.6, 0.01]} />
        <meshStandardMaterial color={0xff0000} />
      </mesh>
    </group>
  );
}

function MultimeterMesh() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.4, 0.6, 0.15]} />
        <meshStandardMaterial color={0xf39c12} />
      </mesh>
      <mesh position={[0, 0.1, 0.08]}>
        <boxGeometry args={[0.3, 0.25, 0.02]} />
        <meshStandardMaterial color={0x2c3e50} />
      </mesh>
      <mesh position={[0, -0.15, 0.08]}>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 32]} />
        <meshStandardMaterial color={0x34495e} />
      </mesh>
    </group>
  );
}

function BatteryMesh() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        <meshStandardMaterial color={0x1a1a1a} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshStandardMaterial color={0xd4af37} metalness={0.9} />
      </mesh>
    </group>
  );
}

function ResistorMesh() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, 0.3, 16]} />
        <meshStandardMaterial color={0xd2691e} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
        <meshStandardMaterial color={0xff0000} />
      </mesh>
      <mesh position={[0, -0.07, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
        <meshStandardMaterial color={0xffff00} />
      </mesh>
    </group>
  );
}

function SafetyGogglesMesh() {
  return (
    <group>
      <mesh position={[-0.15, 0, 0]}>
        <torusGeometry args={[0.12, 0.03, 16, 32]} />
        <meshPhysicalMaterial color={0xffffff} transparent opacity={0.4} />
      </mesh>
      <mesh position={[0.15, 0, 0]}>
        <torusGeometry args={[0.12, 0.03, 16, 32]} />
        <meshPhysicalMaterial color={0xffffff} transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[0.1, 0.03, 0.02]} />
        <meshStandardMaterial color={0x2c3e50} />
      </mesh>
    </group>
  );
}

function DefaultEquipmentMesh({ category }: { category: string }) {
  const color = {
    equipment: 0x3498db,
    component: 0x2ecc71,
    chemical: 0xe74c3c,
    measurement: 0x9b59b6,
    safety: 0xf1c40f,
    container: 0x1abc9c,
    tool: 0xe67e22,
    organism: 0x27ae60,
  }[category] || 0x95a5a6;
  
  return (
    <mesh>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function getEquipmentMesh(equipment: LabEquipment) {
  const name = equipment.name.toLowerCase();
  
  if (name.includes("beaker") || name.includes("flask")) return <BeakerMesh />;
  if (name.includes("test tube")) return <TestTubeMesh />;
  if (name.includes("bunsen")) return <BunsenBurnerMesh isActive={false} />;
  if (name.includes("microscope")) return <MicroscopeMesh />;
  if (name.includes("petri")) return <PetriDishMesh />;
  if (name.includes("thermometer")) return <ThermometerMesh />;
  if (name.includes("multimeter")) return <MultimeterMesh />;
  if (name.includes("battery")) return <BatteryMesh />;
  if (name.includes("resistor")) return <ResistorMesh />;
  if (name.includes("goggle") || name.includes("safety")) return <SafetyGogglesMesh />;
  
  return <DefaultEquipmentMesh category={equipment.category} />;
}

export function DraggableEquipment3D({
  equipment,
  initialPosition,
  onPositionChange,
  onSelect,
  isSelected = false,
}: DraggableEquipment3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>(initialPosition);
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersection = useRef(new THREE.Vector3());

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    onPositionChange?.(equipment.id, position);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();
    
    const ray = e.ray;
    if (ray.intersectPlane(dragPlane.current, intersection.current)) {
      const newPos: [number, number, number] = [
        intersection.current.x,
        position[1],
        intersection.current.z,
      ];
      setPosition(newPos);
    }
  };

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) {
      e.stopPropagation();
      onSelect?.(equipment);
    }
  };

  const getSafetyColor = () => {
    switch (equipment.safety_level) {
      case "danger": return 0xff0000;
      case "caution": return 0xffff00;
      default: return 0x00ff00;
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = isDragging ? "grabbing" : "grab";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Selection/Hover glow */}
      {(isSelected || isHovered) && (
        <mesh scale={1.5}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial
            color={isSelected ? 0x00ff00 : getSafetyColor()}
            transparent
            opacity={0.15}
          />
        </mesh>
      )}

      {/* Equipment mesh */}
      {getEquipmentMesh(equipment)}

      {/* Tooltip */}
      {isHovered && !isDragging && (
        <Html position={[0, 0.8, 0]} center>
          <div className="bg-background/95 border border-primary/50 px-3 py-2 rounded-lg shadow-lg pointer-events-none animate-fade-in min-w-[120px]">
            <p className="text-sm font-medium whitespace-nowrap">{equipment.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{equipment.category}</p>
            {equipment.safety_level !== "safe" && (
              <p className={`text-xs mt-1 ${equipment.safety_level === "danger" ? "text-red-400" : "text-yellow-400"}`}>
                ⚠️ {equipment.safety_level}
              </p>
            )}
          </div>
        </Html>
      )}

      {/* Drag indicator */}
      {isDragging && (
        <mesh position={[0, -0.5, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color={0x00ff00} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
