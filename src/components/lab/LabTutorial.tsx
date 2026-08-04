import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Lightbulb,
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  Play,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLabSounds } from "@/hooks/useLabSounds";

export interface TutorialStep {
  id: string;
  title: string;
  instruction: string;
  hint?: string;
  highlight?: string; // Element to highlight
  action?: string; // Expected user action
  voiceText?: string;
  icon?: React.ReactNode;
}

interface LabTutorialProps {
  labType: "chemistry" | "biology" | "physics";
  onClose: () => void;
  onStepComplete?: (stepId: string) => void;
  currentAction?: string; // Track user actions
}

// Tutorial content for each lab type
const TUTORIALS: Record<string, TutorialStep[]> = {
  chemistry: [
    {
      id: "welcome",
      title: "Welcome to the Chemistry Lab! 🧪",
      instruction: "This tutorial will guide you through your first chemical experiment safely. Let's learn how to mix chemicals and observe reactions!",
      voiceText: "Welcome to the virtual chemistry laboratory. Safety first!",
    },
    {
      id: "safety_gear",
      title: "Step 1: Safety Equipment",
      instruction: "Before handling any chemicals, you MUST put on safety equipment. Click on the safety goggles, gloves, and lab coat to equip them.",
      hint: "Look for the safety panel on the left side. Click each item to equip it.",
      highlight: "safety-panel",
      action: "equip_safety",
      voiceText: "Always wear protective equipment when handling chemicals.",
    },
    {
      id: "select_chemical_1",
      title: "Step 2: Select First Chemical",
      instruction: "Now let's select our first chemical. Click on 'Water (H₂O)' from the chemical selection panel.",
      hint: "Find the Chemical 1 dropdown and select Water.",
      highlight: "chemical-1-select",
      action: "select_chemical",
      voiceText: "Select water as your first chemical.",
    },
    {
      id: "add_chemical_1",
      title: "Step 3: Add First Chemical",
      instruction: "Click the 'Add 10mL' button to add water to the beaker. Watch the liquid level rise!",
      hint: "The Add button is below the chemical dropdown.",
      highlight: "add-button-1",
      action: "add_chemical",
      voiceText: "Add 10 milliliters of water to the beaker.",
    },
    {
      id: "select_chemical_2",
      title: "Step 4: Select Second Chemical",
      instruction: "Now select your second chemical. Try 'Sodium Bicarbonate (Baking Soda)' for a safe reaction.",
      hint: "Use the Chemical 2 dropdown to select baking soda.",
      highlight: "chemical-2-select",
      action: "select_chemical",
      voiceText: "Now select baking soda as your second chemical.",
    },
    {
      id: "add_chemical_2",
      title: "Step 5: Mix Chemicals",
      instruction: "Add the second chemical to trigger a reaction. Watch for bubbles, color changes, or other effects!",
      hint: "Click Add 10mL for the second chemical.",
      highlight: "add-button-2",
      action: "add_chemical",
      voiceText: "Add the second chemical and observe the reaction.",
    },
    {
      id: "observe",
      title: "Step 6: Observe Results",
      instruction: "Look at the Results Panel on the right to see pH changes, temperature, and reaction observations. Record what you see!",
      hint: "The results panel shows real-time measurements.",
      highlight: "results-panel",
      voiceText: "Observe the reaction results and note any changes.",
    },
    {
      id: "complete",
      title: "🎉 Congratulations!",
      instruction: "You've completed your first chemistry experiment! Try mixing different chemicals to discover new reactions. Remember: always wear safety gear!",
      voiceText: "Excellent work! You're ready to explore more reactions.",
    },
  ],
  biology: [
    {
      id: "welcome",
      title: "Welcome to the Biology Lab! 🔬",
      instruction: "This tutorial will teach you how to prepare slides and use a microscope to observe cells. Let's explore the microscopic world!",
      voiceText: "Welcome to the biology laboratory. Let's explore cells!",
    },
    {
      id: "clean_slide",
      title: "Step 1: Clean the Slide",
      instruction: "A clean slide is essential for clear observation. Click 'Clean glass slide' in the Slide Preparation panel.",
      hint: "Always clean your slide before adding a specimen.",
      highlight: "slide-prep",
      action: "clean_slide",
      voiceText: "First, clean the glass slide thoroughly.",
    },
    {
      id: "add_specimen",
      title: "Step 2: Add Specimen",
      instruction: "Now place your specimen on the slide. Click 'Place specimen' to add a sample to your slide.",
      hint: "The specimen can only be added after cleaning the slide.",
      highlight: "add-specimen",
      action: "add_specimen",
      voiceText: "Place your specimen on the clean slide.",
    },
    {
      id: "cover_slip",
      title: "Step 3: Add Cover Slip",
      instruction: "Cover the specimen with a cover slip to flatten it and prevent drying. Click 'Add cover slip'.",
      hint: "The cover slip protects both the specimen and the microscope lens.",
      highlight: "cover-slip",
      action: "add_coverslip",
      voiceText: "Carefully add the cover slip over the specimen.",
    },
    {
      id: "select_specimen",
      title: "Step 4: Choose Specimen Type",
      instruction: "Select what type of cell you want to view. Choose between Plant or Animal cells.",
      hint: "Each cell type has different visible structures.",
      highlight: "cell-type",
      action: "select_cell_type",
      voiceText: "Select the type of cell you want to observe.",
    },
    {
      id: "adjust_magnification",
      title: "Step 5: Adjust Magnification",
      instruction: "Use the magnification slider to zoom in on the cells. Start at low magnification (10x) then increase to see more detail.",
      hint: "Higher magnification reveals more cellular structures.",
      highlight: "magnification",
      action: "adjust_magnification",
      voiceText: "Adjust the magnification to see cellular details.",
    },
    {
      id: "staining",
      title: "Step 6: Apply Stain (Optional)",
      instruction: "Staining helps visualize cell structures. Try applying Methylene Blue or Iodine stain.",
      hint: "Different stains highlight different structures.",
      highlight: "staining",
      action: "apply_stain",
      voiceText: "Apply a stain to enhance cell visibility.",
    },
    {
      id: "complete",
      title: "🎉 Congratulations!",
      instruction: "You've mastered basic microscopy! Explore different specimens and magnifications to discover the amazing world of cells.",
      voiceText: "Excellent! You're now ready to explore the microscopic world.",
    },
  ],
  physics: [
    {
      id: "welcome",
      title: "Welcome to the Physics Lab! ⚡",
      instruction: "This tutorial will guide you through physics experiments including pendulum motion, electrical circuits, and projectile motion.",
      voiceText: "Welcome to the physics laboratory. Let's explore physical phenomena!",
    },
    {
      id: "select_experiment",
      title: "Step 1: Choose an Experiment",
      instruction: "Click on one of the experiment tabs: Pendulum, Electrical Circuit, or Projectile Motion.",
      hint: "Start with the Pendulum experiment - it's the easiest!",
      highlight: "experiment-tabs",
      action: "select_experiment",
      voiceText: "Select the pendulum experiment to begin.",
    },
    {
      id: "pendulum_angle",
      title: "Step 2: Set Initial Angle (Pendulum)",
      instruction: "Use the Initial Angle slider to set how far the pendulum swings. Try 45 degrees for a visible swing.",
      hint: "The angle affects the amplitude of oscillation.",
      highlight: "angle-slider",
      action: "adjust_angle",
      voiceText: "Set the initial swing angle for the pendulum.",
    },
    {
      id: "pendulum_length",
      title: "Step 3: Set Pendulum Length",
      instruction: "Adjust the pendulum length. Longer pendulums swing slower! This demonstrates the period-length relationship.",
      hint: "Period = 2π√(L/g) - length affects timing.",
      highlight: "length-slider",
      action: "adjust_length",
      voiceText: "Change the pendulum length and observe the effect on period.",
    },
    {
      id: "start_simulation",
      title: "Step 4: Start the Simulation",
      instruction: "Click the 'Start Simulation' button to begin. Watch the pendulum swing and observe the measurements!",
      hint: "The simulation shows real-time physics calculations.",
      highlight: "start-button",
      action: "start_simulation",
      voiceText: "Start the simulation and observe the pendulum motion.",
    },
    {
      id: "observe_results",
      title: "Step 5: Observe Results",
      instruction: "Watch the Results panel to see Period, Frequency, and Energy values. Notice how they relate to your settings!",
      hint: "The formulas on the right explain the physics.",
      highlight: "results-panel",
      voiceText: "Observe the results and verify the physics formulas.",
    },
    {
      id: "try_circuits",
      title: "Step 6: Try Electrical Circuits",
      instruction: "Now click on the 'Circuit' tab to build an electrical circuit. Connect a battery, resistor, and light bulb!",
      hint: "Ohm's Law: V = I × R governs circuit behavior.",
      highlight: "circuit-tab",
      action: "switch_experiment",
      voiceText: "Switch to the electrical circuit experiment.",
    },
    {
      id: "complete",
      title: "🎉 Congratulations!",
      instruction: "You've learned the basics of our physics simulations! Experiment with different values to discover physical principles.",
      voiceText: "Excellent work! You're ready to explore physics concepts.",
    },
  ],
};

