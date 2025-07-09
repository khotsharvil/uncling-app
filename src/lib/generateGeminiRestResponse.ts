import axios from "axios";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const generateGeminiRestResponse = async (
  conversation: { text: string; isUser: boolean }[]
) => {
  try {
    // ✅ Use 'user' role for system prompt because Gemini does not support 'system'
    const systemPrompt = {
      role: "user",
      parts: [
        {
          text:
            "You are a gentle, kind, and reflective companion. You help the user reflect on their day and leave themselves a note to remember tomorrow. Keep replies short and calm."
        }
      ]
    };

    const cleanedConversation = conversation
      .filter((msg) => msg.text && msg.text.trim() !== "")
      .map((msg) => ({
        // ✅ Gemini only supports 'user' and 'model' roles
        role: msg.isUser ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

    const requestBody = {
      contents: [systemPrompt, ...cleanedConversation]
    };

    console.log("📤 Sending cleaned request to Gemini API:", requestBody);

    const res = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json"
        }
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