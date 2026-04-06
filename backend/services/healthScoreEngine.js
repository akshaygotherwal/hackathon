/**
 * Health Score Engine
 * Weights: Sleep 27% | Hydration 22% | Activity 18% | Meals 13% | Exercise 10% | Nutrition 10%
 * Screen-time penalty applied on top.
 * Biometric BMI penalty applied if profile is available.
 */
export function calculateHealthScore(data, profile = null) {
  const {
    sleep_hours      = 0,
    water_intake     = 0,
    steps            = 0,
    meal_regularity,
    total_meals,
    screen_time      = 0,
    exercise_minutes = 0,
    // Optional nutrition fields (from food tracker)
    calories_intake   = null,
    protein_intake    = null,
    required_calories = null,
    required_protein  = null,
  } = data;

  const mealsCount = total_meals ?? meal_regularity ?? 0;

  // Individual sub-scores (0-100)
  const sleepScore      = sleep_hours >= 8 ? 100 : Math.min((sleep_hours / 8) * 100, 100);
  const hydrationScore  = water_intake >= 3 ? 100 : Math.min((water_intake / 3) * 100, 100);
  const activityScore   = steps >= 10000   ? 100 : Math.min((steps / 10000) * 100, 100);
  const mealScore       = Math.min((mealsCount / 4) * 100, 100);
  const exerciseScore   = exercise_minutes >= 30 ? 100 : Math.min((exercise_minutes / 30) * 100, 100);

  // Nutrition score — only active when food data is supplied
  let nutritionScore = null;
  if (calories_intake !== null && required_calories !== null && required_calories > 0) {
    const calRatio = calories_intake / required_calories;
    // Perfect score within 10% of target; penalise deviations
    const calScore = Math.max(0, 100 - Math.abs(calRatio - 1) * 200);
    let protScore  = 100;
    if (protein_intake !== null && required_protein && required_protein > 0) {
      protScore = Math.min((protein_intake / required_protein) * 100, 100);
    }
    nutritionScore = Math.round(calScore * 0.6 + protScore * 0.4);
  }

  // Screen-time penalty: lose up to 10 points for 6+ hours
  const screenPenalty = Math.min((Math.max(screen_time - 2, 0) / 4) * 10, 10);

  // Weighted base — nutrition replaces 10% taken from sleep/hydration/activity/meals
  let raw;
  if (nutritionScore !== null) {
    raw =
      sleepScore     * 0.27 +
      hydrationScore * 0.22 +
      activityScore  * 0.18 +
      mealScore      * 0.13 +
      exerciseScore  * 0.10 +
      nutritionScore * 0.10;
  } else {
    raw =
      sleepScore     * 0.30 +
      hydrationScore * 0.25 +
      activityScore  * 0.20 +
      mealScore      * 0.15 +
      exerciseScore  * 0.10;
  }

  // ── Biometric BMI Penalty ─────────────────────────────────
  let bmiPenalty = 0;
  let bmi = null;
  if (profile && profile.height_cm && profile.weight_kg) {
    const heightM = profile.height_cm / 100;
    bmi = profile.weight_kg / (heightM * heightM);
    // Healthy BMI: 18.5–24.9 → 0 penalty
    // Overweight: 25–29.9     → up to −10 pts
    // Obese: > 30             → up to −10 pts
    // Underweight: < 18.5     → up to −5 pts
    if (bmi > 24.9) {
      bmiPenalty = Math.min((bmi - 24.9) * 1.5, 10);
    } else if (bmi < 18.5) {
      bmiPenalty = Math.min((18.5 - bmi) * 1.5, 5);
    }
  }

  return {
    total: Math.round(Math.max(raw - screenPenalty - bmiPenalty, 0)),
    breakdown: {
      sleep:         Math.round(sleepScore),
      hydration:     Math.round(hydrationScore),
      activity:      Math.round(activityScore),
      meals:         Math.round(mealScore),
      exercise:      Math.round(exerciseScore),
      nutrition:     nutritionScore !== null ? Math.round(nutritionScore) : null,
      screenPenalty: Math.round(screenPenalty),
      bmiPenalty:    Math.round(bmiPenalty),
      bmi:           bmi ? Math.round(bmi * 10) / 10 : null,
    },
  };
}