import { useEffect, useState, useCallback } from "react";
import { getFoodLogs } from "../services/api";
import { Utensils, Target, Flame, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MEALS = ["breakfast","lunch","snacks","dinner"];
const MEAL_META = {
  breakfast: { label:"Breakfast", color:"#f59e0b" },
  lunch:     { label:"Lunch",     color:"#3b82f6" },
  snacks:    { label:"Snacks",    color:"#a78bfa" },
  dinner:    { label:"Dinner",    color:"#10b981" },
};

function ComparisonBar({ value, required, color }) {
  if (!required) return null;
  const pct     = Math.min((value / required) * 100, 130);
  const overshoot = pct > 100;
  return (
    <div className="relative mt-2">
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: overshoot
              ? "linear-gradient(90deg,#ef4444,#f87171)"
              : `linear-gradient(90deg,${color},${color}cc)`,
          }} />
      </div>
      <div className="absolute top-0 h-2 w-0.5 bg-white/40 rounded" style={{ left: "100%" }} />
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
    <div className="premium-matte p-6 flex items-center justify-center min-h-[300px]">
      <div className="w-10 h-10 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  // Prepare chart data
  const chartData = MEALS.map(m => ({
    name: m.charAt(0).toUpperCase() + m.slice(1),
    calories: data?.byMeal?.[m]?.reduce((acc, el) => acc + el.calories, 0) || 0,
    color: MEAL_META[m].color
  }));

  return (
    <div className="premium-matte p-6 lg:p-8 space-y-8 min-h-[300px] hover:border-blue-500/30 transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
           <Utensils size={18} className="text-blue-400" /> Nutrition Overview
        </h3>
        {goals?.mode && (
          <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest"
            style={{
              background: goals.mode === "surplus" ? "rgba(16,185,129,0.15)" : goals.mode === "deficit" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
              color:      goals.mode === "surplus" ? "#34d399"              : goals.mode === "deficit" ? "#f87171"               : "#60a5fa",
              border: `1px solid ${goals.mode === "surplus" ? "rgba(52,211,153,0.3)" : goals.mode === "deficit" ? "rgba(248,113,113,0.3)" : "rgba(96,165,250,0.3)"}`,
            }}>
            {goals.mode === "surplus" ? "Bulk" : goals.mode === "deficit" ? "Cut" : "Maintenance"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Col: Macros */}
        <div className="space-y-4">
          <div className="glass-panel p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all z-0" />
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calories</p>
                <Flame size={14} className="text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white">{totalCal}</p>
              {reqCal && (
                <>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Goal: {reqCal} kcal</p>
                  <ComparisonBar value={totalCal} required={reqCal} color="#f59e0b" />
                  <p className={`text-xs font-semibold mt-2 ${calDiff > 50 ? "text-red-400" : calDiff < -50 ? "text-blue-400" : "text-emerald-400"}`}>
                    {calDiff > 0 ? `+${calDiff}` : calDiff} kcal
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="glass-panel p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all z-0" />
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Protein</p>
                <Target size={14} className="text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-white">{totalProt}g</p>
              {reqProt && (
                <>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Goal: {reqProt}g</p>
                  <ComparisonBar value={totalProt} required={reqProt} color="#10b981" />
                  <p className={`text-xs font-semibold mt-2 ${protDiff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {protDiff >= 0 ? `+${protDiff}` : protDiff}g
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Distribution Chart */}
        <div className="glass-panel p-5 flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Meal Distribution</p>
              <TrendingUp size={14} className="text-slate-500" />
           </div>
           
           <div className="h-40 w-full relative z-10">
              {data?.logs?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={5} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Bar dataKey="calories" radius={[4, 4, 0, 0]} barSize={20}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <Utensils size={24} className="mb-2 text-slate-500" />
                  <p className="text-xs text-slate-400">No data. Start logging!</p>
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
