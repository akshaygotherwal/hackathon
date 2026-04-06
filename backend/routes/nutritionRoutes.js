import { Router } from "express";
import { getGoalRecommendations } from "../services/goalEngine.js";
import { predictWeight }          from "../services/weightPrediction.js";

const router = Router();

// POST /api/nutrition/goal
router.post("/goal", (req, res) => {
  try {
    const { current_weight, goal_weight } = req.body;
    if (!current_weight) return res.status(400).json({ error: "current_weight is required" });
    const result = getGoalRecommendations(current_weight, goal_weight ?? current_weight);
    if (!result) return res.status(400).json({ error: "Invalid weight values" });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Goal computation failed", detail: err.message });
  }
});

// POST /api/nutrition/predict-weight
router.post("/predict-weight", (req, res) => {
  try {
    const { current_weight, goal_weight, calorie_intake } = req.body;
    if (!current_weight || !calorie_intake) {
      return res.status(400).json({ error: "current_weight and calorie_intake are required" });
    }
    const goals  = getGoalRecommendations(current_weight, goal_weight ?? current_weight);
    const result = predictWeight(current_weight, calorie_intake, goals?.required_calories ?? 2000);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Weight prediction failed", detail: err.message });
  }
});

// GET /api/nutrition/meal-stats/:userId
router.get("/meal-stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    let { date } = req.query; // optional
    const { getMealStats } = await import("../services/nutritionEngine.js");
    const stats = await getMealStats(userId, date);
    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch meal stats", detail: err.message });
  }
});

export default router;
