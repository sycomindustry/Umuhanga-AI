import { useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Atom,
  Beaker,
  Bot,
  Languages,
  MapPin,
  Move3D,
  Sparkles,
  Table2,
  Wand2,
  X,
} from "lucide-react";
import { InteractiveChemistryLab, type ChemistryLabSnapshot } from "./InteractiveChemistryLab";
import { PeriodicTableLab } from "./PeriodicTableLab";
import { MoleculeViewer3D } from "./MoleculeViewer3D";
import { AIScientistAssistant } from "./AIScientistAssistant";

type StationId = "bench" | "periodic" | "molecules" | "assistant";
type NavigationMode = "guided" | "free";

interface StationConfig {
  id: StationId;
  label: string;
  subtitle: string;
  color: string;
  accent: string;
  position: [number, number, number];
  cameraPosition: [number, number, number];
  lookAt: [number, number, number];
  icon: typeof Beaker;
}

const STATIONS: StationConfig[] = [
  {
    id: "bench",
    label: "Experiment Bench",
    subtitle: "Run the chemistry mission",
    color: "#22d3ee",
    accent: "from-cyan-500 to-blue-600",
    position: [0, -0.95, 0.2],
    cameraPosition: [0, 1.85, 5.6],
    lookAt: [0, 1.15, 0],
    icon: Beaker,
  },
  {
    id: "periodic",
    label: "Periodic Wall",
    subtitle: "Explore elements and properties",
    color: "#a78bfa",
    accent: "from-violet-500 to-fuchsia-600",
    position: [5.2, -0.95, -1.8],
    cameraPosition: [4.7, 1.7, 2.4],
    lookAt: [5.2, 1.6, -1.8],
    icon: Table2,
  },
  {
    id: "molecules",
    label: "Molecule Dome",
    subtitle: "Visualize structures in 3D",
    color: "#34d399",
    accent: "from-emerald-500 to-teal-600",
    position: [-5.2, -0.95, -1.8],
    cameraPosition: [-4.7, 1.7, 2.4],
    lookAt: [-5.2, 1.5, -1.8],
    icon: Atom,
  },
  {
    id: "assistant",
    label: "AI Scientist",
    subtitle: "Ask questions in three languages",
    color: "#f59e0b",
    accent: "from-amber-500 to-orange-600",
    position: [0, -0.95, -4.8],
    cameraPosition: [0, 1.65, -0.8],
    lookAt: [0, 1.4, -4.8],
    icon: Bot,
  },
];

function buildChemistryContext(snapshot: ChemistryLabSnapshot | null) {
  if (!snapshot) {
    return "Umuhanga AI immersive chemistry laboratory. The student is inside a realistic chemistry room and can navigate to the experiment bench, periodic wall, molecule viewer, and AI scientist station.";
  }

  const selectedVessel = snapshot.selectedContainerLabel ?? "no vessel selected";
  const selectedChemical = snapshot.selectedChemicalName ?? "no reagent selected";
  const activeContainers = snapshot.containers
    .filter((container) => container.volume > 0 || container.isHeating)
    .map((container) => {
      const contents =
        container.contents.length > 0
          ? container.contents.map((item) => `${item.name} ${item.amount.toFixed(0)}mL`).join(", ")
          : "empty";
      return `${container.label}: ${contents}; temp ${container.temperature}°C; hazard ${container.hazard}`;
    })
    .join(" | ");

  return [
    "Umuhanga AI immersive chemistry laboratory.",
    `Active mission: ${snapshot.missionTitle}.`,
    `Mission progress: ${snapshot.missionProgress}%.`,
    `Selected vessel: ${selectedVessel}.`,
    `Selected reagent: ${selectedChemical}.`,
    `Estimated pH of selected vessel: ${snapshot.averagePH ?? "N/A"}.`,
    `Active bench state: ${activeContainers || "No active containers yet."}`,
    `Latest observations: ${snapshot.observations.slice(0, 4).join(" | ") || "No observations yet."}`,
  ].join(" ");
}

