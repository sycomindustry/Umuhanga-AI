import { useRef, useState, useMemo, useEffect } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// Chemical types with visual properties
export interface ChemicalContent {
  id: string;
  name: string;
  color: string;
  amount: number; // in mL
  pH: number;
  reactivity: 'low' | 'medium' | 'high' | 'explosive';
  state: 'solid' | 'liquid' | 'gas';
}

// Container types
export type ContainerType = 'beaker' | 'flask' | 'testTube' | 'cylinder';

interface InteractiveContainerProps {
  type: ContainerType;
  position: [number, number, number];
  rotation?: [number, number, number];
  capacity: number; // in mL
  contents: ChemicalContent[];
  isSelected?: boolean;
  isDropTarget?: boolean;
  isHeating?: boolean;
  temperature?: number;
  label?: string;
  reactionEffect?: 'explosion' | 'bubbles' | 'precipitate' | 'colorChange' | 'gas' | 'heat' | null;
  onSelect?: () => void;
  onHoverChange?: (hovered: boolean) => void;
  onPointerDownCapture?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUpCapture?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerMoveCapture?: (e: ThreeEvent<PointerEvent>) => void;
  onDrop?: (chemical: ChemicalContent) => void;
  onPour?: (targetId: string, amount: number) => void;
}

function getSolutionAppearance(contents: ChemicalContent[], reactionEffect?: string | null, isHeating = false, temperature = 25) {
  const hasAcid = contents.some(c => c.pH < 4);
  const hasBase = contents.some(c => c.pH > 10);
  const hasPhenolphthalein = contents.some(c => c.id === 'phenolphthalein');
  const hasUniversalIndicator = contents.some(c => c.id === 'universal_indicator');
  const hasBromothymolBlue = contents.some(c => c.id === 'bromothymol_blue');
  const hasMethylOrange = contents.some(c => c.id === 'methyl_orange');
  const hasVinegar = contents.some(c => c.id === 'vinegar');
  const hasBakingSoda = contents.some(c => c.id === 'baking_soda');
  const hasSodiumCarbonate = contents.some(c => c.id === 'sodium_carbonate');
  const hasSilverNitrate = contents.some(c => c.id === 'silver_nitrate');
  const hasPotassiumIodide = contents.some(c => c.id === 'potassium_iodide');
  const hasSodiumChloride = contents.some(c => c.id === 'nacl');
  const hasCopperSulfate = contents.some(c => c.id === 'copper_sulfate');
  const hasIronNail = contents.some(c => c.id === 'iron_nail');
  const hasHCl = contents.some(c => c.id === 'hcl');
  const hasH2SO4 = contents.some(c => c.id === 'h2so4');
  const hasHNO3 = contents.some(c => c.id === 'hno3');
  const hasH3PO4 = contents.some(c => c.id === 'h3po4');
  const hasZinc = contents.some(c => c.id === 'zinc_metal');

  let color = '#f7fbff';
  let opacity = 0.92;
  let cloudy = false;
  let bubbleIntensity = 0.3;
  let surfaceOpacity = 0.54;
  let precipitateColor: string | null = null;
  let precipitateAmount = 0;
  let foamIntensity = 0;
  let vaporColor = "#ffffff";

  if (contents.length === 1) {
    const single = contents[0];
    if (single.state === 'liquid') {
      color = single.color;
      opacity = single.pH < 4 || single.pH > 10 ? 0.9 : 0.84;
      surfaceOpacity = single.pH < 4 ? 0.68 : 0.56;
      bubbleIntensity = single.pH < 4 ? 0.26 : single.pH > 10 ? 0.18 : 0.08;
      cloudy = false;
    } else {
      color = single.color || '#f7fbff';
      cloudy = true;
      opacity = 0.94;
    }
  } else {
    const totalVolume = contents.reduce((sum, c) => sum + c.amount, 0) || 1;
    const liquidContents = contents.filter((c) => c.state === 'liquid');

    if (liquidContents.length) {
      const weightedColor = liquidContents.reduce(
        (acc, item) => {
          const itemColor = new THREE.Color(item.color);
          const weight = item.amount / totalVolume;
          acc.r += itemColor.r * weight;
          acc.g += itemColor.g * weight;
          acc.b += itemColor.b * weight;
          return acc;
        },
        { r: 0, g: 0, b: 0 },
      );

      color = new THREE.Color(weightedColor.r, weightedColor.g, weightedColor.b).getStyle();
    }

    if (hasAcid && !hasBase) {
      color = hasH2SO4
        ? '#f8d36b'
        : hasHNO3
          ? '#ffe37a'
          : hasH3PO4
            ? '#f6e8b3'
            : hasHCl
              ? '#e6f6ff'
              : '#f8efcc';
      bubbleIntensity = 0.2;
      opacity = 0.94;
      surfaceOpacity = 0.78;
    }
    if (hasBase && !hasAcid) {
      color = '#9ed2ff';
      bubbleIntensity = 0.15;
      opacity = 0.88;
      surfaceOpacity = 0.62;
    }
    if (hasAcid && hasBase) {
      color = hasPhenolphthalein ? '#ff5a8a' : '#fdf8e2';
      bubbleIntensity = 0.42;
      cloudy = true;
      opacity = 0.95;
      surfaceOpacity = 0.66;
    }
  }

  if ((hasVinegar && hasBakingSoda) || (hasAcid && (hasBakingSoda || hasSodiumCarbonate))) {
    color = '#fce9b3';
    cloudy = true;
    bubbleIntensity = 1.1;
    opacity = 0.95;
    foamIntensity = 0.82;
    surfaceOpacity = 0.78;
  }

  if (hasSilverNitrate && hasPotassiumIodide) {
    color = '#f3e8a6';
    cloudy = true;
    bubbleIntensity = 0.1;
    opacity = 0.96;
    precipitateColor = '#ffd700';
    precipitateAmount = 0.18;
  }

  if (hasSilverNitrate && hasSodiumChloride) {
    color = '#f8fafc';
    cloudy = true;
    bubbleIntensity = 0.08;
    opacity = 0.97;
    precipitateColor = '#f8fafc';
    precipitateAmount = 0.16;
  }

  if (hasCopperSulfate && hasIronNail) {
    color = '#8fd0ff';
    cloudy = true;
    bubbleIntensity = 0.1;
    opacity = 0.95;
    precipitateColor = '#b87333';
    precipitateAmount = 0.14;
  }

  if (hasCopperSulfate && hasBase) {
    color = '#87ceeb';
    cloudy = true;
    bubbleIntensity = 0.06;
    opacity = 0.97;
    precipitateColor = '#87ceeb';
    precipitateAmount = 0.18;
  }

  if (hasHCl && hasZinc) {
    color = '#eef6ff';
    bubbleIntensity = 1.0;
    cloudy = true;
    opacity = 0.95;
    foamIntensity = 0.18;
  }

  if (hasPhenolphthalein && hasBase) {
    color = '#ff69b4';
    opacity = 0.95;
  }

  if (hasMethylOrange) {
    if (hasAcid) color = '#ff4d4d';
    else if (hasBase) color = '#ffd54f';
    else color = '#ffb347';
    opacity = 0.95;
  }

  if (hasBromothymolBlue) {
    if (hasAcid) color = '#facc15';
    else if (hasBase) color = '#3b82f6';
    else color = '#22c55e';
    opacity = 0.95;
  }

  if (hasUniversalIndicator) {
    const avgPH = contents.reduce((sum, item) => sum + item.pH * item.amount, 0) / (contents.reduce((sum, item) => sum + item.amount, 0) || 1);
    if (avgPH < 3) color = '#ef4444';
    else if (avgPH < 5) color = '#f97316';
    else if (avgPH < 6) color = '#facc15';
    else if (avgPH < 8) color = '#22c55e';
    else if (avgPH < 10) color = '#3b82f6';
    else color = '#7c3aed';
    opacity = 0.95;
  }

  if (reactionEffect === 'explosion') {
    color = '#fff1c2';
    cloudy = true;
    bubbleIntensity = 1.25;
    foamIntensity = 0.5;
  } else if (reactionEffect === 'precipitate') {
    cloudy = true;
    bubbleIntensity = Math.max(bubbleIntensity, 0.1);
  } else if (reactionEffect === 'gas' || reactionEffect === 'bubbles') {
    bubbleIntensity = 0.9;
    foamIntensity = Math.max(foamIntensity, 0.25);
  } else if (reactionEffect === 'colorChange') {
    color = '#ffcf66';
    bubbleIntensity = 0.6;
  }

  if (isHeating && temperature > 70) {
    bubbleIntensity = Math.max(bubbleIntensity, 0.75);
    opacity = 0.9;
    surfaceOpacity = 0.72;
    vaporColor = hasHNO3 ? "#c98b49" : "#ffffff";
  }

  if (hasHNO3) {
    vaporColor = "#b67a3c";
  }

  return { color, opacity, cloudy, bubbleIntensity, surfaceOpacity, precipitateColor, precipitateAmount, foamIntensity, vaporColor };
}

