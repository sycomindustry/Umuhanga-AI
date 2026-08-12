import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  ArrowRightLeft,
  Beaker,
  Bot,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Flame,
  FlaskConical,
  Gauge,
  Move3D,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Thermometer,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";
import {
  InteractiveBeaker3D,
  InteractiveCylinder3D,
  InteractiveFlask3D,
  InteractiveTestTube3D,
  type ChemicalContent,
} from "./InteractiveContainer3D";
import { ChemicalShelf3D, SHELF_CHEMICALS } from "./ChemicalShelf3D";
import {
  RealisticBunsenBurner3D,
  RealisticChemicalBottle3D,
  RealisticPHMeter3D,
  RealisticThermometer3D,
  RealisticTripod3D,
} from "./RealisticEquipment3D";
import { useLabSounds } from "@/hooks/useLabSounds";
import { LabNotebook } from "./LabNotebook";

interface LabContainer {
  id: string;
  type: "beaker" | "flask" | "testTube" | "cylinder";
  position: [number, number, number];
  capacity: number;
  contents: ChemicalContent[];
  isHeating: boolean;
  temperature: number;
  label: string;
}

type BenchEquipmentKind =
  | "washBottle"
  | "retortStand"
  | "balance"
  | "tubeRack"
  | "phMeter"
  | "thermometer";

interface BenchEquipmentItem {
  id: string;
  kind: BenchEquipmentKind;
  label: string;
  position: [number, number, number];
  defaultPosition: [number, number, number];
  visible: boolean;
}

interface ReactionEffect {
  type: "explosion" | "bubbles" | "precipitate" | "colorChange" | "gas" | "heat";
  intensity: number;
  resultColor?: string;
  message: string;
  equation: string;
  visibleEvidence: string;
  realWorldNote: string;
}

interface DemoPreset {
  id: "neutralization" | "redox" | "gas";
  title: string;
  description: string;
  objective: string;
  expected: string;
  materials: string[];
  steps: string[];
  targetContainerId: string;
  chemicals: Array<{ id: keyof typeof SHELF_CHEMICALS; amount: number }>;
  explanation: string;
}

export interface ChemistryLabSnapshot {
  selectedContainerLabel: string | null;
  selectedContainerId: string | null;
  selectedChemicalName: string | null;
  averagePH: number | null;
  missionTitle: string;
  missionProgress: number;
  observations: string[];
  containers: Array<{
    id: string;
    label: string;
    type: LabContainer["type"];
    volume: number;
    temperature: number;
    isHeating: boolean;
    hazard: string;
    contents: Array<{
      id: string;
      name: string;
      amount: number;
      pH: number;
    }>;
  }>;
}

const INITIAL_CONTAINERS: LabContainer[] = [
  {
    id: "beaker-1",
    type: "beaker",
    position: [0, 0, 0],
    capacity: 500,
    contents: [],
    isHeating: false,
    temperature: 25,
    label: "Main Beaker",
  },
  {
    id: "flask-1",
    type: "flask",
    position: [-1.45, -0.08, 0.45],
    capacity: 250,
    contents: [],
    isHeating: false,
    temperature: 25,
    label: "Reaction Flask",
  },
  {
    id: "tube-1",
    type: "testTube",
    position: [1.35, 0.2, 0.32],
    capacity: 25,
    contents: [],
    isHeating: false,
    temperature: 25,
    label: "Test Tube A",
  },
  {
    id: "tube-2",
    type: "testTube",
    position: [1.7, 0.2, 0.32],
    capacity: 25,
    contents: [],
    isHeating: false,
    temperature: 25,
    label: "Test Tube B",
  },
  {
    id: "cylinder-1",
    type: "cylinder",
    position: [-1.85, 0.08, -0.25],
    capacity: 100,
    contents: [],
    isHeating: false,
    temperature: 25,
    label: "Graduated Cylinder",
  },
];

const INITIAL_BENCH_EQUIPMENT: BenchEquipmentItem[] = [
  {
    id: "wash-bottle",
    kind: "washBottle",
    label: "Wash Bottle",
    position: [-2.35, -0.5, 1.02],
    defaultPosition: [-2.35, -0.5, 1.02],
    visible: true,
  },
  {
    id: "retort-stand",
    kind: "retortStand",
    label: "Retort Stand",
    position: [2.32, -0.68, 0.56],
    defaultPosition: [2.32, -0.68, 0.56],
    visible: true,
  },
  {
    id: "digital-balance",
    kind: "balance",
    label: "Digital Balance",
    position: [2.08, -0.59, 1.08],
    defaultPosition: [2.08, -0.59, 1.08],
    visible: true,
  },
  {
    id: "tube-rack",
    kind: "tubeRack",
    label: "Tube Rack",
    position: [1.28, -0.62, 1.06],
    defaultPosition: [1.28, -0.62, 1.06],
    visible: true,
  },
  {
    id: "ph-meter",
    kind: "phMeter",
    label: "pH Meter",
    position: [-1.64, -0.28, 1.08],
    defaultPosition: [-1.64, -0.28, 1.08],
    visible: true,
  },
  {
    id: "thermometer",
    kind: "thermometer",
    label: "Thermometer",
    position: [-0.66, -0.3, 1.22],
    defaultPosition: [-0.66, -0.3, 1.22],
    visible: true,
  },
];

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "neutralization",
    title: "Acid-Base Neutralization",
    description:
      "Walk through a classic strong acid and strong base reaction with visible indicator response and gentle heat release.",
    objective: "Show how a normal acid-base neutralization forms water and a salt while the pH moves toward neutral.",
    expected: "The solution stays liquid, the indicator shifts toward a neutral colour, and the vessel warms slightly.",
    materials: ["Hydrochloric acid", "Sodium hydroxide", "Bromothymol blue", "Main beaker"],
    steps: [
      "Select the main beaker as the active workstation.",
      "Measure and add hydrochloric acid first, then add sodium hydroxide carefully.",
      "Add indicator and observe the solution colour, pH shift, and temperature rise.",
      "Record the evidence of neutralization in the notebook.",
    ],
    targetContainerId: "beaker-1",
    chemicals: [
      { id: "hcl", amount: 25 },
      { id: "naoh", amount: 25 },
      { id: "bromothymol_blue", amount: 10 },
    ],
    explanation:
      "Hydrogen ions from the acid combine with hydroxide ions from the alkali to form water. The remaining ions stay in solution as a salt, and the mixture warms slightly as energy is released.",
  },
  {
    id: "redox",
    title: "Copper Displacement",
    description:
      "Demonstrate a single displacement reaction where a more reactive metal replaces copper from solution.",
    objective: "Observe oxidation and reduction directly on the metal surface.",
    expected: "Copper forms on the iron, and the original blue solution changes as a new iron salt is produced.",
    materials: ["Copper sulfate", "Iron nail", "Reaction flask"],
    steps: [
      "Set the flask as your reaction vessel.",
      "Pour copper sulfate into the flask.",
      "Introduce the iron nail and allow time for surface changes.",
      "Use the observation panel to identify product formation.",
    ],
    targetContainerId: "flask-1",
    chemicals: [
      { id: "copper_sulfate", amount: 25 },
      { id: "iron_nail", amount: 5 },
    ],
    explanation:
      "Iron is more reactive than copper, so iron atoms enter solution while copper ions gain electrons and deposit as copper metal.",
  },
  {
    id: "gas",
    title: "Hydrogen Gas Evolution",
    description:
      "Create a fast, visible gas-forming reaction that clearly connects reactants, products, and evidence.",
    objective: "Make bubbling easy to recognise as evidence of a gas product in a reaction.",
    expected: "Rapid bubbling appears as hydrogen gas forms in the test tube.",
    materials: ["Hydrochloric acid", "Zinc metal", "Test tube"],
    steps: [
      "Choose test tube A as the reaction container.",
      "Add hydrochloric acid carefully.",
      "Introduce zinc metal and observe gas evolution.",
      "Discuss why the bubbles indicate a new gaseous product.",
    ],
    targetContainerId: "tube-1",
    chemicals: [
      { id: "hcl", amount: 15 },
      { id: "zinc_metal", amount: 5 },
    ],
    explanation:
      "Zinc replaces hydrogen from hydrochloric acid, producing zinc chloride and hydrogen gas. The bubbles are direct evidence of product formation.",
  },
];

const QUICK_REACTIONS = [
  "2Na + 2H₂O → 2NaOH + H₂↑",
  "HCl + NaOH → NaCl + H₂O + heat",
  "H₂SO₄ + Na₂CO₃ → Na₂SO₄ + H₂O + CO₂↑",
  "CuSO₄ + Fe → copper displacement",
  "CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄",
  "NaOH + phenolphthalein → pink indicator",
  "AgNO₃ + NaCl → AgCl↓ + NaNO₃",
  "CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂↑",
  "AgNO₃ + KI → AgI↓ + KNO₃",
  "Zn + 2HCl → ZnCl₂ + H₂↑",
];

function getPhysicalStateLabel(state: ChemicalContent["state"]) {
  if (state === "liquid") return "Liquid";
  if (state === "solid") return "Solid";
  return "Gas";
}

