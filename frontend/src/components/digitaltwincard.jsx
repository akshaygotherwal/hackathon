const METRICS = [
  { key: "sleep_avg",    label: "Sleep",     icon: "🌙", unit: "hrs",  max: 10,    invert: false },
  { key: "water_avg",    label: "Water",     icon: "💧", unit: "L",    max: 4,     invert: false },
  { key: "steps_avg",    label: "Steps",     icon: "🚶", unit: "",     max: 12000, invert: false, fmt: v => v >= 1000 ? `${(v/1000).toFixed(1)}K` : v },
  { key: "meal_avg",     label: "Meals/Day", icon: "🍽️", unit: "/day", max: 4,     invert: false },
  { key: "screen_avg",   label: "Screen",    icon: "📱", unit: "hrs",  max: 12,    invert: true  },
  { key: "exercise_avg", label: "Exercise",  icon: "🏋️", unit: "min",  max: 60,    invert: false },
];

function MetricBar({ value, max, invert }) {
  const pct = Math.min((value / max) * 100, 100);
  const dp  = invert ? 100 - pct : pct;
  const hue = dp > 66 ? 142 : dp > 33 ? 45 : 0;
  return (
    <div className="h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: "#1e293b" }}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: `hsl(${hue},65%,55%)` }} />
    </div>
  );
}

export default function DigitalTwinCard({ twin, twinScore, latestScore }) {
  if (!twin) {
    return (
      <div className="card p-7 flex flex-col items-center justify-center min-h-64">
        <div className="text-5xl mb-4">🧬</div>
        <h2 className="section-title text-center">Digital Twin</h2>
        <p className="text-slate-500 text-sm mt-2 text-center">No data yet — log habits to build your profile</p>
      </div>
    );
  }

  return (
    <div className="card p-7 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="section-title">🧬 Digital Twin</h2>
          <p className="section-sub">7-day rolling habit averages</p>
        </div>

        {/* Score badges */}
        <div className="flex flex-col gap-2 items-end">
          {/* Latest (most recent log) */}
          {latestScore !== null && (
            <div className="text-center px-3 py-1.5 rounded-xl"
              style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.3),rgba(79,70,229,0.3))", border: "1px solid rgba(96,165,250,0.4)" }}>
              <p className="text-xl font-black text-blue-200 leading-none">{latestScore}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Latest</p>
            </div>
          )}
          {/* Twin average */}
          {twinScore !== null && (
            <div className="text-center px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(51,65,85,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xl font-black text-slate-300 leading-none">{twinScore}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">7-day avg</p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {METRICS.map(({ key, label, icon, unit, max, invert, fmt }) => {
          const raw     = twin[key] ?? 0;
          const display = fmt ? fmt(raw) : typeof raw === "number" ? raw.toLocaleString() : raw;
          return (
            <div key={key} className="card-inner p-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{icon} {label}</span>
                <span className="font-bold text-slate-200 text-sm">
                  {display}
                  {unit && <span className="text-slate-500 text-[10px] ml-0.5">{unit}</span>}
                </span>
              </div>
              <MetricBar value={raw} max={max} invert={invert} />
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-600 text-center mt-4">
        Based on&nbsp;
        <span className="text-slate-400 font-semibold">{twin.entries_analysed}</span>
        &nbsp;{twin.entries_analysed === 1 ? "entry" : "entries"} in the last 7 days
      </p>
    </div>
  );
}
