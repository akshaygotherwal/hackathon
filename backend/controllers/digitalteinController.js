import { getRecentHabits } from "../models/habitModel.js";
import { buildDigitalTwin   } from "../services/digitalTwinEngine.js";
import { calculateHealthScore} from "../services/healthScoreEngine.js";
import { generateInsight     } from "../services/aiInsight.js";

// GET /api/twin/:userId
export async function getTwin(req, res) {
  try {
    const { userId } = req.params;
    const recentHabits = await getRecentHabits(Number(userId), 7);

    if (recentHabits.length === 0) {
      return res.json({
        twin:    null,
        score:   null,
        insight: null,
        message: "No habit data yet. Log your first habit to activate your Digital Twin.",
      });
    }

    const twin    = buildDigitalTwin(recentHabits);

    // Score the twin using its averages
    const habitData = {
      sleep_hours:      twin.sleep_avg,
      water_intake:     twin.water_avg,
      steps:            twin.steps_avg,
      meal_regularity:  twin.meal_avg,
      screen_time:      twin.screen_avg,
      exercise_minutes: twin.exercise_avg,
    };

    const { getProfile } = await import("../models/profileModel.js");
    const profile = await getProfile(Number(userId));

    const { total: score, breakdown } = calculateHealthScore(habitData, profile);
    const insight = generateInsight(habitData, score);

    return res.json({ twin, score, breakdown, insight });
  } catch (err) {
    console.error("getTwin error:", err);
    return res.status(500).json({ error: "Failed to build digital twin", detail: err.message });
  }
}
