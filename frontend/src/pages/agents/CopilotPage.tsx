import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoningSteps?: string[];
  traceId?: string;
};

export default function CopilotPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am your HR Copilot. How can I assist you with workforce decisions today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [suggestions, setSuggestions] = useState([
    "What should I worry about today?",
    "Why is Team Beta high risk?",
    "What if I approve Ravi's leave?",
    "Which team has lowest availability?"
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Mocked response for demo
      // const res = await apiClient.post('/copilot/chat', { query: text });
      
      setTimeout(() => {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Based on current data, **Engineering** is at risk because their capacity will drop below 60% if pending leaves are approved. I recommend reviewing Ravi Kumar\'s leave request.',
          reasoningSteps: [
            'Fetched workforce health data.',
            'Identified Engineering capacity at 65%.',
            'Analyzed pending leaves for Engineering.',
            'Simulated Ravi Kumar\'s leave impact (-10%).'
          ],
          traceId: 'trc_' + Math.random().toString(36).substring(2, 9)
        };
        setMessages(prev => [...prev, aiMsg]);
        setSuggestions(["Simulate Ravi's leave", "Show me Engineering team details", "List all pending actions"]);
        setLoading(false);
      }, 1500);

    } catch (e) {
      setLoading(false);
      // Handle error
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bot color="var(--primary)" size={28} /> HR Copilot
        </h1>
        <button onClick={() => navigate('/traces')} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={16} /> View Decision Traces
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', scrollBehavior: 'smooth' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', gap: '1rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} color="var(--primary)" />}
            </div>
            <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ 
                background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
                padding: '1rem', 
                borderRadius: '1rem', 
                borderTopRightRadius: msg.role === 'user' ? 0 : '1rem',
                borderTopLeftRadius: msg.role === 'assistant' ? 0 : '1rem',
                lineHeight: 1.5,
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none'
              }}>
                <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
              
              {msg.reasoningSteps && (
                <details style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem', width: '100%', cursor: 'pointer' }}>
                  <summary style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', outline: 'none' }}>
                    View Reasoning
                  </summary>
                  <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                    {msg.reasoningSteps.map((step, i) => <li key={i}>{step}</li>)}
                  </ul>
                </details>
              )}

              {msg.traceId && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Trace ID: {msg.traceId}</div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} color="var(--primary)" />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '1rem', borderTopLeftRadius: 0, display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <div className="typing-dot"></div>
              <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
              <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
          {suggestions.map((sug, i) => (
            <button key={i} onClick={() => handleSend(sug)} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '2rem', whiteSpace: 'nowrap', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.background = 'var(--bg-card)'}>
              {sug}
            </button>
          ))}
        </div>
        <form onSubmit={e => { e.preventDefault(); handleSend(input); }} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)}
            placeholder="Ask Copilot anything about your workforce..."
            style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '0.75rem', fontSize: '1rem', outline: 'none' }}
          />
          <button type="submit" disabled={!input.trim() || loading} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '0.75rem', cursor: 'pointer', opacity: input.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={20} />
          </button>
        </form>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .typing-dot { width: 8px; height: 8px; background: var(--text-secondary); border-radius: 50%; animation: blink 1.4s infinite both; }
        @keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
      `}} />
    </div>
  );
}

