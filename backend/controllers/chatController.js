import { saveMessage, getChatHistory } from "../models/chatModel.js";
import { generateResponse         } from "../services/geminiService.js";
import { getRelevantContext       } from "../services/ragEngine.js";
import { buildUserContext         } from "../services/userContextBuilder.js";

/**
 * POST /api/chat
 */
export async function handleChatMessage(req, res) {
  try {
    const userId      = req.body.user_id || 1;
    const userQuery   = req.body.message;
    
    if (!userQuery) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 1. Fetch History
    const history = await getChatHistory(userId, 10);
    const historyText = history
      .map((m) => `${m.role === "user" ? "User" : "Coach"}: ${m.message}`)
      .join("\n");

    // 2. Fetch RAG Context
    const ragContext = getRelevantContext(userQuery);

    // 3. Fetch User context
    const userContext = await buildUserContext(userId);

    // 4. Build prompt
    const fullPrompt = `
You are a smart AI fitness coach connected to a user's Digital Twin.

RULES:
- Give personalized advice based on user data.
- Use the fitness knowledge provided.
- Be concise but helpful.
- Never give medical advice.
- Explain reasoning simply.
- If data is unknown, encourage the user to log it.

USER DATA:
${userContext}

FITNESS KNOWLEDGE (RAG):
${ragContext}

CHAT HISTORY:
${historyText || "No previous history."}

USER QUERY:
${userQuery}

COACH RESPONSE:
`;

    console.log("=== CHAT PROMPT START ===");
    console.log(fullPrompt);
    console.log("=== CHAT PROMPT END ===");

    // 5. Call Gemini
    const aiResponse = await generateResponse(fullPrompt);

    // 6. Save messages
    await saveMessage(userId, "user", userQuery);
    await saveMessage(userId, "assistant", aiResponse);

    return res.json({ response: aiResponse });
  } catch (err) {
    console.error("Chat Controller Error:", err);
    return res.status(500).json({ error: "Failed to process chat", detail: err.message });
  }
}

/**
 * GET /api/chat/history
 */
export async function getHistory(req, res) {
  try {
    const userId = req.query.user_id || 1;
    const history = await getChatHistory(Number(userId));
    return res.json({ history });
  } catch (err) {
    console.error("Get History Error:", err);
    return res.status(500).json({ error: "Failed to fetch chat history" });
  }
}
