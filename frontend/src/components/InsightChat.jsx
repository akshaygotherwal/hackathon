import React from 'react';
import { Bot, Sparkles, Zap, ArrowRight, BrainCircuit } from 'lucide-react';

export default function InsightChat({ insight }) {

  if (!insight) {
     return (
      <div className="premium-matte p-6 lg:p-8 flex flex-col items-center justify-center min-h-[300px] text-center w-full">
         <BrainCircuit size={40} className="text-slate-600 mb-4 animate-pulse" />
         <h3 className="text-lg font-bold text-slate-300 mb-1">AI Intelligence Standby</h3>
         <p className="text-sm text-slate-500 max-w-sm">Awaiting sufficient data to generate actionable insights based on your health logs.</p>
      </div>
     );
  }

  return (
    <div className="premium-matte flex flex-col shadow-xl overflow-hidden group hover:border-blue-500/50 transition-all duration-300 relative w-full">
      
      {/* Dynamic Aura Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between relative z-10 bg-slate-900/50">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <Bot size={18} className="text-blue-400" /> AI Insights based on your Data
        </h3>
        <Sparkles size={16} className="text-blue-400 animate-pulse" />
      </div>

      {/* Insight Content */}
      <div className="p-8 relative z-10 flex items-start gap-4 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 text-blue-400 flex-shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
           <Zap size={24} className="animate-pulse-glow" />
        </div>
        
        <div className="flex-1 space-y-4">
           <h4 className="text-lg font-bold text-white leading-tight">Here's what your Digital Twin noticed today:</h4>
           <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-xl space-y-3 text-slate-300 leading-relaxed shadow-inner">
             <p className="font-bold text-white border-b border-slate-700 pb-2">{insight.headline}</p>
             <ul className="space-y-2">
               {insight.tips && insight.tips.map((tip, idx) => (
                 <li key={idx} className="text-sm flex items-start gap-2">
                   <span className="text-blue-400 mt-1">•</span> {tip}
                 </li>
               ))}
             </ul>
           </div>
           
           <div className="pt-2">
             <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors group">
               View Recommended Actions <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
           </div>
        </div>
      </div>
      
    </div>
  );
}
