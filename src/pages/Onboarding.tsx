import { supabase } from '../supabaseClient';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "../context/AuthContext"; // ✅ use auth context

interface OnboardingProps {
  onComplete: () => void;
}

const questions = [
  // ... same questions as your current code ...
];

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const { user } = useAuth(); // ✅ get logged-in user
  const userId = user?.id;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");

  const handleNext = async () => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
    } else {
      // Calculate attachment style
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

      // ✅ Update existing user instead of inserting new
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
        onComplete();
      }
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

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
            {questions[currentQuestion].question}
          </h3>

          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            className="space-y-4"
          >
            {questions[currentQuestion].answers.map((answer, index) => (
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
                setCurrentQuestion(currentQuestion - 1);
                setSelectedAnswer(answers[currentQuestion - 1] || "");
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