// Bubble effect for reactions
function ReactionBubbles({ intensity, color }: { intensity: number; color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const bubbleCount = Math.floor(intensity * 15);
  
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.children.forEach((bubble, i) => {
        const speed = 0.5 + (i % 5) * 0.2;
        bubble.position.y = ((t * speed + i * 0.2) % 0.8);
        bubble.position.x = Math.sin(t * 2 + i) * 0.1;
        bubble.position.z = Math.cos(t * 1.5 + i * 0.7) * 0.1;
        const scale = 0.01 + Math.sin(t * 3 + i) * 0.005;
        bubble.scale.setScalar(scale);
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.1, 0]}>
      {Array.from({ length: bubbleCount }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.3]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.6}
            roughness={0}
            transmission={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

// Steam/vapor effect
function VaporEffect({ intensity, color = "#ffffff" }: { intensity: number; color?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.children.forEach((vapor, i) => {
        vapor.position.y = ((t * 0.2 + i * 0.1) % 0.6);
        vapor.position.x = Math.sin(t * 0.5 + i) * 0.08;
        const scale = 0.05 + ((t * 0.2 + i * 0.1) % 0.6) * 0.1;
        vapor.scale.setScalar(scale);
        const mesh = vapor as THREE.Mesh;
        if (mesh.material) {
          (mesh.material as THREE.MeshStandardMaterial).opacity = 0.3 - ((t * 0.2 + i * 0.1) % 0.6) * 0.4;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: Math.floor(intensity * 8) }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.1]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={color} transparent opacity={0.2} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function SurfaceFoam({ radius, color, intensity }: { radius: number; color: string; intensity: number }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 28]} />
        <meshStandardMaterial color={color} transparent opacity={0.12 + intensity * 0.12} />
      </mesh>
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.55, radius, 24]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.08 + intensity * 0.18} />
      </mesh>
    </group>
  );
}

function PrecipitateLayer({
  radiusTop,
  radiusBottom,
  height,
  color,
}: {
  radiusTop: number;
  radiusBottom: number;
  height: number;
  color: string;
}) {
  return (
    <mesh position={[0, -0.45 + height / 2, 0]}>
      <cylinderGeometry args={[radiusTop, radiusBottom, height, 24]} />
      <meshStandardMaterial color={color} roughness={0.92} metalness={0.02} />
    </mesh>
  );
}

// Explosion particles
function ExplosionParticles({ onComplete }: { onComplete: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now());
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 4 + 2,
        (Math.random() - 0.5) * 4
      ),
      position: new THREE.Vector3(0, 0, 0),
      color: Math.random() > 0.5 ? 0xff4400 : 0xffaa00,
    }))
  );

  useFrame((state, delta) => {
    if (groupRef.current) {
      const elapsed = (Date.now() - startTime.current) / 1000;
      particles.forEach((p, i) => {
        p.position.add(p.velocity.clone().multiplyScalar(delta));
        p.velocity.y -= 9.8 * delta;
        const child = groupRef.current!.children[i] as THREE.Mesh;
        if (child) {
          child.position.copy(p.position);
          (child.material as THREE.MeshStandardMaterial).opacity = Math.max(0, 1 - elapsed);
        }
      });

      if (elapsed > 1.5) {
        onComplete();
      }
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p) => (
        <mesh key={p.id}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={2}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
      <pointLight position={[0, 0.5, 0]} intensity={5} color={0xff4400} distance={3} decay={2} />
    </group>
  );
}

// Interactive Beaker
export function InteractiveBeaker3D({
  position,
  contents,
  capacity,
  isSelected,
  isDropTarget,
  isHeating,
  temperature = 25,
  label,
  reactionEffect,
  onSelect,
  onHoverChange,
  onPointerDownCapture,
  onPointerUpCapture,
  onPointerMoveCapture,
}: InteractiveContainerProps) {
  const [hovered, setHovered] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [isBubbling, setIsBubbling] = useState(false);
  const [isPrecipitating, setIsPrecipitating] = useState(false);
  const liquidRef = useRef<THREE.Mesh>(null);
  const glassRef = useRef<THREE.Mesh>(null);

  // Calculate total volume and mixed color
  const totalVolume = contents.reduce((sum, c) => sum + c.amount, 0);
  const fillLevel = Math.min(1, Math.max(0.16, totalVolume / capacity));
  const visibleFillLevel = fillLevel;
  const solutionAppearance = useMemo(
    () => getSolutionAppearance(contents, reactionEffect, isHeating, temperature),
    [contents, reactionEffect, isHeating, temperature]
  );
  const mixedColor = solutionAppearance.color;

  // Handle reaction effects from parent
  useEffect(() => {
    if (reactionEffect === 'explosion') {
      setIsExploding(true);
      setTimeout(() => setIsExploding(false), 3000);
    } else if (reactionEffect === 'bubbles' || reactionEffect === 'gas') {
      setIsBubbling(true);
    } else if (reactionEffect === 'precipitate') {
      setIsPrecipitating(true);
      setIsBubbling(true); // Also show some bubbling
    } else if (reactionEffect === 'heat') {
      setIsBubbling(true);
    } else if (!reactionEffect) {
      // Only reset bubbling if no heating
      if (!isHeating) {
        setIsBubbling(false);
        setIsPrecipitating(false);
      }
    }
  }, [reactionEffect, isHeating]);

  // Check for reactions internally (backup)
  useEffect(() => {
    if (contents.length >= 2) {
      const hasExplosive = contents.some(c => c.reactivity === 'explosive');
      const hasWater = contents.some(c => c.id.includes('water'));
      const hasAcid = contents.some(c => c.pH < 4);
      const hasBase = contents.some(c => c.pH > 10);

      if (hasExplosive && hasWater) {
        setIsExploding(true);
        setTimeout(() => setIsExploding(false), 3000);
      } else if ((hasAcid && hasBase) || isHeating) {
        setIsBubbling(true);
      }
    }
  }, [contents, isHeating]);

  // Beaker profile
  const beakerProfile = useMemo(() => {
    const points: THREE.Vector2[] = [];
    points.push(new THREE.Vector2(0.01, 0));
    points.push(new THREE.Vector2(0.42, 0));
    points.push(new THREE.Vector2(0.44, 0.02));
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const y = 0.02 + t * 0.96;
      const r = 0.44 + t * 0.06;
      points.push(new THREE.Vector2(r, y));
    }
    points.push(new THREE.Vector2(0.52, 0.98));
    points.push(new THREE.Vector2(0.54, 1));
    points.push(new THREE.Vector2(0.54, 1.02));
    points.push(new THREE.Vector2(0.51, 1.02));
    points.push(new THREE.Vector2(0.49, 1));
    return points;
  }, []);

  // Animate liquid when heating
  useFrame((state) => {
    if (liquidRef.current && isHeating && temperature > 60) {
      const t = state.clock.elapsedTime;
      liquidRef.current.position.y = visibleFillLevel * 0.45 + Math.sin(t * 8) * 0.01;
    }
    if (glassRef.current) {
      const mat = glassRef.current.material as THREE.MeshPhysicalMaterial;
      mat.envMapIntensity = 1.2 + Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDownCapture?.(e);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        onPointerUpCapture?.(e);
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        onPointerMoveCapture?.(e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHoverChange?.(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        onHoverChange?.(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Selection/hover highlight */}
      {(hovered || isSelected || isDropTarget) && (
        <mesh scale={1.08}>
          <cylinderGeometry args={[0.58, 0.48, 1.08, 32]} />
          <meshBasicMaterial 
            color={isSelected ? "#00aaff" : isDropTarget ? "#22d3ee" : "#00ff88"} 
            transparent 
            opacity={isSelected ? 0.2 : isDropTarget ? 0.16 : 0.12} 
          />
        </mesh>
      )}

      {/* Glass body */}
      <mesh ref={glassRef} castShadow receiveShadow>
        <latheGeometry args={[beakerProfile, 64]} />
        <meshPhysicalMaterial
          color="#f0f8ff"
          transparent
          opacity={0.11}
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

      {/* Rim and base reinforcement */}
      <mesh position={[0, 0.97, 0]}>
        <cylinderGeometry args={[0.45, 0.47, 0.025, 32]} />
        <meshPhysicalMaterial color="#edf7ff" transparent opacity={0.16} transmission={0.9} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.4, 0.41, 0.03, 32]} />
        <meshPhysicalMaterial color="#eef7ff" transparent opacity={0.14} transmission={0.9} />
      </mesh>

      {/* Graduation marks */}
      {[100, 200, 300, 400, 500].map((ml, i) => {
        const y = 0.1 + i * 0.18;
        return (
          <group key={ml}>
            <mesh position={[0.47, y, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.002, 0.05, 0.002]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
            <Html position={[0.52, y, 0]} center transform scale={0.025}>
              <div className="text-[8px] font-mono text-white/70 font-bold whitespace-nowrap">
                {ml}
              </div>
            </Html>
          </group>
        );
      })}

      {/* Liquid */}
      {fillLevel > 0 && (
        <group>
          <mesh ref={liquidRef} position={[0, fillLevel * 0.45, 0]}>
            <cylinderGeometry args={[0.41 * visibleFillLevel + 0.02, 0.39, visibleFillLevel * 0.9, 32]} />
            <meshPhysicalMaterial
              color={mixedColor}
              transparent
              opacity={solutionAppearance.opacity}
              roughness={0.05}
              metalness={0}
              transmission={0.32}
              thickness={0.8}
              ior={1.33}
            />
          </mesh>

          {/* Surface */}
          <mesh position={[0, fillLevel * 0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.40 * visibleFillLevel + 0.05, 32]} />
            <meshPhysicalMaterial
              color={mixedColor}
              transparent
              opacity={solutionAppearance.surfaceOpacity}
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>

          {/* Meniscus */}
          <mesh position={[0, fillLevel * 0.9, 0]}>
            <torusGeometry args={[0.39 * visibleFillLevel + 0.05, 0.015, 8, 32]} />
            <meshPhysicalMaterial color={mixedColor} transparent opacity={0.4} />
          </mesh>

          {solutionAppearance.foamIntensity > 0 ? (
            <group position={[0, fillLevel * 0.9 + 0.015, 0]}>
              <SurfaceFoam
                radius={0.34 * visibleFillLevel + 0.06}
                color={mixedColor}
                intensity={solutionAppearance.foamIntensity}
              />
            </group>
          ) : null}
        </group>
      )}

      {solutionAppearance.precipitateColor && solutionAppearance.precipitateAmount > 0 && fillLevel > 0 && (
        <PrecipitateLayer
          radiusTop={0.32}
          radiusBottom={0.36}
          height={solutionAppearance.precipitateAmount}
          color={solutionAppearance.precipitateColor}
        />
      )}

      {/* Bubbling effect */}
      {isBubbling && fillLevel > 0 && (
        <ReactionBubbles intensity={solutionAppearance.bubbleIntensity} color={mixedColor} />
      )}

      {(isBubbling || contents.some(c => c.pH < 4) || contents.some(c => c.pH > 10)) && fillLevel > 0 && (
        <mesh position={[0, visibleFillLevel * 0.9 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.42, 24]} />
          <meshBasicMaterial color={mixedColor} transparent opacity={0.18} />
        </mesh>
      )}

      {/* Steam when hot */}
      {(isHeating && temperature > 70) || reactionEffect === 'gas' ? (
        <group position={[0, fillLevel * 0.95 + 0.16, 0]}>
          <VaporEffect
            intensity={reactionEffect === 'gas' ? Math.max(0.55, (temperature - 50) / 35 || 0.55) : (temperature - 70) / 30}
            color={solutionAppearance.vaporColor}
          />
        </group>
      ) : null}

      {/* Explosion effect */}
      {isExploding && (
        <ExplosionParticles onComplete={() => setIsExploding(false)} />
      )}

      {/* Label */}
      {(hovered || isSelected) && (
        <Html position={[0, 1.3, 0]} center>
          <div className="bg-slate-900/95 border border-cyan-400/50 px-4 py-2 rounded-lg shadow-2xl backdrop-blur-md min-w-[140px]">
            <p className="text-sm font-bold text-cyan-100">{label || "Beaker"}</p>
            <p className="text-xs text-slate-300">{capacity}mL capacity</p>
            <p className="text-xs text-slate-400 mt-1">Contents: {totalVolume.toFixed(0)}mL</p>
            {contents.map((c, i) => (
              <p key={i} className="text-[10px] text-slate-400">
                • {c.name}: {c.amount}mL
              </p>
            ))}
            {temperature !== 25 && (
              <p className={`text-xs mt-1 ${temperature > 60 ? 'text-orange-400' : 'text-slate-300'}`}>
                🌡️ {temperature}°C
              </p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// Interactive Flask
export function InteractiveFlask3D({
  position,
  contents,
  capacity,
  isSelected,
  isDropTarget,
  isHeating,
  temperature = 25,
  label,
  reactionEffect,
  onSelect,
  onHoverChange,
  onPointerDownCapture,
  onPointerUpCapture,
  onPointerMoveCapture,
}: InteractiveContainerProps) {
  const [hovered, setHovered] = useState(false);
  const [isBubbling, setIsBubbling] = useState(false);
  const glassRef = useRef<THREE.Mesh>(null);

  const totalVolume = contents.reduce((sum, c) => sum + c.amount, 0);
  const fillLevel = Math.min(1, Math.max(0.16, totalVolume / capacity));
  const visibleFillLevel = fillLevel;
  const solutionAppearance = useMemo(
    () => getSolutionAppearance(contents, reactionEffect, isHeating, temperature),
    [contents, reactionEffect, isHeating, temperature]
  );
  const mixedColor = solutionAppearance.color;

  useEffect(() => {
    if (contents.length >= 2 || isHeating) {
      setIsBubbling(true);
    } else {
      setIsBubbling(false);
    }
  }, [contents, isHeating]);

  const flaskProfile = useMemo(() => {
    const points: THREE.Vector2[] = [];
    points.push(new THREE.Vector2(0.01, 0));
    points.push(new THREE.Vector2(0.52, 0));
    points.push(new THREE.Vector2(0.54, 0.02));
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const y = 0.02 + t * 0.6;
      const r = 0.54 - t * 0.42;
      points.push(new THREE.Vector2(r, y));
    }
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const y = 0.62 + t * 0.35;
      points.push(new THREE.Vector2(0.12, y));
    }
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
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDownCapture?.(e);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        onPointerUpCapture?.(e);
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        onPointerMoveCapture?.(e);
      }}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHoverChange?.(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        onHoverChange?.(false);
        document.body.style.cursor = "auto";
      }}
    >
      {(hovered || isSelected || isDropTarget) && (
        <mesh scale={1.1}>
          <coneGeometry args={[0.6, 1.1, 32]} />
          <meshBasicMaterial
            color={isSelected ? "#00aaff" : isDropTarget ? "#22d3ee" : "#00ff88"}
            transparent
            opacity={isSelected ? 0.2 : isDropTarget ? 0.16 : 0.1}
          />
        </mesh>
      )}

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

      {fillLevel > 0 && (
        <group>
          <mesh position={[0, visibleFillLevel * 0.3, 0]}>
            <coneGeometry args={[0.35 + (1 - visibleFillLevel) * 0.15, visibleFillLevel * 0.6, 32]} />
            <meshPhysicalMaterial
              color={mixedColor}
              transparent
              opacity={solutionAppearance.opacity}
              roughness={0.05}
              transmission={0.28}
              ior={1.33}
            />
          </mesh>
          <mesh position={[0, visibleFillLevel * 0.6 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.26 + (1 - visibleFillLevel) * 0.08, 24]} />
            <meshPhysicalMaterial
              color={mixedColor}
              transparent
              opacity={solutionAppearance.surfaceOpacity}
              roughness={0.1}
              metalness={0.08}
            />
          </mesh>
          {solutionAppearance.foamIntensity > 0 ? (
            <group position={[0, visibleFillLevel * 0.6 + 0.025, 0]}>
              <SurfaceFoam
                radius={0.22 + (1 - visibleFillLevel) * 0.08}
                color={mixedColor}
                intensity={solutionAppearance.foamIntensity}
              />
            </group>
          ) : null}
        </group>
      )}

      {isBubbling && fillLevel > 0 && (
        <ReactionBubbles intensity={solutionAppearance.bubbleIntensity} color={mixedColor} />
      )}

      {solutionAppearance.precipitateColor && solutionAppearance.precipitateAmount > 0 && fillLevel > 0 && (
        <mesh position={[0, 0.02, 0]}>
          <coneGeometry args={[0.16, solutionAppearance.precipitateAmount, 24]} />
          <meshStandardMaterial color={solutionAppearance.precipitateColor} roughness={0.92} />
        </mesh>
      )}

      {(isHeating && temperature > 70) || reactionEffect === 'gas' ? (
        <group position={[0, 0.68, 0]}>
          <VaporEffect
            intensity={reactionEffect === 'gas' ? Math.max(0.45, (temperature - 40) / 40 || 0.45) : (temperature - 70) / 30}
            color={solutionAppearance.vaporColor}
          />
        </group>
      ) : null}

      {(hovered || isSelected) && (
        <Html position={[0, 1.3, 0]} center>
          <div className="bg-slate-900/95 border border-emerald-400/50 px-4 py-2 rounded-lg shadow-2xl backdrop-blur-md min-w-[140px]">
            <p className="text-sm font-bold text-emerald-100">{label || "Erlenmeyer Flask"}</p>
            <p className="text-xs text-slate-300">{capacity}mL capacity</p>
            <p className="text-xs text-slate-400 mt-1">Contents: {totalVolume.toFixed(0)}mL</p>
            {contents.map((c, i) => (
              <p key={i} className="text-[10px] text-slate-400">• {c.name}: {c.amount}mL</p>
            ))}
          </div>
        </Html>
      )}
    </group>
  );
}

// Interactive Test Tube
export function InteractiveTestTube3D({
  position,
  rotation = [0, 0, 0],
  contents,
  capacity,
  isSelected,
  isDropTarget,
  isHeating,
  temperature = 25,
  label,
  reactionEffect,
  onSelect,
  onHoverChange,
  onPointerDownCapture,
  onPointerUpCapture,
  onPointerMoveCapture,
}: InteractiveContainerProps) {
  const [hovered, setHovered] = useState(false);
  const [isBubbling, setIsBubbling] = useState(false);

  const totalVolume = contents.reduce((sum, c) => sum + c.amount, 0);
  const fillLevel = Math.min(1, Math.max(0.16, totalVolume / capacity));
  const visibleFillLevel = fillLevel;
  const solutionAppearance = useMemo(
    () => getSolutionAppearance(contents, reactionEffect, isHeating, temperature),
    [contents, reactionEffect, isHeating, temperature]
  );
  const mixedColor = solutionAppearance.color;

  useEffect(() => {
    if (contents.length >= 2 || isHeating) {
      setIsBubbling(true);
    } else {
      setIsBubbling(false);
    }
  }, [contents, isHeating]);

  const tubeProfile = useMemo(() => {
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= 12; i++) {
      const angle = (i / 12) * Math.PI / 2;
      const x = Math.cos(angle) * 0.085;
      const y = -0.35 + (1 - Math.sin(angle)) * 0.085;
      points.push(new THREE.Vector2(x, y));
    }
    points.push(new THREE.Vector2(0.085, -0.26));
    points.push(new THREE.Vector2(0.085, 0.35));
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
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDownCapture?.(e);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        onPointerUpCapture?.(e);
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        onPointerMoveCapture?.(e);
      }}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHoverChange?.(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        onHoverChange?.(false);
        document.body.style.cursor = "auto";
      }}
    >
      {(hovered || isSelected || isDropTarget) && (
        <mesh>
          <cylinderGeometry args={[0.12, 0.12, 0.8, 16]} />
          <meshBasicMaterial
            color={isSelected ? "#00aaff" : isDropTarget ? "#22d3ee" : "#00ff88"}
            transparent
            opacity={isSelected ? 0.2 : isDropTarget ? 0.16 : 0.1}
          />
        </mesh>
      )}

      <mesh castShadow receiveShadow>
        <latheGeometry args={[tubeProfile, 32]} />
        <meshPhysicalMaterial
          color="#f0f8ff"
          transparent
          opacity={0.08}
          roughness={0.02}
          metalness={0}
          transmission={0.96}
          thickness={0.8}
          envMapIntensity={1.5}
          clearcoat={1}
          clearcoatRoughness={0.02}
          ior={1.52}
          side={THREE.DoubleSide}
        />
      </mesh>

      {fillLevel > 0 && (
        <group position={[0, -0.35 + visibleFillLevel * 0.35, 0]}>
          <mesh>
            <cylinderGeometry args={[0.075, 0.075, visibleFillLevel * 0.6, 16]} />
            <meshPhysicalMaterial
              color={mixedColor}
              transparent
              opacity={solutionAppearance.opacity}
              roughness={0.05}
              transmission={0.32}
              ior={1.33}
            />
          </mesh>
          {/* Rounded bottom */}
          <mesh position={[0, -visibleFillLevel * 0.3, 0]}>
            <sphereGeometry args={[0.075, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshPhysicalMaterial
              color={mixedColor}
              transparent
              opacity={solutionAppearance.opacity}
              roughness={0.05}
              transmission={0.32}
              ior={1.33}
            />
          </mesh>
          <mesh position={[0, visibleFillLevel * 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.071, 18]} />
            <meshPhysicalMaterial
              color={mixedColor}
              transparent
              opacity={solutionAppearance.surfaceOpacity}
              roughness={0.1}
              metalness={0.08}
            />
          </mesh>
          {solutionAppearance.foamIntensity > 0 ? (
            <group position={[0, visibleFillLevel * 0.33, 0]}>
              <SurfaceFoam radius={0.068} color={mixedColor} intensity={solutionAppearance.foamIntensity} />
            </group>
          ) : null}
        </group>
      )}

      {isBubbling && fillLevel > 0 && (
        <group position={[0, -0.2, 0]} scale={0.5}>
          <ReactionBubbles intensity={solutionAppearance.bubbleIntensity} color={mixedColor} />
        </group>
      )}

      {(isBubbling || contents.some(c => c.pH < 4) || contents.some(c => c.pH > 10)) && fillLevel > 0 && (
        <mesh position={[0, -0.1, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial color={mixedColor} transparent opacity={0.16} />
        </mesh>
      )}

      {solutionAppearance.precipitateColor && solutionAppearance.precipitateAmount > 0 && fillLevel > 0 && (
        <mesh position={[0, -0.28, 0]}>
          <sphereGeometry args={[0.06, 16, 12, 0, Math.PI * 2, Math.PI, Math.PI / 2]} />
          <meshStandardMaterial color={solutionAppearance.precipitateColor} roughness={0.95} />
        </mesh>
      )}

      {reactionEffect === 'gas' && fillLevel > 0 && (
        <group position={[0, 0.22, 0]}>
          <VaporEffect intensity={0.45} color={solutionAppearance.vaporColor} />
        </group>
      )}

      {(hovered || isSelected) && (
        <Html position={[0, 0.6, 0]} center>
          <div className="bg-slate-900/95 border border-purple-400/50 px-3 py-2 rounded-lg shadow-2xl backdrop-blur-md min-w-[120px]">
            <p className="text-xs font-bold text-purple-100">{label || "Test Tube"}</p>
            <p className="text-[10px] text-slate-300">{capacity}mL</p>
            <p className="text-[10px] text-slate-400">{totalVolume.toFixed(0)}mL filled</p>
            {contents.map((c, i) => (
              <p key={i} className="text-[10px] text-slate-400">• {c.name}</p>
            ))}
          </div>
        </Html>
      )}
    </group>
  );
}

// Graduated Cylinder
export function InteractiveCylinder3D({
  position,
  contents,
  capacity,
  isSelected,
  isDropTarget,
  label,
  reactionEffect,
  onSelect,
  onHoverChange,
  onPointerDownCapture,
  onPointerUpCapture,
  onPointerMoveCapture,
}: InteractiveContainerProps) {
  const [hovered, setHovered] = useState(false);
  const [isBubbling, setIsBubbling] = useState(false);

  const totalVolume = contents.reduce((sum, c) => sum + c.amount, 0);
  const fillLevel = Math.min(1, Math.max(0.16, totalVolume / capacity));
  const visibleFillLevel = fillLevel;
  const solutionAppearance = useMemo(
    () => getSolutionAppearance(contents, reactionEffect, false, 25),
    [contents, reactionEffect]
  );
  const mixedColor = solutionAppearance.color;

  useEffect(() => {
    const shouldBubble = contents.length >= 2 || contents.some(c => c.pH < 4) || contents.some(c => c.pH > 10) || reactionEffect === 'bubbles' || reactionEffect === 'gas' || reactionEffect === 'explosion';
    setIsBubbling(shouldBubble);
  }, [contents, reactionEffect]);

  return (
    <group
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDownCapture?.(e);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        onPointerUpCapture?.(e);
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        onPointerMoveCapture?.(e);
      }}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHoverChange?.(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        onHoverChange?.(false);
        document.body.style.cursor = "auto";
      }}
    >
      {(hovered || isSelected || isDropTarget) && (
        <mesh>
          <cylinderGeometry args={[0.18, 0.18, 1.4, 16]} />
          <meshBasicMaterial
            color={isSelected ? "#00aaff" : isDropTarget ? "#22d3ee" : "#00ff88"}
            transparent
            opacity={isSelected ? 0.2 : isDropTarget ? 0.16 : 0.1}
          />
        </mesh>
      )}

      {/* Glass cylinder */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.18, 1.3, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#f0f8ff"
          transparent
          opacity={0.08}
          roughness={0.02}
          metalness={0}
          transmission={0.96}
          thickness={1}
          envMapIntensity={1.5}
          clearcoat={1}
          ior={1.52}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Base */}
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.08, 32]} />
        <meshPhysicalMaterial
          color="#e8f4ff"
          transparent
          opacity={0.15}
          roughness={0.05}
          transmission={0.85}
        />
      </mesh>

      {/* Graduation marks */}
      {Array.from({ length: 10 }).map((_, i) => {
        const y = -0.55 + i * 0.12;
        const ml = (i + 1) * (capacity / 10);
        return (
          <group key={i}>
            <mesh position={[0.16, y, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.002, i % 2 === 0 ? 0.04 : 0.02, 0.002]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
            {i % 2 === 0 && (
              <Html position={[0.2, y, 0]} center transform scale={0.02}>
                <div className="text-[8px] font-mono text-white/70 font-bold">
                  {ml.toFixed(0)}
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Liquid */}
      {fillLevel > 0 && (
        <group position={[0, -0.6 + visibleFillLevel * 0.6, 0]}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.17, visibleFillLevel * 1.2, 32]} />
            <meshPhysicalMaterial
              color={mixedColor}
              transparent
              opacity={solutionAppearance.opacity}
              roughness={0.05}
              transmission={0.32}
              ior={1.33}
            />
          </mesh>
          <mesh position={[0, visibleFillLevel * 0.6 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.145, 24]} />
            <meshPhysicalMaterial
              color={mixedColor}
              transparent
              opacity={solutionAppearance.surfaceOpacity}
              roughness={0.1}
              metalness={0.08}
            />
          </mesh>
          {solutionAppearance.foamIntensity > 0 ? (
            <group position={[0, visibleFillLevel * 0.62, 0]}>
              <SurfaceFoam radius={0.14} color={mixedColor} intensity={solutionAppearance.foamIntensity} />
            </group>
          ) : null}
        </group>
      )}

      {(isBubbling || contents.some(c => c.pH < 4) || contents.some(c => c.pH > 10)) && fillLevel > 0 && (
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} />
          <meshBasicMaterial color={mixedColor} transparent opacity={0.16} />
        </mesh>
      )}

      {solutionAppearance.precipitateColor && solutionAppearance.precipitateAmount > 0 && fillLevel > 0 && (
        <mesh position={[0, -0.58, 0]}>
          <cylinderGeometry args={[0.12, 0.14, solutionAppearance.precipitateAmount, 18]} />
          <meshStandardMaterial color={solutionAppearance.precipitateColor} roughness={0.94} />
        </mesh>
      )}

      {reactionEffect === 'gas' && fillLevel > 0 && (
        <group position={[0, 0.18, 0]}>
          <VaporEffect intensity={0.42} color={solutionAppearance.vaporColor} />
        </group>
      )}

      {(hovered || isSelected) && (
        <Html position={[0, 0.9, 0]} center>
          <div className="bg-slate-900/95 border border-amber-400/50 px-3 py-2 rounded-lg shadow-2xl backdrop-blur-md min-w-[130px]">
            <p className="text-xs font-bold text-amber-100">{label || "Graduated Cylinder"}</p>
            <p className="text-[10px] text-slate-300">{capacity}mL capacity</p>
            <p className="text-[10px] text-slate-400">{totalVolume.toFixed(1)}mL (precise)</p>
            {contents.map((c, i) => (
              <p key={i} className="text-[10px] text-slate-400">• {c.name}: {c.amount}mL</p>
            ))}
          </div>
        </Html>
      )}
    </group>
  );
}
