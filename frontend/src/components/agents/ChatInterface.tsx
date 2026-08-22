import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import type { AgentMessage } from '../../types';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<AgentMessage[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am your AI Copilot. How can I assist you with HR matters today?', timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: AgentMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages([...messages, newMsg]);
    setInput('');
    
    // Simulate reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I have received your request. Let me analyze the data for you...',
        timestamp: new Date().toISOString(),
        agent_name: 'HR Analyst Agent'
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full glass rounded-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[70%] ${msg.role === 'user' ? 'items-end text-right' : 'items-start text-left'}`}>
              {msg.agent_name && <div className="text-xs text-emerald-400 mb-1 font-medium">{msg.agent_name}</div>}
              <div className={`p-4 rounded-2xl inline-block ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/5'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-12 py-3 text-white focus:outline-none focus:border-indigo-500"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
