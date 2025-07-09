import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../supabaseClient";
import { generateGeminiCheckInResponse } from "@/lib/generateGeminiCheckInResponse";
import ReactMarkdown from "react-markdown";

const getSuggestedMoods = (attachmentStyle: string) => {
  const moodsByStyle = {
    anxious: ["anxious", "overwhelmed", "restless", "worried", "hopeful"],
    avoidant: ["numb", "distant", "independent", "guarded", "calm"],
    disorganized: ["confused", "mixed up", "conflicted", "scattered", "seeking"],
    secure: ["peaceful", "grateful", "reflective", "content", "growing"]
  };
  return moodsByStyle[attachmentStyle as keyof typeof moodsByStyle] || moodsByStyle.secure;
};

const CheckIn = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [feeling, setFeeling] = useState("");
  const [moodIntensity, setMoodIntensity] = useState([3]);
  const [aiResponse, setAiResponse] = useState("");
  const [actions, setActions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const attachmentStyle = localStorage.getItem("attachmentStyle") || "secure";
  const suggestedMoods = getSuggestedMoods(attachmentStyle);

  const handleNext = () => setCurrentStep((prev) => prev + 1);

  const handleComplete = async () => {
    const userId = "7eb8f894-ca27-4c0d-87d4-c3a18bb6fedf"; // replace with dynamic later

    await supabase.from("check_ins").insert([
      {
        user_id: userId,
        mood: moodIntensity[0],
        notes: feeling,
        attachment_style: attachmentStyle
      }
    ]);

    navigate("/dashboard");
  };

  const handleValidate = async () => {
    setIsLoading(true);
    setCurrentStep(4);

    const response = await generateGeminiCheckInResponse(
      feeling,
      moodIntensity[0],
      attachmentStyle
    );

    // Assume the response comes back as:
    // { message: "...", actions: ["...", "...", "..."] }
    const parsed = JSON.parse(response || "{}");
    setAiResponse(parsed.message || "I'm here with you. You're doing great.");
    setActions(parsed.actions || []);
    setIsLoading(false);
  };

  const getIntensityLabel = (value: number) => {
    const labels = [
      "barely there", "just a whisper", "noticeable", "taking up space",
      "pretty strong", "hard to ignore", "all I can feel"
    ];
    return labels[Math.min(value - 1, labels.length - 1)] || "just a little";
  };

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-calm p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 pt-8 pb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <Card className="p-8 bg-white/90 text-center shadow-lg">
            <h1 className="text-2xl font-medium">Hey, I'm here with you.</h1>
            <p className="text-lg text-muted-foreground">Ready to check in? Just for a minute.</p>
          </Card>
          <Button onClick={handleNext} className="w-full mt-8">
            Yes, just for a minute
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-calm p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 pt-8 pb-6">
            <Button variant="ghost" size="icon" onClick={() => setCurrentStep(1)} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <Card className="p-6 bg-white/90 shadow-lg">
            <h2 className="text-xl text-center">What word or words describe how you feel?</h2>
            <Input
              placeholder="lonely… frustrated… hopeful…"
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              className="mt-4"
            />
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {suggestedMoods.map((mood) => (
                <Button
                  key={mood}
                  variant={feeling === mood ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFeeling(mood)}
                  className="rounded-full px-4 py-2"
                >
                  {mood}
                </Button>
              ))}
            </div>
          </Card>
          <Button
            onClick={handleNext}
            disabled={!feeling.trim()}
            className="w-full mt-8"
          >
            Thanks for sharing
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-gradient-calm p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 pt-8 pb-6">
            <Button variant="ghost" size="icon" onClick={() => setCurrentStep(2)} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <Card className="p-6 bg-white/90 shadow-lg">
            <h2 className="text-center">How intense is this feeling?</h2>
            <Slider
              value={moodIntensity}
              onValueChange={setMoodIntensity}
              max={7}
              min={1}
              step={1}
            />
            <p className="text-center text-muted-foreground mt-2">
              {getIntensityLabel(moodIntensity[0])}
            </p>
          </Card>
          <Button onClick={handleValidate} className="w-full mt-8">
            Validate me
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-gradient-calm p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 pt-8 pb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <Card className="p-6 bg-white/90 shadow-lg space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Typing...</p>
            ) : (
              <>
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => (
                      <p className="text-sm leading-relaxed" {...props} />
                    ),
                  }}
                >
                  {aiResponse}
                </ReactMarkdown>

                <div className="space-y-2 mt-4">
                  {actions.map((action, idx) => (
                    <Card key={idx} className="p-3 shadow bg-white/80 text-sm">
                      {action}
                    </Card>
                  ))}
                </div>
              </>
            )}
          </Card>
          {!isLoading && (
            <Button onClick={handleComplete} className="w-full mt-6">
              Done — thank you
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default CheckIn;