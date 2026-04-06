/**
 * In-Memory Store
 * Drop-in replacement for PostgreSQL while the DB isn't configured.
 * Data is lost on server restart — swap habitModel.js back to pg queries when DB is ready.
 */

let habitIdSeq = 1;
let scoreIdSeq = 1;

export const store = {
  habits:       [],  // { id, user_id, sleep_hours, water_intake, steps, meal_regularity, screen_time, exercise_minutes, created_at }
  healthScores: [],  // { id, user_id, habit_id, score, created_at }
};

// Simulate async DB behaviour
export const db = {
  async insert(table, row) {
    const now = new Date().toISOString();
    if (table === "habits") {
      const record = { ...row, id: habitIdSeq++, created_at: now };
      store.habits.push(record);
      return record;
    }
    if (table === "health_scores") {
      const record = { ...row, id: scoreIdSeq++, created_at: now };
      store.healthScores.push(record);
      return record;
    }
  },

  async select(table, userId, limit = 30) {
    if (table === "habits") {
      return store.habits
        .filter((h) => h.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit)
        .map((h) => {
          const scoreRow = store.healthScores.find((s) => s.habit_id === h.id);
          return { ...h, score: scoreRow?.score ?? null };
        });
    }
    return [];
  },

  async selectRecent(userId, days = 7) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return store.habits
      .filter((h) => h.user_id === userId && new Date(h.created_at) >= cutoff)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async selectWeeklyAnalytics(userId) {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = store.habits.filter(
      (h) => h.user_id === userId && new Date(h.created_at) >= cutoff
    );

    // Group by day
    const byDay = {};
    recent.forEach((h) => {
      const day = h.created_at.slice(0, 10);
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(h);
    });

    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, rows]) => {
        const avg = (key) =>
          Math.round((rows.reduce((s, r) => s + (r[key] || 0), 0) / rows.length) * 10) / 10;
        const scoreRows = rows.map((r) => {
          const s = store.healthScores.find((sc) => sc.habit_id === r.id);
          return s?.score ?? 0;
        });
        const avgScore = Math.round(scoreRows.reduce((a, b) => a + b, 0) / scoreRows.length);
        return {
          day,
          avg_sleep:         avg("sleep_hours"),
          avg_water:         avg("water_intake"),
          avg_steps:         avg("steps"),
          avg_meal_regularity: avg("meal_regularity"),
          avg_screen_time:   avg("screen_time"),
          avg_exercise:      avg("exercise_minutes"),
          avg_health_score:  avgScore,
        };
      });
  },
};
