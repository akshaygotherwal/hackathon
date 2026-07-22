import React, { useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import { fetchChatHistory, sendMessage } from '../services/api';
import { ArrowLeft, Sparkles, Zap, Bot, MoreVertical, Search, Settings } from 'lucide-react';

export default function ChatPage({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default userId during development
  const userId = 1;

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      const res = await fetchChatHistory(userId);
      setMessages(res.data.history || []);
    } catch (err) {
      console.error("Failed to load chat history:", err);
      // Don't show major error for empty start
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Optimistic update
      const userMsg = { role: 'user', message: text, created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, userMsg]);

      const res = await sendMessage(text, userId);
      
      const aiMsg = { 
        role: 'assistant', 
        message: res.data.response, 
        created_at: new Date().toISOString() 
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("AI was unable to respond. Please check your backend connection and Gemini API key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col h-screen animate-in fade-in duration-500 overflow-hidden">
      
      {/* Premium Header */}
      <header className="px-4 py-3 border-b border-slate-700/50 bg-slate-900/60 backdrop-blur-2xl flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700 transition-all text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl">
                 <Bot size={22} className="group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-4 border-slate-900 rounded-full" />
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-1.5 leading-none">
                AI Health Coach <Sparkles size={12} className="text-blue-400 animate-pulse" />
              </h1>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
                Connected to Digital Twin
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors text-slate-400">
             <Settings size={18} />
           </button>
           <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors text-slate-400">
             <MoreVertical size={18} />
           </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-slate-950/50">
        
        {/* Dynamic Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none overflow-hidden">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px]" />
        </div>

        <ChatWindow 
          messages={messages} 
          isLoading={isLoading} 
          error={error} 
        />
        
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isLoading} 
        />
      </main>

    </div>
  );
}
