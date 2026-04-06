import { useEffect, useState } from "react";
import { fetchTwin, runSimulation } from "../services/api";

/* ──── Helpers ─────────────────────────────────────────── */
const sliderBg = (val, min, max, invert = false) => {
  const pct   = ((val - min) / (max - min)) * 100;
  const color = invert
    ? pct < 25 ? "#34d399" : pct < 55 ? "#fbbf24" : "#f87171"
    : pct > 60 ? "#34d399" : pct > 30 ? "#60a5fa" : "#f87171";
  return { background: `linear-gradient(to right, ${color} ${pct}%, #1e293b ${pct}%)` };
};

const fmtSteps = v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v;

/* ──── Metric config ───────────────────────────────────── */
const METRICS = [
  {
    key: "sleep", label: "Sleep Duration", icon: "🌙", unit: "hrs",
    min: 0, max: 12, step: 0.5, invert: false,
    chips: [5, 6, 7, 7.5, 8, 9],
    tip: "Adults need 7–9 hrs. Each 30 min below 7 hrs costs health points.",
  },
  {
    key: "water", label: "Water Intake", icon: "💧", unit: "L",
    min: 0, max: 5, step: 0.25, invert: false,
    chips: [1, 1.5, 2, 2.5, 3, 3.5],
    tip: "Target 2–3L daily. Hydration affects energy, skin, and organ function.",
  },
  {
    key: "steps", label: "Daily Steps", icon: "🚶", unit: "",
    min: 0, max: 15000, step: 500, invert: false,
    chips: [2500, 5000, 7500, 10000, 12500],
    chipFmt: fmtSteps,
    tip: "10,000 steps is the gold standard. Even 7,500 gives strong benefits.",
  },
  {
    key: "exercise", label: "Exercise Time", icon: "🏋️", unit: "min",
    min: 0, max: 120, step: 5, invert: false,
    pills: [0, 15, 30, 45, 60, 90],
    pillLabels: ["Rest","15m","30m","45m","1hr","90m"],
    tip: "30+ min of moderate exercise daily improves score significantly.",
  },
  {
    key: "screen", label: "Screen Time", icon: "📱", unit: "hrs",
    min: 0, max: 12, step: 0.5, invert: true,
    chips: [1, 2, 3, 4, 6, 8],
    tip: "Less is better. Over 6hrs/day applies a score penalty.",
  },
  {
    key: "meals", label: "Meals Per Day", icon: "🍽️", unit: "/day",
    min: 0, max: 4,  step: 1, invert: false,
    pills: [0, 1, 2, 3, 4],
    pillLabels: ["0","1","2","3","4+"],
    tip: "3 regular meals supports metabolism and energy balance.",
  },
];

const DEFAULTS = { sleep: 7, water: 2, steps: 7500, exercise: 30, screen: 4, meals: 3 };

/* ──── Metric Row Component ───────────────────────────── */
function MetricRow({ config, value, currentVal, onChange }) {
  const { key, label, icon, unit, min, max, step, invert, chips, chipFmt, pills, pillLabels, tip } = config;
  const [showTip, setShowTip] = useState(false);

  const isChanged = currentVal !== null && Math.abs(value - (currentVal || 0)) > 0.01;
  const improved  = isChanged && (invert ? value < currentVal : value > currentVal);

  return (
    <div className="card-inner p-4 space-y-3">
      {/* Label + value row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-bold text-slate-200">{label}</span>
          {isChanged && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              improved ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
            }`}>
              {improved ? "↑ Better" : "↓ Lower"}
            </span>
          )}
          <button onClick={() => setShowTip(t => !t)} className="text-slate-600 hover:text-slate-400 text-xs">ℹ️</button>
        </div>
        <div className="flex items-center gap-2">
          {currentVal !== null && (
            <span className="text-xs text-slate-600">
              now {key === "steps" ? fmtSteps(currentVal) : `${currentVal}${unit}`}
            </span>
          )}
          <span className="text-lg font-extrabold text-white">
            {key === "steps" ? fmtSteps(value) : value}{unit && key !== "meals" ? ` ${unit}` : ""}
          </span>
        </div>
      </div>

      {showTip && (
        <p className="text-xs text-slate-400 italic px-1 animate-fade-in">{tip}</p>
      )}

      {/* Chips */}
      {chips && (
        <div className="flex flex-wrap gap-2">
          {chips.map(c => (
            <button key={c} onClick={() => onChange(c)}
              className={`chip ${value === c ? "active" : ""}`}>
              {chipFmt ? chipFmt(c) : `${c}${unit}`}
            </button>
          ))}
        </div>
      )}

      {/* Pills */}
      {pills && (
        <div className="flex gap-1.5">
          {pills.map((p, i) => (
            <button key={p} onClick={() => onChange(p)}
              className={`pill !py-2 text-sm ${value === p ? "active" : ""}`}>
              {pillLabels?.[i] ?? p}
            </button>
          ))}
        </div>
      )}

      {/* Slider */}
      {key !== "meals" && (
        <input type="range" min={min} max={max} step={step} value={value}
          className="slider" style={sliderBg(value, min, max, invert)}
          onChange={e => onChange(Number(e.target.value))} />
      )}
    </div>
  );
}

