import {
  createHabit,
  saveHealthScore,
  getHabitsByUser,
  getWeeklyAnalytics,
} from "../models/habitModel.js";
import { calculateHealthScore } from "../services/healthScoreEngine.js";
import { generateInsight      } from "../services/aiInsight.js";

// POST /api/habits
export async function logHabit(req, res) {
  try {
    const userId = req.body.user_id || 1; // default user during dev
    const {
      sleep_hours,
      water_intake,
      steps,
      screen_time     = 0,
      exercise_minutes = 0,
    } = req.body;

    // Validate required fields
    if (
      sleep_hours     === undefined ||
      water_intake    === undefined ||
      steps           === undefined
    ) {
      return res.status(400).json({ error: "Missing required habit fields" });
    }

    const habit = await createHabit(userId, {
      sleep_hours,
      water_intake,
      steps,
      screen_time,
      exercise_minutes,
    });

    // Bring in profile to refine the score
    const { getProfile } = await import("../models/profileModel.js");
    const profile = await getProfile(userId);

    const scoreData = { ...habit, total_meals: 0 };
    const { total: score, breakdown } = calculateHealthScore(scoreData, profile);
    await saveHealthScore(userId, habit.id, score);

    const insight = generateInsight(habit, score);

    return res.status(201).json({ habit, score, breakdown, insight });
  } catch (err) {
    console.error("logHabit error:", err);
    return res.status(500).json({ error: "Failed to log habit", detail: err.message });
  }
}

// GET /api/habits/:userId
export async function getHabits(req, res) {
  try {
    const { userId } = req.params;
    const habits = await getHabitsByUser(Number(userId));
    return res.json({ habits });
  } catch (err) {
    console.error("getHabits error:", err);
    return res.status(500).json({ error: "Failed to fetch habits", detail: err.message });
  }
}

// GET /api/habits/:userId/weekly
export async function getWeekly(req, res) {
  try {
    const { userId } = req.params;
    const analytics = await getWeeklyAnalytics(Number(userId));
    return res.json({ analytics });
  } catch (err) {
    console.error("getWeekly error:", err);
    return res.status(500).json({ error: "Failed to fetch weekly data", detail: err.message });
  }
}
