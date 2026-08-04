import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Beaker, Flame, Droplets, TestTube } from "lucide-react";

interface Chemical {
  id: string;
  name: string;
  color: string;
  amount: number;
  type: 'acid' | 'base' | 'neutral' | 'indicator' | 'salt';
  ph: number;
}

interface ChemistrySimulationProps {
  experimentType: string;
  onDataChange?: (data: any) => void;
  onAIRequest?: (state: any, action: string) => void;
}

const AVAILABLE_CHEMICALS: Chemical[] = [
  { id: 'hcl', name: 'HCl (Hydrochloric Acid)', color: '#fbbf24', amount: 0, type: 'acid', ph: 1 },
  { id: 'h2so4', name: 'H₂SO₄ (Sulfuric Acid)', color: '#f97316', amount: 0, type: 'acid', ph: 0.5 },
  { id: 'naoh', name: 'NaOH (Sodium Hydroxide)', color: '#3b82f6', amount: 0, type: 'base', ph: 14 },
  { id: 'koh', name: 'KOH (Potassium Hydroxide)', color: '#2563eb', amount: 0, type: 'base', ph: 13.5 },
  { id: 'nacl', name: 'NaCl (Salt)', color: '#e5e7eb', amount: 0, type: 'salt', ph: 7 },
  { id: 'cuso4', name: 'CuSO₄ (Copper Sulfate)', color: '#06b6d4', amount: 0, type: 'salt', ph: 5 },
  { id: 'water', name: 'H₂O (Water)', color: '#60a5fa', amount: 0, type: 'neutral', ph: 7 },
  { id: 'phenol', name: 'Phenolphthalein', color: '#ec4899', amount: 0, type: 'indicator', ph: 7 }
];

