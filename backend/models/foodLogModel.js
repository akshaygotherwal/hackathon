import { db } from "../database/memStore.js";

// ── Add a food log entry ────────────────────────────────────────
export async function createFoodLog(userId, data) {
  const { meal_type, food_name, quantity, calories, protein } = data;
  return db.insertFood({
    user_id:   userId,
    meal_type,
    food_name,
    quantity:  Number(quantity),
    calories:  Number(calories),
    protein:   Number(protein),
  });
}

// ── Get all food logs for a user today ─────────────────────────
export async function getFoodLogsToday(userId) {
  return db.selectFoodToday(userId);
}

// ── Get all food logs for a user (recent 30) ───────────────────
export async function getFoodLogsByUser(userId, limit = 30) {
  return db.selectFood(userId, limit);
}