/* ──── Impact Badge ───────────────────────────────────── */
function MetricImpact({ label, icon, current, predicted, unit = "" }) {
  const delta  = predicted - current;
  const pctBar = Math.min(predicted, 100);
  const hue    = predicted > 66 ? 142 : predicted > 33 ? 45 : 0;
  const status = delta > 2 ? { label: "Improved", cls: "text-emerald-400", arrow: "▲" }
               : delta < -2 ? { label: "Declined", cls: "text-red-400",     arrow: "▼" }
               : { label: "Stable",   cls: "text-slate-400",  arrow: "→" };

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-lg shrink-0 w-7 text-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-300 font-medium">{label}</span>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">{current}%</span>
            <span className="text-slate-600">→</span>
            <span className="font-bold text-slate-200">{predicted}%</span>
            <span className={`font-bold text-xs w-16 text-right ${status.cls}`}>
              {status.arrow} {Math.abs(delta)}pts {status.label}
            </span>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden relative" style={{ background: "#1e293b" }}>
          {/* Current */}
          <div className="absolute h-full rounded-full opacity-30"
            style={{ width: `${current}%`, background: `hsl(${hue},55%,55%)` }} />
          {/* Predicted */}
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pctBar}%`, background: `hsl(${hue},65%,55%)` }} />
        </div>
      </div>
    </div>
  );
}

/* ──── Main Component ─────────────────────────────────── */
export default function FutureSimulator() {
  const [twin,     setTwin]     = useState(null);
  const [scenario, setScenario] = useState(DEFAULTS);
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [twinLoading, setTwinLoading] = useState(true);

  // Load current twin so we can show "current vs target" on each slider
  useEffect(() => {
    fetchTwin(1)
      .then(res => {
        const t = res.data.twin;
        setTwin(t);
        if (t) {
          setScenario({
            sleep:    +(t.sleep_avg    || 7).toFixed(1),
            water:    +(t.water_avg    || 2).toFixed(2),
            steps:    Math.round(t.steps_avg   || 7500),
            exercise: Math.round(t.exercise_avg || 30),
            screen:   +(t.screen_avg   || 4).toFixed(1),
            meals:    Math.round(t.meal_avg     || 3),
          });
        }
      })
      .catch(() => {})
      .finally(() => setTwinLoading(false));
  }, []);

  const getCurrentVal = (key) => {
    if (!twin) return null;
    const map = {
      sleep: twin.sleep_avg, water: twin.water_avg,
      steps: twin.steps_avg, exercise: twin.exercise_avg,
      screen: twin.screen_avg, meals: twin.meal_avg,
    };
    return map[key] ?? null;
  };

  const set = (key, val) => setScenario(s => ({ ...s, [key]: val }));

  const predict = async () => {
    setLoading(true);
    try {
      const res = await runSimulation({ user_id: 1, ...scenario });
      setResult(res.data);
    } catch { setResult(null); }
    finally   { setLoading(false); }
  };

  const changedCount = twin
    ? METRICS.filter(m => Math.abs(scenario[m.key] - (getCurrentVal(m.key) || 0)) > 0.1).length
    : 0;

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div className="space-y-6 animate-fade-in">

      {/* ① Page header */}
      <div className="card p-6"
        style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.15),rgba(79,70,229,0.15))", border: "1px solid rgba(96,165,250,0.2)" }}>
        <div className="flex items-start gap-4">
          <div className="text-4xl">🔮</div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Scenario Planner</h1>
            <p className="text-slate-400 text-sm mt-1">
              Design a target habit day and instantly predict how your health score would change.
              Nothing gets logged — this is purely a simulation.
            </p>
            {changedCount > 0 && (
              <span className="inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(37,99,235,0.25)", color: "#93c5fd", border: "1px solid rgba(96,165,250,0.3)" }}>
                {changedCount} habit{changedCount > 1 ? "s" : ""} modified from your baseline
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ② Current baseline strip */}
      {!twinLoading && twin && (
        <div className="card p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            ① Your Current 7-Day Baseline
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {METRICS.map(({ key, icon, label, unit }) => {
              const v = getCurrentVal(key);
              return (
                <div key={key} className="card-inner p-3 text-center">
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-xs text-slate-500">{label.split(" ")[0]}</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    {v !== null ? (key === "steps" ? fmtSteps(v) : `${typeof v === "number" ? v.toFixed ? v.toFixed(1) : v : v}${unit}`) : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {twinLoading && (
        <div className="card p-5 text-center text-slate-500 text-sm">
          Loading your current baseline…
        </div>
      )}

      {!twinLoading && !twin && (
        <div className="card p-5 text-center text-slate-500 text-sm">
          No baseline yet. Log some habits first, then come back to simulate.
          The simulator will still work using default values.
        </div>
      )}

      {/* ③ Design your scenario */}
      <div className="card p-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">
          ② Design Your Target Day
        </p>
        <div className="space-y-4">
          {METRICS.map(m => (
            <MetricRow
              key={m.key}
              config={m}
              value={scenario[m.key]}
              currentVal={getCurrentVal(m.key)}
              onChange={v => set(m.key, v)}
            />
          ))}
        </div>
      </div>

      {/* ④ Predict button */}
      <button className="btn-primary w-full py-4 text-base" onClick={predict} disabled={loading}>
        {loading
          ? "Calculating…"
          : "🔮 Predict My Health Score →"}
      </button>

      {/* ⑤ Results */}
      {result && (
        <div className="space-y-4 animate-pop-in">

          {/* Score comparison */}
          <div className="card p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">
              ③ Prediction Results
            </p>

            {/* 3-column score strip */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* Current */}
              <div className="card-inner p-4 text-center">
                <p className="text-[11px] text-slate-500 mb-2 font-semibold">YOUR CURRENT SCORE</p>
                <p className="text-5xl font-black text-slate-300">{result.currentScore}</p>
                <p className="text-xs text-slate-500 mt-2">Based on your<br/>7-day average</p>
              </div>

              {/* Delta */}
              <div className={`rounded-2xl p-4 text-center border flex flex-col items-center justify-center ${
                result.delta > 0 ? "border-emerald-500/40" :
                result.delta < 0 ? "border-red-500/40" : "border-white/10"
              }`} style={{
                background: result.delta > 0 ? "rgba(52,211,153,0.1)" :
                            result.delta < 0 ? "rgba(248,113,113,0.1)" : "rgba(51,65,85,0.4)"
              }}>
                <p className="text-[11px] font-semibold mb-2" style={{ color: result.delta > 0 ? "#34d399" : result.delta < 0 ? "#f87171" : "#94a3b8" }}>
                  {result.delta > 0 ? "GAIN" : result.delta < 0 ? "LOSS" : "NO CHANGE"}
                </p>
                <p className="text-5xl font-black" style={{ color: result.delta > 0 ? "#34d399" : result.delta < 0 ? "#f87171" : "#94a3b8" }}>
                  {result.deltaLabel}
                </p>
                <p className="text-xs text-slate-500 mt-2">points</p>
              </div>

              {/* Predicted */}
              <div className="rounded-2xl p-4 text-center border border-blue-500/30"
                style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.2),rgba(79,70,229,0.2))" }}>
                <p className="text-[11px] text-blue-400 mb-2 font-semibold">PREDICTED SCORE</p>
                <p className="text-5xl font-black text-blue-300">{result.predictedScore}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {result.trend === "improvement" ? "🚀 Trending up" :
                   result.trend === "decline"      ? "⚠️ Trending down" : "✅ Stable"}
                </p>
              </div>
            </div>

            {/* Visual arrow */}
            <div className="flex items-center gap-3 justify-center mb-6">
              <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.1))" }} />
              <span className="text-xs text-slate-500">
                {result.delta > 0
                  ? `✅ Your new habits would raise your score by ${result.delta} points`
                  : result.delta < 0
                  ? `⚠️ Your new habits would lower your score by ${Math.abs(result.delta)} points`
                  : "Your habits would maintain your current level"}
              </span>
              <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.1))" }} />
            </div>

            {/* Per-metric breakdown */}
            {result.currentBreakdown && result.breakdown && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Per-Metric Impact
                </p>
                <div className="card-inner px-4 py-2">
                  {[
                    { key: "sleep",     label: "Sleep",     icon: "🌙" },
                    { key: "hydration", label: "Hydration", icon: "💧" },
                    { key: "activity",  label: "Activity",  icon: "🚶" },
                    { key: "meals",     label: "Meals",     icon: "🍽️" },
                    { key: "exercise",  label: "Exercise",  icon: "🏋️" },
                  ].map(({ key, label, icon }) => (
                    <MetricImpact
                      key={key}
                      label={label}
                      icon={icon}
                      current={result.currentBreakdown[key] ?? 0}
                      predicted={result.breakdown[key] ?? 0}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action plan */}
          <div className="card p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              ④ What This Means For You
            </p>
            <div className="space-y-3">
              {result.delta > 0 && (
                <div className="card-inner flex gap-3 p-4"
                  style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                  <span className="text-xl">✅</span>
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">This plan works!</p>
                    <p className="text-xs text-slate-400 mt-1">
                      By following these habits, your health score would rise from&nbsp;
                      <strong className="text-slate-200">{result.currentScore}</strong>&nbsp;to&nbsp;
                      <strong className="text-emerald-300">{result.predictedScore}</strong>.
                      Start with the habits that show the biggest improvement above.
                    </p>
                  </div>
                </div>
              )}
              {result.delta < 0 && (
                <div className="card-inner flex gap-3 p-4"
                  style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-red-300">This plan needs adjustment</p>
                    <p className="text-xs text-slate-400 mt-1">
                      These habits would lower your score by {Math.abs(result.delta)} points.
                      Look at the metrics marked "Declined" above and adjust those sliders upward.
                    </p>
                  </div>
                </div>
              )}
              {result.delta === 0 && (
                <div className="card-inner flex gap-3 p-4">
                  <span className="text-xl">📊</span>
                  <p className="text-xs text-slate-400">
                    This plan would maintain your current score. Try increasing sleep, water, or exercise
                    to push it higher.
                  </p>
                </div>
              )}

              {/* Biggest gain tip */}
              {result.currentBreakdown && result.breakdown && (() => {
                const metrics = [
                  { key: "sleep", label: "sleep", tip: "adding 30 more minutes of sleep" },
                  { key: "hydration", label: "hydration", tip: "drinking an extra 0.5L of water" },
                  { key: "activity", label: "steps", tip: "walking an extra 2,000 steps" },
                  { key: "exercise", label: "exercise", tip: "adding 15 minutes of exercise" },
                ];
                const biggest = metrics
                  .map(m => ({ ...m, gain: (result.breakdown[m.key] ?? 0) - (result.currentBreakdown[m.key] ?? 0) }))
                  .sort((a, b) => b.gain - a.gain)
                  .filter(m => m.gain > 0)[0];
                if (!biggest) return null;
                return (
                  <div className="card-inner flex gap-3 p-4"
                    style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)" }}>
                    <span className="text-xl">💡</span>
                    <div>
                      <p className="text-sm font-semibold text-blue-300">Biggest opportunity</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Your {biggest.label} shows the most room for improvement.
                        Even {biggest.tip} would noticeably boost your predicted score.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* CTA */}
          <p className="text-center text-xs text-slate-600">
            Ready to commit? Head to&nbsp;
            <button className="text-blue-400 underline" onClick={() => window.history.back()}>
              Log Habit
            </button>
            &nbsp;and enter these values to make them real.
          </p>
        </div>
      )}
    </div>
  );
}