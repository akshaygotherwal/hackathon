import { getRecentHabits } from "../models/habitModel.js";
import { buildDigitalTwin } from "../services/digitalTwinEngine.js";
import { simulateFuture   } from "../services/predictionEngine.js";

// POST /api/simulate
export async function simulate(req, res) {
  try {
    const userId  = req.body.user_id || 1;
    const changes = req.body; // { sleep, water, steps, meals, screen, exercise }

    // Build current twin from last 7 days
    const recentHabits = await getRecentHabits(Number(userId), 7);
    const currentTwin  = buildDigitalTwin(recentHabits);

    const { getProfile } = await import("../models/profileModel.js");
    const profile = await getProfile(Number(userId));

    const result = simulateFuture(currentTwin, changes, profile);

    return res.json(result);
  } catch (err) {
    console.error("simulate error:", err);
    return res.status(500).json({ error: "Simulation failed", detail: err.message });
  }
}
