import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useEnvironment, MeshTransmissionMaterial, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

// ============= PHOTOREALISTIC BEAKER =============
interface RealisticBeaker3DProps {
  position: [number, number, number];
  liquidLevel?: number;
  liquidColor?: string;
  isDamaged?: boolean;
  isBoiling?: boolean;
  capacity?: number;
  onSelect?: () => void;
}

export function RealisticBeaker3D({
  position,
  liquidLevel = 0,
  liquidColor = "#4a9eff",
  isDamaged = false,
  isBoiling = false,
  capacity = 500,
  onSelect
}: RealisticBeaker3DProps) {
  const [hovered, setHovered] = useState(false);
  const liquidRef = useRef<THREE.Mesh>(null);
  const surfaceRef = useRef<THREE.Mesh>(null);
  const bubblesRef = useRef<THREE.Group>(null);
  const glassRef = useRef<THREE.Mesh>(null);

  // Create realistic beaker profile using lathe geometry
  const beakerProfile = useMemo(() => {
    const points: THREE.Vector2[] = [];
    // Bottom
    points.push(new THREE.Vector2(0.01, 0));
    points.push(new THREE.Vector2(0.42, 0));
    points.push(new THREE.Vector2(0.44, 0.02));
    // Slight taper up the body
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const y = 0.02 + t * 0.96;
      const r = 0.44 + t * 0.06; // Slight outward taper
      points.push(new THREE.Vector2(r, y));
    }
    // Spout area
    points.push(new THREE.Vector2(0.52, 0.98));
    points.push(new THREE.Vector2(0.54, 1));
    // Rim thickness
    points.push(new THREE.Vector2(0.54, 1.02));
    points.push(new THREE.Vector2(0.51, 1.02));
    points.push(new THREE.Vector2(0.49, 1));
    return points;
  }, []);

  // Animate boiling effect
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    if (liquidRef.current && isBoiling) {
      liquidRef.current.position.y = liquidLevel * 0.45 + Math.sin(t * 12) * 0.015;
    }
    
    if (surfaceRef.current && isBoiling) {
      (surfaceRef.current.material as THREE.MeshPhysicalMaterial).roughness = 
        0.1 + Math.sin(t * 15) * 0.05;
    }
    
    if (bubblesRef.current && isBoiling) {
      bubblesRef.current.children.forEach((bubble, i) => {
        const speed = 0.8 + (i % 4) * 0.3;
        const offset = i * 0.37;
        bubble.position.y = ((t * speed + offset) % 1) * liquidLevel * 0.8;
        bubble.position.x = Math.sin(t * 3 + i * 1.5) * 0.15;
        bubble.position.z = Math.cos(t * 2.5 + i) * 0.15;
        const scale = 0.015 + Math.sin(t * 10 + i) * 0.008;
        bubble.scale.setScalar(scale);
      });
    }

    // Subtle glass shimmer
    if (glassRef.current) {
      const mat = glassRef.current.material as THREE.MeshPhysicalMaterial;
      mat.envMapIntensity = 1.2 + Math.sin(t * 0.5) * 0.1;
    }
  });

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Selection highlight */}
      {hovered && (
        <mesh scale={1.08}>
          <cylinderGeometry args={[0.58, 0.48, 1.08, 32]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.12} />
        </mesh>
      )}

      {/* Main glass body - using advanced physical material */}
      <mesh ref={glassRef} castShadow receiveShadow>
        <latheGeometry args={[beakerProfile, 64]} />
        <meshPhysicalMaterial
          color={isDamaged ? "#aabbcc" : "#f0f8ff"}
          transparent
          opacity={0.08}
          roughness={0.02}
          metalness={0}
          transmission={0.96}
          thickness={1.5}
          envMapIntensity={1.5}
          clearcoat={1}
          clearcoatRoughness={0.02}
          ior={1.52}
          attenuationColor={new THREE.Color("#e8f4ff")}
          attenuationDistance={2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner glass wall for depth */}
      <mesh>
        <cylinderGeometry args={[0.42, 0.40, 0.95, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#f8fcff"
          transparent
          opacity={0.04}
          roughness={0.01}
          transmission={0.98}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Glass bottom thickness */}
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.03, 32]} />
        <meshPhysicalMaterial
          color="#e8f4ff"
          transparent
          opacity={0.12}
          roughness={0.05}
          transmission={0.88}
        />
      </mesh>

      {/* Graduation marks - white etched lines */}
      {[100, 200, 300, 400, 500].map((ml, i) => {
        const y = 0.1 + (i * 0.18);
        return (
          <group key={ml}>
            {/* Main line */}
            <mesh position={[0.47, y, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.002, 0.06, 0.002]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
            </mesh>
            {/* Number */}
            <Html position={[0.52, y, 0]} center transform scale={0.03}>
              <div className="text-[10px] font-mono text-white/80 font-bold whitespace-nowrap">
                {ml}
              </div>
            </Html>
          </group>
        );
      })}

      {/* Pouring spout - realistic wedge shape */}
      <mesh position={[0.48, 0.98, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.15, 0.06, 0.12]} />
        <meshPhysicalMaterial
          color="#f0f8ff"
          transparent
          opacity={0.1}
          transmission={0.95}
          roughness={0.02}
        />
      </mesh>

      {/* Cracks if damaged */}
      {isDamaged && (
        <group>
          {[
            { pos: [0.38, 0.3, 0.22] as [number, number, number], rot: [0.3, 0.5, 0.6] as [number, number, number], len: 0.5 },
            { pos: [0.32, 0.5, 0.28] as [number, number, number], rot: [0.1, 0.3, 0.4] as [number, number, number], len: 0.35 },
            { pos: [0.28, 0.2, 0.32] as [number, number, number], rot: [-0.2, 0.6, 0.2] as [number, number, number], len: 0.25 },
          ].map((crack, i) => (
            <mesh key={i} position={crack.pos} rotation={crack.rot}>
              <boxGeometry args={[0.003, crack.len, 0.002]} />
              <meshBasicMaterial color="#111111" transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
      )}

      {/* Liquid with realistic refraction */}
      {liquidLevel > 0 && (
        <group>
          {/* Liquid body */}
          <mesh ref={liquidRef} position={[0, liquidLevel * 0.45, 0]}>
            <cylinderGeometry args={[0.41, 0.39, liquidLevel * 0.9, 32]} />
            <meshPhysicalMaterial
              color={liquidColor}
              transparent
              opacity={0.85}
              roughness={0.05}
              metalness={0}
              transmission={0.4}
              thickness={0.8}
              ior={1.33}
            />
          </mesh>

          {/* Liquid surface with meniscus */}
          <mesh 
            ref={surfaceRef}
            position={[0, liquidLevel * 0.9, 0]} 
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.40, 32]} />
            <meshPhysicalMaterial
              color={liquidColor}
              transparent
              opacity={0.6}
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>

          {/* Meniscus edge */}
          <mesh position={[0, liquidLevel * 0.9, 0]}>
            <torusGeometry args={[0.39, 0.015, 8, 32]} />
            <meshPhysicalMaterial
              color={liquidColor}
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>
      )}

      {/* Boiling bubbles */}
      {isBoiling && liquidLevel > 0 && (
        <group ref={bubblesRef} position={[0, 0.05, 0]}>
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh 
              key={i} 
              position={[
                (Math.random() - 0.5) * 0.5,
                0,
                (Math.random() - 0.5) * 0.5
              ]}
            >
              <sphereGeometry args={[0.02, 12, 12]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.7}
                roughness={0}
                transmission={0.6}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Steam when boiling */}
      {isBoiling && (
        <SteamEffect position={[0, 1.1, 0]} intensity={1} />
      )}

      {/* Hover tooltip */}
      {hovered && (
        <Html position={[0, 1.3, 0]} center>
          <div className="bg-slate-900/95 border border-cyan-400/50 px-4 py-2 rounded-lg shadow-2xl backdrop-blur-md">
            <p className="text-sm font-bold text-cyan-100">Borosilicate Beaker</p>
            <p className="text-xs text-slate-300">{capacity}mL | Pyrex Glass</p>
            {isDamaged && <p className="text-xs text-red-400 mt-1">⚠️ Cracked - Replace!</p>}
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= STEAM EFFECT =============
function SteamEffect({ position, intensity }: { position: [number, number, number], intensity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.children.forEach((child, i) => {
        child.position.y = ((t * 0.3 + i * 0.15) % 1) * 0.8;
        child.position.x = Math.sin(t + i * 0.5) * 0.1;
        child.rotation.y = t * 0.5;
        const scale = 0.8 + ((t * 0.3 + i * 0.15) % 1) * 0.5;
        child.scale.setScalar(scale);
        const mesh = child as THREE.Mesh;
        if (mesh.material && !Array.isArray(mesh.material)) {
          (mesh.material as THREE.MeshStandardMaterial).opacity = 0.2 - ((t * 0.3 + i * 0.15) % 1) * 0.15;
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.1, 0]}>
          <sphereGeometry args={[0.08 + i * 0.02, 8, 8]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.15} 
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ============= REALISTIC ERLENMEYER FLASK =============
interface RealisticFlask3DProps {
  position: [number, number, number];
  liquidLevel?: number;
  liquidColor?: string;
  hasVapor?: boolean;
  onSelect?: () => void;
}

export function RealisticFlask3D({
  position,
  liquidLevel = 0,
  liquidColor = "#4a9eff",
  hasVapor = false,
  onSelect
}: RealisticFlask3DProps) {
  const [hovered, setHovered] = useState(false);
  const glassRef = useRef<THREE.Mesh>(null);

  // Create authentic Erlenmeyer profile
  const flaskProfile = useMemo(() => {
    const points: THREE.Vector2[] = [];
    // Flat bottom
    points.push(new THREE.Vector2(0.01, 0));
    points.push(new THREE.Vector2(0.52, 0));
    points.push(new THREE.Vector2(0.54, 0.02));
    // Conical body with proper curve
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const y = 0.02 + t * 0.6;
      // Smooth conical taper
      const r = 0.54 - t * 0.42;
      points.push(new THREE.Vector2(r, y));
    }
    // Neck
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const y = 0.62 + t * 0.35;
      points.push(new THREE.Vector2(0.12, y));
    }
    // Lip/rim
    points.push(new THREE.Vector2(0.14, 0.97));
    points.push(new THREE.Vector2(0.15, 1));
    points.push(new THREE.Vector2(0.15, 1.02));
    points.push(new THREE.Vector2(0.12, 1.02));
    return points;
  }, []);

  useFrame((state) => {
    if (glassRef.current) {
      const mat = glassRef.current.material as THREE.MeshPhysicalMaterial;
      mat.envMapIntensity = 1.3 + Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {hovered && (
        <mesh scale={1.1}>
          <coneGeometry args={[0.6, 1.1, 32]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.1} />
        </mesh>
      )}

      {/* Main glass body */}
      <mesh ref={glassRef} castShadow receiveShadow>
        <latheGeometry args={[flaskProfile, 64]} />
        <meshPhysicalMaterial
          color="#f0f8ff"
          transparent
          opacity={0.06}
          roughness={0.02}
          metalness={0}
          transmission={0.97}
          thickness={1.2}
          envMapIntensity={1.5}
          clearcoat={1}
          clearcoatRoughness={0.01}
          ior={1.52}
          attenuationColor={new THREE.Color("#e8f4ff")}
          attenuationDistance={2.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Graduation marks on neck */}
      {[50, 100, 150, 200, 250].map((ml, i) => {
        const y = 0.15 + i * 0.12;
        return (
          <mesh key={ml} position={[0.52 - i * 0.06, y, 0]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.002, 0.04, 0.002]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        );
      })}

      {/* Liquid */}
      {liquidLevel > 0 && (
        <mesh position={[0, liquidLevel * 0.3, 0]}>
          <coneGeometry args={[0.35 + (1 - liquidLevel) * 0.15, liquidLevel * 0.6, 32]} />
          <meshPhysicalMaterial
            color={liquidColor}
            transparent
            opacity={0.8}
            roughness={0.05}
            transmission={0.35}
            ior={1.33}
          />
        </mesh>
      )}

      {/* Vapor from neck */}
      {hasVapor && <SteamEffect position={[0, 1.1, 0]} intensity={0.5} />}

      {hovered && (
        <Html position={[0, 1.3, 0]} center>
          <div className="bg-slate-900/95 border border-cyan-400/50 px-4 py-2 rounded-lg shadow-2xl backdrop-blur-md">
            <p className="text-sm font-bold text-cyan-100">Erlenmeyer Flask</p>
            <p className="text-xs text-slate-300">250mL | Borosilicate</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= REALISTIC TEST TUBE =============
interface RealisticTestTube3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  liquidLevel?: number;
  liquidColor?: string;
  onSelect?: () => void;
}

export function RealisticTestTube3D({
  position,
  rotation = [0, 0, 0],
  liquidLevel = 0,
  liquidColor = "#4a9eff",
  onSelect
}: RealisticTestTube3DProps) {
  const [hovered, setHovered] = useState(false);

  // Create test tube profile with rounded bottom
  const tubeProfile = useMemo(() => {
    const points: THREE.Vector2[] = [];
    // Rounded bottom
    for (let i = 0; i <= 12; i++) {
      const angle = (i / 12) * Math.PI / 2;
      const x = Math.cos(angle) * 0.085;
      const y = -0.35 + (1 - Math.sin(angle)) * 0.085;
      points.push(new THREE.Vector2(x, y));
    }
    // Straight tube body
    points.push(new THREE.Vector2(0.085, -0.26));
    points.push(new THREE.Vector2(0.085, 0.35));
    // Lip at top
    points.push(new THREE.Vector2(0.095, 0.36));
    points.push(new THREE.Vector2(0.1, 0.38));
    points.push(new THREE.Vector2(0.095, 0.4));
    points.push(new THREE.Vector2(0.085, 0.4));
    return points;
  }, []);

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Glass tube */}
      <mesh castShadow>
        <latheGeometry args={[tubeProfile, 32]} />
        <meshPhysicalMaterial
          color="#f8fcff"
          transparent
          opacity={0.05}
          roughness={0.01}
          transmission={0.98}
          thickness={0.8}
          clearcoat={1}
          ior={1.52}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Liquid with proper shape */}
      {liquidLevel > 0 && (
        <group>
          {/* Liquid column */}
          <mesh position={[0, -0.26 + liquidLevel * 0.3, 0]}>
            <cylinderGeometry args={[0.072, 0.072, liquidLevel * 0.55, 16]} />
            <meshPhysicalMaterial
              color={liquidColor}
              transparent
              opacity={0.85}
              roughness={0.05}
              transmission={0.3}
              ior={1.33}
            />
          </mesh>
          {/* Liquid bottom cap */}
          <mesh position={[0, -0.30, 0]}>
            <sphereGeometry args={[0.072, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial
              color={liquidColor}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Surface */}
          <mesh position={[0, -0.26 + liquidLevel * 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.07, 16]} />
            <meshPhysicalMaterial color={liquidColor} transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {hovered && (
        <Html position={[0, 0.6, 0]} center>
          <div className="bg-slate-900/95 border border-cyan-400/50 px-3 py-2 rounded-lg shadow-2xl">
            <p className="text-sm font-bold text-cyan-100">Test Tube</p>
            <p className="text-xs text-slate-300">15mL | Borosilicate</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= REALISTIC BUNSEN BURNER =============
interface RealisticBunsenBurner3DProps {
  position: [number, number, number];
  isActive?: boolean;
  flameIntensity?: number;
  flameType?: "safety" | "blue" | "yellow";
  onSelect?: () => void;
}

export function RealisticBunsenBurner3D({
  position,
  isActive = false,
  flameIntensity = 1,
  flameType = "blue",
  onSelect
}: RealisticBunsenBurner3DProps) {
  const [hovered, setHovered] = useState(false);
  const outerFlameRef = useRef<THREE.Mesh>(null);
  const innerFlameRef = useRef<THREE.Mesh>(null);
  const coreFlameRef = useRef<THREE.Mesh>(null);

  const flameColors = {
    safety: { outer: "#ff6600", inner: "#ff9933", core: "#ffcc00", light: "#ff6600" },
    blue: { outer: "#0066cc", inner: "#0099ff", core: "#66ccff", light: "#0099ff" },
    yellow: { outer: "#ff9900", inner: "#ffcc00", core: "#ffff66", light: "#ffcc00" }
  };
  const colors = flameColors[flameType];

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    if (outerFlameRef.current && isActive) {
      outerFlameRef.current.scale.y = 0.85 + Math.sin(t * 18) * 0.12 + Math.sin(t * 31) * 0.06;
      outerFlameRef.current.scale.x = 0.9 + Math.sin(t * 14) * 0.1;
      outerFlameRef.current.scale.z = 0.9 + Math.sin(t * 22) * 0.1;
      outerFlameRef.current.rotation.y = Math.sin(t * 8) * 0.08;
    }
    
    if (innerFlameRef.current && isActive) {
      innerFlameRef.current.scale.y = 0.9 + Math.sin(t * 25) * 0.08;
      innerFlameRef.current.scale.x = 0.95 + Math.sin(t * 20) * 0.06;
    }
    
    if (coreFlameRef.current && isActive) {
      coreFlameRef.current.scale.y = 0.95 + Math.sin(t * 30) * 0.05;
    }
  });

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Heavy cast iron base */}
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.25, 0.05, 32]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.95} 
          roughness={0.35}
        />
      </mesh>

      {/* Base detail ring */}
      <mesh position={[0, 0.055, 0]}>
        <torusGeometry args={[0.22, 0.008, 8, 32]} />
        <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Gas inlet at bottom */}
      <mesh position={[0.2, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.12, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Main barrel */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.085, 0.42, 24]} />
        <meshStandardMaterial 
          color="#1a2530" 
          metalness={0.88} 
          roughness={0.22}
        />
      </mesh>

      {/* Air intake collar with holes */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.095, 0.095, 0.06, 24]} />
        <meshStandardMaterial color="#2a3540" metalness={0.85} roughness={0.28} />
      </mesh>

      {/* Air hole indicators */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos(i * Math.PI / 3) * 0.092,
            0.12,
            Math.sin(i * Math.PI / 3) * 0.092
          ]}
        >
          <boxGeometry args={[0.008, 0.04, 0.015]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      ))}

      {/* Burner tube (chimney) */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.045, 0.052, 0.08, 16]} />
        <meshStandardMaterial color="#1a2530" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Burner rim */}
      <mesh position={[0, 0.545, 0]}>
        <torusGeometry args={[0.045, 0.005, 8, 24]} />
        <meshStandardMaterial color="#333333" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Flame when active */}
      {isActive && (
        <group position={[0, 0.58, 0]}>
          {/* Outer flame */}
          <mesh ref={outerFlameRef}>
            <coneGeometry args={[0.06 * flameIntensity, 0.35 * flameIntensity, 16]} />
            <meshStandardMaterial
              color={colors.outer}
              emissive={colors.outer}
              emissiveIntensity={2}
              transparent
              opacity={0.6}
              depthWrite={false}
            />
          </mesh>
          
          {/* Inner flame */}
          <mesh ref={innerFlameRef} position={[0, -0.02, 0]}>
            <coneGeometry args={[0.04 * flameIntensity, 0.28 * flameIntensity, 12]} />
            <meshStandardMaterial
              color={colors.inner}
              emissive={colors.inner}
              emissiveIntensity={3}
              transparent
              opacity={0.7}
              depthWrite={false}
            />
          </mesh>
          
          {/* Core flame (hottest) */}
          <mesh ref={coreFlameRef} position={[0, -0.04, 0]}>
            <coneGeometry args={[0.02 * flameIntensity, 0.18 * flameIntensity, 8]} />
            <meshStandardMaterial
              color={colors.core}
              emissive={colors.core}
              emissiveIntensity={4}
              transparent
              opacity={0.9}
              depthWrite={false}
            />
          </mesh>

          {/* Light source */}
          <pointLight 
            color={colors.light} 
            intensity={3 * flameIntensity} 
            distance={3} 
            decay={2}
          />
        </group>
      )}

      {hovered && (
        <Html position={[0, 0.9, 0]} center>
          <div className="bg-slate-900/95 border border-cyan-400/50 px-4 py-2 rounded-lg shadow-2xl">
            <p className="text-sm font-bold text-cyan-100">Bunsen Burner</p>
            <p className="text-xs text-slate-300">
              {isActive ? `${flameType} flame active` : "Off"}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= REALISTIC TRIPOD STAND =============
interface RealisticTripod3DProps {
  position: [number, number, number];
  onSelect?: () => void;
}

export function RealisticTripod3D({ position, onSelect }: RealisticTripod3DProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Three legs */}
      {[0, 1, 2].map((i) => {
        const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
        return (
          <mesh 
            key={i}
            position={[Math.cos(angle) * 0.22, 0.18, Math.sin(angle) * 0.22]}
            rotation={[0.35, angle, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.012, 0.018, 0.45, 8]} />
            <meshStandardMaterial 
              color="#1a1a1a" 
              metalness={0.92} 
              roughness={0.25}
            />
          </mesh>
        );
      })}

      {/* Top ring */}
      <mesh position={[0, 0.38, 0]}>
        <torusGeometry args={[0.14, 0.012, 8, 32]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Wire gauze on top */}
      <mesh position={[0, 0.395, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.13, 32]} />
        <meshStandardMaterial 
          color="#888888" 
          metalness={0.8} 
          roughness={0.4}
          wireframe
        />
      </mesh>
      <mesh position={[0, 0.394, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.13, 32]} />
        <meshStandardMaterial 
          color="#777777" 
          metalness={0.7} 
          roughness={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>

      {hovered && (
        <Html position={[0, 0.6, 0]} center>
          <div className="bg-slate-900/95 border border-cyan-400/50 px-3 py-2 rounded-lg shadow-2xl">
            <p className="text-sm font-bold text-cyan-100">Tripod Stand</p>
            <p className="text-xs text-slate-300">With wire gauze</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= REALISTIC THERMOMETER =============
interface RealisticThermometer3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  temperature?: number;
  onSelect?: () => void;
}

export function RealisticThermometer3D({
  position,
  rotation = [0, 0, 0],
  temperature = 25,
  onSelect
}: RealisticThermometer3DProps) {
  const [hovered, setHovered] = useState(false);
  
  // Calculate mercury height (0-100°C scale)
  const mercuryHeight = Math.min(1, Math.max(0, temperature / 100));
  const mercuryColor = temperature > 60 ? "#ff3333" : "#ff0000";

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Glass tube */}
      <mesh>
        <cylinderGeometry args={[0.025, 0.025, 0.8, 16]} />
        <meshPhysicalMaterial
          color="#f8fcff"
          transparent
          opacity={0.08}
          roughness={0.01}
          transmission={0.97}
          thickness={0.5}
        />
      </mesh>

      {/* Bulb at bottom */}
      <mesh position={[0, -0.42, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshPhysicalMaterial
          color="#f8fcff"
          transparent
          opacity={0.1}
          transmission={0.95}
        />
      </mesh>

      {/* Mercury in bulb */}
      <mesh position={[0, -0.42, 0]}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshStandardMaterial color={mercuryColor} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Mercury column */}
      <mesh position={[0, -0.38 + mercuryHeight * 0.35, 0]}>
        <cylinderGeometry args={[0.008, 0.008, mercuryHeight * 0.7, 8]} />
        <meshStandardMaterial color={mercuryColor} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Scale markings */}
      {[0, 20, 40, 60, 80, 100].map((temp, i) => {
        const y = -0.35 + (temp / 100) * 0.7;
        return (
          <group key={temp}>
            <mesh position={[0.03, y, 0]}>
              <boxGeometry args={[0.015, 0.001, 0.002]} />
              <meshBasicMaterial color="#333333" />
            </mesh>
          </group>
        );
      })}

      {/* Temperature display */}
      <Html position={[0.08, 0, 0]} center>
        <div className="text-[8px] font-mono text-white bg-black/60 px-1 rounded">
          {temperature.toFixed(1)}°C
        </div>
      </Html>

      {hovered && (
        <Html position={[0, 0.55, 0]} center>
          <div className="bg-slate-900/95 border border-cyan-400/50 px-3 py-2 rounded-lg shadow-2xl">
            <p className="text-sm font-bold text-cyan-100">Mercury Thermometer</p>
            <p className="text-xs text-slate-300">Range: 0-100°C</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= REALISTIC CHEMICAL BOTTLE =============
interface RealisticChemicalBottle3DProps {
  position: [number, number, number];
  chemicalName?: string;
  chemicalColor?: string;
  hazardLevel?: "none" | "low" | "medium" | "high" | "extreme";
  fillLevel?: number;
  onSelect?: () => void;
}

export function RealisticChemicalBottle3D({
  position,
  chemicalName = "Chemical",
  chemicalColor = "#4a9eff",
  hazardLevel = "low",
  fillLevel = 0.7,
  onSelect
}: RealisticChemicalBottle3DProps) {
  const [hovered, setHovered] = useState(false);

  const hazardColors = {
    none: "#2ecc71",
    low: "#3498db",
    medium: "#f1c40f",
    high: "#e67e22",
    extreme: "#e74c3c"
  };

  // Bottle profile
  const bottleProfile = useMemo(() => {
    const points: THREE.Vector2[] = [];
    // Bottom
    points.push(new THREE.Vector2(0.01, 0));
    points.push(new THREE.Vector2(0.22, 0));
    points.push(new THREE.Vector2(0.24, 0.02));
    // Body
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      points.push(new THREE.Vector2(0.24, 0.02 + t * 0.45));
    }
    // Shoulder
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const y = 0.47 + t * 0.15;
      const r = 0.24 - t * 0.14;
      points.push(new THREE.Vector2(r, y));
    }
    // Neck
    points.push(new THREE.Vector2(0.1, 0.65));
    points.push(new THREE.Vector2(0.1, 0.75));
    return points;
  }, []);

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Glass bottle body */}
      <mesh castShadow>
        <latheGeometry args={[bottleProfile, 32]} />
        <meshPhysicalMaterial
          color="#f0f8ff"
          transparent
          opacity={0.08}
          roughness={0.03}
          transmission={0.95}
          thickness={1}
          ior={1.52}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Liquid inside */}
      {fillLevel > 0 && (
        <mesh position={[0, fillLevel * 0.22, 0]}>
          <cylinderGeometry args={[0.2, 0.2, fillLevel * 0.44, 24]} />
          <meshPhysicalMaterial
            color={chemicalColor}
            transparent
            opacity={0.8}
            roughness={0.1}
            transmission={0.3}
            ior={1.33}
          />
        </mesh>
      )}

      {/* Cap */}
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.06, 16]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.1} 
          roughness={0.8}
        />
      </mesh>

      {/* Hazard label strip */}
      <mesh position={[0, 0.25, 0.242]}>
        <boxGeometry args={[0.3, 0.15, 0.002]} />
        <meshStandardMaterial color={hazardColors[hazardLevel]} />
      </mesh>

      {/* Label */}
      <Html position={[0, 0.25, 0.26]} center transform scale={0.04}>
        <div className="text-center px-2 py-1 bg-white rounded shadow-sm" style={{ width: '100px' }}>
          <p className="text-[9px] font-bold text-gray-800 truncate">{chemicalName}</p>
          <p className="text-[7px] text-gray-600">⚠ {hazardLevel.toUpperCase()}</p>
        </div>
      </Html>

      {hovered && (
        <Html position={[0, 1, 0]} center>
          <div className="bg-slate-900/95 border border-cyan-400/50 px-4 py-2 rounded-lg shadow-2xl">
            <p className="text-sm font-bold text-cyan-100">{chemicalName}</p>
            <p className="text-xs text-slate-300">Hazard: {hazardLevel}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= REALISTIC PH METER =============
interface RealisticPHMeter3DProps {
  position: [number, number, number];
  currentPH?: number;
  isActive?: boolean;
  onSelect?: () => void;
}

export function RealisticPHMeter3D({
  position,
  currentPH = 7,
  isActive = true,
  onSelect
}: RealisticPHMeter3DProps) {
  const [hovered, setHovered] = useState(false);
  const [displayPH, setDisplayPH] = useState(currentPH);
  
  // Animate pH reading
  useEffect(() => {
    if (isActive) {
      const timer = setInterval(() => {
        setDisplayPH(prev => {
          const diff = currentPH - prev;
          if (Math.abs(diff) < 0.01) return currentPH;
          return prev + diff * 0.1;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [currentPH, isActive]);

  // pH color scale
  const getPHColor = (ph: number) => {
    if (ph < 3) return "#ff0000";
    if (ph < 5) return "#ff6600";
    if (ph < 6) return "#ffcc00";
    if (ph < 7) return "#ccff00";
    if (ph < 8) return "#00ff00";
    if (ph < 9) return "#00ffcc";
    if (ph < 11) return "#0099ff";
    return "#6600ff";
  };

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Main body/handle */}
      <RoundedBox args={[0.12, 0.35, 0.04]} radius={0.015} position={[0, 0.15, 0]}>
        <meshStandardMaterial color="#2c3e50" metalness={0.3} roughness={0.7} />
      </RoundedBox>

      {/* Display screen */}
      <mesh position={[0, 0.25, 0.022]}>
        <boxGeometry args={[0.09, 0.06, 0.002]} />
        <meshStandardMaterial 
          color={isActive ? "#001122" : "#111111"} 
          emissive={isActive ? "#003366" : "#000000"}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* pH reading display */}
      {isActive && (
        <Html position={[0, 0.25, 0.03]} center transform scale={0.025}>
          <div className="font-mono text-xl font-bold" style={{ color: getPHColor(displayPH) }}>
            pH {displayPH.toFixed(2)}
          </div>
        </Html>
      )}

      {/* Electrode probe */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.018, 0.015, 0.25, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Glass bulb at tip */}
      <mesh position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.018, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#f8fcff"
          transparent
          opacity={0.15}
          transmission={0.9}
          roughness={0.02}
        />
      </mesh>

      {/* Fill liquid in bulb */}
      <mesh position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.014, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#eeeeee" transparent opacity={0.5} />
      </mesh>

      {hovered && (
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-slate-900/95 border border-cyan-400/50 px-4 py-2 rounded-lg shadow-2xl">
            <p className="text-sm font-bold text-cyan-100">Digital pH Meter</p>
            <p className="text-xs text-slate-300">
              {isActive ? `Reading: ${displayPH.toFixed(2)}` : "Off"}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============= MICROSCOPE =============
interface RealisticMicroscope3DProps {
  position: [number, number, number];
  magnification?: number;
  onSelect?: () => void;
}

export function RealisticMicroscope3D({
  position,
  magnification = 100,
  onSelect
}: RealisticMicroscope3DProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* Base */}
      <RoundedBox args={[0.5, 0.04, 0.35]} radius={0.01} position={[0, 0.02, 0]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.8} />
      </RoundedBox>

      {/* Arm (C-shaped support) */}
      <mesh position={[-0.15, 0.35, 0]}>
        <boxGeometry args={[0.06, 0.65, 0.08]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Top arm horizontal */}
      <mesh position={[0.05, 0.65, 0]}>
        <boxGeometry args={[0.35, 0.05, 0.08]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Eyepiece */}
      <mesh position={[0.15, 0.75, 0]}>
        <cylinderGeometry args={[0.04, 0.035, 0.15, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Eyepiece lens */}
      <mesh position={[0.15, 0.83, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.01, 16]} />
        <meshPhysicalMaterial
          color="#ccddff"
          transparent
          opacity={0.3}
          transmission={0.8}
        />
      </mesh>

      {/* Objective turret */}
      <mesh position={[0.15, 0.55, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Objective lenses */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI / 2) + Math.PI / 4;
        return (
          <mesh 
            key={i}
            position={[
              0.15 + Math.cos(angle) * 0.04,
              0.48,
              Math.sin(angle) * 0.04
            ]}
          >
            <cylinderGeometry args={[0.015, 0.012, 0.08, 8]} />
            <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.3} />
          </mesh>
        );
      })}

      {/* Stage */}
      <mesh position={[0.15, 0.25, 0]}>
        <boxGeometry args={[0.22, 0.02, 0.18]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Stage clips */}
      <mesh position={[0.22, 0.27, 0]}>
        <boxGeometry args={[0.04, 0.01, 0.02]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Focus knobs */}
      <mesh position={[-0.19, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Light source */}
      <mesh position={[0.15, 0.08, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.08, 16]} />
        <meshStandardMaterial color="#222222" metalness={0.4} roughness={0.6} />
      </mesh>

      {hovered && (
        <Html position={[0, 1, 0]} center>
          <div className="bg-slate-900/95 border border-cyan-400/50 px-4 py-2 rounded-lg shadow-2xl">
            <p className="text-sm font-bold text-cyan-100">Compound Microscope</p>
            <p className="text-xs text-slate-300">{magnification}x magnification</p>
          </div>
        </Html>
      )}
    </group>
  );
}
