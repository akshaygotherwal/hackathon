import { calculateHealthScore } from "./healthScoreEngine.js";

/**
 * Prediction Engine
 * Simulates future health score given scenario overrides on top of the current twin.
 */
export function simulateFuture(currentTwin, changes) {
  // Merge current twin averages with scenario overrides
  const simulated = {
    sleep_hours:      changes.sleep      ?? currentTwin.sleep_avg,
    water_intake:     changes.water      ?? currentTwin.water_avg,
    steps:            changes.steps      ?? currentTwin.steps_avg,
    meal_regularity:  changes.meals      ?? currentTwin.meal_avg ?? 3,
    screen_time:      changes.screen     ?? currentTwin.screen_avg ?? 4,
    exercise_minutes: changes.exercise   ?? currentTwin.exercise_avg ?? 0,
  };

  const current = {
    sleep_hours:      currentTwin.sleep_avg,
    water_intake:     currentTwin.water_avg,
    steps:            currentTwin.steps_avg,
    meal_regularity:  currentTwin.meal_avg   ?? 3,
    screen_time:      currentTwin.screen_avg  ?? 4,
    exercise_minutes: currentTwin.exercise_avg ?? 0,
  };

  const predictedResult = calculateHealthScore(simulated);
  const currentResult   = calculateHealthScore(current);

  const delta = predictedResult.total - currentResult.total;

  return {
    currentScore:   currentResult.total,
    predictedScore: predictedResult.total,
    delta,
    deltaLabel:     delta > 0 ? `+${delta}` : `${delta}`,
    trend:          delta > 0 ? "improvement" : delta < 0 ? "decline" : "stable",
    breakdown:      predictedResult.breakdown,
    simulated,
  };
}