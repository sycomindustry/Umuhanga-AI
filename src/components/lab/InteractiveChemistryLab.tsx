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
import { RealisticBunsenBurner3D, RealisticTripod3D } from "./RealisticEquipment3D";
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

interface ReactionEffect {
  type: "explosion" | "bubbles" | "precipitate" | "colorChange" | "gas" | "heat";
  intensity: number;
  resultColor?: string;
  message: string;
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

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "neutralization",
    title: "Acid-Base Neutralization",
    description:
      "Guide the student through a classic acid and base reaction with visible evidence and gentle heat release.",
    objective: "Show how acids and bases react to form a safer, more balanced solution.",
    expected: "The solution changes appearance, warms slightly, and produces a clear explanation of neutralization.",
    materials: ["Acetic acid", "Sodium bicarbonate", "Phenolphthalein", "Main beaker"],
    steps: [
      "Select the main beaker as the active workstation.",
      "Measure and add vinegar before introducing baking soda.",
      "Add indicator and observe the solution colour and temperature.",
      "Record the evidence of neutralization in the notebook.",
    ],
    targetContainerId: "beaker-1",
    chemicals: [
      { id: "vinegar", amount: 30 },
      { id: "baking_soda", amount: 20 },
      { id: "phenolphthalein", amount: 10 },
    ],
    explanation:
      "Hydrogen ions from the acid react with basic ions and produce new substances. Gas evolution and heat help students identify that a chemical reaction has happened.",
  },
  {
    id: "redox",
    title: "Copper Displacement",
    description:
      "Demonstrate a single displacement reaction where a more reactive metal replaces copper from solution.",
    objective: "Observe oxidation and reduction in a way students can see directly on the metal surface.",
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
      "Create a fast, visible gas-forming reaction that students can connect to reactants, products, and evidence.",
    objective: "Help students recognise bubbling as evidence of a gas product in a reaction.",
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
  "Na + H₂O → violent explosion",
  "CuSO₄ + Fe → copper displacement",
  "NaOH + phenolphthalein → pink indicator",
  "Vinegar + baking soda → carbon dioxide bubbles",
  "AgNO₃ + KI → yellow precipitate",
  "Zn + HCl → hydrogen gas",
];

