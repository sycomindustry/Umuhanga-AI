import { useState, useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { ChemicalContent } from "./InteractiveContainer3D";
import { SHOW_3D_TEXT } from "./show3dText";

// Available chemicals for the shelf
export const SHELF_CHEMICALS: Record<string, ChemicalContent & { formula: string; hazardLevel: 'safe' | 'caution' | 'danger' | 'extreme' }> = {
  water: {
    id: 'water',
    name: 'Distilled Water',
    formula: 'H₂O',
    color: '#87ceeb',
    amount: 100,
    pH: 7,
    reactivity: 'low',
    state: 'liquid',
    hazardLevel: 'safe'
  },
  hcl: {
    id: 'hcl',
    name: 'Hydrochloric Acid',
    formula: 'HCl',
    color: '#d8f3ff',
    amount: 50,
    pH: 1,
    reactivity: 'high',
    state: 'liquid',
    hazardLevel: 'danger'
  },
  naoh: {
    id: 'naoh',
    name: 'Sodium Hydroxide',
    formula: 'NaOH',
    color: '#03a9f4',
    amount: 50,
    pH: 14,
    reactivity: 'high',
    state: 'liquid',
    hazardLevel: 'danger'
  },
  h2so4: {
    id: 'h2so4',
    name: 'Sulfuric Acid',
    formula: 'H₂SO₄',
    color: '#f4d35e',
    amount: 30,
    pH: 0.5,
    reactivity: 'high',
    state: 'liquid',
    hazardLevel: 'extreme'
  },
  hno3: {
    id: 'hno3',
    name: 'Nitric Acid',
    formula: 'HNO₃',
    color: '#ffe28a',
    amount: 30,
    pH: 0.8,
    reactivity: 'high',
    state: 'liquid',
    hazardLevel: 'extreme'
  },
  h3po4: {
    id: 'h3po4',
    name: 'Phosphoric Acid',
    formula: 'H₃PO₄',
    color: '#f4ebc1',
    amount: 40,
    pH: 1.5,
    reactivity: 'medium',
    state: 'liquid',
    hazardLevel: 'danger'
  },
  sodium: {
    id: 'sodium',
    name: 'Sodium Metal',
    formula: 'Na',
    color: '#c0c0c0',
    amount: 5,
    pH: 14,
    reactivity: 'explosive',
    state: 'solid',
    hazardLevel: 'extreme'
  },
  copper_sulfate: {
    id: 'copper_sulfate',
    name: 'Copper Sulfate',
    formula: 'CuSO₄',
    color: '#2196f3',
    amount: 20,
    pH: 4,
    reactivity: 'medium',
    state: 'solid',
    hazardLevel: 'caution'
  },
  phenolphthalein: {
    id: 'phenolphthalein',
    name: 'Phenolphthalein',
    formula: 'C₂₀H₁₄O₄',
    color: '#ffffff',
    amount: 10,
    pH: 7,
    reactivity: 'low',
    state: 'liquid',
    hazardLevel: 'caution'
  },
  vinegar: {
    id: 'vinegar',
    name: 'Acetic Acid (Vinegar)',
    formula: 'CH₃COOH',
    color: '#ffefd5',
    amount: 50,
    pH: 2.4,
    reactivity: 'medium',
    state: 'liquid',
    hazardLevel: 'caution'
  },
  baking_soda: {
    id: 'baking_soda',
    name: 'Sodium Bicarbonate',
    formula: 'NaHCO₃',
    color: '#ffffff',
    amount: 30,
    pH: 8.3,
    reactivity: 'medium',
    state: 'solid',
    hazardLevel: 'safe'
  },
  sodium_carbonate: {
    id: 'sodium_carbonate',
    name: 'Sodium Carbonate',
    formula: 'Na₂CO₃',
    color: '#f7f7f7',
    amount: 25,
    pH: 11.2,
    reactivity: 'medium',
    state: 'solid',
    hazardLevel: 'caution'
  },
  nacl: {
    id: 'nacl',
    name: 'Sodium Chloride',
    formula: 'NaCl',
    color: '#ffffff',
    amount: 25,
    pH: 7,
    reactivity: 'low',
    state: 'solid',
    hazardLevel: 'safe'
  },
  potassium_iodide: {
    id: 'potassium_iodide',
    name: 'Potassium Iodide',
    formula: 'KI',
    color: '#ffffff',
    amount: 20,
    pH: 7,
    reactivity: 'medium',
    state: 'solid',
    hazardLevel: 'caution'
  },
  silver_nitrate: {
    id: 'silver_nitrate',
    name: 'Silver Nitrate',
    formula: 'AgNO₃',
    color: '#f5f5f5',
    amount: 15,
    pH: 5,
    reactivity: 'high',
    state: 'solid',
    hazardLevel: 'danger'
  },
  ammonia: {
    id: 'ammonia',
    name: 'Ammonia Solution',
    formula: 'NH₃',
    color: '#e0ffff',
    amount: 30,
    pH: 11,
    reactivity: 'medium',
    state: 'liquid',
    hazardLevel: 'danger'
  },
  iron_nail: {
    id: 'iron_nail',
    name: 'Iron Nail',
    formula: 'Fe',
    color: '#8b8b8b',
    amount: 5,
    pH: 7,
    reactivity: 'medium',
    state: 'solid',
    hazardLevel: 'safe'
  },
  zinc_metal: {
    id: 'zinc_metal',
    name: 'Zinc Metal',
    formula: 'Zn',
    color: '#c0c0c0',
    amount: 5,
    pH: 7,
    reactivity: 'medium',
    state: 'solid',
    hazardLevel: 'caution'
  },
  magnesium_ribbon: {
    id: 'magnesium_ribbon',
    name: 'Magnesium Ribbon',
    formula: 'Mg',
    color: '#d3d3d3',
    amount: 3,
    pH: 7,
    reactivity: 'high',
    state: 'solid',
    hazardLevel: 'danger'
  },
  hydrogen_peroxide: {
    id: 'hydrogen_peroxide',
    name: 'Hydrogen Peroxide',
    formula: 'H₂O₂',
    color: '#e6f2ff',
    amount: 50,
    pH: 6,
    reactivity: 'high',
    state: 'liquid',
    hazardLevel: 'caution'
  },
  universal_indicator: {
    id: 'universal_indicator',
    name: 'Universal Indicator',
    formula: 'Indicator Mix',
    color: '#49c46b',
    amount: 20,
    pH: 7,
    reactivity: 'low',
    state: 'liquid',
    hazardLevel: 'caution'
  },
  bromothymol_blue: {
    id: 'bromothymol_blue',
    name: 'Bromothymol Blue',
    formula: 'C₂₇H₂₈Br₂O₅S',
    color: '#1e90ff',
    amount: 15,
    pH: 7,
    reactivity: 'low',
    state: 'liquid',
    hazardLevel: 'caution'
  },
  methyl_orange: {
    id: 'methyl_orange',
    name: 'Methyl Orange',
    formula: 'C₁₄H₁₄N₃NaO₃S',
    color: '#ff9800',
    amount: 15,
    pH: 7,
    reactivity: 'low',
    state: 'liquid',
    hazardLevel: 'caution'
  },
  ethanol: {
    id: 'ethanol',
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    color: '#dff7ff',
    amount: 40,
    pH: 7,
    reactivity: 'high',
    state: 'liquid',
    hazardLevel: 'danger'
  },
  potassium_permanganate: {
    id: 'potassium_permanganate',
    name: 'Potassium Permanganate',
    formula: 'KMnO₄',
    color: '#4b0082',
    amount: 10,
    pH: 7,
    reactivity: 'high',
    state: 'solid',
    hazardLevel: 'danger'
  },
};

interface ChemicalBottleProps {
  chemical: typeof SHELF_CHEMICALS[keyof typeof SHELF_CHEMICALS];
  position: [number, number, number];
  onSelect: (chemical: ChemicalContent) => void;
  onDragStart?: (chemical: ChemicalContent) => void;
  onDragEnd?: () => void;
  isSelected?: boolean;
  isDragging?: boolean;
}

function ChemicalBottle({ chemical, position, onSelect, onDragStart, onDragEnd, isSelected, isDragging }: ChemicalBottleProps) {
  const [hovered, setHovered] = useState(false);
  const bottleRef = useRef<THREE.Group>(null);
  const isDraggingRef = useRef(false);

  const hazardColors = {
    safe: '#22c55e',
    caution: '#eab308',
    danger: '#f97316',
    extreme: '#ef4444'
  };

  const getChemicalContent = useCallback((): ChemicalContent => ({
    id: chemical.id,
    name: chemical.name,
    color: chemical.color,
    amount: 25,
    pH: chemical.pH,
    reactivity: chemical.reactivity,
    state: chemical.state,
  }), [chemical]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    onDragStart?.(getChemicalContent());
    document.body.style.cursor = "grabbing";
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      onDragEnd?.();
      onSelect(getChemicalContent());
      document.body.style.cursor = "auto";
    }
  };

  useFrame((state) => {
    if (bottleRef.current && (hovered || isSelected)) {
      bottleRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const liquidFillHeight = chemical.state === 'liquid' ? 0.25 : 0.17;
  const solidHeight = chemical.state === 'solid' ? 0.16 : 0;

  return (
    <group
      ref={bottleRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={(e) => { 
        e.stopPropagation(); 
        onSelect(getChemicalContent());
      }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "grab"; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); if (!isDraggingRef.current) document.body.style.cursor = "auto"; }}
    >
      {/* Selection glow */}
      {(hovered || isSelected || isDragging) && (
        <mesh scale={1.15}>
          <cylinderGeometry args={[0.12, 0.14, 0.5, 16]} />
          <meshBasicMaterial 
            color={isDragging ? "#00ffff" : isSelected ? "#00aaff" : hazardColors[chemical.hazardLevel]} 
            transparent 
            opacity={isDragging ? 0.5 : 0.3} 
          />
        </mesh>
      )}
      {/* Selection glow */}
      {(hovered || isSelected) && (
        <mesh scale={1.15}>
          <cylinderGeometry args={[0.12, 0.14, 0.5, 16]} />
          <meshBasicMaterial 
            color={isSelected ? "#00aaff" : hazardColors[chemical.hazardLevel]} 
            transparent 
            opacity={0.3} 
          />
        </mesh>
      )}

      {/* Bottle body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.4, 16]} />
        <meshPhysicalMaterial
          color="#eef8ff"
          transparent
          opacity={0.16}
          roughness={0.06}
          metalness={0}
          transmission={0.92}
          thickness={0.5}
          ior={1.5}
        />
      </mesh>

      {/* Liquid/solid inside */}
      {chemical.state === 'liquid' ? (
        <group position={[0, -0.1, 0]}>
          <mesh>
            <cylinderGeometry args={[0.082, 0.104, liquidFillHeight, 16]} />
            <meshPhysicalMaterial
              color={chemical.color}
              transparent
              opacity={0.92}
              roughness={0.08}
              transmission={0.35}
              ior={1.33}
            />
          </mesh>
          <mesh position={[0, liquidFillHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.082, 20]} />
            <meshPhysicalMaterial
              color={chemical.color}
              transparent
              opacity={0.58}
              roughness={0.12}
              metalness={0.08}
            />
          </mesh>
          <mesh position={[0, liquidFillHeight / 2 + 0.005, 0]}>
            <torusGeometry args={[0.08, 0.006, 8, 20]} />
            <meshPhysicalMaterial color={chemical.color} transparent opacity={0.34} />
          </mesh>
        </group>
      ) : (
        <group position={[0, -0.11, 0]}>
          <mesh>
            <cylinderGeometry args={[0.082, 0.104, solidHeight, 16]} />
            <meshStandardMaterial
              color={chemical.color}
              roughness={0.88}
              metalness={chemical.id.includes('metal') || chemical.id.includes('nail') ? 0.55 : 0.04}
            />
          </mesh>
          <mesh position={[0, solidHeight / 2, 0]}>
            <cylinderGeometry args={[0.078, 0.1, 0.02, 16]} />
            <meshStandardMaterial color={chemical.color} roughness={0.94} />
          </mesh>
        </group>
      )}

      {/* Cap */}
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.1, 16]} />
        <meshStandardMaterial 
          color={hazardColors[chemical.hazardLevel]} 
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>

      {/* Hazard stripe */}
      <mesh position={[0, 0, 0.121]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.18, 0.08]} />
        <meshStandardMaterial color={hazardColors[chemical.hazardLevel]} />
      </mesh>

      {/* Label */}
      {SHOW_3D_TEXT && (hovered || isSelected) && (
        <Html position={[0, 0.5, 0]} center>
          <div className={`bg-slate-900/95 border px-3 py-2 rounded-lg shadow-2xl backdrop-blur-md min-w-[140px] ${
            chemical.hazardLevel === 'extreme' ? 'border-red-500' :
            chemical.hazardLevel === 'danger' ? 'border-orange-500' :
            chemical.hazardLevel === 'caution' ? 'border-yellow-500' :
            'border-green-500'
          }`}>
            <p className="text-sm font-bold text-white">{chemical.name}</p>
            <p className="text-xs text-slate-300 font-mono">{chemical.formula}</p>
            <p className="text-[10px] text-slate-400 mt-1">
              pH: {chemical.pH} · State: {chemical.state}
            </p>
            <p className={`text-[10px] mt-1 font-semibold ${
              chemical.hazardLevel === 'extreme' ? 'text-red-400' :
              chemical.hazardLevel === 'danger' ? 'text-orange-400' :
              chemical.hazardLevel === 'caution' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {chemical.hazardLevel === 'extreme' && '⚠️ EXTREME HAZARD'}
              {chemical.hazardLevel === 'danger' && '⚠️ Dangerous'}
              {chemical.hazardLevel === 'caution' && '⚡ Handle with care'}
              {chemical.hazardLevel === 'safe' && '✓ Safe to handle'}
            </p>
            <p className="text-[10px] text-cyan-400 mt-1">Click to add to container</p>
          </div>
        </Html>
      )}
    </group>
  );
}

interface ChemicalShelfProps {
  position: [number, number, number];
  onSelectChemical: (chemical: ChemicalContent) => void;
  onDragStart?: (chemical: ChemicalContent) => void;
  onDragEnd?: () => void;
  selectedChemicalId?: string;
  draggingChemicalId?: string;
}

export function ChemicalShelf3D({ position, onSelectChemical, onDragStart, onDragEnd, selectedChemicalId, draggingChemicalId }: ChemicalShelfProps) {
  const chemicals = Object.values(SHELF_CHEMICALS);
  const rows = 3;
  const itemsPerRow = Math.ceil(chemicals.length / rows);

  return (
    <group position={position}>
      {/* Shelf frame */}
      <mesh position={[0, 0.92, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.08, 0.35]} />
        <meshStandardMaterial color="#5d4037" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.46, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.08, 0.35]} />
        <meshStandardMaterial color="#5d4037" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.08, 0.35]} />
        <meshStandardMaterial color="#5d4037" roughness={0.8} />
      </mesh>
      {/* Back panel */}
      <mesh position={[0, 0.47, -0.3]}>
        <boxGeometry args={[2.5, 1.2, 0.04]} />
        <meshStandardMaterial color="#3e2723" roughness={0.9} />
      </mesh>
      {/* Side panels */}
      <mesh position={[-1.22, 0.47, -0.15]}>
        <boxGeometry args={[0.04, 1.2, 0.35]} />
        <meshStandardMaterial color="#4e342e" roughness={0.85} />
      </mesh>
      <mesh position={[1.22, 0.47, -0.15]}>
        <boxGeometry args={[0.04, 1.2, 0.35]} />
        <meshStandardMaterial color="#4e342e" roughness={0.85} />
      </mesh>

      {/* Chemical bottles on shelves */}
      {chemicals.map((chemical, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        const x = -0.95 + col * 0.38;
        const y = row === 0 ? 0.14 : row === 1 ? 0.6 : 1.06;
        
        return (
          <ChemicalBottle
            key={chemical.id}
            chemical={chemical}
            position={[x, y, 0]}
            onSelect={onSelectChemical}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isSelected={selectedChemicalId === chemical.id}
            isDragging={draggingChemicalId === chemical.id}
          />
        );
      })}
    </group>
  );
}
