import { useRef, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// ============= BEAKER 3D =============
interface Beaker3DProps {
  position: [number, number, number];
  liquidLevel?: number; // 0-1
  liquidColor?: number;
  isSelected?: boolean;
  isDamaged?: boolean;
  onSelect?: () => void;
  label?: string;
  capacity?: string;
}

export function Beaker3D({ 
  position, 
  liquidLevel = 0, 
  liquidColor = 0x87ceeb, 
  isSelected = false,
  isDamaged = false,
  onSelect,
  label,
  capacity = "500mL"
}: Beaker3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Selection glow */}
      {(isSelected || isHovered) && (
        <mesh scale={1.15}>
          <cylinderGeometry args={[0.85, 0.85, 2.3, 32]} />
          <meshBasicMaterial color={isSelected ? 0x00ff00 : 0xffff00} transparent opacity={0.15} />
        </mesh>
      )}

      {/* Glass beaker body */}
      <mesh>
        <cylinderGeometry args={[0.8, 0.7, 2, 32, 1, true]} />
        <meshPhysicalMaterial
          color={isDamaged ? 0x888888 : 0xffffff}
          transparent
          opacity={isDamaged ? 0.4 : 0.25}
          roughness={0.05}
          transmission={isDamaged ? 0.5 : 0.95}
          thickness={0.05}
          envMapIntensity={1}
          clearcoat={1}
        />
      </mesh>

      {/* Bottom */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.05, 32]} />
        <meshPhysicalMaterial
          color={0xffffff}
          transparent
          opacity={0.4}
          roughness={0.1}
        />
      </mesh>

      {/* Pouring spout */}
      <mesh position={[0.65, 0.95, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.3, 0.15, 0.2]} />
        <meshPhysicalMaterial
          color={0xffffff}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Crack lines if damaged */}
      {isDamaged && (
        <>
          <mesh position={[0.6, 0.2, 0.2]} rotation={[0, 0.3, 0.5]}>
            <boxGeometry args={[0.02, 1.2, 0.01]} />
            <meshBasicMaterial color={0x222222} />
          </mesh>
          <mesh position={[0.4, -0.3, 0.4]} rotation={[0.2, 0.5, 0.3]}>
            <boxGeometry args={[0.02, 0.8, 0.01]} />
            <meshBasicMaterial color={0x333333} />
          </mesh>
        </>
      )}

      {/* Liquid inside */}
      {liquidLevel > 0 && (
        <mesh position={[0, -1 + liquidLevel, 0]}>
          <cylinderGeometry args={[0.68, 0.68, liquidLevel * 2, 32]} />
          <meshStandardMaterial
            color={liquidColor}
            transparent
            opacity={0.75}
          />
        </mesh>
      )}

      {/* Measurement markings */}
      <Html position={[0.85, 0.6, 0]} center>
        <div className="text-[8px] text-white/70 font-mono">{capacity}</div>
      </Html>
      <Html position={[0.85, 0, 0]} center>
        <div className="text-[8px] text-white/70 font-mono">{parseInt(capacity) / 2}mL</div>
      </Html>

      {/* Tooltip */}
      {isHovered && !isSelected && label && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-background/95 border border-primary/50 px-3 py-1.5 rounded-lg shadow-lg pointer-events-none animate-fade-in">
            <p className="text-sm font-medium whitespace-nowrap">{label}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= FLASK (ERLENMEYER) 3D =============
interface Flask3DProps {
  position: [number, number, number];
  liquidLevel?: number;
  liquidColor?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  label?: string;
}

export function Flask3D({ 
  position, 
  liquidLevel = 0, 
  liquidColor = 0x87ceeb,
  isSelected = false,
  onSelect,
  label = "Erlenmeyer Flask"
}: Flask3DProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <group 
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); document.body.style.cursor = "auto"; }}
    >
      {(isSelected || isHovered) && (
        <mesh scale={1.1}>
          <coneGeometry args={[0.9, 2, 32]} />
          <meshBasicMaterial color={isSelected ? 0x00ff00 : 0xffff00} transparent opacity={0.15} />
        </mesh>
      )}

      {/* Flask body - cone shape */}
      <mesh position={[0, -0.3, 0]}>
        <coneGeometry args={[0.8, 1.4, 32, 1, true]} />
        <meshPhysicalMaterial
          color={0xffffff}
          transparent
          opacity={0.25}
          roughness={0.05}
          transmission={0.95}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 0.8, 16, 1, true]} />
        <meshPhysicalMaterial
          color={0xffffff}
          transparent
          opacity={0.25}
          roughness={0.05}
          transmission={0.95}
        />
      </mesh>

      {/* Liquid */}
      {liquidLevel > 0 && (
        <mesh position={[0, -0.5, 0]}>
          <coneGeometry args={[0.6 * liquidLevel, liquidLevel * 1.2, 32]} />
          <meshStandardMaterial color={liquidColor} transparent opacity={0.7} />
        </mesh>
      )}

      {isHovered && !isSelected && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-background/95 border border-primary/50 px-3 py-1.5 rounded-lg shadow-lg pointer-events-none animate-fade-in">
            <p className="text-sm font-medium whitespace-nowrap">{label}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= TEST TUBE 3D =============
interface TestTube3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  liquidLevel?: number;
  liquidColor?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  label?: string;
}

