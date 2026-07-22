import { getProfile } from "../models/profileModel.js";
import { getHabitsByUser } from "../models/habitModel.js";
import { getDailyNutrition } from "./nutritionEngine.js";
import { calculateHealthScore } from "./healthScoreEngine.js";

/**
 * Builds a structured text summary of the user's current health state.
 */
export async function buildUserContext(userId) {
  try {
    const profile = await getProfile(userId) || {};
    const habits  = await getHabitsByUser(userId, 1);
    const todayHabit = habits[0] || {};
    const nutrition = await getDailyNutrition(userId);
    
    // Calculate health score for today if habit exists
    let healthScore = "N/A";
    if (todayHabit.id) {
       const scoreResult = calculateHealthScore(todayHabit, profile);
       healthScore = scoreResult.total;
    }

    const context = `
USER PROFILE:
- Weight: ${profile.weight_kg || "Unknown"} kg
- Height: ${profile.height_cm || "Unknown"} cm
- Age: ${profile.age || "Unknown"}
- Gender: ${profile.gender || "Unknown"}

TODAY'S HABITS:
- Sleep: ${todayHabit.sleep_hours || 0} hours
- Water: ${todayHabit.water_intake || 0} L
- Steps: ${todayHabit.steps || 0}
- Screen Time: ${todayHabit.screen_time || 0} hours
- Exercise: ${todayHabit.exercise_minutes || 0} mins

TODAY'S NUTRITION:
- Calories: ${nutrition.calories || 0} kcal
- Protein: ${nutrition.protein || 0} g
- Food Items Logged: ${nutrition.entries || 0}

DIGITAL TWIN STATUS:
- Current Health Score: ${healthScore}
`;

    return context.trim();
  } catch (err) {
    console.error("User Context Builder Error:", err);
    return "User health data is currently unavailable.";
  }
}
