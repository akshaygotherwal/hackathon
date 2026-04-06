import { useEffect, useState, useCallback } from "react";
import { getFoodLogs } from "../services/api";

const MEALS = ["breakfast","lunch","snacks","dinner"];
const MEAL_META = {
  breakfast: { label:"Breakfast", emoji:"🌅", color:"#f59e0b" },
  lunch:     { label:"Lunch",     emoji:"☀️",  color:"#3b82f6" },
  snacks:    { label:"Snacks",    emoji:"🍎",  color:"#a78bfa" },
  dinner:    { label:"Dinner",    emoji:"🌙",  color:"#10b981" },
};

function ComparisonBar({ value, required, color }) {
  if (!required) return null;
  const pct     = Math.min((value / required) * 100, 130);
  const overshoot = pct > 100;
  return (
    <div className="relative mt-1">
      <div className="h-2 rounded-full bg-slate-700/60 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: overshoot
              ? "linear-gradient(90deg,#ef4444,#f87171)"
              : `linear-gradient(90deg,${color},${color}cc)`,
          }} />
      </div>
      {/* Goal marker */}
      <div className="absolute top-0 h-2 w-0.5 bg-white/40 rounded"
        style={{ left: "100%" }} />
    </div>
  );
}

export default function NutritionDashboard({ userId = 1, goals, refreshKey }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getFoodLogs(userId);
      setData(res.data);
    } catch { setData(null); }
    finally  { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const reqCal  = goals?.required_calories ?? null;
  const reqProt = goals?.required_protein  ?? null;
  const totalCal  = data?.totalCalories ?? 0;
  const totalProt = data?.totalProtein  ?? 0;

  const calDiff  = reqCal  ? Math.round(totalCal  - reqCal)  : null;
  const protDiff = reqProt ? Math.round((totalProt - reqProt) * 10) / 10 : null;

  if (loading) return (
    <div className="card p-6 flex items-center justify-center min-h-[200px]">
      <div className="w-8 h-8 border-2 border-emerald-500/40 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="card p-6 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background:"linear-gradient(135deg,#0ea5e9,#3b82f6)", boxShadow:"0 4px 14px rgba(59,130,246,0.4)" }}>
          📊
        </div>
        <div>
          <h2 className="section-title">Nutrition Dashboard</h2>
          <p className="section-sub">Today's intake vs your goal</p>
        </div>
      </div>

      {/* Total cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Calories */}
        <div className="card-inner p-4">
          <p className="label">Calories</p>
          <p className="text-3xl font-black text-amber-400">{totalCal}</p>
          {reqCal && (
            <>
              <p className="text-xs text-slate-500 mt-0.5">Goal: {reqCal} kcal</p>
              <ComparisonBar value={totalCal} required={reqCal} color="#f59e0b" />
              <p className={`text-xs font-semibold mt-1.5 ${calDiff > 50 ? "text-red-400" : calDiff < -50 ? "text-blue-400" : "text-emerald-400"}`}>
                {calDiff > 0 ? `+${calDiff}` : calDiff} kcal vs goal
              </p>
            </>
          )}
        </div>

        {/* Protein */}
        <div className="card-inner p-4">
          <p className="label">Protein</p>
          <p className="text-3xl font-black text-emerald-400">{totalProt}g</p>
          {reqProt && (
            <>
              <p className="text-xs text-slate-500 mt-0.5">Goal: {reqProt}g</p>
              <ComparisonBar value={totalProt} required={reqProt} color="#10b981" />
              <p className={`text-xs font-semibold mt-1.5 ${protDiff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {protDiff >= 0 ? `+${protDiff}` : protDiff}g vs goal
              </p>
            </>
          )}
        </div>
      </div>

      {/* Mode pill */}
      {goals?.mode && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mode:</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: goals.mode === "surplus" ? "rgba(16,185,129,0.15)" : goals.mode === "deficit" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
              color:      goals.mode === "surplus" ? "#34d399"              : goals.mode === "deficit" ? "#f87171"               : "#60a5fa",
              border: `1px solid ${goals.mode === "surplus" ? "rgba(52,211,153,0.3)" : goals.mode === "deficit" ? "rgba(248,113,113,0.3)" : "rgba(96,165,250,0.3)"}`,
            }}>
            {goals.mode === "surplus" ? "🟢 Bulk (+300 kcal)" : goals.mode === "deficit" ? "🔴 Cut (−300 kcal)" : "🔵 Maintenance"}
          </span>
        </div>
      )}

      {/* Meal breakdown */}
      {data?.logs?.length > 0 ? (
        <div className="space-y-3">
          <p className="label">Meal Breakdown</p>
          {MEALS.map(mealKey => {
            const entries = data.byMeal?.[mealKey] ?? [];
            if (!entries.length) return null;
            const meta   = MEAL_META[mealKey];
            const mCal   = Math.round(entries.reduce((s,e) => s + e.calories, 0));
            const mProt  = Math.round(entries.reduce((s,e) => s + e.protein,  0) * 10) / 10;
            return (
              <div key={mealKey} className="card-inner p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>{meta.emoji}</span> {meta.label}
                  </span>
                  <span className="text-xs text-slate-400">{mCal} kcal · {mProt}g protein</span>
                </div>
                <div className="space-y-1">
                  {entries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between text-xs text-slate-400 px-1">
                      <span>{entry.food_name} × {entry.quantity}</span>
                      <span style={{ color: meta.color }}>{entry.calories} kcal · {entry.protein}g</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 text-sm">
          <div className="text-4xl mb-2">🍽️</div>
          No food logged today yet. Start logging to see your nutrition breakdown!
        </div>
      )}
    </div>
  );
}