function RoomShell() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#09111f" roughness={0.96} metalness={0.05} />
      </mesh>

      <mesh position={[0, 2.3, -8]} receiveShadow>
        <boxGeometry args={[16, 7, 0.3]} />
        <meshStandardMaterial color="#0f172a" roughness={0.88} />
      </mesh>
      <mesh position={[0, 2.3, 8]} receiveShadow>
        <boxGeometry args={[16, 7, 0.3]} />
        <meshStandardMaterial color="#0f172a" roughness={0.88} />
      </mesh>
      <mesh position={[-8, 2.3, 0]} receiveShadow>
        <boxGeometry args={[0.3, 7, 16]} />
        <meshStandardMaterial color="#101826" roughness={0.88} />
      </mesh>
      <mesh position={[8, 2.3, 0]} receiveShadow>
        <boxGeometry args={[0.3, 7, 16]} />
        <meshStandardMaterial color="#101826" roughness={0.88} />
      </mesh>
      <mesh position={[0, 5.8, 0]} receiveShadow>
        <boxGeometry args={[16, 0.25, 16]} />
        <meshStandardMaterial color="#0b1120" roughness={0.8} />
      </mesh>

      <group position={[0, -0.55, 0.1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6.5, 0.16, 2.8]} />
          <meshStandardMaterial color="#5d412d" roughness={0.86} />
        </mesh>
        {[
          [-3.05, -0.55, 1.2],
          [3.05, -0.55, 1.2],
          [-3.05, -0.55, -1.2],
          [3.05, -0.55, -1.2],
        ].map((position, index) => (
          <mesh key={index} position={position as [number, number, number]} castShadow>
            <boxGeometry args={[0.18, 1.1, 0.18]} />
            <meshStandardMaterial color="#3f2b1e" />
          </mesh>
        ))}
      </group>

      <group position={[0, 1.8, -7.8]}>
        <mesh>
          <boxGeometry args={[5.1, 2.2, 0.05]} />
          <meshStandardMaterial color="#1e3a8a" emissive="#22d3ee" emissiveIntensity={0.2} />
        </mesh>
      </group>

      <group position={[5.6, 1.7, -3]}>
        <mesh>
          <boxGeometry args={[2.2, 1.3, 0.12]} />
          <meshStandardMaterial color="#1f2937" metalness={0.35} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0, 0.07]}>
          <boxGeometry args={[1.9, 1.05, 0.02]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.18} />
        </mesh>
      </group>

      <group position={[-5.6, 1.7, -3]}>
        <mesh>
          <sphereGeometry args={[1.1, 32, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.35} roughness={0.25} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.25, 14, 14]} />
          <meshBasicMaterial color="#34d399" wireframe transparent opacity={0.55} />
        </mesh>
      </group>

      <group position={[0, 1.55, -5.6]}>
        <mesh>
          <boxGeometry args={[2.4, 2.1, 0.16]} />
          <meshStandardMaterial color="#111827" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[1.9, 1.6, 0.02]} />
          <meshStandardMaterial color="#fb923c" emissive="#f59e0b" emissiveIntensity={0.22} />
        </mesh>
      </group>

      {[-4.5, 0, 4.5].map((x) => (
        <group key={x} position={[x, 5.35, 0]}>
          <mesh>
            <boxGeometry args={[1.5, 0.12, 0.8]} />
            <meshStandardMaterial color="#e2e8f0" emissive="#22d3ee" emissiveIntensity={0.1} />
          </mesh>
          <pointLight position={[0, -0.8, 0]} intensity={0.7} distance={7} color="#dbeafe" />
        </group>
      ))}
    </>
  );
}

