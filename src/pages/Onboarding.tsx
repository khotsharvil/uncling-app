import { supabase } from '../supabaseClient';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "../context/AuthContext";

interface OnboardingProps {
  onComplete: () => void;
}

const questions = [
  {
    question: "How do you usually feel in relationships?",
    answers: [
      { text: "Secure and comfortable", value: "secure" },
      { text: "Often worried or anxious", value: "anxious" },
      { text: "Prefer distance / independence", value: "avoidant" },
      { text: "A mix of different feelings", value: "mixed" },
    ],
  },
  {
    question: "What do you want to improve the most?",
    answers: [
      { text: "Managing emotions", value: "emotions" },
      { text: "Building trust", value: "trust" },
      { text: "Reducing anxiety", value: "reduce_anxiety" },
      { text: "Improving communication", value: "communication" },
    ],
  },
  {
    question: "How do you usually cope with stress?",
    answers: [
      { text: "Talk to someone", value: "talk" },
      { text: "Keep it to myself", value: "self" },
      { text: "Distract with activities", value: "distract" },
      { text: "Other", value: "other" },
    ],
  },
];

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const { user } = useAuth();
  const userId = user?.id;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");

  const handleNext = async () => {
    // Add current selection to answers using functional update to avoid stale state
    let newAnswers: string[] = [];
    setAnswers((prev) => {
      newAnswers = [...prev, selectedAnswer];
      return newAnswers;
    });

    if (currentQuestion < questions.length - 1) {
      // Use functional update to avoid race conditions on rapid clicks
      setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1));
      setSelectedAnswer("");
      return;
    }

    // Logic for when onboarding is complete
    const counts = newAnswers.reduce((acc, answer) => {
      acc[answer] = (acc[answer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const attachmentStyle = Object.keys(counts).reduce((a, b) =>
      counts[a] > counts[b] ? a : b
    );

    localStorage.setItem("attachmentStyle", attachmentStyle);

    if (!userId) {
      console.error("No logged-in user found.");
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        attachment_style: attachmentStyle,
        tone_preference: 'kind',
        summary_notes: ''
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error updating user:', error);
    } else {
      console.log('User updated:', data);
    }

    // ✅ Sets a state that triggers the final return, then calls onComplete
    setCurrentQuestion(questions.length);
    onComplete();
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // ✅ Safety Check: This prevents the crash by returning a completion message
  // as soon as the state indicates onboarding is done.
  if (currentQuestion >= questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Onboarding complete! You will be redirected shortly.</p>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  // Defensive guard against out-of-range indices during rapid state changes
  if (!currentQ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Onboarding starting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-calm">
      <Card className="w-full max-w-lg p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Understanding You
            </h2>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium text-foreground leading-relaxed">
            {currentQ?.question ?? ""}
          </h3>

          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            className="space-y-4"
          >
            {currentQ?.answers?.map((answer, index) => (
              <div key={index} className="flex items-start space-x-3">
                <RadioGroupItem
                  value={answer.value}
                  id={`answer-${index}`}
                  className="mt-1"
                />
                <Label
                  htmlFor={`answer-${index}`}
                  className="text-sm leading-relaxed cursor-pointer flex-1"
                >
                  {answer.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (currentQuestion > 0) {
                setCurrentQuestion((prev) => {
                  const newIndex = Math.max(prev - 1, 0);
                  setSelectedAnswer(answers[newIndex] || "");
                  return newIndex;
                });
              }
            }}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="bg-primary hover:bg-primary/90"
          >
            {currentQuestion === questions.length - 1 ? "Complete" : "Next"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;