export const ChemistrySimulation = ({ experimentType, onDataChange, onAIRequest }: ChemistrySimulationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [mixture, setMixture] = useState<Chemical[]>([]);
  const [bubbles, setBubbles] = useState<Array<{x: number, y: number, size: number, speed: number}>>([]);
  const [reactionOccurring, setReactionOccurring] = useState(false);
  const [ph, setPh] = useState(7);
  const [temperature, setTemperature] = useState(25);
  const [color, setColor] = useState('#60a5fa');
  const [heating, setHeating] = useState(false);
  const [stirring, setStirring] = useState(false);
  const [reactionRate, setReactionRate] = useState(0);
  const [precipitate, setPrecipitate] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const beakerX = 100;
      const beakerY = 50;
      const beakerWidth = 200;
      const beakerHeight = 300;

      // Draw beaker
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(beakerX, beakerY);
      ctx.lineTo(beakerX, beakerY + beakerHeight);
      ctx.lineTo(beakerX + beakerWidth, beakerY + beakerHeight);
      ctx.lineTo(beakerX + beakerWidth, beakerY);
      ctx.stroke();

      // Draw measurement lines
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = beakerY + beakerHeight - (i * 50);
        ctx.beginPath();
        ctx.moveTo(beakerX, y);
        ctx.lineTo(beakerX - 10, y);
        ctx.stroke();
        ctx.fillStyle = "#64748b";
        ctx.font = "12px Arial";
        ctx.fillText(`${i * 20}mL`, beakerX - 50, y + 5);
      }

      // Draw liquid level
      const totalAmount = mixture.reduce((sum, c) => sum + c.amount, 0);
      const liquidHeight = Math.min(280, totalAmount * 2.8);
      if (liquidHeight > 0) {
        ctx.fillStyle = color;
        ctx.fillRect(beakerX + 10, beakerY + beakerHeight - liquidHeight - 10, beakerWidth - 20, liquidHeight);

        // Draw precipitate if present
        if (precipitate) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          for (let i = 0; i < 20; i++) {
            const px = beakerX + 10 + Math.random() * (beakerWidth - 20);
            const py = beakerY + beakerHeight - 15 - Math.random() * 30;
            ctx.fillRect(px, py, 3, 3);
          }
        }

        // Draw stirring rod if active
        if (stirring) {
          const rodX = beakerX + beakerWidth / 2;
          const rodY = beakerY + 50;
          const rodLength = 200;
          const angle = (Date.now() / 200) % (Math.PI * 2);
          
          ctx.save();
          ctx.translate(rodX, rodY);
          ctx.rotate(angle);
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, rodLength);
          ctx.stroke();
          ctx.restore();
        }

        // Draw heating indicator
        if (heating) {
          const flameColors = ["#ef4444", "#f97316", "#fbbf24"];
          for (let i = 0; i < 5; i++) {
            const fx = beakerX + beakerWidth / 2 - 30 + i * 15;
            const fy = beakerY + beakerHeight + 10;
            const flameHeight = 20 + Math.sin((Date.now() / 100) + i) * 10;
            
            ctx.fillStyle = flameColors[i % 3] + "80";
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx - 5, fy + flameHeight);
            ctx.lineTo(fx + 5, fy + flameHeight);
            ctx.closePath();
            ctx.fill();
          }
        }

        // Draw bubbles
        bubbles.forEach((bubble) => {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`;
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
          ctx.fill();

          bubble.y -= bubble.speed;
          if (bubble.y < beakerY + beakerHeight - liquidHeight) {
            bubble.y = beakerY + beakerHeight - 15;
            bubble.x = beakerX + 20 + Math.random() * (beakerWidth - 40);
          }
        });
      }

      // Draw test tubes on the side
      for (let i = 0; i < 3; i++) {
        const tubeX = 400;
        const tubeY = 100 + i * 100;
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tubeX, tubeY);
        ctx.lineTo(tubeX, tubeY + 80);
        ctx.lineTo(tubeX + 30, tubeY + 80);
        ctx.lineTo(tubeX + 30, tubeY);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mixture, bubbles, color, heating, stirring, precipitate]);

  useEffect(() => {
    if (mixture.length === 0) return;
    calculateReaction();
  }, [mixture, heating, stirring]);

  const calculateReaction = () => {
    const totalAmount = mixture.reduce((sum, c) => sum + c.amount, 0);
    if (totalAmount === 0) return;

    // Calculate average pH
    const avgPh = mixture.reduce((sum, c) => sum + c.ph * c.amount, 0) / totalAmount;
    setPh(avgPh);

    // Mix colors
    let r = 0, g = 0, b = 0;
    mixture.forEach((chem) => {
      const weight = chem.amount / totalAmount;
      const rgb = hexToRgb(chem.color);
      r += rgb.r * weight;
      g += rgb.g * weight;
      b += rgb.b * weight;
    });
    const mixedColor = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    setColor(mixedColor);

    // Determine if reaction is occurring
    const hasAcid = mixture.some(c => c.type === "acid" && c.amount > 0);
    const hasBase = mixture.some(c => c.type === "base" && c.amount > 0);
    const hasSalt = mixture.some(c => c.type === "salt" && c.amount > 0);
    const reacting = hasAcid && hasBase;
    setReactionOccurring(reacting);

    // Check for precipitate formation (salt + water)
    if (hasSalt && reacting) {
      setPrecipitate(true);
    } else {
      setPrecipitate(false);
    }

    // Calculate reaction rate
    let rate = 0;
    if (reacting) {
      rate = Math.min(100, totalAmount * 20);
      if (heating) rate *= 1.5;
      if (stirring) rate *= 1.2;
    }
    setReactionRate(Math.min(100, rate));

    // Update temperature
    let newTemp = 25;
    if (reacting) {
      newTemp = 25 + (totalAmount * 5);
    }
    if (heating) {
      newTemp += 30;
    }
    setTemperature(Math.min(100, newTemp));

    // Generate bubbles
    if (reacting && bubbles.length < 30) {
      setBubbles((prev) => [
        ...prev,
        ...Array.from({ length: 5 }, () => ({
          x: 120 + Math.random() * 160,
          y: 340,
          size: 2 + Math.random() * 4,
          speed: 0.5 + Math.random() * 1.5,
        })),
      ]);
    } else if (!reacting) {
      setBubbles([]);
    }

    if (onDataChange) {
      onDataChange({
        mixture,
        ph: avgPh,
        temperature: Math.min(100, newTemp),
        color: mixedColor,
        reactionOccurring: reacting,
        reactionRate: Math.min(100, rate),
        heating,
        stirring,
        precipitate
      });
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 96, g: 165, b: 250 };
  };

  const addChemical = (chemical: Chemical, amount: number) => {
    const existingIndex = mixture.findIndex((c) => c.id === chemical.id);

    if (existingIndex >= 0) {
      const newMixture = [...mixture];
      newMixture[existingIndex] = {
        ...newMixture[existingIndex],
        amount: newMixture[existingIndex].amount + amount,
      };
      setMixture(newMixture);
    } else {
      setMixture([...mixture, { ...chemical, amount }]);
    }

    if (onAIRequest) {
      onAIRequest(
        { mixture: [...mixture, { ...chemical, amount }], ph },
        `Added ${amount}mL of ${chemical.name}`
      );
    }
  };

  const clearBeaker = () => {
    setMixture([]);
    setBubbles([]);
    setReactionOccurring(false);
    setPh(7);
    setTemperature(25);
    setColor("#60a5fa");
    setHeating(false);
    setStirring(false);
    setReactionRate(0);
    setPrecipitate(false);
    
    if (onAIRequest) {
      onAIRequest({ action: "clear" }, "Cleared the beaker");
    }
  };

  const toggleHeating = () => {
    setHeating(!heating);
    if (onAIRequest) {
      onAIRequest({ heating: !heating, temperature }, !heating ? "Started heating" : "Stopped heating");
    }
  };

  const toggleStirring = () => {
    setStirring(!stirring);
    if (onAIRequest) {
      onAIRequest({ stirring: !stirring }, !stirring ? "Started stirring" : "Stopped stirring");
    }
  };

  const getPhColor = (ph: number) => {
    if (ph < 3) return "#ef4444";
    if (ph < 6) return "#f97316";
    if (ph < 8) return "#22c55e";
    if (ph < 11) return "#3b82f6";
    return "#a855f7";
  };

  const getTempColor = (temp: number) => {
    if (temp < 30) return "#3b82f6";
    if (temp < 50) return "#22c55e";
    if (temp < 70) return "#f97316";
    return "#ef4444";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Beaker className="w-5 h-5 text-primary" />
          Interactive Chemistry Lab
        </CardTitle>
        <CardDescription>Mix chemicals, heat, stir, and observe real-time reactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-secondary/20 to-accent/20">
          <canvas ref={canvasRef} width={600} height={400} />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">pH</p>
            <p className="text-lg font-bold" style={{ color: getPhColor(ph) }}>
              {ph.toFixed(1)}
            </p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Temp</p>
            <p className="text-lg font-bold" style={{ color: getTempColor(temperature) }}>
              {temperature.toFixed(0)}°C
            </p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Rate</p>
            <p className="text-lg font-bold text-primary">
              {reactionRate.toFixed(0)}%
            </p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-xs font-bold text-primary">
              {precipitate ? "Precipitate" : reactionOccurring ? "Reacting" : "Stable"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={heating ? "default" : "outline"}
            onClick={toggleHeating}
            className="w-full"
          >
            <Flame className="w-4 h-4 mr-1" />
            {heating ? "Stop" : "Heat"}
          </Button>
          <Button
            variant={stirring ? "default" : "outline"}
            onClick={toggleStirring}
            className="w-full"
          >
            <Droplets className="w-4 h-4 mr-1" />
            {stirring ? "Stop" : "Stir"}
          </Button>
          <Button
            variant="outline"
            onClick={clearBeaker}
            className="w-full"
          >
            🧹 Clear
          </Button>
        </div>

        {mixture.length > 0 && (
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1">
              <TestTube className="w-3 h-3" />
              Current Mixture:
            </p>
            <div className="flex flex-wrap gap-2">
              {mixture.map((chem) => (
                <Badge key={chem.id} variant="outline">
                  {chem.name}: {chem.amount}mL
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Add Chemicals (10mL each)</h4>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_CHEMICALS.map((chemical) => (
              <Button
                key={chemical.id}
                variant="outline"
                size="sm"
                onClick={() => addChemical(chemical, 10)}
                className="justify-start text-xs h-auto py-2"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                  style={{ backgroundColor: chemical.color }}
                />
                <span className="truncate">{chemical.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {reactionOccurring && (
          <Badge className="w-full justify-center py-2 bg-green-500 animate-pulse">
            ⚗️ Reaction in Progress!
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};