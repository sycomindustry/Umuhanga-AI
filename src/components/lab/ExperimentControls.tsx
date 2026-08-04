import { Play, Pause, RotateCcw, Undo2, Link, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ExperimentControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onUndo: () => void;
  onConnect: () => void;
  onDelete: () => void;
  selectedItem: boolean;
  isConnecting: boolean;
  historyLength: number;
}

export function ExperimentControls({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onReset,
  onUndo,
  onConnect,
  onDelete,
  selectedItem,
  isConnecting,
  historyLength,
}: ExperimentControlsProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
      {/* Playback controls */}
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {!isRunning ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" onClick={onStart} className="gap-1">
                  <Play className="w-4 h-4" />
                  Start
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start the experiment</TooltipContent>
            </Tooltip>
          ) : isPaused ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" onClick={onResume} variant="secondary" className="gap-1">
                  <Play className="w-4 h-4" />
                  Resume
                </Button>
              </TooltipTrigger>
              <TooltipContent>Resume the experiment</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" onClick={onPause} variant="secondary" className="gap-1">
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pause the experiment</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={onReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset experiment</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Edit controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={onUndo}
                disabled={historyLength === 0}
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo last action</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={isConnecting ? "default" : "outline"}
                onClick={onConnect}
                disabled={!selectedItem && !isConnecting}
              >
                <Link className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Connect equipment</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                onClick={onDelete}
                disabled={!selectedItem}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete selected</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Status */}
        <div className="flex items-center gap-2">
          <Badge variant={isRunning ? (isPaused ? "secondary" : "default") : "outline"}>
            {isRunning ? (isPaused ? "Paused" : "Running") : "Ready"}
          </Badge>
        </div>
      </TooltipProvider>
    </div>
  );
}
