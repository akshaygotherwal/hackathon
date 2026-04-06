import { createFoodLog, getFoodLogsToday, getFoodLogsByUser } from "../models/foodLogModel.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join }  from "path";

const __dirname  = dirname(fileURLToPath(import.meta.url));
const FOOD_DB    = JSON.parse(
  readFileSync(join(__dirname, "../data/foodDatabase.json"), "utf-8")
);

// ── GET /api/food/db ────────────────────────────────────────────
// Return the full food database so the frontend can populate selects
export async function getFoodDatabase(_req, res) {
  return res.json({ foods: FOOD_DB });
}

// ── POST /api/food/add ──────────────────────────────────────────
export async function addFoodLog(req, res) {
  try {
    const userId = req.body.user_id || 1;
    const { meal_type, food_name, quantity } = req.body;

    if (!meal_type || !food_name || quantity === undefined) {
      return res.status(400).json({ error: "meal_type, food_name, and quantity are required" });
    }

    const foodItem = FOOD_DB.find(
      (f) => f.name.toLowerCase() === food_name.toLowerCase()
    );
    if (!foodItem) {
      return res.status(404).json({ error: `Food "${food_name}" not found in database` });
    }

    const qty      = Number(quantity);
    const calories = Math.round(foodItem.calories_per_unit * qty * 10) / 10;
    const protein  = Math.round(foodItem.protein_per_unit  * qty * 10) / 10;

    const log = await createFoodLog(userId, {
      meal_type,
      food_name: foodItem.name,
      quantity:  qty,
      calories,
      protein,
    });

    return res.status(201).json({ log, calories, protein });
  } catch (err) {
    console.error("addFoodLog error:", err);
    return res.status(500).json({ error: "Failed to log food", detail: err.message });
  }
}

// ── GET /api/food/get/:userId ───────────────────────────────────
export async function getFoodLogs(req, res) {
  try {
    const userId = Number(req.params.userId);
    const logs   = await getFoodLogsToday(userId);

    // Aggregate per meal_type
    const byMeal = { breakfast: [], lunch: [], snacks: [], dinner: [] };
    logs.forEach((l) => {
      const key = l.meal_type.toLowerCase();
      if (byMeal[key]) byMeal[key].push(l);
    });

    const totalCalories = Math.round(logs.reduce((s, l) => s + l.calories, 0) * 10) / 10;
    const totalProtein  = Math.round(logs.reduce((s, l) => s + l.protein,  0) * 10) / 10;

    return res.json({ logs, byMeal, totalCalories, totalProtein });
  } catch (err) {
    console.error("getFoodLogs error:", err);
    return res.status(500).json({ error: "Failed to fetch food logs", detail: err.message });
  }
}