function getRealLabAppearance(chemical: ChemicalContent) {
  if (chemical.id === "hcl") return "Usually seen as a clear acidic liquid in a reagent bottle.";
  if (chemical.id === "h2so4") return "Usually appears as a clear to slightly oily liquid in the lab.";
  if (chemical.id === "hno3") return "Usually appears as a clear to pale yellow liquid.";
  if (chemical.id === "h3po4") return "Usually appears as a clear liquid solution.";
  if (chemical.id === "vinegar") return "Usually appears as a clear weak acid solution.";
  if (chemical.state === "liquid") return "This reagent should be seen as a liquid when selected and poured into a vessel.";
  if (chemical.state === "solid") return "This reagent should appear as a solid sample before mixing.";
  return "This reagent is represented as a gas in normal laboratory conditions.";
}

function WashBottle3D({
  position,
  accent = "#60a5fa",
}: {
  position: [number, number, number];
  accent?: string;
}) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.34, 24]} />
        <meshPhysicalMaterial
          color="#eef8ff"
          transparent
          opacity={0.18}
          transmission={0.85}
          roughness={0.08}
          thickness={0.8}
        />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.055, 0.06, 0.08, 18]} />
        <meshStandardMaterial color={accent} roughness={0.35} metalness={0.15} />
      </mesh>
      <mesh position={[0.04, 0.28, 0]} rotation={[0, 0, -0.55]}>
        <cylinderGeometry args={[0.012, 0.012, 0.22, 14]} />
        <meshStandardMaterial color={accent} roughness={0.35} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.02, 0.122]}>
        <planeGeometry args={[0.14, 0.09]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function RetortStand3D({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.04, 0.3]} />
        <meshStandardMaterial color="#2f3438" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={[-0.14, 0.46, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.92, 16]} />
        <meshStandardMaterial color="#aeb7bf" metalness={0.95} roughness={0.18} />
      </mesh>
      <mesh position={[0.04, 0.62, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.34, 14]} />
        <meshStandardMaterial color="#b8c2ca" metalness={0.92} roughness={0.2} />
      </mesh>
      <mesh position={[0.19, 0.44, 0]}>
        <cylinderGeometry args={[0.026, 0.03, 0.62, 18]} />
        <meshPhysicalMaterial
          color="#f8fcff"
          transparent
          opacity={0.1}
          transmission={0.95}
          roughness={0.02}
        />
      </mesh>
      <mesh position={[0.19, 0.31, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.32, 18]} />
        <meshPhysicalMaterial color="#cceeff" transparent opacity={0.82} transmission={0.28} />
      </mesh>
      <mesh position={[0.19, 0.71, 0]}>
        <cylinderGeometry args={[0.034, 0.034, 0.06, 18]} />
        <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.1} />
      </mesh>
    </group>
  );
}

function DigitalBalance3D({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.12, 0.36]} />
        <meshStandardMaterial color="#d8dde2" metalness={0.28} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 24]} />
        <meshStandardMaterial color="#c3ccd4" metalness={0.55} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.015, 24]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.18} roughness={0.18} />
      </mesh>
      <mesh position={[0, 0.01, 0.155]}>
        <boxGeometry args={[0.17, 0.05, 0.02]} />
        <meshStandardMaterial color="#07111b" emissive="#0ea5e9" emissiveIntensity={0.22} />
      </mesh>
    </group>
  );
}

function TestTubeRack3D({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.05, 0.18]} />
        <meshStandardMaterial color="#8b5e3c" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.62, 0.05, 0.18]} />
        <meshStandardMaterial color="#8b5e3c" roughness={0.8} />
      </mesh>
      {[-0.24, -0.08, 0.08, 0.24].map((x, index) => (
        <group key={x} position={[x, 0.25, 0]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.045, 0.34, 16]} />
            <meshPhysicalMaterial
              color="#f8fcff"
              transparent
              opacity={0.08}
              transmission={0.98}
              roughness={0.02}
            />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.034, 0.034, 0.18, 14]} />
            <meshPhysicalMaterial
              color={["#dbeafe", "#fde68a", "#fecdd3", "#dcfce7"][index]}
              transparent
              opacity={0.82}
              transmission={0.25}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WallStorage3D() {
  return (
    <>
      <group position={[0, 1.2, -3.45]}>
        {[-2.1, 0, 2.1].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.75, 0.9, 0.42]} />
              <meshStandardMaterial color="#d7dee5" metalness={0.25} roughness={0.55} />
            </mesh>
            <mesh position={[0, 0, 0.215]}>
              <boxGeometry args={[1.55, 0.72, 0.03]} />
              <meshPhysicalMaterial color="#dbeafe" transparent opacity={0.12} transmission={0.95} />
            </mesh>
          </group>
        ))}
      </group>

      <group position={[4.15, -0.62, 0.9]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.85, 0.86, 1.1]} />
          <meshStandardMaterial color="#cfd8df" metalness={0.28} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.47, 0]}>
          <boxGeometry args={[1.95, 0.08, 1.18]} />
          <meshStandardMaterial color="#d9dee3" metalness={0.55} roughness={0.22} />
        </mesh>
        <mesh position={[-0.24, 0.53, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.05, 24]} />
          <meshStandardMaterial color="#a8b3bb" metalness={0.75} roughness={0.24} />
        </mesh>
        <mesh position={[0.28, 0.79, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 16]} />
          <meshStandardMaterial color="#93a0aa" metalness={0.84} roughness={0.2} />
        </mesh>
        <mesh position={[0.38, 0.9, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.26, 16]} />
          <meshStandardMaterial color="#93a0aa" metalness={0.84} roughness={0.2} />
        </mesh>
      </group>

      <group position={[-4.05, -0.35, -0.95]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.38, 2.05, 1.02]} />
          <meshStandardMaterial color="#c9d1d8" metalness={0.4} roughness={0.48} />
        </mesh>
        <mesh position={[0, 0.04, 0.5]}>
          <boxGeometry args={[1.14, 1.74, 0.03]} />
          <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.15} transmission={0.95} />
        </mesh>
        <RealisticChemicalBottle3D
          position={[-0.28, -0.52, 0.12]}
          chemicalName="Hydrochloric Acid"
          chemicalColor="#fff3a8"
          hazardLevel="high"
          fillLevel={0.74}
        />
        <RealisticChemicalBottle3D
          position={[0.02, -0.52, 0.12]}
          chemicalName="Nitric Acid"
          chemicalColor="#fff0a0"
          hazardLevel="extreme"
          fillLevel={0.66}
        />
        <RealisticChemicalBottle3D
          position={[0.32, -0.52, 0.12]}
          chemicalName="Sulfuric Acid"
          chemicalColor="#ffe08a"
          hazardLevel="extreme"
          fillLevel={0.71}
        />
      </group>
    </>
  );
}

