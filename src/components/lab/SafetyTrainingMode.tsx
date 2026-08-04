import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Eye, 
  Hand, 
  Shirt, 
  FlaskConical, 
  Flame,
  Wind,
  Droplet,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Award
} from "lucide-react";
import { useLabSounds } from "@/hooks/useLabSounds";

interface SafetyLesson {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const SAFETY_LESSONS: SafetyLesson[] = [
  {
    id: "ppe",
    title: "Personal Protective Equipment",
    icon: <ShieldCheck className="w-6 h-6" />,
    content: `Before handling ANY chemicals, you MUST wear:

🥽 **Safety Goggles** - Protect your eyes from splashes, fumes, and debris. Chemical burns to the eyes can cause permanent blindness.

🧤 **Lab Gloves** - Nitrile or latex gloves protect your skin from corrosive chemicals, toxic substances, and biological hazards.

🥼 **Lab Coat** - Protects your clothing and skin. In case of a spill, you can quickly remove it. Always keep it buttoned.

Never assume a chemical is "safe" - even water can cause harm in certain lab contexts!`,
    quiz: {
      question: "When should you wear safety goggles in the lab?",
      options: [
        "Only when working with acids",
        "Only when the teacher tells you to",
        "Whenever chemicals are being used anywhere in the lab",
        "Only during dangerous experiments"
      ],
      correctIndex: 2,
      explanation: "Safety goggles must be worn at ALL times when chemicals are present in the lab, even if you're not directly handling them. Accidents can happen nearby!"
    }
  },
  {
    id: "acids-bases",
    title: "Handling Acids & Bases",
    icon: <Droplet className="w-6 h-6" />,
    content: `Acids and bases are among the most common and dangerous chemicals in the lab.

⚠️ **The Golden Rule: ADD ACID TO WATER, never water to acid!**
- Adding water to concentrated acid causes violent boiling and splashing
- This can cause severe chemical burns

📏 **Safe Handling:**
- Always use small quantities
- Work in a well-ventilated area
- Never smell chemicals directly - waft vapors toward your nose
- Know where the eyewash station and safety shower are located

🚨 **If spilled:**
- Alert everyone in the area
- Small spills: neutralize with baking soda (for acids) or vinegar (for bases)
- Large spills: evacuate and call for help`,
    quiz: {
      question: "When diluting acid, you should:",
      options: [
        "Add water to the acid quickly",
        "Add acid to water slowly",
        "Mix them at the same time",
        "Heat the water first"
      ],
      correctIndex: 1,
      explanation: "Always add acid to water (AAA - Always Add Acid). Adding water to concentrated acid causes an extremely exothermic reaction that can cause the solution to boil violently and splash."
    }
  },
  {
    id: "reactive-metals",
    title: "Reactive Metals",
    icon: <Flame className="w-6 h-6" />,
    content: `Alkali metals (sodium, potassium, lithium) are EXTREMELY dangerous!

💥 **These metals react EXPLOSIVELY with water:**
- Na + H₂O → NaOH + H₂ (hydrogen gas ignites!)
- Potassium is even more violent than sodium
- Never touch with bare hands - they react with moisture on your skin

🔒 **Storage:**
- Stored under oil to prevent contact with air/moisture
- Handle only with dry forceps
- Use tiny pieces (smaller than a pea)

🚫 **NEVER:**
- Add reactive metals to acids (even more violent!)
- Touch with wet hands
- Leave exposed to air`,
    quiz: {
      question: "What happens when sodium metal contacts water?",
      options: [
        "Nothing, sodium dissolves peacefully",
        "It produces a colorful display safely",
        "It reacts explosively, producing hydrogen gas that ignites",
        "It just fizzes a little"
      ],
      correctIndex: 2,
      explanation: "Sodium reacts violently with water, producing hydrogen gas and enough heat to ignite it. This causes an explosion and can send molten sodium flying - extremely dangerous!"
    }
  },
  {
    id: "toxic-gases",
    title: "Toxic Gas Hazards",
    icon: <Wind className="w-6 h-6" />,
    content: `Some chemical combinations produce DEADLY gases:

☠️ **Bleach + Ammonia = Chloramine Gas**
- Causes severe respiratory damage
- Can be fatal even in small amounts
- Common household accident - never mix cleaning products!

☠️ **Bleach + Acid = Chlorine Gas**
- The same gas used as a chemical weapon in WWI
- Causes severe lung damage
- Yellow-green color, strong odor

🏃 **If you detect toxic gas:**
- IMMEDIATELY evacuate the area
- Alert others as you leave
- Get to fresh air
- Seek medical attention
- Do NOT try to "fix" the problem`,
    quiz: {
      question: "What should you do if toxic fumes are released?",
      options: [
        "Open a window and continue working",
        "Hold your breath and quickly neutralize the chemicals",
        "Immediately evacuate and alert others",
        "Put on a face mask and finish your experiment"
      ],
      correctIndex: 2,
      explanation: "When toxic gases are released, evacuation is the ONLY correct response. Even brief exposure can cause serious harm. Never try to 'fix' the problem - get to safety first!"
    }
  },
  {
    id: "heat-fire",
    title: "Heat & Fire Safety",
    icon: <Flame className="w-6 h-6" />,
    content: `Working with Bunsen burners and heat requires careful attention:

🔥 **Bunsen Burner Safety:**
- Check gas connections before lighting
- Keep flammable materials away
- Never leave a lit burner unattended
- Tie back long hair and loose clothing

🧪 **Heating Chemicals:**
- Never heat a closed container
- Point test tubes AWAY from people
- Use a boiling chip to prevent bumping
- Never look directly into a heated container

🧯 **Fire Response:**
- Know the location of fire extinguishers
- Small fires: cover with damp cloth or fire blanket
- Large fires: evacuate immediately
- If clothing catches fire: STOP, DROP, and ROLL`,
    quiz: {
      question: "When heating a test tube, you should:",
      options: [
        "Point it toward yourself to see better",
        "Point it away from all people",
        "Seal it tightly to prevent evaporation",
        "Heat it as quickly as possible"
      ],
      correctIndex: 1,
      explanation: "Always point heated test tubes away from yourself and others. Heated liquids can suddenly boil and shoot out, causing severe burns."
    }
  }
];

interface SafetyTrainingModeProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export function SafetyTrainingMode({ onComplete, onSkip }: SafetyTrainingModeProps) {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const { playSound } = useLabSounds();

