import { useCallback, useEffect, useState } from "react";
import { Home, Edit3, PieChart, FlaskConical, BarChart2, User as UserIcon, Activity } from "lucide-react";

import HabitForm          from "../components/habitForm";
import FutureSimulator    from "../components/futureSimulator";
import WeeklyAnalytics    from "../components/weeklyAnalytics";
import FoodLogger         from "../components/FoodLogger";
import NutritionDashboard from "../components/NutritionDashboard";
import GoalTracker        from "../components/GoalTracker";
import WeightPrediction   from "../components/WeightPrediction";
import TwinProfile        from "../components/twinProfile";

import HeroSection      from "../components/HeroSection";
import HealthScoreCard  from "../components/HealthScoreCard";
import DigitalTwin      from "../components/DigitalTwin";
import InsightChat      from "../components/InsightChat";

import { fetchTwin }      from "../services/api";

const USER_ID = 1;

const TABS = [
  { id: "overview",   label: "Overview",   icon: <Home size={16} /> },
  { id: "log",        label: "Log Habit",  icon: <Edit3 size={16} /> },
  { id: "nutrition",  label: "Nutrition",  icon: <PieChart size={16} /> },
  { id: "simulate",   label: "Simulate",   icon: <FlaskConical size={16} /> },
  { id: "analytics",  label: "Analytics",  icon: <BarChart2 size={16} /> },
  { id: "profile",    label: "Profile",    icon: <UserIcon size={16} /> },
];

export default function Dashboard() {
  const [twin,            setTwin]            = useState(null);
  const [twinScore,       setTwinScore]       = useState(null);
  const [latestScore,     setLatestScore]     = useState(null);
  const [latestBreakdown, setLatestBreakdown] = useState(null);
  const [latestInsight,   setLatestInsight]   = useState(null);
  const [twinGoals,       setTwinGoals]       = useState(null);
  const [goalData,        setGoalData]        = useState(null);
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
    setRefreshKey(k => k + 1);
  };

  const displayScore     = latestScore;
  const displayBreakdown = latestBreakdown;
  const displayInsight   = latestInsight;
  const activeGoals      = goalData ?? twinGoals;

  return (
    <div className="min-h-screen pb-12 relative">

      {/* ── Top Nav ──────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_2px_12px_rgba(37,99,235,0.5)] group-hover:scale-105 transition-transform">
              <Activity size={20} />
            </div>
            <div>
              <p className="font-bold text-white text-base leading-none tracking-tight">Inception <span className="text-blue-400">AI</span></p>
              <p className="text-[10px] text-slate-400 font-semibold tracking-widest mt-0.5 uppercase">Digital Twin</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="hidden md:flex items-center gap-1">
            {TABS.map(t => {
              const isActive = activeTab === t.id;
              return (
                <button 
                  key={t.id} 
                  onClick={() => setActiveTab(t.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300
                    ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                >
                  {t.icon}
                  {t.label}
                  {isActive && (
                    <span className="absolute bottom-[-16px] left-1/2 transform -translate-x-1/2 w-1/2 h-[3px] bg-blue-500 rounded-t-lg animate-pop-in" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Live score pill */}
          {(displayScore !== null || twinScore !== null) && (
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] animate-fade-in group cursor-default">
               <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse-glow" /> 
               <span className="group-hover:scale-110 transition-transform">Score {displayScore ?? twinScore}</span>
            </div>
          )}
        </div>
        
        {/* Mobile Tabs */}
        <div className="md:hidden flex overflow-x-auto gap-2 px-4 pb-2 pb-safe no-scrollbar custom-scrollbar">
            {TABS.map(t => {
              const isActive = activeTab === t.id;
              return (
                <button 
                  key={t.id} 
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0 transition-colors
                    ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}
                >
                  {t.icon} {t.label}
                </button>
              );
            })}
        </div>
      </nav>

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10">

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            
            {/* Show Hero banner immediately if no data is present, otherwise show the layout */}
            {(displayScore === null && twinScore === null) ? (
               <HeroSection 
                 onGetStarted={() => setActiveTab("log")} 
                 onViewDemo={() => setActiveTab("simulate")}
               />
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                  
                  {/* Visual Hierarchy: Health Score card is largest (col-span-2) */}
                  <div className="lg:col-span-2 slide-up">
                    <HealthScoreCard score={displayScore ?? twinScore} breakdown={displayBreakdown} />
                  </div>
                  
                  {/* Right Col */}
                  <div className="space-y-6">
                    <DigitalTwin twin={twin} goals={activeGoals} twinScore={twinScore} latestScore={displayScore} />
                  </div>

                  <div className="lg:col-span-3">
                     <InsightChat insight={displayInsight} />
                  </div>

               </div>
            )}
          </div>
        )}

        {/* Log Habit */}
        {activeTab === "log" && (
          <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
            <HabitForm onSuccess={handleHabitLogged} />
            {displayScore !== null && (
              <HealthScoreCard score={displayScore} breakdown={displayBreakdown} />
            )}
            {displayInsight && (
              <InsightChat insight={displayInsight} />
            )}
          </div>
        )}

        {/* Nutrition Tab */}
        {activeTab === "nutrition" && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FoodLogger userId={USER_ID} onLogged={handleFoodLogged} />
                <GoalTracker onGoalSet={setGoalData} />
              </div>
              <div className="space-y-6">
                <NutritionDashboard userId={USER_ID} goals={activeGoals} refreshKey={foodRefreshKey} />
                <WeightPrediction />
              </div>
            </div>
          </div>
        )}

        {/* Simulate */}
        {activeTab === "simulate" && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <FutureSimulator />
          </div>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && (
          <div className="animate-fade-in space-y-6">
            <WeeklyAnalytics userId={USER_ID} refreshKey={refreshKey} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DigitalTwin twin={twin} goals={activeGoals} twinScore={twinScore} latestScore={displayScore} />
              <InsightChat insight={displayInsight} />
            </div>
          </div>
        )}

        {/* Profile */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <TwinProfile userId={USER_ID} onProfileSaved={() => setRefreshKey(k => k + 1)} />
          </div>
        )}
      </main>
    </div>
  );
}
