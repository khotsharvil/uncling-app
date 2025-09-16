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
    id: 1,
    question: "When someone important to you seems distant, you typically:",
    answers: [
      { value: "anxious", text: "Worry they're losing interest and try harder to connect" },
      { value: "avoidant", text: "Give them space and focus on other things" },
      { value: "disorganized", text: "Feel confused and unsure how to respond" },
      { value: "secure", text: "Check in with them directly and communicate openly" }
    ]
  },
  {
    id: 2,
    question: "In relationships, you tend to:",
    answers: [
      { value: "anxious", text: "Need frequent reassurance that you're valued" },
      { value: "avoidant", text: "Prefer maintaining your independence" },
      { value: "disorganized", text: "Want closeness but fear getting hurt" },
      { value: "secure", text: "Feel comfortable with intimacy and autonomy" }
    ]
  },
  {
    id: 3,
    question: "When feeling overwhelmed, you usually:",
    answers: [
      { value: "anxious", text: "Seek comfort from others immediately" },
      { value: "avoidant", text: "Handle it on your own" },
      { value: "disorganized", text: "Feel torn between reaching out and withdrawing" },
      { value: "secure", text: "Take time to process, then reach out if needed" }
    ]
  },
  {
    id: 4,
    question: "During conflicts with loved ones, you typically:",
    answers: [
      { value: "anxious", text: "Get emotional and need immediate resolution" },
      { value: "avoidant", text: "Withdraw and need time to cool down" },
      { value: "disorganized", text: "Feel overwhelmed and struggle to communicate clearly" },
      { value: "secure", text: "Stay calm and work through it together" }
    ]
  },
  {
    id: 5,
    question: "When it comes to sharing your feelings, you:",
    answers: [
      { value: "anxious", text: "Share openly, sometimes more than others are comfortable with" },
      { value: "avoidant", text: "Keep most feelings to yourself" },
      { value: "disorganized", text: "Want to share but often feel misunderstood" },
      { value: "secure", text: "Share appropriately when it feels right" }
    ]
  },
  {
    id: 6,
    question: "Your self-worth often depends on:",
    answers: [
      { value: "anxious", text: "How others see you and treat you" },
      { value: "avoidant", text: "Your achievements and independence" },
      { value: "disorganized", text: "External validation, but you doubt it when you get it" },
      { value: "secure", text: "Your own values and self-knowledge" }
    ]
  },
  {
    id: 7,
    question: "When someone you care about cancels plans last minute, you:",
    answers: [
      { value: "anxious", text: "Feel rejected and wonder if they're avoiding you" },
      { value: "avoidant", text: "Feel relieved to have the time to yourself" },
      { value: "disorganized", text: "Feel disappointed but also somewhat relieved" },
      { value: "secure", text: "Feel disappointed but understand things come up" }
    ]
  },
  {
    id: 8,
    question: "In your childhood, your caregivers were typically:",
    answers: [
      { value: "anxious", text: "Inconsistent - sometimes loving, sometimes unavailable" },
      { value: "avoidant", text: "Emotionally distant or focused on achievements" },
      { value: "disorganized", text: "Unpredictable or sometimes the source of your stress" },
      { value: "secure", text: "Generally responsive and emotionally available" }
    ]
  },
  {
    id: 9,
    question: "When you're stressed, you believe:",
    answers: [
      { value: "anxious", text: "Others should notice and help without you asking" },
      { value: "avoidant", text: "You should handle it yourself without burdening others" },
      { value: "disorganized", text: "You need help but aren't sure how to ask for it" },
      { value: "secure", text: "It's okay to ask for support when you need it" }
    ]
  },
  {
    id: 10,
    question: "Your approach to trust in relationships is:",
    answers: [
      { value: "anxious", text: "I trust quickly but constantly need reassurance" },
      { value: "avoidant", text: "I'm cautious about trusting and prefer to rely on myself" },
      { value: "disorganized", text: "I want to trust but often feel conflicted about it" },
      { value: "secure", text: "I trust gradually as people show they're trustworthy" }
    ]
  },
  {
    id: 11,
    question: "When facing a big life decision, you typically:",
    answers: [
      { value: "anxious", text: "Seek lots of advice and worry about making the wrong choice" },
      { value: "avoidant", text: "Research thoroughly and decide on your own" },
      { value: "disorganized", text: "Feel paralyzed by the options and their consequences" },
      { value: "secure", text: "Consider your options, seek some input, then trust your judgment" }
    ]
  },
  {
    id: 12,
    question: "After an argument with someone you care about, you usually:",
    answers: [
      { value: "anxious", text: "Replay it over and over, worrying about the relationship" },
      { value: "avoidant", text: "Try to move on and not think about it" },
      { value: "disorganized", text: "Feel confused about what happened and your role in it" },
      { value: "secure", text: "Reflect on it, then address any unresolved issues" }
    ]
  }
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