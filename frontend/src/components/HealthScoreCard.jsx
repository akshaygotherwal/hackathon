import React, { useEffect, useState } from 'react';
import { Activity, Flame, HeartPulse, RefreshCcw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function useLiveScore(targetScore) {
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (targetScore === null || targetScore === undefined) return;
    
    let current = 0;
    const interval = setInterval(() => {
      current += Math.ceil((targetScore - current) / 10);
      if (current >= targetScore) {
        setScore(targetScore);
        clearInterval(interval);
      } else {
        setScore(current);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [targetScore]);

  return score;
}

export default function HealthScoreCard({ score, breakdown }) {
  const animatedScore = useLiveScore(score);
  
  if (score === null || score === undefined) {
    return (
      <div className="premium-matte p-6 lg:p-8 animate-pulse shadow-xl relative overflow-hidden min-h-[300px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
        <div className="text-center">
          <Activity size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 font-medium tracking-wide">Awaiting Data Sync</p>
        </div>
      </div>
    );
  }

  // Determine score color
  let color = "#34d399"; // emerald
  let gradientClass = "from-emerald-500 to-emerald-300";
  let statusText = "Excellent";
  
  if (animatedScore < 50) { 
    color = "#f87171"; gradientClass="from-red-500 to-red-400"; statusText="Poor"; 
  } else if (animatedScore < 70) { 
    color = "#fbbf24"; gradientClass="from-yellow-400 to-amber-300"; statusText="Moderate"; 
  } else if (animatedScore < 85) { 
    color = "#60a5fa"; gradientClass="from-blue-500 to-blue-400"; statusText="Good"; 
  }

  const chartData = [
    { name: 'Score', value: animatedScore },
    { name: 'Remaining', value: 100 - animatedScore },
  ];

  return (
    <div className="premium-matte p-8 shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition-all duration-500 min-h-[320px] flex flex-col justify-center">
      {/* Top right decoration */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-700 z-0" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <HeartPulse size={18} className={`text-[${color}]`} style={{ color }} /> Overall Health
        </h3>
        <span className={`text-xs font-bold px-3 py-1 rounded-full bg-opacity-10`} style={{ color, backgroundColor: `${color}1A` }}>
          {statusText}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        
        {/* Ring Chart */}
        <div className="relative w-48 h-48 drop-shadow-2xl flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={70}
                outerRadius={90}
                startAngle={225}
                endAngle={-45}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={color} />
                <Cell fill="rgba(255,255,255,0.05)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-white mix-blend-lighten tracking-tighter" style={{ textShadow: `0 0 20px ${color}80` }}>
              {animatedScore}
            </span>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="flex-1 w-full space-y-4">
           {breakdown && Object.entries(breakdown).map(([key, val], idx) => (
             <div key={key} className="flex flex-col gap-1 delay-100 animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
               <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                 <span className="uppercase tracking-wider">{key}</span>
                 <span className="text-white font-bold">{val} / 100</span>
               </div>
               <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full rounded-full bg-blue-500" style={{ width: `${val}%`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
               </div>
             </div>
           ))}
           {!breakdown && (
             <p className="text-slate-500 text-sm italic">Keep logging habits to unlock detailed breakdown metrics.</p>
           )}
        </div>
      </div>
    </div>
  );
}
