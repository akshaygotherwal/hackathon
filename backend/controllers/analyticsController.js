import { getWeeklyAnalytics } from "../models/habitModel.js";

// GET /api/analytics/:userId/weekly
export async function weeklyAnalytics(req, res) {
  try {
    const { userId } = req.params;
    const analytics  = await getWeeklyAnalytics(Number(userId));

    // Shape data for the frontend Recharts line chart
    const chartData = analytics.map((row) => ({
      day:         row.day,
      healthScore: Number(row.avg_health_score),
      sleep:       Number(row.avg_sleep),
      water:       Number(row.avg_water),
      steps:       Number(row.avg_steps),
      exercise:    Number(row.avg_exercise),
    }));

    return res.json({ chartData, total: chartData.length });
  } catch (err) {
    console.error("weeklyAnalytics error:", err);
    return res.status(500).json({ error: "Failed to fetch analytics", detail: err.message });
  }
}