function checkForReaction(contents: ChemicalContent[]): ReactionEffect | null {
  if (contents.length < 2) return null;

  const hasWater = contents.some((c) => c.id === "water");
  const hasSodium = contents.some((c) => c.id === "sodium");
  const hasAcid = contents.some((c) => c.pH < 4);
  const hasBase = contents.some((c) => c.pH > 10);
  const hasVinegar = contents.some((c) => c.id === "vinegar");
  const hasBakingSoda = contents.some((c) => c.id === "baking_soda");
  const hasSodiumCarbonate = contents.some((c) => c.id === "sodium_carbonate");
  const hasPhenolphthalein = contents.some((c) => c.id === "phenolphthalein");
  const hasMethylOrange = contents.some((c) => c.id === "methyl_orange");
  const hasUniversalIndicator = contents.some((c) => c.id === "universal_indicator");
  const hasBromothymolBlue = contents.some((c) => c.id === "bromothymol_blue");
  const hasSilverNitrate = contents.some((c) => c.id === "silver_nitrate");
  const hasPotassiumIodide = contents.some((c) => c.id === "potassium_iodide");
  const hasSodiumChloride = contents.some((c) => c.id === "nacl");
  const hasCopperSulfate = contents.some((c) => c.id === "copper_sulfate");
  const hasIronNail = contents.some((c) => c.id === "iron_nail");
  const hasZincMetal = contents.some((c) => c.id === "zinc_metal");
  const hasMagnesium = contents.some((c) => c.id === "magnesium_ribbon");
  const hasHydrogenPeroxide = contents.some((c) => c.id === "hydrogen_peroxide");
  const hasPotassiumPermanganate = contents.some((c) => c.id === "potassium_permanganate");
  const hasHCl = contents.some((c) => c.id === "hcl");
  const hasSulfuric = contents.some((c) => c.id === "h2so4");
  const hasNitric = contents.some((c) => c.id === "hno3");
  const hasPhosphoric = contents.some((c) => c.id === "h3po4");

  const activeAcid = hasHCl || hasSulfuric || hasNitric || hasPhosphoric || hasVinegar;

  if (hasSodium && hasWater) {
    return {
      type: "explosion",
      intensity: 1,
      message: "💥 VIOLENT EXPLOSION! 2Na + 2H₂O → 2NaOH + H₂↑",
      equation: "2Na + 2H₂O → 2NaOH + H₂↑",
      visibleEvidence: "Rapid movement, strong fizzing, heat, and hydrogen gas release.",
      realWorldNote: "This is dangerously violent in a real lab and should only be demonstrated under strict expert control.",
    };
  }

  if (hasCopperSulfate && hasIronNail) {
    return {
      type: "precipitate",
      intensity: 0.9,
      resultColor: "#b87333",
      message: "🔄 DISPLACEMENT! CuSO₄ + Fe → FeSO₄ + Cu↓",
      equation: "Fe + CuSO₄ → FeSO₄ + Cu↓",
      visibleEvidence: "The blue solution fades and a reddish-brown copper coating forms on the iron.",
      realWorldNote: "In a normal lab, copper metal slowly deposits on the iron nail while the solution changes as iron(II) sulfate forms.",
    };
  }

  if (hasCopperSulfate && hasZincMetal) {
    return {
      type: "precipitate",
      intensity: 0.85,
      resultColor: "#a8d8ff",
      message: "🔄 DISPLACEMENT! Zinc displaces copper from copper sulfate solution.",
      equation: "Zn + CuSO₄ → ZnSO₄ + Cu↓",
      visibleEvidence: "The blue solution fades and a reddish copper deposit forms on the zinc surface.",
      realWorldNote: "This is a normal single-displacement reaction used in real laboratories to compare metal reactivity.",
    };
  }

  if (hasZincMetal && hasHCl) {
    return {
      type: "bubbles",
      intensity: 0.9,
      resultColor: "#c0c0c0",
      message: "🫧 GAS EVOLUTION! Zn + 2HCl → ZnCl₂ + H₂↑",
      equation: "Zn + 2HCl → ZnCl₂ + H₂↑",
      visibleEvidence: "Steady bubbling appears on the zinc surface as hydrogen gas is released.",
      realWorldNote: "This is the normal school-lab metal-acid reaction used to show hydrogen gas formation.",
    };
  }

  if (hasZincMetal && hasSulfuric) {
    return {
      type: "bubbles",
      intensity: 0.92,
      resultColor: "#dbeafe",
      message: "🫧 Metal-acid reaction! Zinc reacts with sulfuric acid and releases hydrogen gas.",
      equation: "Zn + H₂SO₄ → ZnSO₄ + H₂↑",
      visibleEvidence: "Effervescence forms at the metal surface and the zinc gradually dissolves.",
      realWorldNote: "In a real lab, dilute sulfuric acid with zinc normally gives hydrogen gas and a zinc sulfate solution.",
    };
  }

  if (hasZincMetal && hasPhosphoric) {
    return {
      type: "bubbles",
      intensity: 0.7,
      resultColor: "#e8f3ff",
      message: "🫧 Zinc reacts slowly with phosphoric acid and releases gas.",
      equation: "Zn + 2H⁺ → Zn²⁺ + H₂↑",
      visibleEvidence: "Gentle bubbling appears and the metal surface slowly changes.",
      realWorldNote: "In a real lab this is usually slower than hydrochloric acid, but hydrogen gas can still be observed.",
    };
  }

  if (hasZincMetal && hasNitric) {
    return {
      type: "gas",
      intensity: 0.95,
      resultColor: "#f59e0b",
      message: "🟤 Nitric acid reaction! Zinc can produce brown nitrogen dioxide fumes instead of hydrogen.",
      equation: "Zn + 4HNO₃ → Zn(NO₃)₂ + 2NO₂↑ + 2H₂O",
      visibleEvidence: "Brown fumes may appear and the metal dissolves.",
      realWorldNote: "This is closer to real laboratory chemistry than showing hydrogen, because nitric acid is an oxidizing acid.",
    };
  }

  if (hasMagnesium && hasHCl) {
    return {
      type: "bubbles",
      intensity: 1,
      resultColor: "#ffffff",
      message: "🫧 VIGOROUS REACTION! Mg + 2HCl → MgCl₂ + H₂↑",
      equation: "Mg + 2HCl → MgCl₂ + H₂↑",
      visibleEvidence: "Rapid bubbling occurs and the magnesium ribbon quickly dissolves.",
      realWorldNote: "This is a standard real-lab reaction that clearly shows hydrogen production from a reactive metal and acid.",
    };
  }

  if (hasMagnesium && hasSulfuric) {
    return {
      type: "bubbles",
      intensity: 1,
      resultColor: "#eef7ff",
      message: "🫧 Magnesium reacts vigorously with sulfuric acid and releases hydrogen gas.",
      equation: "Mg + H₂SO₄ → MgSO₄ + H₂↑",
      visibleEvidence: "Rapid effervescence appears and the metal ribbon disappears quickly.",
      realWorldNote: "This is a standard real-lab metal-acid reaction with strong visible gas evolution.",
    };
  }

  if (hasMagnesium && hasWater) {
    return {
      type: "bubbles",
      intensity: 0.3,
      message: "🫧 Very slow reaction: magnesium reacts only weakly with cold water.",
      equation: "Mg + 2H₂O → Mg(OH)₂ + H₂↑",
      visibleEvidence: "Only slight bubbling may be seen, and little change happens without heating.",
      realWorldNote: "In a normal lab this reaction is very slow in cold water and is more noticeable with steam or heating.",
    };
  }

  if (hasHydrogenPeroxide && hasBase) {
    return {
      type: "gas",
      intensity: 0.7,
      resultColor: "#f6fbff",
      message: "🫧 Oxygen release! Hydrogen peroxide decomposes faster in alkaline conditions.",
      equation: "2H₂O₂ → 2H₂O + O₂↑",
      visibleEvidence: "Fine bubbles rise through the liquid and the vessel may warm slightly.",
      realWorldNote: "In real labs, hydrogen peroxide breaks down faster in the presence of catalysts or reactive alkaline mixtures.",
    };
  }

  if (hasHydrogenPeroxide && hasPotassiumPermanganate) {
    return {
      type: "bubbles",
      intensity: 1,
      resultColor: "#8b4513",
      message: "🧪 OXIDATION! Oxygen gas and brown manganese dioxide appear.",
      equation: "2KMnO₄ + 3H₂O₂ → 2MnO₂ + 3O₂↑ + 2KOH + 2H₂O",
      visibleEvidence: "Bubbling oxygen gas forms while the purple colour fades and a brown solid appears.",
      realWorldNote: "In real wet-chemistry work, the exact products depend on conditions, but bubbling and colour change are normal signs of redox activity.",
    };
  }

  if (hasVinegar && hasBakingSoda) {
    return {
      type: "bubbles",
      intensity: 1,
      message: "🫧 Vigorous bubbling! NaHCO₃ + CH₃COOH → CO₂↑ + H₂O + CH₃COONa",
      equation: "CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂↑",
      visibleEvidence: "Strong fizzing and foaming appear as carbon dioxide escapes.",
      realWorldNote: "This is the normal bench-top reaction seen when vinegar and baking soda are mixed.",
    };
  }

  if (activeAcid && hasSodiumCarbonate) {
    return {
      type: "bubbles",
      intensity: 1,
      resultColor: "#fff7db",
      message: "🫧 Effervescence! Acid reacts with carbonate to release carbon dioxide gas.",
      equation: "2H⁺ + CO₃²⁻ → CO₂↑ + H₂O",
      visibleEvidence: "Bubbles rise through the liquid as carbon dioxide is produced.",
      realWorldNote: "In a normal lab, acid-carbonate reactions are recognised by immediate effervescence and gas release.",
    };
  }

  if (activeAcid && hasBakingSoda) {
    return {
      type: "bubbles",
      intensity: 0.95,
      resultColor: "#fff7db",
      message: "🫧 Effervescence! Acid reacts with bicarbonate to release carbon dioxide gas.",
      equation: "H⁺ + HCO₃⁻ → CO₂↑ + H₂O",
      visibleEvidence: "Fizzing is seen as carbon dioxide leaves the solution.",
      realWorldNote: "This is the normal pattern seen in school labs when acids are added to bicarbonates.",
    };
  }

  if ((hasHCl && hasNaOH(contents)) || (hasSulfuric && hasNaOH(contents)) || (hasPhosphoric && hasNaOH(contents))) {
    return {
      type: "heat",
      intensity: 0.85,
      resultColor: "#eef8ff",
      message: "🔥 Neutralization observed! The acid and base react to form water and a salt.",
      equation: "Acid + NaOH → Salt + H₂O + heat",
      visibleEvidence: "The liquid stays mostly clear but warms noticeably as the pH moves toward neutral.",
      realWorldNote: "This is the normal real-world neutralization pattern seen in school and analytical laboratories.",
    };
  }

  if (hasCopperSulfate && hasBase) {
    return {
      type: "precipitate",
      intensity: 0.85,
      resultColor: "#87ceeb",
      message: "⬇️ Blue precipitate! Copper(II) hydroxide forms as a pale blue solid.",
      equation: "CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄",
      visibleEvidence: "A pale blue solid appears and settles in the vessel.",
      realWorldNote: "In a normal lab this reaction gives one of the easiest precipitates to recognise by colour.",
    };
  }

  if (hasSilverNitrate && hasSodiumChloride) {
    return {
      type: "precipitate",
      intensity: 0.85,
      resultColor: "#f8fafc",
      message: "⬇️ White precipitate! Silver chloride appears as a curdy white solid.",
      equation: "AgNO₃ + NaCl → AgCl↓ + NaNO₃",
      visibleEvidence: "A curdy white solid forms immediately on mixing.",
      realWorldNote: "This is a standard real-lab test for chloride ions.",
    };
  }

  if (hasAcid && hasBase) {
    return {
      type: "heat",
      intensity: 0.8,
      resultColor: "#87ceeb",
      message: "🔥 Exothermic neutralization! H⁺ + OH⁻ → H₂O + heat",
      equation: "Acid + Base → Salt + H₂O",
      visibleEvidence: "The solution warms and indicators may change colour as the pH moves toward neutral.",
      realWorldNote: "In a normal laboratory, neutralization usually gives a salt solution, water, and a small rise in temperature.",
    };
  }

  if (hasPhenolphthalein && hasBase) {
    return {
      type: "colorChange",
      intensity: 0.8,
      resultColor: "#ff69b4",
      message: "🩷 Indicator colour change! Phenolphthalein turns pink in basic solution.",
      equation: "Indicator response, not a new product-forming reaction",
      visibleEvidence: "The liquid turns pink as soon as the solution is alkaline enough.",
      realWorldNote: "This is the normal way phenolphthalein behaves in school and research labs.",
    };
  }

  if (hasMethylOrange) {
    if (hasAcid) {
      return {
        type: "colorChange",
        intensity: 0.6,
        resultColor: "#ff4d4d",
        message: "🎨 Indicator change! Methyl orange turns red in acidic solution.",
        equation: "Indicator response across pH range",
        visibleEvidence: "The solution becomes red in acidic conditions.",
        realWorldNote: "This matches the normal real-lab colour transition for methyl orange in acid.",
      };
    }
    if (hasBase) {
      return {
        type: "colorChange",
        intensity: 0.6,
        resultColor: "#ffd54f",
        message: "🎨 Indicator change! Methyl orange turns yellow in neutral to basic solution.",
        equation: "Indicator response across pH range",
        visibleEvidence: "The solution becomes yellow once the mixture is neutral or basic.",
        realWorldNote: "This matches normal lab behaviour for methyl orange outside acidic conditions.",
      };
    }
  }

  if (hasBromothymolBlue) {
    if (hasAcid) {
      return {
        type: "colorChange",
        intensity: 0.6,
        resultColor: "#facc15",
        message: "🎨 Indicator change! Bromothymol blue turns yellow in acidic solution.",
        equation: "Indicator response across pH range",
        visibleEvidence: "The liquid shifts to yellow in acidic conditions.",
        realWorldNote: "This is the normal colour seen for bromothymol blue in acidic solution.",
      };
    }
    if (hasBase) {
      return {
        type: "colorChange",
        intensity: 0.6,
        resultColor: "#3b82f6",
        message: "🎨 Indicator change! Bromothymol blue turns blue in basic solution.",
        equation: "Indicator response across pH range",
        visibleEvidence: "The liquid turns blue when the mixture is basic.",
        realWorldNote: "This is the normal colour seen for bromothymol blue in alkaline solution.",
      };
    }
    return {
      type: "colorChange",
      intensity: 0.45,
      resultColor: "#22c55e",
      message: "🎨 Indicator change! Bromothymol blue appears green near neutral pH.",
      equation: "Indicator response across pH range",
      visibleEvidence: "The liquid appears green when the pH is close to neutral.",
      realWorldNote: "This matches the usual real-lab appearance near pH 7.",
    };
  }

  if (hasUniversalIndicator) {
    if (hasAcid) {
      return {
        type: "colorChange",
        intensity: 0.55,
        resultColor: hasSulfuric || hasNitric || hasHCl ? "#ef4444" : "#f97316",
        message: "🎨 Universal indicator shows an acidic colour range from orange to red.",
        equation: "Indicator response across pH range",
        visibleEvidence: "The liquid changes into acidic colours, usually orange to red.",
        realWorldNote: "This follows the usual universal-indicator chart used in normal laboratories.",
      };
    }
    if (hasBase) {
      return {
        type: "colorChange",
        intensity: 0.55,
        resultColor: "#4f46e5",
        message: "🎨 Universal indicator shows a basic colour range from blue to violet.",
        equation: "Indicator response across pH range",
        visibleEvidence: "The liquid changes to blue or violet as the pH becomes alkaline.",
        realWorldNote: "This follows the normal universal-indicator colour scale.",
      };
    }
    return {
      type: "colorChange",
      intensity: 0.45,
      resultColor: "#22c55e",
      message: "🎨 Universal indicator appears green around neutral pH.",
      equation: "Indicator response across pH range",
      visibleEvidence: "The liquid appears green when the solution is near neutral.",
      realWorldNote: "Green is the normal real-lab indicator colour around pH 7.",
    };
  }

  if (hasSilverNitrate && hasPotassiumIodide) {
    return {
      type: "precipitate",
      intensity: 0.9,
      resultColor: "#ffd700",
      message: "⬇️ Yellow precipitate! AgNO₃ + KI → AgI↓ + KNO₃",
      equation: "AgNO₃ + KI → AgI↓ + KNO₃",
      visibleEvidence: "A bright yellow solid appears and settles out of the liquid.",
      realWorldNote: "This is the normal silver iodide precipitation seen in qualitative-analysis work.",
    };
  }

  return null;
}

