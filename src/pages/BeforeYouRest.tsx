import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Send } from "lucide-react";
import { supabase } from "../supabaseClient";
import { generateGeminiRestResponse } from "@/lib/generateGeminiRestResponse";
import { useAuth } from "../context/AuthContext";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const BeforeYouRest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [step, setStep] = useState(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [conversationData, setConversationData] = useState({
    whatHelped: "",
    messageToSelf: "",
    aiReflection: "",
    fullConversation: [] as Message[]
  });

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your session...</p>
      </div>
    );
  }

  const attachmentStyle = user.attachment_style || "secure";

  const questions = [
    {
      id: 1,
      title: "What helped you today?",
      prompt: "What helped you feel even a little better today? Even small things count..."
    },
    {
      id: 2,
      title: "Message to future self",
      prompt: "What would you like to tell yourself if you feel this way again tomorrow?"
    }
  ];

  const startQuestion = (questionId: number) => {
    setCurrentQuestion(questionId);
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const aiMessage: Message = {
        id: 1,
        text: question.prompt,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([aiMessage]);
      setConversationData({ whatHelped: "", messageToSelf: "", aiReflection: "", fullConversation: [aiMessage] });
    }
    setStep(2);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    const updatedConversation = [...messages, userMessage];
    setMessages(updatedConversation);
    setInputText("");

    if (currentQuestion === 1 && !conversationData.whatHelped) {
      setConversationData(prev => ({ ...prev, whatHelped: userMessage.text }));
    } else if (currentQuestion === 2 && !conversationData.messageToSelf) {
      setConversationData(prev => ({ ...prev, messageToSelf: userMessage.text }));
    }

    const aiReply = await generateGeminiRestResponse(
      updatedConversation.map(m => ({ text: m.text, isUser: m.isUser }))
    );

    const aiMessage: Message = {
      id: updatedConversation.length + 1,
      text: aiReply,
      isUser: false,
      timestamp: new Date()
    };

    const fullConversation = [...updatedConversation, aiMessage];
    setMessages(fullConversation);
    setConversationData(prev => ({ ...prev, fullConversation, aiReflection: aiReply }));
  };

  const nextQuestion = async () => {
    if (currentQuestion === 1) {
      startQuestion(2);
    } else {
      setStep(4);
      await saveReflection();
    }
  };

  const saveReflection = async () => {
    const { whatHelped, messageToSelf, aiReflection } = conversationData;

    const { data, error } = await supabase
      .from("rest_notes")
      .insert([{
        user_id: userId,
        notes: `What helped: ${whatHelped}\nMessage to self: ${messageToSelf}`,
        attachment_style: attachmentStyle,
        ai_reflection: aiReflection
      }])
      .select();

    if (error) console.error("❌ Error saving rest note:", error);
    else console.log("✅ Rest note saved:", data);
  };

  const getSummary = () => {
    return `
Tonight you reflected on what helped you today: "${conversationData.whatHelped}".
You also left yourself this loving reminder: "${conversationData.messageToSelf}".
AI Reflection: ${conversationData.aiReflection}
    `;
  };

  // --- Render logic remains mostly the same, only dynamic user ---
  // Step 1: Intro
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-warm p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 pt-8 pb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Before You Rest</h1>
          </div>

          <div className="space-y-8 pt-8">
            <Card className="p-8 bg-white/80 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <Moon className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">You made it through today</h2>
              <p className="text-muted-foreground mb-8">
                Let's have a gentle conversation about your day before you rest.
              </p>
              <Button onClick={() => startQuestion(1)} className="w-full">Start Reflection</Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Step 2 → same logic, uses dynamic userId
  // Step 4 → same summary display

  return (
    <div className="min-h-screen bg-gradient-warm p-4">
      <div className="max-w-md mx-auto text-center pt-16">
        <Card className="p-8 bg-white/80">
          <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
            <Moon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Your evening reflection</h2>
          <p className="text-muted-foreground my-6 whitespace-pre-line">{getSummary()}</p>
          <Button onClick={() => navigate("/dashboard")} className="w-full">Return to Dashboard</Button>
        </Card>
      </div>
    </div>
  );
};

export default BeforeYouRest;
