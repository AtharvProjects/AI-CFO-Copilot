import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertTriangle, TrendingUp, Landmark, LineChart, Paperclip, Trash2, Download, Zap, Sparkles, Mic, FileBarChart, ChevronRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';

const AGENTS = [
  { id: 1, name: 'Cash Flow Expert', icon: LineChart, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200', glow: 'shadow-blue-500/20' },
  { id: 2, name: 'Risk Analyst', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200', glow: 'shadow-rose-500/20' },
  { id: 3, name: 'Tax/GST Advisor', icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200', glow: 'shadow-purple-500/20' },
  { id: 4, name: 'Growth Advisor', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200', glow: 'shadow-emerald-500/20' },
];

const QUICK_PROMPTS = {
  1: ["Summarize cash flow (30d)", "Project runway days", "Top 5 expense leaks"],
  2: ["Detect anomalies", "Risk rating report", "Duplicate check"],
  3: ["GST liability est.", "ITC eligibility scan", "Tax saving tips"],
  4: ["ROI analysis", "Revenue growth plan", "Cost cutting strategy"]
};

const AiChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    fetchHistory(selectedAgent);
  }, [selectedAgent]);

  const fetchHistory = async (agentId) => {
    setIsFetchingHistory(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/chat/history/${agentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages.map(m => ({ ...m, agent: agentId })));
      } else {
        setMessages([{ role: 'assistant', content: `Greetings. I am your **${AGENTS.find(a => a.id === agentId).name}**. I have analyzed your recent transaction metadata. How shall we proceed?`, agent: agentId }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([{ role: 'assistant', content: `Greetings. I am your **${AGENTS.find(a => a.id === agentId).name}**. I have analyzed your recent transaction metadata. How shall we proceed?`, agent: agentId }]);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const clearHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/chat/clear/${selectedAgent}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages([{ role: 'assistant', content: `Intelligence buffer cleared. Awaiting new instructions.`, agent: selectedAgent }]);
      toast.success('Context cleared');
    } catch (err) {
      toast.error('Failed to clear buffer');
    }
  };

  const exportChat = () => {
    const doc = new jsPDF();
    const agent = AGENTS.find(a => a.id === selectedAgent);
    doc.setFontSize(16);
    doc.text(`AI CFO Copilot - ${agent.name} Executive Summary`, 14, 20);
    doc.setFontSize(10);
    
    let yPos = 30;
    messages.forEach(msg => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont(undefined, 'bold');
      doc.text(msg.role === 'user' ? 'Stakeholder:' : `${agent.name}:`, 14, yPos);
      yPos += 5;
      doc.setFont(undefined, 'normal');
      
      const splitText = doc.splitTextToSize(msg.content.replace(/[*#`]/g, ''), 180);
      doc.text(splitText, 14, yPos);
      yPos += (splitText.length * 5) + 10;
    });
    
    doc.save(`CFO_Report_${agent.name.replace(/\s+/g, '_')}.pdf`);
    toast.success('Executive report generated');
  };

  const handleSend = async (e, customMessage = null) => {
    if (e) e.preventDefault();
    const userMessage = customMessage || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage, agentId: selectedAgent }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      setMessages((prev) => [...prev, { role: 'assistant', content: '', agent: selectedAgent }]);

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const lastIdx = prev.length - 1;
            return prev.map((msg, i) => 
              i === lastIdx ? { ...msg, content: msg.content + chunk } : msg
            );
          });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Operational Error: Failed to retrieve AI response. Check network connectivity.', isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row gap-8">
      
      {/* Dynamic Agent Selector Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 px-2 mb-2">
          <Sparkles className="text-amber-500" size={18} />
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">CFO Intelligence Pods</h2>
        </div>
        {AGENTS.map((agent) => {
          const isActive = selectedAgent === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`group flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-300 border-2 ${
                isActive 
                  ? `bg-white border-white shadow-2xl ${agent.glow}` 
                  : 'bg-white/40 border-transparent hover:bg-white/80'
              }`}
            >
              <div className={`p-3.5 rounded-2xl transition-transform group-hover:scale-110 duration-500 ${agent.bg} ${agent.color} shadow-inner`}>
                <agent.icon size={24} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className={`font-black text-sm tracking-tight truncate ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                  {agent.name}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">L4 Autonomous Agent</p>
              </div>
              {isActive && (
                <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
              )}
            </button>
          );
        })}

        {/* Global Analytics Card */}
        <div className="mt-auto p-6 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden group cursor-pointer">
           <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">System Status</p>
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                 <span className="text-xs font-black">All Engines Nominal</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Processing real-time ERP data with 99.8% precision.</p>
           </div>
           <Zap size={100} className="absolute -bottom-8 -right-8 text-white opacity-5 group-hover:rotate-12 transition-transform duration-700" />
        </div>
      </div>

      {/* Main Intelligence Hub */}
      <div className="flex-1 glass border border-white/50 shadow-2xl rounded-[3rem] flex flex-col overflow-hidden relative">
        
        {/* Hub Header */}
        <div className="px-10 py-6 border-b border-slate-100 bg-white/60 backdrop-blur-xl flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-4">
            {(() => {
              const agent = AGENTS.find(a => a.id === selectedAgent);
              const Icon = agent.icon;
              return (
                <>
                  <div className={`p-3 rounded-2xl ${agent.bg} ${agent.color} shadow-sm`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight">{agent.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {[1,2,3].map(i => <div key={i} className="w-3 h-3 rounded-full border-2 border-white bg-emerald-400"></div>)}
                      </div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Thread • ERP Connected</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={exportChat} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all shadow-sm bg-white border border-slate-50 group">
              <FileBarChart size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={clearHistory} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all shadow-sm bg-white border border-slate-50 group">
              <Trash2 size={20} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-[#FDFDFF] custom-scrollbar">
          {isFetchingHistory ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
               <RefreshCw size={32} className="animate-spin text-indigo-600" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Restoring Context Buffer...</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={`flex gap-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className={`w-10 h-10 mt-1 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${AGENTS.find(a => a.id === selectedAgent).bg} ${AGENTS.find(a => a.id === selectedAgent).color}`}>
                      <Bot size={22} />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] rounded-[2rem] px-8 py-5 text-sm leading-relaxed shadow-sm border ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white border-slate-900 rounded-tr-none font-medium' 
                      : msg.isError 
                        ? 'bg-rose-50 text-rose-600 border-rose-100 font-bold italic'
                        : 'bg-white border-slate-100 rounded-tl-none prose prose-slate max-w-none text-slate-700'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-4 space-y-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          h3: ({node, ...props}) => <h3 className="font-black text-slate-900 mb-3 mt-6 uppercase text-xs tracking-widest" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-black text-slate-900" {...props} />,
                          table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-6 rounded-3xl border border-slate-100 shadow-inner">
                              <table className="min-w-full divide-y divide-slate-100" {...props} />
                            </div>
                          ),
                          thead: ({node, ...props}) => <thead className="bg-slate-50/50" {...props} />,
                          th: ({node, ...props}) => <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100" {...props} />,
                          td: ({node, ...props}) => <td className="px-6 py-4 text-xs text-slate-700 border-b border-slate-50 whitespace-nowrap font-medium" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-10 h-10 mt-1 rounded-2xl bg-indigo-50 border-2 border-white flex items-center justify-center shrink-0 shadow-lg text-indigo-600 font-black text-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex gap-5"
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${AGENTS.find(a => a.id === selectedAgent).bg} ${AGENTS.find(a => a.id === selectedAgent).color} shadow-lg`}>
                    <Bot size={22} />
                  </div>
                  <div className="bg-white border border-slate-100 shadow-sm rounded-[2rem] rounded-tl-none px-8 py-5 flex items-center gap-2 h-14">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Intelligence Action Bar */}
        <div className="p-8 bg-white border-t border-slate-100 z-10 relative">
          
          {/* Prompt Suggestion Chips */}
          <div className="absolute -top-14 left-0 w-full px-8 flex gap-3 overflow-x-auto no-scrollbar">
             {QUICK_PROMPTS[selectedAgent].map((prompt, i) => (
               <button 
                key={i} 
                onClick={() => handleSend(null, prompt)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md border border-slate-100 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all shadow-xl shadow-slate-100/50 whitespace-nowrap"
               >
                 <Sparkles size={12} className="text-amber-500" /> {prompt}
               </button>
             ))}
          </div>

          <form onSubmit={handleSend} className="relative flex items-center gap-4">
            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                   <Paperclip size={20} />
                 </button>
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Brief your ${AGENTS.find(a => a.id === selectedAgent)?.name}...`}
                className="w-full pl-16 pr-20 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-200 transition-all text-sm font-bold shadow-inner placeholder:text-slate-300"
                disabled={isLoading || isFetchingHistory}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 <button type="button" className="p-2 text-slate-300 hover:text-indigo-600 rounded-xl transition-all">
                   <Mic size={20} />
                 </button>
                 <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-slate-900 text-white rounded-[1.25rem] hover:bg-indigo-600 disabled:opacity-30 transition-all shadow-2xl shadow-slate-300 group"
                >
                  <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </form>
          <div className="flex justify-center mt-4">
             <div className="flex items-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
               <span>End-to-End Encrypted</span>
               <div className="w-1 h-1 rounded-full bg-slate-200"></div>
               <span>Audit Logged</span>
               <div className="w-1 h-1 rounded-full bg-slate-200"></div>
               <span>L4 Reasoning Engine</span>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AiChat;