function hasNaOH(contents: ChemicalContent[]) {
  return contents.some((c) => c.id === "naoh");
}

function getContainerVolume(container: LabContainer) {
  return container.contents.reduce((sum, item) => sum + item.amount, 0);
}

function getAveragePH(contents: ChemicalContent[]) {
  if (!contents.length) return null;
  const total = contents.reduce((sum, item) => sum + item.amount, 0);
  if (!total) return null;
  return Number(
    (
      contents.reduce((sum, item) => sum + item.pH * item.amount, 0) / total
    ).toFixed(1)
  );
}

function getHazardLabel(container: LabContainer | undefined) {
  if (!container || container.contents.length === 0) return "Stable";
  if (container.contents.some((item) => item.reactivity === "explosive")) return "Extreme";
  if (container.contents.some((item) => item.reactivity === "high")) return "Reactive";
  if (container.contents.length > 1) return "Active";
  return "Low risk";
}

function mergeContents(
  targetContents: ChemicalContent[],
  additions: ChemicalContent[],
): ChemicalContent[] {
  const map = new Map<string, ChemicalContent>();

  [...targetContents, ...additions].forEach((item) => {
    const existing = map.get(item.id);
    if (existing) {
      existing.amount += item.amount;
    } else {
      map.set(item.id, { ...item });
    }
  });

  return [...map.values()];
}

interface InteractiveChemistryLabProps {
  onStateChange?: (snapshot: ChemistryLabSnapshot) => void;
  onAskAI?: (question: string) => void;
}

