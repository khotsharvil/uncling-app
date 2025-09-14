import axios from "axios";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const generateGeminiRestResponse = async (
  conversation: { text: string; isUser: boolean }[]
) => {
  try {
    // ✅ Enhanced system prompt
    const systemPrompt = {
      role: "user",
      parts: [
        {
          text: `
You are a gentle, empathetic, and reflective companion. 
Analyze the user's messages carefully and provide a kind, calm response.
Include:
1. Positive moments or small wins mentioned by the user
2. Emotional patterns or triggers
3. Practical guidance or encouragement for tomorrow
Reference the user's exact words naturally. Keep the tone calm, supportive, and detailed, like a friendly diary companion.
        `
        }
      ]
    };

    const cleanedConversation = conversation
      .filter((msg) => msg.text && msg.text.trim() !== "")
      .map((msg) => ({
        role: msg.isUser ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

    const requestBody = {
      contents: [systemPrompt, ...cleanedConversation]
    };

    console.log("📤 Sending request to Gemini API:", requestBody);

    const res = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      requestBody,
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
