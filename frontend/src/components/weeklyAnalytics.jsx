import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { fetchAnalytics } from "../services/api";

/* ─── Normalise raw habit values to 0–100 for the chart ──── */
const NORM = {
  healthScore: { max: 100,   label: "Health Score", color: "#60a5fa", unit: "pts"  },
  sleep:       { max: 12,    label: "Sleep",         color: "#a78bfa", unit: "hrs"  },
  water:       { max: 5,     label: "Water",         color: "#34d399", unit: "L"    },
  steps:       { max: 15000, label: "Steps",         color: "#fb923c", unit: "steps"},
};

function normalise(row) {
  return {
    day:               row.day,
    // raw values for tooltip
    _healthScore: row.healthScore,
    _sleep:       row.sleep,
    _water:       row.water,
    _steps:       row.steps,
    // normalised 0–100 for chart
    healthScore:  Math.round(row.healthScore),
    sleep:        Math.round((row.sleep  / NORM.sleep.max)  * 100),
    water:        Math.round((row.water  / NORM.water.max)  * 100),
    steps:        Math.round((row.steps  / NORM.steps.max)  * 100),
  };
}

/* ─── Custom Tooltip ─────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const raw = payload[0]?.payload;
  const items = [
    { key: "healthScore", label: "🎯 Health Score", val: `${raw._healthScore} pts`,   color: NORM.healthScore.color },
    { key: "sleep",       label: "🌙 Sleep",         val: `${raw._sleep} hrs`,         color: NORM.sleep.color },
    { key: "water",       label: "💧 Water",          val: `${raw._water} L`,           color: NORM.water.color },
    { key: "steps",       label: "🚶 Steps",          val: Number(raw._steps).toLocaleString(), color: NORM.steps.color },
  ];
  return (
    <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 8, fontWeight: 600 }}>
        {new Date(label).toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
      </p>
      {items.map(({ key, label: l, val, color }) => (
        <div key={key} style={{ display: "flex", justifyContent: "space-between", gap: 24, marginTop: 4 }}>
          <span style={{ color: "#94a3b8", fontSize: 12 }}>{l}</span>
          <span style={{ color, fontWeight: 700, fontSize: 12 }}>{val}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function WeeklyAnalytics({ userId = 1, refreshKey }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchAnalytics(userId)
      .then(res => {
        const raw = res.data.chartData || [];
        setData(raw.map(normalise));
        setError(null);
      })
      .catch(() => setError("Could not load analytics data"))
      .finally(() => setLoading(false));
  }, [userId, refreshKey]);

  const avgScore = data.length
    ? Math.round(data.reduce((s, d) => s + d._healthScore, 0) / data.length)
    : null;

  return (
    <div className="card p-7 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="section-title">📈 Weekly Analytics</h2>
          <p className="section-sub">7-day health score & habit trends (all values normalised to 0–100)</p>
        </div>
        {avgScore !== null && (
          <div className="text-center px-4 py-2 rounded-xl"
            style={{ background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.3)" }}>
            <p className="text-xl font-black text-blue-300">{avgScore}</p>
            <p className="text-[10px] text-slate-400">Week avg</p>
          </div>
        )}
      </div>

      {/* Legend pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(NORM).map(([key, { label, color }]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span style={{ width: 24, height: 3, borderRadius: 2, background: color, display: "inline-block" }} />
            {label}
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64 text-slate-500 text-sm gap-2">
          <svg className="animate-spin h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Loading analytics…
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <span className="text-4xl">📊</span>
          <p className="text-slate-500 text-sm">No data yet — log some habits to see your chart!</p>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.07)" }}
              tickLine={false}
              tickFormatter={d => new Date(d).toLocaleDateString("en", { weekday: "short", day: "numeric" })}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}`}
            />
            {/* Reference zones */}
            <ReferenceLine y={85} stroke="#34d399" strokeDasharray="4 4" strokeOpacity={0.3}
              label={{ value: "Excellent", fill: "#34d399", fontSize: 10, position: "right" }} />
            <ReferenceLine y={70} stroke="#60a5fa" strokeDasharray="4 4" strokeOpacity={0.3}
              label={{ value: "Good", fill: "#60a5fa", fontSize: 10, position: "right" }} />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />

            {Object.entries(NORM).map(([key, { color }]) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={key === "healthScore" ? 3 : 1.5}
                dot={key === "healthScore"
                  ? { r: 5, fill: color, strokeWidth: 0, filter: "drop-shadow(0 0 4px " + color + ")" }
                  : { r: 3, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 7, fill: color, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Note */}
      {data.length > 0 && (
        <p className="text-xs text-slate-600 text-center mt-4">
          Sleep, water, and steps scaled to 0–100 for comparison. Hover for actual values.
        </p>
      )}
    </div>
  );
}