export function TestTube3D({
  position,
  rotation = [0, 0, 0],
  liquidLevel = 0,
  liquidColor = 0x87ceeb,
  isSelected = false,
  onSelect,
  label = "Test Tube"
}: TestTube3DProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <group 
      position={position} 
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); document.body.style.cursor = "auto"; }}
    >
      {(isSelected || isHovered) && (
        <mesh scale={1.3}>
          <capsuleGeometry args={[0.12, 0.8, 8, 16]} />
          <meshBasicMaterial color={isSelected ? 0x00ff00 : 0xffff00} transparent opacity={0.15} />
        </mesh>
      )}

      {/* Tube body */}
      <mesh>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 16, 1, true]} />
        <meshPhysicalMaterial
          color={0xffffff}
          transparent
          opacity={0.25}
          transmission={0.95}
        />
      </mesh>

      {/* Rounded bottom */}
      <mesh position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color={0xffffff}
          transparent
          opacity={0.25}
          transmission={0.95}
        />
      </mesh>

      {/* Liquid */}
      {liquidLevel > 0 && (
        <mesh position={[0, -0.3 + liquidLevel * 0.3, 0]}>
          <cylinderGeometry args={[0.085, 0.085, liquidLevel * 0.6, 16]} />
          <meshStandardMaterial color={liquidColor} transparent opacity={0.7} />
        </mesh>
      )}

      {isHovered && !isSelected && (
        <Html position={[0, 0.6, 0]} center>
          <div className="bg-background/95 border border-primary/50 px-3 py-1.5 rounded-lg shadow-lg pointer-events-none animate-fade-in">
            <p className="text-sm font-medium whitespace-nowrap">{label}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= BUNSEN BURNER 3D =============
interface BunsenBurner3DProps {
  position: [number, number, number];
  isActive?: boolean;
  flameIntensity?: number; // 0-1
  isSelected?: boolean;
  onSelect?: () => void;
}

export function BunsenBurner3D({
  position,
  isActive = false,
  flameIntensity = 0.7,
  isSelected = false,
  onSelect
}: BunsenBurner3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const flameRef = useRef<THREE.Group>(null);
  const innerFlameRef = useRef<THREE.Mesh>(null);
  const outerFlameRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (flameRef.current && isActive) {
      const time = state.clock.elapsedTime;
      // Flicker effect
      flameRef.current.scale.y = 0.8 + Math.sin(time * 15) * 0.15 + Math.sin(time * 23) * 0.1;
      flameRef.current.scale.x = 0.9 + Math.sin(time * 12) * 0.1;
      flameRef.current.scale.z = 0.9 + Math.sin(time * 18) * 0.1;
      
      if (innerFlameRef.current) {
        innerFlameRef.current.rotation.y = time * 2;
      }
      if (outerFlameRef.current) {
        outerFlameRef.current.rotation.y = -time * 1.5;
      }
    }
  });

  return (
    <group 
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); document.body.style.cursor = "auto"; }}
    >
      {(isSelected || isHovered) && (
        <mesh position={[0, 0.3, 0]} scale={1.3}>
          <cylinderGeometry args={[0.25, 0.35, 1, 16]} />
          <meshBasicMaterial color={isSelected ? 0x00ff00 : 0xffff00} transparent opacity={0.15} />
        </mesh>
      )}

      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.15, 16]} />
        <meshStandardMaterial color={0x2c3e50} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Gas inlet tube */}
      <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
        <meshStandardMaterial color={0x34495e} metalness={0.7} />
      </mesh>

      {/* Main barrel */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.55, 16]} />
        <meshStandardMaterial color={0x34495e} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Air hole ring */}
      <mesh position={[0, 0.15, 0]}>
        <torusGeometry args={[0.1, 0.02, 8, 16]} />
        <meshStandardMaterial color={0x546e7a} metalness={0.7} />
      </mesh>

      {/* Burner head */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 0.1, 16]} />
        <meshStandardMaterial color={0x1a1a1a} metalness={0.9} />
      </mesh>

      {/* Flame */}
      {isActive && (
        <group ref={flameRef} position={[0, 0.75, 0]}>
          {/* Inner cone (hottest - blue) */}
          <mesh ref={innerFlameRef}>
            <coneGeometry args={[0.04 * flameIntensity, 0.25 * flameIntensity, 8]} />
            <meshStandardMaterial
              color={0x3498db}
              emissive={0x2980b9}
              emissiveIntensity={3}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* Outer cone (cooler - orange/yellow) */}
          <mesh ref={outerFlameRef} position={[0, 0.1, 0]}>
            <coneGeometry args={[0.08 * flameIntensity, 0.4 * flameIntensity, 8]} />
            <meshStandardMaterial
              color={0xff6600}
              emissive={0xff3300}
              emissiveIntensity={2}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* Outer glow */}
          <mesh position={[0, 0.15, 0]}>
            <coneGeometry args={[0.12 * flameIntensity, 0.5 * flameIntensity, 8]} />
            <meshStandardMaterial
              color={0xffcc00}
              emissive={0xff9900}
              emissiveIntensity={1}
              transparent
              opacity={0.3}
            />
          </mesh>

          {/* Point light for illumination */}
          <pointLight
            position={[0, 0.2, 0]}
            intensity={2 * flameIntensity}
            color={0xff6600}
            distance={3}
          />
        </group>
      )}

      {isHovered && !isSelected && (
        <Html position={[0, 1.2, 0]} center>
          <div className="bg-background/95 border border-primary/50 px-3 py-1.5 rounded-lg shadow-lg pointer-events-none animate-fade-in">
            <p className="text-sm font-medium whitespace-nowrap">Bunsen Burner</p>
            <p className="text-xs text-muted-foreground">{isActive ? "Active" : "Off"}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= TRIPOD STAND 3D =============
interface TripodStand3DProps {
  position: [number, number, number];
  isSelected?: boolean;
  onSelect?: () => void;
}

export function TripodStand3D({ position, isSelected = false, onSelect }: TripodStand3DProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <group 
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Ring at top */}
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[0.35, 0.02, 8, 24]} />
        <meshStandardMaterial color={0x2c3e50} metalness={0.8} />
      </mesh>

      {/* Three legs */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i * 2 * Math.PI) / 3) * 0.25,
            0.25,
            Math.sin((i * 2 * Math.PI) / 3) * 0.25,
          ]}
          rotation={[Math.PI / 6, 0, (i * 2 * Math.PI) / 3]}
        >
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <meshStandardMaterial color={0x34495e} metalness={0.7} />
        </mesh>
      ))}

      {/* Wire gauze on top */}
      <mesh position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.33, 32]} />
        <meshStandardMaterial color={0x7f8c8d} metalness={0.6} wireframe />
      </mesh>

      {isHovered && !isSelected && (
        <Html position={[0, 0.8, 0]} center>
          <div className="bg-background/95 border border-primary/50 px-3 py-1.5 rounded-lg shadow-lg pointer-events-none animate-fade-in">
            <p className="text-sm font-medium whitespace-nowrap">Tripod Stand</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= THERMOMETER 3D =============
interface Thermometer3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  temperature?: number;
  minTemp?: number;
  maxTemp?: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function Thermometer3D({
  position,
  rotation = [0, 0, 0.2],
  temperature = 25,
  minTemp = -10,
  maxTemp = 110,
  isSelected = false,
  onSelect
}: Thermometer3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const tempRatio = Math.max(0, Math.min(1, (temperature - minTemp) / (maxTemp - minTemp)));

  return (
    <group 
      position={position} 
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Glass tube */}
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 16]} />
        <meshPhysicalMaterial
          color={0xffffff}
          transparent
          opacity={0.4}
          transmission={0.8}
        />
      </mesh>

      {/* Bulb at bottom */}
      <mesh position={[0, -0.55, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={0xff0000} />
      </mesh>

      {/* Mercury column */}
      <mesh position={[0, -0.45 + (tempRatio * 0.45), 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.1 + tempRatio * 0.8, 8]} />
        <meshStandardMaterial color={0xff0000} />
      </mesh>

      {/* Scale markings */}
      <Html position={[0.08, 0.4, 0]} center>
        <div className="text-[6px] text-white/60 font-mono">{maxTemp}°</div>
      </Html>
      <Html position={[0.08, 0, 0]} center>
        <div className="text-[6px] text-white/60 font-mono">{(maxTemp + minTemp) / 2}°</div>
      </Html>
      <Html position={[0.08, -0.4, 0]} center>
        <div className="text-[6px] text-white/60 font-mono">{minTemp}°</div>
      </Html>

      {isHovered && (
        <Html position={[0, 0.8, 0]} center>
          <div className="bg-background/95 border border-primary/50 px-3 py-1.5 rounded-lg shadow-lg pointer-events-none animate-fade-in">
            <p className="text-sm font-medium whitespace-nowrap">Thermometer</p>
            <p className="text-xs text-red-400 font-mono">{temperature}°C</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= STIRRING ROD 3D =============
interface StirringRod3DProps {
  position: [number, number, number];
  isAnimating?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function StirringRod3D({
  position,
  isAnimating = false,
  isSelected = false,
  onSelect
}: StirringRod3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current && isAnimating) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 3;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group 
      ref={groupRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Glass rod */}
      <mesh>
        <cylinderGeometry args={[0.025, 0.025, 1.2, 12]} />
        <meshPhysicalMaterial
          color={0xffffff}
          transparent
          opacity={0.5}
          transmission={0.7}
        />
      </mesh>

      {/* Rounded ends */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshPhysicalMaterial color={0xffffff} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, -0.6, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshPhysicalMaterial color={0xffffff} transparent opacity={0.5} />
      </mesh>

      {isHovered && !isSelected && (
        <Html position={[0, 0.9, 0]} center>
          <div className="bg-background/95 border border-primary/50 px-3 py-1.5 rounded-lg shadow-lg pointer-events-none animate-fade-in">
            <p className="text-sm font-medium whitespace-nowrap">Stirring Rod</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= DROPPER/PIPETTE 3D =============
interface Dropper3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  liquidColor?: number;
  isDropping?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function Dropper3D({
  position,
  rotation = [0, 0, 0.3],
  liquidColor = 0xff69b4,
  isDropping = false,
  isSelected = false,
  onSelect
}: Dropper3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const dropRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (dropRef.current && isDropping) {
      const cycle = (state.clock.elapsedTime % 1.5) / 1.5;
      dropRef.current.position.y = -0.5 - cycle * 2;
      dropRef.current.scale.setScalar(1 - cycle * 0.5);
      dropRef.current.visible = cycle < 0.8;
    }
  });

  return (
    <group 
      position={position} 
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Rubber bulb */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={0x8b0000} roughness={0.8} />
      </mesh>

      {/* Glass tube */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 16]} />
        <meshPhysicalMaterial color={0xffffff} transparent opacity={0.4} transmission={0.8} />
      </mesh>

      {/* Narrow tip */}
      <mesh position={[0, -0.35, 0]}>
        <coneGeometry args={[0.03, 0.2, 16]} />
        <meshPhysicalMaterial color={0xffffff} transparent opacity={0.4} transmission={0.8} />
      </mesh>

      {/* Liquid inside */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color={liquidColor} transparent opacity={0.6} />
      </mesh>

      {/* Dropping animation */}
      {isDropping && (
        <mesh ref={dropRef} position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color={liquidColor} />
        </mesh>
      )}

      {isHovered && !isSelected && (
        <Html position={[0, 0.6, 0]} center>
          <div className="bg-background/95 border border-primary/50 px-3 py-1.5 rounded-lg shadow-lg pointer-events-none animate-fade-in">
            <p className="text-sm font-medium whitespace-nowrap">Dropper</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= CHEMICAL BOTTLE 3D =============
interface ChemicalBottle3DProps {
  position: [number, number, number];
  liquidColor?: number;
  label?: string;
  hazardLevel?: "safe" | "caution" | "danger";
  isSelected?: boolean;
  onSelect?: () => void;
}

export function ChemicalBottle3D({
  position,
  liquidColor = 0xffeb3b,
  label = "Chemical",
  hazardLevel = "safe",
  isSelected = false,
  onSelect
}: ChemicalBottle3DProps) {
  const [isHovered, setIsHovered] = useState(false);

  const hazardColor = {
    safe: 0x4caf50,
    caution: 0xffeb3b,
    danger: 0xf44336
  }[hazardLevel];

  return (
    <group 
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); document.body.style.cursor = "auto"; }}
    >
      {(isSelected || isHovered) && (
        <mesh scale={1.15}>
          <cylinderGeometry args={[0.25, 0.3, 1, 16]} />
          <meshBasicMaterial color={isSelected ? 0x00ff00 : hazardColor} transparent opacity={0.2} />
        </mesh>
      )}

      {/* Bottle body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.8, 16]} />
        <meshPhysicalMaterial
          color={0x8B4513}
          transparent
          opacity={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.2, 12]} />
        <meshPhysicalMaterial color={0x8B4513} transparent opacity={0.6} />
      </mesh>

      {/* Cap */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 12]} />
        <meshStandardMaterial color={hazardColor} />
      </mesh>

      {/* Liquid inside */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.55, 16]} />
        <meshStandardMaterial color={liquidColor} transparent opacity={0.6} />
      </mesh>

      {/* Label */}
      <Html position={[0.25, 0, 0]} center>
        <div className="bg-white/90 px-1 py-0.5 rounded text-[6px] font-bold max-w-[60px] text-center">
          {label}
        </div>
      </Html>

      {hazardLevel !== "safe" && (
        <Html position={[0, -0.5, 0.26]} center>
          <div className={`text-lg ${hazardLevel === "danger" ? "text-red-500" : "text-yellow-500"}`}>
            ⚠️
          </div>
        </Html>
      )}

      {isHovered && !isSelected && (
        <Html position={[0, 1, 0]} center>
          <div className="bg-background/95 border border-primary/50 px-3 py-1.5 rounded-lg shadow-lg pointer-events-none animate-fade-in">
            <p className="text-sm font-medium whitespace-nowrap">{label}</p>
            <p className={`text-xs ${hazardLevel === "danger" ? "text-red-400" : hazardLevel === "caution" ? "text-yellow-400" : "text-green-400"}`}>
              {hazardLevel === "danger" ? "⚠️ Hazardous" : hazardLevel === "caution" ? "⚡ Handle with care" : "✓ Safe"}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= EXPLOSION EFFECT =============
interface ExplosionEffect3DProps {
  position?: [number, number, number];
  intensity?: number;
  onComplete?: () => void;
}

export function ExplosionEffect3D({ 
  position = [0, 0, 0], 
  intensity = 1,
  onComplete 
}: ExplosionEffect3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 8 * intensity,
        Math.random() * 8 * intensity + 3,
        (Math.random() - 0.5) * 8 * intensity
      ),
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        Math.random() * 0.3,
        (Math.random() - 0.5) * 0.3
      ),
      size: 0.05 + Math.random() * 0.15,
      color: Math.random() > 0.5 ? 0xff4400 : Math.random() > 0.5 ? 0xffaa00 : 0xff0000,
    }))
  );

  const startTime = useRef(Date.now());

  useFrame((state, delta) => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    
    if (elapsed > 2) {
      onComplete?.();
      return;
    }

    particles.forEach((p) => {
      p.position.add(p.velocity.clone().multiplyScalar(delta));
      p.velocity.y -= 15 * delta; // Gravity
      p.velocity.multiplyScalar(0.98); // Air resistance
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Fire particles */}
      {particles.map((p) => (
        <mesh key={p.id} position={p.position}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={3}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      {/* Central flash */}
      <mesh>
        <sphereGeometry args={[0.5 * intensity, 16, 16]} />
        <meshStandardMaterial
          color={0xffffff}
          emissive={0xffff00}
          emissiveIntensity={5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Shockwave ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.8, 32]} />
        <meshStandardMaterial
          color={0xff6600}
          emissive={0xff3300}
          emissiveIntensity={2}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Smoke puffs */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={`smoke-${i}`}
          position={[
            Math.sin(i * 1.2) * 0.3,
            0.5 + i * 0.2,
            Math.cos(i * 1.2) * 0.3,
          ]}
        >
          <sphereGeometry args={[0.2 + i * 0.1, 8, 8]} />
          <meshStandardMaterial
            color={0x444444}
            transparent
            opacity={0.4 - i * 0.05}
          />
        </mesh>
      ))}

      {/* Intense point light */}
      <pointLight intensity={10 * intensity} color={0xff4400} distance={5} decay={2} />
    </group>
  );
}

// ============= SMOKE/FUMES EFFECT =============
interface SmokeEffect3DProps {
  position?: [number, number, number];
  color?: number;
  intensity?: number;
  isToxic?: boolean;
}

export function SmokeEffect3D({
  position = [0, 0, 0],
  color = 0x888888,
  intensity = 1,
  isToxic = false
}: SmokeEffect3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const smokeColor = isToxic ? 0x88ff88 : color;

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: Math.floor(8 * intensity) }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 0.8) * 0.2,
            0.3 + i * 0.15,
            Math.cos(i * 0.8) * 0.2,
          ]}
        >
          <sphereGeometry args={[0.15 + i * 0.08, 12, 12]} />
          <meshStandardMaterial
            color={smokeColor}
            transparent
            opacity={0.35 - i * 0.03}
          />
        </mesh>
      ))}

      {isToxic && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-red-900/90 border border-red-500 px-2 py-1 rounded text-red-100 text-xs font-bold animate-pulse">
            ☠️ TOXIC
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= BUBBLES EFFECT =============
interface BubblesEffect3DProps {
  position?: [number, number, number];
  intensity?: number;
  color?: number;
}

export function BubblesEffect3D({
  position = [0, 0, 0],
  intensity = 1,
  color = 0xffffff
}: BubblesEffect3DProps) {
  const bubblesRef = useRef<THREE.Group>(null);
  const [bubbles] = useState(() =>
    Array.from({ length: Math.floor(10 * intensity) }, (_, i) => ({
      id: i,
      delay: Math.random() * 2,
      speed: 0.3 + Math.random() * 0.4,
      x: (Math.random() - 0.5) * 0.6,
      z: (Math.random() - 0.5) * 0.6,
      size: 0.02 + Math.random() * 0.05,
    }))
  );

  useFrame((state) => {
    if (bubblesRef.current) {
      bubblesRef.current.children.forEach((child, i) => {
        const bubble = bubbles[i];
        const time = state.clock.elapsedTime - bubble.delay;
        if (time > 0) {
          const y = (time * bubble.speed) % 1.5;
          child.position.y = y;
          child.position.x = bubble.x + Math.sin(time * 3) * 0.1;
          (child as THREE.Mesh).scale.setScalar(bubble.size * (1 + Math.sin(time * 5) * 0.2));
        }
      });
    }
  });

  return (
    <group ref={bubblesRef} position={position}>
      {bubbles.map((bubble) => (
        <mesh key={bubble.id} position={[bubble.x, 0, bubble.z]}>
          <sphereGeometry args={[bubble.size, 8, 8]} />
          <meshStandardMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// ============= PRECIPITATE EFFECT =============
interface PrecipitateEffect3DProps {
  position?: [number, number, number];
  color?: number;
  amount?: number;
}

export function PrecipitateEffect3D({
  position = [0, -0.8, 0],
  color = 0xffffff,
  amount = 1
}: PrecipitateEffect3DProps) {
  const [particles] = useState(() =>
    Array.from({ length: Math.floor(30 * amount) }, () => ({
      x: (Math.random() - 0.5) * 0.5,
      z: (Math.random() - 0.5) * 0.5,
      size: 0.01 + Math.random() * 0.03,
    }))
  );

  return (
    <group position={position}>
      {/* Base layer */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.05 * amount, 32]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>

      {/* Individual particles settling */}
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, 0.03 + Math.random() * 0.05, p.z]}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