  const lesson = SAFETY_LESSONS[currentLesson];
  const progress = ((currentLesson + (showQuiz ? 0.5 : 0)) / SAFETY_LESSONS.length) * 100;
  const isComplete = completedLessons.length === SAFETY_LESSONS.length;

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    if (index === lesson.quiz.correctIndex) {
      setCorrectAnswers(prev => prev + 1);
      playSound("success");
    } else {
      playSound("warning_alarm");
    }
  };

  const handleNext = () => {
    if (!showQuiz) {
      setShowQuiz(true);
      playSound("click");
    } else {
      if (!completedLessons.includes(lesson.id)) {
        setCompletedLessons(prev => [...prev, lesson.id]);
      }
      
      if (currentLesson < SAFETY_LESSONS.length - 1) {
        setCurrentLesson(prev => prev + 1);
        setShowQuiz(false);
        setSelectedAnswer(null);
        setIsAnswered(false);
        playSound("click");
      } else if (isAnswered) {
        // All lessons complete
        playSound("success");
      }
    }
  };

  const handleRestart = () => {
    setCurrentLesson(0);
    setShowQuiz(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectAnswers(0);
    setCompletedLessons([]);
    playSound("click");
  };

  if (isComplete && isAnswered) {
    const percentage = Math.round((correctAnswers / SAFETY_LESSONS.length) * 100);
    const passed = percentage >= 80;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full bg-slate-800/90 border-2 border-cyan-500/30 shadow-2xl">
          <CardHeader className="text-center">
            {passed ? (
              <Award className="w-20 h-20 mx-auto text-yellow-400 mb-4" />
            ) : (
              <AlertTriangle className="w-20 h-20 mx-auto text-orange-400 mb-4" />
            )}
            <CardTitle className={`text-3xl ${passed ? "text-green-400" : "text-orange-400"}`}>
              {passed ? "🎉 Certification Complete!" : "Additional Training Required"}
            </CardTitle>
            <CardDescription className="text-lg text-slate-300">
              You scored {correctAnswers}/{SAFETY_LESSONS.length} ({percentage}%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {passed ? (
              <>
                <p className="text-center text-slate-300">
                  You have demonstrated understanding of essential laboratory safety procedures.
                  You may now proceed to conduct experiments.
                </p>
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-green-400 mb-2" />
                  <p className="text-green-300 font-medium">Safety Certification Granted</p>
                </div>
                <Button onClick={onComplete} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-lg py-6">
                  Enter the Laboratory
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <p className="text-center text-slate-300">
                  You need at least 80% to pass. Please review the safety materials and try again.
                </p>
                <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto text-orange-400 mb-2" />
                  <p className="text-orange-300 font-medium">Safety is critical - please retake the training</p>
                </div>
                <Button onClick={handleRestart} className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-lg py-6">
                  <RotateCcw className="mr-2 w-5 h-5" />
                  Retake Training
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShieldCheck className="w-10 h-10 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Laboratory Safety Training</h1>
          </div>
          <p className="text-slate-400">Complete all lessons to access dangerous chemical experiments</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Lesson {currentLesson + 1} of {SAFETY_LESSONS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Lesson indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {SAFETY_LESSONS.map((l, i) => (
            <Badge
              key={l.id}
              variant={completedLessons.includes(l.id) ? "default" : i === currentLesson ? "secondary" : "outline"}
              className={`${completedLessons.includes(l.id) ? "bg-green-600" : i === currentLesson ? "bg-cyan-600" : "bg-slate-700"}`}
            >
              {completedLessons.includes(l.id) ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
            </Badge>
          ))}
        </div>

        {/* Main content */}
        <Card className="bg-slate-800/90 border-2 border-cyan-500/30 shadow-2xl">
          <CardHeader className="border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500/20 p-3 rounded-lg text-cyan-400">
                {lesson.icon}
              </div>
              <div>
                <CardTitle className="text-xl text-white">{lesson.title}</CardTitle>
                <CardDescription>
                  {showQuiz ? "Knowledge Check" : "Safety Lesson"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {!showQuiz ? (
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-line text-slate-300 leading-relaxed">
                  {lesson.content.split('\n').map((line, i) => (
                    <p key={i} className={`${line.startsWith('**') || line.includes('**') ? 'font-semibold text-white' : ''} ${line.startsWith('⚠️') || line.startsWith('🚨') || line.startsWith('☠️') || line.startsWith('🚫') ? 'text-red-300' : ''} ${line.startsWith('✓') || line.startsWith('📏') || line.startsWith('🔒') || line.startsWith('🧯') || line.startsWith('🔥') ? 'text-cyan-300' : ''} my-2`}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">{lesson.quiz.question}</h3>
                
                <div className="space-y-3">
                  {lesson.quiz.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={isAnswered}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        isAnswered
                          ? i === lesson.quiz.correctIndex
                            ? "border-green-500 bg-green-500/20 text-green-300"
                            : i === selectedAnswer
                            ? "border-red-500 bg-red-500/20 text-red-300"
                            : "border-slate-600 bg-slate-700/50 text-slate-400"
                          : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-cyan-500 hover:bg-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isAnswered && i === lesson.quiz.correctIndex && (
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        )}
                        {isAnswered && i === selectedAnswer && i !== lesson.quiz.correctIndex && (
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        )}
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {isAnswered && (
                  <div className={`p-4 rounded-lg ${selectedAnswer === lesson.quiz.correctIndex ? "bg-green-500/20 border border-green-500/50" : "bg-amber-500/20 border border-amber-500/50"}`}>
                    <p className={`font-medium ${selectedAnswer === lesson.quiz.correctIndex ? "text-green-300" : "text-amber-300"}`}>
                      {selectedAnswer === lesson.quiz.correctIndex ? "✓ Correct!" : "✗ Incorrect"}
                    </p>
                    <p className="text-slate-300 mt-2">{lesson.quiz.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <div className="p-6 border-t border-slate-700 flex justify-between items-center">
            {onSkip && (
              <Button variant="ghost" onClick={onSkip} className="text-slate-400">
                Skip Training (Not Recommended)
              </Button>
            )}
            <div className="flex-1" />
            <Button
              onClick={handleNext}
              disabled={showQuiz && !isAnswered}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8"
            >
              {showQuiz ? (
                currentLesson < SAFETY_LESSONS.length - 1 ? "Next Lesson" : "Complete Training"
              ) : (
                "Take Quiz"
              )}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
