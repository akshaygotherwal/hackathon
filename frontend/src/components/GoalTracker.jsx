import { useState, useEffect } from "react";
import { getGoalRecommendations, fetchProfile } from "../services/api";

export default function GoalTracker({ onGoalSet, userId = 1 }) {
  const [currentWeight, setCurrentWeight] = useState("");
  const [goalWeight,    setGoalWeight]    = useState("");
  const [result,        setResult]        = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  useEffect(() => {
    fetchProfile(userId).then(res => {
      if (res.data?.profile?.weight_kg) {
        setCurrentWeight(res.data.profile.weight_kg.toString());
      }
    }).catch(() => {});
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentWeight || !goalWeight) return;
    setLoading(true); setError(null);
    try {
      const res = await getGoalRecommendations(Number(currentWeight), Number(goalWeight));
      setResult(res.data);
      onGoalSet?.(res.data);
    } catch {
      setError("Failed to compute recommendations. Try again.");
    } finally { setLoading(false); }
  };

  const modeColor = result
    ? result.mode === "surplus"     ? { bg:"rgba(16,185,129,0.12)", border:"rgba(52,211,153,0.3)",  text:"#34d399" }
    : result.mode === "deficit"     ? { bg:"rgba(239,68,68,0.12)",  border:"rgba(248,113,113,0.3)", text:"#f87171" }
    :                                 { bg:"rgba(59,130,246,0.12)",  border:"rgba(96,165,250,0.3)",  text:"#60a5fa" }
    : null;

  return (
    <div className="card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)", boxShadow:"0 4px 14px rgba(139,92,246,0.4)" }}>
          🎯
        </div>
        <div>
          <h2 className="section-title">Goal Tracker</h2>
          <p className="section-sub">Set your weight goal &amp; get a personalised plan</p>
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
              value={goalWeight}
              onChange={e => setGoalWeight(e.target.value)}
              placeholder="e.g. 70"
              className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60" />
          </div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={!currentWeight || !goalWeight || loading}
          className="btn-primary w-full" style={{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)" }}>
          {loading ? "Calculating…" : "Get My Plan →"}
        </button>
      </form>

      {/* Results */}
      {result && modeColor && (
        <div className="space-y-4 animate-slide-up">
          {/* Mode banner */}
          <div className="px-4 py-3 rounded-xl text-sm font-semibold text-center"
            style={{ background: modeColor.bg, border:`1px solid ${modeColor.border}`, color: modeColor.text }}>
            {result.mode === "surplus"
              ? `🟢 Bulk Mode — eating +300 kcal above maintenance to gain ${Math.abs(result.weight_delta)} kg`
              : result.mode === "deficit"
              ? `🔴 Cut Mode — eating −300 kcal below maintenance to lose ${Math.abs(result.weight_delta)} kg`
              : "🔵 Maintenance Mode — keep current weight"}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:"Maintenance",   val:`${result.maintenance_calories} kcal`, sub:"base TDEE",         color:"#60a5fa" },
              { label:"Target Cals",   val:`${result.required_calories} kcal`,   sub:`${result.adjustment > 0 ? "+" : ""}${result.adjustment} kcal`, color: modeColor.text },
              { label:"Protein Goal",  val:`${result.required_protein}g`,          sub:"per day (1.8×kg)",   color:"#34d399" },
            ].map(s => (
              <div key={s.label} className="card-inner p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-lg font-black" style={{ color: s.color }}>{s.val}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="card-inner p-4 space-y-1.5">
            <p className="label">Recommendations</p>
            {result.mode === "surplus" && (
              <>
                <p className="text-xs text-slate-300">• Prioritise protein-dense foods to build lean mass</p>
                <p className="text-xs text-slate-300">• Spread surplus across 4–5 meals to avoid fat gain</p>
                <p className="text-xs text-slate-300">• Combine with strength training for best results</p>
              </>
            )}
            {result.mode === "deficit" && (
              <>
                <p className="text-xs text-slate-300">• Keep protein high (≥{result.required_protein}g) to preserve muscle</p>
                <p className="text-xs text-slate-300">• Prioritise whole foods to stay satiated on fewer calories</p>
                <p className="text-xs text-slate-300">• Add 10 000 steps/day to increase TDEE safely</p>
              </>
            )}
            {result.mode === "maintenance" && (
              <>
                <p className="text-xs text-slate-300">• Eat consistently across 3–4 meals for energy stability</p>
                <p className="text-xs text-slate-300">• Hit protein target daily for body composition</p>
                <p className="text-xs text-slate-300">• Monitor trends weekly and adjust if weight drifts</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
