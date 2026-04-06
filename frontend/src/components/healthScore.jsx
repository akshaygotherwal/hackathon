function scoreConfig(score) {
  if (score >= 85) return { cls: "score-excellent", hex: "#34d399", label: "Excellent",  emoji: "🌟" };
  if (score >= 70) return { cls: "score-good",      hex: "#60a5fa", label: "Good",        emoji: "👍" };
  if (score >= 50) return { cls: "score-moderate",  hex: "#fbbf24", label: "Moderate",    emoji: "⚡" };
  return               { cls: "score-poor",       hex: "#f87171", label: "Needs Work",  emoji: "🔴" };
}

function ScoreRing({ score, size = 160 }) {
  const { hex, label, emoji } = scoreConfig(score);
  const r = 56, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 130 130" className="-rotate-90">
          {/* Track */}
          <circle cx="65" cy="65" r={r} fill="none" stroke="#1e293b" strokeWidth="12" />
          {/* Glow */}
          <circle cx="65" cy="65" r={r} fill="none" stroke={hex} strokeWidth="12"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            opacity="0.2" />
          {/* Main arc */}
          <circle cx="65" cy="65" r={r} fill="none" stroke={hex} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 6px ${hex}80)` }}
          />
        </svg>
        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black" style={{ color: hex }}>{score}</span>
          <span className="text-xs text-slate-400 mt-1">{emoji} {label}</span>
        </div>
      </div>
    </div>
  );
}

const METRIC_BARS = [
  { key: "sleep",     label: "Sleep",     icon: "🌙" },
  { key: "hydration", label: "Hydration", icon: "💧" },
  { key: "activity",  label: "Activity",  icon: "🚶" },
  { key: "meals",     label: "Meals",     icon: "🍽️" },
  { key: "exercise",  label: "Exercise",  icon: "🏋️" },
];

export default function HealthScore({ score, breakdown }) {
  if (score === null || score === undefined) {
    return (
      <div className="card p-7 flex flex-col items-center justify-center min-h-64">
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="section-title text-center">Health Score</h2>
        <p className="text-slate-500 text-sm mt-2 text-center">Log a habit to calculate your score</p>
      </div>
    );
  }

  return (
    <div className="card p-7 animate-fade-in">
      <div className="mb-6">
        <h2 className="section-title">🎯 Health Score</h2>
        <p className="section-sub">Composite score based on all habits</p>
      </div>

      <div className="flex justify-center mb-8">
        <ScoreRing score={score} />
      </div>

      {breakdown && (
        <div className="space-y-3">
          {METRIC_BARS.map(({ key, label, icon }) => {
            const val = breakdown[key] ?? 0;
            const hue = val > 66 ? 142 : val > 33 ? 45 : 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">{icon} {label}</span>
                  <span className="font-bold text-slate-200">{val}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${val}%`, background: `hsl(${hue}, 65%, 55%)`, boxShadow: `0 0 8px hsl(${hue},65%,55%,0.4)` }} />
                </div>
              </div>
            );
          })}
          {breakdown.screenPenalty > 0 && (
            <p className="text-xs text-red-400 mt-1">📱 Screen time penalty: −{breakdown.screenPenalty} pts</p>
          )}
        </div>
      )}
    </div>
  );
}
