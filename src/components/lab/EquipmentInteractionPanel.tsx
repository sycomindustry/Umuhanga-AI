import { useState, useEffect } from 'react';
import { PlacedEquipment, EQUIPMENT_CATALOG } from '@/types/lab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, 
  Zap, 
  Eye, 
  ThermometerSun, 
  Power, 
  ZoomIn, 
  ZoomOut,
  Droplets,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EquipmentInteractionPanelProps {
  selectedEquipment: PlacedEquipment | null;
  allEquipment: PlacedEquipment[];
  onHeat: (targetId: string, heaterId: string) => void;
  onCalculateCircuit: (batteryId: string) => void;
  onSetZoom: (microscopeId: string, zoom: number) => void;
  onUpdateState: (placedId: string, state: Partial<PlacedEquipment['state']>) => void;
  isRunning: boolean;
}

export function EquipmentInteractionPanel({
  selectedEquipment,
  allEquipment,
  onHeat,
  onCalculateCircuit,
  onSetZoom,
  onUpdateState,
  isRunning,
}: EquipmentInteractionPanelProps) {
  const [heatingInterval, setHeatingInterval] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (heatingInterval) clearInterval(heatingInterval);
    };
  }, [heatingInterval]);

  if (!selectedEquipment) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Equipment Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Select equipment to see controls
          </p>
        </CardContent>
      </Card>
    );
  }

  const equipment = EQUIPMENT_CATALOG[selectedEquipment.equipmentId];
  if (!equipment) return null;

  const renderHeatingControls = () => {
    // Find connected heaters
    const connectedHeaters = allEquipment.filter(e => 
      selectedEquipment.connections.includes(e.id) &&
      EQUIPMENT_CATALOG[e.equipmentId]?.category === 'heating'
    );

    const temperature = selectedEquipment.state.temperature || 25;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium flex items-center gap-2">
            <ThermometerSun className="w-4 h-4 text-orange-500" />
            Temperature
          </span>
          <Badge 
            variant={temperature > 80 ? "destructive" : temperature > 50 ? "secondary" : "outline"}
          >
            {temperature}°C
          </Badge>
        </div>

        <Progress 
          value={(temperature / 150) * 100} 
          className={cn(
            "h-3",
            temperature > 100 && "[&>div]:bg-red-500",
            temperature > 50 && temperature <= 100 && "[&>div]:bg-orange-500"
          )}
        />

        {connectedHeaters.length > 0 ? (
          <div className="space-y-2">
            {connectedHeaters.map(heater => {
              const heaterEquip = EQUIPMENT_CATALOG[heater.equipmentId];
              return (
                <Button
                  key={heater.id}
                  onClick={() => onHeat(selectedEquipment.id, heater.id)}
                  disabled={!isRunning}
                  className="w-full"
                  variant={heater.state.isActive ? "default" : "outline"}
                >
                  <Flame className="w-4 h-4 mr-2" />
                  Heat with {heaterEquip.name}
                </Button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Connect to a heat source to adjust temperature
          </p>
        )}

        {selectedEquipment.state.contents && selectedEquipment.state.contents.length > 0 && (
          <div className="mt-4">
            <span className="text-sm font-medium flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              Contents
            </span>
            <div className="flex flex-wrap gap-1">
              {selectedEquipment.state.contents.map((content, i) => (
                <Badge key={i} variant="secondary">{content}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCircuitControls = () => {
    const voltage = selectedEquipment.state.voltage || 0;
    const current = selectedEquipment.state.current || 0;
    const brightness = selectedEquipment.state.brightness || 0;
    const isBattery = equipment.category === 'electrical' && equipment.properties.voltage;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Voltage</span>
            </div>
            <p className="text-lg font-bold">{voltage.toFixed(1)}V</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Current</span>
            </div>
            <p className="text-lg font-bold">{current.toFixed(3)}A</p>
          </div>
        </div>

        {selectedEquipment.equipmentId === 'light_bulb' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Brightness</span>
              <Badge variant={brightness > 50 ? "default" : "secondary"}>
                {brightness.toFixed(0)}%
              </Badge>
            </div>
            <Progress value={brightness} className="h-3" />
            <div 
              className={cn(
                "w-full h-16 rounded-lg flex items-center justify-center transition-all",
                brightness > 0 
                  ? "bg-yellow-400 shadow-lg shadow-yellow-400/50" 
                  : "bg-muted"
              )}
              style={{ 
                opacity: Math.max(0.3, brightness / 100),
                boxShadow: brightness > 50 
                  ? `0 0 ${brightness / 2}px ${brightness / 4}px rgba(250, 204, 21, ${brightness / 200})` 
                  : 'none'
              }}
            >
              <span className="text-xl">{brightness > 10 ? '💡' : '⚫'}</span>
            </div>
          </div>
        )}

        {isBattery && (
          <Button
            onClick={() => onCalculateCircuit(selectedEquipment.id)}
            disabled={!isRunning || selectedEquipment.connections.length === 0}
            className="w-full"
          >
            <Power className="w-4 h-4 mr-2" />
            Power Circuit
          </Button>
        )}

        {selectedEquipment.connections.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Connect components to build a circuit
          </p>
        )}
      </div>
    );
  };

  const renderMicroscopeControls = () => {
    const zoomLevel = selectedEquipment.state.zoomLevel || 40;
    const zoomLevels = [40, 100, 400, 1000];
    const hasSlide = allEquipment.some(e => 
      e.equipmentId === 'microscope_slide' && 
      selectedEquipment.connections.includes(e.id)
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Magnification
          </span>
          <Badge variant="outline">{zoomLevel}x</Badge>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {zoomLevels.map(level => (
            <Button
              key={level}
              size="sm"
              variant={zoomLevel === level ? "default" : "outline"}
              onClick={() => onSetZoom(selectedEquipment.id, level)}
              disabled={!isRunning || !hasSlide}
              className="text-xs"
            >
              {level}x
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const currentIndex = zoomLevels.indexOf(zoomLevel);
              if (currentIndex > 0) {
                onSetZoom(selectedEquipment.id, zoomLevels[currentIndex - 1]);
              }
            }}
            disabled={!isRunning || !hasSlide || zoomLevel === zoomLevels[0]}
            className="flex-1"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const currentIndex = zoomLevels.indexOf(zoomLevel);
              if (currentIndex < zoomLevels.length - 1) {
                onSetZoom(selectedEquipment.id, zoomLevels[currentIndex + 1]);
              }
            }}
            disabled={!isRunning || !hasSlide || zoomLevel === zoomLevels[zoomLevels.length - 1]}
            className="flex-1"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        {/* Specimen View */}
        <div className="relative bg-black rounded-full aspect-square overflow-hidden border-4 border-muted">
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundImage: hasSlide ? getSpecimenImage(zoomLevel) : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!hasSlide ? (
              <p className="text-xs text-muted-foreground text-center px-4">
                Connect a slide to view specimen
              </p>
            ) : (
              <div className="text-center">
                <div 
                  className="transition-all"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                >
                  {getSpecimenEmoji(zoomLevel)}
                </div>
              </div>
            )}
          </div>
          {hasSlide && (
            <div className="absolute inset-0 border-[12px] border-transparent rounded-full pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
              }}
            />
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {getZoomDescription(zoomLevel)}
        </p>
      </div>
    );
  };

  // Determine which controls to show
  const getControls = () => {
    if (equipment.category === 'glassware' || equipment.category === 'chemicals') {
      return renderHeatingControls();
    }
    if (equipment.category === 'electrical') {
      return renderCircuitControls();
    }
    if (equipment.category === 'optical') {
      return renderMicroscopeControls();
    }
    return (
      <p className="text-sm text-muted-foreground">
        {equipment.usageInstructions}
      </p>
    );
  };

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{equipment.icon}</span>
          <div>
            <CardTitle className="text-sm">{equipment.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{equipment.category}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {getControls()}
      </CardContent>
    </Card>
  );
}

function getSpecimenImage(zoom: number): string {
  return `radial-gradient(circle, hsl(var(--primary) / 0.3) ${100 / (zoom / 20)}%, transparent ${150 / (zoom / 40)}%)`;
}

function getSpecimenEmoji(zoom: number): string {
  switch (zoom) {
    case 40: return '🔴';
    case 100: return '🧫';
    case 400: return '🦠';
    case 1000: return '🧬';
    default: return '👁️';
  }
}

function getZoomDescription(zoom: number): string {
  switch (zoom) {
    case 40: return 'Low power - see overall specimen shape';
    case 100: return 'Medium power - individual cells visible';
    case 400: return 'High power - cell structures visible';
    case 1000: return 'Oil immersion - detailed organelles';
    default: return `${zoom}x magnification`;
  }
}
