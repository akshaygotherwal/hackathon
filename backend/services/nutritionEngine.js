import { db } from "../database/memStore.js";

/**
 * Nutrition Engine
 * Aggregates today's food logs to return daily calorie and protein totals.
 */

export async function getDailyCalories(userId) {
  const logs = await db.selectFoodToday(Number(userId));
  return Math.round(logs.reduce((sum, l) => sum + (l.calories || 0), 0) * 10) / 10;
}

export async function getDailyProtein(userId) {
  const logs = await db.selectFoodToday(Number(userId));
  return Math.round(logs.reduce((sum, l) => sum + (l.protein || 0), 0) * 10) / 10;
}

export async function getDailyNutrition(userId) {
  const logs     = await db.selectFoodToday(Number(userId));
  const calories = Math.round(logs.reduce((s, l) => s + (l.calories || 0), 0) * 10) / 10;
  const protein  = Math.round(logs.reduce((s, l) => s + (l.protein  || 0), 0) * 10) / 10;
  return { calories, protein, entries: logs.length };
}
