import { getRecentHabits } from "../models/habitModel.js";
import { buildDigitalTwin   } from "../services/digitalTwinEngine.js";
import { calculateHealthScore} from "../services/healthScoreEngine.js";
import { generateInsight     } from "../services/aiInsight.js";
import { getDailyNutrition, getMealStats } from "../services/nutritionEngine.js";
import { getGoalRecommendations } from "../services/goalEngine.js";

// GET /api/twin/:userId
export async function getTwin(req, res) {
  try {
    const { userId }    = req.params;
    const uid           = Number(userId);
    const recentHabits  = await getRecentHabits(uid, 7);

    if (recentHabits.length === 0) {
      return res.json({
        twin:    null,
        score:   null,
        insight: null,
        message: "No habit data yet. Log your first habit to activate your Digital Twin.",
      });
    }

    // Pull today's nutrition and meals
    const nutrition = await getDailyNutrition(uid);
    const mealStats = await getMealStats(uid);
    const twin      = buildDigitalTwin(recentHabits, nutrition.entries > 0 ? nutrition : null, mealStats);

    const { getProfile } = await import("../models/profileModel.js");
    const profile = await getProfile(uid);

    // Default goal recommendations (70 kg maintenance if no weight stored yet)
    // Pull weight from profile if available
    const baseWeight = profile?.weight_kg ?? twin.current_weight ?? 70;
    const goals = getGoalRecommendations(
      baseWeight,
      twin.goal_weight ?? baseWeight,
      profile
    );

    // Score the twin using its averages (+ nutrition if available)
    const habitData = {
      sleep_hours:      twin.sleep_avg,
      water_intake:     twin.water_avg,
      steps:            twin.steps_avg,
      total_meals:      twin.avg_meals_per_day,
      screen_time:      twin.screen_avg,
      exercise_minutes: twin.exercise_avg,
      calories_intake:  nutrition.entries > 0 ? nutrition.calories  : null,
      protein_intake:   nutrition.entries > 0 ? nutrition.protein   : null,
      required_calories: goals?.required_calories ?? null,
      required_protein:  goals?.required_protein  ?? null,
    };

    const { total: score, breakdown } = calculateHealthScore(habitData, profile);
    const insight = generateInsight(habitData, score);

    return res.json({ twin, score, breakdown, insight, nutrition, goals, mealStats });
  } catch (err) {
    console.error("getTwin error:", err);
    return res.status(500).json({ error: "Failed to build digital twin", detail: err.message });
  }
}
