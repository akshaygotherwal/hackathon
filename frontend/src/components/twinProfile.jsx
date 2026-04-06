import { useState, useEffect } from "react";
import { fetchProfile, saveProfile } from "../services/api";

const DEFAULTS = {
  height_cm: 170,
  weight_kg: 70,
  age: 30,
  gender: "Male"
};

export default function TwinProfile({ userId, onProfileSaved }) {
  const [profile,   setProfile]   = useState(DEFAULTS);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);

  useEffect(() => {
    fetchProfile(userId)
      .then(res => {
        if (res.data.profile) {
          setProfile({
            height_cm: res.data.profile.height_cm || DEFAULTS.height_cm,
            weight_kg: res.data.profile.weight_kg || DEFAULTS.weight_kg,
            age: res.data.profile.age || DEFAULTS.age,
            gender: res.data.profile.gender || DEFAULTS.gender,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      await saveProfile({ user_id: userId, ...profile });
      setToast({ type: "success", msg: "Profile saved! Your predictions are now updated." });
      if (onProfileSaved) onProfileSaved();
    } catch {
      setToast({ type: "error", msg: "Failed to save profile. Try again." });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  // BMI Calculation
  const heightM = profile.height_cm / 100;
  const bmi = profile.weight_kg / (heightM * heightM);
  let bmiClass = "Healthy";
  let bmiColor = "#34d399";
  let bmiBg = "rgba(52,211,153,0.15)";
  
  if (bmi < 18.5) {
    bmiClass = "Underweight";
    bmiColor = "#fbbf24";
    bmiBg = "rgba(251,191,36,0.15)";
  } else if (bmi > 24.9 && bmi <= 29.9) {
    bmiClass = "Overweight";
    bmiColor = "#fbbf24";
    bmiBg = "rgba(251,191,36,0.15)";
  } else if (bmi > 29.9) {
    bmiClass = "Obese";
    bmiColor = "#f87171";
    bmiBg = "rgba(248,113,113,0.15)";
  }

  const sliderBg = (val, min, max, mainColor) => {
    const pct = ((val - min) / (max - min)) * 100;
    return { background: `linear-gradient(to right, ${mainColor} ${pct}%, #1e293b ${pct}%)` };
  };

  if (loading) {
    return <div className="card p-8 text-center text-slate-500">Loading your profile...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold z-50 flex items-center gap-3 animate-pop-in ${
          toast.type === "success" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" 
                                   : "bg-red-500/20 text-red-400 border border-red-500/50"
        }`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="card p-6" style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.15),rgba(79,70,229,0.15))", border: "1px solid rgba(96,165,250,0.2)" }}>
        <div className="flex items-start gap-4">
          <div className="text-4xl">👤</div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Biometric Profile</h1>
            <p className="text-slate-400 text-sm mt-1">
              Provide your biometrics so your AI Digital Twin can generate highly accurate health predictions based on your body composition.
            </p>
          </div>
        </div>
      </div>

      {/* BMI Display */}
      <div className="card p-6 flex flex-col items-center">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Your Body Mass Index (BMI)</p>
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl w-full"
          style={{ background: bmiBg, border: `1px solid ${bmiColor}40` }}>
          <span className="text-5xl font-black mb-1" style={{ color: bmiColor }}>
            {bmi.toFixed(1)}
          </span>
          <span className="text-sm font-bold tracking-wide" style={{ color: bmiColor }}>
            {bmiClass}
          </span>
          <p className="text-xs text-slate-400 mt-3 text-center max-w-sm">
            {bmiClass === "Healthy" && "Great! Connecting healthy habits with a healthy body composition maximises your Twin Score."}
            {bmiClass === "Underweight" && "Being underweight can lower your maximum potential score. Ensure you're getting adequate nutrition."}
            {bmiClass === "Overweight" && "A slightly elevated BMI brings a minor penalty to your peak potential. Small daily habits make a big difference!"}
            {bmiClass === "Obese" && "An elevated BMI applies a significant penalty to your health score. Focus on step count and hydration today."}
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="card p-6 space-y-6">
        
        {/* Height */}
        <div className="card-inner p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-200">📏 Height</span>
            <span className="text-lg font-extrabold text-white">{profile.height_cm} cm</span>
          </div>
          <input type="range" min="120" max="230" step="1" value={profile.height_cm}
            className="slider" style={sliderBg(profile.height_cm, 120, 230, "#60a5fa")}
            onChange={e => set("height_cm", Number(e.target.value))} />
        </div>

        {/* Weight */}
        <div className="card-inner p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-200">⚖️ Weight</span>
            <span className="text-lg font-extrabold text-white">{profile.weight_kg} kg</span>
          </div>
          <input type="range" min="30" max="180" step="0.5" value={profile.weight_kg}
            className="slider" style={sliderBg(profile.weight_kg, 30, 180, "#34d399")}
            onChange={e => set("weight_kg", Number(e.target.value))} />
        </div>

        {/* Age */}
        <div className="card-inner p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-200">🎂 Age</span>
            <span className="text-lg font-extrabold text-white">{profile.age} years</span>
          </div>
          <input type="range" min="15" max="100" step="1" value={profile.age}
            className="slider" style={sliderBg(profile.age, 15, 100, "#a78bfa")}
            onChange={e => set("age", Number(e.target.value))} />
        </div>

        {/* Gender */}
        <div className="card-inner p-4 space-y-3">
          <span className="text-sm font-bold text-slate-200 mb-2 block">🚻 Biological Gender</span>
          <div className="flex gap-2">
            {["Male", "Female", "Other"].map(g => (
              <button key={g} onClick={() => set("gender", g)}
                className={`pill !py-2 flex-1 text-sm ${profile.gender === g ? "active" : ""}`}>
                {g}
              </button>
            ))}
          </div>
        </div>

      </div>

      <button className="btn-primary w-full py-4 text-base" onClick={handleSave} disabled={saving}>
        {saving ? "Saving Profile..." : "💾 Save & Recalibrate Twin"}
      </button>

    </div>
  );
}
