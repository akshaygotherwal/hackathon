import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

export default function ChatInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="p-4 border-t border-slate-700/50 bg-slate-900/40 backdrop-blur-xl">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
        
        {/* Subtle Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
        
        <div className="relative flex items-center bg-slate-900 border border-slate-700/50 rounded-2xl p-2 pl-4 shadow-sm focus-within:border-blue-500/50 transition-all duration-300">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={disabled ? "AI is thinking..." : "Ask your AI Health Coach anything..."}
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-slate-200 placeholder-slate-500 py-2"
            disabled={disabled}
          />
          
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
              !message.trim() || disabled 
                ? 'bg-slate-800 text-slate-600 grayscale cursor-not-allowed' 
                : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-900/40 hover:scale-105 active:scale-95'
            }`}
          >
            <Send size={18} />
          </button>
        </div>

        {/* Suggestion Tokens (Optional UI flare) */}
        {!message && !disabled && (
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            {["Why is my health score low?", "How can I improve sleep?", "Protein requirement?"].map((suggestion, idx) => (
               <button 
                  key={idx}
                  type="button" 
                  onClick={() => setMessage(suggestion)}
                  className="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-full text-[10px] text-slate-400 hover:text-white hover:border-slate-500 transition-all whitespace-nowrap uppercase tracking-wider"
               >
                 {suggestion}
               </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
