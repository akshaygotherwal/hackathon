import { calculateHealthScore }   from "./healthScoreEngine.js";
import { predictWeight }           from "./weightPrediction.js";
import { getGoalRecommendations }  from "./goalEngine.js";

/**
 * Prediction Engine
 * Simulates future health score & weight given scenario overrides on top of the current twin.
 * Accepts an optional profile for BMI-based penalty.
 */
export function simulateFuture(currentTwin, changes, profile = null) {
  // Merge current twin averages with scenario overrides
  const simulated = {
    sleep_hours:      changes.sleep      ?? currentTwin.sleep_avg,
    water_intake:     changes.water      ?? currentTwin.water_avg,
    steps:            changes.steps      ?? currentTwin.steps_avg,
    meal_regularity:  changes.meals      ?? currentTwin.meal_avg ?? 3,
    screen_time:      changes.screen     ?? currentTwin.screen_avg ?? 4,
    exercise_minutes: changes.exercise   ?? currentTwin.exercise_avg ?? 0,
    // Nutrition overrides (optional — from food tracker simulation)
    calories_intake:  changes.calories   ?? null,
    protein_intake:   changes.protein    ?? null,
  };

  const current = {
    sleep_hours:      currentTwin.sleep_avg,
    water_intake:     currentTwin.water_avg,
    steps:            currentTwin.steps_avg,
    meal_regularity:  currentTwin.meal_avg   ?? 3,
    screen_time:      currentTwin.screen_avg  ?? 4,
    exercise_minutes: currentTwin.exercise_avg ?? 0,
    calories_intake:  currentTwin.avg_calories ?? null,
    protein_intake:   currentTwin.avg_protein  ?? null,
  };

  // Compute goal targets & weight prediction if weight supplied
  let weightPrediction = null;
  const cw = changes.current_weight ?? null;
  const gw = changes.goal_weight    ?? null;
  if (cw && simulated.calories_intake !== null) {
    const goals = getGoalRecommendations(cw, gw ?? cw);
    if (goals) {
      simulated.required_calories = goals.required_calories;
      simulated.required_protein  = goals.required_protein;
      weightPrediction = predictWeight(cw, simulated.calories_intake, goals.required_calories);
    }
  }

  const predictedResult = calculateHealthScore(simulated, profile);
  const currentResult   = calculateHealthScore(current,   profile);

  const delta = predictedResult.total - currentResult.total;

  return {
    currentScore:     currentResult.total,
    predictedScore:   predictedResult.total,
    delta,
    deltaLabel:       delta > 0 ? `+${delta}` : `${delta}`,
    trend:            delta > 0 ? "improvement" : delta < 0 ? "decline" : "stable",
    breakdown:        predictedResult.breakdown,
    currentBreakdown: currentResult.breakdown,
    currentHabits:    current,
    simulated,
    weightPrediction,
  };
}
