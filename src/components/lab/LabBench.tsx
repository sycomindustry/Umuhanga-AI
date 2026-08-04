import { useState, useRef, useCallback, useEffect } from 'react';
import { EQUIPMENT_CATALOG, PlacedEquipment, LabType } from '@/types/lab';
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
}: LabBenchProps) {
  const benchRef = useRef<HTMLDivElement>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const equipmentId = e.dataTransfer.getData('equipmentId');
    
    if (equipmentId && benchRef.current) {
      const rect = benchRef.current.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      onDropEquipment(equipmentId, position);
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
    setDraggedItem(placedId);
    setDragOffset({
      x: e.clientX - placed.position.x,
      y: e.clientY - placed.position.y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggedItem && benchRef.current) {
      const rect = benchRef.current.getBoundingClientRect();
      const newX = Math.max(40, Math.min(rect.width - 40, e.clientX - rect.left));
      const newY = Math.max(40, Math.min(rect.height - 40, e.clientY - rect.top));
      onMoveEquipment(draggedItem, { x: newX, y: newY });
    }
  }, [draggedItem, onMoveEquipment]);

  const handleMouseUp = useCallback(() => {
    setDraggedItem(null);
  }, []);

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
      className={cn(
        "relative w-full h-full min-h-[500px] rounded-lg border-2 border-border overflow-hidden",
        getBenchBackground(),
        connectingFrom && "cursor-crosshair"
      )}
    >
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

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
                  onClick={() => onEquipmentClick(placed)}
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

      {/* Empty state */}
      {placedEquipment.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="text-5xl mb-4">🧪</div>
            <p className="text-lg font-medium">Drop equipment here</p>
            <p className="text-sm">Drag items from the equipment panel or click to select</p>
          </div>
        </div>
      )}
    </div>
  );
}
