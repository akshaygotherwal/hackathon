/**
 * Digital Twin Engine
 * Builds an averaged profile from a user's recent habit entries.
 * Optionally merges nutrition data (avg daily calories & protein).
 */
export function buildDigitalTwin(habits, nutritionData = null, mealData = null) {
  if (!habits || habits.length === 0) {
    return {
      sleep_avg:        0,
      water_avg:        0,
      steps_avg:        0,
      avg_meals_per_day:0,
      meal_regularity_score: 0,
      screen_avg:       0,
      exercise_avg:     0,
      entries_analysed: 0,
    };
  }

  const n = habits.length;

  const sum = habits.reduce(
    (acc, h) => ({
      sleep:    acc.sleep    + (h.sleep_hours      || 0),
      water:    acc.water    + (h.water_intake      || 0),
      steps:    acc.steps    + (h.steps             || 0),
      screen:   acc.screen   + (h.screen_time       || 0),
      exercise: acc.exercise + (h.exercise_minutes  || 0),
    }),
    { sleep: 0, water: 0, steps: 0, screen: 0, exercise: 0 }
  );

  return {
    sleep_avg:        Math.round((sum.sleep    / n) * 10) / 10,
    water_avg:        Math.round((sum.water    / n) * 10) / 10,
    steps_avg:        Math.round(sum.steps     / n),
    screen_avg:       Math.round((sum.screen   / n) * 10) / 10,
    exercise_avg:     Math.round(sum.exercise  / n),
    entries_analysed: n,
    // Meals (injected from meal stats)
    avg_meals_per_day: mealData?.totalMeals ?? 0,
    meal_regularity_score: mealData ? Math.min((mealData.totalMeals / 4) * 100, 100) : 0,
    // Nutrition (injected from nutritionEngine if provided)
    avg_calories:     nutritionData ? Math.round(nutritionData.calories) : null,
    avg_protein:      nutritionData ? Math.round(nutritionData.protein * 10) / 10 : null,
  };
}