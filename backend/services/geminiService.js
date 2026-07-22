import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

/**
 * ── Resilient Gemini Response Generator ──────────────────────
 * Tries multiple model aliases in sequence to find one enabled 
 * for the user's specific API key/region.
 */
export async function generateResponse(prompt) {
  dotenv.config();
  const key = (process.env.GEMINI_API_KEY || "").trim();
  
  if (!key) {
    return "AI connection is not configured yet. Please add a valid Gemini API key to .env.";
  }

  // Model names to try in order of preference
  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-1.0-pro"
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[GeminiService] Attempting with model: ${modelName}`);
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        console.log(`[GeminiService] Success with ${modelName}`);
        return text.trim();
      }
    } catch (err) {
      console.warn(`[GeminiService] Model ${modelName} failed:`, err.status || err.message);
      lastError = err;
      continue; // Try the next one
    }
  }

  console.error("=== ALL GEMINI MODELS FAILED ===");
  console.error("Final Error Details:", lastError);
  
  return "I encountered an error while connecting to the AI. This is usually due to an invalid or restricted API key. Please check your .env settings.";
}
