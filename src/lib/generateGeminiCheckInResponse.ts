import axios from "axios";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const isMissingKey = !GEMINI_API_KEY || GEMINI_API_KEY === "undefined" || GEMINI_API_KEY === "null";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const generateGeminiCheckInResponse = async (
  mood: string,
  intensity: number,
  attachmentStyle: string
) => {
  const prompt = `
You are a kind, trauma-aware emotional wellness companion.  
A user just checked in and said they feel **${mood}** with an intensity of **${intensity}/7**, and their attachment style is **${attachmentStyle}**.

✅ Write a short, empathetic message (3–4 sentences) to validate and reassure them.  
✅ Then suggest 3 unique, actionable self-care activities appropriate for their mood and intensity.  
✅ Return your answer as valid **pure JSON**, and nothing else — do NOT include any markdown or code fences.

The JSON format must be:
{
  "message": "your reassuring text here",
  "actions": [
    "first action here",
    "second action here",
    "third action here"
  ]
}
`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
  };

  try {
    if (isMissingKey) {
      console.error("Gemini API key missing: set VITE_GEMINI_API_KEY in your env");
      return '{"message":"I\'m here with you.","actions":[]}';
    }
    const res = await axios.post(GEMINI_URL, body, {
      headers: { "Content-Type": "application/json" }
    });

    const text =
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      '{"message":"I\'m here with you.","actions":[]}';

    return text.trim();
  } catch (err) {
    console.error("Gemini API error", err);
    return '{"message":"I\'m here with you.","actions":[]}';
  }
};