import { db } from "../database/memStore.js";

/**
 * ── Save a chat message ──────────────────────────────────────
 */
export async function saveMessage(userId, role, message) {
  return db.insert("chat_messages", { user_id: userId, role, message });
}

/**
 * ── Get recent chat history ──────────────────────────────────
 */
export async function getChatHistory(userId, limit = 10) {
  return db.select("chat_messages", userId, limit);
}
