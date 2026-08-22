import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, FileText, Zap } from 'lucide-react';
import { apiPost } from '../../api/client';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  intent?: string;
  suggestions?: string[];
  data?: any;
  traceId?: string;
  timestamp: string;
}

export const CopilotPage = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'copilot',
      text: "Hello! I am your **Dayflow HR Copilot**. I analyze live workforce health, team availability, leave overlap, and operational risk.\n\nHow can I assist you today?",
      suggestions: [
        'What should I worry about today?',
        'Why is Team Beta high risk?',
        'What if I approve Ravi\'s leave?',
        'Which team has the lowest availability?',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (userMsgText: string) => {
    if (!userMsgText.trim() || isLoading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await apiPost('/copilot/chat', { message: userMsgText });
      const copilotMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'copilot',
        text: res.response || 'No response returned.',
        intent: res.intent,
        suggestions: res.suggestions || [],
        data: res.data,
        traceId: res.trace_id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, copilotMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'copilot',
          text: `⚠️ **Error communicating with Copilot backend**: ${e.message || 'Server connection issue.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormattedText = (txt: string) => {
    // Simple bold formatting replacement for markdown
    const parts = txt.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: '1rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bot color="var(--primary)" size={28} /> Dayflow HR Copilot
          </h1>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Grounded AI Assistant connected directly to your workforce database and intelligence engine.
          </p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/traces')}>
          <FileText size={16} /> Decision Traces
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '85%', flexDirection: isUser ? 'row-reverse' : 'row' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: isUser ? 'var(--accent-cyan)' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'white',
                  }}
                >
                  {isUser ? <User size={18} /> : <Bot size={18} />}
                </div>

                <div
                  style={{
                    background: isUser ? 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' : 'rgba(255,255,255,0.05)',
                    border: isUser ? 'none' : '1px solid var(--border-subtle)',
                    padding: '1rem 1.25rem',
                    borderRadius: '1rem',
                    borderTopRightRadius: isUser ? '0.2rem' : '1rem',
                    borderTopLeftRadius: isUser ? '1rem' : '0.2rem',
                    fontSize: '0.925rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text-primary)',
                  }}
                >
                  {renderFormattedText(m.text)}

                  {/* Trace Footer */}
                  {m.traceId && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Intent: <strong style={{ color: 'var(--accent-cyan)' }}>{m.intent}</strong></span>
                      <button
                        onClick={() => setExpandedTraceId(expandedTraceId === m.traceId ? null : m.traceId!)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        <Zap size={12} /> Trace #{m.traceId.slice(0, 8)}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              {m.suggestions && m.suggestions.length > 0 && !isUser && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem', marginLeft: '3rem' }}>
                  {m.suggestions.map((sugg, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(sugg)}
                      style={{
                        background: 'rgba(99,102,241,0.1)',
                        border: '1px solid rgba(99,102,241,0.3)',
                        color: '#a5b4fc',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '2rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.25)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.1)')}
                    >
                      <Sparkles size={12} /> {sugg}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} color="white" />
            </div>
            <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', borderRadius: '1rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem' }}>Copilot is analyzing HR database...</span>
              <div style={{ width: 16, height: 16, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
        <input
          className="input-field"
          style={{ padding: '0.85rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.95rem' }}
          placeholder="Ask Copilot anything about your workforce, teams, risks, or leaves..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn-primary" type="submit" style={{ padding: '0.85rem 1.5rem', borderRadius: '0.75rem' }} disabled={isLoading || !input.trim()}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default CopilotPage;