export function InteractiveChemistryLab({
  onStateChange,
  onAskAI,
}: InteractiveChemistryLabProps = {}) {
  const [containers, setContainers] = useState<LabContainer[]>(INITIAL_CONTAINERS);
  const [benchEquipment, setBenchEquipment] = useState<BenchEquipmentItem[]>(INITIAL_BENCH_EQUIPMENT);
  const [selectedContainerId, setSelectedContainerId] = useState<string>("beaker-1");
  const [selectedChemical, setSelectedChemical] = useState<ChemicalContent | null>(null);
  const [draggingChemical, setDraggingChemical] = useState<ChemicalContent | null>(null);
  const [hoveredContainerId, setHoveredContainerId] = useState<string | null>(null);
  const [pourAmount, setPourAmount] = useState(25);
  const [transferAmount, setTransferAmount] = useState(15);
  const [transferSourceId, setTransferSourceId] = useState("cylinder-1");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [observations, setObservations] = useState<string[]>([
    "Welcome to the chemistry laboratory. Select a mission or start building your own experiment.",
  ]);
  const [reactionEffects, setReactionEffects] = useState<
    { containerId: string; effect: ReactionEffect }[]
  >([]);
  const [showNotebook, setShowNotebook] = useState(false);
  const [activeDemo, setActiveDemo] = useState<DemoPreset["id"]>("neutralization");

  const {
    playBubbling,
    playExplosion,
    playGasRelease,
    playGlassBreak,
    playPour,
    playSizzle,
    playSuccess,
    playWarningAlarm,
  } = useLabSounds();

  const selectedContainer = containers.find((container) => container.id === selectedContainerId);
  const activeDemoPreset = DEMO_PRESETS.find((demo) => demo.id === activeDemo) ?? DEMO_PRESETS[0];
  const selectedChemicalMeta = selectedChemical ? SHELF_CHEMICALS[selectedChemical.id] : null;
  const averagePH = selectedContainer ? getAveragePH(selectedContainer.contents) : null;
  const activeSelectedReaction = reactionEffects.find(
    (effect) => effect.containerId === selectedContainerId,
  );
  const targetContainer = containers.find(
    (container) => container.id === activeDemoPreset.targetContainerId,
  );
  const targetReaction = reactionEffects.find(
    (effect) => effect.containerId === activeDemoPreset.targetContainerId,
  );

  const missionChecklist = useMemo(() => {
    const demoContainer = targetContainer;
    const totalVolume = demoContainer ? getContainerVolume(demoContainer) : 0;
    const contents = demoContainer?.contents ?? [];
    const contentIds = new Set(contents.map((item) => item.id));
    const requiredChemicalCount = activeDemoPreset.chemicals.filter((item) =>
      contentIds.has(item.id),
    ).length;
    const hasObservation = observations.some(
      (entry) =>
        entry.includes("VIOLENT") ||
        entry.includes("DISPLACEMENT") ||
        entry.includes("GAS EVOLUTION") ||
        entry.includes("neutralization") ||
        entry.includes("Indicator colour") ||
        entry.includes("bubbling"),
    );
    const hasReaction = Boolean(targetReaction);
    const hasHeatOrProcedure = demoContainer
      ? demoContainer.temperature > 30 || demoContainer.isHeating
      : false;

    return [
      {
        label: `Prepare ${demoContainer?.label ?? "the reaction vessel"}`,
        complete: selectedContainerId === activeDemoPreset.targetContainerId || totalVolume > 0,
      },
      {
        label: "Add the required reactants",
        complete: requiredChemicalCount === activeDemoPreset.chemicals.length,
      },
      {
        label: "Observe visible evidence of reaction",
        complete: hasReaction || hasObservation,
      },
      {
        label: "Record interpretation in the notebook",
        complete: showNotebook || hasHeatOrProcedure,
      },
    ];
  }, [activeDemoPreset, observations, selectedContainerId, showNotebook, targetContainer, targetReaction]);

  const missionProgress = useMemo(() => {
    const completed = missionChecklist.filter((item) => item.complete).length;
    return Math.round((completed / missionChecklist.length) * 100);
  }, [missionChecklist]);

  const registerObservation = useCallback((message: string) => {
    setObservations((current) => [message, ...current.slice(0, 11)]);
  }, []);

  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const dragIntersectionRef = useRef(new THREE.Vector3());
  const dragOffsetRef = useRef(new THREE.Vector3());
  const draggingObjectRef = useRef<{ kind: "container" | "equipment"; id: string } | null>(null);
  const didDragMoveRef = useRef(false);
  const suppressNextSelectRef = useRef(false);

  const beginDragObject = useCallback(
    (kind: "container" | "equipment", objectId: string, position: [number, number, number], e: ThreeEvent<PointerEvent>) => {
      draggingObjectRef.current = { kind, id: objectId };
      didDragMoveRef.current = false;

      dragPlaneRef.current.set(new THREE.Vector3(0, 1, 0), -position[1]);

      const intersection = dragIntersectionRef.current;
      if (e.ray.intersectPlane(dragPlaneRef.current, intersection)) {
        dragOffsetRef.current.copy(intersection).sub(
          new THREE.Vector3(position[0], position[1], position[2]),
        );
      } else {
        dragOffsetRef.current.set(0, 0, 0);
      }

      (e.target as unknown as HTMLElement)?.setPointerCapture?.(e.pointerId);
      document.body.style.cursor = "grabbing";
    },
    [],
  );

  const beginDragContainer = useCallback(
    (containerId: string, e: ThreeEvent<PointerEvent>) => {
      const container = containers.find((item) => item.id === containerId);
      if (!container) return;
      beginDragObject("container", containerId, container.position, e);
    },
    [beginDragObject, containers],
  );

  const beginDragEquipment = useCallback(
    (equipmentId: string, e: ThreeEvent<PointerEvent>) => {
      const equipment = benchEquipment.find((item) => item.id === equipmentId);
      if (!equipment) return;
      beginDragObject("equipment", equipmentId, equipment.position, e);
    },
    [beginDragObject, benchEquipment],
  );

  const updateDragContainer = useCallback((e: ThreeEvent<PointerEvent>) => {
    const draggingObject = draggingObjectRef.current;
    if (!draggingObject) return;

    const intersection = dragIntersectionRef.current;
    if (!e.ray.intersectPlane(dragPlaneRef.current, intersection)) return;

    const next = intersection.clone().sub(dragOffsetRef.current);
    didDragMoveRef.current = true;

    // Clamp movement to the bench footprint
    const clampedX = THREE.MathUtils.clamp(next.x, -2.6, 2.6);
    const clampedZ = THREE.MathUtils.clamp(next.z, -1.35, 1.35);

    setContainers((current) =>
      draggingObject.kind === "container"
        ? current.map((container) =>
            container.id === draggingObject.id
              ? { ...container, position: [clampedX, container.position[1], clampedZ] }
              : container,
          )
        : current,
    );

    if (draggingObject.kind === "equipment") {
      setBenchEquipment((current) =>
        current.map((equipment) =>
          equipment.id === draggingObject.id
            ? { ...equipment, position: [clampedX, equipment.position[1], clampedZ] }
            : equipment,
        ),
      );
    }
  }, []);

  const endDragContainer = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!draggingObjectRef.current) return;

    (e.target as unknown as HTMLElement)?.releasePointerCapture?.(e.pointerId);
    document.body.style.cursor = "auto";

    if (didDragMoveRef.current) {
      // Prevent click-to-select from firing after a drag movement.
      suppressNextSelectRef.current = true;
    }

    draggingObjectRef.current = null;
    didDragMoveRef.current = false;
  }, []);

  const setReactionFeedback = useCallback(
    (containerId: string, reaction: ReactionEffect) => {
      registerObservation(reaction.message);
      setReactionEffects((current) => [
        ...current.filter((item) => item.containerId !== containerId),
        { containerId, effect: reaction },
      ]);

      window.setTimeout(() => {
        setReactionEffects((current) => current.filter((item) => item.containerId !== containerId));
      }, reaction.type === "explosion" ? 3200 : 5200);

      if (!soundEnabled) return;

      if (reaction.type === "explosion") {
        playWarningAlarm();
        playExplosion();
        window.setTimeout(() => playGlassBreak(), 200);
        toast.error(reaction.message);
        return;
      }

      if (reaction.type === "bubbles" || reaction.type === "gas") {
        playBubbling(2);
        playGasRelease(1.5);
        toast.success(reaction.message);
        return;
      }

      if (reaction.type === "heat") {
        playSizzle(1.2);
        toast.info(reaction.message);
        return;
      }

      toast.success(reaction.message);
    },
    [
      playBubbling,
      playExplosion,
      playGasRelease,
      playGlassBreak,
      playSizzle,
      playWarningAlarm,
      registerObservation,
      soundEnabled,
    ],
  );

  const resetLab = useCallback((message?: string) => {
    setContainers(INITIAL_CONTAINERS);
    setBenchEquipment(INITIAL_BENCH_EQUIPMENT);
    setReactionEffects([]);
    setSelectedChemical(null);
    setDraggingChemical(null);
    setSelectedContainerId("beaker-1");
    setTransferSourceId("cylinder-1");
    setObservations(
      message
        ? [message]
        : ["The laboratory has been reset. Select a mission or begin a free experiment."],
    );
  }, []);

  const addChemicalToContainerInternal = useCallback(
    (containerId: string, chemical: ChemicalContent, requestedAmount = pourAmount) => {
      setContainers((current) =>
        current.map((container) => {
          if (container.id !== containerId) return container;

          const spaceLeft = container.capacity - getContainerVolume(container);
          const amountToAdd = Math.min(requestedAmount, spaceLeft);

          if (amountToAdd <= 0) {
            toast.error(`${container.label} is full.`);
            return container;
          }

          let contents = mergeContents(container.contents, [{ ...chemical, amount: amountToAdd }]);
          const reaction = checkForReaction(contents);

          if (reaction?.resultColor) {
            contents = contents.map((item) => ({ ...item, color: reaction.resultColor ?? item.color }));
          }

          if (reaction) {
            setReactionFeedback(container.id, reaction);
          } else {
            registerObservation(`Added ${amountToAdd}mL of ${chemical.name} to ${container.label}.`);
          }

          if (soundEnabled) playPour(0.7);
          toast.success(`Added ${amountToAdd}mL of ${chemical.name} to ${container.label}`);

          return {
            ...container,
            contents,
            temperature: reaction?.type === "heat" ? Math.min(100, container.temperature + 20) : container.temperature,
          };
        }),
      );
    },
    [playPour, pourAmount, registerObservation, setReactionFeedback, soundEnabled],
  );

  const handleDragStart = useCallback((chemical: ChemicalContent) => {
    setDraggingChemical(chemical);
    setSelectedChemical(chemical);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (draggingChemical) {
      const dropTarget = hoveredContainerId ?? selectedContainerId;
      if (dropTarget) {
        addChemicalToContainerInternal(dropTarget, draggingChemical);
      }
    }
    setDraggingChemical(null);
  }, [addChemicalToContainerInternal, draggingChemical, hoveredContainerId, selectedContainerId]);

  const handleChemicalSelect = useCallback((chemical: ChemicalContent) => {
    setSelectedChemical(chemical);
    toast.info(`Selected ${chemical.name}.`);
  }, []);

  const handleSelectContainer = useCallback((containerId: string) => {
    if (suppressNextSelectRef.current) {
      suppressNextSelectRef.current = false;
      return;
    }
    setSelectedContainerId(containerId);
  }, []);

  const toggleEquipmentVisibility = useCallback((equipmentId: string) => {
    setBenchEquipment((current) =>
      current.map((item) =>
        item.id === equipmentId ? { ...item, visible: !item.visible } : item,
      ),
    );
  }, []);

  const resetBenchLayout = useCallback(() => {
    setContainers(INITIAL_CONTAINERS);
    setBenchEquipment(INITIAL_BENCH_EQUIPMENT);
    registerObservation("Bench layout restored to a standard laboratory arrangement.");
    toast.success("Bench layout restored.");
  }, [registerObservation]);

  const addChemicalToContainer = useCallback(() => {
    if (!selectedChemical || !selectedContainerId) {
      toast.error("Select both a chemical and a target container.");
      return;
    }
    addChemicalToContainerInternal(selectedContainerId, selectedChemical);
  }, [addChemicalToContainerInternal, selectedChemical, selectedContainerId]);

  const clearContainer = useCallback(
    (containerId: string) => {
      setContainers((current) =>
        current.map((container) =>
          container.id === containerId
            ? { ...container, contents: [], temperature: 25, isHeating: false }
            : container,
        ),
      );
      setReactionEffects((current) => current.filter((item) => item.containerId !== containerId));
      registerObservation("A container was emptied and returned to ambient conditions.");
      toast.info("Container cleared.");
    },
    [registerObservation],
  );

  const toggleHeating = useCallback(
    (containerId: string) => {
      setContainers((current) =>
        current.map((container) =>
          container.id === containerId
            ? { ...container, isHeating: !container.isHeating }
            : container,
        ),
      );
      const container = containers.find((item) => item.id === containerId);
      if (!container) return;
      registerObservation(
        `${container.isHeating ? "Stopped" : "Started"} heating for ${container.label}.`,
      );
    },
    [containers, registerObservation],
  );

  const transferBetweenContainers = useCallback(() => {
    if (!transferSourceId || !selectedContainerId) {
      toast.error("Choose both a source and a destination vessel.");
      return;
    }

    if (transferSourceId === selectedContainerId) {
      toast.error("Choose two different containers for transfer.");
      return;
    }

    setContainers((current) => {
      const source = current.find((container) => container.id === transferSourceId);
      const target = current.find((container) => container.id === selectedContainerId);

      if (!source || !target) return current;

      const sourceVolume = getContainerVolume(source);
      if (!sourceVolume) {
        toast.error(`${source.label} is empty.`);
        return current;
      }

      const targetSpaceLeft = target.capacity - getContainerVolume(target);
      const actualTransfer = Math.min(transferAmount, sourceVolume, targetSpaceLeft);

      if (actualTransfer <= 0) {
        toast.error(`${target.label} has no space left.`);
        return current;
      }

      const ratio = actualTransfer / sourceVolume;
      const movedContents = source.contents
        .map((item) => ({ ...item, amount: Number((item.amount * ratio).toFixed(2)) }))
        .filter((item) => item.amount > 0);

      const updatedSourceContents = source.contents
        .map((item) => ({
          ...item,
          amount: Number((item.amount - item.amount * ratio).toFixed(2)),
        }))
        .filter((item) => item.amount > 0.05);

      let updatedTargetContents = mergeContents(target.contents, movedContents);
      const reaction = checkForReaction(updatedTargetContents);

      if (reaction?.resultColor) {
        updatedTargetContents = updatedTargetContents.map((item) => ({
          ...item,
          color: reaction.resultColor ?? item.color,
        }));
      }

      if (reaction) {
        setReactionFeedback(target.id, reaction);
      } else {
        registerObservation(`Transferred ${actualTransfer}mL from ${source.label} into ${target.label}.`);
      }

      if (soundEnabled) playPour(0.8);
      toast.success(`Transferred ${actualTransfer}mL to ${target.label}`);

      return current.map((container) => {
        if (container.id === source.id) {
          return { ...container, contents: updatedSourceContents };
        }

        if (container.id === target.id) {
          return {
            ...container,
            contents: updatedTargetContents,
            temperature: reaction?.type === "heat" ? Math.min(100, container.temperature + 12) : container.temperature,
          };
        }

        return container;
      });
    });
  }, [
    playPour,
    registerObservation,
    selectedContainerId,
    setReactionFeedback,
    soundEnabled,
    transferAmount,
    transferSourceId,
  ]);

  const runDemoPreset = useCallback(
    (preset: DemoPreset) => {
      resetLab(`Mission loaded: ${preset.title}. ${preset.objective}`);
      setActiveDemo(preset.id);
      setSelectedContainerId(preset.targetContainerId);
      setShowNotebook(true);
      setPourAmount(25);
      setTransferSourceId("cylinder-1");

      preset.chemicals.forEach((step, index) => {
        window.setTimeout(() => {
          const chemical = SHELF_CHEMICALS[step.id];
          if (!chemical) return;
          setSelectedChemical(chemical);
          addChemicalToContainerInternal(preset.targetContainerId, chemical, step.amount);
        }, index * 950);
      });

      window.setTimeout(() => {
        registerObservation(`Scientific explanation: ${preset.explanation}`);
        if (soundEnabled) playSuccess();
      }, preset.chemicals.length * 950 + 500);
    },
    [addChemicalToContainerInternal, playSuccess, registerObservation, resetLab, soundEnabled],
  );

  useEffect(() => {
    const heatingContainers = containers.filter(
      (container) => container.isHeating && container.temperature < 100,
    );

    if (!heatingContainers.length) return;

    const timer = window.setInterval(() => {
      setContainers((current) =>
        current.map((container) =>
          container.isHeating && container.temperature < 100
            ? { ...container, temperature: Math.min(100, container.temperature + 2) }
            : container,
        ),
      );
    }, 450);

    return () => window.clearInterval(timer);
  }, [containers]);

  useEffect(() => {
    if (!onStateChange) return;

    onStateChange({
      selectedContainerLabel: selectedContainer?.label ?? null,
      selectedContainerId: selectedContainer?.id ?? null,
      selectedChemicalName: selectedChemical?.name ?? null,
      averagePH,
      missionTitle: activeDemoPreset.title,
      missionProgress,
      observations,
      containers: containers.map((container) => ({
        id: container.id,
        label: container.label,
        type: container.type,
        volume: getContainerVolume(container),
        temperature: container.temperature,
        isHeating: container.isHeating,
        hazard: getHazardLabel(container),
        contents: container.contents.map((item) => ({
          id: item.id,
          name: item.name,
          amount: item.amount,
          pH: item.pH,
        })),
      })),
    });
  }, [
    activeDemoPreset.title,
    averagePH,
    containers,
    missionProgress,
    observations,
    onStateChange,
    selectedChemical,
    selectedContainer,
  ]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,#f8fbfd_0%,#eef4f7_100%)]">
      <div className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-2 text-sky-700 shadow-sm">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-900">Chemistry Laboratory Bench</h1>
                <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-700">
                  Real-world setup
                </Badge>
              </div>
              <p className="text-xs text-slate-600">
                Practical bench work, guided procedures, molecular reasoning, and multilingual science support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotebook((value) => !value)}
              className={showNotebook ? "text-amber-700" : "text-slate-600"}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Notebook
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled((value) => !value)}
              className="text-slate-600 hover:text-slate-900"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden">
        <div className="order-2 w-full shrink-0 space-y-4 border-b border-slate-200 bg-white/70 p-4 xl:order-1 xl:w-[340px] xl:overflow-y-auto xl:border-b-0 xl:border-r">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-900">
                <Target className="h-4 w-4 text-sky-600" />
                Mission briefing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{activeDemoPreset.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {activeDemoPreset.description}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Mission progress</span>
                  <span>{missionProgress}%</span>
                </div>
                <Progress value={missionProgress} className="h-2 bg-slate-200" />
              </div>

              <div className="space-y-2">
                {missionChecklist.map((step) => (
                  <div
                    key={step.label}
                    className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2"
                  >
                    {step.complete ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                    ) : (
                      <ChevronRight className="mt-0.5 h-4 w-4 text-slate-500" />
                    )}
                    <span className="text-xs text-slate-700">{step.label}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {DEMO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => runDemoPreset(preset)}
                    className={`rounded-xl border px-2 py-2 text-left transition ${
                      activeDemo === preset.id
                        ? "border-sky-300 bg-sky-50 text-slate-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
                    }`}
                  >
                    <div className="text-xs font-semibold">{preset.title}</div>
                  </button>
                ))}
              </div>

              {onAskAI && (
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    className="border-sky-300 text-slate-700 hover:bg-sky-50"
                    onClick={() =>
                      onAskAI(
                        `Guide me through the ${activeDemoPreset.title} experiment using the current bench state. Tell me what I should do next and what evidence I should observe.`,
                      )
                    }
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    Ask AI for next step
                  </Button>
                  <Button
                    variant="outline"
                    className="border-violet-300 text-slate-700 hover:bg-violet-50"
                    onClick={() =>
                      onAskAI(
                        `Explain what is happening in ${selectedContainer?.label ?? "the selected vessel"} based on its contents, pH, and temperature.`,
                      )
                    }
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    Explain selected vessel
                  </Button>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">What to watch for</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  {activeDemoPreset.expected}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-900">
                <Droplets className="h-4 w-4 text-sky-600" />
                Reagent control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                {selectedChemical ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-full border border-white/20"
                        style={{ backgroundColor: selectedChemical.color }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{selectedChemical.name}</p>
                        <p className="text-xs text-slate-600">
                          {selectedChemicalMeta?.formula ?? "Reagent"} · pH {selectedChemical.pH} · {getPhysicalStateLabel(selectedChemical.state)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-slate-300 text-slate-600">
                        {selectedChemicalMeta?.hazardLevel ?? "safe"} handling
                      </Badge>
                      <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-700">
                        {getPhysicalStateLabel(selectedChemical.state)}
                      </Badge>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">
                      {getRealLabAppearance(selectedChemical)}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600">
                    Select a bottle from the shelf to inspect its pH, formula, physical state, and hazard level.
                  </p>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Measured pour amount</span>
                  <span>{pourAmount}mL</span>
                </div>
                <Slider
                  value={[pourAmount]}
                  onValueChange={([value]) => setPourAmount(value)}
                  min={5}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-500">Target vessel</label>
                <Select value={selectedContainerId} onValueChange={setSelectedContainerId}>
                  <SelectTrigger className="border-slate-300 bg-white text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {containers.map((container) => (
                      <SelectItem key={container.id} value={container.id}>
                        {container.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Button
                  onClick={addChemicalToContainer}
                  disabled={!selectedChemical}
                  className="bg-sky-600 text-white hover:bg-sky-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add reagent to vessel
                </Button>

                {selectedContainer && (
                  <>
                    <Button
                      onClick={() => toggleHeating(selectedContainer.id)}
                      variant={selectedContainer.isHeating ? "destructive" : "outline"}
                      className="border-slate-300 text-slate-700"
                    >
                      <Flame className="mr-2 h-4 w-4" />
                      {selectedContainer.isHeating ? "Stop heating" : "Start heating"}
                    </Button>
                    <Button
                      onClick={() => clearContainer(selectedContainer.id)}
                      variant="outline"
                      className="border-slate-300 text-slate-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Empty vessel
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-900">
                <ArrowRightLeft className="h-4 w-4 text-emerald-600" />
                Natural liquid transfer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-500">Source vessel</label>
                <Select value={transferSourceId} onValueChange={setTransferSourceId}>
                  <SelectTrigger className="border-slate-300 bg-white text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {containers.map((container) => (
                      <SelectItem key={container.id} value={container.id}>
                        {container.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Transfer amount</span>
                  <span>{transferAmount}mL</span>
                </div>
                <Slider
                  value={[transferAmount]}
                  onValueChange={([value]) => setTransferAmount(value)}
                  min={5}
                  max={60}
                  step={5}
                />
              </div>

              <Button
                onClick={transferBetweenContainers}
                variant="outline"
                className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <Move3D className="mr-2 h-4 w-4" />
                Transfer into selected vessel
              </Button>
              <p className="text-xs leading-relaxed text-slate-500">
                Drag any visible vessel or bench tool to place it anywhere on the worktable.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-900">
                <Move3D className="h-4 w-4 text-violet-600" />
                Bench equipment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs leading-relaxed text-slate-600">
                Choose the equipment you want to keep on the bench, then reposition it to match a normal laboratory setup.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {benchEquipment.map((equipment) => (
                  <button
                    key={equipment.id}
                    onClick={() => toggleEquipmentVisibility(equipment.id)}
                    className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                      equipment.visible
                        ? "border-sky-300 bg-sky-50 text-slate-900"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-semibold">{equipment.label}</div>
                    <div className="mt-1 text-[11px]">
                      {equipment.visible ? "Visible on bench" : "Hidden from bench"}
                    </div>
                  </button>
                ))}
              </div>
              <Button
                onClick={resetBenchLayout}
                variant="outline"
                className="w-full border-violet-300 text-violet-700 hover:bg-violet-50"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore standard layout
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Experiment objective
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-relaxed text-slate-700">
              <p>{activeDemoPreset.objective}</p>
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Materials</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeDemoPreset.materials.map((item) => (
                    <Badge key={item} variant="outline" className="border-slate-300 text-slate-600">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Scientific explanation</p>
                <p className="mt-1 text-slate-700">{activeDemoPreset.explanation}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="order-1 relative h-[520px] min-h-[360px] min-w-0 shrink-0 xl:order-2 xl:h-auto xl:min-h-0 xl:flex-1">
          <Canvas
            camera={{ position: [0, 2.8, 6.5], fov: 46 }}
            shadows
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          >
            <color attach="background" args={["#eef4f7"]} />
            <Environment preset="studio" />
            <ambientLight intensity={0.78} />
            <directionalLight
              position={[6, 9, 4]}
              intensity={1.9}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
            <pointLight position={[-5, 2.6, 3]} intensity={0.3} color="#ffffff" />
            <pointLight position={[4, 2.5, -3]} intensity={0.25} color="#fffaf0" />

            <group position={[0, 0.2, -3.2]}>
              <mesh position={[0, 1.6, 0]}>
                <boxGeometry args={[11, 3.8, 0.25]} />
                <meshStandardMaterial color="#f5f7f8" metalness={0.15} roughness={0.88} />
              </mesh>
              <mesh position={[-2.6, 1.8, 0.13]}>
                <boxGeometry args={[2.4, 1.5, 0.04]} />
                <meshStandardMaterial color="#ddeffd" emissive="#dbeafe" emissiveIntensity={0.04} />
              </mesh>
              <mesh position={[2.6, 1.8, 0.13]}>
                <boxGeometry args={[2.4, 1.5, 0.04]} />
                <meshStandardMaterial color="#e6edf2" emissive="#ffffff" emissiveIntensity={0.02} />
              </mesh>
            </group>

            <WallStorage3D />

            <group position={[-5.4, 0.5, 0]}>
              <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[6.4, 3.2, 0.2]} />
                <meshStandardMaterial color="#edf1f3" roughness={0.92} />
              </mesh>
            </group>

            <group position={[5.4, 0.5, 0]}>
              <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[6.4, 3.2, 0.2]} />
                <meshStandardMaterial color="#edf1f3" roughness={0.92} />
              </mesh>
            </group>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#dbe3e8" roughness={0.97} />
            </mesh>

            <group position={[0, 2.8, 0]}>
              {[-2.5, 0, 2.5].map((x) => (
                <mesh key={x} position={[x, 0, 0]}>
                  <boxGeometry args={[1.4, 0.08, 0.8]} />
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.18} />
                </mesh>
              ))}
            </group>

            <group position={[0, -0.72, 0]}>
              <mesh receiveShadow castShadow>
                <boxGeometry args={[6.2, 0.16, 3.7]} />
                <meshStandardMaterial color="#d4d8dc" roughness={0.48} metalness={0.45} />
              </mesh>
              {[
                [-2.85, -0.52, 1.55],
                [2.85, -0.52, 1.55],
                [-2.85, -0.52, -1.55],
                [2.85, -0.52, -1.55],
              ].map((position, index) => (
                <mesh key={index} position={position as [number, number, number]} castShadow>
                  <boxGeometry args={[0.15, 1.04, 0.15]} />
                  <meshStandardMaterial color="#9aa5af" metalness={0.45} roughness={0.4} />
                </mesh>
              ))}
            </group>

            <group position={[3.45, -0.4, -0.95]}>
              <mesh>
                <boxGeometry args={[1.1, 1.6, 1]} />
                <meshStandardMaterial color="#cfd7de" metalness={0.4} roughness={0.45} />
              </mesh>
              <mesh position={[0, 0.05, 0.44]}>
                <boxGeometry args={[0.95, 1.45, 0.03]} />
                <meshPhysicalMaterial color="#dbeafe" transparent opacity={0.12} transmission={0.95} />
              </mesh>
            </group>

            <group position={[-4.05, -0.2, -0.8]}>
              <mesh position={[0, 0.8, 0]}>
                <boxGeometry args={[0.9, 1.8, 0.9]} />
                <meshStandardMaterial color="#d7dde2" />
              </mesh>
              <mesh position={[0.2, 1.45, 0.45]}>
                <cylinderGeometry args={[0.08, 0.08, 0.45, 20]} />
                <meshStandardMaterial color="#8fb9cf" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[-0.15, 1.1, 0.45]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.05, 0.45, 20]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.2} />
              </mesh>
            </group>

            <group position={[0, 0.3, -1.52]}>
              <ChemicalShelf3D
                position={[0, 0, 0]}
                onSelectChemical={handleChemicalSelect}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                selectedChemicalId={selectedChemical?.id}
                draggingChemicalId={draggingChemical?.id}
              />
            </group>

            <group position={[0, -0.1, 0.8]}>
              <mesh position={[0, 0.42, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.01, 0.01, 1.1, 18]} />
                <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[-0.2, 0.2, 0]}>
                <boxGeometry args={[0.05, 0.36, 0.05]} />
                <meshStandardMaterial color="#6b7280" metalness={0.5} roughness={0.3} />
              </mesh>
              <mesh position={[0.23, 0.08, 0]}>
                <boxGeometry args={[0.32, 0.03, 0.18]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.2} />
              </mesh>
              <mesh position={[-1.28, 0.15, 0]}>
                <boxGeometry args={[0.2, 0.18, 0.08]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.2} />
              </mesh>
            </group>

            {benchEquipment
              .filter((equipment) => equipment.visible)
              .map((equipment) => (
                <group
                  key={equipment.id}
                  position={equipment.position}
                  onPointerDownCapture={(e) => {
                    e.stopPropagation();
                    beginDragEquipment(equipment.id, e);
                  }}
                  onPointerMoveCapture={(e) => {
                    e.stopPropagation();
                    updateDragContainer(e);
                  }}
                  onPointerUpCapture={(e) => {
                    e.stopPropagation();
                    endDragContainer(e);
                  }}
                >
                  {equipment.kind === "washBottle" && <WashBottle3D position={[0, 0, 0]} />}
                  {equipment.kind === "retortStand" && <RetortStand3D position={[0, 0, 0]} />}
                  {equipment.kind === "balance" && <DigitalBalance3D position={[0, 0, 0]} />}
                  {equipment.kind === "tubeRack" && <TestTubeRack3D position={[0, 0, 0]} />}
                  {equipment.kind === "phMeter" && (
                    <RealisticPHMeter3D position={[0, 0, 0]} currentPH={averagePH ?? 7} />
                  )}
                  {equipment.kind === "thermometer" && (
                    <RealisticThermometer3D
                      position={[0, 0, 0]}
                      rotation={[0, 0, Math.PI / 3.5]}
                      temperature={selectedContainer?.temperature ?? 25}
                    />
                  )}
                </group>
              ))}
            <group position={[-2.68, -0.52, -0.72]}>
              <RealisticChemicalBottle3D
                position={[0, 0, 0]}
                chemicalName="Nitric Acid"
                chemicalColor="#fff0a8"
                hazardLevel="extreme"
                fillLevel={0.68}
              />
              <RealisticChemicalBottle3D
                position={[0.34, 0, 0.02]}
                chemicalName="Phosphoric Acid"
                chemicalColor="#f9ebb5"
                hazardLevel="high"
                fillLevel={0.64}
              />
              <RealisticChemicalBottle3D
                position={[0.68, 0, 0]}
                chemicalName="Ethanol"
                chemicalColor="#dff7ff"
                hazardLevel="medium"
                fillLevel={0.72}
              />
            </group>

            {containers.map((container) => {
              const activeReaction = reactionEffects.find((item) => item.containerId === container.id);
              const isDropTarget = Boolean(draggingChemical && hoveredContainerId === container.id);
              const props = {
                type: container.type,
                position: container.position,
                capacity: container.capacity,
                contents: container.contents,
                isSelected: container.id === selectedContainerId,
                isDropTarget,
                isHeating: container.isHeating,
                temperature: container.temperature,
                label: container.label,
                reactionEffect: activeReaction?.effect.type ?? null,
                onSelect: () => handleSelectContainer(container.id),
                onHoverChange: (hovered: boolean) =>
                  setHoveredContainerId(hovered ? container.id : null),
                onPointerDownCapture: (e: ThreeEvent<PointerEvent>) =>
                  beginDragContainer(container.id, e),
                onPointerMoveCapture: updateDragContainer,
                onPointerUpCapture: endDragContainer,
              };

              switch (container.type) {
                case "beaker":
                  return <InteractiveBeaker3D key={container.id} {...props} />;
                case "flask":
                  return <InteractiveFlask3D key={container.id} {...props} />;
                case "testTube":
                  return <InteractiveTestTube3D key={container.id} {...props} />;
                case "cylinder":
                  return <InteractiveCylinder3D key={container.id} {...props} />;
                default:
                  return null;
              }
            })}

            {containers
              .filter((container) => container.isHeating)
              .map((container) => (
                <group
                  key={`heat-${container.id}`}
                  position={[
                    container.position[0],
                    -0.65,
                    container.position[2],
                  ]}
                >
                  <RealisticTripod3D position={[0, 0.1, 0]} />
                  <RealisticBunsenBurner3D
                    position={[0, -0.34, 0]}
                    isActive
                    flameIntensity={Math.min(1, container.temperature / 100)}
                    flameType="blue"
                  />
                </group>
              ))}

            <OrbitControls
              enablePan
              enableZoom
              minDistance={3.4}
              maxDistance={11}
              maxPolarAngle={Math.PI / 2.1}
            />
          </Canvas>

          <div className="pointer-events-none absolute left-4 top-4 max-w-xs rounded-2xl border border-sky-200 bg-white/92 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-600" />
              <p className="text-sm font-semibold text-slate-900">Immersive bench mode</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Rotate around the room, inspect the shelves, select glassware, and arrange vessels and bench tools the way a normal laboratory workflow requires.
            </p>
          </div>

          <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-slate-200 bg-white/92 px-4 py-2 shadow-sm backdrop-blur">
            <p className="text-xs text-slate-600">
              Click a bottle to inspect it. Click any vessel to make it active. Drag a vessel or tool to place it on the workbench.
            </p>
          </div>
        </div>

        <div className="order-3 w-full shrink-0 space-y-4 border-t border-slate-200 bg-white/70 p-4 xl:w-[300px] xl:overflow-y-auto xl:border-l xl:border-t-0">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-900">
                <Gauge className="h-4 w-4 text-sky-600" />
                Active vessel analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedContainer ? (
                <>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-900">{selectedContainer.label}</p>
                    <p className="text-xs text-slate-600">{selectedContainer.type} workstation</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Droplets className="h-3.5 w-3.5" />
                        Volume
                      </div>
                      <p className="mt-1 font-semibold text-slate-900">
                        {getContainerVolume(selectedContainer).toFixed(0)}mL
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Thermometer className="h-3.5 w-3.5" />
                        Temperature
                      </div>
                      <p className="mt-1 font-semibold text-slate-900">
                        {selectedContainer.temperature}°C
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Beaker className="h-3.5 w-3.5" />
                        Estimated pH
                      </div>
                      <p className="mt-1 font-semibold text-slate-900">
                        {averagePH ?? "N/A"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Hazard
                      </div>
                      <p className="mt-1 font-semibold text-slate-900">
                        {getHazardLabel(selectedContainer)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">Contents</p>
                    <div className="mt-2 space-y-2">
                      {selectedContainer.contents.length ? (
                        selectedContainer.contents.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full border border-white/20"
                                style={{ backgroundColor: item.color }}
                              />
                              <div>
                                <span className="text-slate-700">{item.name}</span>
                                <p className="text-[11px] text-slate-500">
                                  {getPhysicalStateLabel(item.state)} · pH {item.pH}
                                </p>
                              </div>
                            </div>
                            <span className="text-slate-500">{item.amount.toFixed(0)}mL</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">No chemicals in this vessel yet.</p>
                      )}
                    </div>
                  </div>

                  {activeSelectedReaction ? (
                    <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-sky-700">Current reaction</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {activeSelectedReaction.effect.message}
                      </p>
                      <div className="mt-3 space-y-2 text-xs leading-relaxed text-slate-700">
                        <div>
                          <span className="font-semibold text-slate-900">Equation:</span>{" "}
                          {activeSelectedReaction.effect.equation}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900">Visible evidence:</span>{" "}
                          {activeSelectedReaction.effect.visibleEvidence}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900">Real-world lab note:</span>{" "}
                          {activeSelectedReaction.effect.realWorldNote}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-900">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Laboratory observations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {observations.map((observation, index) => (
                  <div
                    key={`${observation}-${index}`}
                    className={`rounded-xl border p-3 text-xs leading-relaxed ${
                      observation.includes("VIOLENT")
                        ? "border-red-500/30 bg-red-500/10 text-red-100"
                        : observation.includes("Exothermic") || observation.includes("heat")
                          ? "border-orange-500/30 bg-orange-500/10 text-orange-100"
                          : observation.includes("DISPLACEMENT") || observation.includes("precipitate")
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
                            : observation.includes("Indicator") || observation.includes("pink")
                              ? "border-pink-500/30 bg-pink-500/10 text-pink-100"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {observation}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setObservations(["Observation feed cleared. Continue the experiment to generate new evidence."])}
                className="w-full border-slate-300 text-slate-700"
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                Clear observations
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-900">
                <Sparkles className="h-4 w-4 text-violet-600" />
                Fast reaction ideas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-700">
              {QUICK_REACTIONS.map((reaction) => (
                <div key={reaction} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  {reaction}
                </div>
              ))}
            </CardContent>
          </Card>

          <Button
            onClick={() => resetLab()}
            variant="outline"
            className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset whole laboratory
          </Button>
        </div>

        {showNotebook && (
          <div className="w-[320px] overflow-y-auto border-l border-slate-200 bg-white/80 p-4">
            <LabNotebook
              labType="chemistry"
              experimentTitle={activeDemoPreset.title}
              autoObservations={observations}
            />
          </div>
        )}
      </div>
    </div>
  );
}
