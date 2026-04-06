import { useCallback, useEffect, useState } from "react";
import HabitForm          from "./habitForm";
import DigitalTwinCard    from "./digitaltwincard";
import HealthScore        from "./healthScore";
import FutureSimulator    from "./futureSimulator";
import WeeklyAnalytics    from "./weeklyAnalytics";
import AiInsightPanel     from "./aiInsightPanel";
import FoodLogger         from "./FoodLogger";
import NutritionDashboard from "./NutritionDashboard";
import GoalTracker        from "./GoalTracker";
import WeightPrediction   from "./WeightPrediction";
import { fetchTwin }      from "../services/api";

const USER_ID = 1;

const TABS = [
  { id: "overview",   label: "Overview",   icon: "🏠" },
  { id: "log",        label: "Log Habit",  icon: "📝" },
  { id: "nutrition",  label: "Nutrition",  icon: "🍽️" },
  { id: "simulate",   label: "Simulate",   icon: "🔮" },
  { id: "analytics",  label: "Analytics",  icon: "📈" },
];

export default function Dashboard() {
  const [twin,            setTwin]            = useState(null);
  const [twinScore,       setTwinScore]       = useState(null);
  const [latestScore,     setLatestScore]     = useState(null);
  const [latestBreakdown, setLatestBreakdown] = useState(null);
  const [latestInsight,   setLatestInsight]   = useState(null);
  const [twinGoals,       setTwinGoals]       = useState(null);   // goals from twin endpoint
  const [goalData,        setGoalData]        = useState(null);   // goals from GoalTracker
  const [refreshKey,      setRefreshKey]      = useState(0);
  const [foodRefreshKey,  setFoodRefreshKey]  = useState(0);
  const [activeTab,       setActiveTab]       = useState("overview");

  const loadTwin = useCallback(async () => {
    try {
      const { data } = await fetchTwin(USER_ID);
      setTwin(data.twin);
      setTwinScore(data.score);
      if (data.goals) setTwinGoals(data.goals);
      if (data.score !== null) {
        setLatestScore(     prev => prev !== null ? prev : data.score);
        setLatestBreakdown( prev => prev !== null ? prev : data.breakdown);
        setLatestInsight(   prev => prev !== null ? prev : data.insight);
      }
    } catch { /* server may be offline */ }
  }, []);

  useEffect(() => { loadTwin(); }, [loadTwin, refreshKey]);

  const handleHabitLogged = (data) => {
    setLatestScore(data.score);
    setLatestBreakdown(data.breakdown);
    setLatestInsight(data.insight);
    setRefreshKey(k => k + 1);
  };

  const handleFoodLogged = () => {
    setFoodRefreshKey(k => k + 1);
    setRefreshKey(k => k + 1);  // also refresh twin
  };

  const displayScore     = latestScore;
  const displayBreakdown = latestBreakdown;
  const displayInsight   = latestInsight;
  const activeGoals      = goalData ?? twinGoals;

  return (
    <div className="min-h-screen">

      {/* ── Top Nav ──────────────────────────────────────── */}
      <nav style={{
        background: "rgba(9,15,30,0.85)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#4f46e5)", boxShadow: "0 2px 12px rgba(37,99,235,0.5)" }}>
              🧬
            </div>
            <div>
              <p className="font-bold text-white text-base leading-none">Inception</p>
              <p className="text-[11px] text-slate-500 leading-none mt-0.5">AI Digital Twin</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`btn-ghost text-xs sm:text-sm ${activeTab === t.id ? "active" : ""}`}>
                <span className="hidden sm:inline">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Live score pill */}
          {(displayScore !== null || twinScore !== null) && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: "rgba(37,99,235,0.2)", border: "1px solid rgba(96,165,250,0.3)", color: "#93c5fd" }}>
              ⚡ Score {displayScore ?? twinScore}
            </div>
          )}
        </div>
      </nav>

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Hero banner — only when no data */}
        {activeTab === "overview" && displayScore === null && twinScore === null && (
          <div className="card p-8 mb-8 text-center animate-fade-in"
            style={{ background: "linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))" }}>
            <div className="text-5xl mb-3">🧬</div>
            <h1 className="text-3xl font-extrabold text-white mb-2">Your AI Digital Twin</h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Log your daily habits to activate your personalised health intelligence engine.
            </p>
            <button className="btn-primary mt-6 px-8" onClick={() => setActiveTab("log")}>
              Get Started →
            </button>
          </div>
        )}

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <HealthScore     score={displayScore ?? twinScore} breakdown={displayBreakdown} />
            <DigitalTwinCard twin={twin}   twinScore={twinScore} latestScore={displayScore} />
            <div className="lg:col-span-2">
              <AiInsightPanel insight={displayInsight} />
            </div>
          </div>
        )}

        {/* Log Habit */}
        {activeTab === "log" && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <HabitForm onSuccess={handleHabitLogged} />
            {displayScore !== null && (
              <div className="mt-6">
                <HealthScore score={displayScore} breakdown={displayBreakdown} />
              </div>
            )}
            {displayInsight && (
              <div className="mt-6">
                <AiInsightPanel insight={displayInsight} />
              </div>
            )}
          </div>
        )}

        {/* ── Nutrition Tab ─────────────────────────────────── */}
        {activeTab === "nutrition" && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                <FoodLogger userId={USER_ID} onLogged={handleFoodLogged} />
                <GoalTracker onGoalSet={setGoalData} />
              </div>
              {/* Right column */}
              <div className="space-y-6">
                <NutritionDashboard userId={USER_ID} goals={activeGoals} refreshKey={foodRefreshKey} />
                <WeightPrediction />
              </div>
            </div>
          </div>
        )}

        {/* Simulate */}
        {activeTab === "simulate" && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <FutureSimulator />
          </div>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && (
          <div className="animate-fade-in">
            <WeeklyAnalytics userId={USER_ID} refreshKey={refreshKey} />
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DigitalTwinCard twin={twin} twinScore={twinScore} latestScore={displayScore} />
              <AiInsightPanel  insight={displayInsight} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
