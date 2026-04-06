/**
 * Weight Prediction Engine
 *
 * Formula:
 *   calorie_difference      = intake − required
 *   weight_change_per_day   = calorie_difference / 7700   (1 kg ≈ 7700 kcal)
 *   future_weight           = current_weight + (weight_change_per_day × days)
 */

export function predictWeight(currentWeight, calorieIntake, requiredCalories) {
  const cw         = Number(currentWeight)   || 70;
  const intake     = Number(calorieIntake)   || 0;
  const required   = Number(requiredCalories) || 2000;

  const calorieDiff      = intake - required;
  const weightChangePerDay = calorieDiff / 7700;

  const predicted7d  = Math.round((cw + weightChangePerDay * 7)  * 100) / 100;
  const predicted30d = Math.round((cw + weightChangePerDay * 30) * 100) / 100;

  return {
    current_weight:        cw,
    calorie_intake:        intake,
    required_calories:     required,
    calorie_difference:    Math.round(calorieDiff),
    weight_change_per_day: Math.round(weightChangePerDay * 1000) / 1000,
    predicted_7d:          predicted7d,
    predicted_30d:         predicted30d,
    trend:
      calorieDiff > 50  ? "gaining" :
      calorieDiff < -50 ? "losing"  : "stable",
  };
}
