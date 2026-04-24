import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertTriangle, TrendingUp, Landmark, LineChart, Paperclip, Trash2, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

const AGENTS = [
  { id: 1, name: 'Cash Flow Expert', icon: LineChart, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
  { id: 2, name: 'Risk Analyst', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
  { id: 3, name: 'Tax/GST Advisor', icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
  { id: 4, name: 'Growth Advisor', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
];

const QUICK_PROMPTS = {
  1: ["Summarize my cash flow for the last 30 days.", "When will I run out of cash?", "What are my biggest expenses this month?"],
  2: ["Are there any duplicate transactions?", "Flag any unusual spending patterns.", "What is my current risk rating?"],
  3: ["Calculate my estimated GST liability.", "Which expenses are eligible for ITC?", "How can I optimize my tax?"],
  4: ["Compare this month's revenue to last month.", "Where should I cut costs to improve ROI?", "Generate a growth strategy based on my data."]
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
        setMessages([{ role: 'assistant', content: `Hello! I am your AI ${AGENTS.find(a => a.id === agentId).name}. How can I help you today?`, agent: agentId }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([{ role: 'assistant', content: `Hello! I am your AI ${AGENTS.find(a => a.id === agentId).name}. How can I help you today?`, agent: agentId }]);
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
      setMessages([{ role: 'assistant', content: `Chat history cleared. How can I help you?`, agent: selectedAgent }]);
      toast.success('Chat history cleared');
    } catch (err) {
      toast.error('Failed to clear history');
    }
  };

  const exportChat = () => {
    const doc = new jsPDF();
    const agent = AGENTS.find(a => a.id === selectedAgent);
    doc.setFontSize(16);
    doc.text(`AI CFO Copilot - ${agent.name} Report`, 14, 20);
    doc.setFontSize(10);
    
    let yPos = 30;
    messages.forEach(msg => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont(undefined, 'bold');
      doc.text(msg.role === 'user' ? 'You:' : `${agent.name}:`, 14, yPos);
      yPos += 5;
      doc.setFont(undefined, 'normal');
      
      const splitText = doc.splitTextToSize(msg.content.replace(/[*#`]/g, ''), 180);
      doc.text(splitText, 14, yPos);
      yPos += (splitText.length * 5) + 10;
    });
    
    doc.save(`${agent.name.replace(/\s+/g, '_')}_Report.pdf`);
    toast.success('Chat exported to PDF');
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
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request.', isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      
      {/* Agent Selector Sidebar */}
      <div className="w-full md:w-72 flex flex-col gap-3 shrink-0">
        <h2 className="text-lg font-bold text-gray-800 px-2 mb-2">Select Advisor</h2>
        {AGENTS.map((agent) => {
          const isActive = selectedAgent === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all border ${
                isActive 
                  ? `bg-white shadow-md shadow-${agent.color.split('-')[1]}-500/10 ${agent.border} ring-4 ring-${agent.color.split('-')[1]}-500/10` 
                  : 'bg-white/40 border-transparent hover:bg-white/80'
              }`}
            >
              <div className={`p-3 rounded-xl ${agent.bg} ${agent.color}`}>
                <agent.icon size={22} />
              </div>
              <span className={`font-semibold text-sm ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                {agent.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl flex flex-col overflow-hidden relative">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
            {(() => {
              const agent = AGENTS.find(a => a.id === selectedAgent);
              const Icon = agent.icon;
              return (
                <>
                  <div className={`p-2 rounded-lg ${agent.bg} ${agent.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{agent.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <p className="text-xs text-gray-500 font-medium">Online • Context Aware</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={exportChat} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger">
              <Download size={18} />
            </button>
            <button onClick={clearHistory} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
          {isFetchingHistory ? (
            <div className="flex items-center justify-center h-full text-gray-400">Loading history...</div>
          ) : (
            <>
              {messages.length === 1 && (
                <div className="mb-8 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
                  {QUICK_PROMPTS[selectedAgent].map((prompt, i) => (
                    <button 
                      key={i}
                      onClick={() => handleSend(null, prompt)}
                      className="text-left p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-blue-200 hover:shadow-md transition-all text-sm text-gray-600"
                    >
                      <span className="text-blue-500 mr-2">✦</span>
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className={`w-8 h-8 mt-1 rounded-full flex items-center justify-center shrink-0 shadow-sm ${AGENTS.find(a => a.id === selectedAgent).bg} ${AGENTS.find(a => a.id === selectedAgent).color}`}>
                      <Bot size={18} />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] rounded-2xl px-6 py-4 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md rounded-tr-none' 
                      : msg.isError 
                        ? 'bg-red-50 text-red-600 border border-red-100'
                        : 'bg-white border border-gray-100 shadow-sm rounded-tl-none prose prose-sm max-w-none text-gray-700'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-3 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-3 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          h3: ({node, ...props}) => <h3 className="font-bold text-gray-900 mb-2 mt-4" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                          table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-4 rounded-xl border border-gray-200">
                              <table className="min-w-full divide-y divide-gray-200" {...props} />
                            </div>
                          ),
                          thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
                          th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b" {...props} />,
                          td: ({node, ...props}) => <td className="px-4 py-3 text-sm text-gray-700 border-b whitespace-nowrap" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 mt-1 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                      <User size={16} className="text-gray-500" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${AGENTS.find(a => a.id === selectedAgent).bg} ${AGENTS.find(a => a.id === selectedAgent).color}`}>
                    <Bot size={18} />
                  </div>
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-none px-6 py-4 flex items-center gap-1.5 h-12">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 z-10">
          <form onSubmit={handleSend} className="relative flex items-center">
            <button type="button" className="absolute left-3 p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 rounded-lg">
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${AGENTS.find(a => a.id === selectedAgent)?.name}...`}
              className="w-full pl-14 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-sm shadow-inner"
              disabled={isLoading || isFetchingHistory}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md shadow-blue-500/20"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400 font-medium tracking-wide">AI CAN MAKE MISTAKES. VERIFY CRITICAL FINANCIAL DATA.</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AiChat;
