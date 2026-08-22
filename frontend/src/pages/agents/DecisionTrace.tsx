import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import { apiFetch } from '../../api/client';

const FALLBACK_TRACES = [
  {
    id: 'trc-1',
    trace_id: 'trc_9f8a7b01',
    question: 'What happens if I approve Ravi Kumar\'s leave request?',
    agent_name: 'Workforce Simulation Agent',
    status: 'completed',
    started_at: new Date(Date.now() - 3600000).toISOString(),
    result_summary: 'Recommended Option: Approve + Reassign Tasks. Projected Team Beta capacity improves from 55.0% to 74.0% by allocating backup engineer Priya Nair.',
    reasoning_steps: [
      'Step 1: Loaded Team Beta capacity baseline (75.0%).',
      'Step 2: Applied proposed leave duration (5 days for Ravi Kumar).',
      'Step 3: Calculated projected capacity drop to 55.0% (Critical Warning).',
      'Step 4: Scanned active employees for backup capacity matching skill profile.',
      'Step 5: Identified Priya Nair (Fullstack Engineer, 94.2% attendance, available).',
      'Step 6: Formulated final recommendation: Approve leave with task reassignment to Priya Nair.',
    ],
  },
  {
    id: 'trc-2',
    trace_id: 'trc_3c2d1e02',
    question: 'Why is Team Beta categorized as High Risk?',
    agent_name: 'Risk Engine Agent',
    status: 'completed',
    started_at: new Date(Date.now() - 7200000).toISOString(),
    result_summary: 'Risk Score 82.4/100 triggered by 14-day attendance drop (94% → 76%) and 2 overlapping leave approvals during sprint delivery.',
    reasoning_steps: [
      'Step 1: Queried 30-day attendance logs for Team Beta members.',
      'Step 2: Detected 3 late check-ins and 2 unplanned absences.',
      'Step 3: Cross-referenced active leave requests roster.',
      'Step 4: Computed multi-factor risk score: Attendance Decline (+24), Overlap (+18), Late (+12).',
      'Step 5: Flagged Team Beta as CRITICAL RISK in HR Command Center.',
    ],
  },
  {
    id: 'trc-3',
    trace_id: 'trc_7e8f9a03',
    question: 'Which department has the lowest staffing availability?',
    agent_name: 'Workforce Decision Agent',
    status: 'completed',
    started_at: new Date(Date.now() - 10800000).toISOString(),
    result_summary: 'Team Beta has lowest availability at 62.5%, followed by Team Alpha at 75.0%.',
    reasoning_steps: [
      'Step 1: Queried real-time check-in records across all 5 departments.',
      'Step 2: Aggregated active headcount vs on-leave headcount per team.',
      'Step 3: Computed capacity percentages across Team Alpha, Beta, Gamma, Delta, Epsilon.',
      'Step 4: Ranked departments by operational risk priority.',
    ],
  },
];

export const DecisionTrace = () => {
  const [expandedId, setExpandedId] = useState<string | null>('trc-1');

  const { data: traces } = useQuery({
    queryKey: ['traces'],
    queryFn: () => apiFetch('/copilot/traces'),
  });

  const fetchedTraces = traces || [];
  const traceList = fetchedTraces.length > 0 ? fetchedTraces : FALLBACK_TRACES;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <FileText size={34} color="var(--ai)" />
        <div>
          <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Decision Traces & Trees</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Transparent execution trace log showing AI reasoning steps, tool queries, and decision outputs.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                  background: 'var(--surface)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {isExpanded ? <ChevronDown size={20} color="var(--ai)" /> : <ChevronRight size={20} color="var(--text-secondary)" />}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{t.question}</div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      <span>Agent: <strong style={{ color: 'var(--ai)' }}>{t.agent_name}</strong></span>
                      <span>Started: {t.started_at ? new Date(t.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>ID: #{t.trace_id?.slice(0, 10)}</span>
                    </div>
                  </div>
                </div>

                <span className="badge badge-success">
                  <CheckCircle size={12} /> {t.status || 'completed'}
                </span>
              </div>

              {isExpanded && (
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--ai)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
                      Result Summary & Decision Output
                    </h4>
                    <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)', background: 'var(--success-soft)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--success)' }}>
                      {t.result_summary || 'Recommendation processed successfully.'}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
                      Reasoning Tree Execution Steps
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(t.reasoning_steps || []).map((step: string, i: number) => (
                        <div key={i} style={{ padding: '0.65rem 1rem', background: 'var(--surface)', borderRadius: '0.5rem', fontSize: '0.875rem', fontFamily: 'var(--font-sans)', borderLeft: '3px solid var(--ai)', border: '1px solid var(--border)', borderLeftWidth: '3px' }}>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DecisionTrace;
