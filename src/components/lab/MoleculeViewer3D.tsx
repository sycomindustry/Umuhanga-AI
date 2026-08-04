import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ATOM_STYLE, MOLECULES, type Molecule } from "@/lib/molecules";
import { Atom, RotateCw } from "lucide-react";

function Bond({
  start,
  end,
  order,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  order: 1 | 2 | 3;
}) {
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dir = end.clone().sub(start);
  const length = dir.length();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  const perpendicular = new THREE.Vector3(0, 1, 0)
    .cross(dir.clone().normalize())
    .normalize()
    .multiplyScalar(0.11);
  const offsets =
    order === 1
      ? [new THREE.Vector3()]
      : order === 2
      ? [perpendicular, perpendicular.clone().negate()]
      : [perpendicular, new THREE.Vector3(), perpendicular.clone().negate()];

  return (
    <>
      {offsets.map((offset, i) => (
        <mesh
          key={i}
          position={mid.clone().add(offset)}
          quaternion={quaternion}
          castShadow
        >
          <cylinderGeometry args={[0.07, 0.07, length, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.35} />
        </mesh>
      ))}
    </>
  );
}

function MoleculeModel({
  molecule,
  spin,
  showLabels,
}: {
  molecule: Molecule;
  spin: boolean;
  showLabels: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (spin && group.current) group.current.rotation.y += delta * 0.5;
  });

  const positions = useMemo(
    () => molecule.atoms.map((a) => new THREE.Vector3(...a.pos)),
    [molecule]
  );

  return (
    <group ref={group}>
      {molecule.atoms.map((atom, i) => {
        const style = ATOM_STYLE[atom.el] ?? { color: "#64748b", radius: 0.45 };
        return (
          <mesh key={i} position={positions[i]} castShadow>
            <sphereGeometry args={[style.radius, 48, 48]} />
            <meshStandardMaterial
              color={style.color}
              metalness={0.25}
              roughness={0.2}
              envMapIntensity={0.9}
            />
            {showLabels && (
              <Html center distanceFactor={7}>
                <span className="pointer-events-none select-none rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-200">
                  {atom.el}
                </span>
              </Html>
            )}
          </mesh>
        );
      })}
      {molecule.bonds.map((bond, i) => (
        <Bond
          key={i}
          start={positions[bond.a]}
          end={positions[bond.b]}
          order={bond.order}
        />
      ))}
    </group>
  );
}

export function MoleculeViewer3D({ initialId }: { initialId?: string }) {
  const [selectedId, setSelectedId] = useState(initialId ?? MOLECULES[0].id);
  const [spin, setSpin] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const molecule = MOLECULES.find((m) => m.id === selectedId) ?? MOLECULES[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr_300px]">
      <Card className="border-slate-700 bg-slate-900/60">
        <CardContent className="space-y-1.5 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            Molecule library
          </p>
          {MOLECULES.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                m.id === selectedId
                  ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-100"
                  : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-cyan-400/30"
              }`}
            >
              <span className="block text-sm font-medium">{m.name}</span>
              <span className="text-xs text-slate-400">{m.formula}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-slate-700 bg-slate-950">
        <div className="h-[420px]">
          <Canvas camera={{ position: [0, 1.5, 5], fov: 45 }} shadows>
            <color attach="background" args={["#020617"]} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[4, 6, 4]} intensity={1.4} castShadow />
            <pointLight position={[-4, -2, -4]} intensity={0.6} color="#22d3ee" />
            <MoleculeModel molecule={molecule} spin={spin} showLabels={showLabels} />
            <Environment preset="city" />
            <OrbitControls enablePan={false} minDistance={2.5} maxDistance={10} />
          </Canvas>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-slate-700 bg-slate-900/70 px-4 py-2">
          <div className="flex items-center gap-2">
            <Switch id="spin" checked={spin} onCheckedChange={setSpin} />
            <Label htmlFor="spin" className="text-xs text-slate-300">
              Auto-rotate
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="labels" checked={showLabels} onCheckedChange={setShowLabels} />
            <Label htmlFor="labels" className="text-xs text-slate-300">
              Atom labels
            </Label>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto text-slate-300"
            onClick={() => setSpin((s) => !s)}
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Drag to orbit
          </Button>
        </div>
      </Card>

      <Card className="border-slate-700 bg-slate-900/60">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Atom className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-slate-100">{molecule.name}</h3>
          </div>
          <p className="text-2xl font-bold text-cyan-300">{molecule.formula}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-cyan-400/40 text-cyan-200">
              {molecule.shape}
            </Badge>
            <Badge variant="outline" className="border-emerald-400/40 text-emerald-200">
              {molecule.bonding}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">{molecule.explanation}</p>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-xs text-slate-400">
            {molecule.atoms.length} atoms · {molecule.bonds.length} bonds. Rotate the model
            to see how the electron pairs push the atoms into this shape.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MoleculeViewer3D;