function checkForReaction(contents: ChemicalContent[]): ReactionEffect | null {
  if (contents.length < 2) return null;

  const hasWater = contents.some((c) => c.id === "water");
  const hasSodium = contents.some((c) => c.id === "sodium");
  const hasAcid = contents.some((c) => c.pH < 4);
  const hasBase = contents.some((c) => c.pH > 10);
  const hasVinegar = contents.some((c) => c.id === "vinegar");
  const hasBakingSoda = contents.some((c) => c.id === "baking_soda");
  const hasPhenolphthalein = contents.some((c) => c.id === "phenolphthalein");
  const hasSilverNitrate = contents.some((c) => c.id === "silver_nitrate");
  const hasPotassiumIodide = contents.some((c) => c.id === "potassium_iodide");
  const hasCopperSulfate = contents.some((c) => c.id === "copper_sulfate");
  const hasIronNail = contents.some((c) => c.id === "iron_nail");
  const hasZincMetal = contents.some((c) => c.id === "zinc_metal");
  const hasMagnesium = contents.some((c) => c.id === "magnesium_ribbon");
  const hasHydrogenPeroxide = contents.some((c) => c.id === "hydrogen_peroxide");
  const hasPotassiumPermanganate = contents.some((c) => c.id === "potassium_permanganate");
  const hasHCl = contents.some((c) => c.id === "hcl");

  if (hasSodium && hasWater) {
    return {
      type: "explosion",
      intensity: 1,
      message: "💥 VIOLENT EXPLOSION! 2Na + 2H₂O → 2NaOH + H₂↑",
    };
  }

  if (hasCopperSulfate && hasIronNail) {
    return {
      type: "precipitate",
      intensity: 0.9,
      resultColor: "#b87333",
      message: "🔄 DISPLACEMENT! CuSO₄ + Fe → FeSO₄ + Cu↓",
    };
  }

  if (hasZincMetal && hasHCl) {
    return {
      type: "bubbles",
      intensity: 0.9,
      resultColor: "#c0c0c0",
      message: "🫧 GAS EVOLUTION! Zn + 2HCl → ZnCl₂ + H₂↑",
    };
  }

  if (hasMagnesium && hasHCl) {
    return {
      type: "bubbles",
      intensity: 1,
      resultColor: "#ffffff",
      message: "🫧 VIGOROUS REACTION! Mg + 2HCl → MgCl₂ + H₂↑",
    };
  }

  if (hasMagnesium && hasWater) {
    return {
      type: "bubbles",
      intensity: 0.3,
      message: "🫧 Slow reaction: Mg + 2H₂O → Mg(OH)₂ + H₂↑",
    };
  }

  if (hasHydrogenPeroxide && hasPotassiumPermanganate) {
    return {
      type: "bubbles",
      intensity: 1,
      resultColor: "#8b4513",
      message: "🧪 OXIDATION! Oxygen gas and brown manganese dioxide appear.",
    };
  }

  if (hasAcid && hasBase) {
    return {
      type: "heat",
      intensity: 0.8,
      resultColor: "#87ceeb",
      message: "🔥 Exothermic neutralization! H⁺ + OH⁻ → H₂O + heat",
    };
  }

  if (hasVinegar && hasBakingSoda) {
    return {
      type: "bubbles",
      intensity: 1,
      message: "🫧 Vigorous bubbling! NaHCO₃ + CH₃COOH → CO₂↑ + H₂O + CH₃COONa",
    };
  }

  if (hasPhenolphthalein && hasBase) {
    return {
      type: "colorChange",
      intensity: 0.8,
      resultColor: "#ff69b4",
      message: "🩷 Indicator colour change! Phenolphthalein turns pink in basic solution.",
    };
  }

  if (hasSilverNitrate && hasPotassiumIodide) {
    return {
      type: "precipitate",
      intensity: 0.9,
      resultColor: "#ffd700",
      message: "⬇️ Yellow precipitate! AgNO₃ + KI → AgI↓ + KNO₃",
    };
  }

  return null;
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
  const draggingContainerIdRef = useRef<string | null>(null);
  const didDragMoveRef = useRef(false);
  const suppressNextSelectRef = useRef(false);

  const beginDragContainer = useCallback(
    (containerId: string, e: ThreeEvent<PointerEvent>) => {
      // Shift + drag to move equipment on the bench
      if (!e.shiftKey) return;

      const container = containers.find((item) => item.id === containerId);
      if (!container) return;

      draggingContainerIdRef.current = containerId;
      didDragMoveRef.current = false;

      // Plane at the same Y height as the container
      dragPlaneRef.current.set(new THREE.Vector3(0, 1, 0), -container.position[1]);

      const intersection = dragIntersectionRef.current;
      if (e.ray.intersectPlane(dragPlaneRef.current, intersection)) {
        dragOffsetRef.current.copy(intersection).sub(
          new THREE.Vector3(container.position[0], container.position[1], container.position[2]),
        );
      } else {
        dragOffsetRef.current.set(0, 0, 0);
      }

      (e.target as unknown as HTMLElement)?.setPointerCapture?.(e.pointerId);
      document.body.style.cursor = "grabbing";
    },
    [containers],
  );

  const updateDragContainer = useCallback((e: ThreeEvent<PointerEvent>) => {
    const containerId = draggingContainerIdRef.current;
    if (!containerId) return;

    const intersection = dragIntersectionRef.current;
    if (!e.ray.intersectPlane(dragPlaneRef.current, intersection)) return;

    const next = intersection.clone().sub(dragOffsetRef.current);
    didDragMoveRef.current = true;

    // Clamp movement to the bench footprint
    const clampedX = THREE.MathUtils.clamp(next.x, -2.6, 2.6);
    const clampedZ = THREE.MathUtils.clamp(next.z, -1.35, 1.35);

    setContainers((current) =>
      current.map((container) =>
        container.id === containerId
          ? { ...container, position: [clampedX, container.position[1], clampedZ] }
          : container,
      ),
    );
  }, []);

  const endDragContainer = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!draggingContainerIdRef.current) return;

    (e.target as unknown as HTMLElement)?.releasePointerCapture?.(e.pointerId);
    document.body.style.cursor = "auto";

    if (didDragMoveRef.current) {
      // Prevent click-to-select from firing after a drag movement.
      suppressNextSelectRef.current = true;
    }

    draggingContainerIdRef.current = null;
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
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#020617_100%)]">
      <div className="border-b border-slate-800 bg-slate-950/70 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-2 shadow-lg shadow-cyan-500/30">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-50">Chemistry Virtual Laboratory</h1>
                <Badge variant="outline" className="border-cyan-400/40 text-cyan-200">
                  Flagship demo
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Realistic bench work, guided missions, molecular reasoning, and AI-powered science support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotebook((value) => !value)}
              className={showNotebook ? "text-amber-300" : "text-slate-400"}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Notebook
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled((value) => !value)}
              className="text-slate-400 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[340px] space-y-4 overflow-y-auto border-r border-slate-800 bg-slate-950/60 p-4">
          <Card className="border-cyan-500/20 bg-slate-900/70">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-cyan-100">
                <Target className="h-4 w-4 text-cyan-300" />
                Mission briefing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
                <p className="text-sm font-semibold text-cyan-100">{activeDemoPreset.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {activeDemoPreset.description}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Mission progress</span>
                  <span>{missionProgress}%</span>
                </div>
                <Progress value={missionProgress} className="h-2 bg-slate-800" />
              </div>

              <div className="space-y-2">
                {missionChecklist.map((step) => (
                  <div
                    key={step.label}
                    className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950/60 p-2"
                  >
                    {step.complete ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                    ) : (
                      <ChevronRight className="mt-0.5 h-4 w-4 text-slate-500" />
                    )}
                    <span className="text-xs text-slate-300">{step.label}</span>
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
                        ? "border-cyan-400 bg-cyan-500/15 text-cyan-100"
                        : "border-slate-800 bg-slate-900/70 text-slate-300 hover:border-cyan-500/40"
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
                    className="border-cyan-500/40 text-cyan-100 hover:bg-cyan-500/10"
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
                    className="border-violet-500/40 text-violet-100 hover:bg-violet-500/10"
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

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">What students should notice</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  {activeDemoPreset.expected}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-100">
                <Droplets className="h-4 w-4 text-cyan-300" />
                Reagent control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                {selectedChemical ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-full border border-white/20"
                        style={{ backgroundColor: selectedChemical.color }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{selectedChemical.name}</p>
                        <p className="text-xs text-slate-400">
                          {selectedChemicalMeta?.formula ?? "Reagent"} · pH {selectedChemical.pH}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-slate-700 text-slate-300">
                      {selectedChemicalMeta?.hazardLevel ?? "safe"} handling
                    </Badge>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Select a bottle from the shelf to inspect its pH, formula, and hazard level.
                  </p>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
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
                <label className="text-xs text-slate-400">Target vessel</label>
                <Select value={selectedContainerId} onValueChange={setSelectedContainerId}>
                  <SelectTrigger className="border-slate-700 bg-slate-950 text-slate-100">
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
                  className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add reagent to vessel
                </Button>

                {selectedContainer && (
                  <>
                    <Button
                      onClick={() => toggleHeating(selectedContainer.id)}
                      variant={selectedContainer.isHeating ? "destructive" : "outline"}
                      className="border-slate-700"
                    >
                      <Flame className="mr-2 h-4 w-4" />
                      {selectedContainer.isHeating ? "Stop heating" : "Start heating"}
                    </Button>
                    <Button
                      onClick={() => clearContainer(selectedContainer.id)}
                      variant="outline"
                      className="border-slate-700 text-slate-300"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Empty vessel
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-100">
                <ArrowRightLeft className="h-4 w-4 text-emerald-300" />
                Natural liquid transfer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Source vessel</label>
                <Select value={transferSourceId} onValueChange={setTransferSourceId}>
                  <SelectTrigger className="border-slate-700 bg-slate-950 text-slate-100">
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
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
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
                className="w-full border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10"
              >
                <Move3D className="mr-2 h-4 w-4" />
                Transfer into selected vessel
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-100">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Learning objective
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p>{activeDemoPreset.objective}</p>
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Materials</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeDemoPreset.materials.map((item) => (
                    <Badge key={item} variant="outline" className="border-slate-700 text-slate-300">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Scientific explanation</p>
                <p className="mt-1 text-slate-300">{activeDemoPreset.explanation}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative flex-1">
          <Canvas
            camera={{ position: [0, 2.8, 6.5], fov: 46 }}
            shadows
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          >
            <color attach="background" args={["#020617"]} />
            <Environment preset="warehouse" />
            <ambientLight intensity={0.45} />
            <directionalLight
              position={[6, 9, 4]}
              intensity={1.65}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
            <pointLight position={[-5, 2.6, 3]} intensity={0.8} color="#38bdf8" />
            <pointLight position={[4, 2.5, -3]} intensity={0.6} color="#a855f7" />

            <group position={[0, 0.2, -3.2]}>
              <mesh position={[0, 1.6, 0]}>
                <boxGeometry args={[11, 3.8, 0.25]} />
                <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.85} />
              </mesh>
              <mesh position={[-2.6, 1.8, 0.13]}>
                <boxGeometry args={[2.4, 1.5, 0.04]} />
                <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.15} />
              </mesh>
              <mesh position={[2.6, 1.8, 0.13]}>
                <boxGeometry args={[2.4, 1.5, 0.04]} />
                <meshStandardMaterial color="#1e3a8a" emissive="#22d3ee" emissiveIntensity={0.12} />
              </mesh>
            </group>

            <group position={[-5.4, 0.5, 0]}>
              <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[6.4, 3.2, 0.2]} />
                <meshStandardMaterial color="#111827" roughness={0.9} />
              </mesh>
            </group>

            <group position={[5.4, 0.5, 0]}>
              <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[6.4, 3.2, 0.2]} />
                <meshStandardMaterial color="#111827" roughness={0.9} />
              </mesh>
            </group>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#0b1120" roughness={0.95} />
            </mesh>

            <group position={[0, 2.8, 0]}>
              {[-2.5, 0, 2.5].map((x) => (
                <mesh key={x} position={[x, 0, 0]}>
                  <boxGeometry args={[1.4, 0.08, 0.8]} />
                  <meshStandardMaterial color="#e2e8f0" emissive="#38bdf8" emissiveIntensity={0.12} />
                </mesh>
              ))}
            </group>

            <group position={[0, -0.72, 0]}>
              <mesh receiveShadow castShadow>
                <boxGeometry args={[6.2, 0.16, 3.7]} />
                <meshStandardMaterial color="#5b412d" roughness={0.82} />
              </mesh>
              {[
                [-2.85, -0.52, 1.55],
                [2.85, -0.52, 1.55],
                [-2.85, -0.52, -1.55],
                [2.85, -0.52, -1.55],
              ].map((position, index) => (
                <mesh key={index} position={position as [number, number, number]} castShadow>
                  <boxGeometry args={[0.15, 1.04, 0.15]} />
                  <meshStandardMaterial color="#3f2b1e" />
                </mesh>
              ))}
            </group>

            <group position={[3.45, -0.4, -0.95]}>
              <mesh>
                <boxGeometry args={[1.1, 1.6, 1]} />
                <meshStandardMaterial color="#1f2937" metalness={0.4} roughness={0.45} />
              </mesh>
              <mesh position={[0, 0.05, 0.44]}>
                <boxGeometry args={[0.95, 1.45, 0.03]} />
                <meshPhysicalMaterial color="#dbeafe" transparent opacity={0.12} transmission={0.95} />
              </mesh>
            </group>

            <group position={[-4.05, -0.2, -0.8]}>
              <mesh position={[0, 0.8, 0]}>
                <boxGeometry args={[0.9, 1.8, 0.9]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <mesh position={[0.2, 1.45, 0.45]}>
                <cylinderGeometry args={[0.08, 0.08, 0.45, 20]} />
                <meshStandardMaterial color="#38bdf8" metalness={0.7} roughness={0.3} />
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
                    container.id === "flask-1" ? -1.45 : 0,
                    -0.65,
                    container.id === "flask-1" ? 0.45 : 0,
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

          <div className="pointer-events-none absolute left-4 top-4 max-w-xs rounded-2xl border border-cyan-500/20 bg-slate-950/75 p-4 backdrop-blur">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <p className="text-sm font-semibold text-slate-50">Immersive bench mode</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Rotate around the room, inspect the shelves, select glassware, and move reactants into the vessel of your choice.
            </p>
          </div>

          <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2 backdrop-blur">
            <p className="text-xs text-slate-400">
              Click a bottle to inspect it. Click any vessel to make it active. Drag the scene to move around the laboratory.
            </p>
          </div>
        </div>

        <div className="w-[300px] space-y-4 overflow-y-auto border-l border-slate-800 bg-slate-950/60 p-4">
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-100">
                <Gauge className="h-4 w-4 text-cyan-300" />
                Active vessel analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedContainer ? (
                <>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-sm font-semibold text-slate-100">{selectedContainer.label}</p>
                    <p className="text-xs text-slate-400">{selectedContainer.type} workstation</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Droplets className="h-3.5 w-3.5" />
                        Volume
                      </div>
                      <p className="mt-1 font-semibold text-slate-100">
                        {getContainerVolume(selectedContainer).toFixed(0)}mL
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Thermometer className="h-3.5 w-3.5" />
                        Temperature
                      </div>
                      <p className="mt-1 font-semibold text-slate-100">
                        {selectedContainer.temperature}°C
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Beaker className="h-3.5 w-3.5" />
                        Estimated pH
                      </div>
                      <p className="mt-1 font-semibold text-slate-100">
                        {averagePH ?? "N/A"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Hazard
                      </div>
                      <p className="mt-1 font-semibold text-slate-100">
                        {getHazardLabel(selectedContainer)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
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
                              <span className="text-slate-300">{item.name}</span>
                            </div>
                            <span className="text-slate-500">{item.amount.toFixed(0)}mL</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">No chemicals in this vessel yet.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-100">
                <AlertTriangle className="h-4 w-4 text-yellow-300" />
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
                              : "border-slate-800 bg-slate-950/70 text-slate-300"
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
                className="w-full border-slate-700 text-slate-300"
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                Clear observations
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-100">
                <Sparkles className="h-4 w-4 text-violet-300" />
                Fast reaction ideas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              {QUICK_REACTIONS.map((reaction) => (
                <div key={reaction} className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2">
                  {reaction}
                </div>
              ))}
            </CardContent>
          </Card>

          <Button
            onClick={() => resetLab()}
            variant="outline"
            className="w-full border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/10"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset whole laboratory
          </Button>
        </div>

        {showNotebook && (
          <div className="w-[320px] overflow-y-auto border-l border-slate-800 bg-slate-950/70 p-4">
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
