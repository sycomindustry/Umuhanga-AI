import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface PhysicsSimulationProps {
  experimentType: string;
  onDataChange?: (data: any) => void;
  onAIRequest?: (state: any, action: string) => void;
}

export const PhysicsSimulation = ({ experimentType, onDataChange, onAIRequest }: PhysicsSimulationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  
  const [voltage, setVoltage] = useState(5);
  const [resistance, setResistance] = useState(10);
  const [current, setCurrent] = useState(0);
  const [power, setPower] = useState(0);
  const [brightness, setBrightness] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create Matter.js engine and world
    const engine = Matter.Engine.create();
    const world = engine.world;
    world.gravity.y = 0; // No gravity for circuit simulation

    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: 600,
        height: 400,
        wireframes: false,
        background: 'transparent'
      }
    });

    // Create circuit components (visual representation)
    const battery = Matter.Bodies.rectangle(100, 200, 60, 100, {
      isStatic: true,
      render: {
        fillStyle: '#3b82f6',
        strokeStyle: '#1e40af',
        lineWidth: 3
      }
    });

    const bulb = Matter.Bodies.circle(500, 200, 40, {
      isStatic: true,
      render: {
        fillStyle: '#fbbf24',
        strokeStyle: '#f59e0b',
        lineWidth: 3
      }
    });

    const wire1 = Matter.Bodies.rectangle(300, 150, 280, 4, {
      isStatic: true,
      render: { fillStyle: '#64748b' }
    });

    const wire2 = Matter.Bodies.rectangle(300, 250, 280, 4, {
      isStatic: true,
      render: { fillStyle: '#64748b' }
    });

    Matter.Composite.add(world, [battery, bulb, wire1, wire2]);

    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    engineRef.current = engine;
    renderRef.current = render;

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      render.canvas.remove();
    };
  }, []);

  useEffect(() => {
    // Calculate circuit values
    const calc = calculateCircuit(voltage, resistance);
    setCurrent(calc.current);
    setPower(calc.power);
    setBrightness(calc.brightness);

    // Update visual brightness
    if (renderRef.current) {
      const bulb = engineRef.current?.world.bodies.find(b => 
        b.position.x > 450 && b.position.y > 150 && b.position.y < 250
      );
      if (bulb) {
        const intensity = Math.min(255, brightness * 2.55);
        bulb.render.fillStyle = `rgb(${255}, ${255 - (255 - 191) * (1 - brightness / 100)}, ${36 + (255 - 36) * (brightness / 100)})`;
      }
    }

    // Notify parent of data change
    if (onDataChange) {
      onDataChange({
        voltage,
        resistance,
        current: calc.current,
        power: calc.power,
        brightness: calc.brightness
      });
    }
  }, [voltage, resistance, onDataChange, brightness]);

  const calculateCircuit = (v: number, r: number) => {
    const i = r > 0 ? v / r : 0;
    const p = v * i;
    const b = Math.min(100, (p / 10) * 100);
    return { current: i, power: p, brightness: b };
  };

  const handleVoltageChange = (value: number[]) => {
    setVoltage(value[0]);
    if (onAIRequest) {
      onAIRequest(
        { voltage: value[0], resistance, current, power },
        `Changed voltage to ${value[0]}V`
      );
    }
  };

  const handleResistanceChange = (value: number[]) => {
    setResistance(value[0]);
    if (onAIRequest) {
      onAIRequest(
        { voltage, resistance: value[0], current, power },
        `Changed resistance to ${value[0]}Ω`
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Circuit Simulation
        </CardTitle>
        <CardDescription>Adjust voltage and resistance to see real-time changes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-secondary/20 to-accent/20">
          <canvas ref={canvasRef} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Voltage: {voltage}V</Label>
            <Slider
              value={[voltage]}
              onValueChange={handleVoltageChange}
              min={0}
              max={12}
              step={0.5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Resistance: {resistance}Ω</Label>
            <Slider
              value={[resistance]}
              onValueChange={handleResistanceChange}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-lg font-bold text-primary">{current.toFixed(2)} A</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Power</p>
            <p className="text-lg font-bold text-primary">{power.toFixed(2)} W</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Brightness</p>
            <p className="text-lg font-bold text-primary">{brightness.toFixed(0)}%</p>
          </div>
        </div>

        <Badge variant="outline" className="w-full justify-center py-2">
          Formula: V = I × R | P = V × I
        </Badge>
      </CardContent>
    </Card>
  );
};
