import { useEffect, useState } from "react";
import { getFoodDatabase, addFood } from "../services/api";

const MEAL_TYPES = [
  { id: "breakfast", label: "Breakfast", emoji: "🌅" },
  { id: "lunch",     label: "Lunch",     emoji: "☀️" },
  { id: "snacks",    label: "Snacks",    emoji: "🍎" },
  { id: "dinner",    label: "Dinner",    emoji: "🌙" },
];

export default function FoodLogger({ userId = 1, onLogged }) {
  const [foods,    setFoods]    = useState([]);
  const [meal,     setMeal]     = useState("breakfast");
  const [food,     setFood]     = useState("");
  const [qty,      setQty]      = useState(1);
  const [preview,  setPreview]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [toast,    setToast]    = useState(null);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    getFoodDatabase()
      .then(r => setFoods(r.data.foods))
      .catch(() => {});
  }, []);

  // Live calorie / protein preview
  useEffect(() => {
    if (!food) { setPreview(null); return; }
    const item = foods.find(f => f.name === food);
    if (item) {
      setPreview({
        calories: Math.round(item.calories_per_unit * qty * 10) / 10,
        protein:  Math.round(item.protein_per_unit  * qty * 10) / 10,
      });
    }
  }, [food, qty, foods]);

  const filtered = search
    ? foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : foods;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!food || qty <= 0) return;
    setLoading(true);
    try {
      const res = await addFood({ user_id: userId, meal_type: meal, food_name: food, quantity: qty });
      setToast({ type: "success", msg: `✅ Logged ${qty}× ${food} — ${res.data.calories} kcal` });
      setFood(""); setQty(1); setSearch(""); setPreview(null);
      onLogged?.();
    } catch {
      setToast({ type: "error", msg: "❌ Failed to log food. Try again." });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow:"0 4px 14px rgba(16,185,129,0.4)" }}>
          🍽️
        </div>
        <div>
          <h2 className="section-title">Food Logger</h2>
          <p className="section-sub">Track your meals &amp; fuel your twin</p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium animate-slide-up ${toast.type === "success" ? "toast-success" : "toast-error"}`}>
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Meal selector */}
        <div>
          <label className="label">Meal Type</label>
          <div className="grid grid-cols-4 gap-2">
            {MEAL_TYPES.map(m => (
              <button key={m.id} type="button"
                onClick={() => setMeal(m.id)}
                className={`pill flex-col gap-1 py-3 ${meal === m.id ? "active" : ""}`}>
                <span className="text-lg">{m.emoji}</span>
                <span className="text-xs">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Food search & select */}
        <div>
          <label className="label">Food Item</label>
          <input
            type="text" placeholder="Search food…"
            value={search}
            onChange={e => { setSearch(e.target.value); setFood(""); }}
            className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 mb-2"
          />
          <select
            value={food}
            onChange={e => setFood(e.target.value)}
            className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/60">
            <option value="">-- Select food --</option>
            {filtered.map(f => (
              <option key={f.name} value={f.name}>
                {f.name} ({f.calories_per_unit} kcal / {f.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="label">Quantity</label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setQty(q => Math.max(0.5, q - 0.5))}
              className="w-9 h-9 rounded-lg bg-slate-700/60 text-white font-bold flex items-center justify-center hover:bg-slate-600/80 transition-colors">−</button>
            <input type="number" min="0.5" step="0.5"
              value={qty} onChange={e => setQty(Number(e.target.value))}
              className="flex-1 bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white text-center focus:outline-none focus:border-blue-500/60" />
            <button type="button" onClick={() => setQty(q => q + 0.5)}
              className="w-9 h-9 rounded-lg bg-slate-700/60 text-white font-bold flex items-center justify-center hover:bg-slate-600/80 transition-colors">+</button>
          </div>
        </div>

        {/* Live Preview */}
        {preview && (
          <div className="card-inner p-4 animate-pop-in">
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest font-bold">Preview</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-2xl font-black text-amber-400">{preview.calories}</p>
                <p className="text-xs text-slate-400">kcal</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-400">{preview.protein}g</p>
                <p className="text-xs text-slate-400">protein</p>
              </div>
            </div>
          </div>
        )}

        <button type="submit" disabled={!food || qty <= 0 || loading}
          className="btn-primary w-full" style={{ background:"linear-gradient(135deg,#059669,#10b981)" }}>
          {loading ? "Logging…" : "Log Food Entry →"}
        </button>
      </form>
    </div>
  );
}
