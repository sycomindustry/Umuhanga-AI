import { useMemo, useRef, useState, type ReactNode } from "react";
import { Html } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { ChemicalShelf3D } from "./ChemicalShelf3D";
import type { ChemicalContent } from "./InteractiveContainer3D";
import { SHOW_3D_TEXT } from "./show3dText";

type GlasswareKind = "beaker" | "flask" | "testTube" | "cylinder";
type BenchToolKind = "washBottle" | "retortStand" | "balance" | "tubeRack" | "phMeter" | "thermometer";

interface LabStorageCabinets3DProps {
  position: [number, number, number];
  selectedChemicalId?: string;
  draggingChemicalId?: string;
  onSelectChemical: (chemical: ChemicalContent) => void;
  onDragStart: (chemical: ChemicalContent) => void;
  onDragEnd: () => void;
  onPickGlassware: (kind: GlasswareKind) => void;
  onPickBenchTool?: (kind: BenchToolKind) => void;
}

function CabinetUnit3D({
  position,
  title,
  width = 2.0,
  height = 2.25,
  depth = 0.6,
  children,
}: {
  position: [number, number, number];
  title: string;
  width?: number;
  height?: number;
  depth?: number;
  children: ReactNode;
}) {
  // Real-life behaviour:
  // - cupboards open on click (not hover)
  // - doors swing smoothly on hinges (not instant snap)
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);

  const OPEN_ANGLE = Math.PI / 2.25; // ~80 degrees, feels natural and not "fully flat"
  const DAMPING = 10; // higher = snappier, lower = heavier door
  const WALL_THICKNESS = 0.04;
  const yBottom = -0.18;
  const yCenter = height / 2 + yBottom;

  useFrame((_, delta) => {
    const target = isOpen ? OPEN_ANGLE : 0;

    if (leftDoorRef.current) {
      leftDoorRef.current.rotation.y = THREE.MathUtils.damp(
        leftDoorRef.current.rotation.y,
        -target,
        DAMPING,
        delta,
      );
    }

    if (rightDoorRef.current) {
      rightDoorRef.current.rotation.y = THREE.MathUtils.damp(
        rightDoorRef.current.rotation.y,
        target,
        DAMPING,
        delta,
      );
    }
  });

  return (
    <group
      position={position}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setIsHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Small interior light so contents don't look "empty" */}
      <pointLight
        position={[0, height * 0.72 - 0.18, -0.18]}
        intensity={0.65}
        distance={2.2}
        color="#fff7ed"
      />
      <ambientLight intensity={0.15} />

      {/* Cabinet frame (IMPORTANT: keep the front open so the inside is visible) */}
      {/* Back outer panel */}
      <mesh position={[0, yCenter, -0.22 - depth / 2 + WALL_THICKNESS / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, WALL_THICKNESS]} />
        <meshStandardMaterial color="#5b463c" roughness={0.9} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-width / 2 + WALL_THICKNESS / 2, yCenter, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, height, depth]} />
        <meshStandardMaterial color="#5b463c" roughness={0.9} />
      </mesh>
      {/* Right wall */}
      <mesh position={[width / 2 - WALL_THICKNESS / 2, yCenter, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, height, depth]} />
        <meshStandardMaterial color="#5b463c" roughness={0.9} />
      </mesh>
      {/* Top panel */}
      <mesh position={[0, yBottom + height - WALL_THICKNESS / 2, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[width, WALL_THICKNESS, depth]} />
        <meshStandardMaterial color="#5b463c" roughness={0.9} />
      </mesh>
      {/* Bottom panel */}
      <mesh position={[0, yBottom + WALL_THICKNESS / 2, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[width, WALL_THICKNESS, depth]} />
        <meshStandardMaterial color="#5b463c" roughness={0.9} />
      </mesh>

      {/* Inner back */}
      <mesh position={[0, height / 2 - 0.18, -0.49]} receiveShadow>
        <boxGeometry args={[width * 0.94, height * 0.92, 0.02]} />
        <meshStandardMaterial color="#3b2a23" roughness={0.95} />
      </mesh>

      {/* Shelves */}
      {[0.25, 0.95, 1.65].map((y) => (
        <mesh key={y} position={[0, y - 0.18, -0.25]} castShadow receiveShadow>
          <boxGeometry args={[width * 0.95, 0.06, 0.5]} />
          <meshStandardMaterial color="#6a554a" roughness={0.85} />
        </mesh>
      ))}

      {/* Door click target (only when closed so it doesn't block picking items inside) */}
      {!isOpen && (
        <mesh
          position={[0, height / 2 - 0.18, 0.06]}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "auto";
          }}
        >
          <boxGeometry args={[width, height * 0.92, 0.12]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {/* Close target (when open): small strip at the top-front frame.
          This lets users close cupboards easily without the door blocking item clicks. */}
      {isOpen && (
        <mesh
          position={[0, height - 0.52, 0.06]}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "auto";
          }}
        >
          <boxGeometry args={[width * 0.92, 0.28, 0.12]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {/* Secondary close target (when open): a slim right-edge strip, easy to click, doesn't cover shelf items */}
      {isOpen && (
        <mesh
          position={[width * 0.46, height / 2 - 0.18, 0.06]}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "auto";
          }}
        >
          <boxGeometry args={[width * 0.12, height * 0.82, 0.12]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {/* Cabinet doors */}
      <group
        position={[-width * 0.49, height / 2 - 0.18, 0.05]}
        rotation={[0, 0, 0]}
      >
        <group ref={leftDoorRef}>
          {/* Door glass panel: do NOT raycast, so it won't block movement/clicks when open */}
          <mesh position={[width * 0.24, 0, 0]} raycast={() => null}>
            <boxGeometry args={[width * 0.48, height * 0.92, 0.02]} />
            <meshPhysicalMaterial
              color="#dbeafe"
              transparent
              opacity={0.16}
              transmission={0.92}
              roughness={0.08}
            />
          </mesh>
          <mesh
            position={[width * 0.45, 0, 0.012]}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((v) => !v);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "auto";
            }}
          >
            <cylinderGeometry args={[0.018, 0.018, 0.14, 14]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.65} roughness={0.25} />
          </mesh>
        </group>
      </group>
      <group position={[width * 0.49, height / 2 - 0.18, 0.05]}>
        <group ref={rightDoorRef}>
          {/* Door glass panel: do NOT raycast, so it won't block movement/clicks when open */}
          <mesh position={[-width * 0.24, 0, 0]} raycast={() => null}>
            <boxGeometry args={[width * 0.48, height * 0.92, 0.02]} />
            <meshPhysicalMaterial
              color="#dbeafe"
              transparent
              opacity={0.16}
              transmission={0.92}
              roughness={0.08}
            />
          </mesh>
          <mesh
            position={[-width * 0.45, 0, 0.012]}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((v) => !v);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "auto";
            }}
          >
            <cylinderGeometry args={[0.018, 0.018, 0.14, 14]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.65} roughness={0.25} />
          </mesh>
        </group>
      </group>

      {children}

      {SHOW_3D_TEXT && (
        <Html
          transform
          position={[0, height - 0.48, depth / 2 - 0.03]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div className="rounded-md border border-amber-200/70 bg-amber-50/95 px-3 py-1 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-900">
              {title}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

function GlasswareIcon({
  kind,
  position,
  label,
  onPick,
}: {
  kind: GlasswareKind;
  position: [number, number, number];
  label: string;
  onPick: (kind: GlasswareKind) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onPick(kind);
  };

  // IMPORTANT: never allocate THREE materials on every render (can leak GPU memory / cause context loss).
  const glassMaterialProps = useMemo(
    () => ({
      color: "#eaf6ff",
      transparent: true,
      opacity: 0.12,
      roughness: 0.02,
      transmission: 0.95,
      thickness: 1,
      ior: 1.52,
    }),
    [],
  );

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={handlePick}
    >
      {/* Simple glass shapes (visual only) */}
      {kind === "beaker" && (
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.12, 0.1, 0.22, 20, 1, true]} />
          <meshPhysicalMaterial {...glassMaterialProps} />
        </mesh>
      )}
      {kind === "flask" && (
        <group>
          <mesh castShadow receiveShadow position={[0, -0.02, 0]}>
            <sphereGeometry args={[0.12, 18, 14]} />
            <meshPhysicalMaterial {...glassMaterialProps} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.18, 16]} />
            <meshPhysicalMaterial {...glassMaterialProps} />
          </mesh>
        </group>
      )}
      {kind === "testTube" && (
        <group>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.26, 16, 1, true]} />
            <meshPhysicalMaterial {...glassMaterialProps} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, -0.13, 0]}>
            <sphereGeometry args={[0.035, 14, 10]} />
            <meshPhysicalMaterial {...glassMaterialProps} />
          </mesh>
        </group>
      )}
      {kind === "cylinder" && (
        <group>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.05, 0.06, 0.3, 18, 1, true]} />
            <meshPhysicalMaterial {...glassMaterialProps} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, -0.17, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.03, 18]} />
            <meshStandardMaterial color="#dce7ef" roughness={0.35} metalness={0.15} />
          </mesh>
        </group>
      )}

      {SHOW_3D_TEXT && isHovered && (
        <Html position={[0, -0.28, 0]} center>
          <div className="rounded-md border border-slate-200 bg-white/95 px-2 py-1 shadow-lg pointer-events-none">
            <p className="text-[10px] font-semibold text-slate-800 whitespace-nowrap">{label}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function ToolIcon({
  kind,
  position,
  label,
  onPick,
}: {
  kind: BenchToolKind;
  position: [number, number, number];
  label: string;
  onPick: (kind: BenchToolKind) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onPick(kind);
  };

  const bodyColor = "#cbd5e1";
  const accent = "#38bdf8";

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={handlePick}
    >
      {kind === "phMeter" && (
        <group>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.18, 0.12, 0.1]} />
            <meshStandardMaterial color={bodyColor} roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.01, 0.052]}>
            <boxGeometry args={[0.14, 0.08, 0.01]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.15} />
          </mesh>
        </group>
      )}

      {kind === "thermometer" && (
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.25, 12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.18} metalness={0.05} />
          </mesh>
          <mesh position={[0, -0.14, 0]} castShadow>
            <sphereGeometry args={[0.022, 14, 10]} />
            <meshStandardMaterial color="#ef4444" roughness={0.25} metalness={0.05} />
          </mesh>
        </group>
      )}

      {kind === "tubeRack" && (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.08, 0.12]} />
          <meshStandardMaterial color="#a16207" roughness={0.9} />
        </mesh>
      )}

      {kind === "washBottle" && (
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.14, 16]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.25} metalness={0.05} transparent opacity={0.85} />
        </mesh>
      )}

      {kind === "balance" && (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.22, 0.09, 0.16]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.35} metalness={0.25} />
        </mesh>
      )}

      {kind === "retortStand" && (
        <group>
          <mesh castShadow receiveShadow position={[0, -0.06, 0]}>
            <boxGeometry args={[0.18, 0.02, 0.14]} />
            <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.4} />
          </mesh>
          <mesh castShadow position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.2, 12]} />
            <meshStandardMaterial color="#64748b" roughness={0.35} metalness={0.55} />
          </mesh>
        </group>
      )}

      {SHOW_3D_TEXT && isHovered && (
        <Html position={[0, -0.22, 0]} center>
          <div className="rounded-md border border-slate-200 bg-white/95 px-2 py-1 shadow-lg pointer-events-none">
            <p className="text-[10px] font-semibold text-slate-800 whitespace-nowrap">{label}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

export function LabStorageCabinets3D({
  position,
  onSelectChemical,
  onDragStart,
  onDragEnd,
  selectedChemicalId,
  draggingChemicalId,
  onPickGlassware,
  onPickBenchTool,
}: LabStorageCabinets3DProps) {
  return (
    <group position={position}>
      <CabinetUnit3D position={[-2.25, 0, 0]} title="Chemical cupboard" width={2.05}>
        <group position={[-0.72, -0.1, -0.02]} scale={0.78}>
          <ChemicalShelf3D
            position={[0, 0, 0]}
            onSelectChemical={onSelectChemical}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            selectedChemicalId={selectedChemicalId}
            draggingChemicalId={draggingChemicalId}
          />
        </group>
      </CabinetUnit3D>

      <CabinetUnit3D position={[0, 0, 0]} title="Glassware cupboard" width={2.05}>
        <group position={[0, 0.2, -0.08]}>
          <GlasswareIcon kind="beaker" position={[-0.55, 0.05, 0]} label="Beaker" onPick={onPickGlassware} />
          <GlasswareIcon kind="flask" position={[-0.15, 0.05, 0]} label="Flask" onPick={onPickGlassware} />
          <GlasswareIcon kind="testTube" position={[0.25, 0.05, 0]} label="Test tube" onPick={onPickGlassware} />
          <GlasswareIcon kind="cylinder" position={[0.65, 0.05, 0]} label="Cylinder" onPick={onPickGlassware} />
        </group>
      </CabinetUnit3D>

      <CabinetUnit3D position={[2.25, 0, 0]} title="Tools & meters" width={2.05}>
        <group position={[0, 0.22, -0.08]}>
          <ToolIcon
            kind="phMeter"
            position={[-0.55, 0.08, 0]}
            label="pH meter"
            onPick={(kind) => onPickBenchTool?.(kind)}
          />
          <ToolIcon
            kind="thermometer"
            position={[-0.15, 0.08, 0]}
            label="Thermometer"
            onPick={(kind) => onPickBenchTool?.(kind)}
          />
          <ToolIcon
            kind="tubeRack"
            position={[0.25, 0.08, 0]}
            label="Tube rack"
            onPick={(kind) => onPickBenchTool?.(kind)}
          />
          <ToolIcon
            kind="washBottle"
            position={[0.65, 0.08, 0]}
            label="Wash bottle"
            onPick={(kind) => onPickBenchTool?.(kind)}
          />
        </group>
        <group position={[0, 0.75, -0.08]}>
          <ToolIcon
            kind="balance"
            position={[-0.35, 0.08, 0]}
            label="Balance"
            onPick={(kind) => onPickBenchTool?.(kind)}
          />
          <ToolIcon
            kind="retortStand"
            position={[0.15, 0.08, 0]}
            label="Retort stand"
            onPick={(kind) => onPickBenchTool?.(kind)}
          />
        </group>
      </CabinetUnit3D>
    </group>
  );
}
