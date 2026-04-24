import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertTriangle, TrendingUp, Landmark, LineChart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

const AGENTS = [
  { id: 1, name: 'Cash Flow Expert', icon: LineChart, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, name: 'Risk Analyst', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 3, name: 'Tax/GST Advisor', icon: Landmark, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 4, name: 'Growth Advisor', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
];

const AiChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! I am your AI CFO Copilot. Please select an agent and ask me anything about your finances.', agent: 1 }]);
  const [input, setInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5105/api'}/chat`, {
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
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      
      {/* Agent Selector Sidebar */}
      <div className="w-full md:w-64 flex flex-col gap-3 shrink-0">
        <h2 className="text-lg font-bold text-gray-800 px-2 mb-2">Select Advisor</h2>
        {AGENTS.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setSelectedAgent(agent.id)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${
              selectedAgent === agent.id 
                ? `bg-white shadow-md border-${agent.color.split('-')[1]}-200 ring-2 ring-${agent.color.split('-')[1]}-500/20` 
                : 'bg-white/50 border-gray-100 hover:bg-white'
            }`}
          >
            <div className={`p-2 rounded-lg ${agent.bg} ${agent.color}`}>
              <agent.icon size={20} />
            </div>
            <span className={`font-medium text-sm ${selectedAgent === agent.id ? 'text-gray-900' : 'text-gray-600'}`}>
              {agent.name}
            </span>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-2xl flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          {(() => {
            const agent = AGENTS.find(a => a.id === selectedAgent);
            const Icon = agent.icon;
            return (
              <>
                <div className={`p-2 rounded-lg ${agent.bg} ${agent.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{agent.name}</h3>
                  <p className="text-xs text-gray-500">AI Context aware of your financial data</p>
                </div>
              </>
            );
          })()}
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                  <Bot size={18} className="text-blue-600" />
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white shadow-sm rounded-tr-none' 
                  : msg.isError 
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-gray-100 text-gray-800 rounded-tl-none prose prose-sm max-w-none'
              }`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown 
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      h3: ({node, ...props}) => <h3 className="font-bold mb-1" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <User size={18} className="text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center">
                <Bot size={18} className="text-blue-600" />
              </div>
              <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-tl-none px-5 py-3 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${AGENTS.find(a => a.id === selectedAgent)?.name}...`}
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default AiChat;
