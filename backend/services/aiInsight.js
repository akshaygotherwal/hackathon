/**
 * AI Insight Engine
 * Produces granular, actionable lifestyle recommendations based on habit data and score.
 */

const TIPS = {
  sleep: [
    "💤 You're getting less than 6 hours of sleep. Aim for at least 7–8 hours to restore cognitive function.",
    "🌙 Your sleep is slightly below optimal. Try a consistent bedtime routine to reach 8 hours.",
    "✅ Sleep duration is on point. Keep protecting your wind-down time.",
  ],
  hydration: [
    "💧 Critical dehydration risk. Drink at least 2.5 L of water daily — start with a glass every hour.",
    "🥤 You're slightly under-hydrated. Add one extra glass after each meal.",
    "✅ Great hydration! Keep a water bottle nearby to maintain this streak.",
  ],
  activity: [
    "🚶 Very low step count. Even a 20-minute walk each day will meaningfully boost your cardiovascular health.",
    "🏃 You're halfway to the 10 000-step goal. Try taking the stairs or a lunch-break walk.",
    "✅ Excellent activity level! Your cardiovascular system thanks you.",
  ],
  meals: [
    "🍽️ Irregular eating patterns detected. Skipping meals spikes cortisol and impairs focus — aim for 3+ regular meals.",
    "🥗 Try to hit at least 3 regular meals daily for stable energy levels.",
    "✅ Consistent meal regularity is helping your metabolism and energy balance.",
  ],
  exercise: [
    "🏋️ No structured exercise logged. Even 15 minutes of bodyweight training daily improves metabolism and mood.",
    "🤸 You're close to the 30-minute exercise target. Add a short workout session to unlock full benefits.",
    "✅ Great exercise habit! Consistency is the key — keep it up.",
  ],
  screen: [
    "📱 High screen time detected. Reduce to under 4 hours and use blue-light filters after 8 PM.",
    "💻 Your screen time is acceptable but watch for eye strain — take a 20-20-20 break every hour.",
    "✅ Screen time is well-managed. Your sleep quality will benefit.",
  ],
};

function tier(value, low, mid) {
  if (value < low) return 0;
  if (value < mid) return 1;
  return 2;
}

export function generateInsight(data, score) {
  const tips = [];

  tips.push(TIPS.sleep[tier(data.sleep_hours || 0, 6, 7.5)]);
  tips.push(TIPS.hydration[tier(data.water_intake || 0, 1.5, 2.5)]);
  tips.push(TIPS.activity[tier(data.steps || 0, 4000, 8000)]);
  tips.push(TIPS.meals[tier(data.meal_regularity || 0, 2, 3)]);
  tips.push(TIPS.exercise[tier(data.exercise_minutes || 0, 10, 25)]);
  tips.push(TIPS.screen[tier(10 - (data.screen_time || 0), 4, 7)]); // invert: less screen = better

  let headline;
  if (score >= 85)      headline = "🌟 Exceptional — your digital twin is thriving!";
  else if (score >= 70) headline = "👍 Good — a few tweaks will push you to peak performance.";
  else if (score >= 50) headline = "⚠️ Moderate — consistent improvements will have a big impact.";
  else                  headline = "🔴 Needs attention — small daily changes can turn this around fast.";

  return { headline, tips, score };
}