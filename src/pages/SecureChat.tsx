import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "../supabaseClient";
import { generateGeminiResponse } from "@/lib/geminiClient";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const SecureChat = () => {
  const navigate = useNavigate();
  const userId = "7eb8f894-ca27-4c0d-87d4-c3a18bb6fedf"; // Replace with dynamic user ID later
  const attachmentStyle =
    localStorage.getItem("attachmentStyle") || "secure";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      text: "I'm here to listen and support you. What's on your mind today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    const fetchChatHistory = async () => {
      const { data, error } = await supabase
        .from("chat_history")
        .select("id, user_message, ai_response, created_at")
        .eq("user_id", userId)
        .eq("feature", "SecureSelfChat")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching chat history:", error);
      } else if (data) {
        const history: Message[] = [];
        data.forEach((row) => {
          history.push({
            id: row.id + "-user",
            text: row.user_message,
            isUser: true,
            timestamp: new Date(row.created_at),
          });
          history.push({
            id: row.id + "-ai",
            text: row.ai_response,
            isUser: false,
            timestamp: new Date(row.created_at),
          });
        });
        setMessages((prev) => [...prev, ...history]);
      }
    };

    fetchChatHistory();
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessageText = inputText.trim();

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      text: userMessageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    let aiResponseText = "Let me think about that...";

    try {
      aiResponseText = await generateGeminiResponse(userMessageText);
    } catch (err) {
      console.error("Gemini API error:", err);
      aiResponseText =
        "Sorry, something went wrong while trying to respond. Please try again.";
    }

    const aiMsg: Message = {
      id: `${Date.now()}-ai`,
      text: aiResponseText,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMsg]);

    const { error } = await supabase.from("chat_history").insert([
      {
        user_id: userId,
        feature: "SecureSelfChat",
        user_message: userMessageText,
        ai_response: aiResponseText,
      },
    ]);

    if (error) {
      console.error("Error saving chat:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-calm p-4">
      <div className="max-w-md mx-auto h-screen flex flex-col">
        {/* Sticky header */}
        <div className="flex items-center gap-4 pt-8 pb-6 bg-gradient-calm sticky top-0 z-10 shadow">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Secure Self
            </h1>
            <p className="text-sm text-muted-foreground">
              Your compassionate inner voice
            </p>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-gradient-calm">
          <div className="flex-1 space-y-4 overflow-y-auto pb-4 py-0 px-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <Card
                  className={`max-w-[80%] p-4 ${
                    message.isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/80 backdrop-blur-sm border-0 shadow-md"
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => (
                        <p className="text-sm leading-relaxed" {...props} />
                      ),
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </Card>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="flex gap-2 pt-4 border-t border-white/20 py-4 bg-gradient-calm">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="What's on your mind?"
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 bg-white/80 border-0"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputText.trim()}
              size="icon"
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureChat;