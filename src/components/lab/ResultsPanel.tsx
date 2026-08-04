import { AlertTriangle, X, Thermometer, Zap, Eye, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExperimentResult, SafetyWarning } from '@/types/lab';
import { cn } from '@/lib/utils';

interface ResultsPanelProps {
  results: ExperimentResult[];
  safetyWarnings: SafetyWarning[];
  onDismissWarning: (warningId: string) => void;
}

const RESULT_ICONS: Record<string, React.ReactNode> = {
  temperature: <Thermometer className="w-4 h-4" />,
  voltage: <Zap className="w-4 h-4" />,
  observation: <Eye className="w-4 h-4" />,
  measurement: <Activity className="w-4 h-4" />,
  color: <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500" />,
  motion: <Activity className="w-4 h-4" />,
};

const WARNING_STYLES: Record<SafetyWarning['severity'], string> = {
  info: 'border-blue-500/50 bg-blue-500/10',
  warning: 'border-yellow-500/50 bg-yellow-500/10',
  danger: 'border-orange-500/50 bg-orange-500/10',
  critical: 'border-red-500/50 bg-red-500/10 animate-pulse',
};

export function ResultsPanel({ results, safetyWarnings, onDismissWarning }: ResultsPanelProps) {
  const activeWarnings = safetyWarnings.filter(w => w.severity !== 'info');
  const recentResults = results.slice(-10).reverse();

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      {/* Safety Warnings */}
      {activeWarnings.length > 0 && (
        <div className="p-4 border-b border-border space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            Safety Warnings ({activeWarnings.length})
          </h3>
          <ScrollArea className="max-h-40">
            <div className="space-y-2">
              {activeWarnings.map(warning => (
                <Alert
                  key={warning.id}
                  className={cn("py-2", WARNING_STYLES[warning.severity])}
                >
                  <AlertDescription className="flex items-start justify-between gap-2 text-xs">
                    <span>{warning.message}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 shrink-0"
                      onClick={() => onDismissWarning(warning.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Real-time Results */}
      <div className="flex-1 p-4 flex flex-col">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Real-time Results
        </h3>

        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {recentResults.length > 0 ? (
              recentResults.map((result, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 text-primary">
                      {RESULT_ICONS[result.type] || <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {result.type}
                        </Badge>
                        {result.unit && (
                          <span className="text-sm font-mono font-bold">
                            {typeof result.value === 'number' ? result.value.toFixed(2) : result.value}
                            {result.unit}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results yet</p>
                <p className="text-xs">Start experimenting to see real-time data</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Quick Stats */}
      {results.length > 0 && (
        <div className="p-4 border-t border-border">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Session Stats</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold">{results.length}</p>
              <p className="text-[10px] text-muted-foreground">Measurements</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold">{safetyWarnings.length}</p>
              <p className="text-[10px] text-muted-foreground">Warnings</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
