import { db } from "../database/memStore.js";

// ── Create a new habit log ──────────────────────────────────
export async function createHabit(userId, data) {
  const {
    sleep_hours,
    water_intake,
    steps,
    meal_regularity,
    screen_time      = 0,
    exercise_minutes = 0,
  } = data;

  return db.insert("habits", {
    user_id: userId,
    sleep_hours:      Number(sleep_hours),
    water_intake:     Number(water_intake),
    steps:            Number(steps),
    meal_regularity:  Number(meal_regularity),
    screen_time:      Number(screen_time),
    exercise_minutes: Number(exercise_minutes),
  });
}

// ── Persist a health score linked to a habit ───────────────
export async function saveHealthScore(userId, habitId, score) {
  return db.insert("health_scores", { user_id: userId, habit_id: habitId, score });
}

// ── Get recent habits for a user (with scores) ─────────────
export async function getHabitsByUser(userId, limit = 30) {
  return db.select("habits", userId, limit);
}

// ── Get last N days of habits (for digital twin) ───────────
export async function getRecentHabits(userId, days = 7) {
  return db.selectRecent(userId, days);
}

// ── Weekly per-day analytics ───────────────────────────────
export async function getWeeklyAnalytics(userId) {
  return db.selectWeeklyAnalytics(userId);
}