export function LabTutorial({ labType, onClose, onStepComplete, currentAction }: LabTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showHint, setShowHint] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playSuccess, playClick } = useLabSounds();

  const steps = TUTORIALS[labType] || [];
  const step = steps[currentStep];
  const progress = (completedSteps.size / steps.length) * 100;
  const isComplete = currentStep === steps.length - 1 && completedSteps.has(currentStep);

  // Auto-advance when action matches
  useEffect(() => {
    if (step?.action && currentAction === step.action) {
      handleComplete();
    }
  }, [currentAction, step?.action]);

  const handleNext = () => {
    if (soundEnabled) playClick();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowHint(false);
    }
  };

  const handlePrev = () => {
    if (soundEnabled) playClick();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowHint(false);
    }
  };

  const handleComplete = () => {
    if (soundEnabled) playSuccess();
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    onStepComplete?.(step.id);
    
    // Auto-advance to next step
    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setShowHint(false);
      }, 500);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setShowHint(false);
  };

  if (isComplete) {
    return (
      <Card className="absolute top-4 right-4 w-80 z-50 bg-gradient-to-br from-green-900/95 to-emerald-900/95 border-green-600 backdrop-blur-md shadow-2xl">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Tutorial Complete!</h3>
          <p className="text-green-200 text-sm mb-4">
            You're now ready to explore the {labType} lab on your own. Have fun experimenting!
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Restart
            </Button>
            <Button size="sm" onClick={onClose} className="bg-green-600 hover:bg-green-700">
              Start Exploring
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute top-4 right-4 w-96 z-50 bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-primary/50 backdrop-blur-md shadow-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm text-white">Lab Tutorial</CardTitle>
              <p className="text-xs text-muted-foreground capitalize">{labType} Lab</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{completedSteps.size}/{steps.length} steps</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                if (idx <= Math.max(...Array.from(completedSteps), currentStep)) {
                  setCurrentStep(idx);
                }
              }}
              className={cn(
                "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all text-xs",
                completedSteps.has(idx) && "bg-green-500 border-green-500 text-white",
                idx === currentStep && !completedSteps.has(idx) && "border-primary bg-primary/20 text-primary",
                idx !== currentStep && !completedSteps.has(idx) && "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {completedSteps.has(idx) ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                idx + 1
              )}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Step */}
        <div>
          <h4 className="font-semibold text-white text-sm mb-2">{step.title}</h4>
          <p className="text-sm text-slate-300 leading-relaxed">{step.instruction}</p>
        </div>

        {/* Hint */}
        {step.hint && (
          <div>
            {showHint ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-xs text-amber-300 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{step.hint}</span>
                </p>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(true)}
                className="text-xs text-amber-400 hover:text-amber-300"
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                Need a hint?
              </Button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="text-slate-400"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <div className="flex gap-2">
            {step.action ? (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                <Play className="w-3 h-3 mr-1" />
                Do the action
              </Badge>
            ) : (
              <Button size="sm" onClick={handleComplete}>
                {currentStep === steps.length - 1 ? "Finish" : "Got it"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