function StationHotspot({
  station,
  onOpen,
}: {
  station: StationConfig;
  onOpen: (stationId: StationId) => void;
}) {
  const Icon = station.icon;

  return (
    <group position={station.position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={() => onOpen(station.id)}>
        <ringGeometry args={[0.42, 0.62, 36]} />
        <meshBasicMaterial color={station.color} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={() => onOpen(station.id)}>
        <circleGeometry args={[0.3, 24]} />
        <meshBasicMaterial color={station.color} transparent opacity={0.18} />
      </mesh>
      <Html position={[0, 0.22, 0]} center>
        <button
          onClick={() => onOpen(station.id)}
          className="rounded-xl border border-white/10 bg-slate-950/90 px-3 py-2 text-left shadow-xl backdrop-blur"
        >
          <div className="flex items-center gap-2 text-white">
            <Icon className="h-4 w-4" />
            <span className="text-sm font-semibold">{station.label}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{station.subtitle}</p>
        </button>
      </Html>
    </group>
  );
}

function ExplorerRig({
  mode,
  activeStation,
  guidedStation,
}: {
  mode: NavigationMode;
  activeStation: StationId | null;
  guidedStation: StationConfig;
}) {
  const { camera } = useThree();
  const [keys, setKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeys((current) => ({ ...current, [event.code]: true }));
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      setKeys((current) => ({ ...current, [event.code]: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (mode === "guided" || activeStation) {
      const targetPosition = new THREE.Vector3(...guidedStation.cameraPosition);
      const targetLookAt = new THREE.Vector3(...guidedStation.lookAt);
      camera.position.lerp(targetPosition, 1 - Math.pow(0.001, delta));
      const look = new THREE.Vector3();
      camera.getWorldDirection(look);
      look.lerp(targetLookAt.clone().sub(camera.position).normalize(), 1 - Math.pow(0.0015, delta));
      camera.lookAt(camera.position.clone().add(look));
      return;
    }

    const speed = 3.6;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const direction = new THREE.Vector3();

    if (keys.KeyW) direction.add(forward);
    if (keys.KeyS) direction.sub(forward);
    if (keys.KeyA) direction.add(right);
    if (keys.KeyD) direction.sub(right);

    if (direction.lengthSq() > 0) {
      direction.normalize().multiplyScalar(speed * delta);
      camera.position.add(direction);
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -6.8, 6.8);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -6.6, 6.4);
      camera.position.y = 1.7;
    }
  });

  return mode === "free" ? <PointerLockControls /> : null;
}

interface ImmersiveChemistryExperienceProps {
  onContextChange?: (context: string) => void;
  onAskAI?: (question: string) => void;
}

export function ImmersiveChemistryExperience({
  onContextChange,
  onAskAI,
}: ImmersiveChemistryExperienceProps) {
  const [activeStation, setActiveStation] = useState<StationId | null>(null);
  const [navigationMode, setNavigationMode] = useState<NavigationMode>("guided");
  const [touchDevice, setTouchDevice] = useState(false);
  const [activeSnapshot, setActiveSnapshot] = useState<ChemistryLabSnapshot | null>(null);
  const [labContext, setLabContext] = useState(buildChemistryContext(null));
  const [assistantSeed, setAssistantSeed] = useState<string | null>(null);
  const [guidedStationId, setGuidedStationId] = useState<StationId>("bench");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTouchDevice(window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window);
  }, []);

  const guidedStation = useMemo(
    () => STATIONS.find((station) => station.id === guidedStationId) ?? STATIONS[0],
    [guidedStationId],
  );

  useEffect(() => {
    const context = buildChemistryContext(activeSnapshot);
    setLabContext(context);
    onContextChange?.(context);
  }, [activeSnapshot, onContextChange]);

  useEffect(() => {
    if (touchDevice && navigationMode === "free") {
      setNavigationMode("guided");
    }
  }, [navigationMode, touchDevice]);

  const openStation = (stationId: StationId) => {
    setGuidedStationId(stationId);
    setActiveStation(stationId);
  };

  const handleAskAI = (question: string) => {
    setAssistantSeed(question);
    setGuidedStationId("assistant");
    setActiveStation("assistant");
    onAskAI?.(question);
  };

  return (
    <div className="relative h-[860px] overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-950">
      <Canvas
        camera={{ position: [0, 1.85, 5.6], fov: 58 }}
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={["#020617"]} />
        <Environment preset="city" />
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[5, 8, 3]}
          intensity={1.45}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[0, 3.8, -3]} intensity={1.1} color="#38bdf8" />
        <pointLight position={[0, 2.8, 4]} intensity={0.5} color="#f8fafc" />

        <RoomShell />

        {STATIONS.map((station) => (
          <StationHotspot key={station.id} station={station} onOpen={openStation} />
        ))}

        <ExplorerRig
          mode={navigationMode}
          activeStation={activeStation}
          guidedStation={guidedStation}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center p-4">
        <div className="pointer-events-auto w-full max-w-6xl rounded-2xl border border-cyan-500/20 bg-slate-950/80 p-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-2 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-50">Immersive Chemistry Room</h2>
              <p className="text-xs text-slate-400">
                Enter the room, move between stations, run the flagship experiment, and ask the AI scientist what is happening.
              </p>
            </div>
            <Badge variant="outline" className="border-cyan-400/40 text-cyan-200">
              Chemistry first
            </Badge>
            <Badge variant="outline" className="border-slate-700 text-slate-300">
              <Languages className="mr-1 h-3 w-3" />
              EN / RW / FR
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={navigationMode === "guided" ? "default" : "outline"}
                className={navigationMode === "guided" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "border-slate-700 text-slate-200"}
                onClick={() => setNavigationMode("guided")}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Guided teleport
              </Button>
              <Button
                variant={navigationMode === "free" ? "default" : "outline"}
                className={navigationMode === "free" ? "bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white" : "border-slate-700 text-slate-200"}
                onClick={() => setNavigationMode("free")}
                disabled={touchDevice}
              >
                <Move3D className="mr-2 h-4 w-4" />
                Free walk
              </Button>
              {STATIONS.map((station) => {
                const Icon = station.icon;
                return (
                  <Button
                    key={station.id}
                    variant="outline"
                    className="border-slate-700 text-slate-200"
                    onClick={() => {
                      setGuidedStationId(station.id);
                      setActiveStation(null);
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {station.label}
                  </Button>
                );
              })}
            </div>

            <Card className="border-slate-800 bg-slate-900/75">
              <CardContent className="flex h-full items-center justify-between gap-4 p-4 text-sm text-slate-300">
                <div>
                  <p className="font-semibold text-slate-50">
                    {touchDevice ? "Touch-friendly guided mode enabled" : "Desktop free-walk ready"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {touchDevice
                      ? "Use station buttons and glowing hotspots to navigate on mobile or touch devices."
                      : navigationMode === "free"
                        ? "Click inside the room, then use `W A S D` and the mouse to move like you are inside the lab."
                        : "Switch to free walk for first-person exploration, or stay in guided mode for quick movement between stations."}
                  </p>
                </div>
                <Wand2 className="h-6 w-6 text-cyan-300" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 max-w-sm">
        <div className="pointer-events-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-4 backdrop-blur">
          <p className="text-sm font-semibold text-slate-50">Current bench intelligence</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            {activeSnapshot
              ? `Mission ${activeSnapshot.missionTitle} is ${activeSnapshot.missionProgress}% complete. ${activeSnapshot.selectedContainerLabel ?? "No vessel"} is active, and ${activeSnapshot.selectedChemicalName ?? "no reagent"} is selected.`
              : "Open the experiment bench to generate live chemistry state for the AI scientist."}
          </p>
        </div>
      </div>

      {activeStation && (
        <div className="absolute inset-0 bg-slate-950/72 backdrop-blur-sm">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-50">
                  {STATIONS.find((station) => station.id === activeStation)?.label}
                </p>
                <p className="text-xs text-slate-400">
                  {STATIONS.find((station) => station.id === activeStation)?.subtitle}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300"
                onClick={() => setActiveStation(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-hidden">
              {activeStation === "bench" && (
                <InteractiveChemistryLab
                  onStateChange={setActiveSnapshot}
                  onAskAI={handleAskAI}
                />
              )}

              {activeStation === "periodic" && (
                <div className="h-full overflow-auto bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)] p-4">
                  <PeriodicTableLab
                    onAskAI={(question) =>
                      handleAskAI(`${question} Use the chemistry room context and connect your answer to current lab learning.`)
                    }
                  />
                </div>
              )}

              {activeStation === "molecules" && (
                <div className="h-full overflow-auto bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)] p-4">
                  <MoleculeViewer3D />
                </div>
              )}

              {activeStation === "assistant" && (
                <div className="grid h-full gap-4 bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)] p-4 lg:grid-cols-[340px_1fr]">
                  <Card className="border-amber-500/20 bg-slate-900/75">
                    <CardContent className="space-y-4 p-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-50">AI Scientist context</p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-400">
                          The assistant is now grounded in the live chemistry bench state, current mission, current vessel, and recent observations.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">Current context</p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-300">{labContext}</p>
                      </div>
                      <div className="grid gap-2">
                        <Button
                          variant="outline"
                          className="border-slate-700 text-slate-200"
                          onClick={() =>
                            handleAskAI("Give me a short scientist-style briefing on the current experiment and the next safest action.")
                          }
                        >
                          Scientist briefing
                        </Button>
                        <Button
                          variant="outline"
                          className="border-slate-700 text-slate-200"
                          onClick={() =>
                            handleAskAI("Explain the current reaction at molecular level using simple language for a student.")
                          }
                        >
                          Molecular explanation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="min-h-0 overflow-hidden rounded-2xl border border-slate-800">
                    <AIScientistAssistant
                      experimentContext={labContext}
                      seedQuestion={assistantSeed}
                      onSeedConsumed={() => setAssistantSeed(null)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImmersiveChemistryExperience;
