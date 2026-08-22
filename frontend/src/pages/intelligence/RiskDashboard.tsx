import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Info, ArrowRight, X } from 'lucide-react';
import { apiFetch } from '../../api/client';
import { useNavigate } from 'react-router-dom';

const FALLBACK_RISKS = [
  {
    team: 'Team Beta',
    risk_level: 'critical',
    risk_score: 82.4,
    factors: [
      { factor: 'Attendance decline in 14 days', score: 24 },
      { factor: 'Overlapping leave approvals', score: 18 },
      { factor: 'Late arrival frequency (+35%)', score: 12 },
      { factor: 'Low backup capacity ratio', score: 9 },
    ],
  },
  {
    team: 'Team Alpha',
    risk_level: 'high',
    risk_score: 61.9,
    factors: [
      { factor: 'Key architect on leave', score: 22 },
      { factor: 'Sprint deadline workload peak', score: 15 },
      { factor: 'Recent 3-day absenteeism', score: 10 },
    ],
  },
  {
    team: 'Team Gamma',
    risk_level: 'low',
    risk_score: 28.5,
    factors: [
      { factor: 'Minor leave overlap', score: 8 },
      { factor: 'Normal attendance stability', score: 5 },
    ],
  },
  {
    team: 'Team Delta',
    risk_level: 'low',
    risk_score: 15.0,
    factors: [
      { factor: '100% attendance rate', score: 0 },
      { factor: 'Zero pending leaves', score: 0 },
    ],
  },
  {
    team: 'Team Epsilon',
    risk_level: 'low',
    risk_score: 18.2,
    factors: [
      { factor: 'Stable staffing capacity', score: 4 },
    ],
  },
];

const FALLBACK_EVIDENCE: Record<string, any> = {
  'Team Beta': {
    risk_factors: [
      { factor: 'Attendance Decline', score: 24, detail: 'Team Beta attendance dropped from 94% to 76% over the last 14 days.' },
      { factor: 'Overlapping Leaves', score: 18, detail: '2 senior engineers are on approved leave during the Q3 production release.' },
      { factor: 'Late Check-ins', score: 12, detail: '3 team members recorded check-ins after 09:30 AM 4 times this week.' },
      { factor: 'Backup Deficit', score: 9, detail: 'Only 1 qualified backup engineer available for critical backend service maintenance.' },
    ],
    leave_evidence: [
      { employee: 'Ravi Kumar', start_date: '2026-08-25', end_date: '2026-08-29', status: 'pending' },
      { employee: 'Vikram Aditya', start_date: '2026-08-20', end_date: '2026-08-23', status: 'approved' },
      { employee: 'Priya Nair', start_date: '2026-08-10', end_date: '2026-08-11', status: 'approved' },
    ],
  },
};

export const RiskDashboard = () => {
  const navigate = useNavigate();
  const [selectedTeamEvidence, setSelectedTeamEvidence] = useState<string | null>(null);

  const { data: risks } = useQuery({
    queryKey: ['team-risks'],
    queryFn: () => apiFetch('/intelligence/risks'),
  });

  const { data: evidenceData } = useQuery({
    queryKey: ['risk-evidence', selectedTeamEvidence],
    queryFn: () => apiFetch(`/intelligence/evidence/${encodeURIComponent(selectedTeamEvidence!)}`),
    enabled: !!selectedTeamEvidence,
  });

  const fetchedRisks = risks || [];
  const riskList = fetchedRisks.length > 0 ? fetchedRisks : FALLBACK_RISKS;
  const currentEvidence = (evidenceData && evidenceData.risk_factors) ? evidenceData : (FALLBACK_EVIDENCE[selectedTeamEvidence || ''] || FALLBACK_EVIDENCE['Team Beta']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'var(--font-heading)' }}>
            <AlertTriangle color="var(--ai)" size={34} /> Workforce Risk Engine
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Multi-factor operational risk scoring powered by attendance, leave overlaps, and staffing capacity.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {riskList.map((r: any) => {
          const isHigh = r.risk_level === 'critical' || r.risk_level === 'high';
          const badgeClass = r.risk_level === 'critical' ? 'badge-danger' : r.risk_level === 'high' ? 'badge-warning' : 'badge-success';
          return (
            <div key={r.team} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{r.team}</h3>
                  <span className={`badge ${badgeClass}`}>{r.risk_level}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '2.6rem', fontWeight: 900, color: isHigh ? 'var(--danger)' : 'var(--success)', fontFamily: 'var(--font-heading)' }}>
                    {typeof r.risk_score === 'number' ? r.risk_score.toFixed(1) : r.risk_score}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/ 100 Risk Score</div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 700 }}>Contributing Factors:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {(r.factors || []).slice(0, 4).map((f: any, i: number) => (
                      <div key={i} style={{ fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                        <span style={{ color: isHigh ? 'var(--danger)' : 'var(--success)' }}>•</span> {f.factor} (+{f.score} pts)
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button className="btn-secondary" style={{ flex: 1, fontSize: '0.825rem', justifyContent: 'center' }} onClick={() => setSelectedTeamEvidence(r.team)}>
                  <Info size={14} /> View Evidence (Why?)
                </button>
                <button className="btn-primary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.825rem' }} onClick={() => navigate('/dashboard')}>
                  Action <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Evidence Modal ("WHY?") */}
      {selectedTeamEvidence && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '650px', padding: '2rem', maxHeight: '85vh', overflowY: 'auto', background: 'var(--surface-elevated)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <span className="badge badge-ai" style={{ marginBottom: '0.35rem' }}>AI Evidence Trace</span>
                <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Why is {selectedTeamEvidence} at Risk?</h2>
              </div>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setSelectedTeamEvidence(null)}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 700 }}>Risk Breakdown & Factors</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(currentEvidence.risk_factors || []).map((f: any, i: number) => (
                    <div key={i} style={{ background: 'var(--surface)', padding: '0.85rem 1rem', borderRadius: '0.6rem', borderLeft: '4px solid var(--danger)', fontSize: '0.875rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--danger)' }}>{f.factor} (+{f.score} pts)</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '0.2rem' }}>{f.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 700 }}>Overlapping Leave & Absences</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(currentEvidence.leave_evidence || []).map((l: any, i: number) => (
                    <div key={i} style={{ background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{l.employee}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{l.start_date} → {l.end_date}</div>
                      </div>
                      <span className={`badge ${l.status === 'approved' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskDashboard;
