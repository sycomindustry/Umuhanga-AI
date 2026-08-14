import { useState, useRef, useCallback, useEffect } from 'react';
import { EQUIPMENT_CATALOG, LabEquipmentItem, PlacedEquipment, LabType } from '@/types/lab';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Link, Thermometer, Zap, Eye } from 'lucide-react';

interface LabBenchProps {
  labType: LabType;
  placedEquipment: PlacedEquipment[];
  onDropEquipment: (equipmentId: string, position: { x: number; y: number }) => void;
  onMoveEquipment: (placedId: string, position: { x: number; y: number }) => void;
  onRemoveEquipment: (placedId: string) => void;
  onConnectEquipment: (sourceId: string, targetId: string) => void;
  onEquipmentClick: (placed: PlacedEquipment) => void;
  selectedPlacedId: string | null;
  connectingFrom: string | null;
  setConnectingFrom: (id: string | null) => void;
  pendingEquipmentId?: string | null;
  pendingEquipment?: LabEquipmentItem | null;
  onCancelPlacement?: () => void;
}

export function LabBench({
  labType,
  placedEquipment,
  onDropEquipment,
  onMoveEquipment,
  onRemoveEquipment,
  onConnectEquipment,
  onEquipmentClick,
  selectedPlacedId,
  connectingFrom,
  setConnectingFrom,
  pendingEquipmentId,
  pendingEquipment,
  onCancelPlacement,
}: LabBenchProps) {
  const benchRef = useRef<HTMLDivElement>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [placementPreview, setPlacementPreview] = useState<{ x: number; y: number } | null>(null);

  const clampToBench = useCallback((x: number, y: number, rect: DOMRect) => ({
    x: Math.max(56, Math.min(rect.width - 56, x)),
    y: Math.max(96, Math.min(rect.height - 56, y)),
  }), []);

  const getBenchPosition = useCallback((clientX: number, clientY: number) => {
    if (!benchRef.current) return null;
    const rect = benchRef.current.getBoundingClientRect();
    return clampToBench(clientX - rect.left, clientY - rect.top, rect);
  }, [clampToBench]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const equipmentId = e.dataTransfer.getData('equipmentId');
    
    if (equipmentId && benchRef.current) {
      const position = getBenchPosition(e.clientX, e.clientY);
      if (position) {
        onDropEquipment(equipmentId, position);
      }
    }
  };

  const handleItemMouseDown = (e: React.MouseEvent, placedId: string, placed: PlacedEquipment) => {
    if (connectingFrom) {
      // Connect mode
      if (connectingFrom !== placedId) {
        onConnectEquipment(connectingFrom, placedId);
      }
      setConnectingFrom(null);
      return;
    }

    e.stopPropagation();
    const rect = benchRef.current?.getBoundingClientRect();
    setDraggedItem(placedId);
    setDragOffset({
      x: rect ? e.clientX - rect.left - placed.position.x : 0,
      y: rect ? e.clientY - rect.top - placed.position.y : 0,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggedItem && benchRef.current) {
      const rect = benchRef.current.getBoundingClientRect();
      const { x: newX, y: newY } = clampToBench(
        e.clientX - rect.left - dragOffset.x,
        e.clientY - rect.top - dragOffset.y,
        rect,
      );
      onMoveEquipment(draggedItem, { x: newX, y: newY });
    }
  }, [clampToBench, dragOffset.x, dragOffset.y, draggedItem, onMoveEquipment]);

  const handleMouseUp = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const handleBenchMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pendingEquipmentId || draggedItem) return;
    const position = getBenchPosition(e.clientX, e.clientY);
    if (position) {
      setPlacementPreview(position);
    }
  };

  const handleBenchClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pendingEquipmentId) return;
    const position = getBenchPosition(e.clientX, e.clientY);
    if (!position) return;
    onDropEquipment(pendingEquipmentId, position);
    setPlacementPreview(position);
  };

  const handleBenchLeave = () => {
    if (!draggedItem) {
      setPlacementPreview(null);
    }
  };

  useEffect(() => {
    if (draggedItem) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedItem, handleMouseMove, handleMouseUp]);

  // Draw connection lines
  const renderConnections = () => {
    const lines: React.ReactNode[] = [];
    const drawnConnections = new Set<string>();

    placedEquipment.forEach(placed => {
      placed.connections.forEach(targetId => {
        const connectionKey = [placed.id, targetId].sort().join('-');
        if (drawnConnections.has(connectionKey)) return;
        drawnConnections.add(connectionKey);

        const target = placedEquipment.find(e => e.id === targetId);
        if (target) {
          lines.push(
            <svg
              key={connectionKey}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 0 }}
            >
              <line
                x1={placed.position.x}
                y1={placed.position.y}
                x2={target.position.x}
                y2={target.position.y}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="4"
              />
            </svg>
          );
        }
      });
    });

    return lines;
  };

  const getBenchBackground = () => {
    switch (labType) {
      case 'chemistry':
        return 'bg-gradient-to-br from-slate-800 to-slate-900';
      case 'physics':
        return 'bg-gradient-to-br from-zinc-800 to-zinc-900';
      case 'biology':
        return 'bg-gradient-to-br from-emerald-900 to-emerald-950';
      default:
        return 'bg-gradient-to-br from-slate-800 to-slate-900';
    }
  };

  return (
    <div
      ref={benchRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleBenchMouseMove}
      onMouseLeave={handleBenchLeave}
      onClick={handleBenchClick}
      className={cn(
        "relative w-full h-full min-h-[500px] rounded-lg border-2 border-border overflow-hidden",
        getBenchBackground(),
        connectingFrom && "cursor-crosshair",
        pendingEquipmentId && "cursor-copy"
      )}
    >
      {/* Storage wall */}
      <div className="absolute inset-x-0 top-0 h-28 border-b border-white/10 bg-gradient-to-b from-black/20 to-transparent">
        <div className="mx-6 mt-4 grid grid-cols-3 gap-3">
          {[
            'Chemical cupboard',
            'Glassware cupboard',
            'Tools and meters',
          ].map((label) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-100">{label}</p>
              <div className="mt-2 flex gap-2">
                <div className="h-7 w-7 rounded-md bg-white/10" />
                <div className="h-7 w-7 rounded-md bg-white/10" />
                <div className="h-7 w-7 rounded-md bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      {/* Work surface */}
      <div className="absolute inset-x-4 bottom-4 top-24 rounded-3xl border border-amber-100/10 bg-[linear-gradient(135deg,rgba(120,74,42,0.85),rgba(89,54,31,0.92))] shadow-inner" />

      {/* Connection lines */}
      {renderConnections()}

      {/* Connecting indicator line */}
      {connectingFrom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <Badge variant="secondary" className="animate-pulse">
            <Link className="w-3 h-3 mr-1" />
            Click another item to connect
          </Badge>
        </div>
      )}

      {pendingEquipment && (
        <div className="absolute left-6 top-32 z-40 rounded-xl border border-primary/30 bg-background/90 px-4 py-3 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{pendingEquipment.icon}</div>
            <div>
              <p className="text-sm font-semibold">In hand: {pendingEquipment.name}</p>
              <p className="text-xs text-muted-foreground">
                Click anywhere on the workbench to place it.
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onCancelPlacement?.();
                setPlacementPreview(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Placed equipment */}
      {placedEquipment.map(placed => {
        const equipment = EQUIPMENT_CATALOG[placed.equipmentId];
        if (!equipment) return null;

        return (
          <TooltipProvider key={placed.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onMouseDown={(e) => handleItemMouseDown(e, placed.id, placed)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEquipmentClick(placed);
                  }}
                  className={cn(
                    "absolute transform -translate-x-1/2 -translate-y-1/2 p-3 rounded-lg border-2 bg-card/90 backdrop-blur-sm transition-all cursor-move select-none",
                    selectedPlacedId === placed.id
                      ? "border-primary shadow-lg shadow-primary/30 scale-110"
                      : "border-border hover:border-primary/50",
                    connectingFrom === placed.id && "ring-2 ring-primary ring-offset-2",
                    placed.state.isActive && "ring-2 ring-green-500/50",
                    draggedItem === placed.id && "opacity-75 scale-105"
                  )}
                  style={{
                    left: placed.position.x,
                    top: placed.position.y,
                    zIndex: draggedItem === placed.id ? 100 : 10,
                  }}
                >
                  {selectedPlacedId === placed.id && (
                    <button
                      type="button"
                      className="absolute -right-2 -top-2 rounded-full border border-border bg-background p-1 text-muted-foreground shadow-sm transition-colors hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveEquipment(placed.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                  <div className="text-3xl text-center">{equipment.icon}</div>
                  <p className="text-xs font-medium text-center mt-1 whitespace-nowrap max-w-[80px] truncate">
                    {equipment.name}
                  </p>

                  {/* State indicators */}
                  <div className="flex gap-1 mt-1 justify-center flex-wrap">
                    {placed.state.temperature && placed.state.temperature > 30 && (
                      <Badge variant="destructive" className="text-[10px] px-1 py-0">
                        <Thermometer className="w-2 h-2 mr-0.5" />
                        {placed.state.temperature}°C
                      </Badge>
                    )}
                    {placed.state.voltage && placed.state.voltage > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        <Zap className="w-2 h-2 mr-0.5" />
                        {placed.state.voltage}V
                      </Badge>
                    )}
                    {placed.state.isActive && equipment.id === 'light_bulb' && (
                      <Badge className="text-[10px] px-1 py-0 bg-yellow-500">
                        ON
                      </Badge>
                    )}
                    {placed.state.zoomLevel && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        <Eye className="w-2 h-2 mr-0.5" />
                        {placed.state.zoomLevel}x
                      </Badge>
                    )}
                  </div>

                  {/* Active glow effect */}
                  {placed.state.isActive && (
                    <div className="absolute inset-0 rounded-lg bg-yellow-500/20 animate-pulse pointer-events-none" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">{equipment.name}</p>
                  <p className="text-sm text-muted-foreground">{equipment.description}</p>
                  {placed.connections.length > 0 && (
                    <p className="text-xs text-primary">
                      Connected to {placed.connections.length} item(s)
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}

      {/* Placement preview */}
      {pendingEquipment && placementPreview && (
        <div
          className="absolute pointer-events-none z-30 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: placementPreview.x,
            top: placementPreview.y,
          }}
        >
          <div className="rounded-xl border border-cyan-300/50 bg-cyan-100/15 px-4 py-3 text-center shadow-lg backdrop-blur-sm">
            <div className="text-3xl opacity-90">{pendingEquipment.icon}</div>
            <p className="mt-1 text-xs font-semibold text-white">{pendingEquipment.name}</p>
            <p className="text-[10px] text-slate-200">Place on bench</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {placedEquipment.length === 0 && !pendingEquipment && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="text-center rounded-2xl border border-white/10 bg-black/20 px-8 py-6 backdrop-blur-sm">
            <div className="text-5xl mb-4">🧪</div>
            <p className="text-lg font-medium text-white">Prepare the bench</p>
            <p className="text-sm text-slate-200">
              Pick equipment from storage, then place it on the work surface like a normal laboratory.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
