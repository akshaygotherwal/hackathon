import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { Bot, Sparkles, AlertCircle } from 'lucide-react';

export default function ChatWindow({ messages, isLoading, error }) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-8 md:px-8 space-y-2 no-scrollbar"
    >
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Welcome Message if history is empty */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 animate-in fade-in zoom-in duration-700">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-6 shadow-2xl shadow-blue-500/20">
               <Bot size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to your AI Health Coach</h2>
            <p className="text-slate-400 max-w-md text-sm leading-relaxed">
              I'm powered by Google Gemini and have access to your Digital Twin data. 
              Ask me about your habits, health score, or nutrition goals.
            </p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
              {[
                { icon: <Sparkles size={14}/>, text: "Why is my health score low today?" },
                { icon: <Sparkles size={14}/>, text: "Suggest a better protein goal" },
                { icon: <Sparkles size={14}/>, text: "Analyze my sleep trends" },
                { icon: <Sparkles size={14}/>, text: "How can I lose 5kg safely?" }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-left text-xs text-slate-300 flex items-center gap-2">
                  <span className="text-blue-400">{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message List */}
        {messages.map((msg, idx) => (
          <MessageBubble 
            key={msg.id || idx} 
            message={msg} 
            isLast={idx === messages.length - 1} 
          />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start mb-6 animate-in fade-in duration-300">
            <div className="flex max-w-[85%] gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-800/80 text-slate-400 text-sm border border-slate-700/50 rounded-tl-none flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                Coach is thinking...
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center p-4 bg-red-900/10 border border-red-900/20 rounded-xl text-red-400 text-xs mb-6">
            <AlertCircle size={16} className="mb-2" />
            {error}
          </div>
        )}

        <div className="h-4" /> {/* Spacer */}
      </div>
    </div>
  );
}
