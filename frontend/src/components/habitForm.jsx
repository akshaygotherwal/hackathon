import { useState } from "react";
import { logHabit } from "../services/api";

/* ─── Helpers ─────────────────────────────────────────────── */
const sliderBg = (val, min, max, good = true) => {
  const pct = ((val - min) / (max - min)) * 100;
  const color = good ? "#3b82f6" : "#f87171"; // bad when high (screen time)
  return { background: `linear-gradient(to right, ${color} ${pct}%, #1e293b ${pct}%)` };
};

/* ─── Sub-components ──────────────────────────────────────── */

function SleepSelector({ value, onChange }) {
  const emoji = value < 5 ? "😴" : value < 7 ? "🌙" : value <= 9 ? "✨" : "💤";
  const color  = value < 6 ? "#f87171" : value < 7.5 ? "#fbbf24" : "#34d399";
  return (
    <div>
      <div className="flex justify-between items-end mb-3">
        <span className="label !mb-0">🌙 Sleep Duration</span>
        <span className="text-2xl font-extrabold" style={{ color }}>
          {emoji} {value}h
        </span>
      </div>
      <input
        type="range" min={0} max={12} step={0.5} value={value}
        className="slider"
        style={sliderBg(value, 0, 12)}
        onChange={e => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-xs text-slate-600 mt-1 px-0.5">
        <span>0h</span><span>6h</span><span>12h</span>
      </div>
    </div>
  );
}

function WaterSelector({ value, onChange }) {
  const presets = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
  return (
    <div>
      <div className="flex justify-between items-end mb-3">
        <span className="label !mb-0">💧 Water Intake</span>
        <span className="text-2xl font-extrabold text-blue-400">{value}L</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`chip ${value === p ? "active" : ""}`}
          >
            {p}L
          </button>
        ))}
      </div>
      {/* Fine-tune slider */}
      <input
        type="range" min={0} max={5} step={0.25} value={value}
        className="slider mt-3"
        style={sliderBg(value, 0, 5)}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function StepsSelector({ value, onChange }) {
  const presets = [
    { label: "Sedentary",  val: 2500  },
    { label: "Light",      val: 5000  },
    { label: "Moderate",   val: 7500  },
    { label: "Active",     val: 10000 },
    { label: "Very Active",val: 12500 },
    { label: "Athlete",    val: 15000 },
  ];
  const color = value < 5000 ? "#f87171" : value < 8000 ? "#fbbf24" : "#34d399";
  return (
    <div>
      <div className="flex justify-between items-end mb-3">
        <span className="label !mb-0">🚶 Daily Steps</span>
        <span className="text-2xl font-extrabold" style={{ color }}>
          {value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {presets.map(({ label, val }) => (
          <button
            key={val}
            onClick={() => onChange(val)}
            className={`chip text-center !px-2 ${value === val ? "active" : ""}`}
          >
            <div className="font-bold">{val >= 1000 ? `${val/1000}K` : val}</div>
            <div className="text-[10px] opacity-70">{label}</div>
          </button>
        ))}
      </div>
      <input
        type="range" min={0} max={20000} step={500} value={value}
        className="slider"
        style={sliderBg(value, 0, 20000)}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function MealsSelector({ value, onChange }) {
  const options = [
    { val: 0, label: "None",    desc: "Skipping" },
    { val: 1, label: "1 meal",  desc: "One meal" },
    { val: 2, label: "2 meals", desc: "Light" },
    { val: 3, label: "3 meals", desc: "Ideal" },
    { val: 4, label: "4+ meals",desc: "Active" },
  ];
  return (
    <div>
      <p className="label mb-3">🍽️ Meals Per Day</p>
      <div className="flex gap-2">
        {options.map(({ val, label, desc }) => (
          <button
            key={val}
            onClick={() => onChange(val)}
            className={`pill flex-col gap-0.5 py-3 ${value === val ? "active" : ""}`}
          >
            <span className="text-base font-bold">{val}</span>
            <span className="text-[10px] font-medium opacity-70">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ScreenTimeSelector({ value, onChange }) {
  const presets = [
    { label: "Minimal",  val: 1 },
    { label: "Low",      val: 2 },
    { label: "Moderate", val: 4 },
    { label: "High",     val: 6 },
    { label: "Heavy",    val: 8 },
    { label: "Extreme",  val: 12 },
  ];
  const color = value <= 2 ? "#34d399" : value <= 4 ? "#fbbf24" : "#f87171";
  return (
    <div>
      <div className="flex justify-between items-end mb-3">
        <span className="label !mb-0">📱 Screen Time</span>
        <span className="text-2xl font-extrabold" style={{ color }}>{value}h</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {presets.map(({ label, val }) => (
          <button
            key={val}
            onClick={() => onChange(val)}
            className={`chip ${value === val ? "active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
      <input
        type="range" min={0} max={16} step={0.5} value={value}
        className="slider"
        style={sliderBg(value, 0, 16, false)} // red fill = bad
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function ExerciseSelector({ value, onChange }) {
  const presets = [
    { label: "Rest",      icon: "😴", val: 0  },
    { label: "15 min",    icon: "🧘", val: 15 },
    { label: "30 min",    icon: "🚴", val: 30 },
    { label: "45 min",    icon: "🏃", val: 45 },
    { label: "1 hour",    icon: "🏋️", val: 60 },
    { label: "90 min",    icon: "🏆", val: 90 },
  ];
  const color = value === 0 ? "#94a3b8" : value < 20 ? "#fbbf24" : "#34d399";
  return (
    <div>
      <div className="flex justify-between items-end mb-3">
        <span className="label !mb-0">🏋️ Exercise</span>
        <span className="text-2xl font-extrabold" style={{ color }}>
          {value === 0 ? "Rest day" : `${value} min`}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {presets.map(({ label, icon, val }) => (
          <button
            key={val}
            onClick={() => onChange(val)}
            className={`pill flex-col gap-0.5 py-3 ${value === val ? "active" : ""}`}
          >
            <span className="text-lg">{icon}</span>
            <span className="text-[11px]">{label}</span>
          </button>
        ))}
      </div>
      <input
        type="range" min={0} max={120} step={5} value={value}
        className="slider"
        style={sliderBg(value, 0, 120)}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/* ─── Main Form ────────────────────────────────────────────── */
const DEFAULTS = {
  sleep_hours: 7, water_intake: 2, steps: 7500,
  meal_regularity: 3, screen_time: 4, exercise_minutes: 30,
};

export default function HabitForm({ onSuccess }) {
  const [data,    setData]    = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState(null);

  const set = (key, val) => setData(d => ({ ...d, [key]: val }));

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await logHabit({ user_id: 1, ...data });
      showToast(`✅ Logged! Health score: ${res.data.score}`, "success");
      setData(DEFAULTS);
      onSuccess?.(res.data);
    } catch {
      showToast("❌ Failed to reach the server.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-7 animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h2 className="section-title text-2xl">📝 Log Today's Habits</h2>
        <p className="section-sub">Select your daily stats — no typing needed</p>
      </div>

      <SleepSelector    value={data.sleep_hours}      onChange={v => set("sleep_hours", v)} />
      <WaterSelector    value={data.water_intake}     onChange={v => set("water_intake", v)} />
      <StepsSelector    value={data.steps}            onChange={v => set("steps", v)} />
      <MealsSelector    value={data.meal_regularity}  onChange={v => set("meal_regularity", v)} />
      <ScreenTimeSelector value={data.screen_time}    onChange={v => set("screen_time", v)} />
      <ExerciseSelector value={data.exercise_minutes} onChange={v => set("exercise_minutes", v)} />

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {[
          { icon: "🌙", label: "Sleep",    val: `${data.sleep_hours}h` },
          { icon: "💧", label: "Water",    val: `${data.water_intake}L` },
          { icon: "🚶", label: "Steps",    val: data.steps >= 1000 ? `${(data.steps/1000).toFixed(1)}K` : data.steps },
          { icon: "🍽️", label: "Meals",    val: data.meal_regularity },
          { icon: "📱", label: "Screen",   val: `${data.screen_time}h` },
          { icon: "🏋️", label: "Exercise", val: `${data.exercise_minutes}m` },
        ].map(({ icon, label, val }) => (
          <div key={label} className="card-inner px-3 py-2">
            <span className="text-base">{icon}</span>
            <div className="text-slate-500 mt-0.5">{label}</div>
            <div className="font-bold text-white text-sm">{val}</div>
          </div>
        ))}
      </div>

      <button className="btn-primary w-full py-3.5 text-base" onClick={submit} disabled={loading}>
        {loading ? (
          <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg> Calculating…</>
        ) : "Save Today's Habits →"}
      </button>

      {toast && (
        <div className={`px-5 py-3 rounded-xl text-sm font-medium animate-slide-up ${
          toast.type === "success" ? "toast-success" : "toast-error"
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}