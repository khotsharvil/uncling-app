import axios from "axios";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const generateGeminiProgressInsight = async (notes: string) => {
  if (!notes || !notes.trim()) {
    return "Not enough data yet to generate an insight.";
  }

  notes = notes.trim().replace(/\s+/g, " ");

  try {
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Here are my recent check-in notes: ${notes}. Please summarize my emotional journey in one kind and encouraging sentence.`
            }
          ]
        }
      ]
    };

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
      "Not enough insight generated yet.";
    return text;
  } catch (err) {
    console.error("❌ Error generating progress insight:", err);
    return "Sorry, I couldn’t generate insight at this time.";
  }
};