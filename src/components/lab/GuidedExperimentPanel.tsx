import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  PlayCircle,
  AlertTriangle,
  HelpCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GUIDED_EXPERIMENTS } from '@/lib/guidedExperiments';
import { LabType, GuidedExperiment, ExperimentStep } from '@/types/lab';

interface GuidedExperimentPanelProps {
  labType: LabType;
  onStepAction?: (step: ExperimentStep, action: string) => void;
  placedEquipment?: string[];
  currentState?: Record<string, any>;
  isRunning: boolean;
}

interface StepValidation {
  isValid: boolean;
  message: string;
}

export function GuidedExperimentPanel({ 
  labType, 
  onStepAction,
  placedEquipment = [],
  currentState = {},
  isRunning
}: GuidedExperimentPanelProps) {
  const [selectedExperiment, setSelectedExperiment] = useState<GuidedExperiment | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepValidations, setStepValidations] = useState<Map<number, StepValidation>>(new Map());
  const [showHint, setShowHint] = useState(false);
  const [experimentComplete, setExperimentComplete] = useState(false);

  // Filter experiments by lab type
  const availableExperiments = GUIDED_EXPERIMENTS.filter(exp => exp.labType === labType);

  const currentStep = selectedExperiment?.steps[currentStepIndex];
  const progress = selectedExperiment 
    ? (completedSteps.size / selectedExperiment.steps.length) * 100 
    : 0;

  // Validate current step based on criteria
  const validateStep = useCallback((step: ExperimentStep): StepValidation => {
    if (!step.validationCriteria) {
      return { isValid: true, message: 'No validation required' };
    }

    const criteria = step.validationCriteria;
    const parts = criteria.split(':');
    const validationType = parts[0];

    switch (validationType) {
      case 'equipment_placed':
        const equipmentId = parts[1];
        if (!placedEquipment.includes(equipmentId)) {
          return { 
            isValid: false, 
            message: `Please place ${equipmentId.replace(/_/g, ' ')} on the lab bench` 
          };
        }
        break;
      case 'equipment_connected':
        if (!currentState.connections?.length) {
          return { 
            isValid: false, 
            message: `Connect the required equipment` 
          };
        }
        break;
      case 'safety_equipped':
        const items = parts[1]?.split(',') || [];
        const safetyEquipped = currentState.safetyEquipped || {};
        const missingItems = items.filter((item: string) => !safetyEquipped[item]);
        if (missingItems.length > 0) {
          return { 
            isValid: false, 
            message: `Please equip: ${missingItems.join(', ')}` 
          };
        }
        break;
      case 'zoom_set':
        const targetZoom = parseInt(parts[2] || '0');
        if (currentState.zoomLevel !== targetZoom) {
          return { 
            isValid: false, 
            message: `Set magnification to ${targetZoom}x` 
          };
        }
        break;
      case 'circuit_complete':
        if (!currentState.circuitComplete) {
          return { 
            isValid: false, 
            message: `Complete the circuit connection` 
          };
        }
        break;
      default:
        // For manual validation, allow proceeding
        return { isValid: true, message: 'Ready to proceed' };
    }

    return { isValid: true, message: 'Step completed!' };
  }, [placedEquipment, currentState]);

  // Auto-validate when state changes
  useEffect(() => {
    if (currentStep) {
      const validation = validateStep(currentStep);
      setStepValidations(prev => new Map(prev).set(currentStepIndex, validation));
    }
  }, [currentStep, currentStepIndex, validateStep]);

  const completeCurrentStep = () => {
    if (!currentStep) return;
    
    setCompletedSteps(prev => new Set([...prev, currentStepIndex]));
    
    if (selectedExperiment && currentStepIndex < selectedExperiment.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setShowHint(false);
    } else {
      setExperimentComplete(true);
    }
  };

  const goToStep = (index: number) => {
    if (index <= Math.max(...Array.from(completedSteps), currentStepIndex)) {
      setCurrentStepIndex(index);
      setShowHint(false);
    }
  };

  const resetExperiment = () => {
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setStepValidations(new Map());
    setShowHint(false);
    setExperimentComplete(false);
  };

  const startExperiment = (experiment: GuidedExperiment) => {
    setSelectedExperiment(experiment);
    resetExperiment();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-700';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-700';
      case 'advanced': return 'bg-red-500/20 text-red-700';
      default: return '';
    }
  };

  if (!selectedExperiment) {
    return (
      <Card className="h-full overflow-hidden flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Guided Experiments
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {availableExperiments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No experiments available for this lab type
                </p>
              ) : (
                availableExperiments.map(exp => (
                  <button
                    key={exp.id}
                    onClick={() => startExperiment(exp)}
                    className="w-full p-3 text-left rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{exp.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {exp.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={cn("text-xs", getDifficultyColor(exp.difficulty))}>
                          {exp.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {exp.estimatedTime} min
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {exp.steps.length} steps
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  if (experimentComplete) {
    return (
      <Card className="h-full overflow-hidden flex flex-col">
        <CardContent className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-center">Experiment Complete!</h3>
          <p className="text-sm text-muted-foreground text-center">
            You successfully completed: {selectedExperiment.title}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={resetExperiment}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Restart
            </Button>
            <Button size="sm" onClick={() => setSelectedExperiment(null)}>
              New Experiment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            {selectedExperiment.title}
          </CardTitle>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setSelectedExperiment(null)}
            className="h-6 px-2 text-xs"
          >
            Exit
          </Button>
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{completedSteps.size}/{selectedExperiment.steps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden flex flex-col gap-3">
        {/* Step Navigator */}
        <ScrollArea className="max-h-24">
          <div className="flex gap-1 pb-2">
            {selectedExperiment.steps.map((step, index) => {
              const isComplete = completedSteps.has(index);
              const isCurrent = index === currentStepIndex;
              const isAccessible = index <= Math.max(...Array.from(completedSteps), currentStepIndex);
              
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  disabled={!isAccessible}
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                    isComplete && "bg-green-500 border-green-500 text-white",
                    isCurrent && !isComplete && "border-primary bg-primary/10",
                    !isComplete && !isCurrent && isAccessible && "border-muted-foreground/30",
                    !isAccessible && "border-muted opacity-50"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Current Step Details */}
        {currentStep && (
          <div className="flex-1 overflow-auto">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                    {currentStepIndex + 1}
                  </span>
                  Step {currentStepIndex + 1}
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  {currentStep.instruction}
                </p>
              </div>

              {/* Expected Action */}
              {currentStep.expectedAction && (
                <div className="p-2 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    Expected Action
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentStep.expectedAction.type}: {currentStep.expectedAction.equipmentId || 'any'}
                  </p>
                </div>
              )}

              {/* Validation Feedback */}
              {stepValidations.has(currentStepIndex) && (
                <div className={cn(
                  "p-2 rounded-lg border",
                  stepValidations.get(currentStepIndex)?.isValid 
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-yellow-500/10 border-yellow-500/30"
                )}>
                  <p className="text-xs flex items-center gap-1">
                    {stepValidations.get(currentStepIndex)?.isValid ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                    )}
                    {stepValidations.get(currentStepIndex)?.message}
                  </p>
                </div>
              )}

              {/* Hint */}
              {currentStep.hint && showHint && (
                <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-blue-500" />
                    <span className="font-medium">Hint:</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentStep.hint}
                  </p>
                </div>
              )}

              {/* Voice Guidance */}
              {currentStep.voiceGuidance && (
                <div className="p-2 bg-muted/30 rounded-lg">
                  <p className="text-xs italic text-muted-foreground">
                    "{currentStep.voiceGuidance}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {currentStep?.hint && !showHint && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowHint(true)}
              className="flex-1"
            >
              <HelpCircle className="w-3 h-3 mr-1" />
              Hint
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={completeCurrentStep}
            disabled={!isRunning}
            className="flex-1"
          >
            <PlayCircle className="w-3 h-3 mr-1" />
            {currentStepIndex < selectedExperiment.steps.length - 1 ? 'Next Step' : 'Complete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
