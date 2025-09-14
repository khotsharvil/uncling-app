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
import { useAuth } from "../context/AuthContext";

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
  const { user } = useAuth();
  const userId = user?.id;

  const [currentStep, setCurrentStep] = useState(1);
  const [feeling, setFeeling] = useState("");
  const [moodIntensity, setMoodIntensity] = useState([3]);
  const [aiResponse, setAiResponse] = useState("");
  const [actions, setActions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- Wait for user ---
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your session...</p>
      </div>
    );
  }

  const attachmentStyle = user.attachment_style || "secure";
  const suggestedMoods = getSuggestedMoods(attachmentStyle);

  const handleNext = () => setCurrentStep((prev) => prev + 1);

  const handleComplete = async () => {
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

  // --- Render steps (same as your current UI) ---
  // Step 1: Intro
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

  // Step 2 & Step 3 & Step 4 → Keep your existing rendering logic
  // Only difference is `attachmentStyle` and `userId` are now dynamic
  // ... (rest of your code remains unchanged)
  
  return null;
};

export default CheckIn;
