import React from 'react';
import { User, Bot } from 'lucide-react';

export default function MessageBubble({ message, isLast }) {
  const isAI = message.role === 'assistant';

  return (
    <div className={`flex w-full mb-6 ${isAI ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isAI ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${
          isAI ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
        }`}>
          {isAI ? <Bot size={18} /> : <User size={18} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isAI 
              ? 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none' 
              : 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 rounded-tr-none'
          }`}>
            {message.message}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight opacity-70">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

      </div>
    </div>
  );
}
