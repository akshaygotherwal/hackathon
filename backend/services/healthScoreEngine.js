/**
 * Health Score Engine
 * Weights: Sleep 30% | Hydration 25% | Activity 20% | Meals 15% | Exercise 10%
 * Screen-time penalty applied on top.
 */
export function calculateHealthScore(data) {
  const {
    sleep_hours      = 0,
    water_intake     = 0,
    steps            = 0,
    meal_regularity  = 0,
    screen_time      = 0,
    exercise_minutes = 0,
  } = data;

  // Individual sub-scores (0-100)
  const sleepScore      = sleep_hours >= 8 ? 100 : Math.min((sleep_hours / 8) * 100, 100);
  const hydrationScore  = water_intake >= 3 ? 100 : Math.min((water_intake / 3) * 100, 100);
  const activityScore   = steps >= 10000   ? 100 : Math.min((steps / 10000) * 100, 100);
  const mealScore       = Math.min((meal_regularity / 4) * 100, 100);
  const exerciseScore   = exercise_minutes >= 30 ? 100 : Math.min((exercise_minutes / 30) * 100, 100);

  // Screen-time penalty: lose up to 10 points for 6+ hours
  const screenPenalty   = Math.min((Math.max(screen_time - 2, 0) / 4) * 10, 10);

  const raw =
    sleepScore    * 0.30 +
    hydrationScore* 0.25 +
    activityScore * 0.20 +
    mealScore     * 0.15 +
    exerciseScore * 0.10;

  return {
    total:     Math.round(Math.max(raw - screenPenalty, 0)),
    breakdown: {
      sleep:    Math.round(sleepScore),
      hydration:Math.round(hydrationScore),
      activity: Math.round(activityScore),
      meals:    Math.round(mealScore),
      exercise: Math.round(exerciseScore),
      screenPenalty: Math.round(screenPenalty),
    },
  };
}