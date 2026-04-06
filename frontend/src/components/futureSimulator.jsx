import { useState } from "react";
import { runSimulation } from "../services/api";

const sliderBg = (val, min, max, invert = false) => {
  const pct = ((val - min) / (max - min)) * 100;
  const color = invert
    ? pct < 30 ? "#34d399" : pct < 60 ? "#fbbf24" : "#f87171"
    : pct > 60 ? "#34d399" : pct > 30 ? "#60a5fa" : "#f87171";
  return { background: `linear-gradient(to right, ${color} ${pct}%, #1e293b ${pct}%)` };
};

const SLIDERS = [
  {
    key: "sleep", label: "Sleep",  icon: "🌙", min: 0, max: 12, step: 0.5, unit: "hrs",
    invert: false, marks: ["0h","4h","8h","12h"],
    tips: ["Not enough", "Fair", "Optimal"],
  },
  {
    key: "water", label: "Water",  icon: "💧", min: 0, max: 5,  step: 0.25,unit: "L",
    invert: false, marks: ["0L","1.5L","3L","5L"],
    chips: [1, 1.5, 2, 2.5, 3, 3.5],
  },
  {
    key: "steps", label: "Steps",  icon: "🚶", min: 0, max: 15000, step: 500, unit: "",
    invert: false, marks: ["0","5K","10K","15K"],
    chips: [2500, 5000, 7500, 10000, 12500],
  },
  {
    key: "exercise", label: "Exercise", icon: "🏋️", min: 0, max: 120, step: 5, unit: "min",
    invert: false, marks: ["0","30m","60m","90m+"],
    chips: [0, 15, 30, 45, 60, 90],
  },
  {
    key: "screen",  label: "Screen", icon: "📱", min: 0, max: 12, step: 0.5, unit: "hrs",
    invert: true,  marks: ["0h","3h","6h","12h"],
    chips: [1, 2, 4, 6, 8],
  },
  {
    key: "meals",  label: "Meals",  icon: "🍽️", min: 0, max: 4,  step: 1, unit: "/day",
    invert: false, marks: ["0","1","2","3","4"],
    pills: [0,1,2,3,4],
  },
];

const DEFAULTS = { sleep: 8, water: 2.5, steps: 7000, meals: 3, exercise: 20, screen: 4 };

function formatVal(key, val) {
  if (key === "steps") return val >= 1000 ? `${(val/1000).toFixed(1)}K` : val;
  if (key === "meals") return `${val}/day`;
  return `${val}`;
}

export default function FutureSimulator() {
  const [values,  setValues]  = useState(DEFAULTS);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setValues(v => ({ ...v, [key]: Number(val) }));

  const simulate = async () => {
    setLoading(true);
    try {
      const res = await runSimulation({ user_id: 1, ...values });
      setResult(res.data);
    } catch { /* server offline */ }
    finally { setLoading(false); }
  };

  const delta = result?.delta ?? null;

  return (
    <div className="card p-7 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h2 className="section-title text-2xl">🔮 Future Simulator</h2>
        <p className="section-sub">Adjust your habits to predict your future health score</p>
      </div>

      <div className="space-y-7">
        {SLIDERS.map(({ key, label, icon, min, max, step, unit, invert, marks, chips, pills }) => {
          const val = values[key];
          return (
            <div key={key} className="card-inner p-4 space-y-3">
              {/* Label row */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-300">{icon} {label}</span>
                <span className="text-xl font-extrabold text-white">
                  {formatVal(key, val)}{unit && key !== "meals" ? ` ${unit}` : ""}
                </span>
              </div>

              {/* Chips / Pills */}
              {chips && (
                <div className="flex flex-wrap gap-1.5">
                  {chips.map(c => (
                    <button key={c} onClick={() => set(key, c)}
                      className={`chip ${val === c ? "active" : ""}`}>
                      {key === "steps" ? (c >= 1000 ? `${c/1000}K` : c) : `${c}${unit}`}
                    </button>
                  ))}
                </div>
              )}

              {/* Pill selector for meals */}
              {pills && (
                <div className="flex gap-2">
                  {pills.map(p => (
                    <button key={p} onClick={() => set(key, p)}
                      className={`pill ${val === p ? "active" : ""}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Slider */}
              {key !== "meals" && (
                <>
                  <input type="range" min={min} max={max} step={step} value={val}
                    className="slider"
                    style={sliderBg(val, min, max, invert)}
                    onChange={e => set(key, e.target.value)}
                  />
                  {marks && (
                    <div className="flex justify-between text-[10px] text-slate-600 px-0.5">
                      {marks.map(m => <span key={m}>{m}</span>)}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <button className="btn-primary w-full py-3.5 text-base mt-8" onClick={simulate} disabled={loading}>
        {loading ? "Running Simulation…" : "🔮 Predict My Future Score"}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-8 animate-pop-in">
          <p className="text-xs text-slate-500 uppercase tracking-widest text-center mb-4">Simulation Results</p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Current */}
            <div className="card-inner p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Current</p>
              <p className="text-4xl font-extrabold text-slate-300">{result.currentScore}</p>
            </div>
            {/* Delta */}
            <div className={`rounded-2xl p-4 text-center border ${
              delta > 0 ? "bg-emerald-500/10 border-emerald-500/30" :
              delta < 0 ? "bg-red-500/10 border-red-500/30" :
                          "card-inner border-white/5"
            }`}>
              <p className="text-xs text-slate-500 mb-1">Change</p>
              <p className={`text-4xl font-extrabold ${
                delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-slate-400"
              }`}>{result.deltaLabel}</p>
            </div>
            {/* Predicted */}
            <div className="rounded-2xl p-4 text-center"
              style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.25), rgba(79,70,229,0.25))", border: "1px solid rgba(96,165,250,0.3)" }}>
              <p className="text-xs text-slate-400 mb-1">Predicted</p>
              <p className="text-4xl font-extrabold text-blue-300">{result.predictedScore}</p>
            </div>
          </div>

          {/* Breakdown bars */}
          {result.breakdown && (
            <div className="card-inner p-4 space-y-2.5">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Score Breakdown</p>
              {Object.entries(result.breakdown)
                .filter(([k]) => k !== "screenPenalty")
                .map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span className="capitalize">{key}</span>
                      <span className="font-semibold text-slate-200">{val}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${val}%`, background: `hsl(${val * 1.2}, 65%, 55%)` }} />
                    </div>
                  </div>
                ))}
            </div>
          )}

          <p className="text-center text-xs text-slate-500 mt-4">
            Trend: <span className={`font-bold capitalize ${
              result.trend === "improvement" ? "text-emerald-400" :
              result.trend === "decline"     ? "text-red-400" : "text-slate-400"
            }`}>{result.trend}</span>
          </p>
        </div>
      )}
    </div>
  );
}