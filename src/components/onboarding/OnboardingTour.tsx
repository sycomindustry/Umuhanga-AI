import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Beaker, FileText, MessageSquare, Trophy, X, ChevronRight, ChevronLeft } from "lucide-react";
import { BRAND } from "@/lib/brand";

interface OnboardingTourProps {
  onComplete: () => void;
}

const tourSteps = [
  {
    icon: GraduationCap,
    title: `Welcome to ${BRAND.name}!`,
    description: `${BRAND.tagline}. Let's take a quick tour to help you get started.`,
    color: "bg-primary"
  },
  {
    icon: GraduationCap,
    title: "AI Tutor",
    description: "Ask questions in Kinyarwanda, English, or French and get instant, personalized explanations. Your AI teacher is available 24/7 to help you learn.",
    color: "bg-primary"
  },
  {
    icon: Beaker,
    title: "Virtual Labs",
    description: "Conduct safe science experiments with our interactive simulations. Explore physics, chemistry, and biology hands-on!",
    color: "bg-secondary"
  },
  {
    icon: FileText,
    title: "Quizzes & Assessments",
    description: "Test your knowledge with quizzes tailored to your education level. Track your progress and see where you can improve.",
    color: "bg-accent"
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    description: "Compete with other students, earn points, and climb the leaderboard. Learning is more fun with friendly competition!",
    color: "bg-primary"
  },
  {
    icon: MessageSquare,
    title: "Stay Connected",
    description: "Send messages to your teachers, check your calendar for assignments, and get notifications for important updates.",
    color: "bg-secondary"
  }
];

export const OnboardingTour = ({ onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = tourSteps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-strong animate-in fade-in zoom-in-95 duration-300">
        <CardHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2"
            onClick={handleSkip}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <StepIcon className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-center text-xl">{step.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">{step.description}</p>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? "bg-primary w-6" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="ghost" 
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {currentStep < tourSteps.length - 1 && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
              {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
