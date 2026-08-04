import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface FumeHood3DProps {
  position: [number, number, number];
  isActive: boolean;
  extractionLevel: number; // 0-1
  hasToxicFumes: boolean;
}

export function FumeHood3D({ position, isActive, extractionLevel, hasToxicFumes }: FumeHood3DProps) {
  const fanRef = useRef<THREE.Group>(null);
  const airflowRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (fanRef.current && isActive) {
      fanRef.current.rotation.z += extractionLevel * 0.5;
    }
    
    if (airflowRef.current && isActive) {
      airflowRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.position.y = ((state.clock.elapsedTime * 2 + i * 0.3) % 2) + 0.2;
          child.material.opacity = 0.3 - (child.position.y * 0.1);
        }
      });
    }
  });
  
  return (
    <group position={position}>
      {/* Hood frame - back panel */}
      <mesh position={[0, 1, -0.5]}>
        <boxGeometry args={[2.5, 2, 0.1]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Hood frame - side panels */}
      <mesh position={[-1.2, 1, 0]}>
        <boxGeometry args={[0.1, 2, 1.1]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.4}
          transmission={0.8}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[1.2, 1, 0]}>
        <boxGeometry args={[0.1, 2, 1.1]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.4}
          transmission={0.8}
          roughness={0.1}
        />
      </mesh>
      
      {/* Hood frame - top */}
      <mesh position={[0, 2.05, 0]}>
        <boxGeometry args={[2.5, 0.1, 1.1]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Sash (sliding front window) */}
      <mesh position={[0, 1.2, 0.5]}>
        <boxGeometry args={[2.3, 1.4, 0.05]} />
        <meshPhysicalMaterial 
          color="#88ccff" 
          transparent 
          opacity={0.3}
          transmission={0.9}
          roughness={0.05}
        />
      </mesh>
      
      {/* Work surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.5, 0.1, 1.1]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
      </mesh>
      
      {/* Exhaust duct */}
      <mesh position={[0, 2.8, -0.3]}>
        <cylinderGeometry args={[0.3, 0.3, 1.4, 16]} />
        <meshStandardMaterial color="#808080" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Fan housing */}
      <mesh position={[0, 3.5, -0.3]}>
        <cylinderGeometry args={[0.35, 0.35, 0.2, 16]} />
        <meshStandardMaterial color="#404040" metalness={0.8} />
      </mesh>
      
      {/* Fan blades */}
      <group ref={fanRef} position={[0, 3.4, -0.3]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.05, 0.1]} />
            <meshStandardMaterial 
              color={isActive ? "#4a4a4a" : "#2a2a2a"}
              metalness={0.7}
            />
          </mesh>
        ))}
      </group>
      
      {/* Airflow indicators when active */}
      {isActive && (
        <group ref={airflowRef} position={[0, 0.5, 0]}>
          {[...Array(6)].map((_, i) => (
            <mesh key={i} position={[(i % 3 - 1) * 0.5, 0.2 + i * 0.15, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial 
                color="#88ccff" 
                transparent 
                opacity={0.3}
                emissive="#88ccff"
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Status indicator light */}
      <mesh position={[1, 2.3, 0.3]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial 
          color={isActive ? (hasToxicFumes ? "#ff0000" : "#00ff00") : "#666666"}
          emissive={isActive ? (hasToxicFumes ? "#ff0000" : "#00ff00") : "#000000"}
          emissiveIntensity={isActive ? 1 : 0}
        />
      </mesh>
      {isActive && (
        <pointLight 
          position={[1, 2.3, 0.4]} 
          intensity={0.5} 
          color={hasToxicFumes ? "#ff0000" : "#00ff00"} 
          distance={0.5}
        />
      )}
      
      {/* Warning label */}
      <Html position={[0, 2.5, 0.6]} center>
        <div className={`px-2 py-1 rounded text-xs font-bold ${
          isActive 
            ? hasToxicFumes 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-green-500 text-white'
            : 'bg-gray-500 text-white'
        }`}>
          {isActive 
            ? hasToxicFumes 
              ? '⚠️ EXTRACTING FUMES' 
              : '✓ VENTILATION ON'
            : 'FUME HOOD OFF'}
        </div>
      </Html>
      
      {/* Extraction rate display */}
      {isActive && (
        <Html position={[-0.8, 2.3, 0.6]} center>
          <div className="bg-background/90 px-2 py-1 rounded text-xs">
            Extraction: {Math.round(extractionLevel * 100)}%
          </div>
        </Html>
      )}
    </group>
  );
}
