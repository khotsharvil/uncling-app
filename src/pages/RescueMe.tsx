import React, { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateGeminiRescueResponse } from "@/lib/generateGeminiRescueResponse";
import { Card } from "@/components/ui/card";

const quickActions = [
  "Place your hand on your chest and feel your breath for 30 seconds.",
  "Step outside or look at something green for a moment.",
  "Drink a glass of water slowly, notice each sip.",
  "Name 3 things you can see, 2 you can touch, 1 you can hear."
];

const RescueMe = () => {
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState<
    { text: string; isUser: boolean }[]
  >([
    {
      text: "Take a deep breath. You’re safe here. Let’s acknowledge what you’re feeling.",
      isUser: false
    }
  ]);

  const [showQuickActions, setShowQuickActions] = useState(true);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();

    const updatedConversation = [
      ...conversation,
      { text: userMessage, isUser: true }
    ];
    setConversation(updatedConversation);
    setInput("");
    setShowQuickActions(false);

    try {
      const aiResponse = await generateGeminiRescueResponse(updatedConversation);

      setConversation((prev) => [
        ...prev,
        { text: aiResponse, isUser: false }
      ]);
    } catch (err) {
      setConversation((prev) => [
        ...prev,
        { text: "Sorry, something went wrong.", isUser: false }
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

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

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center space-y-2">
        {conversation.map((msg, idx) => (
          <div
            key={idx}
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
                  className="bg-white/80 backdrop-blur-sm p-3 text-sm shadow-md max-w-[90%]"
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
        <button
          onClick={sendMessage}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg"
        >
          <Send />
        </button>
      </div>
    </div>
  );
};

export default RescueMe;