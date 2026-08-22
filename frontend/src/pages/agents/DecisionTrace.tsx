import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import { apiFetch } from '../../api/client';

export const DecisionTrace = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: traces, isLoading } = useQuery({
    queryKey: ['traces'],
    queryFn: () => apiFetch('/copilot/traces'),
  });

  const traceList = traces || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <FileText size={32} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Decision Traces</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Transparent execution trace log showing AI reasoning steps, tool queries, and decision outputs.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading agent decision traces...
        </div>
      ) : traceList.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No decision traces recorded yet. Ask HR Copilot a question to generate execution traces.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {traceList.map((t: any) => {
            const isExpanded = expandedId === t.id;
            return (
              <div key={t.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : t.id)}
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {isExpanded ? <ChevronDown size={20} color="var(--primary)" /> : <ChevronRight size={20} color="var(--text-secondary)" />}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{t.question}</div>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        <span>Agent: <strong style={{ color: 'var(--accent-cyan)' }}>{t.agent_name}</strong></span>
                        <span>Started: {t.started_at ? new Date(t.started_at).toLocaleTimeString() : '—'}</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>ID: #{t.trace_id?.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-success">
                    <CheckCircle size={12} /> {t.status}
                  </span>
                </div>

                {isExpanded && (
                  <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.25)' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Result Summary
                      </h4>
                      <div style={{ fontSize: '0.925rem', lineHeight: 1.6 }}>{t.result_summary || 'No summary available.'}</div>
                    </div>

                    <div>
                      <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Reasoning Steps Executed
                      </h4>
                      <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(t.reasoning_steps || []).map((step: string, i: number) => (
                          <li key={i} style={{ lineHeight: 1.5 }}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DecisionTrace;

