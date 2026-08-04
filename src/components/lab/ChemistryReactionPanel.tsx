import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Beaker, 
  Droplets, 
  FlaskConical, 
  TestTube,
  Thermometer,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CHEMICAL_CATALOG, 
  PH_INDICATORS, 
  simulateReaction,
  type ChemicalSubstance,
  type pHIndicator,
  type ReactionResult
} from '@/lib/chemicalReactions';

interface ChemistryReactionPanelProps {
  onReactionResult?: (result: ReactionResult) => void;
  isRunning: boolean;
}

interface MixtureComponent {
  substance: ChemicalSubstance;
  volumeMl: number;
}

// Convert catalog to array for easier mapping
const SUBSTANCES_ARRAY = Object.values(CHEMICAL_CATALOG);
const INDICATORS_ARRAY = Object.values(PH_INDICATORS);

export function ChemistryReactionPanel({ onReactionResult, isRunning }: ChemistryReactionPanelProps) {
  const [mixture, setMixture] = useState<MixtureComponent[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<pHIndicator | null>(null);
  const [reactionResult, setReactionResult] = useState<ReactionResult | null>(null);
  const [temperature, setTemperature] = useState(25);
  const [addAmount, setAddAmount] = useState(10);

  const calculateMixture = useCallback(() => {
    if (mixture.length === 0) return null;

    // Calculate total volume and pH
    const totalVolume = mixture.reduce((sum, m) => sum + m.volumeMl, 0);
    
    // Weighted average pH calculation (simplified)
    let totalH = 0;
    mixture.forEach(m => {
      const ph = m.substance.pH ?? 7;
      const h = Math.pow(10, -ph);
      totalH += h * m.volumeMl;
    });
    const avgH = totalH / totalVolume;
    const resultPH = -Math.log10(avgH);

    // Check for reactions between components
    const acids = mixture.filter(m => m.substance.type === 'acid');
    const bases = mixture.filter(m => m.substance.type === 'base');
    
    let result: ReactionResult | null = null;
    
    if (acids.length > 0 && bases.length > 0) {
      result = simulateReaction(acids[0].substance.id, bases[0].substance.id, resultPH, temperature, selectedIndicator?.id);
    }

    return { pH: Math.max(0, Math.min(14, resultPH)), totalVolume, result };
  }, [mixture, temperature, selectedIndicator]);

  const addSubstance = (substance: ChemicalSubstance) => {
    if (!isRunning) return;
    
    const existing = mixture.find(m => m.substance.id === substance.id);
    if (existing) {
      setMixture(mixture.map(m => 
        m.substance.id === substance.id 
          ? { ...m, volumeMl: m.volumeMl + addAmount }
          : m
      ));
    } else {
      setMixture([...mixture, { substance, volumeMl: addAmount }]);
    }
  };

  const mixResult = calculateMixture();
  const currentPH = mixResult?.pH ?? 7;
  
  // Get indicator color based on pH
  const getIndicatorColor = () => {
    if (!selectedIndicator) return null;
    const range = selectedIndicator.colorRanges.find(r => 
      currentPH >= r.minPH && currentPH <= r.maxPH
    );
    return range?.color ?? selectedIndicator.colorRanges[0].color;
  };

  const indicatorColor = getIndicatorColor();

  const getPHColor = (pH: number) => {
    if (pH < 3) return 'hsl(0, 85%, 50%)'; // Red
    if (pH < 5) return 'hsl(25, 90%, 55%)'; // Orange
    if (pH < 6) return 'hsl(45, 95%, 50%)'; // Yellow
    if (pH < 8) return 'hsl(120, 60%, 45%)'; // Green
    if (pH < 10) return 'hsl(200, 70%, 50%)'; // Blue
    if (pH < 12) return 'hsl(270, 60%, 55%)'; // Purple
    return 'hsl(290, 70%, 40%)'; // Deep purple
  };

  const clearMixture = () => {
    setMixture([]);
    setSelectedIndicator(null);
    setReactionResult(null);
  };

  const runReaction = () => {
    if (mixResult?.result) {
      setReactionResult(mixResult.result);
      onReactionResult?.(mixResult.result);
    }
  };

  // Group substances by type
  const acids = SUBSTANCES_ARRAY.filter(s => s.type === 'acid');
  const bases = SUBSTANCES_ARRAY.filter(s => s.type === 'base');
  const salts = SUBSTANCES_ARRAY.filter(s => s.type === 'salt');

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-primary" />
          Chemistry Reactions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col gap-3">
        {/* Beaker Visualization */}
        <div className="relative h-40 bg-gradient-to-b from-muted/30 to-muted/60 rounded-lg overflow-hidden border border-border">
          {/* Liquid level */}
          {mixture.length > 0 && (
            <div 
              className="absolute bottom-0 left-4 right-4 transition-all duration-500 rounded-t-sm"
              style={{ 
                height: `${Math.min(90, (mixResult?.totalVolume || 0) / 2)}%`,
                backgroundColor: indicatorColor || getPHColor(currentPH),
                boxShadow: 'inset 0 -5px 15px rgba(0,0,0,0.1)'
              }}
            >
              {/* Bubbles for reaction */}
              {reactionResult?.observableChanges?.gasEvolution && (
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute w-2 h-2 bg-white/40 rounded-full animate-bounce"
                      style={{ 
                        left: `${10 + i * 12}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: `${0.5 + Math.random() * 0.5}s`
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* Precipitate */}
              {reactionResult?.observableChanges?.precipitate && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-4 rounded-t-sm" 
                  style={{ backgroundColor: reactionResult.observableChanges.precipitate.color }}
                />
              )}
            </div>
          )}
          
          {/* Beaker outline */}
          <div className="absolute inset-4 border-2 border-muted-foreground/30 rounded-b-lg border-t-0" />
          
          {/* pH indicator */}
          <div className="absolute top-2 right-2 px-2 py-1 bg-background/80 rounded text-xs font-mono">
            pH: <span style={{ color: getPHColor(currentPH) }}>{currentPH.toFixed(1)}</span>
          </div>
          
          {/* Temperature */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-background/80 rounded text-xs font-mono flex items-center gap-1">
            <Thermometer className="w-3 h-3" />
            {temperature}°C
          </div>
        </div>

        {/* Current Mixture */}
        {mixture.length > 0 && (
          <div className="p-2 bg-muted/30 rounded-lg">
            <p className="text-xs font-medium mb-1 flex items-center gap-1">
              <TestTube className="w-3 h-3" />
              Current Mixture ({mixResult?.totalVolume}mL)
            </p>
            <div className="flex flex-wrap gap-1">
              {mixture.map(m => (
                <Badge 
                  key={m.substance.id} 
                  variant="secondary" 
                  className="text-xs"
                  style={{ borderLeftColor: m.substance.color, borderLeftWidth: 3 }}
                >
                  {m.substance.formula}: {m.volumeMl}mL
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Reaction Result */}
        {reactionResult && (
          <div className={cn(
            "p-2 rounded-lg border",
            reactionResult.isExothermic ? "bg-orange-500/10 border-orange-500/30" : "bg-blue-500/10 border-blue-500/30"
          )}>
            <p className="text-xs font-medium mb-1">Reaction Result</p>
            <p className="text-xs text-muted-foreground">{reactionResult.equation}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {reactionResult.products.map((p, i) => (
                <Badge key={i} variant="outline" className="text-xs">{p.substance.formula}</Badge>
              ))}
            </div>
            {reactionResult.observableChanges?.precipitate && (
              <p className="text-xs text-muted-foreground mt-1">
                ⬇️ Precipitate: {reactionResult.observableChanges.precipitate.compound}
              </p>
            )}
            {reactionResult.observableChanges?.gasEvolution && (
              <p className="text-xs text-muted-foreground">
                💨 Gas evolved: {reactionResult.observableChanges.gasEvolution.gas}
              </p>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs">Add:</span>
            <Slider 
              value={[addAmount]} 
              onValueChange={([v]) => setAddAmount(v)}
              min={5}
              max={50}
              step={5}
              className="flex-1"
              disabled={!isRunning}
            />
            <span className="text-xs w-10">{addAmount}mL</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs">Temp:</span>
            <Slider 
              value={[temperature]} 
              onValueChange={([v]) => setTemperature(v)}
              min={0}
              max={100}
              className="flex-1"
              disabled={!isRunning}
            />
            <span className="text-xs w-10">{temperature}°C</span>
          </div>
        </div>

        {/* Substances */}
        <ScrollArea className="flex-1">
          <div className="space-y-3">
            {/* Acids */}
            <div>
              <p className="text-xs font-medium text-destructive mb-1">Acids</p>
              <div className="grid grid-cols-2 gap-1">
                {acids.map(s => (
                  <Button
                    key={s.id}
                    size="sm"
                    variant="outline"
                    onClick={() => addSubstance(s)}
                    disabled={!isRunning}
                    className="text-xs h-7 justify-start"
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-1" 
                      style={{ backgroundColor: s.color === 'colorless' ? '#e0e0e0' : s.color }}
                    />
                    {s.formula}
                  </Button>
                ))}
              </div>
            </div>

            {/* Bases */}
            <div>
              <p className="text-xs font-medium text-blue-500 mb-1">Bases</p>
              <div className="grid grid-cols-2 gap-1">
                {bases.map(s => (
                  <Button
                    key={s.id}
                    size="sm"
                    variant="outline"
                    onClick={() => addSubstance(s)}
                    disabled={!isRunning}
                    className="text-xs h-7 justify-start"
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-1" 
                      style={{ backgroundColor: s.color === 'colorless' ? '#e0e0e0' : s.color }}
                    />
                    {s.formula}
                  </Button>
                ))}
              </div>
            </div>

            {/* Salts */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Salts</p>
              <div className="grid grid-cols-2 gap-1">
                {salts.slice(0, 4).map(s => (
                  <Button
                    key={s.id}
                    size="sm"
                    variant="outline"
                    onClick={() => addSubstance(s)}
                    disabled={!isRunning}
                    className="text-xs h-7 justify-start"
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-1" 
                      style={{ backgroundColor: s.color === 'colorless' ? '#e0e0e0' : s.color }}
                    />
                    {s.formula}
                  </Button>
                ))}
              </div>
            </div>

            {/* Indicators */}
            <div>
              <p className="text-xs font-medium text-pink-500 mb-1">pH Indicators</p>
              <div className="grid grid-cols-2 gap-1">
                {INDICATORS_ARRAY.map(ind => (
                  <Button
                    key={ind.id}
                    size="sm"
                    variant={selectedIndicator?.id === ind.id ? "default" : "outline"}
                    onClick={() => setSelectedIndicator(
                      selectedIndicator?.id === ind.id ? null : ind
                    )}
                    disabled={!isRunning}
                    className="text-xs h-7 justify-start"
                  >
                    <Droplets className="w-3 h-3 mr-1" />
                    {ind.name.split(' ')[0]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={runReaction}
            disabled={!isRunning || mixture.length < 2}
            className="flex-1"
          >
            <Activity className="w-3 h-3 mr-1" />
            React
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={clearMixture}
            disabled={!isRunning}
            className="flex-1"
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
