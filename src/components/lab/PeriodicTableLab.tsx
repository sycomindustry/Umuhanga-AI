import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CATEGORY_CLASS,
  CATEGORY_LABELS,
  ELEMENTS,
  valenceElectrons,
  type ChemElement,
  type ElementCategory,
} from "@/lib/elements";
import { Search } from "lucide-react";

function BohrModel({ element }: { element: ChemElement }) {
  const size = 240;
  const center = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-56 w-56">
      <defs>
        <radialGradient id="nucleus">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
      </defs>
      {element.shells.map((count, shellIndex) => {
        const r = 24 + (shellIndex + 1) * (86 / element.shells.length);
        const duration = 6 + shellIndex * 3;
        return (
          <g key={shellIndex}>
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="#22d3ee"
              strokeOpacity={0.25}
              strokeWidth={1}
            />
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${center} ${center}`}
                to={`360 ${center} ${center}`}
                dur={`${duration}s`}
                repeatCount="indefinite"
              />
              {Array.from({ length: count }).map((_, i) => {
                const angle = (i / count) * Math.PI * 2;
                return (
                  <circle
                    key={i}
                    cx={center + r * Math.cos(angle)}
                    cy={center + r * Math.sin(angle)}
                    r={3.2}
                    fill="#67e8f9"
                  />
                );
              })}
            </g>
          </g>
        );
      })}
      <circle cx={center} cy={center} r={20} fill="url(#nucleus)" />
      <text
        x={center}
        y={center + 5}
        textAnchor="middle"
        className="fill-slate-900 text-sm font-bold"
      >
        {element.symbol}
      </text>
    </svg>
  );
}

export function PeriodicTableLab({
  onAskAI,
}: {
  onAskAI?: (question: string) => void;
}) {
  const [selected, setSelected] = useState<ChemElement>(
    ELEMENTS.find((e) => e.symbol === "O") ?? ELEMENTS[0]
  );
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      ELEMENTS.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.symbol.toLowerCase() === q ||
          String(e.z) === q
      ).map((e) => e.z)
    );
  }, [query]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <Card className="border-slate-700 bg-slate-900/60">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search element, symbol or number"
                className="border-slate-700 bg-slate-800/60 pl-9 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(CATEGORY_LABELS) as ElementCategory[]).map((cat) => (
                <span
                  key={cat}
                  className={`rounded border bg-gradient-to-br px-1.5 py-0.5 text-[10px] text-white ${CATEGORY_CLASS[cat]}`}
                >
                  {CATEGORY_LABELS[cat]}
                </span>
              ))}
            </div>
          </div>

          <ScrollArea className="w-full">
            <div
              className="grid min-w-[900px] gap-[3px]"
              style={{
                gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
                gridTemplateRows: "repeat(10, minmax(0, 1fr))",
              }}
            >
              {ELEMENTS.map((el) => {
                const dimmed = matches ? !matches.has(el.z) : false;
                return (
                  <button
                    key={el.z}
                    onClick={() => setSelected(el)}
                    style={{ gridColumn: el.x, gridRow: el.y }}
                    className={`group aspect-square rounded-[5px] border bg-gradient-to-br p-1 text-left transition-all ${
                      CATEGORY_CLASS[el.category]
                    } ${dimmed ? "opacity-20" : "hover:scale-110 hover:shadow-lg"} ${
                      selected.z === el.z ? "ring-2 ring-cyan-300 ring-offset-1 ring-offset-slate-900" : ""
                    }`}
                  >
                    <span className="block text-[8px] leading-none text-white/70">{el.z}</span>
                    <span className="block text-[13px] font-bold leading-tight text-white">
                      {el.symbol}
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-900/60">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-100">{selected.name}</h3>
              <p className="text-sm text-slate-400">Atomic number {selected.z}</p>
            </div>
            <span className="text-4xl font-black text-cyan-300">{selected.symbol}</span>
          </div>

          <BohrModel element={selected} />

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-2">
              <p className="text-[11px] uppercase text-slate-500">Atomic mass</p>
              <p className="font-semibold text-slate-100">{selected.mass} u</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-2">
              <p className="text-[11px] uppercase text-slate-500">Valence electrons</p>
              <p className="font-semibold text-slate-100">{valenceElectrons(selected)}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-2">
              <p className="text-[11px] uppercase text-slate-500">Period</p>
              <p className="font-semibold text-slate-100">
                {selected.y > 8 ? (selected.y === 9 ? 6 : 7) : selected.y}
              </p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-2">
              <p className="text-[11px] uppercase text-slate-500">Shells</p>
              <p className="font-semibold text-slate-100">{selected.shells.join(", ")}</p>
            </div>
          </div>

          <div>
            <p className="mb-1 text-[11px] uppercase text-slate-500">Electron configuration</p>
            <p className="rounded-lg border border-slate-700 bg-slate-800/50 p-2 font-mono text-xs text-cyan-200">
              {selected.config}
            </p>
          </div>

          <Badge variant="outline" className="border-cyan-400/40 text-cyan-200">
            {CATEGORY_LABELS[selected.category]}
          </Badge>

          {onAskAI && (
            <button
              onClick={() =>
                onAskAI(
                  `Explain the chemical behaviour of ${selected.name} (${selected.symbol}) and give one experiment I can safely do with it in the virtual lab.`
                )
              }
              className="w-full rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200 transition-colors hover:bg-cyan-500/20"
            >
              Ask the AI scientist about {selected.symbol}
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PeriodicTableLab;
