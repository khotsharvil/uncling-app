import axios from "axios";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const generateGeminiResponse = async (userMessage: string) => {
  try {
    if (!GEMINI_API_KEY) {
      console.error("Gemini API key missing: set VITE_GEMINI_API_KEY in your env");
      return "Sorry, the AI service is temporarily unavailable.";
    }
    const prompt =
      "You are a compassionate and concise mental health companion. Validate the user’s feelings and offer gentle, helpful replies. Do not suggest talking to a friend or therapist unless the user explicitly asks about it. Keep your reply short, 3–5 sentences.\n\nUser: " +
      userMessage;

    const res = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 250,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const text =
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I couldn't understand that.";
    return text;
  } catch (err) {
    console.error("Error calling Gemini API", err);
    return "Sorry, something went wrong while talking to Gemini.";
  }
};