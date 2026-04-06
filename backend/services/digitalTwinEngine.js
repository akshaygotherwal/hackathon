/**
 * Digital Twin Engine
 * Builds an averaged profile from a user's recent habit entries.
 */
export function buildDigitalTwin(habits) {
  if (!habits || habits.length === 0) {
    return {
      sleep_avg:        0,
      water_avg:        0,
      steps_avg:        0,
      meal_avg:         0,
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
      meal:     acc.meal     + (h.meal_regularity   || 0),
      screen:   acc.screen   + (h.screen_time       || 0),
      exercise: acc.exercise + (h.exercise_minutes  || 0),
    }),
    { sleep: 0, water: 0, steps: 0, meal: 0, screen: 0, exercise: 0 }
  );

  return {
    sleep_avg:        Math.round((sum.sleep    / n) * 10) / 10,
    water_avg:        Math.round((sum.water    / n) * 10) / 10,
    steps_avg:        Math.round(sum.steps     / n),
    meal_avg:         Math.round((sum.meal     / n) * 10) / 10,
    screen_avg:       Math.round((sum.screen   / n) * 10) / 10,
    exercise_avg:     Math.round(sum.exercise  / n),
    entries_analysed: n,
  };
}