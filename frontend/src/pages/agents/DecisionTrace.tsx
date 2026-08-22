import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Clock, ChevronDown, ChevronRight, CheckCircle, Bot } from 'lucide-react';


export default function DecisionTrace() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: traces, isLoading } = useQuery({
    queryKey: ['traces'],
    queryFn: async () => {
      // Mock data
      return [
        {
          id: 'trc_9f8a7b',
          question: 'What if I approve Ravi\'s leave?',
          agent: 'HR Copilot',
          status: 'success',
          timestamp: '2026-08-22T10:30:00Z',
          summary: 'Recommended to approve and reassign tasks.',
          reasoningSteps: [
            'Parsed user intent: simulate leave approval for Ravi Kumar.',
            'Fetched Ravi Kumar details: Engineering, Senior Dev.',
            'Retrieved Engineering team capacity: currently 75%.',
            'Simulated capacity drop to 55%.',
            'Evaluated options: Approve (High Risk), Deny (Low Risk), Reassign (Medium Risk).',
            'Selected best option: Approve with task reassignment to maintain SLA.'
          ]
        },
        {
          id: 'trc_3c2d1e',
          question: 'Why is Team Beta high risk?',
          agent: 'Risk Engine',
          status: 'success',
          timestamp: '2026-08-21T14:15:00Z',
          summary: 'Identified overlapping leaves and low attendance.',
          reasoningSteps: [
            'Analyzed Team Beta attendance data for past 7 days.',
            'Found 3 members with unplanned absences.',
            'Checked upcoming leave requests: 2 approved overlapping.',
            'Calculated projected availability: 45% (Critical).',
            'Generated risk report and updated dashboard.'
          ]
        }
      ];
    }
  });

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading Traces...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <FileText size={32} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Decision Traces</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>Audit log of AI reasoning and actions</p>
        </div>
      </div>

      {!traces || traces.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '1rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          No decision traces found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {traces.map((trace: any) => (
            <div key={trace.id} style={{ background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div 
                onClick={() => setExpandedId(expandedId === trace.id ? null : trace.id)}
                style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {expandedId === trace.id ? <ChevronDown size={20} color="var(--text-secondary)" /> : <ChevronRight size={20} color="var(--text-secondary)" />}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.25rem' }}>{trace.question}</div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Bot size={14}/> {trace.agent}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14}/> {new Date(trace.timestamp).toLocaleString()}</span>
                      <span>ID: {trace.id}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>
                  <CheckCircle size={14} /> {trace.status}
                </div>
              </div>

              {expandedId === trace.id && (
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Result Summary</h4>
                    <p style={{ margin: 0 }}>{trace.summary}</p>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>Reasoning Steps</h4>
                    <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {trace.reasoningSteps.map((step: string, i: number) => (
                        <li key={i} style={{ lineHeight: 1.5 }}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



