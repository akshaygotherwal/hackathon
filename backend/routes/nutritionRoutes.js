import { Router } from "express";
import { getGoalRecommendations } from "../services/goalEngine.js";
import { predictWeight }          from "../services/weightPrediction.js";

const router = Router();

// POST /api/nutrition/goal
router.post("/goal", async (req, res) => {
  try {
    const { user_id = 1, current_weight, goal_weight } = req.body;
    if (!current_weight) return res.status(400).json({ error: "current_weight is required" });
    
    // Fetch profile
    const { getProfile } = await import("../models/profileModel.js");
    const profile = await getProfile(user_id);

    const result = getGoalRecommendations(current_weight, goal_weight ?? current_weight, profile);
    if (!result) return res.status(400).json({ error: "Invalid weight values" });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Goal computation failed", detail: err.message });
  }
});

// POST /api/nutrition/predict-weight
router.post("/predict-weight", async (req, res) => {
  try {
    const { user_id = 1, current_weight, goal_weight, calorie_intake } = req.body;
    if (!current_weight || !calorie_intake) {
      return res.status(400).json({ error: "current_weight and calorie_intake are required" });
    }

    const { getProfile } = await import("../models/profileModel.js");
    const profile = await getProfile(user_id);

    const goals  = getGoalRecommendations(current_weight, goal_weight ?? current_weight, profile);
    const result = predictWeight(current_weight, calorie_intake, goals?.required_calories ?? 2000);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Weight prediction failed", detail: err.message });
  }
});

export default router;
