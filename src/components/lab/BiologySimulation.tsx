import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, Microscope, Droplet, Sun, Plus, Minus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BiologySimulationProps {
  experimentType: string;
  onDataChange?: (data: any) => void;
  onAIRequest?: (state: any, action: string) => void;
}

interface Cell {
  id: number;
  type: string;
  x: number;
  y: number;
  size: number;
  stage: number;
  color: string;
}

export const BiologySimulation = ({ experimentType, onDataChange, onAIRequest }: BiologySimulationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [magnification, setMagnification] = useState(40);
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedSample, setSelectedSample] = useState("plant-cell");
  const [lightIntensity, setLightIntensity] = useState(80);
  const [nutrientLevel, setNutrientLevel] = useState(50);
  const [temperature, setTemperature] = useState(25);
  const [growthRate, setGrowthRate] = useState(0);
  const [cellCount, setCellCount] = useState(0);

  useEffect(() => {
    initializeSample(selectedSample);
  }, [selectedSample]);

  useEffect(() => {
    // Calculate growth rate based on conditions
    const optimalTemp = Math.max(0, 100 - Math.abs(temperature - 37) * 3);
    const rate = (lightIntensity * 0.3 + nutrientLevel * 0.5 + optimalTemp * 0.2) / 100;
    setGrowthRate(rate * 100);

    if (onDataChange) {
      onDataChange({
        sample: selectedSample,
        magnification,
        lightIntensity,
        nutrientLevel,
        temperature,
        growthRate: rate * 100,
        cellCount: cells.length
      });
    }
  }, [lightIntensity, nutrientLevel, temperature, cells, magnification, selectedSample]);

  const initializeSample = (sample: string) => {
    const newCells: Cell[] = [];
    const count = 5 + Math.floor(Math.random() * 5);

    for (let i = 0; i < count; i++) {
      newCells.push({
        id: i,
        type: sample,
        x: 150 + Math.random() * 300,
        y: 150 + Math.random() * 200,
        size: 20 + Math.random() * 30,
        stage: 0,
        color: getCellColor(sample)
      });
    }

    setCells(newCells);
    setCellCount(count);
  };

  const getCellColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      "plant-cell": "#22c55e",
      "animal-cell": "#f97316",
      "bacteria": "#8b5cf6",
      "yeast": "#eab308",
      "blood-cell": "#ef4444"
    };
    return colors[type] || "#64748b";
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw microscope view background
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 0.5;
      const gridSize = 50 / (magnification / 40);
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw cells
      cells.forEach((cell) => {
        const scale = magnification / 40;
        const displaySize = cell.size * scale;

        // Cell membrane
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, displaySize, 0, Math.PI * 2);
        ctx.fillStyle = cell.color + "40";
        ctx.fill();
        ctx.strokeStyle = cell.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Nucleus
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, displaySize * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = cell.color + "80";
        ctx.fill();

        // Organelles for plant cells
        if (cell.type === "plant-cell") {
          // Chloroplasts
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const ox = cell.x + Math.cos(angle) * displaySize * 0.6;
            const oy = cell.y + Math.sin(angle) * displaySize * 0.6;
            ctx.beginPath();
            ctx.arc(ox, oy, displaySize * 0.15, 0, Math.PI * 2);
            ctx.fillStyle = "#10b981";
            ctx.fill();
          }

          // Cell wall
          ctx.strokeStyle = "#166534";
          ctx.lineWidth = 3;
          ctx.strokeRect(
            cell.x - displaySize * 1.1,
            cell.y - displaySize * 1.1,
            displaySize * 2.2,
            displaySize * 2.2
          );
        }

        // Mitochondria for animal cells
        if (cell.type === "animal-cell") {
          for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const ox = cell.x + Math.cos(angle) * displaySize * 0.6;
            const oy = cell.y + Math.sin(angle) * displaySize * 0.6;
            ctx.beginPath();
            ctx.ellipse(ox, oy, displaySize * 0.2, displaySize * 0.1, angle, 0, Math.PI * 2);
            ctx.fillStyle = "#dc2626";
            ctx.fill();
          }
        }

        // Cell division stage indicator
        if (cell.stage > 0 && growthRate > 50) {
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cell.x, cell.y, displaySize * 1.2, 0, (cell.stage / 4) * Math.PI * 2);
          ctx.stroke();
        }
      });

      // Light overlay effect
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${(100 - lightIntensity) / 200})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${(100 - lightIntensity) / 100})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cells, magnification, lightIntensity, growthRate]);

  // Cell division simulation
  useEffect(() => {
    if (growthRate < 50) return;

    const divisionInterval = setInterval(() => {
      setCells(prevCells => {
        const updatedCells = prevCells.map(cell => {
          if (Math.random() < growthRate / 1000) {
            return { ...cell, stage: (cell.stage + 1) % 5 };
          }
          return cell;
        });

        // Add new cells occasionally
        if (Math.random() < growthRate / 2000 && updatedCells.length < 20) {
          const parentCell = updatedCells[Math.floor(Math.random() * updatedCells.length)];
          const newCell: Cell = {
            id: Date.now(),
            type: parentCell.type,
            x: parentCell.x + (Math.random() - 0.5) * 60,
            y: parentCell.y + (Math.random() - 0.5) * 60,
            size: parentCell.size * 0.8,
            stage: 0,
            color: parentCell.color
          };
          updatedCells.push(newCell);
          setCellCount(updatedCells.length);
        }

        return updatedCells;
      });
    }, 1000);

    return () => clearInterval(divisionInterval);
  }, [growthRate]);

  const handleAddNutrient = () => {
    setNutrientLevel(prev => Math.min(100, prev + 20));
    if (onAIRequest) {
      onAIRequest(
        { nutrientLevel: nutrientLevel + 20, growthRate, cellCount },
        "Added nutrient solution"
      );
    }
  };

  const handleSampleChange = (value: string) => {
    setSelectedSample(value);
    if (onAIRequest) {
      onAIRequest(
        { sample: value, magnification },
        `Changed sample to ${value}`
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Microscope className="w-5 h-5 text-primary" />
          Virtual Microscope
        </CardTitle>
        <CardDescription>Observe cells and microorganisms in real-time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-secondary/20 to-accent/20">
          <canvas ref={canvasRef} width={600} height={400} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Sample Type</Label>
            <Select value={selectedSample} onValueChange={handleSampleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plant-cell">Plant Cell</SelectItem>
                <SelectItem value="animal-cell">Animal Cell</SelectItem>
                <SelectItem value="bacteria">Bacteria</SelectItem>
                <SelectItem value="yeast">Yeast</SelectItem>
                <SelectItem value="blood-cell">Blood Cell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Magnification: {magnification}x
            </Label>
            <Slider
              value={[magnification]}
              onValueChange={(v) => setMagnification(v[0])}
              min={10}
              max={100}
              step={10}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Light Intensity: {lightIntensity}%
            </Label>
            <Slider
              value={[lightIntensity]}
              onValueChange={(v) => setLightIntensity(v[0])}
              min={0}
              max={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Temperature: {temperature}°C</Label>
            <Slider
              value={[temperature]}
              onValueChange={(v) => setTemperature(v[0])}
              min={10}
              max={45}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Droplet className="w-4 h-4" />
                Nutrient Level: {nutrientLevel}%
              </Label>
            </div>
            <Button size="sm" onClick={handleAddNutrient} disabled={nutrientLevel >= 100}>
              <Plus className="w-4 h-4 mr-1" />
              Add Nutrients
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Cell Count</p>
            <p className="text-lg font-bold text-primary">{cellCount}</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Growth Rate</p>
            <p className="text-lg font-bold text-primary">{growthRate.toFixed(1)}%</p>
          </div>
        </div>

        {growthRate > 70 && (
          <Badge className="w-full justify-center py-2 bg-green-500">
            Optimal Growth Conditions!
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};