import { useState, useEffect } from "react";
import { getWeightPrediction, fetchProfile } from "../services/api";

function WeightCard({ label, weight, current, trend, days }) {
  const diff  = Math.round((weight - current) * 100) / 100;
  const pos   = diff > 0;
  const stable = Math.abs(diff) < 0.05;
  return (
    <div className="card-inner p-5 flex flex-col items-center text-center">
      <p className="label mb-3">{label}</p>
      <div className="relative mb-2">
        <div className="text-5xl font-black" style={{ color: stable ? "#60a5fa" : pos ? "#f59e0b" : "#34d399" }}>
          {weight}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">kg</div>
      </div>
      {!stable && (
        <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${pos ? "text-amber-400 bg-amber-400/10" : "text-emerald-400 bg-emerald-400/10"}`}
          style={{ border: `1px solid ${pos ? "rgba(251,191,36,0.3)" : "rgba(52,211,153,0.3)"}` }}>
          {pos ? "▲" : "▼"} {Math.abs(diff)} kg in {days} days
        </div>
      )}
      {stable && (
        <div className="mt-2 px-3 py-1 rounded-full text-xs font-bold text-blue-400 bg-blue-400/10"
          style={{ border:"1px solid rgba(96,165,250,0.3)" }}>
          ⟷ Stable
        </div>
      )}
    </div>
  );
}

function TrendVisual({ current, p7, p30 }) {
  const min = Math.min(current, p7, p30) - 1;
  const max = Math.max(current, p7, p30) + 1;
  const norm = v => ((v - min) / (max - min)) * 80;
  const pts = [
    { x: 10,  y: 90 - norm(current), label:"Now",    val:current },
    { x: 120, y: 90 - norm(p7),      label:"7 days", val:p7 },
    { x: 230, y: 90 - norm(p30),     label:"30 days", val:p30 },
  ];
  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox="0 0 250 100" className="w-full" style={{ height:90 }}>
      <defs>
        <linearGradient id="wline" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <polyline points={polyline} fill="none" stroke="url(#wline)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p,i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" />
          <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="7" fill="#94a3b8">{p.val}kg</text>
          <text x={p.x} y="98"      textAnchor="middle" fontSize="7" fill="#64748b">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

export default function WeightPrediction({ userId = 1 }) {
  const [currentWeight,  setCurrentWeight]  = useState("");
  const [goalWeight,     setGoalWeight]     = useState("");
  const [calorieIntake,  setCalorieIntake]  = useState("");
  const [result,         setResult]         = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);

  useEffect(() => {
    fetchProfile(userId).then(res => {
      if (res.data?.profile?.weight_kg) {
        setCurrentWeight(res.data.profile.weight_kg.toString());
      }
    }).catch(() => {});
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentWeight || !calorieIntake) return;
    setLoading(true); setError(null);
    try {
      const res = await getWeightPrediction({
        current_weight:  Number(currentWeight),
        goal_weight:     Number(goalWeight || currentWeight),
        calorie_intake:  Number(calorieIntake),
      });
      setResult(res.data);
    } catch {
      setError("Prediction failed. Check inputs.");
    } finally { setLoading(false); }
  };

  return (
    <div className="card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background:"linear-gradient(135deg,#0ea5e9,#06b6d4)", boxShadow:"0 4px 14px rgba(14,165,233,0.4)" }}>
          ⚖️
        </div>
        <div>
          <h2 className="section-title">Weight Prediction</h2>
          <p className="section-sub">AI-powered 7 &amp; 30-day forecast</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Current Weight (kg)</label>
            <div className="w-full bg-slate-800/30 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-300 flex justify-between items-center cursor-not-allowed">
              <span>{currentWeight || "—"}</span>
              <span className="text-[10px] text-slate-500 uppercase px-2 py-0.5 rounded-md bg-slate-800">From Profile</span>
            </div>
            {!currentWeight && <p className="text-[10px] text-amber-400 mt-1 ml-1">Please set your weight in the Profile tab.</p>}
          </div>
          <div>
            <label className="label">Goal Weight (kg)</label>
            <input type="number" min="30" max="300" step="0.1"
              value={goalWeight} onChange={e => setGoalWeight(e.target.value)}
              placeholder="e.g. 70"
              className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60" />
          </div>
        </div>
        <div>
          <label className="label">Daily Calorie Intake (kcal)</label>
          <input type="number" min="500" max="6000"
            value={calorieIntake} onChange={e => setCalorieIntake(e.target.value)}
            placeholder="e.g. 1800"
            className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60" />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={!currentWeight || !calorieIntake || loading}
          className="btn-primary w-full" style={{ background:"linear-gradient(135deg,#0ea5e9,#06b6d4)" }}>
          {loading ? "Predicting…" : "Predict My Weight →"}
        </button>
      </form>

      {result && (
        <div className="space-y-4 animate-slide-up">
          {/* Trend visual */}
          <div className="card-inner p-4">
            <p className="label mb-3">Weight Trajectory</p>
            <TrendVisual current={result.current_weight} p7={result.predicted_7d} p30={result.predicted_30d} />
          </div>

          {/* Prediction cards */}
          <div className="grid grid-cols-2 gap-4">
            <WeightCard label="7-Day Prediction"  weight={result.predicted_7d}  current={result.current_weight} days={7} />
            <WeightCard label="30-Day Prediction" weight={result.predicted_30d} current={result.current_weight} days={30} />
          </div>

          {/* Calorie insight */}
          <div className="card-inner p-4">
            <p className="label mb-2">Calorie Analysis</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-black text-amber-400">{result.calorie_intake}</p>
                <p className="text-[10px] text-slate-500">Intake (kcal)</p>
              </div>
              <div>
                <p className="text-lg font-black text-blue-400">{result.required_calories}</p>
                <p className="text-[10px] text-slate-500">Required (kcal)</p>
              </div>
              <div>
                <p className={`text-lg font-black ${result.calorie_difference > 0 ? "text-red-400" : "text-emerald-400"}`}>
                  {result.calorie_difference > 0 ? "+" : ""}{result.calorie_difference}
                </p>
                <p className="text-[10px] text-slate-500">Difference</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-center px-2 py-1.5 rounded-lg"
              style={{
                background: result.trend === "gaining" ? "rgba(245,158,11,0.1)" : result.trend === "losing" ? "rgba(16,185,129,0.1)" : "rgba(59,130,246,0.1)",
                color:      result.trend === "gaining" ? "#fbbf24"              : result.trend === "losing" ? "#34d399"               : "#60a5fa",
              }}>
              {result.trend === "gaining" && "📈 On a gaining trajectory — calorie surplus detected"}
              {result.trend === "losing"  && "📉 On a losing trajectory — calorie deficit detected"}
              {result.trend === "stable"  && "⟷ Weight stable — calorie balance near maintenance"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
