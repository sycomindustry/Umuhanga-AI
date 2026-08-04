import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  points: number;
  explanation: string;
}

const QuizTaking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState("");

  useEffect(() => {
    if (quizId) loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("title")
      .eq("id", quizId)
      .maybeSingle();

    if (quiz) setQuizTitle(quiz.title);

    const { data, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId);

    if (!error && data) {
      const formattedQuestions = data.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : []
      }));
      setQuestions(formattedQuestions as Question[]);
    }
    setLoading(false);
  };

  const handleAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [questions[currentIndex].id]: optionIndex });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    let totalScore = 0;
    let totalPoints = 0;

    questions.forEach((q) => {
      totalPoints += q.points;
      if (answers[q.id] === q.correct_answer) {
        totalScore += q.points;
      }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("quiz_attempts").insert({
        quiz_id: quizId,
        user_id: user.id,
        score: totalScore,
        total_points: totalPoints,
        answers
      });
    }

    setScore(totalScore);
    setShowResult(true);
    toast.success("Quiz completed!");
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Button variant="ghost" onClick={() => navigate("/quizzes")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Card className="max-w-2xl mx-auto mt-8 text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No questions available for this quiz</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.reduce((sum, q) => sum + q.points, 0)) * 100);
    return (
      <div className="min-h-screen bg-background p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className={`text-6xl font-bold ${percentage >= 70 ? "text-emerald-500" : "text-amber-500"}`}>
              {percentage}%
            </div>
            <p className="text-muted-foreground">
              You scored {score} out of {questions.reduce((sum, q) => sum + q.points, 0)} points
            </p>
            <div className="space-y-4 text-left">
              <h3 className="font-semibold">Review:</h3>
              {questions.map((q, idx) => (
                <div key={q.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    {answers[q.id] === q.correct_answer ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">{idx + 1}. {q.question}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Correct: {q.options[q.correct_answer]}
                      </p>
                      {q.explanation && (
                        <p className="text-sm text-muted-foreground mt-1">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => navigate("/quizzes")}>Back to Quizzes</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/quizzes")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Exit
          </Button>
          <span className="text-muted-foreground">{quizTitle}</span>
        </div>

        <Progress value={progress} className="mb-6" />
        <p className="text-sm text-muted-foreground mb-4">
          Question {currentIndex + 1} of {questions.length}
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full p-4 text-left rounded-lg border transition-colors ${
                  answers[currentQuestion.id] === idx
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {option}
              </button>
            ))}
            <Button
              className="w-full mt-4"
              onClick={nextQuestion}
              disabled={answers[currentQuestion.id] === undefined}
            >
              {currentIndex < questions.length - 1 ? "Next" : "Submit Quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizTaking;
