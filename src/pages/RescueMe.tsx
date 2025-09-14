import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { generateGeminiRescueResponse } from "../lib/generateGeminiRescueResponse";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const quickActions = [
  "Place your hand on your chest and feel your breath for 30 seconds.",
  "Step outside or look at something green for a moment.",
  "Drink a glass of water slowly, notice each sip.",
  "Name 3 things you can see, 2 you can touch, 1 you can hear."
];

const RescueMe = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const chatRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(true);

  // --- Load past RescueMe sessions ---
  useEffect(() => {
    if (!userId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("rescue_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (data) {
        const msgs = data.map((m) => ({
          id: m.id,
          text: m.message,
          isUser: m.is_user,
          timestamp: new Date(m.created_at)
        }));
        setMessages(msgs);
      }
    };

    fetchMessages();
  }, [userId]);

  // --- Auto-scroll chat ---
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || !userId) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setShowQuickActions(false);

    // Save user message to Supabase
    await supabase.from("rescue_sessions").insert([
      { user_id: userId, message: messageText, is_user: true }
    ]);

    try {
      // Generate AI response
      const aiResponse = await generateGeminiRescueResponse(
        updatedMessages.map(m => ({ text: m.text, isUser: m.isUser }))
      );

      const aiMessage: Message = {
        id: updatedMessages.length + 1,
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Save AI response to Supabase
      await supabase.from("rescue_sessions").insert([
        { user_id: userId, message: aiResponse, is_user: false }
      ]);

    } catch (err) {
      console.error("AI response error:", err);
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: "Sorry, something went wrong.", isUser: false, timestamp: new Date() }
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-calm p-4">
      {/* Header */}
      <div className="flex items-center gap-4 pt-4 pb-2 bg-gradient-calm sticky top-0 z-10 shadow">
        <ArrowLeft
          className="cursor-pointer"
          onClick={() => navigate("/dashboard")}
        />
        <h1 className="ml-4 text-lg font-semibold">I’m Triggered</h1>
      </div>

      {/* Chat Area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 flex flex-col items-center space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] p-3 rounded-lg ${
              msg.isUser
                ? "bg-primary text-primary-foreground self-end"
                : "bg-white/80 backdrop-blur-sm text-black self-start shadow"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {showQuickActions && (
          <div className="w-full mt-4 space-y-2">
            <h2 className="text-center text-base font-medium text-muted-foreground">
              Here are a few quick actions you can try:
            </h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action, idx) => (
                <Card
                  key={idx}
                  className="bg-white/80 backdrop-blur-sm p-3 text-sm shadow-md max-w-[90%] cursor-pointer"
                  onClick={() => sendMessage(action)}
                >
                  {action}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 flex space-x-2 border-t bg-white/80">
        <input
          type="text"
          className="flex-1 p-2 border rounded-lg"
          placeholder="Type what you’re feeling..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim()}
        >
          <Send />
        </Button>
      </div>
    </div>
  );
};

export default RescueMe;
