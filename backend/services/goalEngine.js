/**
 * Goal Engine
 * Computes personalised calorie and protein targets based on current vs goal weight.
 *
 * Rules:
 *   protein_required  = weight × 1.8 g
 *   calories:
 *     goal > current  → bulk  (+300 surplus)
 *     goal < current  → cut   (−300 deficit)
 *     goal = current  → maintain (TDEE = weight × 33)
 */

const BASE_CALORIE_MULTIPLIER = 33; // rough TDEE approximation per kg (fallback)

export function getGoalRecommendations(currentWeight, goalWeight, profile = null) {
  const cw = Number(currentWeight);
  const gw = Number(goalWeight);

  if (!cw || cw <= 0) return null;

  let maintenanceCalories;

  if (profile && profile.height_cm && profile.age) {
    // Basic Mifflin-St Jeor BMR
    let bmr = (10 * cw) + (6.25 * profile.height_cm) - (5 * profile.age);
    if (profile.gender === "Female") {
      bmr -= 161;
    } else {
      bmr += 5; // Default/Male
    }
    // Multiply by 1.375 (Light Activity factor) as a baseline digital twin default
    maintenanceCalories = Math.round(bmr * 1.375);
  } else {
    maintenanceCalories = Math.round(cw * BASE_CALORIE_MULTIPLIER);
  }

  const proteinRequired     = Math.round(cw * 1.8 * 10) / 10;

  let mode, adjustment, requiredCalories;

  if (gw > cw) {
    mode             = "surplus";
    adjustment       = +300;
    requiredCalories = maintenanceCalories + 300;
  } else if (gw < cw) {
    mode             = "deficit";
    adjustment       = -300;
    requiredCalories = Math.max(maintenanceCalories - 300, 1200); // floor at 1200
  } else {
    mode             = "maintenance";
    adjustment       = 0;
    requiredCalories = maintenanceCalories;
  }

  return {
    required_calories:    requiredCalories,
    required_protein:     proteinRequired,
    maintenance_calories: maintenanceCalories,
    mode,
    adjustment,
    current_weight: cw,
    goal_weight:    gw,
    weight_delta:   Math.round((gw - cw) * 10) / 10,
  };
}
