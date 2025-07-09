import axios from "axios";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const generateGeminiRescueResponse = async (
  conversation: { text: string; isUser: boolean }[]
) => {
  try {
    const introMessage =
      "You are a compassionate, trauma-aware mental health assistant helping someone who is in a *triggered emotional state*. Your replies should be mid to short, gentle, and ask quetions to know what exactly they are feeling and reply which can help them feel better. Empathize and help ground them.once you feel like user is getting comfortable and not triggred after like 8-9 exchange of sentence(maybe less or more depends on user), give them message based on convo to let them know that the reason which caused trigger dont define user or something like that";

    // Build conversation: inject system prompt into first model message
    const cleanedConversation = conversation
      .filter((msg) => msg.text.trim() !== "")
      .map((msg, idx) => {
        if (idx === 0 && !msg.isUser) {
          return {
            role: "model",
            parts: [{ text: `${introMessage}\n\n${msg.text}` }]
          };
        }
        return {
          role: msg.isUser ? "user" : "model",
          parts: [{ text: msg.text }]
        };
      });

    console.log("📤 Cleaned request to Gemini:", cleanedConversation);

    const res = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      { contents: cleanedConversation },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const text =
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I couldn’t understand that.";
    return text;
  } catch (err) {
    console.error("❌ Error calling Gemini API", err);
    return "Sorry, something went wrong while talking to Gemini.";
  }
};