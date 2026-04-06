import React, { useEffect, useState } from 'react';
import { Zap, Play, Activity, Moon, Beef } from 'lucide-react';

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

export default function HeroSection({ onGetStarted, onViewDemo }) {
  const healthScore = useCountUp(78);
  const protein = useCountUp(82);
  const sleep = useCountUp(6);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/50 p-8 sm:p-12 mb-8 shadow-2xl">
      {/* Background depth and grain */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-900 to-black z-0" />
      <div className="grain-overlay z-0" />

      {/* Floating decorative shapes */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse-glow z-0" />
      <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-glow z-0 delay-300" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left Content */}
        <div className="space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider pop-in">
            <Zap size={14} className="text-blue-400" />
            Live Intelligence
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Meet Your <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">AI Digital Twin</span>
          </h1>
          
          <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed">
            Your dynamic, predictive health engine. Log daily habits to bring your digital twin to life, track vital analytics, and simulate future outcomes with precision.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={onGetStarted}
              className="ripple-btn btn-primary px-8 py-3 text-sm font-bold shadow-lg hover:-translate-y-1 transition-transform"
            >
              Get Started <Zap size={16} />
            </button>
            <button 
              onClick={onViewDemo}
              className="ripple-btn glass-panel px-8 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Play size={16} /> View Demo
            </button>
          </div>
        </div>

        {/* Right Preview Card Component */}
        <div className="hidden lg:block animate-float">
          <div className="glass-panel p-6 w-80 ml-auto border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity size={16} className="text-blue-400" /> Twin Status
              </h3>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700 hover:border-blue-500/50 transition-colors">
                <p className="text-xs text-slate-400 font-medium mb-1">Health Score</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black text-white">{healthScore}</p>
                  <p className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">+3 today</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700 hover:border-blue-500/50 transition-colors">
                  <Beef size={14} className="text-indigo-400 mb-2" />
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Protein</p>
                  <p className="text-lg font-bold text-white">{protein}g</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700 hover:border-blue-500/50 transition-colors">
                  <Moon size={14} className="text-indigo-400 mb-2" />
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Sleep</p>
                  <p className="text-lg font-bold text-white">{sleep}.5h</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
