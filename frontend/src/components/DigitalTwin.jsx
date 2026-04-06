import React from 'react';
import { User, Activity, Dumbbell, Flame, Cpu } from 'lucide-react';

export default function DigitalTwin({ twin, goals, twinScore, latestScore }) {
  const currentScore = latestScore ?? twinScore;
  const isAlive = currentScore !== null && currentScore !== undefined;

  if (!isAlive) {
    return (
      <div className="premium-matte p-6 lg:p-8 flex flex-col items-center justify-center min-h-[360px] text-center relative overflow-hidden group">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50" />
         <Cpu size={48} className="text-slate-600 mb-4 animate-pulse" />
         <h3 className="text-xl font-bold text-slate-300 mb-2">Twin Offline</h3>
         <p className="text-sm text-slate-500 max-w-xs">Your AI twin is waiting to be born. Start logging data to initiate.</p>
      </div>
    );
  }

  // Determine glow colour
  let glowColor = "rgba(52, 211, 153, 0.4)"; // emerald
  let dropShadowColor = "drop-shadow-[0_0_20px_rgba(52,211,153,0.8)]";
  if (currentScore < 50) { glowColor = "rgba(248, 113, 113, 0.4)"; dropShadowColor = "drop-shadow-[0_0_20px_rgba(248,113,113,0.8)]"; }
  else if (currentScore < 70) { glowColor = "rgba(251, 191, 36, 0.4)"; dropShadowColor = "drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]"; }
  else if (currentScore < 85) { glowColor = "rgba(96, 165, 250, 0.4)"; dropShadowColor = "drop-shadow-[0_0_20px_rgba(96,165,250,0.8)]"; }

  const metrics = [
    { label: "Calories", value: twin?.avg_calories ? `${twin.avg_calories} kcal` : "0 kcal", icon: <Flame size={14} className="text-orange-400" /> },
    { label: "Activity", value: `${twin?.exercise_avg ?? 0}m`, icon: <Activity size={14} className="text-blue-400" /> },
    { label: "Weight", value: `${goals?.current_weight ?? 0}kg`, icon: <Dumbbell size={14} className="text-purple-400" /> }
  ];

  return (
    <div className="premium-matte p-8 min-h-[360px] relative overflow-hidden flex flex-col group hover:border-blue-500/30 transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-900/20 to-slate-900 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10 mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
           <Cpu size={18} className="text-blue-400" /> Visual Twin
        </h3>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        
        {/* Silhouette SVG */}
        <div className="relative flex items-center justify-center animate-float">
          {/* Breathing Aura Behind Silhouette */}
          <div className="absolute w-40 h-64 bg-transparent rounded-full animate-pulse-glow" style={{ boxShadow: `0 0 60px ${glowColor}` }} />
          
          <svg width="120" height="240" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={`relative z-10 ${dropShadowColor} transition-all duration-1000`}>
            <path d="M50 40C58.2843 40 65 33.2843 65 25C65 16.7157 58.2843 10 50 10C41.7157 10 35 16.7157 35 25C35 33.2843 41.7157 40 50 40Z" fill="white" fillOpacity="0.8"/>
            <path d="M72 45C72 45 68 85 70 120C72 155 78 190 78 190H60L55 120H45L40 190H22C22 190 28 155 30 120C32 85 28 45 28 45C22 75 14 110 14 110H5C5 110 15 50 30 40C40 33 60 33 70 40C85 50 95 110 95 110H86C86 110 78 75 72 45Z" fill="white" fillOpacity="0.8"/>
            {/* Energy Lines */}
            <path d="M50 45V180" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M35 100H65" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="4 4" />
          </svg>

        </div>

        {/* Floating Stats Orbits */}
        <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
           <div className="space-y-12">
             {metrics.slice(0, 2).map((m, i) => (
               <div key={m.label} className="glass-panel px-3 py-2 flex items-center gap-2 animate-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
                  {m.icon}
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">{m.label}</p>
                    <p className="text-sm font-bold text-white">{m.value}</p>
                  </div>
               </div>
             ))}
           </div>
           <div>
             {metrics.slice(2).map((m, i) => (
               <div key={m.label} className="glass-panel px-3 py-2 flex items-center gap-2 animate-slide-up" style={{ animationDelay: `450ms` }}>
                  {m.icon}
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">{m.label}</p>
                    <p className="text-sm font-bold text-white">{m.value}</p>
                  </div>
               </div>
             ))}
           </div>
        </div>

      </div>

    </div>
  );
}
